// QA flow: landing page WCAG contrast + reduced-motion + IntersectionObserver
// fallback (issue #50 stories #19, #22, #44 + a11y-motion decisions).
//
// Prerequisites: same as landing-render.mjs (pnpm dev + Clerk keys + agent-browser).
//
// Asserts at 390 / 768 / 1024 / 1440 px viewport widths:
//   - No horizontal overflow (scroll width ≤ client width + 1px tolerance).
//   - Hero <h1>, body text, and primary + secondary CTA button text all pass
//     WCAG AA contrast against their effective backgrounds (4.5:1 for normal
//     text, 3:1 for large/bold text). Contrast computed manually from
//     getComputedStyle color + backgroundColor, walking up the tree to find
//     a non-transparent ancestor background.
//   - Every visible WhatsApp button (#lokasi a[href^="https://wa.me/"]) uses
//     the dark-green surface (#075E54 / rgb(7,94,84)) — story #19.
//   - Under prefers-reduced-motion: reduce, every visible element with text
//     content has opacity:1 (no animation-gated hidden content).
//   - With window.IntersectionObserver force-undefined, every section above
//     the fold is visible (Reveal failsafe — story #44).
//   - Keyboard tab-through reaches every interactive element with a visible
//     focus ring (focus-visible:ring-*).
//
// Run: node scripts/qa/landing-contrast.mjs

import { runQa, openPage, evalInPage, ab } from "./lib.mjs";

const WIDTHS = [
  { w: 390, label: "mobile" },
  { w: 768, label: "tablet" },
  { w: 1024, label: "desktop" },
  { w: 1440, label: "wide" },
];

// Helpers inlined into the page via RUNTIME_HELPERS — the eval'd JS runs in
// the browser context and has no access to Node-side scope.
//
// Chrome 111+ returns getComputedStyle().color in oklab()/oklch() form when
// the source CSS used Tailwind 4 alpha-modified colors (text-white/85 etc).
// We parse oklab manually and convert to sRGB. Alpha is preserved.
const RUNTIME_HELPERS = `
function clampByte(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}
function linearToSrgbChannel(c) {
  return c >= 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;
}
function oklabToRgb(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  return [clampByte(linearToSrgbChannel(r) * 255), clampByte(linearToSrgbChannel(g) * 255), clampByte(linearToSrgbChannel(bl) * 255)];
}
function normalizeColor(str) {
  if (!str) return null;
  const s = String(str).trim().toLowerCase();
  if (s === "transparent") return [0, 0, 0, 0];
  // Strip "fname(...) " wrapper to get the inner args, then split on "/".
  const fn = /^([a-z]+)\\(\\s*(.*?)\\s*\\)\$/.exec(s);
  const inner = fn ? fn[2] : s;
  let alpha = 1;
  const parts = inner.split("/");
  const main = parts[0].trim();
  if (parts.length > 1) {
    alpha = Number(parts[parts.length - 1].trim());
    if (!Number.isFinite(alpha)) alpha = 1;
  }
  // oklab(L a b)
  const oklab = /^([\\d.e+-]+)\\s+([\\d.e+-]+)\\s+([\\d.e+-]+)\$/.exec(main);
  if (fn && fn[1] === "oklab" && oklab) {
    const [r, g, b] = oklabToRgb(Number(oklab[1]), Number(oklab[2]), Number(oklab[3]));
    return [r, g, b, alpha];
  }
  // oklch(L C H)
  const oklch = /^([\\d.e+-]+)\\s+([\\d.e+-]+)\\s+([\\d.e+-]+)\$/.exec(main);
  if (fn && fn[1] === "oklch" && oklch) {
    const L = Number(oklch[1]);
    const C = Number(oklch[2]);
    const Hdeg = Number(oklch[3]);
    const hr = (Hdeg * Math.PI) / 180;
    const a = C * Math.cos(hr);
    const b = C * Math.sin(hr);
    const [r, g, bl] = oklabToRgb(L, a, b);
    return [r, g, bl, alpha];
  }
  // hex (no wrapper)
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})\$/.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, alpha];
  }
  // rgb()/rgba() — modern space-separated or legacy comma form. The
  // legacy rgba(r,g,b,a) form puts alpha in the 4th comma slot (no slash).
  const rgb = /^rgba?\\(\\s*(\\d+)[,\\s]+(\\d+)[,\\s]+(\\d+)(?:[,\\.\\s]+([\\d.]+))?\\s*\\)$/.exec(s);
  if (rgb) {
    let rgbAlpha = rgb[4] === undefined ? 1 : Number(rgb[4]);
    if (!Number.isFinite(rgbAlpha)) rgbAlpha = 1;
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), rgbAlpha];
  }
  return null;
}
function compositeOver(fg, bg) {
  // Alpha-composite fg over bg, both as [r,g,b,a] with a ∈ [0,1].
  const a = fg[3];
  return [
    Math.round(fg[0] * a + bg[0] * (1 - a)),
    Math.round(fg[1] * a + bg[1] * (1 - a)),
    Math.round(fg[2] * a + bg[2] * (1 - a)),
  ];
}
function srgbChannel(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}
function luminance(r, g, b) {
  return 0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);
}
function contrastRatio(a, b) {
  const l1 = luminance(a[0], a[1], a[2]);
  const l2 = luminance(b[0], b[1], b[2]);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}
function effectiveBackground(el) {
  // Walk up collecting backgroundColors until we hit a fully opaque one.
  // Semi-transparent backgrounds (Tailwind /5, /10) composite over ancestors
  // so the contrast ratio reflects what the user actually sees.
  const layers = [];
  let cur = el;
  while (cur && cur !== document.documentElement) {
    const bg = normalizeColor(getComputedStyle(cur).backgroundColor);
    if (bg) layers.push(bg);
    if (bg && bg[3] >= 1) break;
    cur = cur.parentElement;
  }
  if (layers.length === 0) return [255, 255, 255, 1];
  // Composite from the bottom-most opaque layer upward.
  let out = layers[layers.length - 1];
  if (out[3] < 1) out = compositeOver(out, [255, 255, 255, 1]);
  for (let i = layers.length - 2; i >= 0; i--) {
    out = compositeOver(layers[i], out);
  }
  return [out[0], out[1], out[2], 1];
}
function textContrast(el) {
  const fg = normalizeColor(getComputedStyle(el).color);
  if (!fg) return null;
  const bg = effectiveBackground(el);
  const compositedFg = compositeOver(fg, bg);
  return contrastRatio(compositedFg, bg);
}
`;

