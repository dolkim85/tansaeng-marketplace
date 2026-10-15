import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PlaceholderSection
      path={`/farms/${slug}`}
      title="인증 생산자·농장 스토어"
      description={`생산자 소개, 인증 정보, 판매 중인 상품을 모아봅니다. (${slug} 식별자 기준)`}
    />
  );
}
