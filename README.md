# Collectibles · Pokémon TCG Discovery (Demo)

Polished, **read-only** web app for browsing trending and gaining-value Pokémon TCG cards. Runs locally with a file SQLite DB, or on **Vercel + Turso** with the same `@libsql/client` code path.

> **Prices are DEMO / sample data.** They are invented by the seed script and are not live market quotes. Do not scrape live sites from this project.

Optional upstream: https://github.com/zzorphcreator/collectibles — default branch is **`master`**. This package does not push remotes.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- SQLite / Turso via `@libsql/client` (local `file:` URL or remote `libsql://`)
- Seed script (`tsx`)

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Home — Trending now + Gaining value grids with % chips |
| `/cards/[slug]` | Detail — art, sparkline, comps (source + timestamp), curation blurb |
| `/browse` | Filter set / rarity / graded vs raw; search by name |
| `/about` | Methodology, whitelist, trust rules, demo disclaimer |

## Environment variables

| Variable | Local | Vercel / Turso |
|----------|-------|----------------|
| `TURSO_DATABASE_URL` | Optional. If unset, uses `file:<cwd>/data/collectibles.db` | **Required** — your Turso `libsql://…` URL |
| `TURSO_AUTH_TOKEN` | Not needed for `file:` URLs | **Required** for remote Turso |

Copy `.env.example` → `.env.local` for local overrides. Never commit real tokens.

### Exact env vars for Vercel

In **Vercel → Project → Settings → Environment Variables**, set for Production (and Preview if desired):

```
TURSO_DATABASE_URL=libsql://YOUR-DB-NAME-YOUR-ORG.turso.io
TURSO_AUTH_TOKEN=YOUR_TURSO_AUTH_TOKEN
```

Do not invent tokens — create them in the [Turso dashboard](https://turso.tech) (`turso db show …` / `turso db tokens create …`).

## Install & run (local file DB)

```bash
cd collectibles-demo   # or unzip target folder
npm install
npm run db:seed        # creates data/collectibles.db + sample rows
npm run dev            # http://localhost:3000
```

Other scripts:

```bash
npm run db:setup       # schema only (no seed)
npm run build          # production build
npm start              # after build
```

**Node:** 20.x recommended. No native compile step — `@libsql/client` replaces `better-sqlite3`.

## Seed: local vs remote Turso

**Local file** (default — unset Turso env):

```bash
npm run db:seed
# or explicitly:
TURSO_DATABASE_URL=file:./data/collectibles.db npm run db:seed
```

**Remote Turso** (seed once from your machine with real credentials):

```bash
TURSO_DATABASE_URL=libsql://YOUR-DB.turso.io \
TURSO_AUTH_TOKEN=YOUR_TOKEN \
npm run db:seed
```

The seed script drops and recreates demo tables, then inserts sample cards/prices. Safe to re-run; it resets the target DB.

## Deploy to Vercel + Turso

1. Create a Turso database and note `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`.
2. Seed the remote DB once (command above).
3. Push this repo to GitHub (`master` is the default branch for this project).
4. Import the repo in Vercel; set the two env vars; deploy.
5. Vercel builds with `npm run build`. The app is read-only against Turso at runtime — no file SQLite on the serverless filesystem.

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
4. The Next.js app is read-only against the same tables — no API key required for the demo UI.

## Trust / methodology (summary)

Whitelist modeled in seed + About page: **TCGPlayer**, **PriceCharting**, **PSA**, **CGC**. Always label demo or delayed data. Store provenance on every snapshot. Keep editorial tags separate from raw price math.

## Card art

Seed uses public URLs from `https://images.pokemontcg.io/...`. If the network fails, the UI falls back to CSS placeholders.

## License / scope

Demo only. No auth, uploads, or bidding. Not affiliated with Nintendo, The Pokémon Company, or the listed market sites.
