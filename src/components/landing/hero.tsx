import Image from "next/image";
import { getActiveHeroVariant, getCta, getHeroCopy } from "@/lib/copy";
import { ArrowRightIcon } from "@/components/landing/icons";

/*
 * Hero — identitas banner Pulung yang diangkat ke digital.
 *
 * Komposisi:
 *   Mobile: vertikal — eyebrow → lockup wordmark → H1 manfaat → subheadline
 *           → trust chips → CTA → gambar placeholder.
 *   Desktop (lg+): split asimetris — kolom teks kiri + kolom gambar kanan.
 *
 * Wordmark "PULUNG" merah TIDAK lagi diletakkan langsung di atas biru
 * (rasio ~1.03:1, gagal WCAG 3:1 large-text). Sejak ADR-004 wordmark
 * diletakkan di atas permukaan terang tertahan (pill putih + ring soft)
 * sehingga kontras teks-merah-terhadap-latar naik ke ~5:1. Warna wordmark
 * tetap merah #D22B3A — hanya background yang berubah; identitas banner
 * dijaga (AGENTS.md anti-pattern: jangan rekolor wordmark).
 *
 * H1 adalah headline varian PAS aktif dari @/lib/copy (manfaat, BUKAN nama
 * brand). Wordmark menjadi brand lockup — terpisah dari H1 semantik (spec #50
 * user story #2 + implementation decision "hero H1 becomes a benefit-led
 * Indonesian headline").
 *
 * CTA: dua tujuan berbeda (spec #50 user stories #6, #7).
 *   - Primary   → #lokasi    (perjalanan kontak/admin, WhatsApp routing).
 *   - Secondary → #packages  (perbandingan paket).
 *   Bukan pilihan palsu — dua anchor berbeda. Label + href dari
 *   @/lib/copy getCta() (cta.primaryHref / cta.secondaryHref).
 *
 * Gambar: placeholder SVG 1:1 di /public/images/hero-placeholder.svg.
 * Dipakai <Image next/image> dengan rasio aspek dipesan (aspect-square) agar
 * tidak ada layout shift (story #43). priority=true (LCP-aware, no lazy).
 * Overlay "Contoh" wajib (story #37) karena belum ada foto resmi pemilik.
 * Tanpa runtime third-party asset call. unoptimized karena SVG sudah vektor.
 *
 * Hero TIDAK dibungkus <Reveal> (lihat src/components/AGENTS.md) — komponen
 * ini adalah LCP dan harus render instan.
 */

// Eyebrow label above the wordmark lockup. Static Indonesian label, not a
// claim — "Kursus Mengemudi" describes the business category (verified in
// contact.md + research brief). Inline structural copy, not body copy.
const EYEBROW = "Kursus Mengemudi";

// Placeholder image alt text — describes the SVG illustration honestly so
// screen reader users understand it is illustrative, not documentary.
const HERO_IMAGE_ALT =
  "Ilustrasi kursus mengemudi: setir mobil berwarna biru brand dengan lencana keamanan, bertindak sebagai gambar contoh";

