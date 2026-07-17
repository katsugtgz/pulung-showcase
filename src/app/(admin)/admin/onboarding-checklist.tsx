"use client";

/**
 * OnboardingChecklist — kartu panduan pertama login untuk admin.
 *
 * Ditampilkan hanya saat pertama masuk (sebelum dismiss). Kondisi dismiss
 * disimpan di localStorage agar tidak muncul lagi setelah ditutup. Komponen
 * ter-render dalam kondisi collapsed hingga mounted (menghindari hydration
 * mismatch / layout shift).
 */

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "pulung_admin_onboarding_dismissed";

interface ChecklistItem {
  id: string;
  label: string;
  href: string;
  description: string;
}

const ITEMS: ChecklistItem[] = [
  {
    id: "siswa",
    label: "Kelola Data Siswa",
    href: "/admin/siswa",
    description: "Lihat daftar siswa, edit data, dan majukan status pendaftaran.",
  },
  {
    id: "jadwal-instruktur",
    label: "Atur Jadwal Instruktur",
    href: "/admin/jadwal-instruktur",
    description: "Tambah, ubah, atau hapus slot ketersediaan instruktur.",
  },
  {
    id: "jadwal-siswa",
    label: "Kelola Jadwal Siswa",
    href: "/admin/jadwal-siswa",
    description: "Pindahkan atau batalkan sesi booking siswa.",
  },
  {
    id: "pembayaran",
    label: "Konfirmasi Pembayaran",
    href: "#pending-heading",
    description: "Verifikasi bukti transfer QRIS dari siswa (Konfirmasi / Tolak).",
  },
  {
    id: "ekspor",
    label: "Ekspor Data Excel",
    href: "/admin/ekspor",
    description: "Unduh data siswa, jadwal, dan pembayaran dalam format .xlsx.",
  },
];

export function OnboardingChecklist() {
  // Mulai false hingga mounted agar tidak ada hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setDismissed(stored === "true");
    setMounted(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  }

  // Sebelum mount: render null (hindari layout shift)
  if (!mounted) return null;
  // Setelah dismiss: hilangkan tanpa sisa
  if (dismissed) return null;

  return (
    <section
      aria-labelledby="onboarding-heading"
      className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2
            id="onboarding-heading"
            className="text-sm font-bold text-primary"
          >
            Selamat datang di Dasbor Admin!
          </h2>
          <p className="mt-0.5 text-xs text-neutral-600">
            Berikut panduan singkat untuk memulai pengelolaan data Kursus Mengemudi Pulung.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Tutup panduan onboarding"
          className="flex-shrink-0 rounded-md p-1 text-neutral-400 transition hover:bg-primary/10 hover:text-primary"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <ol className="flex flex-col gap-2">
        {ITEMS.map((item, index) => (
          <li key={item.id} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <Link
                href={item.href}
                className="text-sm font-semibold text-primary hover:underline"
              >
                {item.label}
              </Link>
              <p className="mt-0.5 text-xs text-neutral-600">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={dismiss}
        className="mt-4 w-full rounded-lg border border-primary/30 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
      >
        Saya sudah mengerti — tutup panduan ini
      </button>
    </section>
  );
}
