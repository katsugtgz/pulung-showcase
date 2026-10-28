import { getSectionBody, getSectionHeader, getCta } from "@/lib/copy";
import { ArrowRightIcon } from "@/components/landing/icons";
import Image from "next/image";
import { getSticker } from "@/lib/illustrations";

/*
 * Final-cta — satu-satunya penutup konversi setelah FAQ.
 *
 * Redesign "rambu": penutup = rambu STOP besar. Bidang biru dengan marka
 * garis tepi solid (bukan blob blur), H2 display kondensasi oversized,
 * CTA merah eksklusif. Stiker graduation_car tetap informatif (alt asli,
 * bukan aria-hidden). href #lokasi (routing klaster — business-critical).
 */
export function FinalCta() {
  const cta = getCta();
  const header = getSectionHeader("final-cta");
  const body = getSectionBody("final-cta");
  const graduationCar = getSticker("graduation_car");

  return (
    <section
      id="final-cta"
      aria-label="Penutup — mulai kursus mengemudi Anda"
      className="relative overflow-hidden bg-primary px-6 py-16 text-white lg:px-8 lg:py-24"
    >
      {/* Road edge markings — solid white edge lines top & bottom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 top-6 h-1 bg-white/25"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-0 right-0 h-1 bg-white/25"
      />

      <div className="relative mx-auto max-w-md lg:max-w-3xl">
        <div className="text-center">
          <div className="mx-auto mb-6 flex select-none justify-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-md border-2 border-white/80 bg-white p-1 shadow-lg shadow-primary-dark/30">
              <Image
                src={graduationCar.src}
                alt={graduationCar.alt}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          </div>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold uppercase leading-[1.02] tracking-tight text-white sm:text-4xl lg:text-5xl">
            {header}
          </h2>
          <div
            aria-hidden="true"
            className="road-line-x mx-auto mt-5 w-32 [--road-color:#fff]"
          />
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/90 lg:text-base">
            {body}
          </p>

          {/*
            Satu CTA merah (design-contract §3). href #lokasi — bukan wa.me
            langsung (routing klaster via LocationPicker). py-3.5 + text-base
            = ~52px touch target (WCAG 2.5.5).
          */}
          <a
            href={cta.primaryHref}
            className="t-action group mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-accent px-8 py-3.5 text-base font-bold uppercase tracking-wide text-white shadow-lg shadow-accent/30 transition hover:bg-accent-dark hover:shadow-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.99]"
          >
            {cta.primary}
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
