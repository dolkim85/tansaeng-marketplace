import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/admin/orders"
      title="주문/환불/이상 거래"
      description="주문 상태와 환불, 이상 거래를 모니터링합니다."
      bullets={undefined}
    />
  );
}
