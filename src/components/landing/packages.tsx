import Link from "next/link";
import { getPackages } from "@/lib/catalog-data";
import type { Package, TransmissionType } from "@/lib/catalog-data";
import { getSamplePriceDisclaimer, getSectionBody, getSectionHeader } from "@/lib/copy";
import { formatIDR } from "@/lib/format";
import Image from "next/image";
import { getSticker } from "@/lib/illustrations";
import {
  CheckIcon,
  transmissionIconByKey,
} from "@/components/landing";

const TRANSMISSION_LABEL: Record<TransmissionType, string> = {
  manual: "Manual",
  matic: "Matic",
  mixed: "Campuran",
};

/*
 * Paket (#packages) — tiga kartu dari getPackages(): Manual, Matic, Kombinasi.
 *
 * Redesign "rambu": kartu = rambu arah. Kombinasi (mixed) menjadi rambu
 * utama — permukaan biru penuh dengan teks putih (diferensiasi premium tanpa
 * klaim "populer", story #13), Manual/Matic tetap kartu putih. Data sesi/
 * durasi/kendaraan disusun sebagai dl tiga kolom tanpa chrome kartu —
 * pemisah garis saja (plate data). Harga besar memakai angka display
 * kondensasi. Teks Bahasa Indonesia dan sumber data tidak berubah.
 */

const TRANSMISSION_CHIP_CLASS: Record<TransmissionType, string> = {
  manual: "border-neutral-300 bg-white text-neutral-700",
  matic: "border-neutral-300 bg-white text-neutral-700",
  // Kombinasi chip di kartu biru: kontras putih.
  mixed: "border-white/40 bg-white/15 text-white",
};

function PackageCard({ pkg }: { pkg: Package }) {
  const isMixed = pkg.transmission === "mixed";
  const TransmissionIcon = transmissionIconByKey(pkg.transmission);
  const sampleDisclaimer = getSamplePriceDisclaimer();
  const gearShift = getSticker("gear_shift");
  return (
    <article
      className={
        isMixed
          ? "relative flex h-full flex-col overflow-hidden rounded-lg border-2 border-primary-dark bg-primary p-6 text-white shadow-lg shadow-primary/25 ring-1 ring-primary-dark"
          : "flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
      }
    >
      <div className="flex flex-1 flex-col">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <h3
              className={`font-display text-2xl font-bold uppercase leading-none tracking-wide ${
                isMixed ? "text-white" : "text-neutral-900"
              }`}
            >
              {pkg.name}
            </h3>
            {pkg.transmission === "manual" && (
              <div
                aria-hidden="true"
                className="relative mt-2 h-10 w-10 select-none overflow-hidden rounded-md border border-neutral-200 bg-white p-0.5 shadow-sm"
              >
                <Image
                  src={gearShift.src}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 font-display text-xs font-semibold uppercase tracking-wider ${TRANSMISSION_CHIP_CLASS[pkg.transmission]}`}
          >
            <TransmissionIcon className="h-3.5 w-3.5" />
            {TRANSMISSION_LABEL[pkg.transmission]}
          </span>
        </div>

        {/* Plate data — dl 3 kolom dipisah garis, tanpa kartu di dalam kartu */}
        <dl
          className={`mb-5 grid grid-cols-3 divide-x ${
            isMixed ? "divide-white/25" : "divide-neutral-200"
          } border-y py-3 text-center ${isMixed ? "border-white/25" : "border-neutral-200"}`}
        >
          <div>
            <dt
              className={`text-[10px] font-semibold uppercase tracking-widest ${
                isMixed ? "text-white/70" : "text-neutral-500"
              }`}
            >
              Sesi
            </dt>
            <dd
              className={`mt-0.5 font-display text-xl font-semibold ${
                isMixed ? "text-white" : "text-neutral-900"
              }`}
            >
              {pkg.sessionCount}x
            </dd>
          </div>
          <div>
            <dt
              className={`text-[10px] font-semibold uppercase tracking-widest ${
                isMixed ? "text-white/70" : "text-neutral-500"
              }`}
            >
              Durasi
            </dt>
            <dd
              className={`mt-0.5 font-display text-xl font-semibold ${
                isMixed ? "text-white" : "text-neutral-900"
              }`}
            >
              {pkg.durationHours} jam
            </dd>
          </div>
          <div>
            <dt
              className={`text-[10px] font-semibold uppercase tracking-widest ${
                isMixed ? "text-white/70" : "text-neutral-600"
              }`}
            >
              Mobil
            </dt>
            <dd
              className={`mt-0.5 font-display text-lg font-semibold leading-tight ${
                isMixed ? "text-white" : "text-neutral-900"
              }`}
            >
              {pkg.vehicle.replace(/^Mobil\s+/, "")}
            </dd>
          </div>
        </dl>

        <ul className="mb-6 flex flex-col gap-1.5">
          {pkg.features.map((feature) => (
            <li
              key={feature}
              className={`flex items-start gap-2 text-sm ${
                isMixed ? "text-white/90" : "text-neutral-700"
              }`}
            >
              <CheckIcon
                className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                  isMixed ? "text-white" : "text-primary"
                }`}
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div
          className={`mt-auto flex items-end justify-between gap-3 border-t pt-4 ${
            isMixed ? "border-white/25" : "border-neutral-100"
          }`}
        >
          <div className="flex flex-col">
            <span
              className={`text-[11px] font-medium uppercase tracking-wide ${
                isMixed ? "text-white/70" : "text-neutral-600"
              }`}
            >
              Mulai dari
            </span>
            <span
              className={`font-display text-2xl font-semibold tracking-tight lg:text-3xl ${
                isMixed ? "text-white" : "text-neutral-900"
              }`}
            >
              {formatIDR(pkg.priceIdr)}
            </span>
            <span
              className={`text-[10px] italic ${
                isMixed ? "text-white/70" : "text-neutral-600"
              }`}
            >
              {sampleDisclaimer}
            </span>
          </div>
          {/* Kombinasi (biru): CTA putih teks biru; kartu putih: CTA biru.
              Merah tetap eksklusif CTA konversi utama (design-contract §3). */}
          <Link
            href={`/catalog/${pkg.id}`}
            className={
              isMixed
                ? "rounded-md bg-white px-5 py-2.5 text-sm font-bold text-primary shadow-sm transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.98]"
                : "rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
            }
          >
            Pelajari
          </Link>
        </div>
      </div>
    </article>
  );
}

export function Packages() {
  const packages = getPackages();

  return (
    <section
      id="packages"
      aria-labelledby="packages-heading"
      className="scroll-mt-24 bg-white px-6 py-12 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-md md:max-w-5xl lg:max-w-7xl">
        <div className="max-w-2xl">
          <h2
            id="packages-heading"
            className="font-display text-3xl font-semibold uppercase leading-none tracking-tight text-neutral-900 lg:text-4xl"
          >
            {getSectionHeader("paket")}
          </h2>
          <div aria-hidden="true" className="road-line-x mt-4 max-w-40" />
          <p className="mt-4 text-sm leading-relaxed text-neutral-600 lg:text-base">
            {getSectionBody("paket")}
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <li key={pkg.id} className="h-full">
              <PackageCard pkg={pkg} />
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs text-neutral-500">
          Harga aktual bersifat dinamis dan dapat dikonfirmasi ke admin cabang
          via WhatsApp.
        </p>
      </div>
    </section>
  );
}
