import Link from "next/link";

export default function AboutPage() {
  return (
    <article className="prose-invert mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          About &amp; methodology
        </h1>
        <p className="mt-2 text-zinc-400">
          This is a <strong className="text-zinc-200">local read-only demo</strong> of
          a Pokémon TCG collectibles discovery experience — not a live marketplace
          and not financial advice.
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-6">
        <h2 className="text-lg font-semibold text-amber-100">Demo-data disclaimer</h2>
        <p className="text-sm leading-relaxed text-zinc-300">
          Every price, percentage, sparkline, and comp in this build is{" "}
          <strong className="text-white">invented sample data</strong> written by
          the seed script. Nothing here was scraped from live market sites. Do not
          treat demo figures as real quotes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Source whitelist</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          A production curation bot should only ingest from agreed public/partner
          sources. This demo models that whitelist as:
        </p>
        <ul className="list-inside list-disc space-y-2 text-sm text-zinc-300">
          <li>
            <span className="font-medium text-white">TCGPlayer</span> — raw / near-mint
            marketable comps
          </li>
          <li>
            <span className="font-medium text-white">PriceCharting</span> — cross-check
            price history
          </li>
          <li>
            <span className="font-medium text-white">PSA</span> — graded population /
            auction context for PSA 10
          </li>
          <li>
            <span className="font-medium text-white">CGC</span> — graded context for CGC
            10
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Trust rules</h2>
        <ol className="list-inside list-decimal space-y-2 text-sm text-zinc-300">
          <li>Always label sample or delayed data in the UI (see the amber banner).</li>
          <li>Store <code className="text-violet-200">source</code>,{" "}
            <code className="text-violet-200">source_url</code>, and{" "}
            <code className="text-violet-200">pulled_at</code> on every snapshot.</li>
          <li>Prefer condition-specific listings (raw NM vs PSA 10 vs CGC 10) over blended prices.</li>
          <li>Curation tags (<em>trending</em>, <em>gaining</em>, <em>notable</em>) are editorial — separate from raw price math.</li>
          <li>No auth, uploads, or bidding in this discovery surface.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Schema → future bot</h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          A bot can append rows to <code className="text-violet-200">price_snapshots</code>{" "}
          (and optionally refresh <code className="text-violet-200">curated_entries</code>)
          without changing the Next.js read path. Cards and conditions are stable
          identity; snapshots are the time series; curated entries are the editorial
          layer for Home grids.
        </p>
      </section>

      <p className="text-sm text-zinc-500">
        Upstream repo note: you can push this demo to{" "}
        <code className="text-zinc-400">https://github.com/zzorphcreator/collectibles</code>{" "}
        when ready — this package does not clone or push remotes.
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
