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
| | `createProductAction` | 상품 등록(승인 여부로 상태 자동 분기, 선택한 카테고리에 대한 APPROVED 판매 허가 필수) | SELLER + Seller 레코드 필요 + 카테고리 판매 허가 |
| | `updateProductAction` | 상품 기본정보 수정(제목/카테고리/가격/재고/원산지/설명, slug는 불변, 카테고리 변경 시에도 APPROVED 판매 허가 필요) | 로그인 + 본인 상품만 + 카테고리 판매 허가 |
| | `updateSellerStoreAction` | 생산자 소개·배송 정책·반품 정책 수정(빈 값은 null로 저장해 공개 페이지에서 해당 섹션 숨김) | 로그인 + 본인 판매자만 |
| `src/server/platformSettings/actions.ts` | `updateCommissionRateAction` | 전역 중개수수료율 변경(다음 정산 배치부터 적용, 과거 배치는 생성 시점 값 유지) | ADMIN 이상 |
| `src/server/policyVersions/actions.ts` | `createPolicyVersionAction` | 약관/정책 새 버전 등록(수정·삭제 불가, append-only) | ADMIN 이상 |
| `src/server/notifications/log.ts` | `logNotification` | 모의 알림 발송 기록(헬퍼, 직접 호출 대상 아님 — 주문/배송/문의 답변 액션 내부에서 호출) | - |
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
| `src/server/orders/actions.ts` | `advanceSuborderStatusAction` | 배송상태 전진(PENDING→PREPARING→SHIPPED→COMPLETED) | 로그인 + 본인 Suborder만 |
| `src/server/reviews/actions.ts` | `createReviewAction` | 배송완료 주문 항목에 후기 작성(1건당 1개) | 로그인 + 본인 주문만 |
| `src/server/ads/actions.ts` | `requestAdAction` | 광고 신청(본인 상품만) | SELLER |
| | `approveAdAction` / `rejectAdAction` | 광고 심사 | ADMIN 이상 |
| `src/server/support/actions.ts` | `createProductQuestionAction` | 상품 질문 티켓 생성(공개/비공개 선택) | 로그인 필요 |
| | `createOrderTicketAction` | 주문문의/분쟁 티켓 생성(본인 주문의 품목 선택) | 로그인 + 본인 주문만 |
| | `replyTicketAction` | 답변/추가 메시지 등록(작성자가 작성자 본인이면 OPEN, 아니면 ANSWERED로 전이) | 티켓 당사자(구매자/배정판매자)+ADMIN 이상 |
| | `closeTicketAction` | 티켓 종료 | 티켓 당사자(구매자/배정판매자)+ADMIN 이상 |
| `src/server/content/actions.ts` | `createBannerAction` / `toggleBannerActiveAction` / `deleteBannerAction` | 홈 메인 배너 CRUD | ADMIN 이상 |
| | `createNoticeAction` / `deleteNoticeAction` | 공지사항 CRUD | ADMIN 이상 |
| | `createFaqAction` / `deleteFaqAction` | FAQ CRUD | ADMIN 이상 |
| `src/server/admin/actions.ts` | `createProxyProductAction` | 농가 대신 상품 대리등록(항상 DRAFT로 생성, 동의 확인 필수) | ADMIN 이상 |
| | `approveProxyProductAction` | 대리등록 상품 최종 승인(DRAFT→ON_SALE) | ADMIN 이상 |
| | `deleteProxyProductAction` | 승인 전 대리등록 상품 삭제 | ADMIN 이상 |
| `src/server/seller/actions.ts` | `stopSellingProductAction` / `resumeSellingProductAction` | 본인 상품(대리등록 포함) 판매중단/재개 | 로그인 + 본인 상품만 |
| `src/server/settlement/actions.ts` | `runSettlementAction` | 판매자의 미정산(COMPLETED) Suborder를 모아 정산 배치 생성(중복 집계 방지) | ADMIN 이상 |
| | `approveSettlementAction` | 정산 배치 승인(모의 지급 완료 처리) | ADMIN 이상 |
| `src/server/notifications/actions.ts` | `updateNotificationPreferenceAction` | 광고성 정보 수신동의(이메일/푸시) 저장 | 로그인 필요 |
| `src/server/audit/log.ts` | `logAdminAction` | 관리자 주요 작업이력 기록(헬퍼, 직접 호출 대상 아님) | - |
| `src/server/productBlocks/actions.ts` | `addBlockAction` | 상세페이지 블록 추가(종류별 콘텐츠 검증, IMAGE/VIDEO는 본인 상품의 기존 미디어만 참조) | 로그인 + 본인 상품만 |
| | `deleteBlockAction` | 블록 삭제 | 로그인 + 본인 상품만 |
| | `moveBlockAction` | 블록 순서 변경(인접 블록과 sortOrder 교환) | 로그인 + 본인 상품만 |
| `src/server/categoryPermissions/actions.ts` | `requestCategoryPermissionAction` | 카테고리별 판매 허가 요청(PENDING 생성, 반려 후 재요청 가능) | 로그인 + 본인 판매자만 |
| | `approveCategoryPermissionAction` / `rejectCategoryPermissionAction` | 카테고리 판매 허가 심사 | ADMIN 이상 |
| `src/server/categories/actions.ts` | `createCategoryAction` | 카테고리 생성(최상위 또는 최상위 카테고리 바로 아래 — 2단계까지만 허용) | ADMIN 이상 |
| | `renameCategoryAction` | 카테고리 이름 변경(slug는 불변) | ADMIN 이상 |
| | `deleteCategoryAction` | 카테고리 삭제(하위 카테고리·연결된 상품이 있으면 거부) | ADMIN 이상 |