export function Hero() {
  const { subheadline, trustBar } = getHeroCopy();
  const headline = getActiveHeroVariant().headline;
  const cta = getCta();

  return (
    <header className="relative overflow-hidden bg-primary px-6 pb-14 pt-10 text-white lg:px-8 lg:pb-20 lg:pt-16">
      {/* Aksen sudut — meniru potongan banner jalan. Dekoratif (aria-hidden). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-light/20 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
      />

      {/*
        Komposisi: mobile = flex-col (urutan DOM = urutan visual, dipatuhi
        spec §7); desktop = grid 2-kolom asimetris — teks kiri lebih lebar,
        gambar kanan. items-center agar kedua kolom sejajar secara vertikal.
      */}
      <div className="relative mx-auto flex max-w-md flex-col items-start lg:max-w-7xl lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
        {/* Kolom teks — semua copy + trust chips + CTA */}
        <div className="flex w-full flex-col items-start">
          {/* Eyebrow */}
          {/* text-white/95 (bukan /85) — di 12px ini adalah "normal text" WCAG,
              butuh ≥4.5:1. /85 → ~4.24:1 (gagal tipis); /95 → ~4.56:1 (lulus). */}
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/95">
            {EYEBROW}
          </p>

          {/*
            Brand lockup — wordmark PULUNG merah di atas pill putih.
            Kontras merah-ke-putih ~5:1 → lulus WCAG large-text 3:1
            (ADR-004). Wordmark TIDAK diubah warnanya; hanya permukaan di
            belakangnya yang berubah dari biru ke putih tertahan.
            Inline-flex + select-none agar drag-select tidak mengganggu.
            Badge "P" mini sebagai accent brand lockup (dekoratif).
          */}
          <div className="mt-3 inline-flex select-none items-center gap-2.5 rounded-full bg-white py-1.5 pl-2 pr-5 shadow-lg shadow-primary-dark/30 ring-1 ring-black/5">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-black text-white"
            >
              P
            </span>
            <span className="text-2xl font-black tracking-tight text-accent lg:text-3xl">
              PULUNG
            </span>
          </div>

          {/*
            H1 — headline varian PAS aktif (manfaat, BUKAN "PULUNG"). Ini
            adalah heading semantik halaman; wordmark di atas menjadi
            brand lockup, bukan H1. text-balance agar baris tidak canggung.
          */}
          <h1 className="mt-5 text-balance text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {headline}
          </h1>

          {/* Subheadline — detail pendukung */}
          <p className="mt-4 max-w-xl text-balance text-base leading-relaxed text-white/90 lg:text-lg">
            {subheadline}
          </p>

          {/*
            Trust-bar chips — dipertahankan dari desain sebelumnya; sekarang
            menyertai kolom teks. Border-only agar teks putih tetap di atas
            biru (tidak ada frost glass yang menurunkan kontras).
          */}
          <ul className="mt-6 flex flex-wrap gap-2">
            {trustBar.map((chip) => (
              <li
                key={chip.id}
                className="rounded-full border border-white/45 px-3 py-1 text-xs font-medium text-white"
              >
                {chip.label}
              </li>
            ))}
          </ul>

          {/*
            CTA — dua tujuan berbeda (spec §5). Primary accent red menuju
            cta.primaryHref (#lokasi, kontak/admin); secondary outline putih
            menuju cta.secondaryHref (#packages, perbandingan paket). Ikon
            ArrowRight menegaskan arah tindakan pada primary. Mobile stack
            vertikal; sm+ row.
          */}
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
            <a
              href={cta.primaryHref}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-dark hover:shadow-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.99]"
            >
              {cta.primary}
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href={cta.secondaryHref}
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/45 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:border-white/80 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.99]"
            >
              {cta.secondary}
            </a>
          </div>
        </div>

        {/*
          Kolom gambar — placeholder 1:1. aspect-square memesan rasio aspek
          sebelum gambar dimuat (CLS = 0, story #43). <Image> dengan fill
          agar responsif terhadap kontainer; priority true agar LCP-aware
          (preload); unoptimized karena SVG tidak perlu optimasi next/image.
          Overlay "Contoh" wajib (story #37) karena belum ada foto resmi
          pemilik. Pada mobile gambar muncul setelah CTA (di luar lipat awal)
          — spec §7 mengizinkan ini untuk menjaga LCP teks H1.
        */}
        <div className="relative mt-10 aspect-square w-full overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15 lg:mt-0">
          <Image
            src="/images/hero-placeholder.svg"
            alt={HERO_IMAGE_ALT}
            fill
            priority
            unoptimized
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
          {/* Overlay "Contoh" — tetap nampak di atas gambar. Posisi bottom-left
              agar tidak menabrak lencana safety-shield / car di sudut atas SVG. */}
          <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-900/65 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-accent"
            />
            Contoh
          </span>
        </div>
      </div>

      {/* Lengkungan transisi ke strip kredibilitas (netral-50). */}
      <div
        aria-hidden="true"
        className="absolute -bottom-px left-0 right-0 h-6 rounded-t-[2rem] bg-neutral-50"
      />
    </header>
  );
}
