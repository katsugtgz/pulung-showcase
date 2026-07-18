import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-shell/header";
import { BottomNav } from "@/components/app-shell/bottom-nav";

/*
 * AppShell — navigasi tetap untuk grup (app) /app/*, dipasang sekali di
 * src/app/(app)/layout.tsx (resolusi issue #42 / #59).
 *
 * Tiga permukaan:
 *
 *   1. <AppHeader/> — header desktop (lg+). Bilah sticky bg-primary dengan
 *      wordmark pill PULUNG (pola src/components/landing/header.tsx), 4 tautan
 *      siswa inline (Beranda/Jadwal/Invoice/Kartu) dengan active state
 *      font-semibold + underline, dan <UserButton/> Clerk untuk profil/sign-out.
 *      Hidden di bawah lg.
 *
 *   2. <main> — kontainer konten max-w-md (mobile) lg:max-w-3xl (desktop),
 *      dengan pb-24 untuk clearance bottom nav di mobile.
 *
 *   3. <BottomNav/> — bottom tab bar (mobile/tablet, lg:hidden). 4 ikon + label
 *      text-[10px], warna active biru primary. Fixed bottom + safe-area inset
 *      untuk home indicator iOS.
 *
 * Spec #59: tab adalah Beranda (/app) / Jadwal (/app/jadwal) /
 * Invoice (/app/invoice) / Kartu (/app/kartu). /app/cara-pakai BUKAN tab
 * dan tetap ditautkan dari dasbor Home. Profile ditangani <UserButton/> Clerk,
 * BUKAN tab terpisah (deviasi eksplisit dari stitch yang punya slot Profil).
 *
 * Server Component (default) — tidak butuh "use client" sendiri; AppHeader &
 * BottomNav sudah "use client" di file-nya masing-masing.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-50">
      <AppHeader />
      <main className="mx-auto max-w-md px-4 pb-24 pt-8 lg:max-w-3xl lg:px-8 lg:pb-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
