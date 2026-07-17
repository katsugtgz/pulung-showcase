import type { Metadata } from "next";
import Link from "next/link";

/*
 * Halaman Ekspor / Sinkron Excel (Slice 24) — Admin.
 *
 * Menampilkan tiga kartu unduh .xlsx (siswa, jadwal, pembayaran) dan satu
 * kartu impor berlabel stub demo (tidak aktif). Semua string dalam Bahasa
 * Indonesia. Dijaga oleh layout admin (role 'admin').
 */

export const metadata: Metadata = {
  title: "Ekspor Data — Kursus Mengemudi Pulung",
};

interface ExportCardProps {
  title: string;
  description: string;
  href: string;
  filename: string;
}

function ExportCard({ title, description, href, filename }: ExportCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
          <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
        </div>
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <div className="mt-3">
        <Link
          href={href}
          prefetch={false}
          download={filename}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Unduh .xlsx
        </Link>
      </div>
    </div>
  );
}

export default function EksporPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-neutral-50 px-4 py-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Panel Admin
        </p>
        <h1 className="mt-1 text-2xl font-bold text-neutral-900">
          Ekspor / Sinkron Excel
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Unduh data operasional Kursus Mengemudi Pulung dalam format .xlsx
          untuk keperluan pelaporan dan rekap.
        </p>
      </header>

      <section aria-labelledby="ekspor-heading" className="mb-8">
        <h2
          id="ekspor-heading"
          className="mb-3 text-base font-bold text-neutral-900"
        >
          Unduh Data
        </h2>
        <div className="flex flex-col gap-3">
          <ExportCard
            title="Data Siswa"
            description="Daftar seluruh siswa beserta paket, cabang, wilayah, dan status pendaftaran."
            href="/admin/ekspor/unduh/siswa"
            filename="pulung-siswa.xlsx"
          />
          <ExportCard
            title="Jadwal Sesi"
            description="Seluruh slot sesi instruktur: tanggal, waktu, status, dan siswa yang dipesan."
            href="/admin/ekspor/unduh/jadwal"
            filename="pulung-jadwal.xlsx"
          />
          <ExportCard
            title="Pembayaran"
            description="Riwayat pembayaran siswa: jumlah, metode, status verifikasi, dan tanggal."
            href="/admin/ekspor/unduh/pembayaran"
            filename="pulung-pembayaran.xlsx"
          />
        </div>
      </section>

      <section aria-labelledby="impor-heading">
        <h2
          id="impor-heading"
          className="mb-3 text-base font-bold text-neutral-900"
        >
          Impor Data
        </h2>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-neutral-900">
                  Impor dari Spreadsheet
                </p>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                  Stub demo — impor belum aktif
                </span>
              </div>
              <p className="mt-0.5 text-xs text-neutral-500">
                Fitur impor spreadsheet akan tersedia di versi penuh.
              </p>
            </div>
          </div>
          {/* Dropzone stub — visual only, no interactivity */}
          <div
            aria-disabled="true"
            className="mt-4 flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 px-6 py-8 text-center opacity-50"
          >
            <svg
              className="h-8 w-8 text-neutral-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm font-medium text-neutral-500">
              Seret dan lepas file .xlsx di sini
            </p>
            <p className="text-xs text-neutral-400">
              (Fitur ini belum aktif pada versi demo)
            </p>
          </div>
        </div>
      </section>

      <footer className="mt-10 border-t border-neutral-200 pt-6">
        <Link
          href="/admin"
          className="text-sm font-medium text-primary hover:opacity-80"
        >
          ← Kembali ke Dasbor Admin
        </Link>
      </footer>
    </main>
  );
}
