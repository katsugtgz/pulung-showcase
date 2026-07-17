import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/components/auth-provider";

/*
 * Pelindung rute untuk grup (admin): /admin/*. Memeriksa role 'admin' dari
 * sessionClaims.metadata.role (custom RBAC via publicMetadata, BUKAN Clerk
 * Organizations). Jika tidak ada kunci Clerk, layout jadi pass-through agar
 * aplikasi tetap bisa build & jalan tanpa kunci asli — verifikasi live role
 * dilakukan manusia setelah memasang kunci.
 *
 * Guard ini berlapis dengan proxy.ts: proxy menangkal lebih dulu di edge,
 * layout memeriksa ulang di server component (defense in depth).
 *
 * <AuthProvider> dipasang di sini (bukan per-halaman) agar setiap halaman baru
 * di grup (admin) otomatis terbungkus ClerkProvider tanpa perlu diingat ulang.
 */
const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (clerkEnabled) {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "admin") {
      redirect("/");
    }
  }
  return <AuthProvider>{children}</AuthProvider>;
}
