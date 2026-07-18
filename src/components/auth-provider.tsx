import { ClerkProvider } from "@clerk/nextjs";
import { idID } from "@clerk/localizations";
import type { ReactNode } from "react";

/*
 * AuthProvider — membungkus HANYA rute yang benar-benar memakai Clerk sisi
 * klien: halaman auth (<SignIn/>, <SignUp/>) dan dasbor terautentikasi
 * (<UserButton/>). Landing publik SENGAJA tidak memakainya agar bebas dari
 * bundel & handshake Clerk — lihat proxy.ts dan DECISIONS.md (ADR-002).
 *
 * Env-gated: tanpa NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY komponen jadi pass-through
 * supaya scaffold tetap build & jalan tanpa kunci asli. Appearance (biru
 * #1E6FB8) & lokal Indonesia dulu di RootLayout ClerkProvider; dipindah ke sini
 * saat provider dilepas dari root agar landing tidak lagi memuat Clerk.
 *
 * ⚠️ Catatan jujur: mode pass-through tanpa kunci hanya menjaga halaman tetap
 * BUILD. Halaman yang benar-benar merender komponen Clerk (mis. <UserButton/>)
 * tetap AKAN error saat runtime tanpa kunci, karena komponen Clerk butuh
 * ClerkProvider yang benar-benar ter-mount — bukan sekadar fragment kosong.
 */
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const appearance = {
  variables: {
    colorPrimary: "#1e6fb8",
    colorTextOnPrimary: "#ffffff",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#0f172a",
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    borderRadius: "0.5rem",
  },
};

// Override Clerk default idID localization to translate input placeholders
// and fix lowercase brand casing "pulung" -> uppercase "PULUNG"
const customLocalization = {
  ...idID,
  signIn: {
    ...idID.signIn,
    start: {
      ...idID.signIn?.start,
      title: "Masuk ke PULUNG",
    },
  },
  signUp: {
    ...idID.signUp,
    start: {
      ...idID.signUp?.start,
      title: "Buat akun PULUNG Anda",
    },
  },
  formFieldInputPlaceholder__emailAddress: "Masukkan alamat email Anda",
  formFieldInputPlaceholder__firstName: "Nama depan Anda",
  formFieldInputPlaceholder__lastName: "Nama belakang Anda",
  formFieldInputPlaceholder__password: "Masukkan kata sandi Anda",
  formFieldInputPlaceholder__signUpPassword: "Buat kata sandi Anda",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!clerkPubKey) return <>{children}</>;
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      localization={customLocalization}
      appearance={appearance}
    >
      {children}
    </ClerkProvider>
  );
}

