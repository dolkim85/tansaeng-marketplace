import { describe, expect, it } from "vitest";
import { calcSettlement } from "@/lib/settlement";

describe("calcSettlement", () => {
  it("기본 수수료율(5%)로 수수료/정산액을 계산한다", () => {
    expect(calcSettlement(100000)).toEqual({
      grossKrw: 100000,
      commissionRate: 0.05,
      commissionKrw: 5000,
      payoutKrw: 95000,
    });
  });

  it("원 단위 사사오입(round)으로 수수료를 계산한다", () => {
    const result = calcSettlement(10001);
    expect(result.commissionKrw).toBe(Math.round(10001 * 0.05));
    expect(result.payoutKrw).toBe(10001 - result.commissionKrw);
  });

  it("GMV가 0이면 수수료/정산액도 0", () => {
    expect(calcSettlement(0)).toEqual({
      grossKrw: 0,
      commissionRate: 0.05,
      commissionKrw: 0,
      payoutKrw: 0,
    });
  });

  it("커스텀 수수료율을 지정할 수 있다", () => {
    expect(calcSettlement(100000, 0.1)).toEqual({
      grossKrw: 100000,
      commissionRate: 0.1,
      commissionKrw: 10000,
      payoutKrw: 90000,
    });
  });
});
