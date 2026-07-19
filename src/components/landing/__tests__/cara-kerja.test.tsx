import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CaraKerja } from "../cara-kerja";
import { getCaraKerja, getSectionBody, getSectionHeader } from "@/lib/copy";

afterEach(cleanup);

/*
 * Cara Kerja (issue #50 story #4 + story #9) — three ordered steps sourced
 * from `getCaraKerja()`. Header + body from the copy module's section API.
 * The component is a Server Component (no client state) so the assertions are
 * pure render checks.
 */
describe("CaraKerja", () => {
  it("renders the PAS section header + body from the copy module", () => {
    render(<CaraKerja />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: getSectionHeader("cara-kerja"),
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(getSectionBody("cara-kerja"))).toBeInTheDocument();
  });

  it("renders exactly three steps in an <ol> (story #4)", () => {
    render(<CaraKerja />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(getCaraKerja().length);
    expect(getCaraKerja()).toHaveLength(3);
  });

  it("renders every step title from the copy module as an <h3>", () => {
    render(<CaraKerja />);
    for (const step of getCaraKerja()) {
      expect(
        screen.getByRole("heading", { level: 3, name: step.title }),
      ).toBeInTheDocument();
    }
  });

  it("renders every step description from the copy module (no hardcoded copy)", () => {
    render(<CaraKerja />);
    for (const step of getCaraKerja()) {
      expect(screen.getByText(step.description)).toBeInTheDocument();
    }
  });

  it("renders a NumberBadge glyph (svg) inside every step", () => {
    render(<CaraKerja />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(getCaraKerja().length);
    for (const item of items) {
      const svg = item.querySelector("svg");
      expect(svg).not.toBeNull();
    }
  });

  it("renders winding_road divider and step sticker pictograms", () => {
    const { container } = render(<CaraKerja />);
    
    // winding_road divider (decorative, hidden, empty alt)
    const windingRoadImg = container.querySelector('img[src*="winding_road.jpg"]') as HTMLImageElement;
    expect(windingRoadImg).toBeInTheDocument();
    expect(windingRoadImg.alt).toBe("");
    expect(windingRoadImg.closest('[aria-hidden="true"]')).not.toBeNull();

    // step stickers (all decorative, hidden, empty alt)
    const steeringImg = container.querySelector('img[src*="steering_wheel.jpg"]') as HTMLImageElement;
    expect(steeringImg).toBeInTheDocument();
    expect(steeringImg.alt).toBe("");
    expect(steeringImg.closest('[aria-hidden="true"]')).not.toBeNull();

    const coneImg = container.querySelector('img[src*="traffic_cone.jpg"]') as HTMLImageElement;
    expect(coneImg).toBeInTheDocument();
    expect(coneImg.alt).toBe("");
    expect(coneImg.closest('[aria-hidden="true"]')).not.toBeNull();

    const seatbeltImg = container.querySelector('img[src*="seatbelt_buckle.jpg"]') as HTMLImageElement;
    expect(seatbeltImg).toBeInTheDocument();
    expect(seatbeltImg.alt).toBe("");
    expect(seatbeltImg.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});

