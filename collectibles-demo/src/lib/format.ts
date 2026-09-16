export function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n >= 100 ? 0 : 2,
  }).format(n);
}

export function formatPct(n: number | null): string {
  if (n === null || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

export function conditionLabel(code: string): string {
  switch (code) {
    case "raw_nm":
      return "Raw NM";
    case "psa_10":
      return "PSA 10";
    case "cgc_10":
      return "CGC 10";
    default:
      return code;
  }
}

export function sourceLabel(code: string): string {
  switch (code) {
    case "tcgplayer":
      return "TCGPlayer";
    case "pricecharting":
      return "PriceCharting";
    case "psa":
      return "PSA";
    case "cgc":
      return "CGC";
    default:
      return code;
  }
}

export function formatPulledAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function slugify(parts: string[]): string {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
