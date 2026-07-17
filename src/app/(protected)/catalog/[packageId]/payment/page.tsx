import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPackages, getPackageById } from "@/lib/catalog-data";
import type { Package } from "@/lib/catalog-data";
import { formatIDR } from "@/lib/format";
import { getPembayaranBySiswa } from "@/lib/domain";
import PayButton from "./PayButton";

/*
 * Layar pembayaran QRIS (terlindungi). Menampilkan ringkasan pesanan, kode
 * QR statis (placeholder), dan UI yang disesuaikan berdasarkan status
 * pembayaran terkini dari domain store.
 *
 * Demo note: signed-in Clerk user dipetakan ke siswa seed "siswa-001" —
 * konvensi yang sama dengan (app)/app/page.tsx. Pengikatan ke Clerk userId
 * sesungguhnya adalah epik sesudahnya.
 */

// Demo mapping: signed-in Clerk user → seed siswa "siswa-001".
const DEMO_SISWA_ID = "siswa-001";

type Params = { params: Promise<{ packageId: string }> };

export function generateStaticParams() {
  return getPackages().map((pkg) => ({ packageId: pkg.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { packageId } = await params;
  try {
    const pkg = getPackageById(packageId);
    return { title: `Pembayaran ${pkg.name} — Kursus Mengemudi Pulung` };
  } catch {
    return { title: "Pembayaran — Kursus Mengemudi Pulung" };
  }
}

export default async function PaymentPage({ params }: Params) {
  const { packageId } = await params;
  let pkg: Package;
  try {
    pkg = getPackageById(packageId);
  } catch {
    notFound();
  }

  // Ambil status pembayaran terkini untuk siswa demo pada paket ini.
  const payments = getPembayaranBySiswa(DEMO_SISWA_ID).filter(
    (p) => p.packageId === packageId,
  );
  const latestPayment = payments[payments.length - 1];
  const paymentStatus = latestPayment?.status;

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-neutral-50">
      {/* Header */}
      <header className="bg-primary px-5 pb-6 pt-8 text-white shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href={`/catalog/${pkg.id}`}
            aria-label="Kembali ke detail paket"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
          >
            <svg
              className="h-4 w-4 text-white"
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
          <h1 className="text-xl font-bold tracking-tight">Pembayaran QRIS</h1>
        </div>
      </header>

      <div className="px-5 py-6">
        {/* Ringkasan pesanan */}
        <section className="mb-6">
          <h2 className="mb-3 text-base font-bold text-neutral-900">
            Ringkasan Pesanan
          </h2>
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-neutral-500">Paket</dt>
                <dd className="font-semibold text-neutral-900">{pkg.name}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-neutral-500">Jumlah Sesi</dt>
                <dd className="font-semibold text-neutral-900">
                  {pkg.sessionCount}x pertemuan
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
                <dt className="text-neutral-500">Total Harga</dt>
                <dd className="text-lg font-bold text-neutral-900">
                  {formatIDR(pkg.priceIdr)}
                </dd>
              </div>
            </dl>
            <p className="mt-1 text-[10px] italic text-neutral-400">
              *harga contoh — harga final dikonfirmasi admin via WhatsApp
            </p>
          </div>
        </section>

        {/* Status area — tampilan berbeda berdasarkan status pembayaran */}
        {paymentStatus === "terverifikasi" ? (
          /* Pembayaran sudah dikonfirmasi admin */
          <section className="mb-6">
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-6 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-7 w-7 text-green-600"
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
              </div>
              <p className="text-base font-bold text-green-800">
                Pembayaran Terkonfirmasi
              </p>
              <p className="text-sm text-green-700">
                Pembayaran Anda telah diverifikasi admin. Silakan cek dasbor
                siswa untuk memilih jadwal kursus.
              </p>
              <Link
                href="/app"
                className="mt-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                Ke Dasbor Siswa
              </Link>
            </div>
          </section>
        ) : paymentStatus === "pending" ? (
          /* Menunggu verifikasi admin */
          <section className="mb-6">
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-base font-bold text-primary">
                Menunggu Konfirmasi Admin
              </p>
              <p className="text-sm text-neutral-600">
                Pembayaran QRIS Anda sedang diproses. Admin akan memverifikasi
                dan mengkonfirmasi segera.
              </p>
            </div>
          </section>
        ) : (
          /* Belum ada pembayaran atau ditolak — tampilkan QR dan tombol bayar */
          <>
            {paymentStatus === "ditolak" && (
              <section className="mb-6">
                <div className="flex flex-col gap-2 rounded-2xl border border-accent/30 bg-accent/5 p-4">
                  <p className="text-sm font-semibold text-accent">
                    Pembayaran Ditolak
                  </p>
                  <p className="text-xs text-neutral-600">
                    Pembayaran sebelumnya ditolak oleh admin. Silakan coba
                    kembali dengan scan ulang QRIS di bawah.
                  </p>
                </div>
              </section>
            )}

            {/* Kode QR */}
            <section className="mb-6 flex flex-col items-center">
              <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/qris-placeholder.svg"
                  alt="Kode QRIS placeholder untuk pembayaran demo"
                  className="h-56 w-56"
                  width={224}
                  height={224}
                />
              </div>

              <p className="text-xs text-neutral-500">Total Pembayaran</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatIDR(pkg.priceIdr)}
              </p>

              <p className="mt-3 text-center text-sm text-neutral-600">
                Scan QRIS di atas menggunakan aplikasi mobile banking atau
                e-wallet Anda.
              </p>
              <p className="mt-1 text-center text-xs font-medium text-accent">
                (Demo — pembayaran tidak benar-benar diproses)
              </p>
            </section>

            {/* Tombol bayar */}
            <section className="mb-4">
              <PayButton
                packageId={pkg.id}
                label={
                  paymentStatus === "ditolak"
                    ? "Coba Lagi dengan QRIS"
                    : "Bayar dengan QRIS"
                }
              />
            </section>
          </>
        )}

        {/* Tautan kembali */}
        <Link
          href={`/catalog/${pkg.id}`}
          className="block text-center text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          Kembali ke detail paket
        </Link>
      </div>
    </main>
  );
}
