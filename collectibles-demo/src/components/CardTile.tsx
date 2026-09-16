import Link from "next/link";
import type { ListingCard } from "@/lib/queries";
import { conditionLabel, formatUsd } from "@/lib/format";
import { CardArt } from "./CardArt";
import { PriceChip } from "./PriceChip";
import { Sparkline } from "./Sparkline";

export function CardTile({ card }: { card: ListingCard }) {
  return (
    <Link
      href={`/cards/${card.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-zinc-900/60 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-zinc-900"
    >
      <div className="relative p-3 pb-0">
        <CardArt src={card.image_url} alt={card.name} />
        <div className="absolute left-5 top-5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-200 ring-1 ring-white/10 backdrop-blur">
          {conditionLabel(card.condition)}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 pt-3">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold text-white group-hover:text-violet-200">
            {card.name}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
            {card.set_name} · #{card.number}
          </p>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-lg font-semibold tabular-nums text-white">
              {formatUsd(card.latest_price)}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              <PriceChip pct={card.change_7d_pct} label="7d" />
              <PriceChip pct={card.change_30d_pct} label="30d" />
            </div>
          </div>
          <Sparkline values={card.sparkline} width={88} height={32} />
        </div>
      </div>
    </Link>
  );
}
