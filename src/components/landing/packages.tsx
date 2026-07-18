import Link from "next/link";
import { getPackages } from "@/lib/catalog-data";
import type { Package, TransmissionType } from "@/lib/catalog-data";
import { getSamplePriceDisclaimer, getSectionBody, getSectionHeader } from "@/lib/copy";
import { formatIDR } from "@/lib/format";
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
 * Diferensiasi visual per paket (story #10-13, #30) BUKAN via badge popularitas
 * (tidak ada authoritative field; story #13 melarang) — melainkan via:
 *  - pictogram transmisi di chip header kartu (ManualTransmissionIcon,
 *    MaticTransmissionIcon, MixedTransmissionIcon dari icons.tsx)
 *  - permukaan tonal berbeda: paket Kombinasi (mixed) mendapat tint + border
 *    primary halus supaya terasa premium TANPA mengklaim "paling populer"
 *  - hierarki data: sesi + durasi + kendaraan di dl 3-kolom dengan bobot
 *    tipografi yang lebih tegas (label uppercase, angka bold besar)
 *
 * Harga contoh (priceIsDummy: true di semua paket) ditandai via
 * getSamplePriceDisclaimer() ("*harga contoh"); tombol "Pelajari" ->
 * /catalog/[id] dipertahankan.
 *
 * Layout: 1 kolom (mobile) -> 2 kolom (md) -> 3 kolom (lg).
 */

const TRANSMISSION_CHIP_CLASS: Record<TransmissionType, string> = {
  manual: "border-neutral-300 bg-neutral-100 text-neutral-700",
  matic: "border-neutral-300 bg-neutral-100 text-neutral-700",
  // Tonal shift halus untuk Kombinasi — border + tint primary, tanpa kata
  // "populer" atau "best" (story #13 melarang klaim popularitas).
  mixed: "border-primary/30 bg-primary/10 text-primary-dark",
};

function PackageCard({ pkg }: { pkg: Package }) {
  const isMixed = pkg.transmission === "mixed";
  const TransmissionIcon = transmissionIconByKey(pkg.transmission);
  const sampleDisclaimer = getSamplePriceDisclaimer();
  return (
    <article
      className={
        isMixed
          ? "flex h-full flex-col overflow-hidden rounded-2xl border border-primary/30 bg-primary/[0.03] shadow-sm ring-1 ring-primary/5"
          : "flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
      }
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-tight text-neutral-900">
            {pkg.name}
          </h3>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${TRANSMISSION_CHIP_CLASS[pkg.transmission]}`}
          >
            <TransmissionIcon className="h-3.5 w-3.5" />
            {TRANSMISSION_LABEL[pkg.transmission]}
          </span>
        </div>

        <dl className="mb-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-white/70 py-2.5 ring-1 ring-neutral-100">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
              Sesi
            </dt>
            <dd className="mt-0.5 text-base font-bold text-neutral-900">
              {pkg.sessionCount}x
            </dd>
          </div>
          <div className="rounded-lg bg-white/70 py-2.5 ring-1 ring-neutral-100">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
              Durasi
            </dt>
            <dd className="mt-0.5 text-base font-bold text-neutral-900">
              {pkg.durationHours} jam
            </dd>
          </div>
          <div className="rounded-lg bg-white/70 py-2.5 ring-1 ring-neutral-100">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-neutral-600">
              Mobil
            </dt>
            <dd className="mt-0.5 text-sm font-bold leading-tight text-neutral-900">
              {pkg.vehicle.replace(/^Mobil\s+/, "")}
            </dd>
          </div>
        </dl>

        <ul className="mb-5 flex flex-col gap-1.5">
          {pkg.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm text-neutral-700"
            >
              <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-neutral-100 pt-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-600">
              Mulai dari
            </span>
            <span className="text-xl font-bold tracking-tight text-neutral-900 lg:text-2xl">
              {formatIDR(pkg.priceIdr)}
            </span>
            <span className="text-[10px] italic text-neutral-600">
              {sampleDisclaimer}
            </span>
          </div>
          <Link
            href={`/catalog/${pkg.id}`}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
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
      className="scroll-mt-24 bg-neutral-50 px-6 py-10 lg:px-8 lg:py-16"
    >
      <div className="mx-auto max-w-md md:max-w-5xl lg:max-w-7xl">
        <h2
          id="packages-heading"
          className="text-center text-2xl lg:text-3xl font-bold tracking-tight text-neutral-900"
        >
          {getSectionHeader("paket")}
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          {getSectionBody("paket")}
        </p>

        <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <li key={pkg.id} className="h-full">
              <PackageCard pkg={pkg} />
            </li>
          ))}
        </ul>

        <p className="mt-4 text-center text-xs text-neutral-500">
          Harga aktual bersifat dinamis dan dapat dikonfirmasi ke admin cabang
          via WhatsApp.
        </p>
      </div>
    </section>
  );
}
