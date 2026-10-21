import crypto from "crypto";
import { describe, expect, it } from "vitest";
import {
  generateTotpSecret,
  generateTotpUri,
  verifyTotpCode,
  generateRecoveryCodes,
} from "@/lib/totp";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(encoded: string): Buffer {
  let bits = "";
  for (const ch of encoded.toUpperCase()) {
    bits += BASE32_ALPHABET.indexOf(ch).toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function hotp(secretBuf: Buffer, counter: number): string {
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", secretBuf).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (binCode % 1000000).toString().padStart(6, "0");
}

describe("generateTotpSecret", () => {
  it("base32 알파벳(A-Z, 2-7)으로만 구성된 32자 문자열을 생성한다", () => {
    const secret = generateTotpSecret();
    expect(secret).toMatch(/^[A-Z2-7]{32}$/);
  });

  it("호출할 때마다 다른 값을 생성한다", () => {
    const a = generateTotpSecret();
    const b = generateTotpSecret();
    expect(a).not.toBe(b);
  });
});

describe("verifyTotpCode", () => {
  it("방금 생성한 secret으로 올바른 현재 코드를 넣으면 통과한다(독립 재구현과 상호 검증)", () => {
    const secret = generateTotpSecret();
    const counter = Math.floor(Date.now() / 1000 / 30);
    const code = hotp(base32Decode(secret), counter);

    expect(verifyTotpCode(secret, code)).toBe(true);
  });

  it("틀린 코드는 거부한다", () => {
    const secret = generateTotpSecret();
    expect(verifyTotpCode(secret, "000000")).toBe(false);
  });

  it("형식이 맞지 않는 입력(자릿수/문자)은 거부한다", () => {
    const secret = generateTotpSecret();
    expect(verifyTotpCode(secret, "12345")).toBe(false);
    expect(verifyTotpCode(secret, "abcdef")).toBe(false);
    expect(verifyTotpCode(secret, "")).toBe(false);
  });

  it("RFC 6238 공식 테스트 벡터와 일치한다(SHA1, 6자리로 축소 비교)", () => {
    // RFC 6238 Appendix B: ASCII secret "12345678901234567890"를 직접 HMAC 키로 사용.
    // T=59 -> counter=1 -> 8자리 94287082 -> 6자리 287082
    // T=1111111109 -> counter=37037036 -> 8자리 07081804 -> 6자리 081804
    const rawSecret = Buffer.from("12345678901234567890", "ascii");
    expect(hotp(rawSecret, 1)).toBe("287082");
    expect(hotp(rawSecret, 37037036)).toBe("081804");
  });
});

describe("generateTotpUri", () => {
  it("otpauth://totp 스킴과 필수 파라미터를 포함한다", () => {
    const uri = generateTotpUri("ABCDEFGHIJKLMNOP", "admin@tansaeng.local");
    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain("secret=ABCDEFGHIJKLMNOP");
    expect(uri).toContain("issuer=Tansaeng");
    expect(uri).toContain("digits=6");
    expect(uri).toContain("period=30");
  });
});

describe("generateRecoveryCodes", () => {
  it("기본 8개의 서로 다른 16진수 코드를 생성한다", () => {
    const codes = generateRecoveryCodes();
    expect(codes).toHaveLength(8);
    expect(new Set(codes).size).toBe(8);
    for (const code of codes) {
      expect(code).toMatch(/^[0-9a-f]{10}$/);
    }
  });

  it("count 인자로 개수를 조절할 수 있다", () => {
    expect(generateRecoveryCodes(3)).toHaveLength(3);
  });
});