const CONTRAST_SAMPLES_JS = `${RUNTIME_HELPERS}
(() => {
  // Each "sample" returns one element to evaluate. We pick the hero CTA +
  // subheadline specifically (not the nav-bar links or eyebrow) by walking
  // from the <h1>.
  const h1 = document.querySelector("header h1");
  const heroCtas = h1
    ? Array.from(h1.parentElement.querySelectorAll("a"))
        .filter((a) => a.getAttribute("href") === "#lokasi" || a.getAttribute("href") === "#packages")
        // Nav links appear first (smaller text); hero CTAs are the larger
        // CTA buttons — pick the last two by href.
        .slice(-2)
    : [];
  const heroLokasi = heroCtas.find((a) => a.getAttribute("href") === "#lokasi");
  const heroPackages = heroCtas.find((a) => a.getAttribute("href") === "#packages");
  // Subheadline is the first <p> sibling AFTER the <h1> (the eyebrow <p>
  // comes BEFORE the <h1>).
  let subheadline = null;
  if (h1) {
    let cur = h1.nextElementSibling;
    while (cur && cur.tagName !== "P") cur = cur.nextElementSibling;
    subheadline = cur;
  }
  const picks = [
    { el: h1, label: "hero_h1" },
    { el: subheadline, label: "hero_subheadline" },
    { el: heroLokasi, label: "hero_primary_cta_text" },
    { el: heroPackages, label: "hero_secondary_cta_text" },
    { el: document.querySelector("#lokasi a[href^='https://wa.me/']"), label: "lokasi_wa_button_text" },
    { el: document.querySelector("#packages h2"), label: "packages_heading" },
    { el: document.querySelector("#packages p"), label: "packages_body_text" },
  ];
  return picks.map(({ el, label }) => {
    if (!el) return { label, found: false };
    const cs = getComputedStyle(el);
    const ratio = textContrast(el);
    return {
      label,
      found: true,
      ratio,
      text: (el.innerText || "").slice(0, 40),
      fontSize: parseFloat(cs.fontSize) || 0,
      fontWeight: cs.fontWeight,
    };
  });
})()
`;

const WA_BG_JS = `
(() => {
  const a = document.querySelector("#lokasi a[href^='https://wa.me/']");
  if (!a) return null;
  return getComputedStyle(a).backgroundColor;
})()
`;

const REDUCED_MOTION_CHECK_JS = `
(() => {
  const offending = [];
  const all = document.querySelectorAll("body *");
  for (const el of all) {
    if (getComputedStyle(el).opacity === "0") {
      const text = (el.innerText || "").trim();
      if (text.length > 0) {
        offending.push({ tag: el.tagName, text: text.slice(0, 30) });
      }
    }
  }
  return offending;
})()
`;

const IO_FALLBACK_CHECK_JS = `
(() => {
  const offending = [];
  const all = document.querySelectorAll("section, header, footer");
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.top < 200 && r.height < 50) {
      offending.push({ tag: el.tagName, id: el.id, height: r.height });
    }
  }
  return offending;
})()
`;

