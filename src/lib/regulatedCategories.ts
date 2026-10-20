/// 추가 허가/신고/표시·이력관리 대상 카테고리(마스터 문서 10.2절 5번). 이 카테고리의 상품은
/// 승인된 판매자라도 즉시 ON_SALE로 전환되지 않고 관리자 검수(IN_REVIEW)를 거쳐야 한다.
export const REGULATED_CATEGORY_SLUGS = new Set(["livestock", "seafood"]);
