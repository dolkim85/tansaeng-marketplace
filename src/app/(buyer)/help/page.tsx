import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/help"
      title="FAQ·문의·분쟁 접수"
      description="자주 묻는 질문과 1:1 문의, 분쟁 접수를 제공합니다."
      bullets={["상태 추적", "분쟁 티켓 이력"]}
    />
  );
}
