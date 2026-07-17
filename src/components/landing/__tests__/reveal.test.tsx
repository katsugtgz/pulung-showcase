import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Reveal } from "../reveal";

/*
 * Reveal memakai IntersectionObserver untuk menampilkan section saat masuk
 * viewport. Bila IntersectionObserver tak tersedia, komponen harus langsung
 * menampilkan konten (jalur fallback). jsdom memang tidak menyediakannya, tapi
 * kita stub jadi undefined agar tes deterministik di lingkungan mana pun.
 */
beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", undefined);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Reveal fallback", () => {
  it("shows content immediately when IntersectionObserver is unavailable", () => {
    render(
      <Reveal>
        <p>Konten section</p>
      </Reveal>,
    );

    const child = screen.getByText("Konten section");
    expect(child).toBeVisible();

    const wrapper = child.parentElement;
    expect(wrapper).toHaveClass("t-reveal");
    expect(wrapper).toHaveClass("is-shown");
  });
});
