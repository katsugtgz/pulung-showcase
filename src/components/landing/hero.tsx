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

      {/*
        Mobile: flex-col dengan THREE flex item agar urutan visual cocok dengan
        spec §3/§11 (eyebrow → wordmark → headline → subheadline → chips → CTA).
        Desktop: grid dua-kolom — chips di kolom kanan (row-span-2, self-center),
        teks di kolom kiri baris 1, CTA di kolom kiri baris 2. Tanpa trik ini
        CTA muncul sebelum chips di mobile karena CTA ikut kolom kiri.
      */}
      <div className="relative mx-auto flex max-w-md flex-col items-center lg:max-w-7xl lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12 lg:text-left">
        {/* Teks — order 1 di mobile, kolom-1/baris-1 di desktop */}
        <div className="order-1 lg:col-start-1 lg:row-start-1 lg:text-left">
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
        </div>

        {/*
          Trust-bar chips — order 2 di mobile (ANTARA subheadline dan CTA,
          sesuai spec §3); kolom-2/baris-1 dengan row-span-2 + self-center di
          desktop agar vertikal tengah terhadap gabungan teks + CTA.
        */}
        <div className="order-2 mt-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:w-72 lg:flex-shrink-0 lg:self-center">
          <ul className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
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

        {/* CTA — order 3 di mobile (setelah chips); kolom-1/baris-2 di desktop */}
        <div className="order-3 mt-8 flex w-full flex-col gap-3 lg:col-start-1 lg:row-start-2 lg:mt-8 lg:max-w-md lg:flex-row">
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

      {/* Lengkungan transisi ke strip kredibilitas */}
      <div
        aria-hidden="true"
        className="absolute -bottom-px left-0 right-0 h-6 rounded-t-[2rem] bg-neutral-50"
      />
    </header>
  );
}
