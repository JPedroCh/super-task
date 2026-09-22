import { describe, it, expect } from "vitest";
import { diffFilterChanges } from "../filterDiff";
import { JobFiltersSchema } from "../../schemas/filters";

describe("diffFilterChanges", () => {
  it("reports a change only for keys present in the applied partial that actually changed", () => {
    const previous = JobFiltersSchema.parse({ seniority: "SE" });
    const changes = diffFilterChanges(previous, { seniority: "MI", remote: true });

    expect(changes).toEqual(
      expect.arrayContaining([
        { filter: "seniority", value: "MI" },
        { filter: "remote", value: "true" },
      ])
    );
    expect(changes).toHaveLength(2);
  });

  it("does not report a key that was reapplied with the same value", () => {
    const previous = JobFiltersSchema.parse({ seniority: "SE" });
    const changes = diffFilterChanges(previous, { seniority: "SE" });
    expect(changes).toHaveLength(0);
  });

  it("marks a cleared field with '(cleared)' rather than an empty string", () => {
    const previous = JobFiltersSchema.parse({ city: "London" });
    const changes = diffFilterChanges(previous, { city: undefined });
    expect(changes).toEqual([{ filter: "city", value: "(cleared)" }]);
  });

  it("stringifies a skills array change as a comma-joined value", () => {
    const previous = JobFiltersSchema.parse({});
    const changes = diffFilterChanges(previous, { skills: ["React", "TypeScript"] });
    expect(changes).toEqual([{ filter: "skills", value: "React,TypeScript" }]);
  });

  it("ignores keys not present in the applied partial even if a default differs", () => {
    const previous = JobFiltersSchema.parse({ q: "engineer" });
    const changes = diffFilterChanges(previous, { remote: true });
    expect(changes.find((c) => c.filter === "q")).toBeUndefined();
  });
});
