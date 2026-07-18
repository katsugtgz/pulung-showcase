import Link from "next/link";
import type { Metadata } from "next";
import { getSiswaById } from "@/lib/domain";
import { getBranchById, getBranchCluster, getPackageById } from "@/lib/catalog-data";
import { formatDate } from "@/lib/format";

/*
 * Halaman pratinjau Kartu Siswa (/app/kartu). Menampilkan versi HTML kartu
 * bermerek dan tombol unduh ke /app/kartu/unduh (route handler PDF).
 *
 * Jika status pendaftaran belum terkonfirmasi, tombol unduh diganti dengan
 * pemberitahuan — sinkron dengan gate di route handler.
 *
 * Demo convention: selalu menampilkan siswa-001 (sama seperti /app/page.tsx).
 */

export const metadata: Metadata = {
  title: "Kartu Siswa — Kursus Mengemudi Pulung",
};

// Statuses that block PDF download (mirrors route.ts gate).
const BLOCKED_STATUSES = new Set(["menunggu_bayar", "menunggu_konfirmasi"]);

// Demo mapping — same convention as /app/page.tsx.
const DEMO_SISWA_ID = "siswa-001";

const ENROLLMENT_LABEL: Record<string, string> = {
  menunggu_bayar: "Menunggu Pembayaran",
  menunggu_konfirmasi: "Menunggu Konfirmasi Admin",
  terkonfirmasi: "Pendaftaran Terkonfirmasi",
  jadwal_dipilih: "Jadwal Sudah Dipilih",
  selesai: "Kursus Selesai",
};

const TRANSMISSION_LABEL: Record<string, string> = {
  manual: "Manual",
  matic: "Matic",
  mixed: "Manual + Matic",
};

export default function KartuSiswaPage() {
  const siswa = getSiswaById(DEMO_SISWA_ID);
  const pkg = getPackageById(siswa.packageId);
  const branch = getBranchById(siswa.branchId);
  const cluster = getBranchCluster(siswa.branchId);

  const isBlocked = BLOCKED_STATUSES.has(siswa.enrollmentStatus);
  const enrollmentYear = siswa.createdAt.slice(0, 4);
  const clusterRegion = cluster.region.includes("(")
    ? cluster.region.split("(")[0].trim()
    : cluster.region;
  const packageDisplayName = pkg.name.includes(" (")
    ? pkg.name.split(" (")[0]
    : pkg.name;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-neutral-50 px-4 py-8 lg:max-w-3xl">
      {/* Page header */}
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Kartu Siswa
        </p>
        <h1 className="mt-1 text-2xl font-bold text-neutral-900">
          Unduh Kartu Siswa
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Kartu identitas resmi peserta kursus Kursus Mengemudi Pulung.
        </p>
      </header>

      {/* Card preview (HTML rendition) */}
      <section
        aria-label="Pratinjau kartu siswa"
        className="mb-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm lg:mx-auto lg:max-w-md"
      >
        {/* Blue header band */}
        <div className="bg-primary px-5 py-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-lg font-bold tracking-wide text-white">
              PULUNG
            </p>
            <p className="text-xs text-white/70">No. {siswa.id}</p>
          </div>
          <p className="text-[10px] text-white/80">
            Kursus Mengemudi Pulung — Safe Drive Training · Sejak 2000
          </p>
        </div>

        {/* Red accent stripe */}
        <div className="h-1 bg-accent" />

        {/* Card body */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Kartu Siswa
          </p>
          <p className="mt-1 text-xl font-bold text-neutral-900">
            {siswa.fullName}
          </p>

          <hr className="my-3 border-neutral-200" />

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                No. Kartu
              </dt>
              <dd className="mt-0.5 text-sm font-bold text-neutral-900">
                {siswa.id}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Tahun Masuk
              </dt>
              <dd className="mt-0.5 text-sm font-bold text-neutral-900">
                {enrollmentYear}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Paket Kursus
              </dt>
              <dd className="mt-0.5 text-sm font-bold text-neutral-900">
                {packageDisplayName}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Transmisi
              </dt>
              <dd className="mt-0.5 text-sm font-bold text-neutral-900">
                {TRANSMISSION_LABEL[pkg.transmission] ?? pkg.transmission}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Cabang
              </dt>
              <dd className="mt-0.5 text-sm font-bold text-neutral-900">
                {branch.name}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Wilayah
              </dt>
              <dd className="mt-0.5 text-sm font-bold text-neutral-900">
                {clusterRegion}
              </dd>
            </div>
          </dl>
        </div>

        {/* Footer motto strip */}
        <div className="bg-primary px-5 py-2">
          <p className="text-sm font-bold text-white">Safe Drive Training</p>
          <p className="text-[10px] text-white/70">
            Sejak 2000 — Kursus Mengemudi Pulung, Surabaya
          </p>
        </div>
      </section>

      {/* Enrollment status */}
      <section
        aria-labelledby="status-heading"
        className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4"
      >
        <p className="text-xs uppercase tracking-wide text-primary" id="status-heading">
          Status Pendaftaran
        </p>
        <p className="mt-1 text-sm font-bold text-neutral-900">
          {ENROLLMENT_LABEL[siswa.enrollmentStatus] ?? siswa.enrollmentStatus}
        </p>
        {isBlocked && (
          <p className="mt-2 text-xs text-neutral-600">
            Terdaftar {formatDate(siswa.createdAt)}
          </p>
        )}
      </section>

      {/* Download action */}
      {isBlocked ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm font-semibold text-neutral-700">
            Kartu belum tersedia
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            {siswa.enrollmentStatus === "menunggu_bayar"
              ? "Selesaikan pembayaran dulu ya — kartu siswa baru bisa diunduh setelah admin mengkonfirmasi pendaftaranmu."
              : "Pembayaranmu sedang dicek admin. Kartu siswa akan tersedia begitu pendaftaranmu terkonfirmasi."}
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            Sudah bayar tapi belum dikonfirmasi? Hubungi admin lewat WhatsApp.
          </p>
        </div>
      ) : (
        // prefetch={false} prevents Next.js from pre-fetching the PDF binary
        <Link
          href="/app/kartu/unduh"
          prefetch={false}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-white hover:bg-accent-dark"
        >
          Unduh Kartu Siswa (PDF)
        </Link>
      )}

      <footer className="mt-10 border-t border-neutral-200 pt-6">
        <Link
          href="/app"
          className="text-sm font-medium text-primary hover:text-primary-dark"
        >
          ← Kembali ke dasbor
        </Link>
      </footer>
    </main>
  );
}
