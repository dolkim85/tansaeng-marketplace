# ERD — 탄생 마켓플레이스 (M1 기준)

> 실제 스키마는 [`prisma/schema.prisma`](../prisma/schema.prisma)가 원본(source of truth)이다.
> 이 문서는 그 요약이며, 스키마 변경 시 함께 갱신한다.

## 현재 구현된 엔터티

```text
User (BUYER/SELLER/ADMIN/SUPER_ADMIN, 상태 PENDING/APPROVED/REJECTED/SUSPENDED)
 └─ 1:1 Seller (storeName, storeSlug, identityType)
      └─ 1:N SellerApplication (SUBMITTED/UNDER_REVIEW/APPROVED/REJECTED)
      └─ 1:N Product
            └─ 1:N ProductMedia (image|video) — 현재 레코드 없음(업로드 미구현)
 └─ 1:N Wishlist (User, Product) — @@unique(userId, productId)
 └─ 1:N SellerFollow (User, Seller) — @@unique(userId, sellerId)

Category (parentId로 자기참조, 트리 구조)
 └─ 1:N Product
      └─ 1:N CartItem, 1:N OrderItem

User
 └─ 1:1 Cart
      └─ 1:N CartItem (Product, quantity) — @@unique(cartId, productId)
 └─ 1:N Order (recipientName/Phone, addressLine 스냅샷, totalKrw, status)
      └─ 1:1 Payment (status, provider="mock")
      └─ 1:N Suborder (판매자별 분리, Seller 참조)
           └─ 1:N OrderItem (titleSnapshot/priceKrwSnapshot — 주문 시점 가격 고정, groupBuyId 선택)
 └─ 1:N GroupBuyAlert (User, GroupBuy) — @@unique(userId, groupBuyId), 수요 집계와 무관

Product
 └─ 1:1 GroupBuy (상품 1개당 공동구매 1건, targetQty/maxQty/perUserLimit/priceKrw/일정/status)
      └─ 1:N GroupBuyAlert
      └─ 1:N OrderItem(groupBuyId로 역참조) — 실제 결제 주문만 목표 수량에 집계
 └─ 1:N Review (OrderItem 1건당 1개, @@unique(orderItemId))
 └─ 1:N Ad (placement: SEARCH|CATEGORY_TOP|HOME_BANNER, status, impressions/clicks)
```

## 설계 메모

- 모든 PK는 `cuid()` 사용.
- 금액은 `priceKrw Int`로 원화 정수 저장(문서 13장 데이터 무결성 원칙 — 부동소수점 금지).
- 찜/팔로우는 복합 유니크 제약으로 중복 생성을 DB 레벨에서 방지.
- `SellerApplication`은 재신청(REJECTED 이후) 시 같은 Seller에 새 레코드를 추가하는 구조 — 이력이 남는다.
- `Product.status`: `DRAFT`(미승인 판매자가 등록) / `ON_SALE`(승인된 판매자 또는 관리자 승인 후) / `IN_REVIEW` / `HIDDEN` / `SOLD_OUT`(후자 셋은 아직 전환 로직 미구현, 스키마만 존재).
- `GroupBuy`(M2): DB의 `status`는 `SCHEDULED/SUCCEEDED/FAILED/CANCELLED` 4가지만 저장한다.
  화면에 보이는 티저/오픈/마감 단계는 `src/lib/groupBuyPhase.ts`가 `openAt`/`closeAt`과 현재 시각을
  비교해 그때그때 계산한다(별도 스케줄러/크론 없음). 목표 달성 집계는 `OrderItem.groupBuyId`로 연결된
  항목 중 **Payment가 CONFIRMED인 것만** 센다(알림 신청 `GroupBuyAlert`는 집계에서 완전히 제외).
  관리자가 "마감 처리"를 누르면 그 시점에 성사/미성사를 확정하고, 미성사·취소 시 관련 주문을 전부
  취소+환불 처리한다.
- `Ad`(M3): 실제 과금 없이 `impressions`/`clicks` 정수 카운터만 증가시키는 모의 광고. "활성" 여부는
  `status=APPROVED && startAt<=now<=endAt`로 화면에서 계산(`src/lib/adActive.ts`, 공동구매와 동일 패턴).
  클릭은 `/api/ads/[id]/click` 라우트 핸들러를 거쳐 집계 후 실제 상품 페이지로 307 리다이렉트된다.
- `Review`(M3): `Suborder.status`가 `COMPLETED`인 주문 항목에 한해 1건만 작성 가능(`@@unique(orderItemId)`).
  `Suborder.status`는 판매자가 직접 PENDING→PREPARING→SHIPPED→COMPLETED 순서로만 전진시킬 수 있다
  (역행/건너뛰기 불가, `src/server/orders/actions.ts`의 `NEXT_SUBORDER_STATUS` 참고).
- `Order`/`Suborder`/`OrderItem`/`Payment`(M2): 체크아웃 시 장바구니를 판매자별로 묶어 `Suborder`를 생성하고,
  `OrderItem`에 상품명/가격을 **스냅샷**으로 저장한다(이후 판매자가 가격을 바꿔도 과거 주문 금액은 불변).
  재고는 주문 생성 시 즉시 차감하고, 주문 취소 시 전부 복구한다(별도의 `stock_reservations` 타이머는 아직 미구현).
  `Payment.status`는 결제 전 `PENDING` → Mock 확인 시 `CONFIRMED` → 취소 시 `CONFIRMED`였다면 `REFUNDED`,
  아니었다면 `FAILED`로 전이한다.

## M2 이후 추가 예정 (마스터 문서 13장 전체 목록 중 미구현)

`group_buy_tiers`(가격 단계, 현재는 단일가만 지원), `alert_subscriptions`(공동구매 전용
`GroupBuyAlert`만 있고 가격변경/재입고 등 범용 알림 구독은 없음), `notification_outbox`,
`fees`, `settlements`, `ledger_entries`, `refunds`(현재는 Payment.status=REFUNDED로만 표현),
`reviews`, `questions`, `support_tickets`, `ads`, `campaigns`, `banners`, `notices`,
`policy_versions`, `audit_logs`, `feature_flags`, `stock_reservations`, `shipments`/송장 등록.

## PostgreSQL 전환 시 체크리스트 (M2 착수 전)

1. `prisma/schema.prisma`의 `datasource.provider`를 `"sqlite"` → `"postgresql"`로 변경.
2. `.env.local`의 `DATABASE_URL`을 `postgresql://...@127.0.0.1:55432/tansaeng_marketplace_dev`로 교체.
3. `prisma migrate dev`로 마이그레이션 이력을 새로 시작(SQLite는 `db push`만 사용해 마이그레이션 파일이 없음).
4. seed 스크립트는 그대로 재사용 가능(Prisma Client API는 DB 종류에 무관).
