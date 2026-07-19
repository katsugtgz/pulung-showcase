import { describe, it, expect } from "vitest";
import { getStickers, getSticker } from "../index";
import fs from "fs";
import path from "path";

describe("illustrations module data integrity", () => {
  it("should return all 14 stickers as a new array copy", () => {
    const stickers1 = getStickers();
    const stickers2 = getStickers();
    expect(stickers1).toHaveLength(14);
    expect(stickers1).not.toBe(stickers2);
    expect(stickers1[0]).not.toBe(stickers2[0]);
  });

  it("should return correct sticker properties by slug", () => {
    const sticker = getSticker("learner_car");
    expect(sticker.slug).toBe("learner_car");
    expect(sticker.src).toBe("/images/stickers/learner_car.jpg");
    expect(sticker.isDecorative).toBe(true);

    const graduation = getSticker("graduation_car");
    expect(graduation.slug).toBe("graduation_car");
    expect(graduation.isDecorative).toBe(false);
  });

  it("should throw TypeError on unknown slug", () => {
    expect(() => getSticker("non_existent_slug")).toThrow(TypeError);
  });

  it("should verify all registered sticker files exist in the public served folder", () => {
    const stickers = getStickers();
    stickers.forEach((sticker) => {
      const filePath = path.join(process.cwd(), "public", sticker.src);
      const exists = fs.existsSync(filePath);
      expect(exists).toBe(true);
    });
  });
});
