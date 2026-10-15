/**
 * 한글 제목도 허용하는 느슨한 slug 생성기. 유니크 보장은 호출 측에서 suffix로 처리한다.
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function randomSuffix(length = 5): string {
  return Math.random().toString(36).slice(2, 2 + length);
}
