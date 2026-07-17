# Architecture Decision Records — Pulung

## ADR-001: TypeScript 5.9.3 over 7.0.2

**Date:** 2026-07-17
**Status:** Accepted (lead-approved deviation from AGENTS.md original pin)

**Context:**
AGENTS.md originally pinned TypeScript 7.0.2 (npm `latest` dist-tag). TS 7.x is
the native Go rewrite ("tsgo"). Its package `exports` map points the main entry
(`.`) to `./lib/version.cjs`, which exports only `version`. The classic compiler
API (`createProgram`, `createIncrementalProgram`, `readConfigFile`,
`parseJsonConfigFileContent`, `ModuleKind`) is not exposed from the main entry.

Next.js 16.2.10's build type-checker
(`node_modules/next/dist/lib/typescript/runTypeCheck.js`) is classic-API only —
it calls `typescript.createProgram(...)` / `createIncrementalProgram(...)` and
helpers that depend on `ts.readConfigFile`. There is no native/CLI type-check
branch in this installed version. With TS 7.0.2, `next build` compiles
successfully but then crashes during `Running TypeScript ...` with:

```
The "id" argument must be of type string. Received undefined
Next.js build worker exited with code: 1
```

The `@typescript/native-preview` early-return path in
`verify-typescript-setup.js` only triggers when the `typescript` package is
*missing*; since 7.0.2 is installed, Next loads it and hits the classic API,
which is undefined.

**Decision:**
Pin `typescript@5.9.3` (latest classic-stable). This restores the classic
compiler API Next 16.x requires and preserves build-time strict type
enforcement — a load-bearing part of the project's quality model
("NO `as any`, NO `@ts-ignore`, NO `@ts-expect-error`").

**Alternatives rejected:**
- **TS 7.0.2 + `typescript.ignoreBuildErrors: true`**: makes the build pass but
  disables build-time type-checking, turning the "TypeScript strict mode" gate
  cosmetic.
- **TS 6.0.0-beta**: has the classic API but is a beta — unsuitable for a
  client demo.

**Consequence:**
Deviates from the AGENTS.md original "TS 7.0.2" pin. AGENTS.md will be updated
to reflect 5.9.3 so future agents don't re-hit this wall. 5.9.3 has every TS
feature used by this codebase.
