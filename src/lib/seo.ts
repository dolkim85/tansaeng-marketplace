/// 실제 운영 도메인은 아직 미확정(docs/PRODUCT_DECISIONS.md 참고) — 확정되면 이 값만
/// 교체하면 된다(canonical/OG/sitemap이 전부 이 상수를 공유).
export const SITE_URL = "http://127.0.0.1:3210";
export const SITE_NAME = "탄생";

/// 공유 미리보기(OG)용 기본 이미지. 상품/판매자 전용 이미지가 없을 때만 사용.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icons/icon-512.png`;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/// JSON-LD를 <script> 태그에 안전하게 삽입하기 위한 이스케이프. JSON.stringify는
/// `<` 문자를 이스케이프하지 않으므로, 상품명/설명 등 사용자 입력에 `</script>`가
/// 포함되면 스크립트 주입이 가능해진다 — Next.js 공식 문서가 권장하는 이스케이프
/// 방식(`<` → `<`)을 그대로 적용해 어떤 입력값이 와도 안전하게 만든다.
export function escapeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
