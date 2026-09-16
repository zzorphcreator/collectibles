import Link from "next/link";

export default function AboutPage() {
  return (
    <article className="prose-invert mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          About &amp; methodology
        </h1>
        <p className="mt-2 text-zinc-400">
          This is a <strong className="text-zinc-200">read-only discovery surface</strong> for
          Pokémon TCG collectibles — not a live marketplace and not financial advice.
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border border-sky-500/25 bg-sky-500/5 p-6">
        <h2 className="text-lg font-semibold text-sky-100">Live latest vs illustrative history</h2>
        <p className="text-sm leading-relaxed text-zinc-300">
          Production data is loaded with{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 text-sky-100">npm run db:ingest</code>,
          which pulls real card names, set metadata, art, and{" "}
          <strong className="text-white">TCGPlayer market prices</strong> from the{" "}
          <a
            href="https://docs.pokemontcg.io/"
            className="text-sky-300 underline decoration-sky-500/40 underline-offset-2 hover:text-sky-200"
            target="_blank"
            rel="noreferrer"
          >
            Pokémon TCG API v2
          </a>
          .
        </p>
        <ul className="list-inside list-disc space-y-2 text-sm text-zinc-300">
          <li>
            <strong className="text-white">Latest snapshot</strong> for each card is the live
            API market value (preferring <code className="text-violet-200">market</code>, then{" "}
            <code className="text-violet-200">mid</code>, then <code className="text-violet-200">low</code>)
            with source <code className="text-violet-200">tcgplayer</code> and a provenance URL.
          </li>
          <li>
            <strong className="text-white">Prior daily points</strong> (sparklines, 7d / 30d %) are
            illustrative walks toward today&apos;s market so the UI works before a scheduled daily
            ingest builds real history. They are <em>not</em> historical TCGPlayer prints.
          </li>
          <li>
            Offline demo path: <code className="rounded bg-black/30 px-1.5 py-0.5">npm run db:seed</code>{" "}
            still writes fully invented sample prices — prefer ingest for anything user-facing.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Source whitelist</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          Ingest and future bots should only use agreed public/partner sources. This app models:
        </p>
        <ul className="list-inside list-disc space-y-2 text-sm text-zinc-300">
          <li>
            <span className="font-medium text-white">TCGPlayer</span> — raw / near-mint
            marketable comps (via Pokémon TCG API price payload)
          </li>
          <li>
            <span className="font-medium text-white">PriceCharting</span> — cross-check
            price history (schema-ready; not filled by ingest yet)
          </li>
          <li>
            <span className="font-medium text-white">PSA</span> — graded population /
            auction context for PSA 10 (not filled by this ingest pass)
          </li>
          <li>
            <span className="font-medium text-white">CGC</span> — graded context for CGC
            10 (not filled by this ingest pass)
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Trust rules</h2>
        <ol className="list-inside list-decimal space-y-2 text-sm text-zinc-300">
          <li>Label live latest vs illustrative history in the UI (see the banner).</li>
          <li>Store <code className="text-violet-200">source</code>,{" "}
            <code className="text-violet-200">source_url</code>, and{" "}
            <code className="text-violet-200">pulled_at</code> on every snapshot.</li>
          <li>Prefer condition-specific listings (raw NM vs graded) over blended prices.</li>
          <li>Curation tags (<em>trending</em>, <em>gaining</em>, <em>notable</em>) are editorial — separate from raw price math.</li>
          <li>No auth, uploads, or bidding in this discovery surface.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Schema → daily ingest</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          Re-run <code className="text-violet-200">db:ingest</code> (or append snapshots from a
          cron) to refresh live markets. Cards and conditions are stable identity; snapshots are
          the time series; curated entries power Home grids. The Next.js app stays read-only.
        </p>
      </section>

      <p className="text-sm text-zinc-500">
        Upstream:{" "}
        <code className="text-zinc-400">https://github.com/zzorphcreator/collectibles</code>
        . Not affiliated with Nintendo, The Pokémon Company, TCGPlayer, or pokemontcg.io.
      </p>

      <Link
        href="/"
        className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
      >
        ← Back home
      </Link>
    </article>
  );
}
