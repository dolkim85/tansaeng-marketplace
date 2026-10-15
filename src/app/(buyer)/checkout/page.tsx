import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/checkout"
      title="주문·결제 (샌드박스)"
      description="Mock PG를 통한 모의 결제만 지원합니다. 실제 결제 수단은 연결되지 않습니다."
      bullets={["Mock PG 전용", "멱등성 키 기반 주문 생성(예정)"]}
    />
  );
}
