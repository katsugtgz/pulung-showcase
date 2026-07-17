import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

/*
 * Header — bilah navigasi tipis di puncak landing. Memakai bg-primary yang
 * sama dengan Hero sehingga membaca sebagai "pinggiran atas" banner biru
 * Pulung yang kontinu, tanpa seam. Sticky agar kontrol auth (Masuk/Daftar
 * untuk tamu; avatar + Dasbor untuk pengguna) selalu terjangkau saat scroll.
 *
 * Keputusan desain (pilihan a — top bar di atas Hero):
 *   Hero sudah full-bleed bg-primary dari puncak halaman. Bar putah/transparan
 *   di atasnya akan memotong permukaan biru. Dengan bg-primary yang cocok,
 *   Header menyatu mulus ke tepi atas Hero — satu banner biru kontinu yang
 *   mereplika identitas banner jalan 25 tahun Pulung. Pill mengambang (b)
 *   menambah kompleksitas; modifikasi Hero (c) melanggar pemisahan komponen.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-primary px-6 py-3 text-white">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        {/* Wordmark — merah di atas biru, konsisten dengan Hero & Footer */}
        <Link
          href="/"
          className="select-none text-2xl font-black tracking-tight text-accent"
          aria-label="Pulung — beranda"
        >
          PULUNG
        </Link>

        {/* Kontrol auth — kondisional via <Show> Clerk */}
        <div className="flex items-center gap-2">
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/40 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/10 active:scale-[0.98]"
            >
              Dasbor
            </Link>
            <UserButton />
          </Show>

          <Show when="signed-out">
            <SignInButton>
              <button
                type="button"
                className="rounded-lg border border-white/50 px-3 py-1.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 active:scale-[0.98]"
              >
                Masuk
              </button>
            </SignInButton>
            <SignUpButton>
              <button
                type="button"
                className="rounded-lg bg-accent px-3 py-1.5 text-sm font-bold text-white shadow-sm shadow-accent/30 transition hover:bg-accent-dark active:scale-[0.98]"
              >
                Daftar
              </button>
            </SignUpButton>
          </Show>
        </div>
      </div>
    </header>
  );
}
