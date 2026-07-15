import { describe, expect, it } from "vitest";
import { clampFloatingPosition } from "@/lib/floating-position";

describe("floating position", () => {
  const bounds = {
    left: 0,
    top: 0,
    width: 1920,
    height: 1040
  };

  it("keeps the whole window inside the work area", () => {
    expect(clampFloatingPosition({ x: 5000, y: 5000 }, bounds)).toEqual({
      x: 1808,
      y: 928
    });
    expect(clampFloatingPosition({ x: -5000, y: -5000 }, bounds)).toEqual({
      x: 0,
      y: 0
    });
  });

  it("preserves negative monitor origins", () => {
    expect(
      clampFloatingPosition(
        { x: -1600, y: -100 },
        { left: -1920, top: -200, width: 1920, height: 1080 }
      )
    ).toEqual({ x: -1600, y: -100 });
  });

  it("normalizes non-finite positions and bounds", () => {
    expect(
      clampFloatingPosition(
        { x: Number.NaN, y: Number.POSITIVE_INFINITY },
        { left: Number.NaN, top: Number.NaN, width: Number.NaN, height: Number.NaN }
      )
    ).toEqual({ x: 0, y: 0 });
  });
});
