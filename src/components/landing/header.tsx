import Link from "next/link";

/*
 * Header — bilah navigasi tipis di puncak landing. Memakai bg-primary yang
 * sama dengan Hero sehingga membaca sebagai "pinggiran atas" banner biru
 * Pulung yang kontinu, tanpa seam. Sticky agar tautan auth selalu terjangkau
 * saat scroll.
 *
 * Wordmark lockup ADR-004: sejak hero wordmark dipindah ke pill putih (kontras
 * ~5:1 vs rasio lama ~1.03:1), Header ikut menggunakan lockup yang sama agar
 * tiga permukaan wordmark (hero / header / footer) konsisten. Tanpa ini,
 * Lighthouse color-contrast akan tetap flag header wordmark (satu-satunya
 * kontras-gagal yang tersisa di landing).
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
 *   mereplika identitas banner jalan 25 tahun Pulung.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-primary px-6 py-3 text-white lg:px-8">
      <div className="mx-auto flex max-w-md lg:max-w-7xl items-center justify-between gap-3">
        {/*
          * Wordmark — pill lockup ADR-004 (konsisten dengan Hero & Footer).
          * Wordmark merah #D22B3A TIDAK lagi diletakkan langsung di atas
          * bg-primary (rasio ~1.03:1, gagal WCAG 3:1 large-text). Pill putih
          * memberi kontras ~5:1 (lulus) tanpa mengubah warna wordmark.
          * Compact sizing (badge h-6 w-6 + text-xl) agar muat di sticky bar
          * py-3. Focus ring putih + offset biru (story #21).
          * Komposisi: anchor nav selalu mengikuti jejak Hero (#packages,
          * #lokasi, #faq).
          */}
        <Link
          href="/"
          aria-label="Pulung — beranda"
          className="inline-flex select-none items-center gap-2 rounded-full bg-white py-1 pl-1.5 pr-4 shadow-md shadow-primary-dark/30 ring-1 ring-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[0.65rem] font-black text-white"
          >
            P
          </span>
          <span className="text-xl font-black tracking-tight text-accent lg:text-2xl">
            PULUNG
          </span>
        </Link>

        {/* Nav anchor ke section landing — hanya tampil di desktop */}
        <nav aria-label="Navigasi utama" className="hidden gap-6 lg:flex">
          <Link
            href="#packages"
            className="rounded-md text-sm font-medium text-white/90 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Paket
          </Link>
          <Link
            href="#lokasi"
            className="rounded-md text-sm font-medium text-white/90 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Lokasi
          </Link>
          <Link
            href="#faq"
            className="rounded-md text-sm font-medium text-white/90 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            FAQ
          </Link>
        </nav>

        {/* Tautan auth statis — menuju halaman Clerk yang di-render terpisah */}
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="rounded-lg border border-white/50 px-3 py-1.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.98]"
          >
            Masuk
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-bold text-white shadow-sm shadow-accent/30 transition hover:bg-accent-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.98]"
          >
            Daftar
          </Link>
        </div>
      </div>
    </header>
  );
}
