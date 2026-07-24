import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
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

describe("Reveal bidirectional motion", () => {
  it("resets outside the viewport and replays from the scroll direction", () => {
    type ObserverCallback = IntersectionObserverCallback;
    const observers: Array<{
      callback: ObserverCallback;
      observed: Element[];
      disconnected: boolean;
    }> = [];

    class MockIntersectionObserver {
      callback: ObserverCallback;
      observed: Element[] = [];
      disconnected = false;

      constructor(callback: ObserverCallback) {
        this.callback = callback;
        observers.push(this);
      }

      observe = (element: Element) => {
        this.observed.push(element);
      };

      unobserve = () => {};

      disconnect = () => {
        this.disconnected = true;
      };
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const { container } = render(
      <Reveal>
        <p>Konten dua arah</p>
      </Reveal>,
    );
    const wrapper = container.firstElementChild as HTMLDivElement;
    const sectionObserver = observers.find(
      (observer) => observer.observed[0] === wrapper,
    );
    expect(sectionObserver).toBeDefined();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 500,
    });
    act(() => {
      sectionObserver!.callback(
        [
          {
            isIntersecting: true,
            target: wrapper,
          } as unknown as IntersectionObserverEntry,
        ],
        sectionObserver as unknown as IntersectionObserver,
      );
    });
    expect(wrapper).toHaveClass("is-shown");
    expect(wrapper.dataset.scrollFrom).toBe("bottom");

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 900,
    });
    act(() => {
      sectionObserver!.callback(
        [
          {
            isIntersecting: false,
            target: wrapper,
          } as unknown as IntersectionObserverEntry,
        ],
        sectionObserver as unknown as IntersectionObserver,
      );
    });
    expect(wrapper).not.toHaveClass("is-shown");

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 400,
    });
    act(() => {
      sectionObserver!.callback(
        [
          {
            isIntersecting: true,
            target: wrapper,
          } as unknown as IntersectionObserverEntry,
        ],
        sectionObserver as unknown as IntersectionObserver,
      );
    });
    expect(wrapper).toHaveClass("is-shown");
    expect(wrapper.dataset.scrollFrom).toBe("top");
  });
});
