import { getSectionBody, getSectionHeader, getCta } from "@/lib/copy";
import { ArrowRightIcon } from "@/components/landing/icons";

/*
 * Final-cta — satu-satunya penutup konversi setelah FAQ (issue #50 ticket
 * #57). Tujuan: ulangi sekali tujuan kontak (#lokasi) tanpa menambah aksi
 * saingan di setiap section.
 *
 * Surface: bg-primary (the legal third primary band per design-contract §5;
 * hero is the first, the experience-band is the second, footer uses
 * neutral-900 not primary). Pola visual mirror Hero (split + banner motif)
 * supaya pembacaan sebagai "penutup banner biru".
 *
 * Copy: H2 + body dari @/lib/copy (sumber tunggal — tidak ada string
 * hardcode). Tombol utama memakai bg-accent (satu-satunya CTA merah di
 * viewport ini; design-contract §3 one-red-primary-CTA rule).
 *
 * Anchor: href ke #lokasi — mengembalikan pengunjung ke signature location
 * widget untuk routing klaster admin yang benar. Bukan wa.me langsung
 * (story #17, #38 — cluster routing is business-critical).
 */
export function FinalCta() {
  const cta = getCta();
  const header = getSectionHeader("final-cta");
  const body = getSectionBody("final-cta");

  return (
    <section
      id="final-cta"
      aria-label="Penutup — mulai kursus mengemudi Anda"
      className="relative overflow-hidden bg-primary px-6 py-14 text-white lg:px-8 lg:py-20"
    >
      {/* Aksen dekoratif — meniru motif banner Hero (dekoratif, aria-hidden). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-light/20 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
      />

      {/*
        Konten terpusat — penutup ceremonial, bukan section informasi.
        H1 dibawakan oleh Hero; di sini <h2> agar struktur heading halaman
        tetap rasional (satu H1 per page).
      */}
      <div className="relative mx-auto max-w-md lg:max-w-3xl">
        <div className="text-center">
          <h2 className="text-balance text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
            {header}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-sm leading-relaxed text-white/90 lg:text-base">
            {body}
          </p>

          {/*
            Satu CTA merah (design-contract §3). href #lokasi — bukan wa.me
            langsung (story #17, #38 — cluster routing via LocationPicker).
            py-3.5 + text-base = ~52px touch target (WCAG 2.5.5 floor 48px).
          */}
          <a
            href={cta.primaryHref}
            className="group mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-dark hover:shadow-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.99]"
          >
            {cta.primary}
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
