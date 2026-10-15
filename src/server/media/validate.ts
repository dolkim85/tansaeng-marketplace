// 순수 바이트 검사 유틸이라 서버 전용 비밀은 없음 — 유닛 테스트에서 직접 임포트하기 위해
// "server-only" 가드는 걸지 않는다(DB 접근 등 실제 서버 전용 모듈과는 다름).

export type DetectedKind = "image/jpeg" | "image/png" | "image/webp" | "video/mp4" | "video/webm" | null;

/**
 * 확장자/Content-Type은 클라이언트가 조작할 수 있으므로 믿지 않는다.
 * 파일 앞부분 바이트(매직 넘버)를 직접 확인해 실제 포맷을 판별한다.
 * HTML/SVG/스크립트 등은 어떤 매직 넘버에도 해당하지 않아 자동으로 거부된다.
 */
export function detectFileKind(buffer: Buffer): DetectedKind {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  if (buffer.subarray(4, 8).toString("ascii") === "ftyp") {
    return "video/mp4";
  }
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return "video/webm";
  }

  return null;
}

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
export const MAX_VIDEO_BYTES = 80 * 1024 * 1024; // 80MB
export const MAX_IMAGES_PER_PRODUCT = 10;
export const MAX_VIDEOS_PER_PRODUCT = 1;
