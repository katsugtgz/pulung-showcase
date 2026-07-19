import { STICKERS_DATA } from "./data";
import type { Sticker } from "./types";

export type { Sticker };

/**
 * Mendapatkan semua stiker ilustrasi sebagai array baru.
 */
export function getStickers(): Sticker[] {
  return Object.values(STICKERS_DATA).map((s) => ({ ...s }));
}

/**
 * Mendapatkan satu stiker berdasarkan slug-nya.
 * Melempar TypeError jika slug tidak ditemukan.
 */
export function getSticker(slug: string): Sticker {
  const sticker = STICKERS_DATA[slug];
  if (!sticker) {
    throw new TypeError(`Sticker dengan slug "${slug}" tidak ditemukan.`);
  }
  return { ...sticker };
}
