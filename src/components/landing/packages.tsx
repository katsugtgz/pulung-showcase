import Link from "next/link";
import { getPackages } from "@/lib/catalog-data";
import type { TransmissionType } from "@/lib/catalog-data";
import { getSectionBody, getSectionHeader } from "@/lib/copy";
import { formatIDR } from "@/lib/format";

/*
 * Paket (#packages) — tiga kartu dari getPackages(): Manual, Matic, Kombinasi.
 * Setiap kartu: nama, badge transmisi, fitur utama, kendaraan "Mobil Full AC",
 * harga contoh (formatIDR) dengan disclaimer "*harga contoh", tombol
 * "Pelajari" -> /catalog/[id]. Header + body section dari @/lib/copy; harga
 * bersumber dari catalog-data, format dari modul format — tidak ada hardcode
 * untuk string yang dimiliki modul copy.
 */

const TRANSMISSION_LABEL: Record<TransmissionType, string> = {
  manual: "Manual",
  matic: "Matic",
  mixed: "Kombinasi",
};

function CheckIcon() {
  return (
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
  );
}

export function Packages() {
  const packages = getPackages();

  return (
    <section
      id="packages"
      aria-labelledby="packages-heading"
      className="scroll-mt-4 bg-neutral-50 px-6 py-10"
    >
      <div className="mx-auto max-w-md">
        <h2
          id="packages-heading"
          className="text-center text-2xl font-bold tracking-tight text-neutral-900"
        >
          {getSectionHeader("paket")}
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          {getSectionBody("paket")}
        </p>

        <ul className="mt-6 flex flex-col gap-4">
          {packages.map((pkg) => (
            <li key={pkg.id}>
              <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="p-5">
                  {/* Judul + badge transmisi */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold leading-tight text-neutral-900">
                      {pkg.name}
                    </h3>
                    <span className="flex-shrink-0 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {TRANSMISSION_LABEL[pkg.transmission]}
                    </span>
                  </div>

                  {/* Fakta kunci */}
                  <dl className="mb-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-neutral-50 py-2">
                      <dt className="text-[10px] uppercase text-neutral-500">
                        Sesi
                      </dt>
                      <dd className="text-sm font-bold text-neutral-900">
                        {pkg.sessionCount}x
                      </dd>
                    </div>
                    <div className="rounded-lg bg-neutral-50 py-2">
                      <dt className="text-[10px] uppercase text-neutral-500">
                        Durasi
                      </dt>
                      <dd className="text-sm font-bold text-neutral-900">
                        {pkg.durationHours} jam
                      </dd>
                    </div>
                    <div className="rounded-lg bg-neutral-50 py-2">
                      <dt className="text-[10px] uppercase text-neutral-500">
                        Mobil
                      </dt>
                      <dd className="text-sm font-bold text-neutral-900">
                        Full AC
                      </dd>
                    </div>
                  </dl>

                  {/* Fitur */}
                  <ul className="mb-4 flex flex-col gap-1.5">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-neutral-600"
                      >
                        <CheckIcon />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Harga + CTA */}
                  <div className="flex items-end justify-between gap-3 border-t border-neutral-100 pt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-500">
                        Mulai dari
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
                      className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark active:scale-[0.98]"
                    >
                      Pelajari
                    </Link>
                  </div>
                </div>
              </article>
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
