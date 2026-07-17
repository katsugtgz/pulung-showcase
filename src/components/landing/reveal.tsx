"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/*
 * Reveal — membungkus satu section agar naik-memudar (rise + fade + un-blur)
 * saat pertama masuk viewport. Murni CSS (kelas .t-reveal di globals.css,
 * kosakata token transitions-dev) + IntersectionObserver tipis — tanpa pustaka
 * animasi. prefers-reduced-motion di-guard di CSS; tanpa JS, <noscript> di
 * layout memaksa .t-reveal tetap terlihat. Konten selalu ada di DOM (SSR),
 * hanya disembunyikan secara visual sampai ter-scroll — aman untuk SEO & LCP
 * (Hero tidak dibungkus). Sekali tampil, observer langsung diputus.
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
    /*
     * JS hidup — lucuti failsafe CSS (animation 2.5s di .t-reveal). Tanpa ini,
     * fill 'forwards' memaksa semua section tampil pada t≈2.5s meski JS sehat,
     * sehingga reveal saat scroll tak pernah terjadi setelah itu.
     */
    el.style.animation = "none";
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
