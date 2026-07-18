/**
 * Internal Indonesian copy data. NOT part of the public module surface —
 * consumers must use the query functions in `index.ts`. Every string is
 * sourced from `research/copy-research.md`. Unverifiable business claims are
 * marked `// TODO: verify owner` and phrased neutrally; no claim is asserted
 * as fact without a public source.
 *
 * Brand voice (research brief §4): lead with "Safe Drive Training" safety
 * angle, keep "sabar" as the beginner anchor, use "kamu" not "kami", prefer
 * concrete numbers over adjectives, end every CTA routed to WhatsApp.
 */

import { getMapsTestimonials } from "@/lib/maps-reviews";
import type {
  BodySectionKey,
  CaraKerjaStep,
  CredibilityItem,
  CtaCopy,
  FaqEntry,
  HeroCopy,
  HeroPasDirection,
  HeroVariant,
  SectionKey,
  SeoCopy,
  StickyCtaCopy,
  TestimonialEntry,
  TrustBarItem,
} from "./types";

export const heroVariants: readonly HeroVariant[] = [
  {
    direction: "aman",
    // Warmth/safety angle — beginner anchor "sabar" (research brief §4.2/§4.4).
    headline: "Baru pertama kali pegang setir? Tenang.",
  },
  {
    direction: "trust",
    // Benefit-led H1 (issue #50 story #2): lead with what the prospect gets
    // (tenang & percaya diri), supported by verified trust anchors — instruktur
    // sabar (Hotfrog verbatim), Safe Drive Training motto (research brief §1
    // kutipan #3, §4.2), founding year 2000 (Hotfrog).
    headline:
      "Belajar Nyetir Tenang & Percaya Diri — Bareng Instruktur Sabar, Sejak 2000.",
  },
  {
    direction: "cepat",
    // Urgency angle — addresses the "kepepet" prospect without promising a
    // guarantee (research brief §4.1 #6: never claim "pasti bisa dalam X hari").
    headline:
      "Udah kepepet butuh bisa nyetir? Mulai dari nol, bareng instruktur sabar.",
  },
] as const;

/** Recommended default active variant — trust/otoritas. */
export const activeHeroVariant: HeroPasDirection = "trust";

/**
 * Shared subheadline. Verified facts only: manual & matic (Hotfrog), instruktur
 * berpengalaman & sabar (Hotfrog verbatim), 5 cabang / 2 klaster (contact.md),
 * jadwal saling menyesuaikan (Hotfrog verbatim).
 */
export const heroSubheadline: string =
  "Belajar mobil manual & matic bersama instruktur berpengalaman dan sabar. Lima cabang, dua klaster, jadwal saling menyesuaikan. Tanya jadwal via WhatsApp — kamu pilih yang pas.";

/** Trust-bar chips (verbatim labels from the slice brief). */
export const heroTrustBar: readonly TrustBarItem[] = [
  { id: "since-2000", label: "Sejak 2000" },
  { id: "experienced-instructors", label: "Instruktur berpengalaman" },
  { id: "all-surabaya", label: "Jangkauan seluruh Surabaya" },
] as const;

/**
 * PAS-style section headers. `hero` is intentionally OMITTED here — the hero
 * header is the active variant's headline, derived in `index.ts` to avoid
 * drift (single source of truth = `heroVariants` + `activeHeroVariant`).
 */
export const sectionHeaders: Readonly<Record<Exclude<SectionKey, "hero">, string>> = {
  paket: "Paket yang Pas Buat Kamu",
  testimonials: "Kata Mereka yang Udah Bisa Nyetir",
  faq: "Masih Ragu? Ini Jawabannya",
  "cara-kerja": "Cara Daftar, Tiga Langkah",
} as const;

