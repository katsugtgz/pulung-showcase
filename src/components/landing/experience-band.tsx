import { getBranches, getClusters, getPackages } from "@/lib/catalog-data";

/*
 * Experience band — single dark polarity band that breaks the white-card
 * rhythm of the middle landing (issue #50 ticket #53). Surface is bg-primary
 * (the legal second primary band per design-contract.md §5 — hero is the
 * first; footer uses neutral-900 not primary). Placement: between Packages
 * and LocationPicker — converts the visitor's package interest into trust
 * immediately before the cluster-routing handoff.
 *
 * Content rule: every fact flows from catalog-data (no invented metrics).
 * - "Sejak 2000" / 25+ tahun — verified in contact.md + research brief.
 * - Branch count — getBranches().length (currently 5).
 * - Cluster count — getClusters().length (currently 2).
 * - Package count — getPackages().length (currently 3).
 * - "Terdaftar KORLANTAS POLRI & Dishub Surabaya" — verified registration
 *   (already rendered verbatim in the credibility strip + footer).
 *
 * Visual treatment:
 *  - bg-primary field with text-white body, text-white/90+ secondary text.
 *  - Asymmetric: heading left-aligned on desktop (varies rhythm vs the
 *    centered-heading packages section above and location section below).
 *  - 3-up stat grid at sm+; stacked 1-up on mobile with breathing room.
 *  - Decorative blurred accent corner (aria-hidden) preserves the banner
 *    motif established in hero. No new image asset (no Lighthouse penalty).
 *  - "Cabang Utama" tag and pricing claims are NOT here — only verified
 *    counts and the verified registration line.
 */
export function ExperienceBand() {
  const branchCount = getBranches().length;
  const clusterCount = getClusters().length;
  const packageCount = getPackages().length;

  return (
    <section
      aria-label="Pengalaman Pulung"
      className="relative overflow-hidden bg-primary px-6 py-12 text-white lg:px-8 lg:py-20"
    >
      {/* Decorative blurred accent — mirrors the hero banner motif, aria-hidden */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-24 h-80 w-80 rounded-full bg-primary-light/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-md lg:max-w-7xl">
        {/*
          Heading left-aligned at every breakpoint — varies rhythm vs the
          centered-heading sections above (Packages) and below (Location).
          The "25 tahun" claim is the verified founding-year delta from 2000.
        */}
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/95">
            Pengalaman yang Bisa Dipercaya
          </p>
          <h2 className="mt-3 text-balance text-2xl font-bold leading-tight text-white lg:text-3xl">
            Lebih dari 25 tahun mengajar Surabaya berkendara dengan aman.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/90 lg:text-base">
            Sejak 2000, Pulung mendaftarkan calon pengemudi ke ujian SIM dengan
            kurikulum yang terdaftar resmi. Setiap cabang punya admin klaster
            yang siap membantu pendaftaranmu.
          </p>
        </div>

        {/*
          Stat grid — every number sourced from catalog-data, no invented
          metrics. 1-col mobile → 3-col sm+ → 4-col lg. Each stat cell uses
          a hairline divider + neutral-50/10 inset surface (NOT white-card
          chrome — keeps the dark polarity without breaking the band).
        */}
        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:mt-10 lg:gap-6">
          <div className="rounded-xl bg-white/10 px-4 py-5 ring-1 ring-white/15">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-white/90">
              Tahun Berdiri
            </dt>
            <dd className="mt-1 text-3xl font-black tracking-tight text-white lg:text-4xl">
              2000
            </dd>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-5 ring-1 ring-white/15">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-white/90">
              Cabang Aktif
            </dt>
            <dd className="mt-1 text-3xl font-black tracking-tight text-white lg:text-4xl">
              {branchCount}
              <span className="ml-1 text-sm font-medium text-white/80">cabang</span>
            </dd>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-5 ring-1 ring-white/15">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-white/90">
              Klaster Area
            </dt>
            <dd className="mt-1 text-3xl font-black tracking-tight text-white lg:text-4xl">
              {clusterCount}
              <span className="ml-1 text-sm font-medium text-white/80">klaster</span>
            </dd>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-5 ring-1 ring-white/15">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-white/90">
              Pilihan Paket
            </dt>
            <dd className="mt-1 text-3xl font-black tracking-tight text-white lg:text-4xl">
              {packageCount}
              <span className="ml-1 text-sm font-medium text-white/80">paket</span>
            </dd>
          </div>
        </dl>

        {/*
          Registration line — verified copy already rendered in credibility
          strip + footer. Repeated here as the closing trust anchor of the
          band. No new claim, no testimonial, no price.
        */}
        <p className="mt-8 text-center text-xs font-medium uppercase tracking-wide text-white/80 lg:mt-10 lg:text-sm">
          Terdaftar KORLANTAS POLRI &amp; Dishub Surabaya
        </p>
      </div>
    </section>
  );
}
