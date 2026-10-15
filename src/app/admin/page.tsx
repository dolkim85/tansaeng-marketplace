import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/admin"
      title="운영 대시보드"
      description="판매자 심사대기, 신규 상품 검수, 오늘 주문, 분쟁 등을 한눈에 봅니다."
      bullets={undefined}
    />
  );
}
