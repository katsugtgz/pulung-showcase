import { getBranches, getClusters, getPackages } from "@/lib/catalog-data";

/*
 * Experience band — dark polarity band (bg-primary) between Packages and
 * LocationPicker (issue #50 ticket #53). Facts from catalog-data only:
 * 2000 founding, branch/cluster/package counts, verified registration line.
 *
 * Redesign "rambu": band = jalan malam. Marka putus-putus putih horizontal
 * membelah band (bukan blob blur), angka statistik memakai display
 * kondensasi oversized seperti patok kilometer, dan setiap sel statistik
 * dipisah marka solid tipis. Heading left-aligned (rhythm break vs
 * Packages/Location yang centered).
 */
export function ExperienceBand() {
  const branchCount = getBranches().length;
  const clusterCount = getClusters().length;
  const packageCount = getPackages().length;

  return (
    <section
      aria-label="Pengalaman Pulung"
      className="relative overflow-hidden bg-primary px-6 py-14 text-white lg:px-8 lg:py-20"
    >
      {/* Road marking: dashed white center line across the band */}
      <div
        aria-hidden="true"
        className="road-line-x pointer-events-none absolute left-0 right-0 top-1/2 opacity-25 [--road-color:#fff]"
      />
      {/* Solid edge line top — thin, like the road edge marking */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 top-6 h-px bg-white/20"
      />

      <div className="relative mx-auto max-w-md lg:max-w-7xl">
        <div className="max-w-2xl">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-white">
            Pengalaman yang Bisa Dipercaya
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold uppercase leading-[1.02] tracking-tight text-white lg:text-5xl">
            Lebih dari 25 tahun mengajar Surabaya berkendara dengan aman.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/90 lg:text-base">
            {/*
              Verified facts only (no SIM-registration claim — the FAQ hedges
              SIM assistance as owner-unverified, so this band must not assert
              it more strongly). Founding year + cluster admin routing are both
              verified in contact.md + research brief.
            */}
            Sejak 2000, Pulung mengajar calon pengemudi Surabaya berkendara
            dengan aman. Setiap cabang punya admin klaster yang siap membantu
            pendaftaranmu.
          </p>
        </div>

        {/*
          Stat grid — kilometer-post numbers: oversized condensed display,
          cells separated by white/25 dividers (no inset card chrome).
        */}
        <dl className="mt-12 grid grid-cols-2 gap-y-10 sm:grid-cols-4 sm:divide-x sm:divide-white/25">
          <div className="sm:px-6 sm:first:pl-0">
            <dt className="text-[11px] font-semibold uppercase tracking-widest text-white">
              Tahun Berdiri
            </dt>
            <dd className="mt-1 font-display text-5xl font-semibold leading-none tracking-tight text-white lg:text-6xl">
              2000
            </dd>
          </div>
          <div className="sm:px-6">
            <dt className="text-[11px] font-semibold uppercase tracking-widest text-white">
              Cabang Aktif
            </dt>
            <dd className="mt-1 font-display text-5xl font-semibold leading-none tracking-tight text-white lg:text-6xl">
              {branchCount}
              <span className="ml-1 font-sans text-sm font-medium text-white/80">cabang</span>
            </dd>
          </div>
          <div className="sm:px-6">
            <dt className="text-[11px] font-semibold uppercase tracking-widest text-white">
              Klaster Area
            </dt>
            <dd className="mt-1 font-display text-5xl font-semibold leading-none tracking-tight text-white lg:text-6xl">
              {clusterCount}
              <span className="ml-1 font-sans text-sm font-medium text-white/80">klaster</span>
            </dd>
          </div>
          <div className="sm:px-6 sm:last:pr-0">
            <dt className="text-[11px] font-semibold uppercase tracking-widest text-white">
              Pilihan Paket
            </dt>
            <dd className="mt-1 font-display text-5xl font-semibold leading-none tracking-tight text-white lg:text-6xl">
              {packageCount}
              <span className="ml-1 font-sans text-sm font-medium text-white/80">paket</span>
            </dd>
          </div>
        </dl>

        {/*
          Registration line — verified copy already rendered in credibility
          strip + footer. Repeated here as the closing trust anchor of the
          band. No new claim, no testimonial, no price.
        */}
        <p className="mt-12 border-t border-white/25 pt-6 text-center text-xs font-medium uppercase tracking-widest text-white lg:text-sm">
          Terdaftar KORLANTAS POLRI &amp; Dishub Surabaya
        </p>
      </div>
    </section>
  );
}
