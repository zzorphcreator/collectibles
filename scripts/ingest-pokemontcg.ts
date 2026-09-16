/**
 * Ingest REAL card identity, images, and TCGPlayer market prices from
 * Pokémon TCG API v2 (https://api.pokemontcg.io/v2).
 *
 * Latest price_snapshots row per card = live API market (source: tcgplayer).
 * Prior daily points are ILLUSTRATIVE (gentle walk toward today's market) so
 * sparklines / 7d / 30d UI keep working until a daily ingest accumulates history.
 *
 * Optional: POKEMONTCG_API_KEY (X-Api-Key). Works without a key at lower rate limits.
 */
import fs from "fs";
import {
  getClient,
  getDatabaseUrl,
  getDbPath,
  isRemoteDatabase,
  setupSchema,
} from "../src/lib/db";
import { slugify } from "../src/lib/format";

const API_BASE = "https://api.pokemontcg.io/v2";

/** Curated modern card IDs (from seed image URL paths). */
const CARD_IDS = [
  "sv8-238",
  "sv8-239",
  "sv8-168",
  "sv7-128",
  "sv7-172",
  "sv7-157",
  "sv6-214",
  "sv6-215",
  "sv6-212",
  "sv4pt5-232",
  "sv4pt5-234",
  "sv2-269",
  "sv1-244",
  "sv1-247",
  "sv4-246",
  "sv4-251",
] as const;

type TcgPriceBlock = {
  low?: number | null;
  mid?: number | null;
  high?: number | null;
  market?: number | null;
  directLow?: number | null;
};

type ApiCard = {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  set: { id: string; name: string };
  images?: { small?: string; large?: string };
  tcgplayer?: {
    url?: string;
    updatedAt?: string;
    prices?: Record<string, TcgPriceBlock>;
  };
};

type PickedPrice = {
  variantKey: string;
  variantLabel: string;
  market: number;
  sourceUrl: string;
};

function variantLabelFromKey(key: string): string {
  // holofoil → Holofoil, reverseHolofoil → Reverse Holofoil, normal → Normal
  const spaced = key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
  return spaced.trim() || "Normal";
}

function pickMarketPrice(card: ApiCard): PickedPrice | null {
  const prices = card.tcgplayer?.prices;
  if (!prices || typeof prices !== "object") return null;

  const sourceUrl =
    card.tcgplayer?.url ||
    `https://prices.pokemontcg.io/tcgplayer/${card.id}`;

  for (const [key, block] of Object.entries(prices)) {
    if (!block || typeof block !== "object") continue;
    const market =
      typeof block.market === "number" && Number.isFinite(block.market)
        ? block.market
        : typeof block.mid === "number" && Number.isFinite(block.mid)
          ? block.mid
          : typeof block.low === "number" && Number.isFinite(block.low)
            ? block.low
            : null;
    if (market !== null && market > 0) {
      return {
        variantKey: key,
        variantLabel: variantLabelFromKey(key),
        market: Math.round(market * 100) / 100,
        sourceUrl,
      };
    }
  }
  return null;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build ~days prior daily points that gently walk toward `todayMarket`.
 * dayOffset 0 is NOT included — caller inserts the live latest separately.
 */
function buildIllustrativeHistory(
  todayMarket: number,
  days: number,
  rng: () => number
): Array<{ dayOffset: number; price: number }> {
  const out: Array<{ dayOffset: number; price: number }> = [];
  // Start ~8–18% below (or slightly above if rng) today's live market
  let price = todayMarket * (0.82 + rng() * 0.12);
  const steps = days; // dayOffset days … 1
  for (let i = 0; i < steps; i++) {
    const dayOffset = days - i;
    const progress = (i + 1) / (steps + 1);
    const target = todayMarket;
    // Pull toward today's market with mild noise
    const shock = (rng() - 0.5) * 0.035;
    price = price + (target - price) * (0.08 + progress * 0.12) + target * shock;
    price = Math.max(0.25, price);
    out.push({
      dayOffset,
      price: Math.round(price * 100) / 100,
    });
  }
  return out;
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function fetchCard(id: string): Promise<ApiCard | null> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const key = process.env.POKEMONTCG_API_KEY?.trim();
  if (key) headers["X-Api-Key"] = key;

  const urls = [
    `${API_BASE}/cards/${encodeURIComponent(id)}?select=id,name,number,rarity,set,images,tcgplayer`,
    `${API_BASE}/cards/${encodeURIComponent(id)}`,
  ];

  let lastStatus = 0;
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) await sleep(400 * attempt * attempt);
    for (const url of urls) {
      try {
        const res = await fetch(url, { headers });
        lastStatus = res.status;
        if (res.status === 404) {
          console.warn(`  skip ${id}: HTTP 404`);
          return null;
        }
        if (!res.ok) continue;
        const body = (await res.json()) as { data?: ApiCard };
        if (body.data) return body.data;
      } catch (err) {
        lastStatus = -1;
        console.warn(`  fetch error ${id} attempt ${attempt + 1}:`, err);
      }
    }
  }
  console.warn(`  skip ${id}: HTTP ${lastStatus} after retries`);
  return null;
}

