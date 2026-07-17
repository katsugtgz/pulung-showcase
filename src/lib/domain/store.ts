/**
 * Internal mutable in-memory store for the domain module.
 *
 * NOT part of the public interface — consumers must use the query and mutation
 * functions exported from `index.ts`. This module is an implementation detail.
 *
 * Design: a globalThis-keyed singleton so that Next.js dev HMR and route-
 * handler module duplication do not fork separate store instances. Persistence
 * is intentionally in-memory only (PRD forbids a database for the demo; state
 * resets on server restart — acceptable).
 */

import { instruktur, pembayaran, sesi, siswa } from "./data";
import type { Instruktur, Pembayaran, Sesi, Siswa } from "./types";

export interface DomainStore {
  siswa: Siswa[];
  instruktur: Instruktur[];
  sesi: Sesi[];
  pembayaran: Pembayaran[];
}

const STORE_KEY = "__pulung_domain_store__";

/** Deep-clone the frozen seed arrays to produce a fresh mutable store. */
function seed(): DomainStore {
  // structuredClone creates a true deep copy, breaking all references to the
  // `as const` constants in data.ts. The `as unknown as` cast is required
  // because `as const` attaches narrow literal/readonly types that are
  // incompatible with the writable DomainStore interface at the type level
  // (runtime values are fully compatible).
  return structuredClone({
    siswa: [...siswa],
    instruktur: [...instruktur],
    sesi: [...sesi],
    pembayaran: [...pembayaran],
  }) as unknown as DomainStore;
}

// Use a typed cast to avoid `any`-widening on globalThis property access.
const g = globalThis as Record<string, unknown>;

/** Returns the live singleton store, initialising it on first access. */
export function getStore(): DomainStore {
  if (g[STORE_KEY] == null) {
    g[STORE_KEY] = seed();
  }
  return g[STORE_KEY] as DomainStore;
}

/** Restore pristine seed state. For use by `resetDomainStore()` in tests. */
export function resetStore(): void {
  g[STORE_KEY] = seed();
}
