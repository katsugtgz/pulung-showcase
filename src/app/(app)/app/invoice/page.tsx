import Link from "next/link";
import type { Metadata } from "next";
import { getPembayaranBySiswa, getSiswaById } from "@/lib/domain";
import { getPackageById } from "@/lib/catalog-data";
import { formatDate, formatIDR } from "@/lib/format";
import { invoiceNumber } from "@/lib/pdf/invoice";
import { PretextText } from "@/components/landing/pretext-text";

/*
 * Halaman Daftar Invoice (/app/invoice). Menampilkan seluruh pembayaran demo
 * siswa (siswa-001): baris terverifikasi mendapat tautan unduh PDF beserta
 * nomor invoice; baris pending/ditolak hanya menampilkan status.
 *
 * Demo convention: selalu menampilkan siswa-001 (sama seperti /app/page.tsx).
 */

export const metadata: Metadata = {
  title: "Invoice — Kursus Mengemudi Pulung",
};

// Demo mapping — same convention as /app/page.tsx and /app/kartu/page.tsx.
const DEMO_SISWA_ID = "siswa-001";

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Verifikasi",
  terverifikasi: "Terverifikasi",
  ditolak: "Ditolak",
};

const METHOD_LABEL: Record<string, string> = {
  qris: "QRIS",
  manual: "Manual",
};

export default function InvoicePage() {
  const siswa = getSiswaById(DEMO_SISWA_ID);
  const payments = getPembayaranBySiswa(DEMO_SISWA_ID);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-neutral-50 px-4 py-8 lg:max-w-3xl">
      {/* Page header */}
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Invoice
        </p>
        <h1 className="mt-1 text-2xl font-bold text-neutral-900">
          Invoice Pembayaran
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Riwayat pembayaran kursus atas nama {siswa.fullName}.
        </p>
      </header>

      {/* Payment list */}
      {payments.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">
            Belum ada data pembayaran. Pilih paket di halaman katalog dan
            selesaikan pembayaran QRIS untuk mulai kursus.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {payments.map((p) => {
            const pkg = getPackageById(p.packageId);
            const isVerified = p.status === "terverifikasi";
            const invNum = isVerified ? invoiceNumber(p) : null;

            return (
              <li
                key={p.id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
              >
                {/* Card header band */}
                <div className="bg-primary px-4 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold tracking-wide text-white">
                      PULUNG
                    </p>
                    {invNum ? (
                      <p className="text-[10px] text-white/80">{invNum}</p>
                    ) : (
                      <p className="text-[10px] text-white/60">{p.id}</p>
                    )}
                  </div>
                </div>
                {/* Red accent stripe */}
                <div className="h-0.5 bg-accent" />

                {/* Card body */}
                <div className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <PretextText
                        text={pkg.name}
                        font="700 14px Inter, ui-sans-serif, system-ui, sans-serif"
                        lineHeight={20}
                        maxLines={2}
                        className="text-sm font-bold text-neutral-900"
                        fallbackClassName="truncate text-sm font-bold text-neutral-900"
                      />
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {METHOD_LABEL[p.method] ?? p.method} ·{" "}
                        {formatDate(p.createdAt)}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-sm font-bold text-neutral-900">
                      {formatIDR(p.amountIdr)}
                    </span>
                  </div>

                  {/* Status + action */}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        isVerified
                          ? "bg-primary/10 text-primary"
                          : p.status === "ditolak"
                            ? "bg-accent/10 text-accent"
                            : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {PAYMENT_STATUS_LABEL[p.status] ?? p.status}
                    </span>

                    {isVerified ? (
                      <Link
                        href={`/app/invoice/${p.id}/unduh`}
                        prefetch={false}
                        className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-white hover:bg-accent-dark"
                      >
                        Unduh PDF
                      </Link>
                    ) : null}
                  </div>

                  {/* Verified date shown for terverifikasi */}
                  {isVerified && p.verifiedAt ? (
                    <p className="mt-2 text-[11px] text-neutral-400">
                      Diverifikasi: {formatDate(p.verifiedAt)}
                    </p>
                  ) : null}

                  {/* Guidance for non-verified states */}
                  {p.status === "pending" ? (
                    <p className="mt-2 text-[11px] text-neutral-500">
                      Admin sedang memverifikasi pembayaranmu — invoice akan
                      tersedia begitu dikonfirmasi.
                    </p>
                  ) : p.status === "ditolak" ? (
                    <p className="mt-2 text-[11px] text-neutral-500">
                      Pembayaran ini ditolak. Coba bayar ulang lewat halaman
                      katalog paket.
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
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
