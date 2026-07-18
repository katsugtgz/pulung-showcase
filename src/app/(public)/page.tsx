import {
  CaraKerja,
  CredibilityStrip,
  Faq,
  Footer,
  Header,
  Hero,
  LocationPicker,
  Packages,
  Reveal,
  SocialCards,
  StickyCta,
  Testimonials,
} from "@/components/landing";

/*
 * Landing publik Kursus Mengemudi Pulung. Mobile-first, seluruh string
 * Bahasa Indonesia, palet biru (#1E6FB8) + merah (#D22B3A) — mereplika
 * banner jalan 25 tahun Pulung. Buisnis data hanya dari catalog-data,
 * WhatsApp dari wa-router, mata uang dari format.
 *
 * Urutan section (per T5 / PRD issue #1 + spec #50 "Cara Kerja"):
 *   0. Header (sticky, bg-primary menyatu dengan Hero)
 *   1. Hero
 *   2. Strip kredibilitas
 *   3. Cara Kerja (tiga langkah — issue #50 story #9)
 *   4. Paket (#packages)
 *   5. Pilih Lokasi (#lokasi)
 *   6. Testimoni
 *   7. Kartu media sosial
 *   8. FAQ (#faq)
 *   9. Footer
 *
 * <Header/> dirender sebagai anak pertama <main> sebelum <Hero/>: keduanya
 * memakai bg-primary sehingga menyatu jadi satu banner biru kontinu, dan
 * sticky top-0 membuat bar tetap terjangkau saat scroll di dalam main.
 */
export default function HomePage() {
  return (
    <main className="min-h-dvh bg-neutral-50">
      <Header />
      <Hero />
      <CredibilityStrip />
      <Reveal>
        <CaraKerja />
      </Reveal>
      <Reveal>
        <Packages />
      </Reveal>
      <Reveal>
        <LocationPicker />
      </Reveal>
      <Reveal>
        <Testimonials />
      </Reveal>
      <Reveal>
        <SocialCards />
      </Reveal>
      <Reveal>
        <Faq />
      </Reveal>
      <Footer />
      <StickyCta />
    </main>
  );
}
