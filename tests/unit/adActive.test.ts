import { describe, expect, it } from "vitest";
import { isAdActive } from "@/lib/adActive";

const startAt = new Date("2026-01-10T00:00:00Z");
const endAt = new Date("2026-01-17T00:00:00Z");

describe("isAdActive", () => {
  it("승인+기간 내면 활성", () => {
    expect(
      isAdActive(
        { status: "APPROVED", startAt, endAt },
        new Date("2026-01-12T00:00:00Z")
      )
    ).toBe(true);
  });

  it("승인되었어도 기간 밖이면 비활성", () => {
    expect(
      isAdActive(
        { status: "APPROVED", startAt, endAt },
        new Date("2026-01-20T00:00:00Z")
      )
    ).toBe(false);
  });

  it("기간 내여도 미승인이면 비활성", () => {
    expect(
      isAdActive(
        { status: "REQUESTED", startAt, endAt },
        new Date("2026-01-12T00:00:00Z")
      )
    ).toBe(false);
  });
});
