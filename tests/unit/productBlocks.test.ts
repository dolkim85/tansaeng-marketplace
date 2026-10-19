import { describe, expect, it } from "vitest";
import {
  parseBlockContent,
  parseFaqLines,
  parseTableLines,
} from "@/lib/productBlocks";

describe("parseBlockContent", () => {
  it("HEADING: 텍스트가 있으면 통과", () => {
    const result = parseBlockContent("HEADING", { text: "제철 감자" });
    expect(result.success).toBe(true);
  });

  it("HEADING: 빈 텍스트는 실패", () => {
    const result = parseBlockContent("HEADING", { text: "" });
    expect(result.success).toBe(false);
  });

  it("IMAGE: mediaId 없으면 실패", () => {
    const result = parseBlockContent("IMAGE", {});
    expect(result.success).toBe(false);
  });

  it("TABLE: 행이 1개 이상이면 통과, hasHeader 기본값은 false", () => {
    const result = parseBlockContent("TABLE", { rows: [["품목", "중량"]] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.hasHeader).toBe(false);
    }
  });

  it("TABLE: 행이 0개면 실패", () => {
    const result = parseBlockContent("TABLE", { rows: [] });
    expect(result.success).toBe(false);
  });

  it("DIVIDER: 빈 객체도 통과", () => {
    expect(parseBlockContent("DIVIDER", {}).success).toBe(true);
  });

  it("FAQ: 항목이 1개 이상이면 통과", () => {
    const result = parseBlockContent("FAQ", {
      items: [{ q: "배송은 얼마나 걸리나요?", a: "2~3일 이내입니다." }],
    });
    expect(result.success).toBe(true);
  });

  it("FAQ: 항목이 0개면 실패", () => {
    expect(parseBlockContent("FAQ", { items: [] }).success).toBe(false);
  });

  it("BANNER: tone 기본값은 info", () => {
    const result = parseBlockContent("BANNER", { text: "주의하세요" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tone).toBe("info");
    }
  });
});

describe("parseFaqLines", () => {
  it("Q:.../A:... 형식의 줄만 항목으로 변환한다", () => {
    const text = [
      "Q: 배송은 며칠 걸리나요? / A: 2~3일 이내 출고됩니다.",
      "이건 형식이 안 맞는 줄",
      "Q: 반품 가능한가요? / A: 단순변심은 7일 이내 가능합니다.",
    ].join("\n");
    expect(parseFaqLines(text)).toEqual([
      { q: "배송은 며칠 걸리나요?", a: "2~3일 이내 출고됩니다." },
      { q: "반품 가능한가요?", a: "단순변심은 7일 이내 가능합니다." },
    ]);
  });

  it("매칭되는 줄이 없으면 빈 배열", () => {
    expect(parseFaqLines("아무 줄\n또 다른 줄")).toEqual([]);
  });
});

describe("parseTableLines", () => {
  it("|로 구분된 줄을 행으로 변환하고 빈 줄은 제외한다", () => {
    const text = "품목 | 중량 | 원산지\n\n감자 | 10kg | 강원 평창";
    expect(parseTableLines(text)).toEqual([
      ["품목", "중량", "원산지"],
      ["감자", "10kg", "강원 평창"],
    ]);
  });

  it("셀 앞뒤 공백을 제거한다", () => {
    expect(parseTableLines("  a  |  b  ")).toEqual([["a", "b"]]);
  });
});
