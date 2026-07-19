/*
 * "Cara Kerja" — penjelasan tiga langkah alur Pulung (issue #50 story #9):
 *   1. Pilih Paket (Manual / Matic / Campuran)
 *   2. Pilih Cabang (5 cabang, 2 klaster)
 *   3. Chat Admin via WhatsApp (ter-rouging ke klaster yang benar)
 *
 * Server Component — tidak ada state/effect. Header + body + tiga langkah
 * semuanya dari `@/lib/copy` (`getSectionHeader`, `getSectionBody`,
 * `getCaraKerja`). NumberBadge dari kosakata ikon bersama di
 * `@/components/landing/icons`. Pada mobile kartu menumpuk vertikal; pada
 * `lg` ketiga langkah berjajar dengan garis penghubung horizontal yang
 * menegaskan urutan 1 → 2 → 3.
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
      className="scroll-mt-24 bg-white px-6 py-10 lg:px-8 lg:py-16"
    >
      <div className="mx-auto max-w-md lg:max-w-7xl">
        <h2
          id="cara-kerja-heading"
          className="text-center text-2xl lg:text-3xl font-bold tracking-tight text-neutral-900"
        >
          {header}
        </h2>
        <p className="mt-3 text-center text-sm leading-relaxed text-neutral-600 lg:mx-auto lg:max-w-2xl lg:text-base">
          {body}
        </p>
        {/* Road divider sticker */}

        <div
          aria-hidden="true"
          className="mx-auto mt-6 hidden select-none justify-center lg:flex"
        >
          <div className="relative h-16 w-64 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm">
            <Image
              src={windingRoad.src}
              alt=""
              fill
              sizes="256px"
              className="object-cover"
            />
          </div>
        </div>

        <ol className="relative mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4 lg:mt-10 lg:gap-8">
          {/* Horizontal connector — visible only at lg, sits behind the badges */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-neutral-200 lg:block"
          />
          {steps.map((step, i) => (
            <li
              key={step.id}
              className="relative flex flex-col items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:items-center sm:text-center lg:p-6"
            >
              <div className="flex w-full items-center justify-between sm:justify-center sm:gap-4">
                <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                  <NumberBadge
                    number={STEP_NUMBERS[i]}
                    className="h-8 w-8"
                  />
                </span>
                <div
                  aria-hidden="true"
                  className="relative h-14 w-14 select-none overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm"
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
              <div className="sm:mt-1">
                <h3 className="text-base font-semibold leading-tight text-neutral-900 lg:text-lg">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 lg:text-base">
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
