import { describe, expect, it } from "vitest";
import { detectFileKind } from "@/server/media/validate";

describe("detectFileKind", () => {
  it("JPEG 매직넘버를 인식한다", () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(detectFileKind(buf)).toBe("image/jpeg");
  });

  it("PNG 매직넘버를 인식한다", () => {
    const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(detectFileKind(buf)).toBe("image/png");
  });

  it("HTML/SVG 등 위장 파일은 null을 반환한다", () => {
    const buf = Buffer.from("<html><script>alert(1)</script></html>");
    expect(detectFileKind(buf)).toBeNull();
  });

  it("너무 짧은 파일은 null을 반환한다", () => {
    expect(detectFileKind(Buffer.from([0xff, 0xd8]))).toBeNull();
  });
});
