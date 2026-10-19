import { deleteBlockAction, moveBlockAction } from "@/server/productBlocks/actions";
import { BLOCK_TYPE_LABEL, type ProductBlockType } from "@/lib/productBlocks";

type BlockRow = { id: string; type: string; sortOrder: number };

export function BlockManager({ blocks }: { blocks: BlockRow[] }) {
  if (blocks.length === 0) {
    return (
      <p className="mt-3 text-sm text-brand-deepgreen/60">
        등록된 블록이 없습니다. 아래에서 블록을 추가해 보세요.
      </p>
    );
  }

  return (
    <ul className="mt-3 space-y-2">
      {blocks.map((b, i) => (
        <li
          key={b.id}
          className="flex items-center justify-between rounded-lg border border-brand-green/15 bg-white p-2 text-sm"
        >
          <span className="font-medium text-brand-deepgreen">
            {BLOCK_TYPE_LABEL[b.type as ProductBlockType]}
          </span>
          <div className="flex items-center gap-2">
            <form action={moveBlockAction.bind(null, b.id, "up")}>
              <button
                type="submit"
                disabled={i === 0}
                className="text-xs text-brand-deepgreen/60 hover:text-brand-green disabled:opacity-30"
              >
                ↑
              </button>
            </form>
            <form action={moveBlockAction.bind(null, b.id, "down")}>
              <button
                type="submit"
                disabled={i === blocks.length - 1}
                className="text-xs text-brand-deepgreen/60 hover:text-brand-green disabled:opacity-30"
              >
                ↓
              </button>
            </form>
            <form action={deleteBlockAction.bind(null, b.id)}>
              <button
                type="submit"
                className="text-xs text-red-500 hover:underline"
              >
                삭제
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
