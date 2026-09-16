import type { ListingCard } from "@/lib/queries";
import { CardTile } from "./CardTile";

export function CardGrid({
  title,
  subtitle,
  cards,
}: {
  title: string;
  subtitle?: string;
  cards: ListingCard[];
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
        ) : null}
      </div>
      {cards.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
          No cards in this section. Run <code className="text-zinc-300">npm run db:seed</code>.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {cards.map((c) => (
            <CardTile key={c.slug} card={c} />
          ))}
        </div>
      )}
    </section>
  );
}
