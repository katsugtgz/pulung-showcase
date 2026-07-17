import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPackages, getPackageById } from "@/lib/catalog-data";
import type { Package } from "@/lib/catalog-data";
import { formatIDR } from "@/lib/format";
import PayButton from "./PayButton";

/*
 * Layar pembayaran QRIS mock (terlindungi). Menampilkan ringkasan pesanan,
 * kode QR statis (placeholder), dan tombol 'Bayar dengan QRIS' yang hanya
 * meniru alur pembayaran — TIDAK ada payment provider sungguhan.
 */

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
        {/* Order summary */}
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

        {/* QR code */}
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

          {/* Amount */}
          <p className="text-xs text-neutral-500">Total Pembayaran</p>
          <p className="text-2xl font-bold text-neutral-900">
            {formatIDR(pkg.priceIdr)}
          </p>

          {/* Instructions */}
          <p className="mt-3 text-center text-sm text-neutral-600">
            Scan QRIS di atas menggunakan aplikasi mobile banking atau e-wallet
            Anda.
          </p>
          <p className="mt-1 text-center text-xs font-medium text-accent">
            (Demo — pembayaran tidak benar-benar diproses)
          </p>
        </section>

        {/* Pay button */}
        <section className="mb-4">
          <PayButton />
        </section>

        {/* Back link */}
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
