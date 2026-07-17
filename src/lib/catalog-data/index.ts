/**
 * catalog-data — typed query interface over the business data source of truth.
 *
 * UI and other modules MUST consume data through these functions; the raw data
 * constants live in `data.ts` and are intentionally not re-exported here.
 * `*ById` lookups throw a TypeError on unknown ids so callers can surface a
 * 404 (e.g. via next/navigation `notFound()`).
 */

import {
  branches,
  clusters,
  packages,
  socialPosts,
  testimonials,
} from "./data";
import type {
  Branch,
  Cluster,
  Package,
  SocialPost,
  Testimonial,
} from "./types";

export type {
  Branch,
  Cluster,
  Package,
  SocialPost,
  SocialPlatform,
  StarRating,
  Testimonial,
  TransmissionType,
} from "./types";

function findById<T extends { id: string }>(
  items: readonly T[],
  id: string,
  kind: string,
): T {
  for (const item of items) {
    if (item.id === id) return item;
  }
  throw new TypeError(`Unknown ${kind} id: ${id}`);
}

export function getPackages(): Package[] {
  return [...packages];
}

export function getPackageById(id: string): Package {
  return findById(packages, id, "package");
}

export function getClusters(): Cluster[] {
  return [...clusters];
}

export function getClusterById(id: string): Cluster {
  return findById(clusters, id, "cluster");
}

export function getBranches(): Branch[] {
  return [...branches];
}

export function getBranchById(id: string): Branch {
  return findById(branches, id, "branch");
}

export function getBranchesByCluster(clusterId: string): Branch[] {
  return branches.filter((b) => b.clusterId === clusterId);
}

export function getBranchCluster(branchId: string): Cluster {
  const branch = getBranchById(branchId);
  return getClusterById(branch.clusterId);
}
export function getTestimonials(): Testimonial[] {
  return [...testimonials];
}

export function getSocialPosts(): SocialPost[] {
  return [...socialPosts];
}
