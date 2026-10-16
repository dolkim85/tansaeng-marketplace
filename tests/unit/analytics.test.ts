import { describe, expect, it } from "vitest";
import { bucketDailyCounts, safeRatePercent } from "@/lib/analytics";

describe("bucketDailyCounts", () => {
  it("최근 N일 각 버킷에 날짜별 개수를 집계한다", () => {
    const now = new Date("2026-01-10T12:00:00.000Z");
    const dates = [
      new Date("2026-01-08T01:00:00.000Z"),
      new Date("2026-01-08T23:00:00.000Z"),
      new Date("2026-01-10T00:00:00.000Z"),
    ];
    const buckets = bucketDailyCounts(dates, 3, now);
    expect(buckets).toEqual([
      { date: "2026-01-08", count: 2 },
      { date: "2026-01-09", count: 0 },
      { date: "2026-01-10", count: 1 },
    ]);
  });

  it("데이터가 없으면 모든 버킷이 0", () => {
    const now = new Date("2026-01-10T12:00:00.000Z");
    const buckets = bucketDailyCounts([], 5, now);
    expect(buckets.every((b) => b.count === 0)).toBe(true);
    expect(buckets).toHaveLength(5);
  });
});

describe("safeRatePercent", () => {
  it("분모가 0이면 0을 반환(0으로 나누기 방지)", () => {
    expect(safeRatePercent(5, 0)).toBe(0);
  });

  it("퍼센트를 소수점 1자리로 반올림한다", () => {
    expect(safeRatePercent(1, 3)).toBe(33.3);
  });
});
