import { describe, it, expect, beforeEach } from "vitest";
import { getAcquisitionSource, getSessionId, __resetAcquisitionSourceCacheForTests } from "../session";

beforeEach(() => {
  window.sessionStorage.clear();
  __resetAcquisitionSourceCacheForTests();
});

describe("getAcquisitionSource persistence", () => {
  it("resolves from the current URL on first read", () => {
    window.history.pushState({}, "", "/jobs/123?utm_source=google");
    expect(getAcquisitionSource()).toBe("google");
  });

  it("persists the first-read source across subsequent reads, even after the URL changes", () => {
    window.history.pushState({}, "", "/jobs/123?utm_source=google");
    expect(getAcquisitionSource()).toBe("google");

    // User navigates internally — no utm_source on this URL anymore — but
    // the originally-attributed source must stick for the rest of the
    // session (brief §19: "persist the acquisition source for the session
    // so subsequent events retain it").
    window.history.pushState({}, "", "/jobs");
    expect(getAcquisitionSource()).toBe("google");
  });

  it("survives being read via a fresh call by reading sessionStorage rather than re-resolving", () => {
    window.history.pushState({}, "", "/jobs?utm_source=linkedin");
    getAcquisitionSource();

    window.history.pushState({}, "", "/jobs?utm_source=indeed");
    expect(getAcquisitionSource()).toBe("linkedin");
  });

  it("never re-derives from window.location once resolved in this page load, even if sessionStorage is cleared out from under it", () => {
    // Regression test: usePageTiming's `pagehide` handler calls
    // getAcquisitionSource() during a real page unload, when
    // window.location can be in a transitional state. Without an
    // in-memory cache, clearing storage (or any other timing hiccup)
    // between the first resolution and a later call could cause a second,
    // wrong resolution to overwrite the session's real source.
    window.history.pushState({}, "", "/jobs?utm_source=google");
    expect(getAcquisitionSource()).toBe("google");

    window.sessionStorage.clear();
    window.history.pushState({}, "", "/jobs"); // no utm_source at all now

    expect(getAcquisitionSource()).toBe("google");
  });

  it("does resolve fresh after an explicit test-only cache reset (simulating a new page load)", () => {
    window.history.pushState({}, "", "/jobs?utm_source=google");
    expect(getAcquisitionSource()).toBe("google");

    window.sessionStorage.clear();
    __resetAcquisitionSourceCacheForTests();
    window.history.pushState({}, "", "/jobs?utm_source=linkedin");

    expect(getAcquisitionSource()).toBe("linkedin");
  });
});

describe("getSessionId", () => {
  it("returns a stable id across multiple calls", () => {
    const first = getSessionId();
    const second = getSessionId();
    expect(first).toBe(second);
  });

  it("returns a non-empty string", () => {
    expect(getSessionId().length).toBeGreaterThan(0);
  });
});
