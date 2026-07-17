import { SignUp } from "@clerk/nextjs";

/*
 * Halaman Daftar. Menggunakan komponen <SignUp/> bawaan Clerk yang sudah
 * diberi tema biru (#1E6FB8) dan lokal Indonesia di RootLayout ClerkProvider.
 * Catch-all route [[...sign-up]] menangani semua sub-rute step Clerk.
 */
export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <SignUp />
    </main>
  );
}
