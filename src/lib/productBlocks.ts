import { z } from "zod";

export const headingContentSchema = z.object({
  text: z.string().min(1, "제목을 입력하세요.").max(200),
});
export const paragraphContentSchema = z.object({
  text: z.string().min(1, "내용을 입력하세요.").max(5000),
});
export const imageContentSchema = z.object({
  mediaId: z.string().min(1, "사진을 선택하세요."),
  alt: z.string().max(200).default(""),
});
export const videoContentSchema = z.object({
  mediaId: z.string().min(1, "영상을 선택하세요."),
  alt: z.string().max(200).default(""),
});
export const tableContentSchema = z.object({
  hasHeader: z.boolean().default(false),
  rows: z
    .array(z.array(z.string().max(500)))
    .min(1, "표에 최소 1행이 필요합니다.")
    .max(50),
});
export const dividerContentSchema = z.object({});
export const faqContentSchema = z.object({
  items: z
    .array(
      z.object({
        q: z.string().min(1).max(300),
        a: z.string().min(1).max(2000),
      })
    )
    .min(1, "Q/A를 최소 1개 입력하세요."),
});
export const bannerContentSchema = z.object({
  text: z.string().min(1, "안내 문구를 입력하세요.").max(500),
  tone: z.enum(["info", "warning"]).default("info"),
});

export const BLOCK_CONTENT_SCHEMA = {
  HEADING: headingContentSchema,
  PARAGRAPH: paragraphContentSchema,
  IMAGE: imageContentSchema,
  VIDEO: videoContentSchema,
  TABLE: tableContentSchema,
  DIVIDER: dividerContentSchema,
  FAQ: faqContentSchema,
  BANNER: bannerContentSchema,
} as const;

export type ProductBlockType = keyof typeof BLOCK_CONTENT_SCHEMA;

export const BLOCK_TYPES = Object.keys(BLOCK_CONTENT_SCHEMA) as ProductBlockType[];

export const BLOCK_TYPE_LABEL: Record<ProductBlockType, string> = {
  HEADING: "제목",
  PARAGRAPH: "문단",
  IMAGE: "이미지",
  VIDEO: "영상",
  TABLE: "표",
  DIVIDER: "구분선",
  FAQ: "FAQ",
  BANNER: "안내 배너",
};

export function parseBlockContent<T extends ProductBlockType>(
  type: T,
  raw: unknown
): z.SafeParseReturnType<unknown, z.infer<(typeof BLOCK_CONTENT_SCHEMA)[T]>> {
  return BLOCK_CONTENT_SCHEMA[type].safeParse(raw) as z.SafeParseReturnType<
    unknown,
    z.infer<(typeof BLOCK_CONTENT_SCHEMA)[T]>
  >;
}

/** "Q: ... / A: ..." 형식의 줄들을 FAQ 항목 배열로 변환(형식이 안 맞는 줄은 건너뜀). */
export function parseFaqLines(text: string): { q: string; a: string }[] {
  const items: { q: string; a: string }[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*Q:\s*(.+?)\s*\/\s*A:\s*(.+?)\s*$/i);
    if (m) items.push({ q: m[1], a: m[2] });
  }
  return items;
}

/** "|"로 구분된 줄들을 표 행(rows)으로 변환(빈 줄은 건너뜀). */
export function parseTableLines(text: string): string[][] {
  return text
    .split("\n")
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .filter((row) => row.some((cell) => cell.length > 0));
}
