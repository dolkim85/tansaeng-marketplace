import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/categories"
      title="전체 카테고리"
      description="농산물·축산물·수산물 전체 카테고리를 탐색합니다."
      bullets={["대분류/소분류 트리 탐색", "품목별 바로가기", "인기 카테고리 하이라이트"]}
    />
  );
}
