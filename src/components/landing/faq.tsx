"use client";

import { useState } from "react";
import { getFaq, getSectionBody, getSectionHeader } from "@/lib/copy";
import { ChevronDownIcon } from "@/components/landing/icons";

/*
 * FAQ (#faq) — accordion satu-terbuka (issue #50 ticket #57 refresh).
 *
 * Visual treatment refresh: flat rows separated by hairline dividers,
 * BUKAN bordered white cards — varies rhythm vs Packages/Testimonials
 * sections (design-contract §5 surface variety). Single-open behavior,
 * aria-expanded, aria-controls, region role, dan hidden (!open)
 * dipertahankan persis — existing faq.test.tsx menguji kontrak ini.
 *
 * Semua teks bersumber dari modul copy (getFaq / getSectionHeader /
 * getSectionBody); tidak ada string hardcode di sini. ChevronDownIcon
 * dari kosakata ikon bersama — bukan inline SVG ad-hoc.
 */

export function Faq() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-24 bg-neutral-50 px-6 py-10 lg:px-8 lg:py-16"
    >
      <div className="mx-auto max-w-md lg:max-w-3xl">
        <h2
          id="faq-heading"
          className="text-center text-2xl lg:text-3xl font-bold tracking-tight text-neutral-900"
        >
          {getSectionHeader("faq")}
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          {getSectionBody("faq")}
        </p>

        {/*
          Flat-row accordion (ticket #57). NO bordered card chrome — each
          row is a full-width button + collapsible panel separated by
          border-b dividers. The list semantics + aria-controls wiring
          stay intact.
        */}
        <ul
          aria-label="Daftar pertanyaan"
          className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200"
        >
          {getFaq().map((entry) => {
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
                  className="flex w-full items-center justify-between gap-3 py-4 text-left font-semibold text-neutral-900 transition hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:py-5"
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
                  className="pb-5 text-sm leading-relaxed text-neutral-600 lg:pb-6"
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
