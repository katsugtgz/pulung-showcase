import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { getSeoCopy } from "@/lib/copy";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
/*
 * Display face — Barlow Condensed. Condensed grotesque reads like the
 * DIN-style lettering on Indonesian road signage (rambu) and license
 * plates: the most characteristic type voice for a 25-year driving
 * school. Pair with Inter for body text; never set long copy in it.
 */
const barlow = Barlow_Condensed({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
});

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
    <html lang="id" className={`${inter.variable} ${barlow.variable}`}>
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
