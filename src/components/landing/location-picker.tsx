"use client";

import { useState } from "react";
import {
  getBranches,
  getBranchesByCluster,
  getClusters,
} from "@/lib/catalog-data";
import type { TransmissionType } from "@/lib/catalog-data";
import { buildWhatsAppLink } from "@/lib/wa-router";
import { getCta, getLocationTransmissionHelp } from "@/lib/copy";
import { PinIcon, WhatsappIcon } from "@/components/landing";

const TRANSMISSION_OPTIONS: ReadonlyArray<{
  value: TransmissionType;
  label: string;
}> = [
  { value: "matic", label: "Matic" },
  { value: "manual", label: "Manual" },
  { value: "mixed", label: "Campuran" },
];

/*
 * Pilih Lokasi (#lokasi) — pengungkapan bertahap via pemilih klaster (story #15).
 *
 * Cluster A (MERR/Selatan) -> admin +62 851-0087-0957.
 * Cluster B (Manyar/Pusat) -> admin +62 812-3253-1989.
 *
 * Pengunjung memilih klaster area dulu, lalu melihat hanya cabang di klaster
 * itu. Implementasi: semua 5 cabang tetap di-render DOM (untuk SEO, graceful
 * degradation, dan agar QA `wa-link-correctness.mjs` yang membaca
 * `querySelectorAll('#lokasi a[href^="https://wa.me/"]')` tetap menemukan 5
 * tombol), tetapi diberi atribut `hidden` saat tidak termasuk klaster terpilih.
 *
 * Tombol WhatsApp memakai hijau gelap #075E54 (~7.67:1 kontras terhadap teks
 * putih — story #19). Routing klaster dan interpolasi transmisi ke pesan
 * WhatsApp admin klaster semuanya di wa-router lewat buildWhatsAppLink({
 * branchId, transmission }) — tidak ada nomor telepon atau URL wa.me yang
 * dibangun manual di sini (story #17, #38 — logika bisnis kritis).
 */

export function LocationPicker() {
  const clusters = getClusters();
  const allBranches = getBranches();
  const [transmission, setTransmission] = useState<TransmissionType | undefined>(
    undefined,
  );
  const [selectedClusterId, setSelectedClusterId] = useState<string | undefined>(
    undefined,
  );
  const cta = getCta();
  const transmissionHelp = getLocationTransmissionHelp();

  return (
    <section
      id="lokasi"
      aria-labelledby="lokasi-heading"
      className="scroll-mt-24 bg-white px-6 py-10 lg:px-8 lg:py-16"
    >
      <div className="mx-auto max-w-md lg:max-w-7xl">
        <h2
          id="lokasi-heading"
          className="text-center text-2xl lg:text-3xl font-bold tracking-tight text-neutral-900"
        >
          Pilih Lokasi
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Lima cabang di dua klaster area Surabaya. Pilih klaster area Anda
          dulu, lalu chat admin cabang.
        </p>

        {/*
          Unified task surface (issue #50 ticket #54 — "one visually connected
          task surface"). The four sub-sections — transmission toggle,
          transmission microcopy, cluster selector, branch list — are wrapped
          in a single card with hairline dividers so the visitor reads them
          as one progressive task, not four scattered UI chunks.
          Selectors preserved: every role="group", aria-label, and wa.me link
          stays inside #lokasi for the wa-link-correctness QA flow.
        */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-neutral-50 ring-1 ring-neutral-200 lg:mt-8">
            {/*
              Step 1 — transmission. role="group" + aria-label are read by
              wa-link-correctness.mjs; do NOT change. State visual
              (selected/unselected/hover/focus) is contrast-clear.
            */}
            <div className="px-5 py-5 lg:px-6 lg:py-6">
              <div className="mb-3 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
                >
                  1
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-700">
                  Pilih Transmisi
                </h3>
              </div>
              <div
                role="group"
                aria-label="Pilih jenis transmisi"
                className="flex gap-2"
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
                          ? "flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
                          : "flex-1 rounded-lg border border-neutral-300 bg-white py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                {transmissionHelp}
              </p>
            </div>

            {/*
              Step 2 — cluster / area. Progressive disclosure trigger: only
              one cluster selected at a time. aria-pressed reflects state.
            */}
            <div className="border-t border-neutral-200 px-5 py-5 lg:px-6 lg:py-6">
              <div className="mb-3 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
                >
                  2
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-700">
                  Pilih Klaster Area
                </h3>
              </div>
              <div
                role="group"
                aria-label="Pilih klaster area"
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                {clusters.map((cluster) => {
                  const selected = selectedClusterId === cluster.id;
                  const branchCount = getBranchesByCluster(cluster.id).length;
                  return (
                    <button
                      key={cluster.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        setSelectedClusterId((prev) =>
                          prev === cluster.id ? undefined : cluster.id,
                        )
                      }
                      className={
                        selected
                          ? "flex flex-col items-start gap-1 rounded-xl border-2 border-primary bg-white p-4 text-left shadow-sm transition hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                          : "flex flex-col items-start gap-1 rounded-xl border border-neutral-300 bg-white p-4 text-left transition hover:border-primary hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      }
                    >
                      <span className="text-sm font-bold leading-snug text-neutral-900">
                        {cluster.region}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {branchCount} cabang · Admin {cluster.whatsapp}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/*
              Step 3 — branch list (progressive disclosure target). All 5
              branches remain in the DOM (hidden until cluster selected) so
              SEO, screen-reader, and wa-link-correctness.mjs (which reads
              via querySelectorAll — finds hidden elements) keep working.
            */}
            <div className="border-t border-neutral-200 px-5 py-5 lg:px-6 lg:py-6">
              <div className="mb-3 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
                >
                  3
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-700">
                  Pilih Cabang &amp; Chat Admin
                </h3>
              </div>

              {!selectedClusterId && (
                <p
                  aria-live="polite"
                  className="rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-6 text-center text-sm text-neutral-500"
                >
                  Pilih klaster area di atas untuk melihat cabang yang tersedia.
                </p>
              )}

              <ul
                aria-label="Daftar cabang"
                className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4"
              >
                {allBranches.map((branch) => {
                  const visible = selectedClusterId === branch.clusterId;
                  return (
                    <li
                      key={branch.id}
                      hidden={!visible}
                      className={visible ? undefined : "hidden"}
                    >
                      {/*
                        Branch card — surface switched from bg-neutral-50 to
                        bg-white so the card lifts against the unified neutral-50
                        task surface (visual hierarchy: card-on-tone).
                      */}
                      <article className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-neutral-900">
                            {branch.name}
                          </h4>
                          {branch.isMain && (
                            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                              Cabang Utama
                            </span>
                          )}
                        </div>
                        <p className="mb-3 flex items-start gap-2 text-sm text-neutral-600">
                          <PinIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          <span>{branch.address}</span>
                        </p>
                        {/*
                          WA CTA — py-3 (was py-2.5) for ≥48px touch target
                          (WCAG 2.5.5; issue #50 story #22). bg-[#075E54]
                          (~7.67:1 contrast with text-white — passes AAA).
                        */}
                        <a
                          href={buildWhatsAppLink({
                            branchId: branch.id,
                            transmission,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Chat admin ${branch.name} via WhatsApp`}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#075E54] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#064a43] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#075E54] focus-visible:ring-offset-2 active:scale-[0.98]"
                        >
                          <WhatsappIcon className="h-4 w-4" />
                          {cta.primary}
                        </a>
                      </article>
                    </li>
                  );
                })}
              </ul>
            </div>
        </div>
      </div>
    </section>
  );
}
