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
//   - The "Hubungi via WhatsApp" <a> href points at the correct cluster admin:
//       Cluster A (Gunung Anyar, Pandugo, Juanda) -> wa.me/6281100000001
//       Cluster B (Manyar, Pucang)                 -> wa.me/6281100000002
//   - The URL-encoded `text` param, when decoded, names the branch.
//
// The expected digits below are the authoritative oracle (sourced from
// contact.md, the business data source of truth). The exact message wording is
// unit-tested in src/lib/wa-router; this E2E test validates only the DOM
// wiring (right button -> right number, branch name present in the message).
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

await runQa("wa-link-correctness", async () => {
  openPage("/");

  // Each branch card is <article> with an <h4>{branch name}</h4> and a green
  // WhatsApp <a> built from buildWhatsAppLink({ branchId }).
  const buttons = evalInPage(`
    Array.from(document.querySelectorAll("#lokasi a"))
      .filter((a) => /Hubungi via WhatsApp/i.test(a.innerText || ""))
      .map((a) => {
        const article = a.closest("article");
        const name = (article && article.querySelector("h4")?.innerText || "").trim();
        return { href: a.getAttribute("href"), branchName: name };
      });
  `);

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

    const url = new URL(b.href);
    const text = url.searchParams.get("text") ?? "";
    const decoded = decodeURIComponent(text);
    assert(
      decoded.includes(b.branchName),
      `branch "${b.branchName}" prefilled message does not mention the branch name: "${decoded}"`,
    );
  }

  const a = buttons.filter((b) => b.href.includes(CLUSTER_A)).length;
  const bCount = buttons.filter((b) => b.href.includes(CLUSTER_B)).length;
  return `${buttons.length} branches OK — ${a} -> Cluster A, ${bCount} -> Cluster B`;
});
