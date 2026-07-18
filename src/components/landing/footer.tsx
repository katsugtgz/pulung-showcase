import Link from "next/link";
import { getClusters } from "@/lib/catalog-data";
import { InstagramIcon, WhatsappIcon } from "@/components/landing/icons";

/*
 * Footer — identitas bisnis, kluster admin (WhatsApp + IG), dan kredit demo.
 * Data kluster dari catalog-data; TIDAK ada hardcode nomor/IG di JSX.
 *
 * Wordmark lockup memakai pill putih + badge "P" + teks "PULUNG" merah —
 * konsisten dengan Hero (ADR-004). Kontras merah-ke-putih lulus WCAG 3:1
 * large-text, sementara tetap mempertahankan warna brand. Anchor nav
 * (Lokasi/Paket/FAQ) hadir di desktop untuk paritas dengan Header.
 */

/*
 * Anchor nav — mengunci ke id section yang sudah dipasang di page.tsx
 * (#packages, #lokasi, #faq). Urutan mengikuti Header agar konsisten.
 */
const FOOTER_NAV: ReadonlyArray<{ href: string; label: string }> = [
  { href: "#packages", label: "Paket" },
  { href: "#lokasi", label: "Lokasi" },
  { href: "#faq", label: "FAQ" },
];

export function Footer() {
  const clusters = getClusters();

  return (
    <footer className="bg-neutral-900 px-6 pb-8 pt-10 text-neutral-300 lg:px-8 lg:pt-16">
      <div className="mx-auto max-w-md lg:max-w-7xl">
        {/*
         * Identitas — wordmark pill lockup (ADR-004). Pill putih di atas
         * neutral-900 memberi kontras tinggi; wordmark merah #D22B3A di atas
         * pill putih mencapai ~5:1 (lulus WCAG large-text 3:1).
         */}
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="inline-flex select-none items-center gap-2.5 rounded-full bg-white py-1.5 pl-2 pr-5 shadow-lg shadow-black/30 ring-1 ring-black/5">
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Kursus Mengemudi
          </p>
          <p className="text-sm text-neutral-400">
            Safe Drive Training &middot; Berdiri sejak 2000 &middot; Surabaya
          </p>
        </div>

        {/*
         * Anchor nav — paritas dengan Header, hanya desktop. Mobile tidak
         * mendapat nav duplikat (section pendek, scroll singkat).
         */}
        <nav
          aria-label="Navigasi kaki halaman"
          className="mb-6 hidden justify-center gap-6 lg:flex"
        >
          {FOOTER_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-1 py-2 text-sm font-medium text-neutral-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/*
         * Kontak admin per kluster — semua nomor/IG dari getClusters(),
         * tidak ada hardcode. Tap target py-2.5 (~28px) ≥ 24px WCAG 2.5.5.
         */}
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          {clusters.map((cluster) => (
            <div
              key={cluster.id}
              className="rounded-xl bg-neutral-800 p-4 ring-1 ring-neutral-700/60"
            >
              <p className="text-sm font-semibold text-white">
                {cluster.region}
              </p>
              <div className="mt-2 flex flex-col gap-1 text-xs">
                <a
                  href={`https://wa.me/${cluster.whatsapp.replace(/\D+/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-2 rounded-md py-2.5 text-neutral-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-800"
                >
                  <WhatsappIcon className="h-4 w-4" />
                  <span>{cluster.whatsapp}</span>
                </a>
                <a
                  href={`https://instagram.com/${cluster.instagram.replace(
                    "@",
                    "",
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-2 rounded-md py-2.5 text-neutral-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-800"
                >
                  <InstagramIcon className="h-4 w-4" />
                  <span>{cluster.instagram}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Akreditasi */}
        <div className="mb-6 border-t border-neutral-800 pt-4 text-center text-xs text-neutral-400">
          <p>Terdaftar KORLANTAS POLRI &amp; Dishub Surabaya</p>
        </div>

        {/* Kredit */}
        <p className="text-center text-xs text-neutral-400">
          Demo oleh <span className="font-semibold text-neutral-300">RW Dev</span>
        </p>
      </div>
    </footer>
  );
}
