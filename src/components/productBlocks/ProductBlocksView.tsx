import Image from "next/image";
import { parseBlockContent, type ProductBlockType } from "@/lib/productBlocks";

type BlockRow = { id: string; type: string; content: string };
type MediaRow = { id: string; url: string };

/**
 * 블록 JSON을 안전하게 렌더링한다. dangerouslySetInnerHTML을 전혀 사용하지 않으므로
 * 텍스트 필드에 무엇이 들어있어도 React가 자동으로 이스케이프한다(스크립트/HTML 삽입 불가).
 * 저장 시 이미 검증된 JSON이지만, 방어적으로 렌더링 시점에도 다시 검증한다.
 */
export function ProductBlocksView({
  blocks,
  media,
}: {
  blocks: BlockRow[];
  media: MediaRow[];
}) {
  return (
    <div className="space-y-4">
      {blocks.map((b) => {
        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(b.content);
        } catch {
          return null;
        }
        const parsed = parseBlockContent(b.type as ProductBlockType, parsedJson);
        if (!parsed.success) return null;
        const c = parsed.data;

        switch (b.type as ProductBlockType) {
          case "HEADING":
            return (
              <h3 key={b.id} className="text-lg font-semibold text-brand-deepgreen">
                {(c as { text: string }).text}
              </h3>
            );
          case "PARAGRAPH":
            return (
              <p
                key={b.id}
                className="whitespace-pre-line text-sm text-brand-deepgreen/80"
              >
                {(c as { text: string }).text}
              </p>
            );
          case "IMAGE": {
            const m = media.find((mm) => mm.id === (c as { mediaId: string }).mediaId);
            if (!m) return null;
            return (
              <Image
                key={b.id}
                src={m.url}
                alt=""
                width={800}
                height={450}
                className="w-full rounded-lg object-cover"
              />
            );
          }
          case "VIDEO": {
            const m = media.find((mm) => mm.id === (c as { mediaId: string }).mediaId);
            if (!m) return null;
            return (
              <video key={b.id} src={m.url} controls className="w-full rounded-lg" />
            );
          }
          case "TABLE": {
            const table = c as { hasHeader: boolean; rows: string[][] };
            return (
              <table key={b.id} className="w-full border-collapse text-sm">
                <tbody>
                  {table.rows.map((row, i) => (
                    <tr
                      key={i}
                      className={
                        i === 0 && table.hasHeader ? "bg-brand-green/10 font-semibold" : ""
                      }
                    >
                      {row.map((cell, j) => (
                        <td key={j} className="border border-brand-green/15 px-2 py-1">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          }
          case "DIVIDER":
            return <hr key={b.id} className="border-brand-green/15" />;
          case "FAQ": {
            const faq = c as { items: { q: string; a: string }[] };
            return (
              <div key={b.id} className="space-y-2">
                {faq.items.map((item, i) => (
                  <details
                    key={i}
                    className="rounded-lg border border-brand-green/15 bg-white p-3 text-sm"
                  >
                    <summary className="cursor-pointer font-medium text-brand-deepgreen">
                      {item.q}
                    </summary>
                    <p className="mt-2 text-xs text-brand-deepgreen/70">{item.a}</p>
                  </details>
                ))}
              </div>
            );
          }
          case "BANNER": {
            const banner = c as { text: string; tone: "info" | "warning" };
            return (
              <p
                key={b.id}
                className={`rounded-md p-3 text-sm ${
                  banner.tone === "warning"
                    ? "bg-brand-orange/10 text-brand-orange"
                    : "bg-brand-green/10 text-brand-deepgreen"
                }`}
              >
                {banner.text}
              </p>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
