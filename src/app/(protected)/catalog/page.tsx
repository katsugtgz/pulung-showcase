import Link from "next/link";
import { getPackages } from "@/lib/catalog-data";
import type { TransmissionType } from "@/lib/catalog-data";
import { formatIDR } from "@/lib/format";

/*
 * Katalog Paket (terlindungi). Halaman ini menampilkan ketiga paket kursus
 * (Manual, Matic, Kombinasi) dengan harga contoh. Dilindungi oleh Clerk auth
 * di (protected)/layout.tsx (auth.protect()).
 */

const TRANSMISSION_LABEL: Record<TransmissionType, string> = {
  manual: "Manual",
  matic: "Matic",
  mixed: "Kombinasi",
};

export default function CatalogPage() {
  const packages = getPackages();

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-neutral-50">
      {/* Header */}
      <header className="rounded-b-3xl bg-primary px-5 pb-6 pt-8 text-white shadow-md">
        <p className="text-sm font-medium text-white/80">Kursus Mengemudi Pulung</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Katalog Paket</h1>
        <p className="mt-2 text-sm text-white/80">
          Pilih paket belajar mengemudi yang sesuai untuk Anda.
        </p>
      </header>

      {/* Package list */}
      <section className="px-5 py-6" aria-label="Daftar paket kursus">
        <ul className="flex flex-col gap-4">
          {packages.map((pkg) => (
            <li key={pkg.id}>
              <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="p-5">
                  {/* Title row */}
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-neutral-900">
                      {pkg.name}
                    </h2>
                    <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {TRANSMISSION_LABEL[pkg.transmission]}
                    </span>
                  </div>

                  {/* Key facts */}
                  <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex flex-col">
                      <dt className="text-xs text-neutral-500">Jumlah Sesi</dt>
                      <dd className="font-semibold text-neutral-800">
                        {pkg.sessionCount}x pertemuan
                      </dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-xs text-neutral-500">Durasi</dt>
                      <dd className="font-semibold text-neutral-800">
                        {pkg.durationHours} jam
                      </dd>
                    </div>
                    <div className="col-span-2 flex flex-col">
                      <dt className="text-xs text-neutral-500">Kendaraan</dt>
                      <dd className="font-semibold text-neutral-800">
                        {pkg.vehicle}
                      </dd>
                    </div>
                  </dl>

                  {/* Features */}
                  <ul className="mb-4 flex flex-col gap-1.5">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-neutral-600"
                      >
                        <svg
                          className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path
                            clipRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            fillRule="evenodd"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Price + CTA */}
                  <div className="flex items-end justify-between gap-3 border-t border-neutral-100 pt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-500">
                        Harga contoh
                      </span>
                      <span className="text-xl font-bold text-neutral-900">
                        {formatIDR(pkg.priceIdr)}
                      </span>
                      <span className="text-[10px] italic text-neutral-400">
                        *harga contoh
                      </span>
                    </div>
                    <Link
                      href={`/catalog/${pkg.id}`}
                      className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-dark"
                    >
                      Daftar
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
