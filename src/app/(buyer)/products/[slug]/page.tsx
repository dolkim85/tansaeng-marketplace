import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PlaceholderSection
      path={`/products/${slug}`}
      title="상품 상세"
      description={`사진·영상·상세설명·판매자 정보·구매 패널을 제공합니다. (${slug} 식별자 기준)`}
    />
  );
}
