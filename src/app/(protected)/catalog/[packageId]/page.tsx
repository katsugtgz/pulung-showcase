import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPackages, getPackageById } from "@/lib/catalog-data";
import type { Package, TransmissionType } from "@/lib/catalog-data";
import { formatIDR } from "@/lib/format";

/*
 * Halaman detail paket kursus (terlindungi). Menampilkan info lengkap paket:
 * sesi, durasi, kendaraan, harga contoh, materi pembelajaran, dan rincian
 * pertemuan. Tombol 'Daftar Sekarang' menuju layar pembayaran QRIS mock.
 */

type Params = { params: Promise<{ packageId: string }> };

const TRANSMISSION_LABEL: Record<TransmissionType, string> = {
  manual: "Manual",
  matic: "Matic",
  mixed: "Kombinasi",
};

/*
 * Materi pembelajaran per jenis transmisi (konten dummy untuk demo).
 * Dipilih dari fitur paket + topik khas tiap transmisi.
 */
function getLearningTopics(pkg: Package): string[] {
  const topics: Record<TransmissionType, string[]> = {
    manual: [
      "Pengenalan mesin dan sistem kopling",
      "Teknik persneling yang halus",
      "Menaklukkan tanjakan tanpa mundur",
      "Manuver dan parkir mobil manual",
    ],
    matic: [
      "Pengenalan transmisi otomatis",
      "Pengendaraan halus di lalu lintas kota",
      "Teknik parkir paralel dan seri",
      "Manuver ruang sempit dengan percaya diri",
    ],
    mixed: [
      "Seluruh materi transmisi manual",
      "Seluruh materi transmisi matic",
      "Transisi mulus antar transmisi",
      "Persiapan ujian SIM A menyeluruh",
    ],
  };
  return topics[pkg.transmission];
}

interface SessionItem {
  title: string;
  description: string;
}

/*
 * Rincian pertemuan (sesi) — konten dummy untuk demo. Dibangun dari jumlah
 * sesi paket dan jenis transmisi agar selalu sesuai data.
 */
function buildSessionBreakdown(pkg: Package): SessionItem[] {
  const baseManual: SessionItem[] = [
    { title: "Sesi 1: Pengenalan Kendaraan", description: "Fungsi panel instrumen, kopling, dan persneling." },
    { title: "Sesi 2: Teknik Dasar Kopling", description: "Menyalakan mesin dan mulai berjalan halus." },
    { title: "Sesi 3: Pindah Persneling", description: "Naik-turun gigi pada kecepatan yang tepat." },
    { title: "Sesi 4: Tanjakan", description: "Teknik kopling di tanjakan tanpa mundur." },
    { title: "Sesi 5: Manuver Dasar", description: "Belok, memutar, dan bermanuver di ruang sempit." },
    { title: "Sesi 6: Parkir", description: "Parkir paralel, seri, dan mundur (back-up)." },
    { title: "Sesi 7: Jalan Raya", description: "Berkendara di lalu lintas dan rambu jalan." },
    { title: "Sesi 8: Simulasi Ujian", description: "Latihan menghadapi rute ujian SIM A." },
  ];
  const baseMatic: SessionItem[] = [
    { title: "Sesi 1: Pengenalan Kendaraan", description: "Panel instrumen dan tuas transmisi otomatis." },
    { title: "Sesi 2: Stir dan Rem", description: "Teknik pengereman halus dan kontrol kemudi." },
    { title: "Sesi 3: Berkendara Lambat", description: "Kontrol kecepatan di area latihan." },
    { title: "Sesi 4: Parkir", description: "Parkir paralel dan manuver ruang sempit." },
    { title: "Sesi 5: Jalan Kota", description: "Navigasi lalu lintas perkotaan." },
    { title: "Sesi 6: Manuver Lanjutan", description: "Memutar dan bermanuver di ruang terbatas." },
    { title: "Sesi 7: Jalan Cepat", description: "Berkendara di jalan arteri dan tol." },
    { title: "Sesi 8: Simulasi Ujian", description: "Latihan menghadapi rute ujian SIM A." },
  ];
  const baseMixed: SessionItem[] = [
    { title: "Sesi 1: Pengenalan Kedua Transmisi", description: "Perbedaan dan kesamaan manual & matic." },
    { title: "Sesi 2: Dasar Kopling (Manual)", description: "Menyalakan mesin dan mulai berjalan halus." },
    { title: "Sesi 3: Persneling Manual", description: "Naik-turun gigi pada kecepatan yang tepat." },
    { title: "Sesi 4: Tanjakan Manual", description: "Teknik kopling di tanjakan tanpa mundur." },
    { title: "Sesi 5: Transisi ke Matic", description: "Beralih ke transmisi otomatis dengan lancar." },
    { title: "Sesi 6: Matic di Kota", description: "Navigasi lalu lintas perkotaan dengan matic." },
    { title: "Sesi 7: Parkir & Manuver", description: "Parkir paralel dan manuver kedua transmisi." },
    { title: "Sesi 8: Jalan Raya", description: "Berkendara jarak jauh di kedua transmisi." },
    { title: "Sesi 9: Parkir Lanjutan", description: "Manuver kompleks dan parkir mundur." },
    { title: "Sesi 10: Ujian Manual", description: "Simulasi rute ujian SIM dengan mobil manual." },
    { title: "Sesi 11: Ujian Matic", description: "Simulasi rute ujian SIM dengan mobil matic." },
    { title: "Sesi 12: Penilaian Akhir", description: "Evaluasi kesiapan menghadapi ujian SIM A." },
  ];

  const base: Record<TransmissionType, SessionItem[]> = {
    manual: baseManual,
    matic: baseMatic,
    mixed: baseMixed,
  };
  return base[pkg.transmission].slice(0, pkg.sessionCount);
}

