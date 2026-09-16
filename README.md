# Collectibles · Pokémon TCG Discovery

Polished, **read-only** web app for browsing trending and gaining-value Pokémon TCG cards. Runs locally with a file SQLite DB, or on **Vercel + Turso** with the same `@libsql/client` code path.

> **Latest prices are live** when you run `npm run db:ingest` (Pokémon TCG API → TCGPlayer market). Sparkline / 7d / 30d **history points written at ingest time are illustrative** until a daily job accumulates real snapshots. Prefer ingest over the offline demo seed for anything user-facing.

Optional upstream: https://github.com/zzorphcreator/collectibles — default branch is **`master`**.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- SQLite / Turso via `@libsql/client` (local `file:` URL or remote `libsql://`)
- Ingest / seed scripts (`tsx`)

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Home — Trending now + Gaining value grids with % chips |
| `/cards/[slug]` | Detail — art, sparkline, comps (source + timestamp), curation blurb |
| `/browse` | Filter set / rarity / graded vs raw; search by name |
| `/about` | Methodology, whitelist, trust rules, live vs illustrative disclaimer |

## Environment variables

| Variable | Local | Vercel / Turso |
|----------|-------|----------------|
| `TURSO_DATABASE_URL` | Optional. If unset, uses `file:<cwd>/data/collectibles.db` | **Required** — your Turso `libsql://…` URL |
| `TURSO_AUTH_TOKEN` | Not needed for `file:` URLs | **Required** for remote Turso |
| `POKEMONTCG_API_KEY` | Optional — higher Pokémon TCG API rate limits | Optional |

Copy `.env.example` → `.env.local` for local overrides. Never commit real tokens.

### Exact env vars for Vercel

In **Vercel → Project → Settings → Environment Variables**, set for Production (and Preview if desired):

```
TURSO_DATABASE_URL=libsql://YOUR-DB-NAME-YOUR-ORG.turso.io
TURSO_AUTH_TOKEN=YOUR_TURSO_AUTH_TOKEN
POKEMONTCG_API_KEY=   # optional
```

Do not invent tokens — create Turso credentials in the [Turso dashboard](https://turso.tech). Get a Pokémon TCG API key at [pokemontcg.io](https://pokemontcg.io/) if you need higher limits (ingest works without it).

## Install & run (local file DB)

```bash
cd collectibles-demo   # or this checkout folder
npm install
npm run db:ingest      # REAL cards + live TCGPlayer market (preferred)
npm run dev            # http://localhost:3000
```

Offline demo only (invented prices):

```bash
npm run db:seed
```

Other scripts:

```bash
npm run db:setup       # schema only (no data)
npm run build          # production build (does NOT run ingest)
npm start              # after build
```

**Node:** 20.x recommended. No native compile step — `@libsql/client` replaces `better-sqlite3`.

## Ingest: local vs remote Turso

**Local file** (default — unset Turso env):

```bash
npm run db:ingest
# or explicitly:
TURSO_DATABASE_URL=file:./data/collectibles.db npm run db:ingest
```

**Remote Turso** (refresh production data from your machine):

```bash
TURSO_DATABASE_URL=libsql://YOUR-DB.turso.io \
TURSO_AUTH_TOKEN=YOUR_TOKEN \
npm run db:ingest
```

Optional API key:

```bash
POKEMONTCG_API_KEY=YOUR_KEY npm run db:ingest
```

The ingest script drops and recreates tables, then inserts curated modern cards with live latest markets. Safe to re-run; it resets the target DB.

`npm run db:seed` remains the old invented-demo path for offline UX without hitting the API.

## Deploy to Vercel + Turso

1. Create a Turso database and note `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`.
2. Ingest the remote DB once (command above) — **do not** rely on `npm run build` to ingest (build stays a plain Next.js build).
3. Push this repo to GitHub (`master` is the default branch).
4. Import the repo in Vercel; set the Turso env vars; deploy.
5. To refresh prices later: re-run `db:ingest` against Turso from a trusted machine, or temporarily add a one-time build hook / CI job that runs ingest with secrets (then remove it). Prefer a scheduled Turso-side or GitHub Action cron over baking ingest into every Vercel build.

GitHub default branch: **`master`**.

## Schema

SQLite / libSQL tables:

- **cards** — `id`, `name`, `set_name`, `set_code`, `number`, `variant`, `language`, `rarity`, `image_url`
- **card_conditions** — `id`, `card_id`, `condition` (`raw_nm` \| `psa_10` \| `cgc_10`), `slug` (unique, used in URLs)
- **price_snapshots** — `id`, `condition_id`, `price_usd`, `source` (`tcgplayer` \| `pricecharting` \| `psa` \| `cgc`), `source_url`, `pulled_at`
- **curated_entries** — `id`, `condition_id`, `tag` (`trending` \| `gaining` \| `notable`), `blurb`, `rank`, `featured_at`

Local file path when env unset: `data/collectibles.db`.

## Bot → DB curation (future)

1. Resolve or insert a **card** + **card_condition** (stable identity / slug).
2. Append **price_snapshots** rows (never overwrite history) with whitelist `source`, URL, and ISO `pulled_at`.
3. Upsert **curated_entries** for Home grids (`trending` / `gaining` / `notable`) with rank + blurb.
4. The Next.js app is read-only against the same tables.

## Trust / methodology (summary)

Whitelist: **TCGPlayer** (via Pokémon TCG API), **PriceCharting**, **PSA**, **CGC**. Always label live latest vs illustrative or delayed history. Store provenance on every snapshot. Keep editorial tags separate from raw price math.

## Card art

Ingest uses `images.large` from the Pokémon TCG API (`https://images.pokemontcg.io/...`). If the network fails, the UI falls back to CSS placeholders.

## License / scope

Discovery demo. No auth, uploads, or bidding. Not affiliated with Nintendo, The Pokémon Company, TCGPlayer, or pokemontcg.io.
