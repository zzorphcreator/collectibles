import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DemoBanner } from "@/components/DemoBanner";
import { Header } from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Collectibles · Pokémon TCG Discovery (Demo)",
  description:
    "Read-only local demo for browsing trending and gaining-value Pokémon TCG cards. Sample data only.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <DemoBanner />
        <Header />
        <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500">
          Local demo · read-only · prices are sample data · schema ready for bot snapshots
        </footer>
      </body>
    </html>
  );
}
