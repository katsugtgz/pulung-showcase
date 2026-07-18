"use client";

import { useState } from "react";
import { getFaq, getSectionBody, getSectionHeader } from "@/lib/copy";

/*
 * FAQ (#faq) — accordion satu-terbuka. Setiap kartu memakai `hidden` (bukan
 * display:none) supaya panel tertutup benar-benar keluar dari pohon aksesibilitas.
 * Semua teks bersumber dari modul copy (getFaq / getSectionHeader / getSectionBody);
 * tidak ada string hardcode di sini.
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

        <ul className="mt-6 flex flex-col gap-3">
          {getFaq().map((entry) => {
            const open = openId === entry.id;
            return (
              <li
                key={entry.id}
                className="rounded-xl border border-neutral-200 bg-white"
              >
                <button
                  type="button"
                  id={`faq-q-${entry.id}`}
                  aria-expanded={open}
                  aria-controls={`faq-a-${entry.id}`}
                  onClick={() =>
                    setOpenId((cur) => (cur === entry.id ? null : entry.id))
                  }
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-semibold text-neutral-900"
                >
                  <span>{entry.question}</span>
                  <svg
                    className={
                      open
                        ? "h-5 w-5 shrink-0 rotate-180 text-primary transition-transform"
                        : "h-5 w-5 shrink-0 text-primary transition-transform"
                    }
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div
                  id={`faq-a-${entry.id}`}
                  role="region"
                  aria-labelledby={`faq-q-${entry.id}`}
                  hidden={!open}
                  className="px-4 pb-4 text-sm leading-relaxed text-neutral-600"
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
