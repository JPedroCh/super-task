import { describe, it, expect } from "vitest";
import { resolveAcquisitionSource } from "../acquisitionSource";

describe("resolveAcquisitionSource", () => {
  it("prefers a known utm_source over everything else", () => {
    const sp = new URLSearchParams("utm_source=google");
    expect(resolveAcquisitionSource(sp, "https://www.bing.com/search", "app.example.com")).toBe("google");
  });

  it("maps linkedin and indeed utm_source values", () => {
    expect(resolveAcquisitionSource(new URLSearchParams("utm_source=linkedin"), "", "app.example.com")).toBe(
      "linkedin"
    );
    expect(resolveAcquisitionSource(new URLSearchParams("utm_source=indeed"), "", "app.example.com")).toBe(
      "indeed"
    );
  });

  it("maps an unrecognized utm_source to 'other' rather than guessing", () => {
    const sp = new URLSearchParams("utm_source=some_newsletter");
    expect(resolveAcquisitionSource(sp, "", "app.example.com")).toBe("other");
  });

  it("is case-insensitive on utm_source", () => {
    const sp = new URLSearchParams("utm_source=Google");
    expect(resolveAcquisitionSource(sp, "", "app.example.com")).toBe("google");
  });

  it("falls back to the referrer host when there's no utm_source", () => {
    expect(resolveAcquisitionSource(new URLSearchParams(), "https://www.google.com/search?q=jobs", "app.example.com")).toBe(
      "google"
    );
    expect(
      resolveAcquisitionSource(new URLSearchParams(), "https://www.linkedin.com/feed", "app.example.com")
    ).toBe("linkedin");
  });

  it("classifies a recognized-but-unmapped external referrer as 'other'", () => {
    expect(
      resolveAcquisitionSource(new URLSearchParams(), "https://news.ycombinator.com/", "app.example.com")
    ).toBe("other");
  });

  it("treats a same-host referrer (internal navigation) as direct", () => {
    expect(
      resolveAcquisitionSource(new URLSearchParams(), "https://app.example.com/jobs", "app.example.com")
    ).toBe("direct");
  });

  it("uses direct only when there is genuinely no signal", () => {
    expect(resolveAcquisitionSource(new URLSearchParams(), "", "app.example.com")).toBe("direct");
  });

  it("falls back to direct on a malformed referrer instead of throwing", () => {
    expect(resolveAcquisitionSource(new URLSearchParams(), "not a url", "app.example.com")).toBe("direct");
  });
});
