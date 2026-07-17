// QA flow: landing page renders correctly.
//
// Prerequisites:
//   1. `pnpm dev` running (or a built app) at http://localhost:3000
//      (override with QA_BASE_URL).
//   2. Valid Clerk keys in .env.local — the proxy/middleware runs on public
//      routes too; without real keys the landing page 500s.
//   3. `agent-browser` CLI installed: `npm i -g agent-browser && agent-browser install`
//
// Asserts the hero "PULUNG" wordmark, the #packages section, the #lokasi
// location picker, and the <footer> are all present on the public landing page.
//
// Run: node scripts/qa/landing-render.mjs

import { runQa, openPage, evalInPage, assert } from "./lib.mjs";

await runQa("landing-render", async () => {
  openPage("/");

  const data = evalInPage(`({
    title: document.title,
    bodyHasPulung: document.body.innerText.includes("PULUNG"),
    heroH1: (document.querySelector("h1")?.innerText || "").trim(),
    hasPackages: !!document.querySelector("#packages"),
    hasLokasi: !!document.querySelector("#lokasi"),
    hasFooter: !!document.querySelector("footer"),
    lokasiHeading: (document.querySelector("#lokasi h2")?.innerText || "").trim(),
  })`);

  assert(data.bodyHasPulung, "landing page body does not contain 'PULUNG'");
  assert(
    data.heroH1 === "PULUNG",
    `hero <h1> expected "PULUNG", got "${data.heroH1}"`,
  );
  assert(data.hasPackages, "#packages section is missing from the landing page");
  assert(data.hasLokasi, "#lokasi location picker is missing from the landing page");
  assert(data.hasFooter, "<footer> is missing from the landing page");

  return `hero ok, #packages + #lokasi (${JSON.stringify(data.lokasiHeading)}) + footer present`;
});
