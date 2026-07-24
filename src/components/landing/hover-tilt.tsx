"use client";

import { useEffect, useRef, type ReactNode } from "react";

type HoverTiltProps = {
  children: ReactNode;
  className?: string;
  maxDegrees?: number;
};

export function HoverTilt({
  children,
  className,
  maxDegrees = 12,
}: HoverTiltProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current || !cardRef.current) return () => {};

    const root = rootRef.current;
    const card = cardRef.current;
    const reduce =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : { matches: false };

    function reset() {
      root.classList.remove("is-hover");
      card.classList.remove("is-tilting");
      card.style.setProperty("--tilt-rx", "0deg");
      card.style.setProperty("--tilt-ry", "0deg");
    }

    function track(event: PointerEvent) {
      if (reduce.matches || event.pointerType !== "mouse") return;

      const bounds = root.getBoundingClientRect();
      const x = Math.min(
        1,
        Math.max(0, (event.clientX - bounds.left) / bounds.width),
      );
      const y = Math.min(
        1,
        Math.max(0, (event.clientY - bounds.top) / bounds.height),
      );

      root.classList.add("is-hover");
      card.classList.add("is-tilting");
      card.style.setProperty(
        "--tilt-ry",
        `${((x - 0.5) * maxDegrees).toFixed(2)}deg`,
      );
      card.style.setProperty(
        "--tilt-rx",
        `${((0.5 - y) * maxDegrees).toFixed(2)}deg`,
      );
      card.style.setProperty("--tilt-gx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--tilt-gy", `${(y * 100).toFixed(1)}%`);
    }

    root.addEventListener("pointermove", track);
    root.addEventListener("pointerleave", reset);
    return () => {
      root.removeEventListener("pointermove", track);
      root.removeEventListener("pointerleave", reset);
    };
  }, [maxDegrees]);

  return (
    <div ref={rootRef} className={`t-tilt ${className ?? ""}`.trim()}>
      <div ref={cardRef} className="t-tilt-card">
        {children}
        <span aria-hidden="true" className="t-tilt-glare" />
      </div>
    </div>
  );
}
