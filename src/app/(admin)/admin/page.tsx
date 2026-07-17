import Link from "next/link";
import type { Metadata } from "next";
import {
  getDomainSummary,
  getPembayaranByStatus,
  getSiswa,
} from "@/lib/domain";
import { formatIDR } from "@/lib/format";
import { getPackageById } from "@/lib/catalog-data";

/*
 * Dasbor Admin — shell kosong bermerek untuk epik E3. Menampilkan ringkasan
 * operasional dari modul domain (siswa, instruktur, sesi, pembayaran) + antrean
 * pembayaran yang menunggu konfirmasi admin (PRD F5). Dijaga oleh layout
 * (role 'admin') dan proxy.ts.
 *
 * Catatan: tidak ada tombol "konfirmasi" fungsional di slice ini — server
 * actions setRole/removeRole ada di ./actions.ts; konfirmasi pembayaran adalah
 * epik E5/E8.
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
  const recentSiswa = getSiswa().slice(0, 5);

  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-neutral-50 px-4 py-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Panel Admin
        </p>
        <h1 className="mt-1 text-2xl font-bold text-neutral-900">
          Dasbor Admin
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Kelola data siswa, jadwal instruktur, dan konfirmasi pembayaran Kursus
          Mengemudi Pulung.
        </p>
      </header>

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
                </li>
              );
            })}
          </ul>
        )}
      </section>

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
