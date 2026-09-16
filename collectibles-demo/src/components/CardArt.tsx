"use client";

import { useState } from "react";

export function CardArt({
  src,
  alt,
  className = "",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <div
        className={`relative flex aspect-[2.5/3.5] items-end overflow-hidden rounded-xl bg-gradient-to-br from-violet-950 via-zinc-900 to-cyan-950 ${className}`}
      >
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_20%,rgba(167,139,250,0.35),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(34,211,238,0.25),transparent_40%)]" />
        <div className="relative w-full p-3">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">
            Placeholder
          </div>
          <div className="truncate text-sm font-medium text-zinc-200">{alt}</div>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`aspect-[2.5/3.5] w-full rounded-xl object-cover shadow-lg shadow-black/40 ${className}`}
    />
  );
}
