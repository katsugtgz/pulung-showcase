import { UserMenu } from "@/components/user-menu";

/*
 * Dasbor Siswa (placeholder). Menjadi rumah kontrol akun terautentikasi:
 * <UserButton/> (keluar/kelola akun) yang dulu ada di header landing kini di
 * sini, karena landing publik dibuat bebas Clerk. Lihat DECISIONS.md ADR-002.
 *
 * <ClerkProvider> yang dibutuhkan <UserButton/> kini disediakan oleh layout
 * grup (protected) via <AuthProvider>, bukan lagi dibungkus per-halaman.
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-neutral-50">
      <div className="flex items-center justify-between px-6 py-4">
        <span className="select-none text-xl font-black tracking-tight text-accent">
          PULUNG
        </span>
        <UserMenu />
      </div>
      <main className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Dasbor Siswa</h1>
        <p className="text-neutral-600">Halaman terlindungi (segera hadir).</p>
      </main>
    </div>
  );
}
