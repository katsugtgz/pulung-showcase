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
    <header className="sticky top-0 z-30 border-b border-white/15 bg-primary px-6 py-3 text-white lg:px-8">
      <div className="mx-auto flex max-w-md lg:max-w-7xl items-center justify-between gap-3">
        {/*
          Wordmark — pill lockup ADR-004 (konsisten dengan Hero & Footer).
          Wordmark merah #D22B3A TIDAK lagi diletakkan langsung di atas
          bg-primary (rasio ~1.03:1, gagal WCAG 3:1 large-text). Pill putih
          memberi kontras ~5:1 (lulus) tanpa mengubah warna wordmark.
          Compact sizing (badge h-6 w-6 + text-xl) agar muat di sticky bar
          py-3. Focus ring putih + offset biru (story #21).
        */}
        <Link
          href="/"
          aria-label="P PULUNG — beranda"
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

        {/* Desktop nav (lg+) — Paket, Cara Kerja, Lokasi, FAQ */}
        <nav aria-label="Navigasi utama" className="hidden gap-6 lg:flex">
          <Link
            href="#packages"
            className="t-nav-link rounded-md text-sm font-medium text-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Paket
          </Link>
          <Link
            href="#cara-kerja"
            className="t-nav-link rounded-md text-sm font-medium text-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Cara Kerja
          </Link>
          <Link
            href="#lokasi"
            className="t-nav-link rounded-md text-sm font-medium text-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Lokasi
          </Link>
          <Link
            href="#faq"
            className="t-nav-link rounded-md text-sm font-medium text-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            FAQ
          </Link>
        </nav>

        {/*
          Auth links — static <Link> to /sign-in + /sign-up (ADR-002: landing
          ships zero Clerk JS). On mobile, these are demoted to compact
          text-link treatment so the course-discovery pill nav below gets
          the visual priority (issue #50 ticket #55). Desktop keeps the
          button treatment.
        */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/sign-in"
            className="t-header-action rounded-md px-2 py-1 text-xs font-semibold text-white/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:rounded-lg sm:border sm:border-white/50 sm:px-3 sm:py-1.5 sm:text-sm sm:text-white"
          >
            Masuk
          </Link>
          <Link
            href="/sign-up"
            className="t-header-action rounded-md bg-accent/90 px-2 py-1 text-xs font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-sm sm:shadow-sm sm:shadow-accent/30"
          >
            Daftar
          </Link>
        </div>
      </div>

      {/*
        Mobile anchor nav (issue #50 ticket #55). Compact horizontally-
        scrollable pill row visible only below lg. Gives mobile users
        reach to Paket / Cara Kerja / Lokasi / FAQ without scrolling back
        to the hero. Course-discovery priority over Masuk/Daftar (which
        are demoted above). aria-label matches the desktop nav contract
        so screen readers announce both as the same landmark type when
        the user toggles breakpoints.
      */}
      <nav
        aria-label="Navigasi section (mobile)"
        className="lg:hidden"
      >
        {/*
          Mobile anchor pills. Solid border + text-white (no bg-white/10 +
          backdrop-blur — that combo lowered effective contrast below WCAG
          4.5:1 on the primary field per Lighthouse color-contrast audit).
          Hover/focus state lifts to bg-white/20 for affordance.
        */}
        <ul className="mx-auto flex max-w-md gap-2 overflow-x-auto pb-1 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <li className="flex-shrink-0">
            <Link
              href="#packages"
              className="inline-flex items-center rounded-full border border-white/50 bg-white/25 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.98]"
            >
              Paket
            </Link>
          </li>
          <li className="flex-shrink-0">
            <Link
              href="#cara-kerja"
              className="inline-flex items-center rounded-full border border-white/50 bg-white/25 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.98]"
            >
              Cara Kerja
            </Link>
          </li>
          <li className="flex-shrink-0">
            <Link
              href="#lokasi"
              className="inline-flex items-center rounded-full border border-white/50 bg-white/25 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.98]"
            >
              Lokasi
            </Link>
          </li>
          <li className="flex-shrink-0">
            <Link
              href="#faq"
              className="inline-flex items-center rounded-full border border-white/50 bg-white/25 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.98]"
            >
              FAQ
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
