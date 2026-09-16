import Link from "next/link";
import { notFound } from "next/navigation";
import { CardArt } from "@/components/CardArt";
import { PriceChip } from "@/components/PriceChip";
import { Sparkline } from "@/components/Sparkline";
import { getDb, getDbPath, setupSchema } from "@/lib/db";
import {
  conditionLabel,
  formatPulledAt,
  formatUsd,
  sourceLabel,
} from "@/lib/format";
import { getComps, getListingBySlug } from "@/lib/queries";
import fs from "fs";

export const dynamic = "force-dynamic";

function ensureDb() {
  if (!fs.existsSync(getDbPath())) setupSchema();
  else getDb();
}

type Params = Promise<{ slug: string }>;

export default async function CardDetailPage({
  params,
}: {
  params: Params;
}) {
  ensureDb();
  const { slug } = await params;
  const card = getListingBySlug(slug);
  if (!card) notFound();

  const comps = getComps(card.condition_id);

  return (
    <div className="space-y-8">
      <Link
        href="/browse"
        className="inline-flex text-sm text-zinc-400 transition hover:text-violet-300"
      >
        ← Back to browse
      </Link>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="mx-auto w-full max-w-[280px]">
          <CardArt src={card.image_url} alt={card.name} />
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-zinc-300 ring-1 ring-white/10">
                {conditionLabel(card.condition)}
              </span>
              {card.tag ? (
                <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-violet-200 ring-1 ring-violet-400/30">
                  {card.tag}
                </span>
              ) : null}
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] text-amber-200/90 ring-1 ring-amber-500/20">
                Demo price
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {card.name}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {card.set_name} ({card.set_code.toUpperCase()}) · #{card.number} ·{" "}
              {card.variant} · {card.rarity}
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-6 rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                Latest sample
              </div>
              <div className="mt-1 text-3xl font-semibold tabular-nums text-white">
                {formatUsd(card.latest_price)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <PriceChip pct={card.change_7d_pct} label="7d" />
              <PriceChip pct={card.change_30d_pct} label="30d" />
            </div>
            <div className="ml-auto">
              <div className="mb-1 text-right text-[10px] uppercase tracking-wide text-zinc-500">
                ~{card.sparkline.length}d sparkline
              </div>
              <Sparkline values={card.sparkline} width={160} height={48} />
            </div>
          </div>

          {card.blurb ? (
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
              <h2 className="text-sm font-medium text-violet-200">
                Curation note
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                {card.blurb}
              </p>
            </div>
          ) : null}

          <div>
            <h2 className="text-lg font-semibold text-white">
              Comps (demo snapshots)
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Whitelist sources only in a production bot: TCGPlayer, PriceCharting,
              PSA, CGC. URLs below are illustrative demo strings.
            </p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Pulled</th>
                    <th className="px-4 py-3 font-medium">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {comps.map((c) => (
                    <tr key={c.id} className="text-zinc-300">
                      <td className="px-4 py-3 tabular-nums text-white">
                        {formatUsd(c.price_usd)}
                      </td>
                      <td className="px-4 py-3">{sourceLabel(c.source)}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">
                        {formatPulledAt(c.pulled_at)}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {c.source_url ? (
                          <span className="line-clamp-1 max-w-[220px]" title={c.source_url}>
                            {c.source_url.replace(" (demo)", "")}
                            <span className="text-amber-500/80"> · demo</span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
