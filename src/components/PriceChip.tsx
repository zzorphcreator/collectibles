import { formatPct } from "@/lib/format";

export function PriceChip({
  pct,
  label,
}: {
  pct: number | null;
  label?: string;
}) {
  if (pct === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
        {label ? `${label} ` : ""}—
      </span>
    );
  }
  const up = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        up
          ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
          : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30"
      }`}
    >
      {label ? <span className="text-zinc-400">{label}</span> : null}
      {formatPct(pct)}
    </span>
  );
}
