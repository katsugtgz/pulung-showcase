import {
  getSectionBody,
  getSectionHeader,
  getTestimonials,
} from "@/lib/copy";

/*
 * Testimoni — header + body + array testimoni semuanya dari @/lib/copy.
 * Hari ini array-nya KOSONG oleh desain: riset (research/copy-research.md §1)
 * menemukan NOL kutipan pelanggan yang verbatim dan terverifikasi. Jangan
 * mengarang entri — isi hanya setelah ulasan asli terverifikasi terkumpul.
 *
 * Saat kosong, body copy modul ("Cerita alumni Pulung akan tampil di sini
 * begitu ulasan terverifikasi terkumpul.") ditampilkan sebagai placeholder
 * yang sopan. Struktur kartu tetap disiapkan untuk entri mendatang.
 */

export function Testimonials() {
  const testimonials = getTestimonials();

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
