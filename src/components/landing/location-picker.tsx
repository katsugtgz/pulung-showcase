"use client";

import { useState } from "react";
import { getBranchesByCluster, getClusters } from "@/lib/catalog-data";
import type { TransmissionType } from "@/lib/catalog-data";
import { buildWhatsAppLink } from "@/lib/wa-router";
import { getCta } from "@/lib/copy";

const TRANSMISSION_OPTIONS: ReadonlyArray<{
  value: TransmissionType;
  label: string;
}> = [
  { value: "matic", label: "Matic" },
  { value: "manual", label: "Manual" },
  { value: "mixed", label: "Campuran" },
];

/*
 * Pilih Lokasi (#lokasi) — cabang dikelompokkan per cluster.
 * Cluster A (MERR/Selatan) -> admin +62 851-0087-0957.
 * Cluster B (Manyar/Pusat) -> admin +62 812-3253-1989.
 *
 * Setiap kartu cabang menampilkan: nama, alamat, dan tombol CTA WhatsApp yang
 * merujuk ke buildWhatsAppLink({ branchId, transmission }). Toggle transmisi
 * di atas daftar cluster menentukan transmisi yang di-interpolasi ke pesan
 * WhatsApp admin cluster (manual / matic / campuran).
 * Tidak pernah membangun URL wa.me secara manual di JSX — routing cluster
 * adalah logika bisnis kritis yang diuji di wa-router.
 */

function WhatsappIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={12} cy={10} r={2.5} />
    </svg>
  );
}

export function LocationPicker() {
  const clusters = getClusters();
  const [transmission, setTransmission] = useState<TransmissionType | undefined>(
    undefined,
  );
  const cta = getCta();

  return (
    <section
      id="lokasi"
      aria-labelledby="lokasi-heading"
      className="scroll-mt-4 bg-white px-6 py-10 lg:px-8 lg:py-16"
    >
      <div className="mx-auto max-w-md lg:max-w-7xl">
        <h2
          id="lokasi-heading"
          className="text-center text-2xl lg:text-3xl font-bold tracking-tight text-neutral-900"
        >
          Pilih Lokasi
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Lima cabang di dua kluster area Surabaya. Hubungi admin sesuai area
          Anda.
        </p>

        <div
          role="group"
          aria-label="Pilih jenis transmisi"
          className="mt-4 flex gap-2"
        >
          {TRANSMISSION_OPTIONS.map(({ value, label }) => {
            const selected = transmission === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  setTransmission((prev) =>
                    prev === value ? undefined : value,
                  )
                }
                className={
                  selected
                    ? "flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-white transition"
                    : "flex-1 rounded-lg border border-neutral-300 bg-white py-2 text-sm font-semibold text-neutral-700 transition"
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8">
          {clusters.map((cluster) => {
            const branches = getBranchesByCluster(cluster.id);
            return (
              <div key={cluster.id}>
                {/* Header kluster */}
                <div className="mb-3 rounded-xl bg-primary px-4 py-3 text-white">
                  <h3 className="text-sm font-bold leading-tight">
                    {cluster.region}
                  </h3>
                  <p className="mt-1 text-xs text-white/80">
                    Admin:{" "}
                    <a
                      href={`https://instagram.com/${cluster.instagram.replace(
                        "@",
                        "",
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-white underline decoration-white/40 underline-offset-2 hover:decoration-white"
                    >
                      {cluster.instagram}
                    </a>{" "}
                    &middot; {cluster.whatsapp}
                  </p>
                </div>

                {/* Daftar cabang dalam kluster */}
                <ul className="flex flex-col gap-3">
                  {branches.map((branch) => (
                    <li key={branch.id}>
                      <article className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <h4 className="font-bold text-neutral-900">
                            {branch.name}
                          </h4>
                          {branch.isMain && (
                            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                              Cabang Utama
                            </span>
                          )}
                        </div>
                        <p className="mb-3 flex items-start gap-2 text-sm text-neutral-600">
                          <PinIcon />
                          <span>{branch.address}</span>
                        </p>
                        <a
                          href={buildWhatsAppLink({
                            branchId: branch.id,
                            transmission,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1ebe5d] active:scale-[0.98]"
                        >
                          <WhatsappIcon />
                          {cta.primary}
                        </a>
                      </article>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
