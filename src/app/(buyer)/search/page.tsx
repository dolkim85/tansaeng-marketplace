import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/search"
      title="검색 결과"
      description="품목, 생산자, 지역, 가격대 등으로 상품을 검색/필터/정렬합니다."
      bullets={["키워드/필터/정렬", "동일상품 비교 로직(문서 5.3)", "광고 상품 구분 표기"]}
    />
  );
}
