import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/wishlist"
      title="찜한 상품"
      description="내가 찜한 상품을 전체/일반판매/공동구매/오픈예정/판매종료로 모아봅니다."
      bullets={["다중 선택 찜 해제", "품절 상품만 보기", "비슷한 상품 추천"]}
    />
  );
}
