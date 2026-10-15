import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/alerts"
      title="관심 알림·수신설정"
      description="공동구매 시작/마감임박/출하예정/가격변경/재입고 알림을 관리합니다."
      bullets={["거래 알림과 광고 알림 구분", "채널별 수신 동의 관리"]}
    />
  );
}