/** Short body copy per section. */
export const sectionBody: Readonly<Record<BodySectionKey, string>> = {
  paket:
    // Verified: manual/matic/campuran (Hotfrog), mobil Full AC (contact.md),
    // instruktur sabar (Hotfrog verbatim).
    // TODO: verify owner — jumlah pertemuan eksak & harga per paket belum
    // dipublikasikan di sumber mana pun (research brief §2 Q8).
    "Pilih Manual, Matic, atau Campuran. Semua paket memakai mobil Full AC dengan instruktur sabar yang menemani kamu dari nol sampai percaya diri.",
  testimonials:
    // Placeholder: research brief §1 menemukan NOL kutipan pelanggan yang
    // verbatim dan terverifikasi dari sumber publik. Jangan diisi kutipan
    // karangan — isi hanya setelah ulasan asli terkumpul (research brief §1
    // rekomendasi tindakan).
    "Cerita alumni Pulung akan tampil di sini begitu ulasan terverifikasi terkumpul.",
  faq:
    "Pertanyaan yang sering muncul dari calon pelajar, beserta jawaban jujur berdasarkan data yang tersedia.",
  "cara-kerja":
    // Verified: 3 packages (catalog-data), 2 clusters + 5 branches (contact.md),
    // cluster-routed WhatsApp (wa-router). No invented claims.
    "Alur sederhana Pulung — tiga langkah sampai kamu chat admin cabang yang sesuai.",
} as const;

/**
 * WhatsApp-first CTA labels + hero CTA destinations (issue #50 story #7).
 * Primary routes to #lokasi (location picker → cluster-routed WhatsApp link);
 * secondary routes to #packages (catalog). Distinct destinations prevent the
 * two hero CTAs from colliding into a single anchor.
 */
export const cta: CtaCopy = {
  primary: "Tanya Jadwal via WhatsApp",
  secondary: "Lihat Paket",
  primaryHref: "#lokasi",
  secondaryHref: "#packages",
} as const;

/**
 * SEO / social meta copy. Keyword-aware for the Surabaya driving-school market
 * ("kursus mengemudi Surabaya", "kursus setir mobil", matic/manual), leaning on
 * the authentic trust angle. Legal-status facts (KORLANTAS POLRI, Dishub
 * Surabaya) are verified in contact.md (source of truth) — assertable as fact.
 */
export const seo: SeoCopy = {
  title: "Kursus Mengemudi Pulung Surabaya — Matic & Manual, Sejak 2000",
  description:
    "Kursus setir mobil matic & manual di Surabaya bersama instruktur sabar dan berpengalaman. Safe Drive Training sejak 2000, terdaftar resmi KORLANTAS POLRI & Dishub Surabaya. Tanya jadwal via WhatsApp.",
  ogTitle: "Kursus Mengemudi Pulung — Belajar Nyetir di Surabaya Sejak 2000",
  ogDescription:
    "Belajar mobil matic & manual bersama instruktur sabar dan berpengalaman. Lima cabang di Surabaya, jadwal saling menyesuaikan. Tanya jadwal via WhatsApp.",
  keywords: [
    "kursus mengemudi Surabaya",
    "kursus setir mobil Surabaya",
    "kursus mobil matic",
    "kursus mobil manual",
    "les mengemudi Surabaya",
    "Safe Drive Training",
  ],
} as const;

/**
 * Real, verbatim Google Maps reviews — curated from the committed SerpAPI
 * snapshot in `@/lib/maps-reviews` (refresh via
 * `scripts/fetch-maps-reviews.mjs`). This replaced the deliberately-empty
 * array once verifiable reviews were collected (issue #12); the
 * no-fabrication rule still holds: quotes pass through untouched.
 */
export const testimonials: readonly TestimonialEntry[] = getMapsTestimonials();

/** Convenience aggregate for `getHeroCopy()`. */
export const heroCopy: HeroCopy = {
  variants: heroVariants,
  activeVariant: activeHeroVariant,
  subheadline: heroSubheadline,
  trustBar: heroTrustBar,
};

