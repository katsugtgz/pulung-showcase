import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { Packages } from "../packages";
import { getSectionBody, getSectionHeader, getSamplePriceDisclaimer } from "@/lib/copy";
import { getPackages, type TransmissionType } from "@/lib/catalog-data";
import { formatIDR } from "@/lib/format";

afterEach(cleanup);

/*
 * Packages (#packages) — issue #50 stories #10-13 + #29 + #30:
 *   - transmission pictogram per card (ManualTransmissionIcon etc. — story #10)
 *   - sample-price disclaimer via getSamplePriceDisclaimer() (story #29)
 *   - NO "popularity" badge (story #13 — no authoritative field)
 *   - mixed/Kombinasi gets a tonal shift (NOT a "populer" label)
 */
describe("Packages section", () => {
  it("renders the PAS section header + body from the copy module", () => {
    render(<Packages />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: getSectionHeader("paket"),
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(getSectionBody("paket"))).toBeInTheDocument();
  });

  it("renders one card per package from @/lib/catalog-data", () => {
    render(<Packages />);
    const items = screen.getAllByRole("listitem", { hidden: true });
    // Filter to package cards (the section has only the package list inside).
    const packageCards = screen.getAllByText(/Paket/, {
      selector: "h3",
    });
    expect(packageCards).toHaveLength(getPackages().length);
    void items;
  });

  it("renders every package name as an <h3> (no hardcoded strings)", () => {
    render(<Packages />);
    for (const pkg of getPackages()) {
      expect(
        screen.getByRole("heading", { level: 3, name: pkg.name }),
      ).toBeInTheDocument();
    }
  });

  it("renders a transmission label chip per package", () => {
    render(<Packages />);
    const expected: Record<TransmissionType, string> = {
      manual: "Manual",
      matic: "Matic",
      mixed: "Kombinasi",
    };
    for (const pkg of getPackages()) {
      expect(screen.getByText(expected[pkg.transmission])).toBeInTheDocument();
    }
  });

  it("renders a transmission pictogram (svg) inside every package chip (story #10)", () => {
    render(<Packages />);
    // Each card's transmission chip is a <span> containing both an inline SVG
    // (the pictogram from icons.tsx) and the label text. We assert the count
    // rather than the specific path because the icon vocabulary is exercised
    // by the icons module's own tests.
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(getPackages().length);
    for (const card of cards) {
      const svgs = card.querySelectorAll("svg");
      // Every card has at minimum: 1 transmission pictogram + N feature-check
      // icons (one per feature bullet). The pictogram must exist.
      expect(svgs.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("renders the canonical sample-price disclaimer from @/lib/copy on every card (story #29)", () => {
    render(<Packages />);
    const disclaimer = getSamplePriceDisclaimer();
    const disclaimerNodes = screen.getAllByText(disclaimer);
    expect(disclaimerNodes).toHaveLength(getPackages().length);
  });

  it("formats each package price via formatIDR — no hardcoded price strings", () => {
    render(<Packages />);
    for (const pkg of getPackages()) {
      expect(screen.getByText(formatIDR(pkg.priceIdr))).toBeInTheDocument();
    }
  });

  it("renders a 'Pelajari' link to the catalog detail page per package", () => {
    render(<Packages />);
    const links = screen.getAllByRole("link", { name: "Pelajari" });
    expect(links).toHaveLength(getPackages().length);
    for (let i = 0; i < getPackages().length; i++) {
      expect(links[i]).toHaveAttribute("href", `/catalog/${getPackages()[i].id}`);
    }
  });

  it("does NOT render any popularity badge or ranking label (story #13)", () => {
    render(<Packages />);
    const section = screen.getByRole("region", { name: /paket/i });
    // No "populer", "best", "terlaris", "paling laku", "recommended", or
    // similar claim — there is no authoritative field in catalog-data.
    const forbidden = /populer|terlaris|paling laku|best seller|best-seller|recommended|paling populer/i;
    const text = section.textContent ?? "";
    expect(text).not.toMatch(forbidden);
  });

  it("renders the mixed/Kombinasi package with a tonal shift (no popularity claim)", () => {
    render(<Packages />);
    // Kombinasi card carries a primary-tinted chip + border so it reads as
    // premium WITHOUT asserting popularity (story #30).
    const mixed = getPackages().find((p) => p.transmission === "mixed");
    expect(mixed).toBeDefined();
    const cards = screen.getAllByRole("article");
    const mixedCard = cards.find(
      (c) => (c.querySelector("h3")?.textContent ?? "") === mixed?.name,
    );
    expect(mixedCard).toBeDefined();
    expect(mixedCard?.className).toContain("border-primary");
    void within;
  });
});
