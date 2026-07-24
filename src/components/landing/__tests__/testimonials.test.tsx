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

  /*
   * Google provenance contract (issue #50 ticket #56). Every testimonial
   * card MUST carry a visible official Google mark so the proof stays
   * attributed without a text-only imitation of the brand.
   */
  it("renders a visible 'Google' provenance marker on every testimonial card", () => {
    render(<Testimonials />);
    const entries = getTestimonials();
    // Figure = testimonial card. One per entry.
    const cards = document.querySelectorAll("figure");
    expect(cards.length).toBe(entries.length);
    for (const card of Array.from(cards)) {
      const figcaption = card.querySelector("figcaption");
      const badge = figcaption?.querySelector('[aria-label="Sumber: Google"]');
      expect(badge).not.toBeNull();
      expect(badge?.querySelector('img[src*="google-g.svg"]')).not.toBeNull();
    }
  });

  /*
   * No-fabrication guard (issue #50 story #26 + ticket #56). Testimonial
   * cards must NOT invent reviewer photos, dates, verification badges, or
   * other fabricated metadata. The only acceptable image-like element is
   * the decorative initials avatar (a <span>, not an <img>). If a future
   * author adds an <img> with a stock-photo URL, this test fails.
   */
  it("renders stickers from the illustrations module and hides decorative ones", () => {
    const { container } = render(<Testimonials />);
    const stickerImgs = container.querySelectorAll('img[src*="stickers"]');
    expect(stickerImgs.length).toBe(2);

    // instructor_student sticker (informative, has actual alt text)
    const instructorImg = container.querySelector('img[src*="instructor_student.jpg"]') as HTMLImageElement;
    expect(instructorImg).toBeInTheDocument();
    expect(instructorImg.alt).toBe("Ilustrasi instruktur mengemudi tersenyum ramah menyapa siswa dari kursi penumpang");

    // roundabout_sign sticker (decorative, empty alt, under aria-hidden container)
    const roundaboutImg = container.querySelector('img[src*="roundabout_sign.jpg"]') as HTMLImageElement;
    expect(roundaboutImg).toBeInTheDocument();
    expect(roundaboutImg.alt).toBe("");
    expect(roundaboutImg.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it("does not render any reviewer-profile <img> element (no fabricated reviewer photos)", () => {
    const { container } = render(<Testimonials />);
    const imgs = container.querySelectorAll("img");
    for (const img of Array.from(imgs)) {
      const src = img.getAttribute("src") || "";
      // Only allow section stickers and the official Google provenance mark.
      expect(src).toMatch(/stickers|google-g\.svg/);
    }
  });


  /*
   * Visual differentiation contract (ticket #56). Testimonial cards must
   * NOT reuse the package card's chrome (centered white bordered article).
   * Structural markers: <figure> (semantic testimonial), alternating tonal
   * surfaces (bg-white ↔ bg-primary/10), and figcaption (attribution). If
   * a refactor collapses testimonials into the package-card pattern, the
   * figure/figcaption semantics will fail first.
   */
  it("uses testimonial-specific semantics (figure + figcaption, not package article)", () => {
    const { container } = render(<Testimonials />);
    expect(container.querySelector("figure")).not.toBeNull();
    expect(container.querySelector("figcaption")).not.toBeNull();
    expect(container.querySelector("article.testimonial-card")).toBeNull();
  });
});
