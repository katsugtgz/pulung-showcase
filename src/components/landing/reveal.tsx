"use client";

import {
  Children,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  eager?: boolean;
  stagger?: boolean;
};

const SURFACE_SELECTOR = [
  "article",
  "figure",
  "#faq li",
  '[class*="rounded-xl"]',
  '[class*="rounded-2xl"]',
].join(",");

function reducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function cssDuration(variable: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  const value = Number.parseFloat(raw);

  if (!Number.isFinite(value)) return fallback;
  return raw.endsWith("ms") ? value : value * 1000;
}

function collectSurfaces(root: HTMLElement): HTMLElement[] {
  const candidates = Array.from(
    root.querySelectorAll<HTMLElement>(SURFACE_SELECTOR),
  );

  const priority = candidates.filter((element) => {
    if (element.closest(".t-tilt")) return false;
    if (element.matches(".t-action, .t-header-action, .t-nav-link")) {
      return false;
    }

    if (element.matches("article, figure, #faq li, li")) return true;
    if (element.matches("button")) return element.classList.contains("flex-col");
    if (element.matches("a")) return element.classList.contains("h-full");
    return false;
  });

  const topLevelPriority = priority.filter(
    (element) =>
      !priority.some(
        (parent) => parent !== element && parent.contains(element),
      ),
  );

  const generic = candidates.filter((element) => {
    if (!(element instanceof HTMLDivElement)) return false;
    if (element.closest(".t-tilt")) return false;
    if (
      element.classList.contains("absolute") ||
      element.classList.contains("pointer-events-none")
    ) {
      return false;
    }

    const bounds = element.getBoundingClientRect();
    if (bounds.width < 120 || bounds.height < 64) return false;

    return !topLevelPriority.some(
      (surface) => surface.contains(element) || element.contains(surface),
    );
  });

  return [...topLevelPriority, ...generic];
}

function observeSurfaces(
  surfaces: HTMLElement[],
  duration: number,
): () => void {
  const settleTimers = new Map<HTMLElement, number>();
  let lastScrollY = window.scrollY;

  const observer = new IntersectionObserver(
    (entries) => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY >= lastScrollY;

      entries.forEach((entry) => {
        const surface = entry.target as HTMLElement;
        const activeTimer = settleTimers.get(surface);
        if (activeTimer !== undefined) {
          window.clearTimeout(activeTimer);
          settleTimers.delete(surface);
        }

        surface.dataset.motionFrom = scrollingDown ? "bottom" : "top";

        if (!entry.isIntersecting) {
          surface.dataset.motionShown = "false";
          surface.dataset.motionSettled = "false";
          return;
        }

        surface.dataset.motionPreparing = "true";
        surface.dataset.motionShown = "false";
        void surface.offsetHeight;
        delete surface.dataset.motionPreparing;

        surface.dataset.motionShown = "true";
        surface.dataset.motionSettled = "false";

        const delay = Number.parseFloat(
          surface.style.getPropertyValue("--motion-card-delay"),
        );
        const timer = window.setTimeout(() => {
          surface.dataset.motionSettled = "true";
        }, duration + (Number.isFinite(delay) ? delay : 0) + 50);
        settleTimers.set(surface, timer);
      });

      lastScrollY = currentScrollY;
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
  );

  surfaces.forEach((surface) => observer.observe(surface));

  return () => {
    observer.disconnect();
    settleTimers.forEach((timer) => window.clearTimeout(timer));
    settleTimers.clear();
  };
}

export function Reveal({
  children,
  className,
  eager = false,
  stagger = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (reducedMotion() || typeof IntersectionObserver === "undefined") {
      setReady(true);
      setShown(true);
      return;
    }

    setReady(true);

    let lastScrollY = window.scrollY;
    let revealFrame = eager
      ? window.requestAnimationFrame(() => setShown(true))
      : undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        const currentScrollY = window.scrollY;
        element.dataset.scrollFrom =
          currentScrollY < lastScrollY ? "top" : "bottom";

        if (revealFrame !== undefined) {
          window.cancelAnimationFrame(revealFrame);
          revealFrame = undefined;
        }

        if (entry.isIntersecting) {
          setShown(false);
          element.dataset.scrollPreparing = "true";
          void element.offsetHeight;
          delete element.dataset.scrollPreparing;
          revealFrame = window.requestAnimationFrame(() => {
            setShown(true);
            revealFrame = undefined;
          });
        } else {
          setShown(false);
        }

        lastScrollY = currentScrollY;
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (revealFrame !== undefined) {
        window.cancelAnimationFrame(revealFrame);
      }
    };
  }, [eager]);

  useEffect(() => {
    const root = ref.current;
    const surfaces = root ? collectSurfaces(root) : [];
    const duration = cssDuration("--motion-card-dur", 620);
    const staggerDuration = cssDuration("--motion-card-stagger", 75);

    surfaces.forEach((surface, index) => {
      const delay = 160 + Math.min(index, 6) * staggerDuration;
      surface.style.setProperty("--motion-card-delay", `${delay}ms`);
      surface.dataset.motionCard = "ready";
      surface.dataset.motionShown = "false";
      surface.dataset.motionSettled = "false";
      surface.dataset.motionFrom = "bottom";
    });

    if (reducedMotion() || typeof IntersectionObserver === "undefined") {
      surfaces.forEach((surface) => {
        surface.dataset.motionShown = "true";
        surface.dataset.motionSettled = "true";
      });
      return () => {};
    }

    return observeSurfaces(surfaces, duration);
  }, []);

  const stateClasses = [
    "t-reveal",
    stagger ? "t-reveal-stagger" : "",
    className ?? "",
    ready ? "is-motion-ready" : "",
    shown ? "is-shown" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={stateClasses}>
      {stagger
        ? Children.map(children, (child, index) => (
            <div
              className="t-reveal-line"
              style={{ "--reveal-index": index } as CSSProperties}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
