import { SignIn } from "@clerk/nextjs";

/*
 * Halaman Masuk. Menggunakan komponen <SignIn/> bawaan Clerk yang sudah
 * diberi tema biru (#1E6FB8) dan lokal Indonesia di RootLayout ClerkProvider.
 * Catch-all route [[...sign-in]] menangani semua sub-rute step Clerk.
 */
export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <SignIn />
    </main>
  );
}
