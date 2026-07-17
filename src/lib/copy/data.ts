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
