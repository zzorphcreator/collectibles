import Link from "next/link";
import fs from "fs";
import { CardGrid } from "@/components/CardGrid";
import { getDb, getDbPath, setupSchema } from "@/lib/db";
import { getCuratedListings, countCards } from "@/lib/queries";

export const dynamic = "force-dynamic";

function ensureDb() {
  const path = getDbPath();
  if (!fs.existsSync(path)) {
    setupSchema();
  } else {
    getDb();
  }
}

export default function HomePage() {
  ensureDb();
  let cardCount = 0;
  try {
    cardCount = countCards();
  } catch {
    cardCount = 0;
  }

  const trending = cardCount ? getCuratedListings("trending", 8) : [];
  const gaining = cardCount ? getCuratedListings("gaining", 8) : [];

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900/80 via-violet-950/40 to-zinc-900/80 p-6 sm:p-10">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative max-w-2xl space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-300/80">
            Discovery · not a marketplace
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Trending &amp; gaining-value Pokémon cards
          </h1>
          <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
            Browse curated demo listings with 7d/30d moves, sparklines, and
            whitelist-source comps. No auth, no bidding — just a polished
            collectibles discovery UI backed by SQLite.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/browse"
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-violet-100"
            >
              Browse all
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-200 transition hover:border-violet-400/40 hover:bg-white/5"
            >
              Methodology
            </Link>
          </div>
          {cardCount === 0 ? (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Database empty. From the project root run{" "}
              <code className="rounded bg-black/30 px-1.5 py-0.5">npm run db:seed</code>.
            </p>
          ) : (
            <p className="text-xs text-zinc-500">
              Seeded catalog: {cardCount} cards (demo prices).
            </p>
          )}
        </div>
      </section>

      <CardGrid
        title="Trending now"
        subtitle="Curated demo picks with recent discovery interest"
        cards={trending}
      />
      <CardGrid
        title="Gaining value"
        subtitle="Strongest upward 7d moves in this sample set"
        cards={gaining}
      />
    </div>
  );
}
