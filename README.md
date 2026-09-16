# Collectibles · Pokémon TCG Discovery (Local Demo)

Polished, **read-only** web app for browsing trending and gaining-value Pokémon TCG cards. Built for local demos and as a schema template for a future curation bot that writes price snapshots.

> **Prices are DEMO / sample data.** They are invented by the seed script and are not live market quotes. Do not scrape live sites from this project.

Optional upstream: you can push this project to https://github.com/zzorphcreator/collectibles when you are ready (this zip does not include remotes or push anything).

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- SQLite via `better-sqlite3`
- Seed script (`tsx`)

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Home — Trending now + Gaining value grids with % chips |
| `/cards/[slug]` | Detail — art, sparkline, comps (source + timestamp), curation blurb |
| `/browse` | Filter set / rarity / graded vs raw; search by name |
| `/about` | Methodology, whitelist, trust rules, demo disclaimer |

## Install & run

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

**Node:** 20.x recommended (`better-sqlite3@11`). Requires native build tools (`build-essential` on Debian/Ubuntu) for the first install of `better-sqlite3`.

## Schema

SQLite file: `data/collectibles.db`

- **cards** — `id`, `name`, `set_name`, `set_code`, `number`, `variant`, `language`, `rarity`, `image_url`
- **card_conditions** — `id`, `card_id`, `condition` (`raw_nm` \| `psa_10` \| `cgc_10`), `slug` (unique, used in URLs)
- **price_snapshots** — `id`, `condition_id`, `price_usd`, `source` (`tcgplayer` \| `pricecharting` \| `psa` \| `cgc`), `source_url`, `pulled_at`
- **curated_entries** — `id`, `condition_id`, `tag` (`trending` \| `gaining` \| `notable`), `blurb`, `rank`, `featured_at`

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

Local demo only. No auth, uploads, or bidding. Not affiliated with Nintendo, The Pokémon Company, or the listed market sites.
