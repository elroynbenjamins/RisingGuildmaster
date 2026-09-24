import { describe, expect, it } from "vitest";
import { createSeededRandom } from "../src/utils/random";

describe("resumable seeded random source", () => {
  it("continues with the exact same future sequence from a saved state", () => {
    const original = createSeededRandom(0x1234abcd);
    original.next();
    original.int(1, 20);
    original.pick(["a", "b", "c"]);

    const savedState = original.getState();
    const expected = [
      original.next(),
      original.next(),
      original.next(),
      original.next(),
    ];

    const resumed = createSeededRandom(savedState);
    expect([
      resumed.next(),
      resumed.next(),
      resumed.next(),
      resumed.next(),
    ]).toEqual(expected);
  });
});
