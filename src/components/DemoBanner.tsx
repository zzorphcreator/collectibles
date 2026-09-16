export function DemoBanner() {
  return (
    <div className="border-b border-sky-500/30 bg-sky-500/10 px-4 py-2 text-center text-xs text-sky-100/90 sm:text-sm">
      <span className="font-medium text-sky-50">Live latest · illustrative history.</span>{" "}
      Newest price per card is TCGPlayer market via Pokémon TCG API; sparklines / 7d / 30d
      prior points are illustrative until daily ingest accumulates.{" "}
      <a href="/about" className="underline decoration-sky-400/50 underline-offset-2 hover:text-white">
        About
      </a>
    </div>
  );
}