async function resetDatabase() {
  const client = getClient();
  await client.executeMultiple(`
    DROP TABLE IF EXISTS curated_entries;
    DROP TABLE IF EXISTS price_snapshots;
    DROP TABLE IF EXISTS card_conditions;
    DROP TABLE IF EXISTS cards;
  `);
  await setupSchema(client);

  const dbPath = getDbPath();
  if (dbPath) {
    for (const f of [`${dbPath}-wal`, `${dbPath}-shm`]) {
      if (fs.existsSync(f)) {
        try {
          fs.unlinkSync(f);
        } catch {
          /* ignore */
        }
      }
    }
  }
}

type Ingested = {
  cardId: number;
  conditionId: number;
  name: string;
  market: number;
  pct7d: number;
  sourceUrl: string;
};

async function main() {
  const url = getDatabaseUrl();
  console.log("Ingesting Pokémon TCG API → database:", url);
  if (isRemoteDatabase()) {
    console.log("Mode: remote Turso (TURSO_DATABASE_URL set)");
  } else {
    console.log("Mode: local file SQLite via @libsql/client");
  }
  if (process.env.POKEMONTCG_API_KEY?.trim()) {
    console.log("API key: POKEMONTCG_API_KEY set (X-Api-Key)");
  } else {
    console.log("API key: none (public rate limits)");
  }

  await resetDatabase();
  const client = getClient();
  const now = new Date();
  const skipped: string[] = [];
  const ingested: Ingested[] = [];
  let snapCount = 0;

  for (const [idx, apiId] of CARD_IDS.entries()) {
    console.log(`Fetching ${apiId}…`);
    // Small delay to be polite to the free tier
    if (idx > 0) await new Promise((r) => setTimeout(r, 350));

    const card = await fetchCard(apiId);
    if (!card) {
      skipped.push(`${apiId} (missing)`);
      continue;
    }

    const picked = pickMarketPrice(card);
    if (!picked) {
      console.warn(`  skip ${apiId} (${card.name}): no usable TCGPlayer market/mid/low`);
      skipped.push(`${apiId} (no price)`);
      continue;
    }

    const imageUrl = card.images?.large || card.images?.small || null;
    const rarity = card.rarity || "Unknown";
    const setCode = card.set.id;
    const setName = card.set.name;

    const cardResult = await client.execute({
      sql: `
        INSERT INTO cards (name, set_name, set_code, number, variant, language, rarity, image_url)
        VALUES (?, ?, ?, ?, ?, 'EN', ?, ?)
      `,
      args: [
        card.name,
        setName,
        setCode,
        card.number,
        picked.variantLabel,
        rarity,
        imageUrl,
      ],
    });
    const cardRowId = Number(cardResult.lastInsertRowid);

    const slug = slugify([setCode, card.number, card.name, "raw_nm"]);
    const condResult = await client.execute({
      sql: `
        INSERT INTO card_conditions (card_id, condition, slug)
        VALUES (?, 'raw_nm', ?)
      `,
      args: [cardRowId, slug],
    });
    const conditionId = Number(condResult.lastInsertRowid);

    const historyDays = 14 + (idx % 17); // 14–30
    const rng = mulberry32(cardRowId * 997 + conditionId * 31 + 7);
    const history = buildIllustrativeHistory(picked.market, historyDays, rng);

    const snapBatch: Array<{ sql: string; args: (string | number)[] }> = [];
    for (const point of history) {
      const pulled = new Date(now);
      pulled.setUTCDate(pulled.getUTCDate() - point.dayOffset);
      pulled.setUTCHours(15, Math.floor(rng() * 50), 0, 0);
      snapBatch.push({
        sql: `
          INSERT INTO price_snapshots (condition_id, price_usd, source, source_url, pulled_at)
          VALUES (?, ?, 'tcgplayer', ?, ?)
        `,
        args: [
          conditionId,
          point.price,
          picked.sourceUrl,
          pulled.toISOString(),
        ],
      });
      snapCount++;
    }

    // LIVE latest snapshot (dayOffset 0)
    snapBatch.push({
      sql: `
        INSERT INTO price_snapshots (condition_id, price_usd, source, source_url, pulled_at)
        VALUES (?, ?, 'tcgplayer', ?, ?)
      `,
      args: [conditionId, picked.market, picked.sourceUrl, now.toISOString()],
    });
    snapCount++;

    await client.batch(snapBatch, "write");

    // 7d % from illustrative series vs live latest
    const sevenAgo =
      history.find((p) => p.dayOffset === 7)?.price ??
      history.find((p) => p.dayOffset >= 7)?.price ??
      history[0]?.price ??
      picked.market;
    const pct7d =
      sevenAgo > 0 ? ((picked.market - sevenAgo) / sevenAgo) * 100 : 0;

    console.log(
      `  ✓ ${card.name} (${setCode} #${card.number}) ${picked.variantLabel} market=$${picked.market} 7d≈${pct7d.toFixed(1)}%`
    );

    ingested.push({
      cardId: cardRowId,
      conditionId,
      name: card.name,
      market: picked.market,
      pct7d,
      sourceUrl: picked.sourceUrl,
    });
  }

  // Curated: top market = trending; largest synthetic 7d % = gaining
  const byMarket = [...ingested].sort((a, b) => b.market - a.market);
  const byGain = [...ingested].sort((a, b) => b.pct7d - a.pct7d);

  const trendingTop = byMarket.slice(0, Math.min(8, byMarket.length));
  const gainingTop = byGain.slice(0, Math.min(8, byGain.length));

  let curatedCount = 0;
  for (const [rank, row] of trendingTop.entries()) {
    const blurb = `${row.name} — live TCGPlayer market via Pokémon TCG API ($${row.market.toFixed(2)}). Featured as a top-priced chase in this catalog refresh.`;
    await client.execute({
      sql: `
        INSERT INTO curated_entries (condition_id, tag, blurb, rank, featured_at)
        VALUES (?, 'trending', ?, ?, ?)
      `,
      args: [row.conditionId, blurb, rank + 1, now.toISOString()],
    });
    curatedCount++;
  }

  for (const [rank, row] of gainingTop.entries()) {
    const blurb = `${row.name} — strongest illustrative 7d move in this ingest (~${row.pct7d.toFixed(1)}%). Latest point is live TCGPlayer market from Pokémon TCG API; prior sparkline points are illustrative until daily ingest accumulates.`;
    await client.execute({
      sql: `
        INSERT INTO curated_entries (condition_id, tag, blurb, rank, featured_at)
        VALUES (?, 'gaining', ?, ?, ?)
      `,
      args: [row.conditionId, blurb, rank + 1, now.toISOString()],
    });
    curatedCount++;
  }

  const stats = {
    cards: ingested.length,
    conditions: ingested.length,
    snapshots: snapCount,
    curated: curatedCount,
    skipped: skipped.length,
  };
  console.log("Ingest complete.");
  console.log(JSON.stringify(stats, null, 2));
  if (skipped.length) {
    console.log("Skipped:", skipped.join(", "));
  }
  console.log(
    "NOTE: Latest snapshot per card is LIVE TCGPlayer market from Pokémon TCG API; prior daily points are illustrative."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
