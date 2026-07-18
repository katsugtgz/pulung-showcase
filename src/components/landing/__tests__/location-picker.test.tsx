import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { WhatsAppLinkOptions } from "@/lib/wa-router";

/*
 * Mock @/lib/wa-router so the test can assert the location picker passes the
 * right { branchId, transmission } shape to buildWhatsAppLink. Routing itself
 * (cluster A vs B, prefilled message) has its own unit tests in
 * src/lib/wa-router/__tests__; here we only verify the DOM wiring.
 */
const calls: WhatsAppLinkOptions[] = [];
const buildWhatsAppLinkMock = vi.fn((opts: WhatsAppLinkOptions) => {
  calls.push(opts);
  return `https://wa.me/mock?branch=${opts.branchId}&transmission=${opts.transmission ?? "none"}`;
});

vi.mock("@/lib/wa-router", () => ({
  buildWhatsAppLink: (opts: WhatsAppLinkOptions) => buildWhatsAppLinkMock(opts),
}));

import { LocationPicker } from "../location-picker";
import { getBranches, getBranchesByCluster, getClusters } from "@/lib/catalog-data";

function branchListItems() {
  // Use hidden:true so we observe every <li> (the component keeps hidden
  // branches in the DOM for SEO + the wa-link-correctness QA flow).
  const list = screen.getByRole("list", { name: "Daftar cabang" });
  return within(list).getAllByRole("listitem", { hidden: true });
}

function visibleBranchNames(): string[] {
  return branchListItems()
    .filter((i) => !i.hasAttribute("hidden"))
    .map(
      (i) =>
        within(i).queryByRole("heading", { level: 4 })?.textContent ??
        "",
    )
    .filter(Boolean);
}

beforeEach(() => {
  buildWhatsAppLinkMock.mockClear();
  calls.length = 0;
});

afterEach(cleanup);

/*
 * Pilih Lokasi (#lokasi) — story #14 (transmission toggle), #15 (cluster
 * selector + progressive disclosure), #17/#38 (cluster-routed WA link),
 * #19 (dark-green WA buttons). This is the BUSINESS-CRITICAL section: wrong
 * cluster routing is a real bug (AGENTS.md).
 */
