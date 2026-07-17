import {
  getSectionBody,
  getSectionHeader,
  getTestimonials,
} from "@/lib/copy";
import { getMapsRating } from "@/lib/maps-reviews";

/*
 * Testimoni — header + body + array testimoni semuanya dari @/lib/copy;
 * entri adalah ulasan Google Maps ASLI (verbatim) dari snapshot SerpAPI di
 * @/lib/maps-reviews. Badge rating dihitung dari snapshot (rata-rata
 * tertimbang tiga listing cabang) — tidak ada angka hardcode, tidak ada
 * panggilan pihak ketiga saat build/runtime.
 *
 * Cabang kosong dipertahankan defensif: bila snapshot dikosongkan, body
 * copy modul tampil sebagai placeholder yang sopan.
 */

function StarIcon() {
  return (
    <svg
      className="h-4 w-4 text-accent"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M10 1.5l2.47 5.29 5.78.73-4.25 4.02 1.1 5.73L10 14.47l-5.1 2.8 1.1-5.73-4.25-4.02 5.78-.73L10 1.5z" />
    </svg>
  );
}

export function Testimonials() {
  const testimonials = getTestimonials();
  const { rating, reviewCount } = getMapsRating();
  const ratingLabel = rating.toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <section
      aria-labelledby="testimoni-heading"
      className="bg-neutral-50 px-6 py-10"
    >
      <div className="mx-auto max-w-md">
        <h2
          id="testimoni-heading"
          className="text-center text-2xl font-bold tracking-tight text-neutral-900"
        >
          {getSectionHeader("testimonials")}
        </h2>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-neutral-700">
          <StarIcon />
          <span className="font-semibold text-neutral-900">{ratingLabel}</span>
          <span>dari {reviewCount} ulasan Google</span>
        </p>

        {testimonials.length > 0 ? (
          <ul className="mt-6 flex flex-col gap-4">
            {testimonials.map((t) => (
              <li key={t.id}>
                <figure className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <blockquote className="text-sm leading-relaxed text-neutral-700">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-3 border-t border-neutral-100 pt-3">
                    <p className="font-semibold text-neutral-900">{t.name}</p>
                    {t.context && (
                      <p className="text-xs text-neutral-500">{t.context}</p>
                    )}
                  </figcaption>
                </figure>
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
