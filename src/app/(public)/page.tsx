import {
  CredibilityStrip,
  Footer,
  Hero,
  LocationPicker,
  Packages,
  SocialCards,
  Testimonials,
} from "@/components/landing";

/*
 * Landing publik Kursus Mengemudi Pulung. Mobile-first, seluruh string
 * Bahasa Indonesia, palet biru (#1E6FB8) + merah (#D22B3A) — mereplika
 * banner jalan 25 tahun Pulung. Buisnis data hanya dari catalog-data,
 * WhatsApp dari wa-router, mata uang dari format.
 *
 * Urutan section (per T5 / PRD issue #1):
 *   1. Hero
 *   2. Strip kredibilitas
 *   3. Paket (#packages)
 *   4. Pilih Lokasi (#lokasi)
 *   5. Testimoni
 *   6. Kartu media sosial
 *   7. Footer
 */
export default function HomePage() {
  return (
    <main className="mx-auto min-h-dvh max-w-md bg-neutral-50">
      <Hero />
      <CredibilityStrip />
      <Packages />
      <LocationPicker />
      <Testimonials />
      <SocialCards />
      <Footer />
    </main>
  );
}
