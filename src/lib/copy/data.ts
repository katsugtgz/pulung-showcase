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

import type {
  BodySectionKey,
  CtaCopy,
  FaqEntry,
  HeroCopy,
  HeroPasDirection,
  HeroVariant,
  SectionKey,
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
    // Authority angle — 25 tahun (sejak 2000) + "Safe Drive Training" motto,
    // both verified from Hotfrog listing (research brief §1 kutipan #3, §4.2).
    headline:
      "Safe Drive Training sejak 2000 — instruktur berpengalaman & sabar.",
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
} as const;

/** WhatsApp-first CTA labels — low-friction, never "Daftar"/"Submit". */
export const cta: CtaCopy = {
  primary: "Tanya Jadwal via WhatsApp",
  secondary: "Chat Sekarang",
} as const;

/**
 * EMPTY by design. `research/copy-research.md` §1 found ZERO verbatim,
 * verifiable customer reviews across Google Maps, Hotfrog ("0 Customer
 * Review"), directories, and editorial media. Do NOT fabricate entries —
 * fill only with real, attributed quotes once the owner supplies them.
 */
export const testimonials: readonly TestimonialEntry[] = [];

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