## Route Handler

| 경로 | 설명 |
|---|---|
| `GET /api/ads/[id]/click` | 광고 클릭수 집계 후 실제 상품 페이지로 307 리다이렉트(공개, 인증 불필요) |

## 읽기 전용 쿼리 (서버 컴포넌트에서 직접 호출)

- `src/server/catalog/queries.ts`: 카테고리/상품/찜/팔로우/스토어 조회
- `src/server/seller/queries.ts`: 판매자 본인 데이터 조회
- `src/server/admin/queries.ts`: 관리자 전체 데이터 조회
- `src/server/analytics/queries.ts`: `getAdminAnalyticsSummary` — 거래액(GMV)/활성회원/전환율/
  공동구매 성사율/광고 CTR/최근 7일 가입·주문 추이를 실제 DB에서 집계(ADMIN 이상, `/admin/analytics`)
- `src/server/groupbuy/queries.ts`: `listMyGroupBuyAlerts` — 구매자가 신청한 공동구매 오픈
  알림 목록(`/alerts`)
- `src/server/notifications/queries.ts`: `getNotificationPreference` — 구매자 수신설정 조회
  (레코드 없으면 기본값: 전부 미동의)
- `src/server/audit/queries.ts`: `listAuditLogs` — 관리자 작업이력 최근 200건(ADMIN 이상,
  `/admin/audit`)
- `src/server/productBlocks/queries.ts`: `listProductBlocks` — 상품 상세페이지 블록 목록
  (sortOrder 순, `/products/[slug]` 및 `/seller/products/[id]/edit`에서 공용)
- `src/server/categoryPermissions/queries.ts`: `listCategoryPermissionsForSeller`(본인 현황,
  `/seller/onboarding`), `listApprovedCategoriesForSeller`(상품 등록 폼 선택지,
  `/seller/products/new`), `hasApprovedCategoryPermission`, `listAllCategoryPermissionsForAdmin`
  (`/admin/sellers`)
- `src/server/categories/queries.ts`: `listCategoryTreeForAdmin` — 최상위 카테고리마다 하위
  카테고리와 각 단계의 상품 개수를 포함(`/admin/content`, 삭제 가능 여부 판단용)
- `src/server/platformSettings/queries.ts`: `getPlatformSettings`/`getCommissionRate` —
  전역 운영 설정 싱글톤 조회(없으면 기본값으로 생성), 여러 화면(정산 생성/표시)에서 공용
- `src/server/policyVersions/queries.ts`: `listPolicyVersions` — 약관 버전 전체 이력
  (`/admin/settings`)
- `src/server/notifications/adminQueries.ts`: `listNotificationLogsForAdmin`(최근 200건),
  `getConsentSummary`(전체 회원 대비 광고성 정보 수신동의 집계) — `/admin/notifications`
- `src/server/groupbuy/queries.ts`의 `listScheduledGroupBuyAlertCounts` — 오픈예정
  공동구매별 알림 신청 건수(`/admin/notifications` "예약된 알림" 섹션용)

## 인가 이중 검증

1. 라우트 단: `src/proxy.ts`가 `/admin`, `/seller`, 구매자 개인화 경로를 보호.
2. 액션 단: 각 서버 액션 내부에서 `getSession()`(또는 admin 액션의 `requireAdmin()`)으로 재검증 —
   라우트 보호를 우회해 액션을 직접 호출하는 경우를 방어.

## M2에서 추가 예정

마스터 문서 14장의 REST 경로 목록(`/api/orders`, `/api/payments/mock/confirm` 등) 중 결제/웹훅처럼
서버 액션보다 route handler가 적합한 것은 M2에서 `src/app/api/**/route.ts`로 구현한다.
