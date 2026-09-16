import Link from "next/link";

const nav = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0d12]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-bold text-black shadow-lg shadow-violet-500/20">
            ◆
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide text-white group-hover:text-violet-200">
              Collectibles
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Pokémon TCG · Demo
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