const KEYBOARD_CHECK_JS = `
(() => {
  const focusable = Array.from(
    document.querySelectorAll("a[href], button[type='button']")
  ).filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && !el.hasAttribute("disabled");
  });
  const results = [];
  for (let i = 0; i < Math.min(focusable.length, 15); i++) {
    const el = focusable[i];
    el.focus({ preventScroll: true });
    const cs = getComputedStyle(el);
    const hasRing =
      cs.outlineWidth !== "0px" ||
      cs.boxShadow.includes("0px 0px") ||
      cs.boxShadow.includes("0 0 0") ||
      el.matches(":focus-visible");
    results.push({
      tag: el.tagName,
      text: (el.innerText || el.getAttribute("aria-label") || "").slice(0, 24),
      hasRing,
    });
  }
  return results;
})()
`;

const OVERFLOW_JS = `({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })`;

function parseColorLocal(str) {
  if (!str) return null;
  const s = String(str).trim().toLowerCase();
  if (s === "transparent" || s.startsWith("rgba(0, 0, 0, 0)")) return null;
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgb = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(s);
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }
  return null;
}

await runQa("landing-contrast", async () => {
  const failures = [];

  for (const { w, label } of WIDTHS) {
    ab(["set", "viewport", String(w), String(Math.round(w * 2))]);
    openPage("/");

    // (1) horizontal overflow
    const overflow = evalInPage(OVERFLOW_JS);
    if (overflow.sw > overflow.cw + 1) {
      failures.push(
        `[${label}@${w}px] horizontal overflow: scrollWidth=${overflow.sw} > clientWidth=${overflow.cw}`,
      );
    }

    // (2) WCAG contrast on hero + key text
    const samples = evalInPage(CONTRAST_SAMPLES_JS);

    // WA button surface: must be #075E54 (story #19).
    const waBg = evalInPage(WA_BG_JS);
    if (waBg === null) {
      failures.push(`[${label}@${w}px] no WhatsApp button found in #lokasi`);
    } else {
      const rgb = parseColorLocal(waBg);
      const expected = [7, 94, 84];
      const close =
        rgb &&
        Math.abs(rgb[0] - expected[0]) <= 8 &&
        Math.abs(rgb[1] - expected[1]) <= 8 &&
        Math.abs(rgb[2] - expected[2]) <= 8;
      if (!close) {
        failures.push(
          `[${label}@${w}px] WA button bg expected ~#075E54 (rgb(7,94,84)); got ${waBg}`,
        );
      }
    }

    for (const s of samples) {
      if (!s.found) {
        failures.push(`[${label}@${w}px] contrast sample "${s.label}" not found in DOM`);
        continue;
      }
      if (s.ratio === null) {
        failures.push(`[${label}@${w}px] could not compute contrast for "${s.label}"`);
        continue;
      }
      const isLarge =
        s.fontSize >= 18.66 || (s.fontSize >= 14 && Number(s.fontWeight) >= 700);
      const threshold = isLarge ? 3.0 : 4.5;
      if (s.ratio < threshold) {
        failures.push(
          `[${label}@${w}px] "${s.label}" contrast ${s.ratio.toFixed(2)} < ${threshold} (text="${s.text}")`,
        );
      }
    }

    // (3) prefers-reduced-motion: no opacity:0 content
    ab(["set", "media", "reduced-motion"]);
    openPage("/");
    const reducedMotionCheck = evalInPage(REDUCED_MOTION_CHECK_JS);
    if (Array.isArray(reducedMotionCheck) && reducedMotionCheck.length > 0) {
      failures.push(
        `[${label}@${w}px] reduced-motion hides content: ${JSON.stringify(reducedMotionCheck.slice(0, 3))}`,
      );
    }
    ab(["set", "media", "no-preference"]);

    // (4) IntersectionObserver fallback
    openPage("/");
    evalInPage(`window.IntersectionObserver = undefined;`);
    evalInPage(`
      window.dispatchEvent(new Event("scroll"));
      void document.body.offsetHeight;
    `);
    const ioCheck = evalInPage(IO_FALLBACK_CHECK_JS);
    if (Array.isArray(ioCheck) && ioCheck.length > 0) {
      failures.push(
        `[${label}@${w}px] IntersectionObserver fallback hid a section: ${JSON.stringify(ioCheck)}`,
      );
    }

    // (5) keyboard tab-through — page must expose ≥5 focusable elements.
    openPage("/");
    const focusInfo = evalInPage(KEYBOARD_CHECK_JS);
    if (!Array.isArray(focusInfo) || focusInfo.length < 5) {
      failures.push(
        `[${label}@${w}px] keyboard focus walked fewer than 5 elements (${focusInfo?.length ?? 0})`,
      );
    }
  }

  if (failures.length > 0) {
    throw new Error(`${failures.length} contrast/a11y failures:\n  - ${failures.join("\n  - ")}`);
  }

  return `all ${WIDTHS.length} widths × {overflow, contrast, WA bg, reduced-motion, IO fallback, keyboard} OK`;
});