/**
 * Landing FAQ — sourced from `research/copy-research.md` §2. Every answer is
 * phrased so no unverified specific (exact session count, jemput fee, age
 * policy, SIM mechanics, hours, price) is asserted as fact; those are deferred
 * to the admin via WhatsApp and flagged below with `// TODO: verify owner`.
 */
export const faq: readonly FaqEntry[] = [
  {
    id: "transmisi",
    question: "Pilih matic, manual, atau campuran?",
    // Verified: MT/AT/Campuran packages exist (Hotfrog; contact.md).
    answer:
      "Pulung punya paket Manual (MT), Matic (AT), dan Campuran (MT+AT). Pilih Matic kalau ingin belajar cepat tanpa repot kopling, Manual kalau butuh fleksibilitas di segala jenis mobil, atau Campuran untuk menguasai keduanya. Masih bingung? Tanya admin via WhatsApp — kami bantu pilihkan yang pas buat kamu.",
  },
  {
    id: "pertemuan",
    // TODO: verify owner — exact session count/duration per package.
    question: "Berapa kali pertemuan sampai bisa nyetir?",
    answer:
      "Paket disusun mengikuti kemampuan kamu, dan jadwalnya saling menyesuaikan. Instruktur sabar menemani dari nol sampai kamu percaya diri — kami tidak menjanjikan 'pasti bisa dalam sekian hari' karena tiap orang berbeda. Jumlah pertemuan tiap paket bisa kamu tanyakan langsung ke admin.",
  },
  {
    id: "antar-jemput",
    // TODO: verify owner — jemput included vs. extra fee, radius per cabang.
    question: "Bisa dijemput di rumah?",
    answer:
      "Bisa — Pulung menyediakan layanan antar-jemput kursus. Untuk cakupan area jemput dan apakah ada biaya tambahan, konfirmasikan dulu ke admin cabang sesuai lokasimu.",
  },
  {
    id: "area",
    // Verified: two clusters + branches (contact.md; research brief §2 Q4).
    question: "Area mana saja yang dilayani?",
    answer:
      "Pulung punya dua klaster di Surabaya: Klaster A (MERR, Rungkut, Gunung Anyar, Pandugo, Juanda) dan Klaster B (Manyar, Bratang, Ngagel, Pucang). Pilih cabang terdekat di bagian Lokasi, lalu chat admin klaster yang sesuai.",
  },
  {
    id: "usia",
    // TODO: verify owner — Pulung's own participant age policy. 17 = SIM A regulation only.
    question: "Berapa usia minimum untuk ikut?",
    answer:
      "Belajar mengemudi bisa kamu mulai kapan saja. Untuk membuat SIM A sendiri, syarat usia minimum di Indonesia adalah 17 tahun. Ketentuan usia peserta kursus bisa kamu tanyakan ke admin.",
  },
  {
    id: "sim",
    // TODO: verify owner — nature of SIM assistance + whether cost is separate. Never claim "dijamin lulus".
    question: "Pulung bantu urus SIM A?",
    answer:
      "Ya, Pulung melayani pendampingan pengurusan SIM A & SIM C. Untuk bentuk bantuannya dan apakah biayanya terpisah dari paket kursus, tanyakan ke admin via WhatsApp.",
  },
  {
    id: "jadwal",
    // TODO: verify owner — operating hours + weekend slots per cabang.
    question: "Jadwalnya fleksibel?",
    answer:
      "Fleksibel — jadwal Pulung saling menyesuaikan dengan waktumu. Untuk jam operasional cabang dan ketersediaan slot akhir pekan, konfirmasi ke admin cabang.",
  },
  {
    id: "harga",
    // Consistent with existing "harga contoh" disclaimers; price is dynamic (contact.md).
    question: "Berapa harga paketnya?",
    answer:
      "Harga bersifat dinamis dan sering ada paket promo, jadi harga final dikonfirmasi langsung oleh admin. Harga yang tampil di katalog hanya contoh ilustrasi. Tanya penawaran terbaru via WhatsApp sesuai area kamu.",
  },
] as const;

