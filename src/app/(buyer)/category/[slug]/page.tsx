import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PlaceholderSection
      path={`/category/${slug}`}
      title="카테고리 상품 목록"
      description={`선택한 카테고리의 상품을 필터/정렬과 함께 보여줍니다. (${slug} 식별자 기준)`}
    />
  );
}
