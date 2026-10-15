import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PlaceholderSection
      path={`/orders/${id}`}
      title="주문 상세"
      description={`주문 항목, 배송 상태, 송장, 취소/반품 요청을 확인합니다. (${id} 식별자 기준)`}
    />
  );
}
