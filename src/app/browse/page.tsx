import { CardGrid } from "@/components/CardGrid";
import { browseListings, getFilterOptions } from "@/lib/queries";
import { ensureDb } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await ensureDb();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const set = typeof sp.set === "string" ? sp.set : "";
  const rarity = typeof sp.rarity === "string" ? sp.rarity : "";
  const graded =
    sp.graded === "raw" || sp.graded === "graded" ? sp.graded : "all";

  const options = await getFilterOptions();
  const cards = await browseListings({
    q,
    set: set || undefined,
    rarity: rarity || undefined,
    graded,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Browse</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Filter by set, rarity, and raw vs graded. Search by card or set name.
        </p>
      </div>

      <form className="grid gap-3 rounded-2xl border border-white/10 bg-zinc-900/50 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1 text-xs text-zinc-400 lg:col-span-2">
          Search
          <input
            name="q"
            defaultValue={q}
            placeholder="e.g. Charizard, Iono…"
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none ring-violet-500/40 placeholder:text-zinc-600 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-400">
          Set
          <select
            name="set"
            defaultValue={set}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
          >
            <option value="">All sets</option>
            {options.sets.map((s) => (
              <option key={s.set_code} value={s.set_code}>
                {s.set_name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-400">
          Rarity
          <select
            name="rarity"
            defaultValue={rarity}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
          >
            <option value="">All rarities</option>
            {options.rarities.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-400">
          Condition type
          <select
            name="graded"
            defaultValue={graded}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
          >
            <option value="all">Raw + graded</option>
            <option value="raw">Raw NM only</option>
            <option value="graded">Graded only</option>
          </select>
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <button
            type="submit"
            className="rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
          >
            Apply filters
          </button>
          <Link
            href="/browse"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
          >
            Reset
          </Link>
          <span className="ml-auto self-center text-xs text-zinc-500">
            {cards.length} listing{cards.length === 1 ? "" : "s"}
          </span>
        </div>
      </form>

      <CardGrid title="Results" cards={cards} />
    </div>
  );
}
