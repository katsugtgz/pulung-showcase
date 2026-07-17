// QA flow: WhatsApp link correctness per branch (CRITICAL business-logic check).
//
// This is the single most important E2E assertion in the harness: a wrong
// cluster admin number is a real business bug (leads routed to the wrong
// office). It is NOT covered by unit tests against the live DOM wiring.
//
// Prerequisites:
//   1. `pnpm dev` running (or a built app) at http://localhost:3000
//      (override with QA_BASE_URL).
//   2. Valid Clerk keys in .env.local (landing page must render).
//   3. `agent-browser` CLI installed.
//
// What it checks, for each of the 5 branch cards in #lokasi:
//   - The WhatsApp <a> href points at the correct cluster admin:
//       Cluster A (Gunung Anyar, Pandugo, Juanda) -> wa.me/6281100000001
//       Cluster B (Manyar, Pucang)                 -> wa.me/6281100000002
//   - The URL-encoded `text` param, when decoded, names the branch.
//   - The prefilled message interpolates the selected transmission: with no
//     toggle it reads "manual atau matic"; after tapping "Matic" it reads
//     "kursus mobil matic" (issue #16 — transmission + area in the deep link).
//
// The expected digits below are the authoritative oracle (sourced from
// contact.md, the business data source of truth). The exact message wording is
// unit-tested in src/lib/wa-router; this E2E test validates only the DOM
// wiring (right button -> right number, branch name + transmission in message).
//
// Run: node scripts/qa/wa-link-correctness.mjs

import { runQa, openPage, evalInPage, assert } from "./lib.mjs";

const CLUSTER_A = "6281100000001"; // +62 811-0000-0001  (MERR / Surabaya Selatan)
const CLUSTER_B = "6281100000002"; // +62 811-0000-0002 (Manyar / Surabaya Pusat)

// Branch name (as rendered in the card's <h4>) -> expected wa.me digits.
const EXPECTED = {
  "Gunung Anyar": CLUSTER_A,
  Pandugo: CLUSTER_A,
  Juanda: CLUSTER_A,
  Manyar: CLUSTER_B,
  Pucang: CLUSTER_B,
};

// Read every branch WhatsApp link in #lokasi. Selected by wa.me href prefix
// (not button label) so it stays correct as CTA microcopy changes (#16).
const READ_BUTTONS = `
  Array.from(document.querySelectorAll('#lokasi a[href^="https://wa.me/"]'))
    .map((a) => {
      const article = a.closest("article");
      const name = (article && article.querySelector("h4")?.innerText || "").trim();
      return { href: a.getAttribute("href"), branchName: name };
    });
`;

await runQa("wa-link-correctness", async () => {
  openPage("/");

  const buttons = evalInPage(READ_BUTTONS);

  assert(
    Array.isArray(buttons),
    "eval did not return an array of WhatsApp buttons",
  );
  assert(
    buttons.length === 5,
    `expected 5 WhatsApp buttons (one per branch), found ${buttons.length}`,
  );

  for (const b of buttons) {
    assert(b.branchName, "a WhatsApp button has no associated branch name (<h4>)");
    const expectedDigits = EXPECTED[b.branchName];
    assert(
      expectedDigits,
      `branch "${b.branchName}" is not in the EXPECTED oracle — add it`,
    );
    assert(b.href, `branch "${b.branchName}" WhatsApp link has no href`);

    // href form: https://wa.me/<digits>?text=<urlencoded message>
    assert(
      b.href.startsWith(`https://wa.me/${expectedDigits}`),
      `branch "${b.branchName}" -> expected wa.me/${expectedDigits}, got ${b.href}`,
    );

    const decoded = decodeURIComponent(new URL(b.href).searchParams.get("text") ?? "");
    assert(
      decoded.includes(b.branchName),
      `branch "${b.branchName}" prefilled message does not mention the branch name: "${decoded}"`,
    );
    // With no transmission selected the message defaults to "manual atau matic".
    assert(
      decoded.includes("manual atau matic"),
      `branch "${b.branchName}" default message should say "manual atau matic": "${decoded}"`,
    );
  }

  // Tap the "Matic" transmission toggle, then confirm the deep link now
  // interpolates that transmission into the prefilled text.
  const clicked = evalInPage(`
    (() => {
      const group = document.querySelector('[role="group"][aria-label="Pilih jenis transmisi"]');
      if (!group) return false;
      const btn = Array.from(group.querySelectorAll("button"))
        .find((el) => (el.textContent || "").trim() === "Matic");
      if (!btn) return false;
      btn.click();
      return true;
    })();
  `);
  assert(clicked, 'could not find/click the "Matic" transmission toggle');

  const afterMatic = evalInPage(READ_BUTTONS);
  assert(
    Array.isArray(afterMatic) && afterMatic.length === 5,
    "re-read after selecting Matic did not return 5 buttons",
  );
  for (const b of afterMatic) {
    const decoded = decodeURIComponent(new URL(b.href).searchParams.get("text") ?? "");
    assert(
      decoded.includes("kursus mobil matic"),
      `branch "${b.branchName}" message should interpolate "matic" after toggle: "${decoded}"`,
    );
    // Routing must be unaffected by the transmission selection.
    assert(
      b.href.startsWith(`https://wa.me/${EXPECTED[b.branchName]}`),
      `branch "${b.branchName}" routing changed after toggle: ${b.href}`,
    );
  }

  const a = buttons.filter((b) => b.href.includes(CLUSTER_A)).length;
  const bCount = buttons.filter((b) => b.href.includes(CLUSTER_B)).length;
  return `5 branches OK — ${a} -> Cluster A, ${bCount} -> Cluster B; transmission interpolation verified`;
});
