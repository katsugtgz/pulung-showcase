import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getSiswaById,
  getPembayaranBySiswa,
  getSesiBySiswa,
  nextEnrollmentStatus,
} from "@/lib/domain";
import { getPackageById, getBranchById, getPackages, getBranches } from "@/lib/catalog-data";
import { formatIDR } from "@/lib/format";
import { EditSiswaForm } from "../edit-form";
import { AdvanceStatusForm } from "../advance-status-form";
import {
  ENROLLMENT_LABEL,
  ENROLLMENT_BADGE_CLASS,
} from "../enrollment-labels";

/*
 * Halaman detail + edit siswa — /admin/siswa/[id].
 * Menampilkan informasi lengkap siswa, riwayat pembayaran, dan sesi,
 * serta formulir untuk mengedit data dasar dan memajukan status pendaftaran.
 *
 * Ini adalah Server Component. Bagian interaktif (EditSiswaForm,
 * AdvanceStatusForm) adalah komponen klien terpisah.
 */

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const siswa = getSiswaById(id);
    return {
      title: `${siswa.fullName} — Kelola Siswa — Kursus Mengemudi Pulung`,
    };
  } catch {
    return { title: "Siswa tidak ditemukan — Kursus Mengemudi Pulung" };
  }
}

const PEMBAYARAN_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Verifikasi",
  terverifikasi: "Terverifikasi",
  ditolak: "Ditolak",
};

const PEMBAYARAN_STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  terverifikasi: "bg-green-100 text-green-800",
  ditolak: "bg-red-100 text-red-800",
};

const SESI_STATUS_LABEL: Record<string, string> = {
  tersedia: "Tersedia",
  dipesan: "Dipesan",
  selesai: "Selesai",
};

export default async function AdminSiswaDetailPage({ params }: PageProps) {
  const { id } = await params;

  let siswa;
  try {
    siswa = getSiswaById(id);
  } catch {
    notFound();
  }

  const pkg = getPackageById(siswa.packageId);
  const branch = getBranchById(siswa.branchId);
  const pembayaranList = getPembayaranBySiswa(siswa.id);
  const sesiList = getSesiBySiswa(siswa.id);
  const nextStatuses = nextEnrollmentStatus(siswa.enrollmentStatus);
  const packages = getPackages();
  const branches = getBranches();

  const badgeClass =
    ENROLLMENT_BADGE_CLASS[siswa.enrollmentStatus] ??
    "bg-neutral-100 text-neutral-600";
  const statusLabel =
    ENROLLMENT_LABEL[siswa.enrollmentStatus] ?? siswa.enrollmentStatus;

  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-neutral-50 px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Panel Admin · Kelola Siswa
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">
            {siswa.fullName}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            ID: {siswa.id} · terdaftar {siswa.createdAt}
          </p>
        </header>
        <Link
          href="/admin/siswa"
          className="flex-shrink-0 text-sm font-medium text-primary hover:text-primary-dark"
        >
          ← Daftar Siswa
        </Link>
      </div>

      {/* Status saat ini */}
      <section aria-labelledby="status-heading" className="mb-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Status Pendaftaran
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-900">
                {pkg.name} · {branch.name}
              </p>
            </div>
            <span
              className={`flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>
      </section>

      {/* Edit status pendaftaran */}
      <section aria-labelledby="advance-status-heading" className="mb-4">
        <h2
          id="advance-status-heading"
          className="mb-3 text-base font-bold text-neutral-900"
        >
          Majukan Status Pendaftaran
        </h2>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <AdvanceStatusForm
            siswaId={siswa.id}
            currentStatus={siswa.enrollmentStatus}
            nextStatuses={nextStatuses}
          />
        </div>
      </section>

      {/* Edit data siswa */}
      <section aria-labelledby="edit-heading" className="mb-4">
        <h2
          id="edit-heading"
          className="mb-3 text-base font-bold text-neutral-900"
        >
          Edit Data Siswa
        </h2>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <EditSiswaForm
            siswa={siswa}
            packages={packages}
            branches={branches}
          />
        </div>
      </section>

      {/* Riwayat pembayaran */}
      <section aria-labelledby="pembayaran-heading" className="mb-4">
        <h2
          id="pembayaran-heading"
          className="mb-3 text-base font-bold text-neutral-900"
        >
          Riwayat Pembayaran
        </h2>
        {pembayaranList.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
            Belum ada riwayat pembayaran.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pembayaranList.map((pembayaran) => {
              const pembayaranPkg = getPackageById(pembayaran.packageId);
              const pStatusClass =
                PEMBAYARAN_STATUS_CLASS[pembayaran.status] ??
                "bg-neutral-100 text-neutral-600";
              const pStatusLabel =
                PEMBAYARAN_STATUS_LABEL[pembayaran.status] ?? pembayaran.status;
              return (
                <li
                  key={pembayaran.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {pembayaranPkg.name}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {pembayaran.method.toUpperCase()} · {pembayaran.createdAt}
                        {pembayaran.verifiedAt
                          ? ` · diverifikasi ${pembayaran.verifiedAt}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="flex-shrink-0 text-sm font-bold text-neutral-900">
                        {formatIDR(pembayaran.amountIdr)}
                      </span>
                      <span
                        className={`flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${pStatusClass}`}
                      >
                        {pStatusLabel}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Sesi / Jadwal */}
      <section aria-labelledby="sesi-heading" className="mb-4">
        <h2
          id="sesi-heading"
          className="mb-3 text-base font-bold text-neutral-900"
        >
          Jadwal Sesi
        </h2>
        {sesiList.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
            Belum ada sesi yang terdaftar.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sesiList.map((sesi) => (
              <li
                key={sesi.id}
                className="rounded-xl border border-neutral-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {sesi.date}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {sesi.startTime} – {sesi.endTime}
                    </p>
                  </div>
                  <span className="flex-shrink-0 rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                    {SESI_STATUS_LABEL[sesi.status] ?? sesi.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
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
