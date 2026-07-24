import {
  getSectionBody,
  getSectionHeader,
  getTestimonials,
} from "@/lib/copy";
import { getMapsRating } from "@/lib/maps-reviews";
import { PretextText } from "@/components/pretext-text";
import Image from "next/image";
import { getSticker } from "@/lib/illustrations";

import { StarIcon } from "@/components/landing/icons";
import type { TestimonialEntry } from "@/lib/copy";

/*
 * Testimoni — header + body dari @/lib/copy; entri adalah ulasan Google Maps
 * ASLI (verbatim) dari snapshot SerpAPI (@/lib/maps-reviews). Rating dihitung
 * dari snapshot (rata-rata tertimbang tiga cabang) — tidak ada angka hardcode,
 * tidak ada panggilan pihak ketiga saat build/runtime.
 *
 * Provenance Google ditampilkan eksplisit: badge "Google" + barisan bintang +
 * jumlah ulasan. Avatar inisial diturunkan dari karakter pertama nama penulis
 * (story #25); TIDAK ada foto / tanggal / label verifikasi / klaim karangan
 * (story #26). Varian permukaan tonal (bg-white ↔ bg-primary/10) membedakan
 * kartu tanpa menambah elemen dekoratif yang berisiko dikira bersumber dari
 * Google.
 *
 * Cabang kosong dipertahankan defensif: bila snapshot dikosongkan, body copy
 * modul tampil sebagai placeholder yang sopan.
 */

/*
 * Dua varian permukaan bergantian untuk variasi tonal. `bg-white` +
 * `bg-primary/10` cukup kontras untuk membedakan kartu tanpa menarik
 * perhatian dari kutipan ulasan.
 */
const CARD_SURFACES = ["bg-white", "bg-primary/10"] as const;

/** Inisial avatar — karakter pertama nama, uppercased. */
function initialsOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function TestimonialCard({
  entry,
  surfaceIndex,
}: {
  entry: TestimonialEntry;
  surfaceIndex: number;
}) {
  const surface = CARD_SURFACES[surfaceIndex % CARD_SURFACES.length]!;
  return (
    <figure
      className={`flex h-full flex-col rounded-2xl border border-neutral-200 p-5 shadow-sm ${surface}`}
    >
      {/* Bintang 5/5 — semua testimoni snapshot sudah difilter rating=5 */}
      {/*
        role="img" + aria-label: role REQUIRED on this <div> because aria-label
        is prohibited on role-less divs (WCAG aria-prohibited-attr audit).
        The role="img" treats the star row as a single image with the rating
        as its accessible name — keeps "5 dari 5 bintang" as the announcement.
      */}
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
       * line-clamp-6 membatasi tinggi kartu di layar — terutama mobile, agar
       * figcaption (avatar + nama + badge Google) tetap terlihat tanpa scroll.
       * Kutipan penuh tetap di DOM (verbatim rule dipertahankan); hanya tampilan
       * visual yang dipangkas dengan ellipsis CSS.
       */}
      <blockquote className="mt-3 line-clamp-6 text-sm leading-relaxed text-neutral-700">
        &ldquo;{entry.quote}&rdquo;
      </blockquote>

      <figcaption className="mt-auto flex items-center gap-3 border-t border-neutral-100 pt-4">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
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
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-neutral-200"
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
      className="bg-white px-6 py-10 lg:px-8 lg:py-16"
    >
      <div className="relative mx-auto max-w-md md:max-w-5xl lg:max-w-7xl">
        {/* Floating sticker decorator - roundabout_sign */}
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
          className="text-center text-2xl font-bold tracking-tight text-neutral-900 lg:text-3xl"
        >
          {getSectionHeader("testimonials")}
        </h2>

        {/*
         * Blok rating prominent — angka besar + barisan bintang + badge Google.
         * Kontrak teks lama dipertahankan: ratingLabel standalone dan
         * "dari X ulasan Google" sebagai satu node teks (lihat __tests__).
         */}
        <div className="mx-auto mt-5 flex max-w-2xl flex-col items-center justify-center gap-4 sm:flex-row sm:items-stretch">
          {/* Rating Summary Card */}
          <div className="flex w-full max-w-md flex-col justify-center rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-5">
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl font-black leading-none tracking-tight text-neutral-900">
                {ratingLabel}
              </span>
              <div className="flex flex-col items-start gap-1.5">
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
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-neutral-200"
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
            {/*
             * Baris kontrak teks lama — dipertahankan persis agar
             * testimonials.test.tsx lulus. `<StarIcon/>` (SVG tanpa teks) +
             * teks "dari X ulasan Google" sebagai text node langsung `<p>`:
             * satu-satunya elemen yang cocok dengan matcher getByText.
             */
            }
            <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-neutral-700">
              <StarIcon className="h-3 w-3 text-accent" aria-hidden="true" />
              dari {reviewCount} ulasan Google
            </p>
          </div>

          {/* Framed Companion Tile - instructor_student */}
          <div
            aria-hidden="true"
            className="flex w-full max-w-md flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:max-w-xs"
          >
            <div className="relative h-24 w-24 select-none overflow-hidden rounded-xl">
              <Image
                src={instructorStudent.src}
                alt={instructorStudent.alt}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <p className="mt-2 text-center text-xs font-semibold text-neutral-600">
              Instruktur Ramah &amp; Sabar
            </p>
          </div>
        </div>

        {testimonials.length > 0 ? (
          <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <li key={t.id} className="h-full">
                <TestimonialCard entry={t} surfaceIndex={i} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-5 py-8 text-center text-sm italic leading-relaxed text-neutral-500">
            {getSectionBody("testimonials")}
          </p>
        )}
      </div>
    </section>
  );
}
