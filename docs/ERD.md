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
```

## 설계 메모

- 모든 PK는 `cuid()` 사용.
- 금액은 `priceKrw Int`로 원화 정수 저장(문서 13장 데이터 무결성 원칙 — 부동소수점 금지).
- 찜/팔로우는 복합 유니크 제약으로 중복 생성을 DB 레벨에서 방지.
- `SellerApplication`은 재신청(REJECTED 이후) 시 같은 Seller에 새 레코드를 추가하는 구조 — 이력이 남는다.
- `Product.status`: `DRAFT`(미승인 판매자가 등록) / `ON_SALE`(승인된 판매자 또는 관리자 승인 후) / `IN_REVIEW` / `HIDDEN` / `SOLD_OUT`(후자 셋은 아직 전환 로직 미구현, 스키마만 존재).

## M2 이후 추가 예정 (마스터 문서 13장 전체 목록 중 미구현)

`carts`, `cart_items`, `orders`, `order_items`, `suborders`, `payments`, `refunds`,
`group_buys`, `group_buy_tiers`, `alert_subscriptions`, `notification_outbox`,
`fees`, `settlements`, `ledger_entries`, `reviews`, `questions`, `support_tickets`,
`ads`, `campaigns`, `banners`, `notices`, `policy_versions`, `audit_logs`, `feature_flags`,
`stock_reservations`.

## PostgreSQL 전환 시 체크리스트 (M2 착수 전)

1. `prisma/schema.prisma`의 `datasource.provider`를 `"sqlite"` → `"postgresql"`로 변경.
2. `.env.local`의 `DATABASE_URL`을 `postgresql://...@127.0.0.1:55432/tansaeng_marketplace_dev`로 교체.
3. `prisma migrate dev`로 마이그레이션 이력을 새로 시작(SQLite는 `db push`만 사용해 마이그레이션 파일이 없음).
4. seed 스크립트는 그대로 재사용 가능(Prisma Client API는 DB 종류에 무관).
