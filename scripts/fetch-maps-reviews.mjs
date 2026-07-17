/**
 * Refresh src/lib/maps-reviews/snapshot.json from SerpAPI (google_maps_reviews).
 *
 * Manual, local-only tooling — deliberately NOT wired into build/prebuild:
 * the snapshot is committed data, the build stays fully offline, and the
 * rotating SERPAPI_KEY is never a deploy dependency.
 *
 * Usage:
 *   set -a; source .env.local; set +a
 *   node scripts/fetch-maps-reviews.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const SNAPSHOT_PATH = fileURLToPath(
  new URL("../src/lib/maps-reviews/snapshot.json", import.meta.url),
);

const apiKey = process.env.SERPAPI_KEY;
if (!apiKey) {
  console.error(
    "SERPAPI_KEY belum di-set. Muat dulu dari .env.local:\n" +
      "  set -a; source .env.local; set +a\n" +
      "lalu jalankan ulang: node scripts/fetch-maps-reviews.mjs",
  );
  process.exit(1);
}

const current = JSON.parse(await readFile(SNAPSHOT_PATH, "utf8"));

async function fetchBranch(branch) {
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", "google_maps_reviews");
  url.searchParams.set("data_id", branch.dataId);
  url.searchParams.set("hl", "id");
  url.searchParams.set("sort_by", "qualityScore");
  url.searchParams.set("api_key", apiKey);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`SerpAPI ${res.status} untuk cabang ${branch.slug}`);
  }
  const body = await res.json();
  if (body.error) {
    throw new Error(`SerpAPI error cabang ${branch.slug}: ${body.error}`);
  }

  const placeInfo = body.place_info ?? {};
  return {
    slug: branch.slug,
    label: branch.label,
    dataId: branch.dataId,
    rating: placeInfo.rating ?? branch.rating,
    reviewCount: placeInfo.reviews ?? branch.reviewCount,
    reviews: (body.reviews ?? [])
      .filter((r) => (r.snippet ?? "").trim().length > 0)
      .map((r) => ({
        author: r.user?.name ?? "Pengguna Google",
        rating: r.rating,
        date: r.date ?? "",
        snippet: r.snippet.trim(),
      })),
  };
}

const branches = await Promise.all(current.branches.map(fetchBranch));

const snapshot = {
  fetchedAt: new Date().toISOString().slice(0, 10),
  source: current.source,
  branches,
};

await writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);

for (const b of branches) {
  console.log(
    `${b.slug}: rating ${b.rating}, ${b.reviewCount} ulasan, ${b.reviews.length} tersimpan`,
  );
}
console.log(`Snapshot diperbarui: ${SNAPSHOT_PATH}`);
