import Link from "next/link";
import type { Metadata } from "next";
import { UserMenu } from "@/components/user-menu";
import {
  getDomainSummary,
  getPembayaran,
  getPembayaranByStatus,
  getSiswa,
} from "@/lib/domain";
import { formatIDR } from "@/lib/format";
import { getPackageById } from "@/lib/catalog-data";
import PembayaranActionButtons from "./PembayaranActionButtons";
import { OnboardingChecklist } from "./onboarding-checklist";

/*
 * Dasbor Admin — shell bermerek untuk epik E3/E5. Menampilkan ringkasan
 * operasional dari modul domain (siswa, instruktur, sesi, pembayaran) +
 * notifikasi dan antrean pembayaran yang menunggu konfirmasi (PRD F5) dengan
 * tombol Konfirmasi / Tolak fungsional.
 *
 * Dijaga oleh layout (role 'admin') dan proxy.ts.
 */

export const metadata: Metadata = {
  title: "Dasbor Admin — Kursus Mengemudi Pulung",
};

const ENROLLMENT_LABEL: Record<string, string> = {
  menunggu_bayar: "Menunggu Bayar",
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  terkonfirmasi: "Terkonfirmasi",
  jadwal_dipilih: "Jadwal Dipilih",
  selesai: "Selesai",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  terverifikasi: "Terverifikasi",
  ditolak: "Ditolak",
};

interface StatCardProps {
  label: string;
  value: number;
  hint?: string;
}

function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}

export default function AdminDashboardPage() {
  const summary = getDomainSummary();
  const pendingPayments = getPembayaranByStatus("pending");
  const allPayments = getPembayaran();
  const nonPendingPayments = allPayments.filter((p) => p.status !== "pending");
  const recentSiswa = getSiswa().slice(0, 5);

  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-neutral-50 px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Panel Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">
            Dasbor Admin
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Kelola data siswa, jadwal instruktur, dan konfirmasi pembayaran
            Kursus Mengemudi Pulung.
          </p>
        </header>
        <UserMenu />
      </div>

      {/* Kartu onboarding pertama login */}
      <OnboardingChecklist />

      {/* Notifikasi pembayaran menunggu konfirmasi */}
      {pendingPayments.length > 0 && (
        <a
          href="#pending-heading"
          className="mb-6 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
          aria-label={`${pendingPayments.length} pembayaran menunggu konfirmasi — klik untuk lihat antrean`}
        >
          <span aria-hidden="true">🔔</span>
          <span>
            {pendingPayments.length} pembayaran menunggu konfirmasi
          </span>
          <svg
            className="ml-auto h-4 w-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </a>
      )}

      <section aria-labelledby="stats-heading" className="mb-8">
        <h2 id="stats-heading" className="sr-only">
          Ringkasan operasional
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Siswa"
            value={summary.totalSiswa}
            hint={`${summary.siswaAktif} siswa aktif`}
          />
          <StatCard label="Instruktur" value={summary.totalInstruktur} />
          <StatCard
            label="Sesi Terjadwal"
            value={summary.sesiTerjadwal}
            hint={`dari ${summary.totalSesi} total sesi`}
          />
          <StatCard
            label="Menunggu Konfirmasi"
            value={summary.pembayaranMenungguKonfirmasi}
            hint="pembayaran belum diverifikasi"
          />
        </div>
      </section>

      {/* Antrean pembayaran pending dengan tombol aksi */}
      <section aria-labelledby="pending-heading" className="mb-8">
        <h2
          id="pending-heading"
          className="mb-3 text-base font-bold text-neutral-900"
        >
          Pembayaran Menunggu Konfirmasi
        </h2>
        {pendingPayments.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
            Tidak ada pembayaran menunggu konfirmasi.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pendingPayments.map((payment) => {
              const siswa = getSiswa().find((s) => s.id === payment.siswaId);
              const pkg = getPackageById(payment.packageId);
              return (
                <li
                  key={payment.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {siswa?.fullName ?? "Siswa tidak dikenal"}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {pkg.name} · {payment.method.toUpperCase()} ·{" "}
                        {payment.createdAt}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-sm font-bold text-neutral-900">
                      {formatIDR(payment.amountIdr)}
                    </span>
                  </div>
                  {/* Tombol aksi — client component */}
                  <PembayaranActionButtons pembayaranId={payment.id} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Riwayat pembayaran (terverifikasi & ditolak) */}
      {nonPendingPayments.length > 0 && (
        <section aria-labelledby="history-heading" className="mb-8">
          <h2
            id="history-heading"
            className="mb-3 text-base font-bold text-neutral-900"
          >
            Riwayat Pembayaran
          </h2>
          <ul className="flex flex-col gap-2">
            {nonPendingPayments.map((payment) => {
              const siswa = getSiswa().find((s) => s.id === payment.siswaId);
              const pkg = getPackageById(payment.packageId);
              const isVerified = payment.status === "terverifikasi";
              return (
                <li
                  key={payment.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-900">
                      {siswa?.fullName ?? "Siswa tidak dikenal"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      {pkg.name} · {payment.method.toUpperCase()} ·{" "}
                      {payment.createdAt}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-bold text-neutral-900">
                      {formatIDR(payment.amountIdr)}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        isVerified
                          ? "bg-green-100 text-green-700"
                          : "bg-accent/10 text-accent"
                      }`}
                    >
                      {PAYMENT_STATUS_LABEL[payment.status] ?? payment.status}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="siswa-heading">
        <h2
          id="siswa-heading"
          className="mb-3 text-base font-bold text-neutral-900"
        >
          Siswa Terbaru
        </h2>
        <ul className="flex flex-col gap-2">
          {recentSiswa.map((siswa) => {
            const pkg = getPackageById(siswa.packageId);
            return (
              <li
                key={siswa.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-900">
                    {siswa.fullName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {pkg.name} · terdaftar {siswa.createdAt}
                  </p>
                </div>
                <span className="flex-shrink-0 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {ENROLLMENT_LABEL[siswa.enrollmentStatus] ??
                    siswa.enrollmentStatus}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Navigasi cepat ke halaman kelola */}
      <section aria-labelledby="kelola-heading" className="mb-8">
        <h2
          id="kelola-heading"
          className="mb-3 text-base font-bold text-neutral-900"
        >
          Kelola
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/admin/siswa"
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:border-primary/30 hover:bg-primary/5"
          >
            <svg className="h-4 w-4 flex-shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Data Siswa
          </Link>
          <Link
            href="/admin/jadwal-instruktur"
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:border-primary/30 hover:bg-primary/5"
          >
            <svg className="h-4 w-4 flex-shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Jadwal Instruktur
          </Link>
          <Link
            href="/admin/jadwal-siswa"
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:border-primary/30 hover:bg-primary/5"
          >
            <svg className="h-4 w-4 flex-shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Jadwal Siswa
          </Link>
          <Link
            href="/admin/ekspor"
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:border-primary/30 hover:bg-primary/5"
          >
            <svg className="h-4 w-4 flex-shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Ekspor Excel
          </Link>
        </div>
      </section>

      <footer className="mt-10 border-t border-neutral-200 pt-6">
        <Link
          href="/"
          className="text-sm font-medium text-primary hover:text-primary-dark"
        >
          ← Kembali ke beranda
        </Link>
      </footer>
    </main>
  );
}
