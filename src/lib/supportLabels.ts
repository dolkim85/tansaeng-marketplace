export const TICKET_CATEGORY_LABEL: Record<string, string> = {
  PRODUCT_QUESTION: "상품 질문",
  ORDER_INQUIRY: "주문 문의",
  DISPUTE: "분쟁",
};

export const TICKET_STATUS_LABEL: Record<string, string> = {
  OPEN: "답변 대기",
  ANSWERED: "답변 완료",
  CLOSED: "종료",
};

export const USER_ROLE_LABEL: Record<string, string> = {
  BUYER: "구매자",
  SELLER: "판매자",
  ADMIN: "관리자",
  SUPER_ADMIN: "관리자",
};

export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "주문 후 배송까지 얼마나 걸리나요?",
    a: "일반 주문은 판매자가 접수 후 순차 처리합니다. 공동구매는 상품마다 표시된 출하예정일을 따릅니다.",
  },
  {
    q: "상품에 문제가 있으면 어떻게 하나요?",
    a: "주문 상세페이지에서 '문의/분쟁 접수'로 해당 상품을 선택해 분쟁(하자/오배송/변질 등)으로 접수해 주세요.",
  },
  {
    q: "구매 전 상품에 대해 질문할 수 있나요?",
    a: "상품 상세페이지의 '판매자에게 문의하기'로 질문을 등록할 수 있고, 공개로 설정하면 다른 구매자도 답변을 볼 수 있습니다.",
  },
];
