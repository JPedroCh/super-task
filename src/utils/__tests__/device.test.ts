import { describe, it, expect } from "vitest";
import { getDeviceType } from "../device";

describe("getDeviceType", () => {
  it("classifies widths below 600 as mobile", () => {
    expect(getDeviceType(320)).toBe("mobile");
    expect(getDeviceType(599)).toBe("mobile");
  });

  it("classifies 600-899 as tablet", () => {
    expect(getDeviceType(600)).toBe("tablet");
    expect(getDeviceType(899)).toBe("tablet");
  });

  it("classifies 900+ as desktop", () => {
    expect(getDeviceType(900)).toBe("desktop");
    expect(getDeviceType(1920)).toBe("desktop");
  });
});
