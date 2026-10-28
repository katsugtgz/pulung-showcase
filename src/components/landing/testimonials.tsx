import {
  getSectionBody,
  getSectionHeader,
  getTestimonials,
} from "@/lib/copy";
import { getMapsRating } from "@/lib/maps-reviews";
import { PretextText } from "@/components/pretext-text";
import Image from "next/image";
import { StarIcon } from "@/components/landing/icons";
import type { TestimonialEntry } from "@/lib/copy";
import { getSticker } from "@/lib/illustrations";

/*
 * Testimoni — header + body dari @/lib/copy; entri adalah ulasan Google Maps
 * ASLI (verbatim) dari snapshot SerpAPI (@/lib/maps-reviews). Rating dihitung
 * dari snapshot (rata-rata tertimbang tiga cabang) — tidak ada angka hardcode.
 *
 * Redesign "rambu": heading + rating summary rata kiri (bukan center),
 * angka rating oversized display kondensasi dengan sinyal marka garis bawah.
 * Kartu ulasan = kartu putih flat dengan sisi kiri marka solid biru tipis
 * (pengganti border seragam); tetap figure/blockquote/figcaption + tanpa
 * klaim verifikasi karangan (story #25/#26). Kontrak teks ratingLabel
 * standalone + "dari X ulasan Google" dipertahankan.
 */

function initialsOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function TestimonialCard({ entry }: { entry: TestimonialEntry }) {
  return (
    <figure className="flex h-full flex-col border-l-4 border-primary bg-white p-5 shadow-sm">
      <div
        className="flex items-center gap-0.5 text-accent"
        role="img"
        aria-label="5 dari 5 bintang"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} className="h-4 w-4" />
        ))}
      </div>

      {/*
       * line-clamp-6: figcaption tetap terlihat di mobile; kutipan penuh
       * tetap di DOM (verbatim rule dipertahankan).
       */}
      <blockquote className="mt-3 line-clamp-6 text-sm leading-relaxed text-neutral-700">
        &ldquo;{entry.quote}&rdquo;
      </blockquote>

      <figcaption className="mt-auto flex items-center gap-3 border-t border-neutral-100 pt-4">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary font-display text-lg font-semibold text-white"
        >
          {initialsOf(entry.name)}
        </span>
        <div className="min-w-0 flex-1">
          <PretextText
            text={entry.name}
            font="600 16px Inter, ui-sans-serif, system-ui, sans-serif"
            lineHeight={24}
            maxLines={2}
            className="font-semibold text-neutral-900"
            fallbackClassName="truncate font-semibold text-neutral-900"
          />
          {entry.context && (
            <PretextText
              text={entry.context}
              font="400 12px Inter, ui-sans-serif, system-ui, sans-serif"
              lineHeight={16}
              maxLines={2}
              className="text-xs text-neutral-500"
              fallbackClassName="truncate text-xs text-neutral-500"
            />
          )}
        </div>
        <span
          aria-label="Sumber: Google"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-neutral-200"
        >
          <Image
            src="/images/google-g.svg"
            alt=""
            width={15}
            height={16}
          />
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const testimonials = getTestimonials();
  const { rating, reviewCount } = getMapsRating();
  const ratingLabel = rating.toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const instructorStudent = getSticker("instructor_student");
  const roundaboutSign = getSticker("roundabout_sign");

  return (
    <section
      aria-labelledby="testimoni-heading"
      className="bg-neutral-50 px-6 py-12 lg:px-8 lg:py-20"
    >
      <div className="relative mx-auto max-w-md md:max-w-5xl lg:max-w-7xl">
        {/* Floating sticker decorator - roundabout_sign (decorative) */}
        <div
          aria-hidden="true"
          className="pointer-events-none hidden select-none lg:absolute lg:-right-16 lg:bottom-10 lg:block lg:h-20 lg:w-20 lg:rotate-12"
        >
          <div className="relative h-full w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white p-0.5 shadow-md">
            <Image
              src={roundaboutSign.src}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        </div>

        <h2
          id="testimoni-heading"
          className="font-display text-3xl font-semibold uppercase leading-none tracking-tight text-neutral-900 lg:text-4xl"
        >
          {getSectionHeader("testimonials")}
        </h2>

        {/*
         * Rating summary — patok kilometer: angka display besar + bintang +
         * badge Google, rata kiri dengan marka putus-putus pendek di bawah.
         * Kontrak teks lama dipertahankan (ratingLabel standalone dan
         * "dari X ulasan Google" sebagai satu node teks — lihat __tests__).
         */}
        <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-6xl font-semibold leading-none tracking-tight text-neutral-900 lg:text-7xl">
              {ratingLabel}
            </span>
            <div className="flex flex-col gap-1.5">
              <div
                className="flex items-center gap-0.5 text-accent"
                aria-hidden="true"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4" />
                ))}
              </div>
              <span
                aria-label="Sumber: Google"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white ring-1 ring-neutral-200"
              >
                <Image
                  src="/images/google-g.svg"
                  alt=""
                  width={15}
                  height={16}
                />
              </span>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="road-line-x w-24 [--road-color:var(--color-accent)]"
          />
          <p className="text-sm text-neutral-700">
            <StarIcon className="mr-1 inline h-3 w-3 text-accent" aria-hidden="true" />
            dari {reviewCount} ulasan Google
          </p>
        </div>

        {testimonials.length > 0 ? (
          <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <li key={t.id} className="h-full">
                <TestimonialCard entry={t} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-white/60 px-5 py-8 text-center text-sm italic leading-relaxed text-neutral-500">
            {getSectionBody("testimonials")}
          </p>
        )}

        {/* Companion tile - instructor_student (informative) */}
        <div className="mt-8 flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="relative h-16 w-16 select-none overflow-hidden rounded-md">
            <Image
              src={instructorStudent.src}
              alt={instructorStudent.alt}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <p className="font-display text-base font-semibold uppercase tracking-wide text-neutral-700">
            Instruktur Ramah &amp; Sabar
          </p>
        </div>
      </div>
    </section>
  );
}
