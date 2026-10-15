import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/upcoming"
      title="출하예정/오픈예정 캘린더"
      description="아직 판매가 시작되지 않은 출하예정 상품과 알림 신청을 관리합니다."
      bullets={["D-7부터 티저 노출", "알림 신청은 수요 집계일 뿐 주문 아님"]}
    />
  );
}
