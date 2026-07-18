// QA flow: landing page renders correctly (refreshed for issue #50).
//
// Prerequisites:
//   1. `pnpm dev` running (or a built app) at http://localhost:3000
//      (override with QA_BASE_URL).
//   2. Valid Clerk keys in .env.local — the proxy/middleware runs on public
//      routes too; without real keys the landing page 500s.
//   3. `agent-browser` CLI installed: `npm i -g agent-browser && agent-browser install`
//
// Asserts (issue #50 stories #2, #6, #7, #13, #29):
//   - The PULUNG wordmark is present (in the brand lockup, NOT the H1).
//   - The semantic <h1> is the active PAS variant headline (benefit-led),
//     NOT the brand name — regression guard.
//   - The hero renders exactly two CTAs with distinct hrefs:
//       primary   -> #lokasi    (story #7)
//       secondary -> #packages  (story #7)
//   - Both anchor destinations exist as section ids on the page.
//   - The credibility strip, #packages section, #lokasi location picker,
//     <footer>, and the mobile sticky CTA are all present.
//
// Run: node scripts/qa/landing-render.mjs

import { runQa, openPage, evalInPage, assert } from "./lib.mjs";

await runQa("landing-render", async () => {
  openPage("/");

  const data = evalInPage(`({
    title: document.title,
    bodyHasPulung: document.body.innerText.includes("PULUNG"),
    heroH1: (document.querySelector("header h1, h1")?.innerText || "").trim(),
    hasWordmark: /PULUNG/.test(document.querySelector("header")?.innerText || ""),
    heroAnchors: Array.from(document.querySelectorAll("header a")).map((a) => ({
      text: (a.innerText || "").trim(),
      href: a.getAttribute("href") || "",
    })),
    hasCredibilityStrip: !!document.querySelector('[aria-label="Kredibilitas"]'),
    hasPackages: !!document.querySelector("#packages"),
    hasLokasi: !!document.querySelector("#lokasi"),
    hasFooter: !!document.querySelector("footer"),
    hasStickyCta: !!document.querySelector('a[href="#lokasi"][class*="lg:hidden"]'),
    lokasiHeading: (document.querySelector("#lokasi h2")?.innerText || "").trim(),
  })`);

  assert(data.bodyHasPulung, "landing page body does not contain 'PULUNG'");
  assert(data.hasWordmark, "hero is missing the PULUNG wordmark in its lockup");

  // Story #2: H1 is the benefit-led PAS variant, NOT the brand name. The old
  // `heroH1 === "PULUNG"` assertion is now wrong by design (ADR-004 + spec).
  assert(
    data.heroH1.length > 0 && data.heroH1 !== "PULUNG",
    `hero <h1> should be a benefit-led PAS variant (not "PULUNG"); got "${data.heroH1}"`,
  );

  // Story #7: dual hero CTAs to distinct destinations. Scope to <header>'s
  // CTA group (the last two anchors — the primary + secondary CTAs). The
  // sticky nav bar also links to #lokasi / #packages, so we filter the hero
  // anchors to the ones whose text matches the CTA copy from @/lib/copy
  // ("Tanya Jadwal via WhatsApp" / "Lihat Paket").
  const heroCtas = data.heroAnchors.filter(
    (a) =>
      /Tanya.*WhatsApp|Lihat Paket/i.test(a.text) &&
      (a.href === "#lokasi" || a.href === "#packages"),
  );
  assert(
    heroCtas.length === 2,
    `expected exactly 2 hero CTAs (primary + secondary), found ${heroCtas.length}: ${JSON.stringify(heroCtas)}`,
  );
  const lokasiCta = heroCtas.find((a) => a.href === "#lokasi");
  const packagesCta = heroCtas.find((a) => a.href === "#packages");
  assert(lokasiCta, "hero is missing the primary CTA to #lokasi (story #7)");
  assert(packagesCta, "hero is missing the secondary CTA to #packages (story #7)");
  assert(
    lokasiCta.text !== packagesCta.text,
    `hero CTA labels collide: both are "${lokasiCta.text}"`,
  );
  assert(
    lokasiCta.href !== packagesCta.href,
    `hero CTA hrefs collide: both are ${lokasiCta.href}`,
  );

  // Both anchor destinations must exist as section ids on the page.
  assert(data.hasPackages, "#packages anchor destination is missing");
  assert(data.hasLokasi, "#lokasi anchor destination is missing");

  assert(data.hasCredibilityStrip, "credibility strip ([aria-label='Kredibilitas']) is missing");
  assert(data.hasFooter, "<footer> is missing from the landing page");
  assert(data.hasStickyCta, "mobile sticky CTA (a.lg:hidden[href='#lokasi']) is missing");

  return `hero h1="${data.heroH1.slice(0, 40)}..." | CTAs #lokasi+"${lokasiCta.text}" + #packages+"${packagesCta.text}" | credibility+footer+stickyCta present`;
});
