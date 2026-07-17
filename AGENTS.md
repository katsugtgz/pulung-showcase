# Pulung — agent notes

Demo prototype for Kursus Mengemudi Pulung (driving school, Surabaya, est. 2000). Mobile-first Next.js landing page + Clerk auth + course catalog. Full context: PRD issue in this repo, `contact.md` (business data source of truth), `stitch/` (mobile designs).

## ⚠️ GitHub Actions is EXPECTED to fail — do not panic, do not "fix" it

The GitHub account has a billing issue, so every Actions run fails regardless of code quality. This is known and accepted. **Ignore red CI on GitHub.** Do not debug workflow files because of it, do not retry runs, do not report it as a problem.

Instead, run the quality gates **locally** — these are the real gates:

```bash
pnpm build                          # must succeed
npx react-doctor@latest --json      # score must be 100, below = reject the change
npx lhci collect && npx lhci assert # no Lighthouse category below 0.9 (headless Chrome via CDP)
pnpm test                           # Vitest unit tests must pass
```

## Hard rules

- All deps pinned to latest stable/LTS (verified 2026-07-17): Node 24 LTS, Next 16.2.10, React 19.2.7, Tailwind 4.3.3 (CSS-first `@theme` — no tailwind.config.js), @clerk/nextjs 7.5.20, pnpm 11, TS 7.0.2. Do not downgrade silently; if TS 7 breaks the toolchain, stop and report.
- QA/browser automation: `agent-browser` CLI only. **Playwright is forbidden.**
- Placeholder images: generate with the `agy` CLI.
- Brand palette: primary blue ~#1E6FB8, accent red #D22B3A (from Pulung's real street-banner identity), neutrals white/gray. Never reintroduce the old stitch purple #5e4399.
- All user-facing strings in Indonesian.
- Business data lives only in the typed `catalog-data` module — never hardcode branch numbers/prices in UI. WhatsApp routing: Cluster A (MERR/South) +62 851-0087-0957, Cluster B (Manyar/Central) +62 812-3253-1989 — wrong routing is a real business bug.
