import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PlaceholderSection
      path={`/group-buys/${id}`}
      title="공동구매 상세"
      description={`진행률, 일정, 목표수량, 가격 단계를 확인합니다. (${id} 식별자 기준)`}
    />
  );
}
