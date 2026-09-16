/**
 * Seed DEMO price data for the collectibles discovery demo.
 * All prices are invented sample values — not live market data.
 */
import fs from "fs";
import path from "path";
import { getDb, getDbPath, setupSchema } from "../src/lib/db";
import { slugify } from "../src/lib/format";

type SeedCard = {
  name: string;
  set_name: string;
  set_code: string;
  number: string;
  variant: string;
  rarity: string;
  image_url: string;
  conditions: Array<{
    condition: "raw_nm" | "psa_10" | "cgc_10";
    base: number;
    volatility: number;
    trend: number; // daily drift multiplier bias
    tag?: "trending" | "gaining" | "notable";
    blurb?: string;
    rank?: number;
  }>;
};

const CARDS: SeedCard[] = [
  {
    name: "Pikachu ex",
    set_name: "Surging Sparks",
    set_code: "ssp",
    number: "238",
    variant: "Special Illustration Rare",
    rarity: "Special Illustration Rare",
    image_url: "https://images.pokemontcg.io/sv8/238_hires.png",
    conditions: [
      {
        condition: "raw_nm",
        base: 185,
        volatility: 0.04,
        trend: 0.012,
        tag: "gaining",
        blurb: "SIR demand holding after set rotation chatter; raw copies tightening in demo comps.",
        rank: 1,
      },
      {
        condition: "psa_10",
        base: 420,
        volatility: 0.035,
        trend: 0.01,
        tag: "trending",
        blurb: "Gem population interest keeps PSA 10 prints in the trending lane for this demo.",
        rank: 2,
      },
    ],
  },
  {
    name: "Latias ex",
    set_name: "Surging Sparks",
    set_code: "ssp",
    number: "239",
    variant: "Special Illustration Rare",
    rarity: "Special Illustration Rare",
    image_url: "https://images.pokemontcg.io/sv8/239_hires.png",
    conditions: [
      {
        condition: "raw_nm",
        base: 95,
        volatility: 0.05,
        trend: 0.008,
        tag: "trending",
        blurb: "Art-forward chase card still circulating in demo watchlists.",
        rank: 3,
      },
      {
        condition: "psa_10",
        base: 240,
        volatility: 0.04,
        trend: 0.006,
      },
    ],
  },
  {
    name: "Hydreigon ex",
    set_name: "Surging Sparks",
    set_code: "ssp",
    number: "168",
    variant: "Double Rare",
    rarity: "Double Rare",
    image_url: "https://images.pokemontcg.io/sv8/168_hires.png",
    conditions: [
      {
        condition: "raw_nm",
        base: 12,
        volatility: 0.06,
        trend: -0.004,
      },
    ],
  },
  {
    name: "Terapagos ex",
    set_name: "Stellar Crown",
    set_code: "scr",
    number: "128",
    variant: "Special Illustration Rare",
    rarity: "Special Illustration Rare",
    image_url: "https://images.pokemontcg.io/sv7/128_hires.png",
    conditions: [
      {
        condition: "raw_nm",
        base: 72,
        volatility: 0.045,
        trend: 0.009,
        tag: "gaining",
        blurb: "Demo sparkline shows a steady climb over the past week of sample snapshots.",
        rank: 2,
      },
      {
        condition: "cgc_10",
        base: 165,
        volatility: 0.04,
        trend: 0.007,
        tag: "notable",
        blurb: "CGC 10 sample comps sit above raw with room for population storytelling.",
        rank: 1,
      },
    ],
  },
  {
    name: "Lacey",
    set_name: "Stellar Crown",
    set_code: "scr",
    number: "172",
    variant: "Special Illustration Rare",
    rarity: "Special Illustration Rare",
    image_url: "https://images.pokemontcg.io/sv7/172_hires.png",
    conditions: [
      {
        condition: "raw_nm",
        base: 48,
        volatility: 0.05,
        trend: 0.011,
        tag: "gaining",
        blurb: "Support SIR with demo momentum — invented prices trending up on 7d.",
        rank: 3,
      },
      {
        condition: "psa_10",
        base: 130,
        volatility: 0.038,
        trend: 0.009,
        tag: "trending",
        blurb: "Graded copies featured for discovery UX in this local demo.",
        rank: 4,
      },
    ],
  },
  {
    name: "Cinderace ex",
    set_name: "Stellar Crown",
    set_code: "scr",
    number: "157",
    variant: "Ultra Rare",
    rarity: "Ultra Rare",
    image_url: "https://images.pokemontcg.io/sv7/157_hires.png",
    conditions: [
      {
        condition: "raw_nm",
        base: 8.5,
        volatility: 0.07,
        trend: 0.002,
      },
    ],
  },
  {
    name: "Greninja ex",
    set_name: "Twilight Masquerade",
    set_code: "tm",
    number: "214",
    variant: "Special Illustration Rare",
    rarity: "Special Illustration Rare",
    image_url: "https://images.pokemontcg.io/sv6/214_hires.png",
    conditions: [
      {
        condition: "raw_nm",
        base: 310,
        volatility: 0.035,
        trend: 0.005,
        tag: "trending",
        blurb: "Flagship chase of Twilight Masquerade — demo data keeps it near the top of trending.",
        rank: 1,
      },
      {
        condition: "psa_10",
        base: 780,
        volatility: 0.03,
        trend: 0.004,
        tag: "notable",
        blurb: "High-ticket PSA 10 sample for sparkline and comps UI.",
        rank: 2,
      },
    ],
  },
  {
    name: "Bloodmoon Ursaluna ex",
    set_name: "Twilight Masquerade",
    set_code: "tm",
    number: "215",
    variant: "Special Illustration Rare",
    rarity: "Special Illustration Rare",
    image_url: "https://images.pokemontcg.io/sv6/215_hires.png",
    conditions: [
      {
        condition: "raw_nm",
        base: 55,
        volatility: 0.05,
        trend: 0.01,
        tag: "gaining",
        blurb: "Secondary chase gaining in the demo 7-day window.",
        rank: 4,
      },
      {
        condition: "psa_10",
        base: 145,
        volatility: 0.04,
        trend: 0.008,
      },
    ],
  },
  {
    name: "Ogerpon Masks",
    set_name: "Twilight Masquerade",
    set_code: "tm",
    number: "212",
    variant: "Special Illustration Rare",
    rarity: "Special Illustration Rare",
    image_url: "https://images.pokemontcg.io/sv6/212_hires.png",
    conditions: [
      {
        condition: "raw_nm",
        base: 38,
        volatility: 0.055,
        trend: 0.003,
        tag: "trending",
        blurb: "Collectible art piece with steady demo liquidity.",
        rank: 5,
      },
    ],
  },
  {
    name: "Mew ex",
    set_name: "Paldean Fates",
    set_code: "paf",
    number: "232",
    variant: "Special Illustration Rare",
    rarity: "Special Illustration Rare",
    image_url: "https://images.pokemontcg.io/sv4pt5/232_hires.png",
    conditions: [
      {
        condition: "raw_nm",
        base: 125,
        volatility: 0.04,
        trend: 0.007,
        tag: "trending",
        blurb: "Evergreen modern chase — demo snapshots show gentle upward drift.",
        rank: 6,
      },
      {
        condition: "psa_10",
        base: 295,
        volatility: 0.035,
        trend: 0.006,
        tag: "gaining",
        blurb: "Graded premium expanding slightly in invented comps.",
        rank: 5,
      },
    ],
  },
  {
    name: "Charizard ex",
    set_name: "Paldean Fates",
    set_code: "paf",
    number: "234",
    variant: "Special Illustration Rare",
    rarity: "Special Illustration Rare",
    image_url: "https://images.pokemontcg.io/sv4pt5/234_hires.png",
    conditions: [
      {
        condition: "raw_nm",
        base: 210,
        volatility: 0.038,
        trend: 0.004,
        tag: "notable",
        blurb: "Charizard remains a discovery anchor for the demo catalog.",
        rank: 3,
      },
      {
        condition: "psa_10",
        base: 520,
        volatility: 0.032,
        trend: 0.003,
        tag: "trending",
        blurb: "PSA 10 Charizard sample featured on home trending grid.",
        rank: 7,
      },
    ],
  },
  {
    name: "Iono",
    set_name: "Paldea Evolved",
    set_code: "pal",
    number: "269",
    variant: "Special Illustration Rare",
    rarity: "Special Illustration Rare",
    image_url: "https://images.pokemontcg.io/sv2/269_hires.png",
    conditions: [
      {
        condition: "raw_nm",
        base: 88,
        volatility: 0.045,
        trend: 0.013,
        tag: "gaining",
        blurb: "Trainer SIR with the strongest demo 7d % move in this seed set.",
        rank: 6,
      },
      {
        condition: "cgc_10",
        base: 195,
        volatility: 0.04,
        trend: 0.01,
      },
    ],
  },
  {
    name: "Miraidon ex",
    set_name: "Scarlet & Violet",
    set_code: "sv1",
    number: "244",
    variant: "Special Illustration Rare",
    rarity: "Special Illustration Rare",
    image_url: "https://images.pokemontcg.io/sv1/244_hires.png",
    conditions: [
      {
        condition: "raw_nm",
        base: 42,
        volatility: 0.05,
        trend: -0.002,
        tag: "notable",
        blurb: "Base-set modern SIR for set/filter browsing demos.",
        rank: 4,
      },
    ],
  },
  {
    name: "Koraidon ex",
    set_name: "Scarlet & Violet",
    set_code: "sv1",
    number: "247",
    variant: "Special Illustration Rare",
    rarity: "Special Illustration Rare",
    image_url: "https://images.pokemontcg.io/sv1/247_hires.png",
    conditions: [
      {
        condition: "raw_nm",
        base: 40,
        volatility: 0.05,
        trend: 0.001,
      },
      {
        condition: "psa_10",
        base: 110,
        volatility: 0.042,
        trend: 0.002,
        tag: "trending",
        blurb: "Paired with Miraidon for modern SV discovery coverage.",
        rank: 8,
      },
    ],
  },
  {
    name: "Iron Valiant ex",
    set_name: "Paradox Rift",
    set_code: "par",
    number: "246",
    variant: "Special Illustration Rare",
    rarity: "Special Illustration Rare",
    image_url: "https://images.pokemontcg.io/sv4/246_hires.png",
    conditions: [
      {
        condition: "raw_nm",
        base: 28,
        volatility: 0.055,
        trend: 0.014,
        tag: "gaining",
        blurb: "Paradox chase with invented upward momentum for the gaining-value grid.",
        rank: 7,
      },
      {
        condition: "psa_10",
        base: 85,
        volatility: 0.045,
        trend: 0.011,
      },
    ],
  },
  {
    name: "Roaring Moon ex",
    set_name: "Paradox Rift",
    set_code: "par",
    number: "251",
    variant: "Special Illustration Rare",
    rarity: "Special Illustration Rare",
    image_url: "https://images.pokemontcg.io/sv4/251_hires.png",
    conditions: [
      {
        condition: "raw_nm",
        base: 35,
        volatility: 0.05,
        trend: 0.006,
        tag: "trending",
        blurb: "Dark-type SIR still drawing demo eyeballs.",
        rank: 9,
      },
    ],
  },
];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSnapshots(
  base: number,
  volatility: number,
  trend: number,
  days: number,
  rng: () => number
): Array<{ dayOffset: number; price: number }> {
  const out: Array<{ dayOffset: number; price: number }> = [];
  let price = base * (0.88 + rng() * 0.08); // start slightly below "now"
  for (let d = days - 1; d >= 0; d--) {
    const shock = (rng() - 0.45) * volatility;
    price = Math.max(0.5, price * (1 + trend + shock));
    out.push({ dayOffset: d, price: Math.round(price * 100) / 100 });
  }
  return out;
}

