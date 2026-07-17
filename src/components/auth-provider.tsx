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

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!clerkPubKey) return <>{children}</>;
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      localization={idID}
      appearance={appearance}
    >
      {children}
    </ClerkProvider>
  );
}
