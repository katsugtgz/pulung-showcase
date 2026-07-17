import { auth } from "@clerk/nextjs/server";

/*
 * Pelindung rute untuk semua halaman di grup (protected): /dashboard dan
 * /catalog/*. Sesuai panduan Clerk 7, auth().protect() dipanggil di layout,
 * bukan di proxy. Jika tidak ada kunci Clerk, layout jadi pass-through agar
 * aplikasi tetap bisa build & jalan tanpa kunci asli.
 */
const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (clerkEnabled) {
    await auth.protect();
  }
  return <>{children}</>;
}
