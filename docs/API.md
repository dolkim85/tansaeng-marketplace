# API — 탄생 마켓플레이스

> M1 시점: REST 엔드포인트 대신 **Next.js 서버 액션**으로 구현되어 있다(마스터 문서 14장은
> "Next.js server actions와 혼합해도 된다"고 허용). 실제 REST 경로가 필요해지면(M2 결제 웹훅 등)
> 이 문서에 `route.ts` 기반 핸들러를 추가로 기록한다.

## 구현된 서버 액션 (M1)

| 파일 | 함수 | 설명 | 인가 |
|---|---|---|---|
| `src/server/auth/actions.ts` | `loginAction` | 로그인, 역할별 홈 경로로 redirect | 공개 |
| | `registerAction` | 구매자 회원가입 | 공개 |
| | `logoutAction` | 세션 쿠키 삭제 | 로그인 필요 |
| `src/server/catalog/actions.ts` | `toggleWishlistAction` | 찜 추가/삭제 | 로그인 필요(내부 체크) |
| | `toggleFollowAction` | 생산자 팔로우 추가/삭제 | 로그인 필요(내부 체크) |
| `src/server/seller/actions.ts` | `submitSellerApplicationAction` | 입점 신청 생성/재신청 | 로그인 필요 |
| | `createProductAction` | 상품 등록(승인 여부로 상태 자동 분기) | SELLER + Seller 레코드 필요 |
| `src/server/admin/actions.ts` | `approveApplicationAction` | 입점 신청 승인 | ADMIN 이상(내부 재검증) |
| | `rejectApplicationAction` | 입점 신청 반려 | ADMIN 이상(내부 재검증) |
| `src/server/cart/actions.ts` | `addToCartAction` | 장바구니 담기(기존 있으면 +1) | 로그인 필요 |
| | `updateCartItemQuantityAction` | 수량 변경(0 이하면 삭제) | 로그인 + 본인 장바구니만 |
| | `removeCartItemAction` | 장바구니 항목 삭제 | 로그인 + 본인 장바구니만 |
| `src/server/orders/actions.ts` | `checkoutAction` | 장바구니→주문 생성(판매자별 Suborder 분리, 재고 차감, Mock Payment 생성) | 로그인 필요 |
| | `confirmMockPaymentAction` | Mock 결제 확인(Payment CONFIRMED, Order PAID) | 로그인 + 본인 주문만 |
| | `cancelOrderAction` | 주문 취소(재고 복구, Payment REFUNDED/FAILED 전이) | 로그인 + 본인 주문만 |
| `src/server/groupbuy/actions.ts` | `toggleGroupBuyAlertAction` | 오픈 알림 신청/해제(수요 집계 제외) | 로그인 필요 |
| | `joinGroupBuyAction` | 공동구매 참여(OPEN 단계만, 1인당 제한/최대수량 트랜잭션 내 재검증) | 로그인 필요 |
| | `createGroupBuyAction` | 판매자가 자신의 상품으로 공동구매 등록 | SELLER + 본인 상품만 |
| | `finalizeGroupBuyAction` | 마감 후 성사/미성사 확정, 미성사 시 자동 환불 | ADMIN 이상 |
| | `cancelGroupBuyAction` | 공동구매 강제 취소 + 자동 환불 | ADMIN 이상 |
| `src/server/media/actions.ts` | `uploadProductMediaAction` | 사진/영상 업로드(매직바이트 검증, 사진은 sharp로 재인코딩해 EXIF 제거) | 로그인 + 본인 상품만 |
| | `deleteProductMediaAction` | 미디어 삭제(DB+파일 모두 제거) | 로그인 + 본인 상품만 |
| | `setPrimaryMediaAction` | 대표사진 지정(sortOrder 교체) | 로그인 + 본인 상품만 |

## 읽기 전용 쿼리 (서버 컴포넌트에서 직접 호출)

- `src/server/catalog/queries.ts`: 카테고리/상품/찜/팔로우/스토어 조회
- `src/server/seller/queries.ts`: 판매자 본인 데이터 조회
- `src/server/admin/queries.ts`: 관리자 전체 데이터 조회

## 인가 이중 검증

1. 라우트 단: `src/proxy.ts`가 `/admin`, `/seller`, 구매자 개인화 경로를 보호.
2. 액션 단: 각 서버 액션 내부에서 `getSession()`(또는 admin 액션의 `requireAdmin()`)으로 재검증 —
   라우트 보호를 우회해 액션을 직접 호출하는 경우를 방어.

## M2에서 추가 예정

마스터 문서 14장의 REST 경로 목록(`/api/orders`, `/api/payments/mock/confirm` 등) 중 결제/웹훅처럼
서버 액션보다 route handler가 적합한 것은 M2에서 `src/app/api/**/route.ts`로 구현한다.
