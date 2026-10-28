/*
 * "Cara Kerja" — tiga langkah alur Pulung (issue #50 story #9):
 *   1. Pilih Paket (Manual / Matic / Campuran)
 *   2. Pilih Cabang (5 cabang, 2 klaster)
 *   3. Chat Admin via WhatsApp (ter-routing ke klaster yang benar)
 *
 * Redesign "rambu": langkah disusun sebagai *rute* — rail putus-putus
 * (marka jalan) menghubungkan badge nomor rute 1→2→3 (urutan asli, jadi
 * penomoran sah), judul langkah memakai huruf display kondensasi, dan
 * stiker tetap sebagai chip kecil dekoratif. Semua teks dari
 * `@/lib/copy`; sticker + divider dari `@/lib/illustrations` (kontrak
 * dekoratif: alt="" di dalam aria-hidden — lihat __tests__).
 */
import { getCaraKerja, getSectionBody, getSectionHeader } from "@/lib/copy";
import { NumberBadge } from "@/components/landing/icons";
import Image from "next/image";
import { getSticker } from "@/lib/illustrations";

const STEP_NUMBERS = [1, 2, 3] as const;
const STEP_STICKER_SLUGS = [
  "steering_wheel",
  "traffic_cone",
  "seatbelt_buckle",
] as const;

export function CaraKerja() {
  const steps = getCaraKerja();
  const header = getSectionHeader("cara-kerja");
  const body = getSectionBody("cara-kerja");
  const windingRoad = getSticker("winding_road");

  return (
    <section
      id="cara-kerja"
      aria-labelledby="cara-kerja-heading"
      className="scroll-mt-24 bg-neutral-50 px-6 py-12 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-md lg:max-w-6xl">
        <div className="max-w-2xl">
          <h2
            id="cara-kerja-heading"
            className="font-display text-3xl font-semibold uppercase leading-none tracking-tight text-neutral-900 lg:text-4xl"
          >
            {header}
          </h2>
          <div
            aria-hidden="true"
            className="road-line-x mt-4 max-w-40"
          />
          <p className="mt-4 text-sm leading-relaxed text-neutral-600 lg:text-base">
            {body}
          </p>
        </div>

        {/* Road divider sticker (decorative) */}
        <div
          aria-hidden="true"
          className="mx-auto mt-8 hidden select-none justify-center lg:flex"
        >
          <div className="relative h-16 w-64 overflow-hidden rounded-md border border-neutral-200 bg-white p-1 shadow-sm">
            <Image
              src={windingRoad.src}
              alt=""
              fill
              sizes="256px"
              className="object-cover"
            />
          </div>
        </div>

        {/*
          Rute 1→2→3: rail marka putus-putus horizontal di belakang badge
          (lg); di mobile rail vertikal di kiri. Nomor rute = urutan asli.
        */}
        <ol className="relative mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {/* Horizontal rail — desktop only, sits behind the route badges */}
          <div
            aria-hidden="true"
            className="road-line-x pointer-events-none absolute left-16 right-16 top-7 hidden opacity-40 [--road-color:var(--color-primary)] sm:block"
          />
          {/* Vertical rail — mobile only */}
          <div
            aria-hidden="true"
            className="road-line-y pointer-events-none absolute bottom-10 left-7 top-2 sm:hidden opacity-40"
          />

          {steps.map((step, i) => (
            <li key={step.id} className="relative">
              <div className="flex items-center gap-4 sm:flex-col sm:items-start">
                {/* Route badge — blue sign square with white border ring */}
                <span className="relative z-10 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md bg-primary text-white shadow-md ring-4 ring-neutral-50">
                  <NumberBadge
                    number={STEP_NUMBERS[i]}
                    className="h-8 w-8"
                  />
                </span>

                {/* Stiker langkah — dekoratif (alt="", aria-hidden) */}
                <div
                  aria-hidden="true"
                  className="relative h-14 w-14 select-none overflow-hidden rounded-md border border-neutral-200 bg-white p-1 shadow-sm sm:hidden lg:block"
                >
                  <Image
                    src={getSticker(STEP_STICKER_SLUGS[i]!).src}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-display text-xl font-bold uppercase leading-none tracking-wide text-neutral-900 lg:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 lg:text-base">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
