import Link from "next/link";

/*
 * Header — bilah navigasi tipis di puncak landing. Memakai bg-primary yang
 * sama dengan Hero sehingga membaca sebagai "pinggiran atas" banner biru
 * Pulung yang kontinu, tanpa seam. Sticky agar tautan auth selalu terjangkau
 * saat scroll.
 *
 * Kontrol auth sengaja berupa <Link> statis ke /sign-in dan /sign-up (BUKAN
 * komponen Clerk sisi-klien). Landing publik harus bebas JS & handshake Clerk
 * demi skor Lighthouse; kontrol akun terautentikasi (UserButton/keluar) pindah
 * ke dasbor. Lihat DECISIONS.md ADR-002.
 *
 * Keputusan desain (pilihan a — top bar di atas Hero):
 *   Hero sudah full-bleed bg-primary dari puncak halaman. Bar putih/transparan
 *   di atasnya akan memotong permukaan biru. Dengan bg-primary yang cocok,
 *   Header menyatu mulus ke tepi atas Hero — satu banner biru kontinu yang
 *   mereplika identitas banner jalan 25 tahun Pulung. Pill mengambang (b)
 *   menambah kompleksitas; modifikasi Hero (c) melanggar pemisahan komponen.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-primary px-6 py-3 text-white lg:px-8">
      <div className="mx-auto flex max-w-md lg:max-w-7xl items-center justify-between gap-3">
        {/* Wordmark — merah di atas biru, konsisten dengan Hero & Footer */}
        <Link
          href="/"
          className="select-none text-2xl font-black tracking-tight text-accent"
          aria-label="Pulung — beranda"
        >
          PULUNG
        </Link>

        {/* Nav anchor ke section landing — hanya tampil di desktop */}
        <nav aria-label="Navigasi utama" className="hidden gap-6 lg:flex">
          <Link
            href="#packages"
            className="text-sm font-medium text-white/90 hover:text-white"
          >
            Paket
          </Link>
          <Link
            href="#lokasi"
            className="text-sm font-medium text-white/90 hover:text-white"
          >
            Lokasi
          </Link>
          <Link
            href="#faq"
            className="text-sm font-medium text-white/90 hover:text-white"
          >
            FAQ
          </Link>
        </nav>

        {/* Tautan auth statis — menuju halaman Clerk yang di-render terpisah */}
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="rounded-lg border border-white/50 px-3 py-1.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 active:scale-[0.98]"
          >
            Masuk
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-bold text-white shadow-sm shadow-accent/30 transition hover:bg-accent-dark active:scale-[0.98]"
          >
            Daftar
          </Link>
        </div>
      </div>
    </header>
  );
}
