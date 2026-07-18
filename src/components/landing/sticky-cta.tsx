"use client";

import { useEffect, useState } from "react";
import { getStickyCta } from "@/lib/copy";
import { WhatsappIcon } from "@/components/landing/icons";

/*
 * StickyCta — floating bottom CTA on mobile only (issue #50 story #20). Routes
 * to #lokasi (per getStickyCta()) so the prospect reaches the cluster-routed
 * WhatsApp admin rather than a generic number. Persistent but unobtrusive:
 * hides via IntersectionObserver when the #lokasi section (the CTA destination)
 * or the site footer enters the viewport — never obscures them. Respects
 * env(safe-area-inset-bottom) for iOS home indicator. Slide transition is
 * opt-in via motion-safe (prefers-reduced-motion users get instant toggle).
 *
 * Mobile-only (lg:hidden): desktop viewport has enough surface for in-line
 * CTAs, so the sticky bar would only add noise there.
 *
 * Contrast: text-white on bg-primary-dark (#185A99) ≈ 4.88:1 — passes WCAG
 * AA 4.5:1 for normal text (story #22).
 */
export function StickyCta() {
  const cta = getStickyCta();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const lokasi = document.getElementById("lokasi");
    const footer = document.querySelector("footer");
    const targets: Element[] = [];
    if (lokasi) targets.push(lokasi);
    if (footer) targets.push(footer);
    if (targets.length === 0) return;

    const intersecting = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersecting.add(entry.target);
          } else {
            intersecting.delete(entry.target);
          }
        }
        setHidden(intersecting.size > 0);
      },
      { threshold: 0 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <a
      href={cta.href}
      aria-label={cta.label}
      className={[
        "lg:hidden",
        "fixed bottom-0 left-0 right-0 z-20",
        "flex items-center justify-center gap-2",
        "bg-primary-dark px-4 pt-3 text-sm font-bold text-white",
        "shadow-[0_-2px_12px_rgba(15,23,42,0.12)]",
        "motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out",
        hidden ? "translate-y-full" : "translate-y-0",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-dark",
      ].join(" ")}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <WhatsappIcon className="h-4 w-4" />
      {cta.label}
    </a>
  );
}
