import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/orders"
      title="내 주문"
      description="주문/배송/취소/반품 상태를 확인합니다."
      bullets={["판매자별 하위주문(suborders)", "상태 전이 이력"]}
    />
  );
}