describe("LocationPicker", () => {
  it("renders the two cluster selectors with aria-label + aria-pressed (story #15)", () => {
    render(<LocationPicker />);
    const group = screen.getByRole("group", {
      name: "Pilih klaster area",
    });
    expect(group).toBeInTheDocument();
    const clusterButtons = within(group).getAllByRole("button");
    expect(clusterButtons).toHaveLength(getClusters().length);
    for (const btn of clusterButtons) {
      expect(btn).toHaveAttribute("aria-pressed", "false");
    }
  });

  it("renders the transmission toggle with aria-label + aria-pressed (story #14)", () => {
    render(<LocationPicker />);
    const group = screen.getByRole("group", {
      name: "Pilih jenis transmisi",
    });
    expect(group).toBeInTheDocument();
    const toggleButtons = within(group).getAllByRole("button");
    expect(toggleButtons).toHaveLength(3);
    for (const btn of toggleButtons) {
      expect(btn).toHaveAttribute("aria-pressed", "false");
    }
  });

  it("progressive disclosure: initially every branch card is hidden (story #15)", () => {
    render(<LocationPicker />);
    const items = branchListItems();
    expect(items).toHaveLength(getBranches().length);
    for (const item of items) {
      expect(item).toHaveAttribute("hidden");
    }
    expect(
      screen.getByText("Pilih klaster area di atas untuk melihat cabang yang tersedia."),
    ).toBeInTheDocument();
  });

  it("progressive disclosure: clicking Cluster A reveals only the 3 Cluster A branches (story #15)", async () => {
    const user = userEvent.setup();
    render(<LocationPicker />);

    const group = screen.getByRole("group", { name: "Pilih klaster area" });
    const clusterA = getClusters()[0];
    const clusterAButton = within(group).getByRole("button", {
      name: new RegExp(clusterA.region.slice(0, 20)),
    });

    await user.click(clusterAButton);

    expect(clusterAButton).toHaveAttribute("aria-pressed", "true");
    expect(visibleBranchNames().sort()).toEqual(
      getBranchesByCluster(clusterA.id)
        .map((b) => b.name)
        .sort(),
    );
    // Sanity: Cluster A has 3 branches, so the other 2 stay hidden.
    const hidden = branchListItems().filter((i) => i.hasAttribute("hidden"));
    expect(hidden).toHaveLength(
      getBranches().length - getBranchesByCluster(clusterA.id).length,
    );
  });

  it("progressive disclosure: re-clicking the same cluster collapses back to all-hidden", async () => {
    const user = userEvent.setup();
    render(<LocationPicker />);

    const group = screen.getByRole("group", { name: "Pilih klaster area" });
    const clusterA = getClusters()[0];
    const clusterAButton = within(group).getByRole("button", {
      name: new RegExp(clusterA.region.slice(0, 20)),
    });

    await user.click(clusterAButton);
    expect(clusterAButton).toHaveAttribute("aria-pressed", "true");

    await user.click(clusterAButton);
    expect(clusterAButton).toHaveAttribute("aria-pressed", "false");

    const items = branchListItems();
    for (const item of items) {
      expect(item).toHaveAttribute("hidden");
    }
  });

  it("progressive disclosure: switching clusters re-hides the previous cluster's branches", async () => {
    const user = userEvent.setup();
    render(<LocationPicker />);

    const group = screen.getByRole("group", { name: "Pilih klaster area" });
    const [clusterA, clusterB] = getClusters();
    const clusterAButton = within(group).getByRole("button", {
      name: new RegExp(clusterA.region.slice(0, 20)),
    });
    const clusterBButton = within(group).getByRole("button", {
      name: new RegExp(clusterB.region.slice(0, 20)),
    });

    await user.click(clusterAButton);
    expect(visibleBranchNames().sort()).toEqual(
      getBranchesByCluster(clusterA.id)
        .map((b) => b.name)
        .sort(),
    );

    await user.click(clusterBButton);
    expect(clusterAButton).toHaveAttribute("aria-pressed", "false");
    expect(clusterBButton).toHaveAttribute("aria-pressed", "true");
    expect(visibleBranchNames().sort()).toEqual(
      getBranchesByCluster(clusterB.id)
        .map((b) => b.name)
        .sort(),
    );
  });

  it("transmission toggle reflects into buildWhatsAppLink (story #14 — business-critical)", async () => {
    const user = userEvent.setup();
    render(<LocationPicker />);

    const transmissionGroup = screen.getByRole("group", {
      name: "Pilih jenis transmisi",
    });
    const maticButton = within(transmissionGroup).getByRole("button", {
      name: "Matic",
    });

    buildWhatsAppLinkMock.mockClear();
    calls.length = 0;
    await user.click(maticButton);

    expect(maticButton).toHaveAttribute("aria-pressed", "true");
    // The component renders every branch card on each state change (hidden
    // branches stay in the DOM for the wa-link-correctness QA flow), so each
    // transmission toggle rebuilds all N branch WA links.
    expect(buildWhatsAppLinkMock).toHaveBeenCalledTimes(getBranches().length);
    expect(calls.every((c) => c.transmission === "matic")).toBe(true);

    buildWhatsAppLinkMock.mockClear();
    calls.length = 0;
    await user.click(maticButton);
    expect(maticButton).toHaveAttribute("aria-pressed", "false");
    expect(calls.every((c) => c.transmission === undefined)).toBe(true);
  });

  it("renders every branch card's WhatsApp link via buildWhatsAppLink (no hardcoded wa.me)", () => {
    render(<LocationPicker />);
    expect(buildWhatsAppLinkMock).toHaveBeenCalledTimes(getBranches().length);
    const hardcoded = document.querySelectorAll(
      '#lokasi a[href^="https://wa.me/6"]',
    );
    expect(hardcoded.length).toBe(0);
  });

  it("uses the WhatsApp dark-green surface on every branch CTA (story #19)", () => {
    render(<LocationPicker />);
    const links = document.querySelectorAll(
      '#lokasi a[href^="https://wa.me/mock"]',
    );
    expect(links.length).toBe(getBranches().length);
    for (const a of Array.from(links)) {
      expect(a.className).toContain("bg-[#075E54]");
    }
  });

  it("exposes each cluster's region + admin WhatsApp number in its selector button", () => {
    render(<LocationPicker />);
    const group = screen.getByRole("group", { name: "Pilih klaster area" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons).toHaveLength(getClusters().length);
    for (let i = 0; i < getClusters().length; i++) {
      const cluster = getClusters()[i];
      const btn = buttons[i];
      expect(btn.textContent ?? "").toContain(cluster.region);
      expect(btn.textContent ?? "").toContain(cluster.whatsapp);
    }
  });
});
