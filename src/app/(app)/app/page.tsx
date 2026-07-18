import Link from "next/link";
import type { Metadata } from "next";
import { UserButton } from "@clerk/nextjs";
import {
  getPembayaranBySiswa,
  getSesiBySiswa,
  getSiswaById,
} from "@/lib/domain";
import { getPackageById } from "@/lib/catalog-data";
import { formatIDR, formatDate } from "@/lib/format";

/*
 * Dasbor Siswa — halaman Beranda area siswa (/app). Menampilkan jadwal sesi
 * dan status pembayaran siswa contoh dari modul domain (siswa-001).
 *
 * Shell <AppShell/> di layout menyediakan: <main> kontainer, header desktop
 * (wordmark + nav + UserButton), dan bottom nav mobile. Halaman ini hanya
 * bertanggung jawab atas kontennya.
 *
 * Catatan: slice ini menampilkan data mock siswa-001 sebagai perwakilan demo.
 * Pengikatan ke Clerk user id sesungguhnya adalah epik sesudahnya.
 */

export const metadata: Metadata = {
  title: "Dasbor Siswa — Kursus Mengemudi Pulung",
};

const ENROLLMENT_LABEL: Record<string, string> = {
  menunggu_bayar: "Menunggu Pembayaran",
  menunggu_konfirmasi: "Menunggu Konfirmasi Admin",
  terkonfirmasi: "Pendaftaran Terkonfirmasi",
  jadwal_dipilih: "Jadwal Sudah Dipilih",
  selesai: "Kursus Selesai",
};

const PAYMENT_LABEL: Record<string, string> = {
  pending: "Menunggu Verifikasi",
  terverifikasi: "Terverifikasi",
  ditolak: "Ditolak",
};

const DEMO_SISWA_ID = "siswa-001";

export default function SiswaDashboardPage() {
  const siswa = getSiswaById(DEMO_SISWA_ID);
  const pkg = getPackageById(siswa.packageId);
  const sessions = getSesiBySiswa(DEMO_SISWA_ID);
  const payments = getPembayaranBySiswa(DEMO_SISWA_ID);
  const latestPayment = payments[payments.length - 1];

  // Tampilkan tautan bayar jika belum ada pembayaran atau pembayaran terakhir
  // ditolak — siswa perlu mencoba kembali dari halaman pembayaran.
  const showPaymentLink =
    !latestPayment || latestPayment.status === "ditolak";
  const paymentLinkLabel =
    latestPayment?.status === "ditolak" ? "Coba Lagi Bayar" : "Bayar Sekarang";

  return (
    <div className="flex flex-col gap-8">
      {/*
        Mobile-only UserButton bar. Pada desktop (lg+) header AppShell sudah
        menyediakan UserButton — di-hide di sini untuk menghindari duplikat
        (spec #59: "Clerk UserButton di header melayani profil"). Mobile tidak
        punya header, jadi UserButton perlu tetap tersedia untuk sign-out.
      */}
      <div className="mb-2 flex justify-end lg:hidden">
        <UserButton />
      </div>

      <header>
        <h1 className="text-2xl font-bold text-neutral-900">
          Halo, {siswa.fullName.split(" ")[0]}!
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          {pkg.name} — pantau jadwal dan status pembayaran kursus Anda.
        </p>
      </header>

      <section
        aria-labelledby="status-heading"
        className="rounded-2xl border border-primary/20 bg-primary/5 p-4"
      >
        <h2 id="status-heading" className="sr-only">
          Status pendaftaran
        </h2>
        <p className="text-xs uppercase tracking-wide text-primary">
          Status Pendaftaran
        </p>
        <p className="mt-1 text-lg font-bold text-neutral-900">
          {ENROLLMENT_LABEL[siswa.enrollmentStatus] ?? siswa.enrollmentStatus}
        </p>
        {showPaymentLink && (
          <Link
            href={`/catalog/${siswa.packageId}/payment`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent-dark"
          >
            {paymentLinkLabel}
            <svg
              className="h-3.5 w-3.5"
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
        )}
      </section>

      <section aria-labelledby="schedule-heading">
        <h2
          id="schedule-heading"
          className="mb-3 text-base font-bold text-neutral-900"
        >
          Jadwal Sesi Anda
        </h2>
        {sessions.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
            Belum ada sesi terjadwal. Jadwal dapat dipilih setelah pembayaran
            terkonfirmasi.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sessions.map((sesi) => (
              <li
                key={sesi.id}
                className="rounded-xl border border-neutral-200 bg-white p-4"
              >
                <p className="text-sm font-semibold text-neutral-900">
                  {formatDate(sesi.date)}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {sesi.startTime}–{sesi.endTime} WIB
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/*
        Tautan Cara Pakai — /app/cara-pakai BUKAN tab bottom nav (spec #59),
        tetap di-link dari Beranda. Diletakkan setelah jadwal karena alur
        pakai relevan setelah siswa melihat sesi mereka.
      */}
      <Link
        href="/app/cara-pakai"
        className="inline-flex w-fit items-center text-sm font-medium text-primary hover:text-primary-dark"
      >
        Cara pakai aplikasi →
      </Link>

      {latestPayment ? (
        <section aria-labelledby="payment-heading">
          <h2
            id="payment-heading"
            className="mb-3 text-base font-bold text-neutral-900"
          >
            Status Pembayaran
          </h2>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {pkg.name}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {latestPayment.method.toUpperCase()} · {latestPayment.createdAt}
                </p>
              </div>
              <span className="flex-shrink-0 text-sm font-bold text-neutral-900">
                {formatIDR(latestPayment.amountIdr)}
              </span>
            </div>
            <p
              className={`mt-3 text-xs font-medium ${
                latestPayment.status === "ditolak"
                  ? "text-accent"
                  : "text-primary"
              }`}
            >
              {PAYMENT_LABEL[latestPayment.status] ?? latestPayment.status}
            </p>
            {latestPayment.status === "ditolak" && (
              <Link
                href={`/catalog/${siswa.packageId}/payment`}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent underline underline-offset-2 hover:text-accent-dark"
              >
                Coba lagi bayar →
              </Link>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
