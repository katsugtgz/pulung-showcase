import { getActiveHeroVariant, getCta, getHeroCopy } from "@/lib/copy";

/*
 * Hero — identitas banner Pulung yang diangkat ke digital.
 * Wordmark "PULUNG" merah di atas latar biru (mereplika banner jalan
 * 25 tahun mereka). Headline + subheadline + trust-bar chips + label CTA
 * semuanya dari modul @/lib/copy (sumber tunggal string Indonesia). Kedua CTA
 * berlabel WhatsApp (WhatsApp-first per riset copy) dan menuju #lokasi — di
 * sana tiap kartu cabang punya tautan WhatsApp yang dirutekan ke admin kluster
 * yang BENAR (wa-router). Hero sengaja TIDAK menautkan langsung ke satu nomor:
 * ada dua cabang utama (satu per kluster), jadi inkuiri generik teratas harus
 * lewat pemilih area agar tidak salah kluster (bug bisnis). Murni CSS — tanpa
 * gambar berat agar Lighthouse performance tetap >= 0.9.
 */
export function Hero() {
  const { subheadline, trustBar } = getHeroCopy();
  const headline = getActiveHeroVariant().headline;
  const cta = getCta();

  return (
    <header className="relative overflow-hidden bg-primary px-6 pb-12 pt-14 text-center text-white lg:px-8 lg:pb-20 lg:pt-20">
      {/* Aksen sudut — meniru potongan banner jalan */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-light/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-accent/10"
      />

      <div className="relative mx-auto flex max-w-md lg:max-w-7xl flex-col items-center lg:flex-row lg:gap-12 lg:text-left">
        {/* Kolom kiri: eyebrow → wordmark → headline → subheadline → CTA */}
        <div className="lg:flex-1 lg:text-left">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
            Kursus Mengemudi
          </p>

          {/* Wordmark PULUNG — merah di atas biru, identitas banner */}
          <h1 className="select-none text-6xl lg:text-7xl font-black tracking-tight text-accent drop-shadow-sm">
            PULUNG
          </h1>

          {/* Headline PAS aktif + subheadline dari @/lib/copy */}
          <p className="mt-4 text-balance text-lg font-medium leading-snug text-white lg:text-2xl">
            {headline}
          </p>
          <p className="mt-2 text-balance text-sm leading-relaxed text-white/90 lg:text-base">
            {subheadline}
          </p>

          {/* CTA — label WhatsApp dari @/lib/copy; keduanya menuju #lokasi
              (pemilih area) agar routing kluster WhatsApp selalu benar. */}
          <div className="mt-8 flex w-full flex-col gap-3 lg:max-w-md lg:flex-row">
            <a
              href="#lokasi"
              className="w-full rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-dark active:scale-[0.99]"
            >
              {cta.primary}
            </a>
            <a
              href="#lokasi"
              className="w-full rounded-xl border-2 border-white/40 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/10 active:scale-[0.99]"
            >
              {cta.secondary}
            </a>
          </div>
        </div>

        {/* Kolom kanan: trust-bar chips dari @/lib/copy */}
        <div className="mt-8 lg:mt-0 lg:w-72 lg:flex-shrink-0">
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {trustBar.map((chip) => (
              <li
                key={chip.id}
                className="rounded-full border border-white/40 px-3 py-1 text-xs font-medium text-white"
              >
                {chip.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Lengkungan transisi ke strip kredibilitas */}
      <div
        aria-hidden="true"
        className="absolute -bottom-px left-0 right-0 h-6 rounded-t-[2rem] bg-neutral-50"
      />
    </header>
  );
}
