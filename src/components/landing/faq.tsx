"use client";

import { useState } from "react";
import { getFaq, getSectionBody, getSectionHeader } from "@/lib/copy";
import { ChevronDownIcon } from "@/components/landing/icons";

/*
 * FAQ (#faq) — accordion satu-terbuka.
 *
 * Redesign "rambu": pertanyaan = papan petunjuk. Nomor indeks kecil bergaya
 * patok kilometer (Q1, Q2, ...) di kolom kiri tetap rapi, chevron di kanan.
 * Tetap baris flat dengan pembatas hairline (tanpa kartu), kontrak
 * aria-expanded/aria-controls/region/hidden dipertahankan persis
 * (lihat __tests__). Copy tetap dari @/lib/copy.
 */
export function Faq() {
  const [openId, setOpenId] = useState<string | null>(null);
  const faq = getFaq();

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-24 bg-neutral-50 px-6 py-12 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-md lg:max-w-3xl">
        <h2
          id="faq-heading"
          className="text-center font-display text-3xl font-semibold uppercase leading-none tracking-tight text-neutral-900 lg:text-4xl"
        >
          {getSectionHeader("faq")}
        </h2>
        <div
          aria-hidden="true"
          className="road-line-x mx-auto mt-4 w-24 [--road-color:var(--color-accent)]"
        />
        <p className="mt-4 text-center text-sm text-neutral-600">
          {getSectionBody("faq")}
        </p>

        <ul
          aria-label="Daftar pertanyaan"
          className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200"
        >
          {faq.map((entry) => {
            const open = openId === entry.id;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  id={`faq-q-${entry.id}`}
                  aria-expanded={open}
                  aria-controls={`faq-a-${entry.id}`}
                  onClick={() =>
                    setOpenId((cur) => (cur === entry.id ? null : entry.id))
                  }
                  className="group flex w-full items-center justify-between gap-3 py-4 text-left font-semibold text-neutral-900 transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:py-5"
                >
                  <span>{entry.question}</span>
                  <ChevronDownIcon
                    className={
                      open
                        ? "h-5 w-5 shrink-0 rotate-180 text-primary transition-transform"
                        : "h-5 w-5 shrink-0 text-primary transition-transform"
                    }
                  />
                </button>
                <div
                  id={`faq-a-${entry.id}`}
                  role="region"
                  aria-labelledby={`faq-q-${entry.id}`}
                  hidden={!open}
                  className="pb-5 pl-8 text-sm leading-relaxed text-neutral-600 lg:pb-6"
                >
                  {entry.answer}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
