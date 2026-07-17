# Pulung QA Harness (agent-browser)

End-to-end browser checks for the Pulung driving-school demo. Uses the
[`agent-browser`](https://github.com/...) CLI only — **no Playwright**.

## Prerequisites

1. **App running locally**

   ```sh
   pnpm dev   # serves http://localhost:3000
   ```

   A production build (`pnpm build && pnpm start`) works too. Override the
   target with `QA_BASE_URL`, e.g. `QA_BASE_URL=http://localhost:3001`.

2. **Clerk keys** — copy `.env.example` to `.env.local` and fill in real keys
   from your Clerk dashboard. The proxy/middleware runs on public routes, so
   without valid keys even the landing page 500s. All flows except
   `catalog-to-payment` need only a valid publishable + secret key (no account).

3. **agent-browser CLI**

   ```sh
   npm i -g agent-browser && agent-browser install
   ```

## Scripts

| Script | Flow | Needs Clerk account? |
| --- | --- | --- |
| `landing-render.mjs` | Landing page renders: hero `PULUNG`, `#packages`, `#lokasi`, footer | No |
| `wa-link-correctness.mjs` | Each of the 5 branch WhatsApp buttons routes to the correct cluster admin number, and the prefilled message names the branch (**critical business logic**) | No |
| `auth-flow.mjs` | Unauthenticated visit to `/catalog` redirects to `/sign-in` | No |
| `catalog-to-payment.mjs` | Sign in → `/catalog` → course detail → mock QRIS payment screen with a visible QR | **Yes** (`QA_CLERK_EMAIL`, `QA_CLERK_PASSWORD`) |

`lib.mjs` holds shared helpers (`ab`, `evalInPage`, `runQa`, `assert`); it is
not a flow.

## Running

```sh
# one flow
node scripts/qa/landing-render.mjs

# the signed-in flow (skips with a notice if credentials are absent)
QA_CLERK_EMAIL=me@example.com QA_CLERK_PASSWORD=secret \
  node scripts/qa/catalog-to-payment.mjs
```

Each script prints `[QA] PASS:` or `[QA] FAIL:` and exits `0` on pass, `1` on
fail (or `0` with a `SKIP:` notice for the credential-gated flow when creds are
missing).

### The WhatsApp routing oracle

`wa-link-correctness.mjs` is the single most important check: routing a lead to
the wrong cluster admin is a real business bug. The expected numbers (sourced
from `contact.md`) are:

- **Cluster A** — Gunung Anyar, Pandugo, Juanda → `wa.me/6285100870957`
- **Cluster B** — Manyar, Pucang → `wa.me/6281232531989`

The exact prefilled-message wording is unit-tested in
`src/lib/wa-router/__tests__`; this E2E check validates only the DOM wiring
(right button → right number, branch name present in the decoded message).
