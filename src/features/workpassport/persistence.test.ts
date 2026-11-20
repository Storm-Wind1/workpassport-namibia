import { afterEach, describe, expect, it } from "vitest";
import { demoRepository, initialState } from "./service";

const key = "workpassport-demo-v1";

describe("opening the demo on a device", () => {
  afterEach(() => demoRepository.reset());

  it("shows the seeded marketplace on first visit without writing to storage", () => {
    expect(demoRepository.load()).toEqual(initialState());
    expect(localStorage.getItem(key)).toBeNull();
  });

  it.each(["broken JSON", JSON.stringify({ jobs: [] })])(
    "preserves unreadable data for recovery",
    (raw) => {
      localStorage.setItem(key, raw);
      expect(() => demoRepository.load()).toThrow();
      expect(localStorage.getItem(key)).toBe(raw);
    },
  );
});
