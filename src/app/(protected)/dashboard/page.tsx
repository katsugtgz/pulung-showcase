import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserMenu } from "@/components/user-menu";

/*
 * Dasbor Demo — pusat navigasi demo untuk akun yang sudah login. Jembatan
 * cepat ke katalog, dasbor siswa, dasbor admin, dan beranda publik, plus
 * lencana peran akun (RBAC via publicMetadata.role, lihat
 * src/types/globals.d.ts).
 *
 * Seperti landing publik, halaman ini dibungkus Clerk hanya via layout grup
 * (protected); tidak ada <ClerkProvider> per-halaman. Mode pass-through saat
 * NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY belum dipasang mengikuti pola ADR-002
 * (lihat DECISIONS.md).
 */
const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

type NavCard = {
  href: string;
  title: string;
  desc: string;
};

const NAV_CARDS: readonly NavCard[] = [
  {
    href: "/catalog",
    title: "Katalog Kursus",
    desc: "Lihat paket kursus & alur pembayaran QRIS (mock).",
  },
  {
    href: "/app",
    title: "Dasbor Siswa",
    desc: "Jadwal, kartu siswa, invoice. Butuh akun berperan siswa.",
  },
  {
    href: "/admin",
    title: "Dasbor Admin",
    desc: "Kelola siswa, jadwal, ekspor. Butuh akun berperan admin.",
  },
  {
    href: "/",
    title: "Beranda Publik",
    desc: "Halaman landing publik.",
  },
];

export default async function DashboardPage() {
  let role: string | undefined;
  if (clerkEnabled) {
    const { sessionClaims } = await auth();
    role = sessionClaims?.metadata?.role;
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-neutral-50 lg:max-w-3xl">
      <div className="flex items-center justify-between px-6 py-4">
        <span className="select-none text-xl font-black tracking-tight text-accent">
          PULUNG
        </span>
        <UserMenu />
      </div>
      <main className="flex flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-neutral-900">Dasbor Demo</h1>
          <p className="text-sm text-neutral-600">
            Pusat navigasi demo — pilih tujuan untuk menjelajah alur aplikasi
            Kursus Mengemudi Pulung.
          </p>
          <span className="w-fit rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            Peran akun: {role ?? "belum diatur"}
          </span>
        </div>

        <nav aria-label="Navigasi demo">
          <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {NAV_CARDS.map((card) => (
              <li key={card.href}>
                <Link
                  href={card.href}
                  className="block rounded-xl border border-neutral-200 bg-white p-4 transition hover:shadow-md hover:ring-1 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <p className="font-semibold text-neutral-900">
                    {card.title}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">{card.desc}</p>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-xs text-neutral-500">
          Tautan berperan akan kembali ke beranda jika peran akun tidak cocok.
        </p>
      </main>
    </div>
  );
}
