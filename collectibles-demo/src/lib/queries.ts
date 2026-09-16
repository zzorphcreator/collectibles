import { getDb, type ConditionCode, type CuratedTag } from "./db";

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

function attachPrices(rows: Array<Record<string, unknown>>): ListingCard[] {
  const db = getDb();
  const snapStmt = db.prepare(`
    SELECT price_usd, pulled_at
    FROM price_snapshots
    WHERE condition_id = ?
    ORDER BY pulled_at ASC
  `);

  return rows.map((r) => {
    const snaps = snapStmt.all(r.condition_id as number) as Array<{
      price_usd: number;
      pulled_at: string;
    }>;
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

    return {
      condition_id: r.condition_id as number,
      slug: r.slug as string,
      condition: r.condition as ConditionCode,
      name: r.name as string,
      set_name: r.set_name as string,
      set_code: r.set_code as string,
      number: r.number as string,
      variant: r.variant as string,
      rarity: r.rarity as string,
      image_url: (r.image_url as string | null) ?? null,
      tag: (r.tag as CuratedTag | null) ?? null,
      blurb: (r.blurb as string | null) ?? null,
      rank: (r.rank as number | null) ?? null,
      latest_price: latest,
      price_7d_ago: price7,
      price_30d_ago: price30,
      change_7d_pct: pctChange(latest, price7),
      change_30d_pct: pctChange(latest, price30),
      sparkline,
    };
  });
}

export function getCuratedListings(tag: CuratedTag, limit = 12): ListingCard[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
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
  `
    )
    .all(tag, limit);
  return attachPrices(rows as Array<Record<string, unknown>>);
}

export type BrowseFilters = {
  q?: string;
  set?: string;
  rarity?: string;
  graded?: "all" | "raw" | "graded";
};

export function browseListings(filters: BrowseFilters = {}): ListingCard[] {
  const db = getDb();
  const clauses: string[] = [];
  const params: unknown[] = [];

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

  const rows = db
    .prepare(
      `
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
  `
    )
    .all(...params);

  return attachPrices(rows as Array<Record<string, unknown>>);
}

export function getListingBySlug(slug: string): ListingCard | null {
  const db = getDb();
  const row = db
    .prepare(
      `
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
  `
    )
    .get(slug);

  if (!row) return null;
  return attachPrices([row as Record<string, unknown>])[0];
}

export function getComps(conditionId: number) {
  const db = getDb();
  return db
    .prepare(
      `
    SELECT id, condition_id, price_usd, source, source_url, pulled_at
    FROM price_snapshots
    WHERE condition_id = ?
    ORDER BY pulled_at DESC, id DESC
    LIMIT 24
  `
    )
    .all(conditionId) as Array<{
    id: number;
    condition_id: number;
    price_usd: number;
    source: string;
    source_url: string | null;
    pulled_at: string;
  }>;
}

export function getFilterOptions() {
  const db = getDb();
  const sets = db
    .prepare(
      `SELECT DISTINCT set_code, set_name FROM cards ORDER BY set_name ASC`
    )
    .all() as Array<{ set_code: string; set_name: string }>;
  const rarities = db
    .prepare(`SELECT DISTINCT rarity FROM cards ORDER BY rarity ASC`)
    .all() as Array<{ rarity: string }>;
  return {
    sets,
    rarities: rarities.map((r) => r.rarity),
  };
}

export function countCards(): number {
  const db = getDb();
  const row = db.prepare(`SELECT COUNT(*) AS n FROM cards`).get() as {
    n: number;
  };
  return row.n;
}
