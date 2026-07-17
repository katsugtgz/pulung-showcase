import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { idID } from "@clerk/localizations";
import { getSeoCopy } from "@/lib/copy";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const seo = getSeoCopy();

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  keywords: [...seo.keywords],
  openGraph: {
    title: seo.ogTitle,
    description: seo.ogDescription,
    type: "website",
    locale: "id_ID",
    siteName: "Kursus Mengemudi Pulung",
  },
};

const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/*
 * Clerk appearance: brand the hosted <SignIn/>/<SignUp/> components with
 * Pulung's primary blue (#1E6FB8). Accent red (#D22B3A) is reserved for app
 * CTAs per AGENTS.md, so Clerk keeps a single primary. Locale is Indonesian.
 */
const clerkAppearance = {
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

/*
 * Env-gated ClerkProvider: rendered only when a publishable key is configured.
 * This keeps the scaffold building & running without real keys; auth activates
 * once NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set. ClerkProvider sits inside
 * <body> per Clerk's Next.js 16 guidance.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-sans antialiased">
        {clerkPubKey ? (
          <ClerkProvider
            publishableKey={clerkPubKey}
            localization={idID}
            appearance={clerkAppearance}
          >
            {children}
          </ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
