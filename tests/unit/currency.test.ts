import { describe, expect, it } from "vitest";
import { formatKRW, sumKRW } from "@/lib/currency";

describe("formatKRW", () => {
  it("천 단위 쉼표와 '원'을 붙인다", () => {
    expect(formatKRW(12345)).toBe("12,345원");
    expect(formatKRW(0)).toBe("0원");
  });

  it("정수가 아니면 예외를 던진다", () => {
    expect(() => formatKRW(1000.5)).toThrow(RangeError);
  });
});

describe("sumKRW", () => {
  it("배열 합계를 정수로 반환한다", () => {
    expect(sumKRW([1000, 2000, 3000])).toBe(6000);
  });

  it("정수가 아닌 값이 섞이면 예외를 던진다", () => {
    expect(() => sumKRW([1000, 2000.1])).toThrow(RangeError);
  });
});
