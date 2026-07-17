import { SignIn } from "@clerk/nextjs";
import { AuthProvider } from "@/components/auth-provider";

/*
 * Halaman Masuk. Komponen <SignIn/> Clerk (tema biru #1E6FB8 + lokal Indonesia)
 * dibungkus <AuthProvider> lokal — ClerkProvider tak lagi di root agar landing
 * bebas Clerk. Catch-all [[...sign-in]] menangani semua sub-rute step Clerk.
 */
export default function SignInPage() {
  return (
    <AuthProvider>
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
        <SignIn />
      </main>
    </AuthProvider>
  );
}
