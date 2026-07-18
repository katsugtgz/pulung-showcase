"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { TABS, isActive } from "@/components/app-shell/tabs";

/*
 * AppHeader — header desktop (lg+ only). Bilah sticky bg-primary konsisten
 * dengan Header landing agar area app terbaca sebagai "layan bermerek Pulung"
 * yang kontinu. Wordmark pill disalin dari src/components/landing/header.tsx
 * (lines 38-52).
 *
 * Berisi:
 *   - Wordmark pill PULUNG (kiri)
 *   - 4 tautan siswa inline (Beranda/Jadwal/Invoice/Kartu) — text-white/90
 *     hover:text-white; active state font-semibold + underline underline-offset-4
 *   - <UserButton/> Clerk untuk profil/sign-out (kanan)
 *
 * Hidden di bawah lg — mobile memakai <BottomNav/> sebagai navigasi utama.
 * Client Component karena usePathname + UserButton (Clerk sisi-klien).
 */
export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 hidden bg-primary px-6 py-3 text-white lg:block">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="PULUNG — beranda"
          className="inline-flex select-none items-center gap-2 rounded-full bg-white py-1 pl-1.5 pr-4 shadow-md shadow-primary-dark/30 ring-1 ring-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[0.65rem] font-black text-white"
          >
            P
          </span>
          <span className="text-xl font-black tracking-tight text-accent">
            PULUNG
          </span>
        </Link>

        <nav aria-label="Navigasi utama siswa" className="flex gap-6">
          {TABS.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "text-sm font-semibold text-white underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                    : "rounded-md text-sm font-medium text-white/90 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <UserButton />
      </div>
    </header>
  );
}
