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
 * Editorial hero — production rewrite of prototype winner A.
 * Trust-led copy remains the first reading path; illustrative media and one
 * compact credibility note support it without competing with the red CTA.
 */
export function Hero() {
  const headline = getActiveHeroVariant().headline;
  const { subheadline, trustBar } = getHeroCopy();
  const credibility = getCredibility();
  const cta = getCta();
  const instructorStudent = getSticker("instructor_student");

  return (
    <header className="relative overflow-hidden bg-primary px-6 pb-16 pt-10 text-white lg:px-8 lg:pb-24 lg:pt-16">
      <div className="mx-auto grid max-w-md items-center gap-12 lg:max-w-7xl lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        <Reveal eager stagger>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/95">
            {getSeoCopy().keywords[0]}
          </p>

          <div className="mt-3 inline-flex select-none items-center gap-2.5 rounded-full bg-white py-1.5 pl-2 pr-5 shadow-lg shadow-primary-dark/30 ring-1 ring-black/5">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-black text-white"
            >
              P
            </span>
            <span className="text-2xl font-black tracking-tight text-accent lg:text-3xl">
              PULUNG
            </span>
          </div>

          <h1 className="mt-6 text-balance text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {headline}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 lg:text-lg">
            {subheadline}
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {trustBar.map((item) => (
              <li
                key={item.id}
                className="rounded-full border border-white/50 px-3 py-1.5 text-xs font-medium text-white"
              >
                {item.label}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href={cta.primaryHref}
              className="t-action group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-base font-bold text-white shadow-lg shadow-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              {cta.primary}
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href={cta.secondaryHref}
              className="t-action t-action-secondary inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-white/60 px-6 py-3 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              {cta.secondary}
            </a>
          </div>
        </Reveal>

        <Reveal eager>
          <figure className="relative">
            <HoverTilt>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl lg:aspect-[5/6]">
                <Image
                  src={instructorStudent.src}
                  alt={instructorStudent.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-contain object-center"
                />
                <figcaption className="absolute left-3 top-3 rounded-md bg-neutral-900/75 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Contoh
                </figcaption>
              </div>
            </HoverTilt>

            <div className="absolute -bottom-5 -left-3 z-10 max-w-64 rounded-2xl border border-neutral-200 bg-white p-4 text-neutral-900 shadow-xl lg:-left-8">
              <p className="text-sm font-bold text-primary">
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
