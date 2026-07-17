import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Kursus Mengemudi Pulung",
  description:
    "Kursus Mengemudi Pulung — Safe Drive Training sejak tahun 2000. Les mengemudi mobil manual & matic bersertifikat di Surabaya.",
};

const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

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
          <ClerkProvider publishableKey={clerkPubKey}>
            {children}
          </ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
