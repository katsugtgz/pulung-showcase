/**
 * wa-router — WhatsApp deep-link routing for cluster admins.
 *
 * CRITICAL business logic: each branch routes to exactly one cluster admin
 * number. Cluster A (MERR/South) -> +62 851-0087-0957, Cluster B
 * (Manyar/Central) -> +62 812-3253-1989. Wrong routing is a real business bug.
 */

import { getBranchById, getClusterById, getPackageById } from "../catalog-data";

export interface WhatsAppLinkOptions {
  branchId: string;
  /** Optional: include a package inquiry in the prefilled message. */
  packageId?: string;
}

/**
 * Convert a display-form phone number (e.g. "+62 851-0087-0957" or
 * "0851-0087-0957") to digits-only with an Indonesian country code prefix.
 */
function toInternationalDigits(phone: string): string {
  const digits = phone.replace(/\D+/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return `62${digits}`;
}

function buildMessage(
  branchName: string,
  clusterRegion: string,
  packageName?: string,
): string {
  const subject = packageName
    ? `tentang ${packageName}`
    : "tentang kursus mengemudi";
  return `Halo admin Pulung, saya ingin bertanya ${subject} di cabang ${branchName} (${clusterRegion}).`;
}

/** Build a wa.me deep link to the branch's cluster admin with a prefilled Indonesian message. */
export function buildWhatsAppLink({
  branchId,
  packageId,
}: WhatsAppLinkOptions): string {
  const branch = getBranchById(branchId);
  const cluster = getClusterById(branch.clusterId);
  const packageName = packageId ? getPackageById(packageId).name : undefined;
  const digits = toInternationalDigits(cluster.whatsapp);
  const message = buildMessage(branch.name, cluster.region, packageName);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
