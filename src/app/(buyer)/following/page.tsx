import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/following"
      title="팔로우한 생산자"
      description="팔로우한 생산자의 신상품·출하예정·공동구매 소식을 모아봅니다."
      bullets={["팔로우 ≠ 마케팅 수신 동의", "생산자별 신상품 피드"]}
    />
  );
}
