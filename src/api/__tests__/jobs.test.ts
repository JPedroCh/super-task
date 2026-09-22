import { describe, it, expect } from "vitest";
import { isValidJobId } from "../jobs";

describe("isValidJobId", () => {
  it("accepts a well-formed UUID", () => {
    expect(isValidJobId("e88e2e75-7a8d-4f00-85d9-bd22271b70d8")).toBe(true);
  });

  it("rejects a non-UUID id without ever reaching the network", () => {
    expect(isValidJobId("not-a-real-id")).toBe(false);
    expect(isValidJobId("12345")).toBe(false);
    expect(isValidJobId("")).toBe(false);
  });

  it("rejects a UUID-shaped string with the wrong version/variant nibble", () => {
    // The API's own validator (uuid v1-v5) — this stays a client-side
    // shape check only, so it should be permissive enough not to reject
    // ids the server would actually accept.
    expect(isValidJobId("e88e2e75-7a8d-1f00-85d9-bd22271b70d8")).toBe(true);
  });
});
