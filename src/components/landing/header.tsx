import Link from "next/link";

/*
 * Header — thin sticky bar fused with the blue Hero field (one continuous
 * banner, no seam). Wordmark uses the shared license-plate lockup (ADR-004).
 * Nav links get a road-line underline (dashed accent) on hover — the single
 * motion cue in the bar. Auth links stay static <Link> (ADR-002: zero Clerk
 * JS on the public landing).
 */
export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/15 bg-primary px-6 py-3 text-white lg:px-8">
      <div className="mx-auto flex max-w-md lg:max-w-7xl items-center justify-between gap-3">
        {/*
          Wordmark — plate lockup ADR-004 (white plate gives ~5:1 contrast,
          passes WCAG large-text; same lockup as Hero & Footer).
        */}
        <Link
          href="/"
          aria-label="P PULUNG — beranda"
          className="inline-flex select-none items-center gap-2 rounded-md bg-white py-1 pl-1.5 pr-4 shadow-md shadow-primary-dark/30 ring-1 ring-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-sm bg-accent font-display text-xs font-bold text-white"
          >
            P
          </span>
          <span className="font-display text-xl font-semibold uppercase tracking-[0.14em] text-neutral-900 lg:text-2xl">
            PULUNG
          </span>
        </Link>

        {/* Desktop nav (lg+) — Paket, Cara Kerja, Lokasi, FAQ. Dashed
            road-line underline grows on hover (motion answers the pointer). */}
        <nav aria-label="Navigasi utama" className="hidden gap-6 lg:flex">
          {(
            [
              ["#packages", "Paket"],
              ["#cara-kerja", "Cara Kerja"],
              ["#lokasi", "Lokasi"],
              ["#faq", "FAQ"],
            ] as const
          ).map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="t-nav-link group relative rounded-md py-1 text-sm font-medium text-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              {label}
              <span
                aria-hidden="true"
                className="road-line-x absolute -bottom-1 left-0 right-0 scale-x-0 opacity-0 transition-transform duration-300 group-hover:scale-x-100 group-hover:opacity-100 group-focus-visible:scale-x-100 group-focus-visible:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:scale-x-100 motion-reduce:group-hover:opacity-100 [--road-color:#fff]"
              />
            </Link>
          ))}
        </nav>

        {/*
          Auth links — static <Link> (ADR-002). Mobile demotes to compact
          text links so the section pill nav below keeps priority (ticket #55).
        */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/sign-in"
            className="t-header-action rounded-md px-2 py-1 text-xs font-semibold text-white/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:rounded-md sm:border sm:border-white/50 sm:px-3 sm:py-1.5 sm:text-sm sm:text-white"
          >
            Masuk
          </Link>
          <Link
            href="/sign-up"
            className="t-header-action rounded-md bg-accent/90 px-2 py-1 text-xs font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:rounded-md sm:px-3 sm:py-1.5 sm:text-sm sm:shadow-sm sm:shadow-accent/30"
          >
            Daftar
          </Link>
        </div>
      </div>

      {/*
        Mobile anchor nav (ticket #55) — scrollable plate-chip row below lg.
        Solid border + white text keeps contrast on the blue field (WCAG
        4.5:1); bg-white/25 lifts on hover.
      */}
      <nav aria-label="Navigasi section (mobile)" className="lg:hidden">
        <ul className="mx-auto flex max-w-md gap-2 overflow-x-auto pb-1 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(
            [
              ["#packages", "Paket"],
              ["#cara-kerja", "Cara Kerja"],
              ["#lokasi", "Lokasi"],
              ["#faq", "FAQ"],
            ] as const
          ).map(([href, label]) => (
            <li key={href} className="flex-shrink-0">
              <Link
                href={href}
                className="inline-flex items-center rounded-md border border-white/50 bg-white/25 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.98]"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
