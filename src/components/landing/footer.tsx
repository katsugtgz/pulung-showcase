import Link from "next/link";
import { getClusters } from "@/lib/catalog-data";
import { InstagramIcon, WhatsappIcon } from "@/components/landing/icons";

/*
 * Footer — identitas bisnis, kluster admin (WhatsApp + IG), dan kredit demo.
 * Data kluster dari catalog-data; TIDAK ada hardcode nomor/IG di JSX.
 *
 * Redesign "rambu": neutral-900 asphalt. Wordmark plate lockup sama dengan
 * Hero (ADR-004, huruf display kondensasi). Kartu kluster memakai strip kiri
 * marka putus-putus, label kecil bergaya patok. Anchor nav paritas Header.
 */
const FOOTER_NAV: ReadonlyArray<{ href: string; label: string }> = [
  { href: "#packages", label: "Paket" },
  { href: "#lokasi", label: "Lokasi" },
  { href: "#faq", label: "FAQ" },
];

export function Footer() {
  const clusters = getClusters();

  return (
    <footer className="relative bg-neutral-900 px-6 pb-8 pt-14 text-neutral-300 lg:px-8 lg:pt-20">
      {/* Dashed road marking across the top of the footer field */}
      <div
        aria-hidden="true"
        className="road-line-x pointer-events-none absolute left-0 right-0 top-3 opacity-25 [--road-color:#fff]"
      />

      <div className="mx-auto max-w-md lg:max-w-7xl">
        {/*
         * Identitas — wordmark plate lockup (ADR-004): plate putih, badge P
         * merah, teks display kondensasi. Merah di atas putih ~5:1 (WCAG
         * large-text lulus).
         */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="inline-flex select-none items-center gap-2.5 rounded-lg bg-white py-1.5 pl-2 pr-5 shadow-lg shadow-black/30 ring-1 ring-black/5">
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
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Kursus Mengemudi
          </p>
          <p className="text-sm text-neutral-400">
            Safe Drive Training &middot; Berdiri sejak 2000 &middot; Surabaya
          </p>
        </div>

        {/*
         * Anchor nav — paritas dengan Header, hanya desktop.
         */}
        <nav
          aria-label="Navigasi kaki halaman"
          className="mb-8 hidden justify-center gap-6 lg:flex"
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
         * Kontak admin per kluster — semua nomor/IG dari getClusters().
         * Kartu dengan strip marka putus-putus kiri + nomor display besar.
         */}
        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          {clusters.map((cluster) => (
            <div
              key={cluster.id}
              className="relative overflow-hidden rounded-lg bg-neutral-800 p-5 ring-1 ring-neutral-700/60"
            >
              <span
                aria-hidden="true"
                className="road-line-y absolute bottom-4 left-0 top-4 [--road-color:var(--color-primary)]"
              />
              <div className="pl-4">
                <p className="font-display text-lg font-bold uppercase tracking-wide text-white">
                  {cluster.region}
                </p>
                <div className="mt-3 flex flex-col gap-1 text-sm">
                  <a
                    href={`https://wa.me/${cluster.whatsapp.replace(/\D+/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-fit items-center gap-2 rounded-md py-2.5 font-display text-base font-semibold tracking-wide text-neutral-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-800"
                  >
                    <WhatsappIcon className="h-4 w-4" />
                    <span>{cluster.whatsapp}</span>
                  </a>
                  <a
                    href={`https://instagram.com/${cluster.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-fit items-center gap-2 rounded-md py-2.5 text-neutral-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-800"
                  >
                    <InstagramIcon className="h-4 w-4" />
                    <span>{cluster.instagram}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Akreditasi */}
        <div className="mb-6 border-t border-neutral-800 pt-4 text-center text-xs uppercase tracking-widest text-neutral-400">
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