export function generateStaticParams() {
  return getPackages().map((pkg) => ({ packageId: pkg.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { packageId } = await params;
  try {
    const pkg = getPackageById(packageId);
    return { title: `${pkg.name} — Kursus Mengemudi Pulung` };
  } catch {
    return { title: "Paket tidak ditemukan — Kursus Mengemudi Pulung" };
  }
}

export default async function CourseDetailPage({ params }: Params) {
  const { packageId } = await params;
  let pkg: Package;
  try {
    pkg = getPackageById(packageId);
  } catch {
    notFound();
  }

  const topics = getLearningTopics(pkg);
  const sessions = buildSessionBreakdown(pkg);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-neutral-50 lg:max-w-5xl">
      {/* Hero image + back button */}
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/course-hero.svg"
          alt="Ilustrasi kursus mengemudi Pulung"
          className="h-56 w-full object-cover lg:h-80"
          width={800}
          height={400}
        />
        <Link
          href="/catalog"
          aria-label="Kembali ke katalog"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition hover:bg-white"
        >
          <svg
            className="h-5 w-5 text-neutral-700"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
      </div>

      {/* Content card (overlapping the hero) */}
      <div className="relative -mt-4 rounded-t-3xl bg-neutral-50 px-5 pb-32 pt-6 lg:px-10 lg:pt-10">
        {/* Title + badge */}
        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {TRANSMISSION_LABEL[pkg.transmission]}
            </span>
          </div>
          <h1 className="text-2xl font-bold leading-tight text-neutral-900">
            {pkg.name}
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Kuasai teknik mengemudi {TRANSMISSION_LABEL[pkg.transmission].toLowerCase()} dengan aman,
            nyaman, dan percaya diri bersama instruktur bersertifikat.
          </p>
        </section>

        {/* Key info grid */}
        <section className="mb-6">
          <h2 className="mb-3 text-base font-bold text-neutral-900">Informasi Paket</h2>
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-3">
              <dt className="text-xs text-neutral-500">Jumlah Sesi</dt>
              <dd className="text-lg font-bold text-neutral-900">
                {pkg.sessionCount}x
              </dd>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-3">
              <dt className="text-xs text-neutral-500">Durasi Total</dt>
              <dd className="text-lg font-bold text-neutral-900">
                {pkg.durationHours} jam
              </dd>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-3">
              <dt className="text-xs text-neutral-500">Kendaraan</dt>
              <dd className="text-sm font-bold text-neutral-900">
                {pkg.vehicle}
              </dd>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-3">
              <dt className="text-xs text-neutral-500">Harga Contoh</dt>
              <dd className="text-sm font-bold text-neutral-900">
                {formatIDR(pkg.priceIdr)}
              </dd>
            </div>
          </dl>
          <p className="mt-1 text-[10px] italic text-neutral-400">
            *harga contoh — harga final dikonfirmasi admin via WhatsApp
          </p>
        </section>

        {/* Learning topics */}
        <section className="mb-6">
          <h2 className="mb-3 text-base font-bold text-neutral-900">
            Apa yang akan Anda pelajari
          </h2>
          <ul className="flex flex-col gap-2">
            {topics.map((topic) => (
              <li
                key={topic}
                className="flex items-start gap-2 text-sm text-neutral-700"
              >
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    clipRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    fillRule="evenodd"
                  />
                </svg>
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Session breakdown */}
        <section>
          <h2 className="mb-3 text-base font-bold text-neutral-900">
            Rincian Pertemuan
          </h2>
          <ol className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {sessions.map((session) => (
              <li
                key={session.title}
                className="rounded-xl border border-neutral-200 bg-white p-3"
              >
                <h3 className="text-sm font-semibold text-neutral-900">
                  {session.title}
                </h3>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {session.description}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Sticky bottom CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-neutral-200 bg-white px-5 py-4 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] lg:max-w-5xl lg:px-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-neutral-500">Total Harga</span>
            <span className="text-xl font-bold text-neutral-900">
              {formatIDR(pkg.priceIdr)}
            </span>
            <span className="text-[10px] italic text-neutral-400">
              *harga contoh
            </span>
          </div>
          <Link
            href={`/catalog/${pkg.id}/payment`}
            className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-dark"
          >
            Daftar Sekarang
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
