import Link from "next/link";
import type { Metadata } from "next";

/*
 * Halaman Cara Pakai (/app/cara-pakai). Panduan singkat perjalanan siswa
 * dari daftar hingga unduh kartu — versi ringkas dengan tautan langsung ke
 * tiap halaman dalam aplikasi.
 *
 * Server Component — tidak butuh data domain, murni konten statis.
 */

export const metadata: Metadata = {
  title: "Cara Pakai — Kursus Mengemudi Pulung",
};

interface Step {
  number: number;
  title: string;
  desc: string;
  href?: string;
  linkLabel?: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: "Pilih paket kursus",
    desc: 'Buka halaman katalog, pilih antara Paket Manual, Paket Matic, atau Paket Kombinasi. Klik "Daftar" untuk lihat detail, lalu "Daftar Sekarang" untuk lanjut bayar.',
    href: "/catalog",
    linkLabel: "Ke Katalog →",
  },
  {
    number: 2,
    title: "Bayar via QRIS",
    desc: 'Scan kode QR dengan aplikasi e-wallet atau mobile banking kamu, lalu klik "Bayar dengan QRIS". Kalau pembayaran ditolak admin, ada tombol "Coba Lagi dengan QRIS" — langsung bayar ulang dari sana.',
  },
  {
    number: 3,
    title: "Tunggu konfirmasi admin",
    desc: "Setelah bayar, status berubah jadi Menunggu Konfirmasi Admin. Admin akan cek dan verifikasi — biasanya cepat di jam kerja. Setelah dikonfirmasi, kamu bisa pilih jadwal.",
  },
  {
    number: 4,
    title: "Pilih jadwal sesi",
    desc: 'Buka halaman Jadwal, pilih slot yang kosong, klik "Pesan". Kalau ada error bentrok (instruktur penuh atau jam sama), coba pilih slot lain. Bisa dibatalkan kapan saja.',
    href: "/app/jadwal",
    linkLabel: "Ke Jadwal →",
  },
  {
    number: 5,
    title: "Unduh invoice & kartu siswa",
    desc: "Invoice PDF tersedia di halaman Invoice untuk pembayaran yang sudah terverifikasi. Kartu Siswa PDF tersedia di halaman Kartu Siswa setelah pendaftaranmu terkonfirmasi.",
    href: "/app/invoice",
    linkLabel: "Ke Invoice →",
  },
];

export default function CaraPakaiPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-md bg-neutral-50 px-4 py-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Panduan Siswa
        </p>
        <h1 className="mt-1 text-2xl font-bold text-neutral-900">Cara Pakai</h1>
        <p className="mt-1 text-sm text-neutral-600">
          5 langkah dari daftar sampai dapat kartu siswa. Santai aja!
        </p>
      </header>

      <ol className="flex flex-col gap-4">
        {STEPS.map((step) => (
          <li
            key={step.number}
            className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {step.number}
              </span>
              <h2 className="text-sm font-bold text-neutral-900">{step.title}</h2>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">{step.desc}</p>
            {step.href && step.linkLabel ? (
              <Link
                href={step.href}
                className="mt-3 inline-flex items-center text-xs font-semibold text-primary hover:text-primary-dark"
              >
                {step.linkLabel}
              </Link>
            ) : null}
          </li>
        ))}
      </ol>

      {/* Kartu quick-links */}
      <section
        aria-labelledby="dokumen-heading"
        className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
      >
        <h2
          id="dokumen-heading"
          className="mb-3 text-sm font-bold text-neutral-900"
        >
          Halaman yang sering kamu butuhkan
        </h2>
        <ul className="flex flex-col gap-2">
          <li>
            <Link
              href="/app/jadwal"
              className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
            >
              Pilih Jadwal
              <span className="text-neutral-400">→</span>
            </Link>
          </li>
          <li>
            <Link
              href="/app/invoice"
              className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
            >
              Invoice Pembayaran
              <span className="text-neutral-400">→</span>
            </Link>
          </li>
          <li>
            <Link
              href="/app/kartu"
              className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
            >
              Kartu Siswa
              <span className="text-neutral-400">→</span>
            </Link>
          </li>
        </ul>
      </section>

      {/* WA help */}
      <section className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs font-semibold text-primary">Butuh bantuan?</p>
        <p className="mt-1 text-xs text-neutral-600">
          Hubungi admin Pulung lewat WhatsApp — Cluster A (MERR/Selatan):{" "}
          <span className="font-semibold">+62 851-0087-0957</span>, Cluster B
          (Manyar/Pusat):{" "}
          <span className="font-semibold">+62 812-3253-1989</span>.
        </p>
      </section>

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
