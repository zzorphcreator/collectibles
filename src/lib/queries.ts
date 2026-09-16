import { getClient, type ConditionCode, type CuratedTag } from "./db";

export type ListingCard = {
  condition_id: number;
  slug: string;
  condition: ConditionCode;
  name: string;
  set_name: string;
  set_code: string;
  number: string;
  variant: string;
  rarity: string;
  image_url: string | null;
  tag: CuratedTag | null;
  blurb: string | null;
  rank: number | null;
  latest_price: number;
  price_7d_ago: number | null;
  price_30d_ago: number | null;
  change_7d_pct: number | null;
  change_30d_pct: number | null;
  sparkline: number[];
};

function pctChange(latest: number, older: number | null): number | null {
  if (older === null || older === 0) return null;
  return ((latest - older) / older) * 100;
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function rowToRecord(row: Record<string, unknown>): Record<string, unknown> {
  return row;
}

async function attachPrices(
  rows: Array<Record<string, unknown>>
): Promise<ListingCard[]> {
  const client = getClient();
  const out: ListingCard[] = [];

  for (const r of rows) {
    const conditionId = Number(r.condition_id);
    const snapResult = await client.execute({
      sql: `
        SELECT price_usd, pulled_at
        FROM price_snapshots
        WHERE condition_id = ?
        ORDER BY pulled_at ASC
      `,
      args: [conditionId],
    });

    const snaps = snapResult.rows.map((s) => ({
      price_usd: Number(s.price_usd),
      pulled_at: String(s.pulled_at),
    }));

    const latest = snaps.length ? snaps[snaps.length - 1].price_usd : 0;
    const cutoff7 = daysAgoIso(7);
    const cutoff30 = daysAgoIso(30);

    let price7: number | null = null;
    let price30: number | null = null;
    for (const s of snaps) {
      if (s.pulled_at <= cutoff7) price7 = s.price_usd;
      if (s.pulled_at <= cutoff30) price30 = s.price_usd;
    }
    // If no snapshot on/before cutoff, use earliest available as proxy when history is short
    if (price7 === null && snaps.length) price7 = snaps[0].price_usd;
    if (price30 === null && snaps.length) price30 = snaps[0].price_usd;

    const sparkline = snaps.slice(-14).map((s) => s.price_usd);

    out.push({
      condition_id: conditionId,
      slug: String(r.slug),
      condition: r.condition as ConditionCode,
      name: String(r.name),
      set_name: String(r.set_name),
      set_code: String(r.set_code),
      number: String(r.number),
      variant: String(r.variant),
      rarity: String(r.rarity),
      image_url: r.image_url != null ? String(r.image_url) : null,
      tag: (r.tag as CuratedTag | null) ?? null,
      blurb: r.blurb != null ? String(r.blurb) : null,
      rank: r.rank != null ? Number(r.rank) : null,
      latest_price: latest,
      price_7d_ago: price7,
      price_30d_ago: price30,
      change_7d_pct: pctChange(latest, price7),
      change_30d_pct: pctChange(latest, price30),
      sparkline,
    });
  }

  return out;
}

export async function getCuratedListings(
  tag: CuratedTag,
  limit = 12
): Promise<ListingCard[]> {
  const client = getClient();
  const result = await client.execute({
    sql: `
    SELECT
      cc.id AS condition_id,
      cc.slug,
      cc.condition,
      c.name,
      c.set_name,
      c.set_code,
      c.number,
      c.variant,
      c.rarity,
      c.image_url,
      ce.tag,
      ce.blurb,
      ce.rank
    FROM curated_entries ce
    JOIN card_conditions cc ON cc.id = ce.condition_id
    JOIN cards c ON c.id = cc.card_id
    WHERE ce.tag = ?
    ORDER BY ce.rank ASC, ce.featured_at DESC
    LIMIT ?
  `,
    args: [tag, limit],
  });
  const rows = result.rows.map((r) => rowToRecord(r as Record<string, unknown>));
  return attachPrices(rows);
}

export type BrowseFilters = {
  q?: string;
  set?: string;
  rarity?: string;
  graded?: "all" | "raw" | "graded";
};

export async function browseListings(
  filters: BrowseFilters = {}
): Promise<ListingCard[]> {
  const client = getClient();
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filters.q?.trim()) {
    clauses.push("(c.name LIKE ? OR c.set_name LIKE ?)");
    const like = `%${filters.q.trim()}%`;
    params.push(like, like);
  }
  if (filters.set) {
    clauses.push("c.set_code = ?");
    params.push(filters.set);
  }
  if (filters.rarity) {
    clauses.push("c.rarity = ?");
    params.push(filters.rarity);
  }
  if (filters.graded === "raw") {
    clauses.push("cc.condition = 'raw_nm'");
  } else if (filters.graded === "graded") {
    clauses.push("cc.condition IN ('psa_10', 'cgc_10')");
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const result = await client.execute({
    sql: `
    SELECT
      cc.id AS condition_id,
      cc.slug,
      cc.condition,
      c.name,
      c.set_name,
      c.set_code,
      c.number,
      c.variant,
      c.rarity,
      c.image_url,
      (
        SELECT ce.tag FROM curated_entries ce
        WHERE ce.condition_id = cc.id
        ORDER BY ce.rank ASC LIMIT 1
      ) AS tag,
      (
        SELECT ce.blurb FROM curated_entries ce
        WHERE ce.condition_id = cc.id
        ORDER BY ce.rank ASC LIMIT 1
      ) AS blurb,
      (
        SELECT ce.rank FROM curated_entries ce
        WHERE ce.condition_id = cc.id
        ORDER BY ce.rank ASC LIMIT 1
      ) AS rank
    FROM card_conditions cc
    JOIN cards c ON c.id = cc.card_id
    ${where}
    ORDER BY c.name ASC, cc.condition ASC
  `,
    args: params,
  });

  const rows = result.rows.map((r) => rowToRecord(r as Record<string, unknown>));
  return attachPrices(rows);
}

export async function getListingBySlug(
  slug: string
): Promise<ListingCard | null> {
  const client = getClient();
  const result = await client.execute({
    sql: `
    SELECT
      cc.id AS condition_id,
      cc.slug,
      cc.condition,
      c.name,
      c.set_name,
      c.set_code,
      c.number,
      c.variant,
      c.rarity,
      c.image_url,
      (
        SELECT ce.tag FROM curated_entries ce
        WHERE ce.condition_id = cc.id
        ORDER BY ce.rank ASC LIMIT 1
      ) AS tag,
      (
        SELECT ce.blurb FROM curated_entries ce
        WHERE ce.condition_id = cc.id
        ORDER BY ce.rank ASC LIMIT 1
      ) AS blurb,
      (
        SELECT ce.rank FROM curated_entries ce
        WHERE ce.condition_id = cc.id
        ORDER BY ce.rank ASC LIMIT 1
      ) AS rank
    FROM card_conditions cc
    JOIN cards c ON c.id = cc.card_id
    WHERE cc.slug = ?
  `,
    args: [slug],
  });

  if (!result.rows.length) return null;
  const listings = await attachPrices([
    rowToRecord(result.rows[0] as Record<string, unknown>),
  ]);
  return listings[0];
}

export async function getComps(conditionId: number) {
  const client = getClient();
  const result = await client.execute({
    sql: `
    SELECT id, condition_id, price_usd, source, source_url, pulled_at
    FROM price_snapshots
    WHERE condition_id = ?
    ORDER BY pulled_at DESC, id DESC
    LIMIT 24
  `,
    args: [conditionId],
  });

  return result.rows.map((r) => ({
    id: Number(r.id),
    condition_id: Number(r.condition_id),
    price_usd: Number(r.price_usd),
    source: String(r.source),
    source_url: r.source_url != null ? String(r.source_url) : null,
    pulled_at: String(r.pulled_at),
  }));
}

export async function getFilterOptions() {
  const client = getClient();
  const setsResult = await client.execute(
    `SELECT DISTINCT set_code, set_name FROM cards ORDER BY set_name ASC`
  );
  const raritiesResult = await client.execute(
    `SELECT DISTINCT rarity FROM cards ORDER BY rarity ASC`
  );
  return {
    sets: setsResult.rows.map((r) => ({
      set_code: String(r.set_code),
      set_name: String(r.set_name),
    })),
    rarities: raritiesResult.rows.map((r) => String(r.rarity)),
  };
}

export async function countCards(): Promise<number> {
  const client = getClient();
  const result = await client.execute(`SELECT COUNT(*) AS n FROM cards`);
  return Number(result.rows[0]?.n ?? 0);
}
