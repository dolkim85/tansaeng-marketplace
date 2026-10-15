import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PlaceholderSection
      path={`/seller/products/${id}/edit`}
      title="상품 수정/미리보기"
      description={`등록된 상품 정보를 수정하고 게시 전 미리보기를 확인합니다. (${id} 식별자 기준)`}
    />
  );
}
