import { describe, expect, it } from "vitest";
import { computeGroupBuyPhase } from "@/lib/groupBuyPhase";

const openAt = new Date("2026-01-10T00:00:00Z");
const closeAt = new Date("2026-01-17T00:00:00Z");

describe("computeGroupBuyPhase", () => {
  it("openAt 이전이면 TEASER", () => {
    expect(
      computeGroupBuyPhase(
        { status: "SCHEDULED", openAt, closeAt },
        new Date("2026-01-05T00:00:00Z")
      )
    ).toBe("TEASER");
  });

  it("openAt~closeAt 사이면 OPEN", () => {
    expect(
      computeGroupBuyPhase(
        { status: "SCHEDULED", openAt, closeAt },
        new Date("2026-01-12T00:00:00Z")
      )
    ).toBe("OPEN");
  });

  it("closeAt 이후인데 아직 SCHEDULED면 AWAITING_FINALIZATION", () => {
    expect(
      computeGroupBuyPhase(
        { status: "SCHEDULED", openAt, closeAt },
        new Date("2026-01-20T00:00:00Z")
      )
    ).toBe("AWAITING_FINALIZATION");
  });

  it("status가 SUCCEEDED/FAILED면 시간과 무관하게 그 상태를 반환", () => {
    expect(
      computeGroupBuyPhase(
        { status: "SUCCEEDED", openAt, closeAt },
        new Date("2026-01-05T00:00:00Z")
      )
    ).toBe("SUCCEEDED");
    expect(
      computeGroupBuyPhase(
        { status: "FAILED", openAt, closeAt },
        new Date("2026-01-05T00:00:00Z")
      )
    ).toBe("FAILED");
  });
});
