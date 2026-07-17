import { SignUp } from "@clerk/nextjs";
import { AuthProvider } from "@/components/auth-provider";

/*
 * Halaman Daftar. Komponen <SignUp/> Clerk (tema biru #1E6FB8 + lokal
 * Indonesia) dibungkus <AuthProvider> lokal — ClerkProvider tak lagi di root
 * agar landing bebas Clerk. Catch-all [[...sign-up]] menangani sub-rute step.
 */
export default function SignUpPage() {
  return (
    <AuthProvider>
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
        <SignUp />
      </main>
    </AuthProvider>
  );
}
