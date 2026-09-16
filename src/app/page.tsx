import Link from "next/link";
import { CardGrid } from "@/components/CardGrid";
import { ensureDb } from "@/lib/db";
import { getCuratedListings, countCards } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureDb();
  let cardCount = 0;
  try {
    cardCount = await countCards();
  } catch {
    cardCount = 0;
  }

  const trending = cardCount ? await getCuratedListings("trending", 8) : [];
  const gaining = cardCount ? await getCuratedListings("gaining", 8) : [];

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
            Browse curated listings with 7d/30d moves, sparklines, and
            whitelist-source comps. Card identity and the latest price come from
            the Pokémon TCG API (TCGPlayer market). No auth, no bidding — just a
            polished collectibles discovery UI backed by SQLite / Turso.
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
              <code className="rounded bg-black/30 px-1.5 py-0.5">npm run db:ingest</code>{" "}
              (preferred) or{" "}
              <code className="rounded bg-black/30 px-1.5 py-0.5">npm run db:seed</code>{" "}
              for offline demo data.
            </p>
          ) : (
            <p className="text-xs text-zinc-500">
              Catalog: {cardCount} cards · latest prices from Pokémon TCG API /
              TCGPlayer when ingested via{" "}
              <code className="rounded bg-black/30 px-1">db:ingest</code>.
            </p>
          )}
        </div>
      </section>

      <CardGrid
        title="Trending now"
        subtitle="Top live market prices from the latest Pokémon TCG API ingest"
        cards={trending}
      />
      <CardGrid
        title="Gaining value"
        subtitle="Largest 7d moves in the current catalog (history may be illustrative)"
        cards={gaining}
      />
    </div>
  );
}
