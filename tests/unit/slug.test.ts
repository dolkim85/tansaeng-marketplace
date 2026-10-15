import { describe, expect, it } from "vitest";
import { randomSuffix, slugify } from "@/lib/slug";

describe("slugify", () => {
  it("한글/영문 혼합 제목을 하이픈 slug로 변환한다", () => {
    expect(slugify("무농약 감자 10kg")).toBe("무농약-감자-10kg");
  });

  it("앞뒤 하이픈을 제거한다", () => {
    expect(slugify("  !!! 테스트 !!!  ")).toBe("테스트");
  });
});

describe("randomSuffix", () => {
  it("기본 길이 5의 영숫자 문자열을 반환한다", () => {
    const suffix = randomSuffix();
    expect(suffix).toMatch(/^[a-z0-9]{1,5}$/);
  });
});