function main() {
  const dbPath = getDbPath();
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  // Reset DB for clean demo seed
  for (const f of [dbPath, `${dbPath}-wal`, `${dbPath}-shm`]) {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }

  const db = getDb();
  setupSchema(db);

  const insertCard = db.prepare(`
    INSERT INTO cards (name, set_name, set_code, number, variant, language, rarity, image_url)
    VALUES (@name, @set_name, @set_code, @number, @variant, 'EN', @rarity, @image_url)
  `);
  const insertCond = db.prepare(`
    INSERT INTO card_conditions (card_id, condition, slug)
    VALUES (@card_id, @condition, @slug)
  `);
  const insertSnap = db.prepare(`
    INSERT INTO price_snapshots (condition_id, price_usd, source, source_url, pulled_at)
    VALUES (@condition_id, @price_usd, @source, @source_url, @pulled_at)
  `);
  const insertCurated = db.prepare(`
    INSERT INTO curated_entries (condition_id, tag, blurb, rank, featured_at)
    VALUES (@condition_id, @tag, @blurb, @rank, @featured_at)
  `);

  const sources = [
    "tcgplayer",
    "pricecharting",
    "psa",
    "cgc",
  ] as const;

  const seedAll = db.transaction(() => {
    let conditionCount = 0;
    let snapCount = 0;
    let curatedCount = 0;
    const now = new Date();

    CARDS.forEach((card, cardIdx) => {
      const info = insertCard.run({
        name: card.name,
        set_name: card.set_name,
        set_code: card.set_code,
        number: card.number,
        variant: card.variant,
        rarity: card.rarity,
        image_url: card.image_url,
      });
      const cardId = Number(info.lastInsertRowid);

      for (const cond of card.conditions) {
        const slug = slugify([
          card.set_code,
          card.number,
          card.name,
          cond.condition,
        ]);
        const cInfo = insertCond.run({
          card_id: cardId,
          condition: cond.condition,
          slug,
        });
        const conditionId = Number(cInfo.lastInsertRowid);
        conditionCount++;

        const days = 10 + (cardIdx % 5); // 10–14 days
        const rng = mulberry32(cardId * 1000 + conditionId * 17 + 42);
        const series = buildSnapshots(
          cond.base,
          cond.volatility,
          cond.trend,
          days,
          rng
        );

        for (const point of series) {
          const pulled = new Date(now);
          pulled.setUTCDate(pulled.getUTCDate() - point.dayOffset);
          pulled.setUTCHours(14 + Math.floor(rng() * 4), Math.floor(rng() * 60), 0, 0);

          // Primary marketable source by condition type
          let primary: (typeof sources)[number] =
            cond.condition === "raw_nm"
              ? "tcgplayer"
              : cond.condition === "psa_10"
                ? "psa"
                : "cgc";
          // Mix in pricecharting every other day for comps variety
          const source =
            point.dayOffset % 2 === 0 ? primary : ("pricecharting" as const);

          const sourceUrl =
            source === "tcgplayer"
              ? `https://www.tcgplayer.com/search/pokemon/product?q=${encodeURIComponent(card.name)} (demo)`
              : source === "pricecharting"
                ? `https://www.pricecharting.com/search-products?q=${encodeURIComponent(card.name)}&type=prices (demo)`
                : source === "psa"
                  ? `https://www.psacard.com/ (demo)`
                  : `https://www.cgccards.com/ (demo)`;

          insertSnap.run({
            condition_id: conditionId,
            price_usd: point.price,
            source,
            source_url: sourceUrl,
            pulled_at: pulled.toISOString(),
          });
          snapCount++;
        }

        if (cond.tag && cond.blurb) {
          insertCurated.run({
            condition_id: conditionId,
            tag: cond.tag,
            blurb: cond.blurb,
            rank: cond.rank ?? 50,
            featured_at: now.toISOString(),
          });
          curatedCount++;
        }
      }
    });

    return {
      cards: CARDS.length,
      conditions: conditionCount,
      snapshots: snapCount,
      curated: curatedCount,
    };
  });

  const stats = seedAll();
  console.log("Demo DB seeded at:", dbPath);
  console.log(JSON.stringify(stats, null, 2));
  console.log("NOTE: All prices are DEMO / sample data — not live market quotes.");
}

main();
