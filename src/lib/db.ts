import { createClient, type Client } from "@libsql/client";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DEFAULT_FILE_PATH = path.join(DATA_DIR, "collectibles.db");

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

let _client: Client | null = null;

/** Resolved libsql URL (file:… locally, or Turso remote). */
export function getDatabaseUrl(): string {
  const fromEnv = process.env.TURSO_DATABASE_URL?.trim();
  if (fromEnv) return fromEnv;
  // Absolute file path works reliably with @libsql/client
  return `file:${DEFAULT_FILE_PATH}`;
}

/** Local filesystem path when using a file: URL; otherwise null (remote Turso). */
export function getDbPath(): string | null {
  const url = getDatabaseUrl();
  if (url.startsWith("file:")) {
    const raw = url.slice("file:".length);
    // Support file:/abs/path and file:./relative
    return path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
  }
  return null;
}

export function isRemoteDatabase(): boolean {
  return getDbPath() === null;
}

export function getClient(): Client {
  if (_client) return _client;

  const url = getDatabaseUrl();
  const filePath = getDbPath();

  if (filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
  if (isRemoteDatabase() && !authToken) {
    throw new Error(
      "TURSO_AUTH_TOKEN is required when TURSO_DATABASE_URL points to a remote Turso database"
    );
  }

  _client = createClient({
    url,
    ...(authToken ? { authToken } : {}),
  });
  return _client;
}

/** Ensure schema exists (idempotent). Safe for local file and remote Turso. */
export async function setupSchema(client: Client = getClient()): Promise<void> {
  // Enable FK checks where supported (local libsql / SQLite)
  try {
    await client.execute("PRAGMA foreign_keys = ON");
  } catch {
    // Remote may ignore or reject; schema still works
  }
  await client.executeMultiple(SCHEMA_SQL);
}

export async function ensureDb(): Promise<Client> {
  const client = getClient();
  await setupSchema(client);
  return client;
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
