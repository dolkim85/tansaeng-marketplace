import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/group-buys"
      title="공동구매 모아보기"
      description="진행 중/오픈 예정/마감된 공동구매를 모아서 확인합니다."
      bullets={["목표수량 대비 진행률", "마감 임박순 정렬", "실패/환불 처리 상태 표시"]}
    />
  );
}
