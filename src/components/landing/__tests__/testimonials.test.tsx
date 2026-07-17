import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Testimonials } from "../testimonials";
import { getSectionHeader, getTestimonials } from "@/lib/copy";
import { getMapsRating } from "@/lib/maps-reviews";

afterEach(cleanup);

describe("Testimonials section", () => {
  it("renders the PAS section header from the copy module", () => {
    render(<Testimonials />);
    expect(
      screen.getByRole("heading", { name: getSectionHeader("testimonials") }),
    ).toBeInTheDocument();
  });

  it("renders the Google rating badge with id-ID decimal formatting", () => {
    render(<Testimonials />);
    const { rating, reviewCount } = getMapsRating();
    const label = rating.toLocaleString("id-ID", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    expect(label).toContain(",");
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(
      screen.getByText(`dari ${reviewCount} ulasan Google`),
    ).toBeInTheDocument();
  });

  it("renders every curated review with attribution", () => {
    render(<Testimonials />);
    const entries = getTestimonials();
    expect(entries).toHaveLength(6);
    for (const entry of entries) {
      expect(
        screen.getByText(
          (_, el) =>
            el?.tagName === "BLOCKQUOTE" &&
            el.textContent === `“${entry.quote}”`,
        ),
      ).toBeInTheDocument();
      expect(screen.getAllByText(entry.name).length).toBeGreaterThan(0);
    }
  });
});
