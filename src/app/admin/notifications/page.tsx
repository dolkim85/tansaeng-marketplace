import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/admin/notifications"
      title="알림 예약/발송 로그/동의"
      description="알림 발송 예약과 로그, 수신동의 현황을 확인합니다(Mock 발송만)."
      bullets={undefined}
    />
  );
}
