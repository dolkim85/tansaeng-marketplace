import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/reviews"
      title="후기"
      description="내가 작성한 후기와 작성 가능한 구매 완료 주문을 확인합니다."
      bullets={["구매 확정 주문만 작성 가능", "사진/별점/판매자 답변"]}
    />
  );
}
