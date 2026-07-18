import { UserButton } from "@clerk/nextjs";

/*
 * UserMenu — pembungkus aman untuk <UserButton/> Clerk di dasbor siswa + admin.
 *
 * Saat NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY belum dipasang (mode pass-through
 * ADR-002 — <AuthProvider> merender fragment kosong), <UserButton/> AKAN
 * melempar error runtime karena komponen Clerk butuh ClerkProvider yang
 * benar-benar ter-mount (bukan sekadar fragment). Di mode demo tanpa kunci,
 * kitarender placeholder statis agar halaman tetap jalan untuk pratinjau.
 *
 * Lihat catatan di src/components/auth-provider.tsx.
 */
const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

export function UserMenu() {
  if (!clerkEnabled) {
    return (
      <div
        aria-label="Mode demo — login Clerk belum dikonfigurasi"
        title="Mode demo — login Clerk belum dikonfigurasi"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        <svg
          className="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
        </svg>
      </div>
    );
  }
  return <UserButton />;
}
