import type { Metadata } from "next";
import { Inter } from "next/font/google";
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

/*
 * ClerkProvider is deliberately NOT at the root anymore. The public landing (/)
 * must ship zero Clerk JS and trigger no dev-instance handshake, so Clerk is
 * scoped to just the routes that use it via <AuthProvider> (auth pages +
 * dashboards) and to the proxy matcher. See DECISIONS.md ADR-002.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-sans antialiased">
        {/*
         * Fallback tanpa JS: paksa section yang dibungkus <Reveal/> tetap
         * terlihat penuh bila IntersectionObserver tak pernah jalan.
         */}
        <noscript>
          <style>{`.t-reveal{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
