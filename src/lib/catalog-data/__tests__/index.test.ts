import { describe, expect, it } from "vitest";
import {
  getBranchById,
  getBranchCluster,
  getBranches,
  getBranchesByCluster,
  getClusterById,
  getClusters,
  getPackageById,
  getPackages,
  getSocialPosts,
  getTestimonials,
} from "../index";
import type {
  Branch,
  Cluster,
  Package,
} from "../types";

describe("packages", () => {
  it("returns the three required packages", () => {
    const pkgs = getPackages();
    expect(pkgs).toHaveLength(3);
    const transmissions = pkgs.map((p) => p.transmission).sort();
    expect(transmissions).toEqual(["manual", "matic", "mixed"]);
  });

  it("every package is complete and marked dummy-priced", () => {
    for (const pkg of getPackages()) {
      expect(typeof pkg.id).toBe("string");
      expect(pkg.id.length).toBeGreaterThan(0);
      expect(typeof pkg.name).toBe("string");
      expect(pkg.name.length).toBeGreaterThan(0);
      expect(pkg.sessionCount).toBeGreaterThan(0);
      expect(pkg.durationHours).toBeGreaterThan(0);
      expect(pkg.vehicle).toBe("Mobil Full AC");
      expect(pkg.features.length).toBeGreaterThan(0);
      for (const f of pkg.features) {
        expect(typeof f).toBe("string");
        expect(f.length).toBeGreaterThan(0);
      }
      expect(pkg.priceIdr).toBeGreaterThan(0);
      expect(pkg.priceIsDummy).toBe(true);
    }
  });

  it("returns fresh array copies (mutation does not corrupt source)", () => {
    const a = getPackages();
    a.push(a[0]);
    expect(getPackages()).toHaveLength(3);
  });

  it("finds a package by id", () => {
    const manual = getPackageById("paket-manual");
    expect(manual.transmission).toBe("manual");
  });

  it("throws TypeError for an unknown package id", () => {
    expect(() => getPackageById("nope")).toThrow(TypeError);
  });
});

describe("clusters", () => {
  it("returns the two operational clusters with real WA numbers", () => {
    const cs = getClusters();
    expect(cs).toHaveLength(2);
    const byId = new Map(cs.map((c) => [c.id, c]));
    const a = byId.get("cluster_a_merr_selatan");
    const b = byId.get("cluster_b_manyar_pusat");
    expect(a?.whatsapp).toBe("+62 811-0000-0001");
    expect(a?.instagram).toBe("@pulung_drivingcourse");
    expect(b?.whatsapp).toBe("+62 811-0000-0002");
    expect(b?.instagram).toBe("@pulungkursusmengemudi");
  });

  it("finds a cluster by id", () => {
    expect(getClusterById("cluster_b_manyar_pusat").region).toMatch(/Manyar/);
  });

  it("throws TypeError for an unknown cluster id", () => {
    expect(() => getClusterById("nope")).toThrow(TypeError);
  });
});

describe("branches", () => {
  const clusterA = "cluster_a_merr_selatan";
  const clusterB = "cluster_b_manyar_pusat";

  it("returns exactly five branches", () => {
    expect(getBranches()).toHaveLength(5);
  });

  it("every branch maps to exactly one existing cluster", () => {
    const clusterIds = new Set(getClusters().map((c) => c.id));
    for (const branch of getBranches()) {
      expect(clusterIds.has(branch.clusterId)).toBe(true);
    }
  });

  it("splits three branches to Cluster A and two to Cluster B", () => {
    expect(getBranchesByCluster(clusterA)).toHaveLength(3);
    expect(getBranchesByCluster(clusterB)).toHaveLength(2);
  });

  it("Cluster A contains Gunung Anyar (main), Pandugo, Juanda", () => {
    const names = getBranchesByCluster(clusterA).map((b) => b.id);
    expect(names.sort()).toEqual(["gunung-anyar", "juanda", "pandugo"]);
    const main = getBranchById("gunung-anyar");
    expect(main.isMain).toBe(true);
    expect(main.address).toMatch(/Soekarno.*9D/);
  });

  it("Cluster B contains Manyar (main) and Pucang", () => {
    const names = getBranchesByCluster(clusterB).map((b) => b.id);
    expect(names.sort()).toEqual(["manyar", "pucang"]);
    expect(getBranchById("manyar").isMain).toBe(true);
    expect(getBranchById("pucang").address).toMatch(/Pucang Sewu/);
  });

  it("getBranchCluster routes to the correct admin per branch", () => {
    const expected: Record<string, string> = {
      "gunung-anyar": "+62 811-0000-0001",
      pandugo: "+62 811-0000-0001",
      juanda: "+62 811-0000-0001",
      manyar: "+62 811-0000-0002",
      pucang: "+62 811-0000-0002",
    };
    for (const branch of getBranches()) {
      const cluster: Cluster = getBranchCluster(branch.id);
      expect(cluster.whatsapp).toBe(expected[branch.id]);
    }
  });

  it("throws TypeError for an unknown branch id", () => {
    expect(() => getBranchById("nope")).toThrow(TypeError);
    expect(() => getBranchCluster("nope")).toThrow(TypeError);
  });
});

describe("testimonials", () => {
  it("returns 3-5 testimonials, all 5-star with Indonesian names", () => {
    const ts = getTestimonials();
    expect(ts.length).toBeGreaterThanOrEqual(3);
    expect(ts.length).toBeLessThanOrEqual(5);
    for (const t of ts) {
      expect(t.rating).toBe(5);
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.quote.length).toBeGreaterThan(0);
    }
  });
});

describe("social posts", () => {
  it("returns three posts linking to the real active accounts", () => {
    const posts = getSocialPosts();
    expect(posts).toHaveLength(3);
    const urls = posts.map((p) => p.url);
    expect(urls.every((u) => u.startsWith("https://www.instagram.com/"))).toBe(
      true,
    );
    const accounts = new Set(posts.map((p) => p.account));
    expect(accounts.has("@pulung_drivingcourse")).toBe(true);
    expect(accounts.has("@pulungkursusmengemudi")).toBe(true);
    for (const p of posts) {
      expect(p.platform).toBe("instagram");
      expect(p.captionPreview.length).toBeGreaterThan(0);
    }
  });
});

describe("type alignment", () => {
  it("query results carry the runtime shape their interfaces declare", () => {
    const pkg = getPackageById("paket-matic") as Package;
    expect(typeof pkg.id).toBe("string");
    expect(typeof pkg.transmission).toBe("string");
    expect(Array.isArray(pkg.features)).toBe(true);
    expect(pkg.priceIsDummy).toBe(true);

    const branch = getBranchById("manyar") as Branch;
    expect(typeof branch.clusterId).toBe("string");
    expect(branch.clusterId.length).toBeGreaterThan(0);

    const cluster = getClusterById("cluster_a_merr_selatan") as Cluster;
    expect(cluster.whatsapp).toMatch(/^\+62/);
  });
});
