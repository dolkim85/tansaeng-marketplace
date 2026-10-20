import "server-only";
import { prisma } from "@/lib/db";

/// 관리자 카테고리 트리 화면용. 최상위 카테고리(parentId=null)마다 하위 카테고리와 각 단계의
/// 상품 개수를 함께 가져온다(0개가 아니면 그 카테고리는 삭제할 수 없게 UI에서 막기 위함 —
/// 이 앱은 2단계 트리만 지원하므로 children에 또 children을 포함하지 않는다).
export async function listCategoryTreeForAdmin() {
  return prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      },
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });
}