/**
 * "Cara Kerja" section — three steps describing EXISTING Pulung behavior only
 * (issue #50 story #4). Verified flow: 3 packages (Manual/Matic/Campuran —
 * catalog-data), 2 clusters + 5 branches (contact.md), cluster-routed WhatsApp
 * (wa-router). No invented claims, no specific session counts, no price
 * assertions, no "pasti bisa" promise.
 */
export const caraKerjaSteps: readonly CaraKerjaStep[] = [
  {
    id: "pilih-paket",
    title: "Pilih Paket",
    // Verified: 3 packages MT/AT/Campuran (catalog-data; Hotfrog).
    description:
      "Tentukan tujuanmu — Manual, Matic, atau Campuran. Setiap paket memakai mobil Full AC dengan instruktur sabar.",
  },
  {
    id: "pilih-lokasi",
    title: "Pilih Cabang",
    // Verified: 2 clusters, 5 branches across Surabaya (contact.md).
    description:
      "Pilih cabang Pulung terdekat dari dua klaster area Surabaya. Lokasi menentukan admin yang akan melayanimu.",
  },
  {
    id: "chat-admin",
    title: "Chat Admin via WhatsApp",
    // Verified: wa-router routes each branch to the correct cluster admin.
    description:
      "Pesan WhatsApp otomatis terisi sesuai pilihanmu dan terujuk ke admin klaster yang benar. Tanya jadwal, konfirmasi, lalu mulai belajar.",
  },
] as const;

/**
 * Microcopy for the transmission toggle in the location picker (issue #50
 * story #14). Explains in one short Indonesian line that the transmission
 * choice personalizes the WhatsApp inquiry — i.e. it is not a throwaway
 * filter. Verified behavior (wa-router interpolates transmission into the
 * prefilled message); no invented claims.
 */
export const locationTransmissionHelp: string =
  "Pilih transmisi dulu — pesan WhatsApp-mu otomatis sesuai pilihanmu.";

/**
 * Sticky floating CTA copy (issue #50 story #13). Routes to #lokasi so the
 * prospect reaches the cluster-routed WhatsApp link rather than a generic
 * number — defense against the wrong-cluster business bug (AGENTS.md).
 */
export const stickyCta: StickyCtaCopy = {
  label: "Tanya Admin via WhatsApp",
  href: "#lokasi",
} as const;

/**
 * Canonical sample-price disclaimer (issue #50). Replaces the inline
 * "*harga contoh" literal so package cards, FAQ answers, and future surfaces
 * pull from a single source. Consistent with `priceIsDummy: true` on every
 * catalog-data package (AGENTS.md).
 */
export const samplePriceDisclaimer: string = "*harga contoh";

/**
 * Credibility strip badges — compact trust signals under the hero. Verified
 * facts only: KORLANTAS POLRI + Dishub Surabaya registration (contact.md +
 * seo copy), founding year 2000 (Hotfrog; hero headline), and "Safe Drive
 * Training" motto (Hotfrog listing — research brief §1 kutipan #3, §4.2).
 * The `surface` field alternates tonal variety so the strip is not three
 * identical white cards.
 */
export const credibility: readonly CredibilityItem[] = [
  {
    id: "terdaftar",
    icon: "shield",
    label: "Terdaftar Resmi",
    supportingLine: "KORLANTAS POLRI & Dishub Surabaya",
    surface: "primary",
  },
  {
    id: "sejak-2000",
    icon: "calendar",
    label: "Sejak 2000",
    supportingLine: "Lebih dari 25 tahun mengajar Surabaya",
    surface: "white",
  },
  {
    id: "safe-drive",
    icon: "steer",
    label: "Safe Drive Training",
    supportingLine: "Motto pengajaran kami",
    surface: "primary",
  },
] as const;
