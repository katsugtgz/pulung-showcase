"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/*
 * Reveal — progressive enhancement wrapper (issue #50 story #24). Baseline
 * konten SELALU tampil penuh: .t-reveal di globals.css hanya menggeser
 * translateY, tanpa opacity:0 atau blur. IntersectionObserver menambahkan
 * .is-shown saat section masuk viewport — menyeterakan posisi ke netral.
 *
 * Jika JS gagal, IntersectionObserver tak didukung, atau prefers-reduced-motion:
 * reduce — konten tetap terbaca penuh tanpa animasi (lihat globals.css). Hero
 * (elemen LCP) tidak pernah dibungkus; sekali tampil, observer langsung
 * diputus.
 */
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={shown ? "t-reveal is-shown" : "t-reveal"}>
      {children}
    </div>
  );
}
