/**
 * Type definitions for the catalog-data module.
 *
 * This module is the single source of truth for business data. UI layers must
 * consume data via the query functions in `index.ts`, never by importing the
 * raw constants or these types' values directly.
 */

export type TransmissionType = "manual" | "matic" | "mixed";

export interface Package {
  /** Stable identifier, safe to use in URLs (/catalog/[id]). */
  id: string;
  /** Indonesian display name, e.g. "Paket Manual". */
  name: string;
  transmission: TransmissionType;
  /** Number of training sessions included. */
  sessionCount: number;
  /** Total training duration in hours. */
  durationHours: number;
  /** Training vehicle, e.g. "Mobil Full AC". */
  vehicle: string;
  /** Indonesian feature bullets. */
  features: string[];
  /**
   * Dummy price in IDR. Real pricing is dynamic and only available via the
   * cluster admin on WhatsApp; this is a placeholder for layout/demo only.
   * `priceIsDummy` must be rendered alongside as "*harga contoh".
   */
  priceIdr: number;
  priceIsDummy: true;
}

export interface Cluster {
  id: string;
  /** Human-readable area label, e.g. "Surabaya Selatan & Timur (MERR / Rungkut / Juanda)". */
  region: string;
  /**
   * Cluster admin WhatsApp number in display form (matches contact.md),
   * e.g. "+62 811-0000-0001". wa-router strips non-digits for wa.me links.
   */
  whatsapp: string;
  /** Primary Instagram handle, e.g. "@pulung_drivingcourse". */
  instagram: string;
}

export interface Branch {
  id: string;
  /** Indonesian display name, e.g. "Gunung Anyar". */
  name: string;
  /** Owning cluster id — every branch maps to exactly one cluster. */
  clusterId: string;
  /** Full Indonesian street address. */
  address: string;
  /** True for the cluster's primary/main location. */
  isMain?: boolean;
}

export type StarRating = 1 | 2 | 3 | 4 | 5;

export interface Testimonial {
  id: string;
  /** Indonesian name. */
  name: string;
  rating: StarRating;
  /** Indonesian quote. */
  quote: string;
  /** Optional context line, e.g. "Lulusan paket Manual, cabang Manyar". */
  context?: string;
}

export type SocialPlatform = "instagram" | "tiktok";

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  /** Account handle, e.g. "@pulung_drivingcourse". */
  account: string;
  /** Real profile/post URL sourced from contact.md. */
  url: string;
  /** Indonesian caption preview shown on the card. */
  captionPreview: string;
}
