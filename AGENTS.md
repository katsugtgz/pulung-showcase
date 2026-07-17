# Pulung — agent notes

Demo prototype for Kursus Mengemudi Pulung (driving school, Surabaya, est. 2000). Mobile-first Next.js landing page + Clerk auth + course catalog. Full context: PRD issue in this repo, `contact.md` (business data source of truth), `stitch/` (mobile designs).

## ⚠️ GitHub Actions is EXPECTED to fail — do not panic, do not "fix" it

The GitHub account has a billing issue, so every Actions run fails regardless of code quality. This is known and accepted. **Ignore red CI on GitHub.** Do not debug workflow files because of it, do not retry runs, do not report it as a problem.

Instead, run the quality gates **locally** — these are the real gates:

```bash
pnpm build                          # must succeed
npx react-doctor@latest --json      # score must be 100, below = reject the change
npx @lhci/cli@latest collect && npx @lhci/cli@latest assert  # no Lighthouse category below 0.9 (headless Chrome via CDP). NOTE: use @lhci/cli — bare `npx lhci` resolves to an unrelated typosquat. Not a local dep (blocked by the pnpm trust policy), so run via npx.
pnpm test                           # Vitest unit tests must pass
```

## Hard rules

- All deps pinned to latest stable/LTS (verified 2026-07-17): Node 24 LTS, Next 16.2.10, React 19.2.7, Tailwind 4.3.3 (CSS-first `@theme` — no tailwind.config.js), @clerk/nextjs 7.5.20, pnpm 11, TS 5.9.3. Note: TS is intentionally pinned to the latest *classic* (5.9.3), NOT 7.x — TS 7.x is the native Go rewrite and is incompatible with Next 16's classic-API build type-checker (see DECISIONS.md ADR-001). Do not bump TS past 5.x without checking Next's type-check path.
- QA/browser automation: `agent-browser` CLI only. **Playwright is forbidden.**
- Placeholder images: generate with the `agy` CLI.
- Brand palette: primary blue ~#1E6FB8, accent red #D22B3A (from Pulung's real street-banner identity), neutrals white/gray. Never reintroduce the old stitch purple #5e4399.
- All user-facing strings in Indonesian.
- Vision/image work (screenshots, photos, diagrams, PDFs, design references, visual QA): ALWAYS use the `/vision-9router` skill. This project's orchestrator is a vision-blind GLM model — it cannot natively see images. The skill routes images to `gemini-2.5-flash` via the 9router gateway through `vision-describe.sh` and returns ground-truth descriptions. Never fabricate visual content; never reconstruct the base64 pipeline inline. Prerequisites: `NINEROUTER_URL` (and `NINEROUTER_KEY` if auth enabled) must be exported in the shell — verify with `curl $NINEROUTER_URL/api/health` → `{"ok":true}`.
- Business data lives only in the typed `catalog-data` module — never hardcode branch numbers/prices in UI. WhatsApp routing: Cluster A (MERR/South) +62 811-0000-0001, Cluster B (Manyar/Central) +62 811-0000-0002 — wrong routing is a real business bug.
