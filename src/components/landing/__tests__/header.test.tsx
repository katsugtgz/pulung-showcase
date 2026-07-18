import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { Header } from "../header";

afterEach(cleanup);

/*
 * Header (issue #50, ticket #52) — desktop navigation contract.
 *
 * The header exposes four in-page anchors (Paket, Cara Kerja, Lokasi, FAQ) on
 * lg+ viewports plus static Masuk / Daftar auth links. Anchor links must stay
 * Clerk-free (ADR-002) and must each point at a real section id on the landing.
 *
 * What is NOT tested here (covered elsewhere):
 *   - Focus-visible ring presence on every link → accessibility-baseline.test.tsx
 *   - Wordmark pill lockup → covered structurally by the link + span class
 */
describe("Header navigation contract", () => {
  it("renders the PULUNG wordmark link to / (the landing root)", () => {
    render(<Header />);
    // aria-label = "P PULUNG — beranda" matches visible text "P" + "PULUNG"
    // (Lighthouse label-content-name-mismatch: accessible name must begin
    // with the full visible text content, including the badge letter).
    const wordmark = screen.getByLabelText("P PULUNG — beranda");
    expect(wordmark).toHaveAttribute("href", "/");
  });

  it("exposes all four in-page section anchors: Paket, Cara Kerja, Lokasi, FAQ (issue #50 story #21, ticket #52)", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: "Navigasi utama" });
    const paket = within(nav).getByRole("link", { name: "Paket" });
    const caraKerja = within(nav).getByRole("link", { name: "Cara Kerja" });
    const lokasi = within(nav).getByRole("link", { name: "Lokasi" });
    const faq = within(nav).getByRole("link", { name: "FAQ" });

    expect(paket).toHaveAttribute("href", "#packages");
    expect(caraKerja).toHaveAttribute("href", "#cara-kerja");
    expect(lokasi).toHaveAttribute("href", "#lokasi");
    expect(faq).toHaveAttribute("href", "#faq");
  });

  it("keeps auth links static (<Link>, not Clerk client components) per ADR-002", () => {
    render(<Header />);
    const masuk = screen.getByRole("link", { name: "Masuk" });
    const daftar = screen.getByRole("link", { name: "Daftar" });
    expect(masuk).toHaveAttribute("href", "/sign-in");
    expect(daftar).toHaveAttribute("href", "/sign-up");
  });

  /*
   * DOM-order check — anchors in navigation MUST appear in the spec order
   * (Paket → Cara Kerja → Lokasi → FAQ) so screen-reader traversal matches
   * the visual reading order. A future refactor that re-sorts the array or
   * adds a new anchor in the wrong slot should fail this test.
   */
  it("renders anchors in spec order: Paket → Cara Kerja → Lokasi → FAQ", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: "Navigasi utama" });
    const anchors = within(nav).getAllByRole("link");
    const labels = anchors.map((a) => a.textContent?.trim() ?? "");
    expect(labels).toEqual(["Paket", "Cara Kerja", "Lokasi", "FAQ"]);
  });

  /*
   * Mobile navigation contract (issue #50 ticket #55). Below lg+, a second
   * horizontally-scrollable pill nav exposes the same four section anchors
   * so mobile users don't need to scroll back to the hero to reach them.
   * The desktop nav (above) and this mobile nav share the same href set;
   * they differ only in visual treatment.
   */
  it("renders a second mobile-only nav with the same four anchors (ticket #55)", () => {
    render(<Header />);
    const mobileNav = screen.getByRole("navigation", {
      name: "Navigasi section (mobile)",
    });
    expect(mobileNav).toHaveClass("lg:hidden");
    const paket = within(mobileNav).getByRole("link", { name: "Paket" });
    const caraKerja = within(mobileNav).getByRole("link", { name: "Cara Kerja" });
    const lokasi = within(mobileNav).getByRole("link", { name: "Lokasi" });
    const faq = within(mobileNav).getByRole("link", { name: "FAQ" });
    expect(paket).toHaveAttribute("href", "#packages");
    expect(caraKerja).toHaveAttribute("href", "#cara-kerja");
    expect(lokasi).toHaveAttribute("href", "#lokasi");
    expect(faq).toHaveAttribute("href", "#faq");
  });

  /*
   * Auth demotion contract (ticket #55). On mobile, Masuk/Daftar are
   * demoted to compact text-link treatment so the course-discovery pill
   * nav gets visual priority. The href contract (/sign-in, /sign-up) is
   * unchanged — only the visual treatment shifts. We assert the smaller
   * text size + tighter padding so a future author can't accidentally
   * promote them back to dominant buttons on mobile.
   */
  it("demotes Masuk/Daftar to compact treatment on mobile (text-xs, no border)", () => {
    render(<Header />);
    const masuk = screen.getByRole("link", { name: "Masuk" });
    const daftar = screen.getByRole("link", { name: "Daftar" });
    // text-xs is the mobile base; sm:text-sm promotes back at sm+.
    expect(masuk.className).toMatch(/text-xs/);
    expect(masuk.className).toMatch(/sm:text-sm/);
    expect(daftar.className).toMatch(/text-xs/);
    expect(daftar.className).toMatch(/sm:text-sm/);
  });
});
