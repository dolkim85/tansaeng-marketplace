import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/cart"
      title="장바구니"
      description="담은 상품을 판매자별로 분리해 확인하고 주문을 준비합니다."
      bullets={["판매자별 배송 분리", "실시간 재고/가격 재검증(예정)"]}
    />
  );
}
