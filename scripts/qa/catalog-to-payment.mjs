// QA flow: signed-in catalog -> course detail -> mock QRIS payment end-to-end.
//
// Prerequisites (ALL required — this flow cannot run without real credentials):
//   1. `pnpm dev` running (or a built app) at http://localhost:3000
//      (override with QA_BASE_URL).
//   2. Valid Clerk keys in .env.local AND a test account.
//   3. Test credentials in the environment:
//        QA_CLERK_EMAIL=<test account email>
//        QA_CLERK_PASSWORD=<test account password>
//      Without both, this script prints a SKIP notice and exits 0 (acceptable
//      per the T11 spec — live execution requires real credentials).
//   4. `agent-browser` CLI installed.
//
// Asserts: signing in, then navigating /catalog -> click a package "Daftar" ->
// /catalog/[packageId] -> "Daftar Sekarang" -> /catalog/[packageId]/payment,
// and a QR code image is visible on the mock payment screen.
//
// Run: node scripts/qa/catalog-to-payment.mjs

import { runQa, openPage, evalInPage, ab, assert } from "./lib.mjs";

const { QA_CLERK_EMAIL, QA_CLERK_PASSWORD } = process.env;

await runQa("catalog-to-payment", async () => {
  if (!QA_CLERK_EMAIL || !QA_CLERK_PASSWORD) {
    console.log(
      "[QA] SKIP: set QA_CLERK_EMAIL and QA_CLERK_PASSWORD to run the signed-in payment flow.",
    );
    return "skipped (no test credentials)";
  }

  // --- 1. Sign in via the Clerk form -------------------------------------
  openPage("/sign-in");
  // Clerk v7 email/password first factor uses name="identifier" + name="password".
  ab(["wait", 'input[name="identifier"], input[type="email"]']);
  ab([
    "fill",
    'input[name="identifier"], input[type="email"]',
    QA_CLERK_EMAIL,
  ]);
  ab(["press", "Enter"]);
  ab(["wait", 'input[name="password"], input[type="password"]']);
  ab(["fill", 'input[name="password"], input[type="password"]', QA_CLERK_PASSWORD]);
  ab(["press", "Enter"]);
  // Signed-in users leave /sign-in for the app.
  ab(["wait", "--load", "networkidle"]);

  const signedIn = evalInPage(
    `!window.location.pathname.startsWith("/sign-in")`,
  );
  assert(
    signedIn,
    "did not leave /sign-in after submitting credentials (check QA_CLERK_* values)",
  );

  // --- 2. Catalog -> pick the first package ------------------------------
  openPage("/catalog");
  ab(["wait", "--text", "Daftar"]);
  const firstPackageLink = evalInPage(`
    const a = Array.from(document.querySelectorAll('a'))
      .find((x) => /\\/catalog\\/[^/]+$/i.test(x.getAttribute("href") || ""));
    a ? a.getAttribute("href") : null;
  `);
  assert(
    typeof firstPackageLink === "string" && firstPackageLink.startsWith("/catalog/"),
    `could not find a package detail link on /catalog (got ${firstPackageLink})`,
  );
  openPage(firstPackageLink);

  // --- 3. Course detail -> "Daftar Sekarang" -> payment ------------------
  ab(["wait", "--text", "Daftar Sekarang"]);
  const payLink = evalInPage(`
    const a = Array.from(document.querySelectorAll('a'))
      .find((x) => /payment$/i.test(x.getAttribute("href") || ""));
    a ? a.getAttribute("href") : null;
  `);
  assert(
    typeof payLink === "string" && payLink.endsWith("/payment"),
    `course detail has no payment link (got ${payLink})`,
  );
  openPage(payLink);

  // --- 4. Mock QRIS payment screen: QR image present --------------------
  ab(["wait", "--load", "networkidle"]);
  const payment = evalInPage(`({
    url: location.href,
    qrImg:
      !!document.querySelector('img[src*="qris"]') ||
      !!document.querySelector('img[alt*="QRIS" i]') ||
      !!document.querySelector("main img"),
    bodySnippet: (document.body.innerText || "").slice(0, 160),
  })`);

  assert(
    payment.url.includes("/payment"),
    `expected to land on the payment route, got ${payment.url}`,
  );
  assert(
    payment.qrImg,
    `no QR image found on the mock payment screen at ${payment.url}`,
  );

  return `signed in -> catalog -> detail -> payment (${payment.url}) with QR visible`;
});
