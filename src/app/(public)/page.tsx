import {
  CaraKerja,
  CredibilityStrip,
  ExperienceBand,
  Faq,
  FinalCta,
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
 * Landmark structure (issue #50 ticket #57): Header (banner) + Footer
 * (contentinfo) sit OUTSIDE <main>; only content sections live inside
 * <main>. This matches the design-contract §12 accessibility baseline
 * (one main landmark per page).
 *
 * Urutan section (per T5 / PRD issue #1 + spec #50 "Cara Kerja"):
 *   0. Header (sticky, bg-primary menyatu dengan Hero) — banner
 *   1. Hero
 *   2. Strip kredibilitas
 *   3. Cara Kerja (tiga langkah — issue #50 story #9)
 *   4. Paket (#packages)
 *   5. Experience band (dark polarity — design-contract §5)
 *   6. Pilih Lokasi (#lokasi)
 *   7. Testimoni
 *   8. Kartu media sosial
 *   9. FAQ (#faq)
 *  10. Final CTA (#final-cta — ticket #57)
 *  11. Footer — contentinfo
 *  12. StickyCta (mobile-only, position:fixed — di luar main)
 *
 * <Header/> dirender sebagai sibling pertama <main> (bukan anak pertama):
 * tetap sticky + bg-primary menyatu dengan Hero, tapi tidak mengganggu
 * struktur landmark. <Footer/> + <StickyCta/> juga di luar main.
 */
export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-dvh bg-neutral-50">
        <Hero />
        <CredibilityStrip />
        <Reveal>
          <CaraKerja />
        </Reveal>
        <Reveal>
          <Packages />
        </Reveal>
        {/*
          ExperienceBand — dark polarity band (bg-primary) that breaks the
          white-card rhythm between Packages and Location (issue #50 ticket
          #53). Single legal second primary band per design-contract §5 (hero
          is the first; footer uses neutral-900). All facts from catalog-data.
        */}
        <Reveal>
          <ExperienceBand />
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
        {/*
          FinalCta — satu-satunya penutup konversi setelah FAQ (issue #50
          ticket #57). bg-primary (legal third dark surface — hero +
          experience-band are the first two). href #lokasi returns visitor
          to the signature location widget for cluster routing.
        */}
        <Reveal>
          <FinalCta />
        </Reveal>
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
