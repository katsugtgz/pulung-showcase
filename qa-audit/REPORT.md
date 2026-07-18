# QA Audit — branch `feat/45-landing-desktop-layout`

Commit `ba8bbf6` (feat(landing): layout desktop md/lg/xl sesuai spec #41)
Tools: `agent-browser` (CDP, no Playwright) + `describe_uri` vision + DOM `eval` ground-truth.

## TL;DR — PASS

Responsive layout, containers, WA routing, images, copy all correct and
spec-compliant. **One environment issue found + fixed** (stale dev server);
no code defects.

## ⚠️ Environment issue (not code)

The `next dev` server I inherited (PID 86728) started **06:09**; the audited
commit landed **12:33**. It served pre-commit HTML: live DOM contained zero
`md:`/`lg:` classes (not even `grid-cols-1` that source has), so every grid
rendered single-column at all widths. **Restarted the dev server** (fresh
Turbopack, PID 13138) → all responsive classes applied correctly.

Lesson: before trusting visual output, assert with DOM `eval`
(grid-template-columns), not just screenshots.

## Responsive layout — VERIFIED via computed style (objective)

| Section (class)                       | 390 | 768 (md) | 1024 (lg) | 1440 (xl) |
|---------------------------------------|-----|----------|-----------|-----------|
| Packages  `md:grid-cols-2 lg:grid-cols-3` | 1 | 2 | 3 | 3 |
| Testimonials `md:2 lg:3`              | 1 | 2 | 3 | 3 |
| Social cards `md:grid-cols-2`         | 1 | 2 | 2 | 2 |
| Location picker `lg:grid-cols-2`      | 1 | 1 | 2 | 2 |
| Footer `lg:grid-cols-2`               | 1 | 1 | 2 | 2 |
| Header nav `hidden ... lg:flex`       | — | — | visible | visible |

- **max-w-7xl cap @1440**: grids = **1280px** wide ✓ (not full-bleed 1425px).
- Hero = 2-col split at lg: left text, right **text chips** ("Sejak 2000" /
  "Instruktur berpengalaman" / "Jangkauan...") — matches commit intent
  ("chips ke kolom kanan").

## WhatsApp cluster routing — VERIFIED correct (no cross-routing bug)

All `wa.me` hrefs audited via DOM:

| Cluster | Number | Routes to |
|---------|--------|-----------|
| A | `6281100000001` | Gunung Anyar, Pandugo, Juanda ✓ |
| B | `6281100000002` | Manyar, Pucang ✓ |

Matches AGENTS.md spec exactly. Pre-filled `text=` param carries correct
cluster label + area name.

## Visual / asset checks — VERIFIED via eval (vision claims falsified)

`describe_uri` flagged: "black circle N placeholder", "clipped KORLANTAS
text", "hero right empty". DOM `eval` disproved all:

- `brokenImgs: []` at every breakpoint (all `<img>` complete, naturalWidth>0).
- `scrollWidth ≤ innerWidth` everywhere → **no horizontal overflow**.
- Credibility `<ul>` `scrollW===clientW` (overflow 0) → no clip.
- heroRightCol: `hasImg:false`, `bg:none`, text chips → intentional, not empty.

Brand color: blue `#1E6FB8` present, **no purple `#5e4399`** (no regression).
Indonesian copy complete, not truncated (H1 "PULUNG", "KURSUS MENGEMUDI",
hero sub copy, section headings all present).

## Evidence
`mobile-390.png`, `md-768.png`, `lg-1024.png`, `xl-1440.png`, `xl-annotated.png`.

## Note
Vision model (`describe_uri`) was unreliable for precise layout claims
(reported md single-column despite proven 2-col; hallucinated placeholder
images). Used objective DOM/computed-style `eval` as source of truth;
vision only for gross signal (overflow / color), then verified.
