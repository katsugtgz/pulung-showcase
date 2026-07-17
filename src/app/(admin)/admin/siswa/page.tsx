import Link from "next/link";
import type { Metadata } from "next";
import { getSiswa } from "@/lib/domain";
import { getPackageById, getBranchById } from "@/lib/catalog-data";
import { ENROLLMENT_LABEL, ENROLLMENT_BADGE_CLASS } from "./enrollment-labels";

/*
 * Halaman daftar siswa — /admin/siswa.
 * Menampilkan semua siswa dari domain store dengan nama, paket, cabang,
 * dan badge status pendaftaran. Setiap baris memiliki tautan ke halaman
 * detail siswa (/admin/siswa/[id]).
 *
 * Ini adalah Server Component; bagian interaktif ada di halaman detail.
 */

export const metadata: Metadata = {
  title: "Kelola Siswa — Kursus Mengemudi Pulung",
};

export default function AdminSiswaPage() {
  const siswaList = getSiswa();

  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-neutral-50 px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Panel Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">
            Kelola Siswa
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Daftar semua siswa terdaftar di Kursus Mengemudi Pulung.
          </p>
        </header>
        <Link
          href="/admin"
          className="flex-shrink-0 text-sm font-medium text-primary hover:text-primary-dark"
        >
          ← Dasbor
        </Link>
      </div>

      <section aria-labelledby="siswa-list-heading">
        <h2 id="siswa-list-heading" className="sr-only">
          Daftar siswa
        </h2>

        {siswaList.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
            Belum ada siswa terdaftar.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {siswaList.map((siswa) => {
              const pkg = getPackageById(siswa.packageId);
              const branch = getBranchById(siswa.branchId);
              const badgeClass =
                ENROLLMENT_BADGE_CLASS[siswa.enrollmentStatus] ??
                "bg-neutral-100 text-neutral-600";
              const statusLabel =
                ENROLLMENT_LABEL[siswa.enrollmentStatus] ??
                siswa.enrollmentStatus;

              return (
                <li key={siswa.id}>
                  <Link
                    href={`/admin/siswa/${siswa.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {siswa.fullName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        {pkg.name} · {branch.name} · terdaftar {siswa.createdAt}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
                    >
                      {statusLabel}
                    </span>
                  </Link>
                </li>
              );
            })}
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
