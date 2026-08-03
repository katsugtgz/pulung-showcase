/**
 * wa-router — WhatsApp deep-link routing for cluster admins.
 *
 * CRITICAL business logic: each branch routes to exactly one cluster admin
 * number. Cluster A (MERR/South) -> +62 851-0087-0957, Cluster B
 * (Manyar/Central) -> +62 812-3253-1989. Wrong routing is a real business bug.
 *
 * The prefilled message interpolates the prospect's chosen transmission
 * (manual / matic / mixed) and the branch area (branch name + cluster region)
 * so the cluster admin immediately sees what and where the prospect is asking
 * about.
 */

import { getBranchById, getClusterById, getPackageById } from "../catalog-data";
import type { TransmissionType } from "../catalog-data";

export interface WhatsAppLinkOptions {
  branchId: string;
  /** Optional: include a package inquiry in the prefilled message. */
  packageId?: string;
  /** Transmission the prospect is interested in; interpolated into the message. */
  transmission?: TransmissionType;
}

/**
 * Convert a display-form phone number (e.g. "+62 851-0087-0957" or
 * "0851-0087-0957") to digits-only. Indonesian domestic numbers (leading 0)
 * are converted to the 62-prefixed international form; numbers already in
 * international format (leading 62, "00" IDD prefix, or any other country
 * code) are returned as-is so a foreign cluster-admin number is not silently
 * rerouted to +62.
 */
export function toInternationalDigits(phone: string): string {
  const digits = phone.replace(/\D+/g, "");
  if (digits.startsWith("62")) return digits;
  // "00" is the international direct-dialling prefix (E.164 without the +).
  // Strip it and return the remaining country-code + number so a foreign
  // admin number like 0044 20 7946 0958 → 442079460958 (NOT 6200442079460958).
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

function buildMessage(
  branchName: string,
  clusterRegion: string,
  phrase: string,
): string {
  return `Halo admin Pulung, saya mau tanya paket kursus mobil ${phrase} di area ${branchName} (${clusterRegion}). Bisa info jadwal & harga?`;
}

/**
 * Indonesian phrase describing the chosen transmission, interpolated into the
 * prefilled WhatsApp message. `undefined` falls back to "manual atau matic".
 */
function transmissionPhrase(t?: TransmissionType): string {
  switch (t) {
    case "manual":
      return "manual";
    case "matic":
      return "matic";
    case "mixed":
      return "manual & matic";
    default:
      return "manual atau matic";
  }
}

/** Build a wa.me deep link to the branch's cluster admin with a prefilled Indonesian message. */
export function buildWhatsAppLink({
  branchId,
  packageId,
  transmission,
}: WhatsAppLinkOptions): string {
  const branch = getBranchById(branchId);
  const cluster = getClusterById(branch.clusterId);
  // Call getPackageById even when transmission is explicit so an unknown
  // packageId still throws TypeError.
  const pkgTransmission = packageId
    ? getPackageById(packageId).transmission
    : undefined;
  const resolved = transmission ?? pkgTransmission;
  const digits = toInternationalDigits(cluster.whatsapp);
  const message = buildMessage(
    branch.name,
    cluster.region,
    transmissionPhrase(resolved),
  );
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
