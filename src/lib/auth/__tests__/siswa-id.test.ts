import { afterEach, describe, expect, it } from "vitest";
import { getMySiswaId } from "../siswa-id";

// @types/node 26 types process.env.NODE_ENV as readonly; cast the env bag to
// a mutable record so tests can flip it without resorting to `as any`.
const env = process.env as Record<string, string | undefined>;
const ORIGINAL_NODE_ENV = env.NODE_ENV;

afterEach(() => {
  env.NODE_ENV = ORIGINAL_NODE_ENV;
});

describe("getMySiswaId", () => {
  it("returns the legacy demo siswa id in development", () => {
    env.NODE_ENV = "development";
    expect(getMySiswaId("user_abc")).toBe("siswa-001");
  });

  it("returns the legacy demo siswa id in test (default vitest env)", () => {
    env.NODE_ENV = "test";
    expect(getMySiswaId("user_abc")).toBe("siswa-001");
  });

  it("returns a deterministic clerk-derived siswa id in production", () => {
    env.NODE_ENV = "production";
    expect(getMySiswaId("user_abc")).toBe("siswa-clerk-user_abc");
  });

  it("is stable across repeated calls for the same userId in production", () => {
    env.NODE_ENV = "production";
    expect(getMySiswaId("user_xyz")).toBe(getMySiswaId("user_xyz"));
  });

  it("different userIds map to different siswa ids in production", () => {
    env.NODE_ENV = "production";
    expect(getMySiswaId("user_a")).not.toBe(getMySiswaId("user_b"));
  });

  it("handles null userId in production without throwing", () => {
    env.NODE_ENV = "production";
    expect(getMySiswaId(null)).toBe("siswa-clerk-anonymous");
  });
});
