// Shared helpers for the Pulung agent-browser QA harness.
//
// Requires the `agent-browser` CLI on PATH (install: `npm i -g agent-browser &&
// agent-browser install`). Each QA flow script imports from this module and is
// runnable standalone with `node scripts/qa/<flow>.mjs`.

import { spawnSync } from "node:child_process";

/** Base URL of the running Pulung app. Override with QA_BASE_URL. */
export const BASE_URL = process.env.QA_BASE_URL ?? "http://localhost:3000";

const AB = "agent-browser";
const MAX_BUFFER = 20 * 1024 * 1024;

/**
 * Run an agent-browser command.
 * @returns {SpawnSyncReturns<string>} the full spawn result (status, stdout, stderr).
 * @throws if the command exits non-zero (unless opts.ignoreExit).
 */
export function ab(args, { ignoreExit = false } = {}) {
  const res = spawnSync(AB, args, { encoding: "utf8", maxBuffer: MAX_BUFFER });
  if (!ignoreExit && res.status !== 0) {
    const detail = (res.stderr || res.stdout || "").trim();
    throw new Error(`agent-browser ${args.join(" ")} exited ${res.status}: ${detail}`);
  }
  return res;
}

/** Run an agent-browser command and return trimmed stdout. */
export function abOut(args) {
  return ab(args).stdout.trim();
}

/**
 * Evaluate JavaScript in the active browser page and return the resulting
 * value (parsed from JSON). Pass an expression (wrap object literals in parens).
 * Uses `eval --stdin --json` so complex values round-trip without shell
 * escaping problems.
 */
export function evalInPage(js) {
  const res = spawnSync(AB, ["eval", "--stdin", "--json"], {
    encoding: "utf8",
    input: js,
    maxBuffer: MAX_BUFFER,
  });
  if (res.status !== 0) {
    throw new Error(
      `agent-browser eval failed (${res.status}): ${(res.stderr || res.stdout).trim()}`,
    );
  }
  const out = res.stdout.trim();
  if (!out) return undefined;
  let parsed;
  try {
    parsed = JSON.parse(out);
  } catch {
    return out;
  }
  // agent-browser wraps eval results as { success, data: { result, ... }, error }.
  // Unwrap to the inner result; surface a wrapped error if the call failed.
  if (
    parsed &&
    typeof parsed === "object" &&
    parsed.data &&
    typeof parsed.data === "object" &&
    "result" in parsed.data
  ) {
    if (parsed.error) {
      throw new Error(`agent-browser eval error: ${parsed.error}`);
    }
    return parsed.data.result;
  }
  return parsed;
}

/** Navigate the browser to a URL (accepts a full URL or a path relative to BASE_URL). */
export function openPage(pathOrUrl) {
  const url = /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${BASE_URL}${pathOrUrl}`;
  ab(["open", url]);
  ab(["wait", "--load", "networkidle"]);
}

/** Close every browser session opened by agent-browser. Safe to call anytime. */
export function closeBrowser() {
  ab(["close", "--all"], { ignoreExit: true });
}

/** Throw with a clear ASSERTION FAILED prefix if condition is falsy. */
export function assert(condition, message) {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
}

/**
 * Run a QA flow under a standard lifecycle: log start, run fn, log PASS/FAIL,
 * always close the browser, and exit with 0 (pass) or 1 (fail).
 *
 * @param {string} name - human-readable flow name
 * @param {() => (string|undefined|Promise<string|undefined>)} fn - flow body; may return a detail string
 */
export async function runQa(name, fn) {
  console.log(`\n[QA] ${name} — start`);
  let exitCode = 0;
  try {
    const detail = await fn();
    console.log(`[QA] PASS: ${name}${detail ? ` — ${detail}` : ""}`);
  } catch (err) {
    exitCode = 1;
    console.error(`[QA] FAIL: ${name}`);
    console.error(`  ${err && err.message ? err.message : String(err)}`);
    if (err && err.stack) {
      console.error(err.stack.split("\n").slice(1, 4).join("\n"));
    }
  } finally {
    closeBrowser();
  }
  process.exit(exitCode);
}
