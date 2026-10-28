import Image from "next/image";
import {
  getActiveHeroVariant,
  getCredibility,
  getCta,
  getHeroCopy,
  getSeoCopy,
} from "@/lib/copy";
import { getSticker } from "@/lib/illustrations";
import { ArrowRightIcon } from "./icons";
import { HoverTilt } from "./hover-tilt";
import { Reveal } from "./reveal";

/*
 * Hero — redesign "rambu jalan" (road-signage). The whole first viewport is
 * one blue direction sign: solid #1E6FB8 field (the 25-year banner identity),
 * condensed signage display type for the H1, white plate chip for the
 * wordmark, and a dashed road center-line running under the CTA row. The
 * single bold element is the oversized condensed H1; illustration stays
 * right as a sign panel with the "Contoh" marker (honesty rule).
 * Copy/data sources unchanged (@/lib/copy, @/lib/illustrations).
 */
export function Hero() {
  const headline = getActiveHeroVariant().headline;
  const { subheadline, trustBar } = getHeroCopy();
  const credibility = getCredibility();
  const cta = getCta();
  const instructorStudent = getSticker("instructor_student");

  return (
    <header className="relative overflow-hidden bg-primary px-6 pb-20 pt-12 text-white lg:px-8 lg:pb-28 lg:pt-20">
      {/* Road-marking motif: dashed white center line bleeding off both
          edges, echoing the asphalt marking. Decorative only. */}
      <div
        aria-hidden="true"
        className="road-line-x pointer-events-none absolute left-0 right-0 bottom-10 opacity-40 [--road-color:#fff]"
      />

      <div className="mx-auto grid max-w-md items-center gap-12 lg:max-w-7xl lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        <Reveal eager stagger>
          {/* Eyebrow: business category from SEO copy — small plate chip,
              not a tracked all-caps strip. */}
          <p className="inline-flex items-center gap-2 border-l-4 border-accent bg-white/10 py-1 pl-3 pr-4 font-display text-sm font-semibold uppercase tracking-[0.08em] text-white/95">
            {getSeoCopy().keywords[0]}
          </p>

          {/* License-plate wordmark: white plate, red P badge, condensed
              black plate numbers. Same lockup as Header/Footer (ADR-004). */}
          <div className="mt-5 inline-flex select-none items-center gap-2.5 rounded-lg bg-white py-1.5 pl-2 pr-5 shadow-lg shadow-primary-dark/30 ring-1 ring-black/5">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-md bg-accent font-display text-sm font-bold text-white"
            >
              P
            </span>
            <span className="font-display text-2xl font-semibold uppercase tracking-[0.14em] text-neutral-900 lg:text-3xl">
              PULUNG
            </span>
          </div>

          {/* H1: oversized condensed signage lettering — the one bold type
              moment of the page. Uppercase like rambu text, but balanced
              with text-balance; line length stays well under 80ch. */}
          <h1 className="mt-6 font-display text-4xl font-semibold uppercase leading-[0.95] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {headline}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/90 lg:text-lg">
            {subheadline}
          </p>

          {/* Trust bar — plate chips (white border, small radius), not
              rounded-full pills. */}
          <ul className="mt-6 flex flex-wrap gap-2">
            {trustBar.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-white/40 bg-white/5 px-3 py-1.5 text-xs font-medium text-white"
              >
                {item.label}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href={cta.primaryHref}
              className="t-action group inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-base font-bold uppercase tracking-wide text-white shadow-lg shadow-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              {cta.primary}
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href={cta.secondaryHref}
              className="t-action t-action-secondary inline-flex min-h-12 items-center justify-center rounded-md border-2 border-white/60 px-6 py-3 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              {cta.secondary}
            </a>
          </div>
        </Reveal>

        <Reveal eager>
          <figure className="relative">
            <HoverTilt>
              {/* Sign-panel media frame: square corners + thick white ring,
                  reads as a blue traffic sign mounted on the page. */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg border-4 border-white/90 bg-white/10 shadow-2xl lg:aspect-[5/6]">
                <Image
                  src={instructorStudent.src}
                  alt={instructorStudent.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-contain object-center"
                />
                <figcaption className="absolute left-3 top-3 rounded-sm bg-neutral-900/75 px-2.5 py-1 font-display text-xs font-semibold uppercase tracking-[0.1em] text-white">
                  Contoh
                </figcaption>
              </div>
            </HoverTilt>

            {/* Credibility note card — plate chip anchored to the frame. */}
            <div className="absolute -bottom-5 -left-3 z-10 max-w-64 rounded-md border-l-4 border-primary bg-white p-4 text-neutral-900 shadow-xl lg:-left-8">
              <p className="font-display text-sm font-bold uppercase tracking-wide text-primary">
                {credibility[1].label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                {credibility[1].supportingLine}
              </p>
            </div>
          </figure>
        </Reveal>
      </div>
    </header>
  );
}
