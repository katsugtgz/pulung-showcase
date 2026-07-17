import Link from "next/link";

/*
 * Hero — identitas banner Pulung yang diangkat ke digital.
 * Wordmark "PULUNG" merah di atas latar biru (mereplika banner jalan
 * 25 tahun mereka). Tagline + dua CTA: Daftar Sekarang (-> /sign-in) dan
 * Lihat Paket (smooth-scroll ke #packages). Murni CSS — tanpa gambar berat
 * agar Lighthouse performance tetap >= 0.9.
 */
export function Hero() {
  return (
    <header className="relative overflow-hidden bg-primary px-6 pb-12 pt-14 text-center text-white">
      {/* Aksen sudut — meniru potongan banner jalan */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-light/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-accent/10"
      />

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          Kursus Mengemudi
        </p>

        {/* Wordmark PULUNG — merah di atas biru, identitas banner */}
        <h1 className="select-none text-6xl font-black tracking-tight text-accent drop-shadow-sm">
          PULUNG
        </h1>

        <p className="mt-4 text-balance text-lg font-medium leading-snug text-white">
          Kursus Mengemudi Terpercaya sejak 2000
        </p>
        <p className="mt-2 text-sm text-white/80">
          Safe Drive Training &middot; Surabaya
        </p>

        {/* CTA */}
        <div className="mt-8 flex w-full flex-col gap-3">
          <Link
            href="/sign-in"
            className="w-full rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-dark active:scale-[0.99]"
          >
            Daftar Sekarang
          </Link>
          <a
            href="#packages"
            className="w-full rounded-xl border-2 border-white/40 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/10 active:scale-[0.99]"
          >
            Lihat Paket
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
