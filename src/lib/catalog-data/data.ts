/**
 * Internal business data. NOT part of the public module surface — consumers
 * must use the query functions in `index.ts`. Sourced from contact.md
 * (single source of truth for branches, clusters, WA numbers, socials).
 */

import type {
  Branch,
  Cluster,
  Package,
  SocialPost,
  Testimonial,
} from "./types";

export const packages: readonly Package[] = [
  {
    id: "paket-manual",
    name: "Paket Manual",
    transmission: "manual",
    sessionCount: 8,
    durationHours: 12,
    vehicle: "Mobil Full AC",
    features: [
      "Teknik kopling dan persneling",
      "Menaklukkan tanjakan",
      "Manuver dan parkir",
      "Konsultasi pengurusan SIM A",
    ],
    priceIdr: 1_500_000,
    priceIsDummy: true,
  },
  {
    id: "paket-matic",
    name: "Paket Matic",
    transmission: "matic",
    sessionCount: 8,
    durationHours: 10,
    vehicle: "Mobil Full AC",
    features: [
      "Pengendaraan halus di perkotaan",
      "Teknik parkir paralel",
      "Manuver ruang sempit",
      "Konsultasi pengurusan SIM A",
    ],
    priceIdr: 1_750_000,
    priceIsDummy: true,
  },
  {
    id: "paket-kombinasi",
    name: "Paket Kombinasi (Manual + Matic)",
    transmission: "mixed",
    sessionCount: 12,
    durationHours: 16,
    vehicle: "Mobil Full AC",
    features: [
      "Seluruh materi Paket Manual",
      "Seluruh materi Paket Matic",
      "Konsultasi pengurusan SIM A",
      "Prioritas penjadwalan",
    ],
    priceIdr: 2_500_000,
    priceIsDummy: true,
  },
] as const;

export const clusters: readonly Cluster[] = [
  {
    id: "cluster_a_merr_selatan",
    region: "Surabaya Selatan & Timur (MERR / Rungkut / Juanda)",
    whatsapp: "+62 851-0087-0957",
    instagram: "@pulung_drivingcourse",
  },
  {
    id: "cluster_b_manyar_pusat",
    region: "Surabaya Pusat & Timur (Manyar / Bratang / Ngagel)",
    whatsapp: "+62 812-3253-1989",
    instagram: "@pulungkursusmengemudi",
  },
] as const;

export const branches: readonly Branch[] = [
  {
    id: "gunung-anyar",
    name: "Gunung Anyar",
    clusterId: "cluster_a_merr_selatan",
    address: "Jl. Dr. Ir. H. Soekarno (MERR) No. 9D, Surabaya",
    isMain: true,
  },
  {
    id: "pandugo",
    name: "Pandugo",
    clusterId: "cluster_a_merr_selatan",
    address: "Jl. Dr. Ir. H. Soekarno (MERR) No. 2P, Surabaya",
  },
  {
    id: "juanda",
    name: "Juanda",
    clusterId: "cluster_a_merr_selatan",
    address: "Perumahan Juanda Harapan Permai K-22/23, Sidoarjo",
  },
  {
    id: "manyar",
    name: "Manyar",
    clusterId: "cluster_b_manyar_pusat",
    address: "Jl. Raya Manyar No. 89, Surabaya",
    isMain: true,
  },
  {
    id: "pucang",
    name: "Pucang",
    clusterId: "cluster_b_manyar_pusat",
    address: "Jl. Pucang Sewu No. 45, Surabaya",
  },
] as const;

export const testimonials: readonly Testimonial[] = [
  {
    id: "testimonial-rizki",
    name: "Rizki Pratama",
    rating: 5,
    quote:
      "Instruktornya sabar banget. Saya yang awalnya belum bisa berkendara sekarang sudah berani bawa mobil ke kantor.",
    context: "Lulusan Paket Manual, cabang Gunung Anyar",
  },
  {
    id: "testimonial-dewi",
    name: "Dewi Lestari",
    rating: 5,
    quote:
      "Jadwalnya fleksibel dan mobilnya full AC. Pengajar profesional dan sabar membimbing pemula seperti saya.",
    context: "Lulusan Paket Matic, cabang Manyar",
  },
  {
    id: "testimonial-bayu",
    name: "Bayu Nugroho",
    rating: 5,
    quote:
      "Pelayanan ramah, kendaraan terawat. Pulung sudah berpengalaman sejak lama dan terbukti amanah.",
    context: "Lulusan Paket Kombinasi, cabang Pandugo",
  },
  {
    id: "testimonial-siti",
    name: "Siti Rahmawati",
    rating: 5,
    quote:
      "Harga terjangkau dan materinya lengkap. Direkomendasikan untuk yang ingin ikut tes SIM A.",
    context: "Lulusan Paket Manual, cabang Pucang",
  },
  {
    id: "testimonial-andi",
    name: "Andi Wijaya",
    rating: 5,
    quote:
      "Cocok untuk pemula — materinya dari nol sampai parkir. Terima kasih Pulung!",
    context: "Lulusan Paket Kombinasi, cabang Juanda",
  },
] as const;

// URLs are the real Instagram profile links from contact.md. Specific post
// permalinks are not published there; cards link to the active profiles. Swap
// in real post permalinks when the business supplies them.
export const socialPosts: readonly SocialPost[] = [
  {
    id: "social-pulung-promo",
    platform: "instagram",
    account: "@pulung_drivingcourse",
    url: "https://www.instagram.com/pulung_drivingcourse/",
    captionPreview:
      "Promo paket kursus mengemudi — daftar sekarang dapat harga spesial!",
  },
  {
    id: "social-pulung-lulus",
    platform: "instagram",
    account: "@pulungkursusmengemudi",
    url: "https://www.instagram.com/pulungkursusmengemudi/",
    captionPreview:
      "Selamat untuk siswa kami yang baru lulus ujian SIM A!",
  },
  {
    id: "social-pulung-latihan",
    platform: "instagram",
    account: "@pulung_drivingcourse",
    url: "https://www.instagram.com/pulung_drivingcourse/",
    captionPreview:
      "Latihan mengemudi di cabang Gunung Anyar. Mobil full AC, instruktur sabar.",
  },
] as const;
