import { getTestimonials } from "@/lib/catalog-data";
import type { StarRating } from "@/lib/catalog-data";

/*
 * Testimoni — placeholder dari getTestimonials(). Nama Indonesia, peringkat
 * bintang 5, kutipan realistis. Data siap menerima ulasan asli di kemudian
 * hari (struktur data sudah disiapkan per PRD).
 */

function StarRow({ rating }: { rating: StarRating }) {
  return (
    <div
      className="flex gap-0.5"
      role="img"
      aria-label={`Peringkat ${rating} dari 5 bintang`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={
            i < rating ? "h-4 w-4 text-yellow-400" : "h-4 w-4 text-neutral-300"
          }
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.366-2.445a1 1 0 00-1.176 0l-3.366 2.445c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.075 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  // Ambil 3 testimoni pertama untuk landing — data sudah dikurasi di catalog-data.
  const testimonials = getTestimonials().slice(0, 3);

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
          Kata Mereka
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Pengalaman siswa Pulung yang telah berhasil mengemudi.
        </p>

        <ul className="mt-6 flex flex-col gap-4">
          {testimonials.map((t) => (
            <li key={t.id}>
              <figure className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <StarRow rating={t.rating} />
                <blockquote className="mt-3 text-sm leading-relaxed text-neutral-700">
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
      </div>
    </section>
  );
}
