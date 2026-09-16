import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "collectibles.db");

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  set_name TEXT NOT NULL,
  set_code TEXT NOT NULL,
  number TEXT NOT NULL,
  variant TEXT NOT NULL DEFAULT 'Normal',
  language TEXT NOT NULL DEFAULT 'EN',
  rarity TEXT NOT NULL,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS card_conditions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  condition TEXT NOT NULL CHECK (condition IN ('raw_nm', 'psa_10', 'cgc_10')),
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS price_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  condition_id INTEGER NOT NULL REFERENCES card_conditions(id) ON DELETE CASCADE,
  price_usd REAL NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('tcgplayer', 'pricecharting', 'psa', 'cgc')),
  source_url TEXT,
  pulled_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS curated_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  condition_id INTEGER NOT NULL REFERENCES card_conditions(id) ON DELETE CASCADE,
  tag TEXT NOT NULL CHECK (tag IN ('trending', 'gaining', 'notable')),
  blurb TEXT NOT NULL,
  rank INTEGER NOT NULL DEFAULT 100,
  featured_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_snapshots_condition_pulled
  ON price_snapshots(condition_id, pulled_at);
CREATE INDEX IF NOT EXISTS idx_curated_tag_rank
  ON curated_entries(tag, rank);
CREATE INDEX IF NOT EXISTS idx_cards_set ON cards(set_code);
CREATE INDEX IF NOT EXISTS idx_cards_rarity ON cards(rarity);
`;

let _db: Database.Database | null = null;

export function getDbPath() {
  return DB_PATH;
}

export function getDb(): Database.Database {
  if (_db) return _db;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  return _db;
}

export function setupSchema(db: Database.Database = getDb()) {
  db.exec(SCHEMA_SQL);
}

export type ConditionCode = "raw_nm" | "psa_10" | "cgc_10";
export type SourceCode = "tcgplayer" | "pricecharting" | "psa" | "cgc";
export type CuratedTag = "trending" | "gaining" | "notable";

export type CardRow = {
  id: number;
  name: string;
  set_name: string;
  set_code: string;
  number: string;
  variant: string;
  language: string;
  rarity: string;
  image_url: string | null;
};

export type ConditionRow = {
  id: number;
  card_id: number;
  condition: ConditionCode;
  slug: string;
};

export type SnapshotRow = {
  id: number;
  condition_id: number;
  price_usd: number;
  source: SourceCode;
  source_url: string | null;
  pulled_at: string;
};

export type CuratedRow = {
  id: number;
  condition_id: number;
  tag: CuratedTag;
  blurb: string;
  rank: number;
  featured_at: string;
};
