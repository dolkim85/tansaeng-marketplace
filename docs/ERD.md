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
- `SupportTicket`/`SupportTicketMessage`(M3): 상품질문/주문문의/분쟁 3종을 같은 상태기계
  (`OPEN`→`ANSWERED`→`CLOSED`)와 메시지 스레드로 처리한다. `sellerId`는 조회 편의를 위한
  비정규화 필드로, 상품질문은 `product.sellerId`에서, 주문문의/분쟁은 사용자가 선택한
  주문 품목이 속한 `Suborder.sellerId`에서 생성 시점에 고정한다(한 주문에 판매자가 여럿이어도
  품목 단위로 정확히 한 판매자에게만 배정됨). `isPublic`은 `PRODUCT_QUESTION`에서만 의미가
  있고(공개 질문은 상품 상세페이지에 노출), 그 외 카테고리는 항상 비공개로 취급한다.
  `SupportTicketMessage.authorRole`은 작성 시점 역할의 스냅샷(이후 역할이 바뀌어도 이력이 안 바뀜).
- `Banner`/`Notice`/`Faq`(M3): 운영자 CMS 전용 테이블. `Banner`는 판매자가 신청하는 유료
  `Ad`(placement=HOME_BANNER)와 별개의 비과금 편집성 배너로, `isActive`인 것 중 `sortOrder`가
  가장 작은(우선순위 높은) 1건만 홈 화면에 노출된다(복수 노출/캐러셀 없음). `Notice`는
  `isPinned` 우선 → 최신순으로 정렬. `Faq`는 `/help`(구매자)와 `/admin/content`(운영자)가
  같은 테이블을 공유해 운영자가 추가/삭제한 내용이 즉시 양쪽에 반영된다.
- `Product.isProxyRegistered`/`proxy*`(M3, 대리등록): 운영자가 농가 대신 등록한 상품만 채워지는
  필드. 대리등록 상품은 판매자의 입점 승인 상태와 무관하게 항상 `DRAFT`로 생성되고,
  `approveApplicationAction`의 일괄 DRAFT→ON_SALE 전환 대상에서 **명시적으로 제외**되며,
  오직 `approveProxyProductAction`(관리자 전용)으로만 `ON_SALE`로 바뀐다 — "농가 동의 없는
  무단 게시 금지"(마스터 문서 10.3절)를 코드 레벨에서 강제하기 위함.
- `Settlement`/`Suborder.settlementId`(정산/대사, 마스터 문서 11.3절): 관리자가 "정산 실행"을
  누른 시점에 해당 판매자의 `COMPLETED`이면서 아직 어떤 배치에도 속하지 않은(`settlementId=null`)
  `Suborder`를 전부 모아 스냅샷(gross/commission/payout)을 만들고, 그 `Suborder`들을 즉시 해당
  `Settlement`에 연결한다 — 이후 새로 생성되는 주문만 다음 배치의 대상이 되어 이중 집계가
  구조적으로 불가능하다. `commissionRate`는 배치 생성 시점 값을 그대로 저장해, 이후 전역
  수수료율이 바뀌어도 과거 배치 금액은 바뀌지 않는다. 생성 직후 `PENDING`이며,
  관리자의 별도 승인 액션으로만 `APPROVED`(모의 지급 완료)로 전이한다.
- `/admin/analytics`(통계 대시보드): 별도 테이블 없이 `User`/`Order`/`Seller`/`GroupBuy`/`Ad`를
  요청마다 집계해서 보여준다(캐시/배치 집계 테이블 없음 — 공동구매 phase 계산과 동일한
  "저장 대신 그때그때 계산" 원칙). "거래액(GMV)"은 `Order.status=PAID` 합계 기준으로,
  `/admin/settlements`의 배송완료(COMPLETED) 기준 정산대상액과는 **정의가 다르므로** 두 숫자가
  일치하지 않을 수 있다(의도된 차이 — PRODUCT_DECISIONS.md 참고).
- `NotificationPreference`(관심 알림·수신설정): 거래 알림(주문/배송/정산 등)은 서비스 이용에
  필수라 끄는 옵션 없이 항상 발송 대상으로 간주하고, 이 테이블은 **광고성 정보 수신동의만**
  이메일/푸시 채널별로 저장한다(레코드가 없으면 전부 미동의로 간주). 공동구매 오픈 알림은
  이미 있던 `GroupBuyAlert`를 그대로 재사용(`/alerts`에서 신청/해제 모두 가능).
- `AuditLog`(관리자 작업이력): `targetType`/`targetId`는 **일반 String일 뿐 실제 FK가 아니다** —
  대상 레코드(예: 대리등록 삭제된 Product)가 나중에 삭제되어도 이력 자체는 영구히 남아야
  하기 때문. `action`은 고정 코드 문자열(`src/lib/auditLabels.ts`에서 화면 라벨로 매핑)이며,
  각 관리자 액션의 "성공 경로" 끝에서만 `logAdminAction()`을 호출한다(검증 실패로 반려된
  입력은 기록하지 않음). 문의 답변/종료처럼 구매자·판매자·관리자가 모두 호출할 수 있는
  액션은 호출자가 ADMIN일 때만 기록한다.
- `ProductContentBlock`(상세페이지 블록 에디터, 마스터 문서 8.2절): `content`는 블록 종류별로
  검증된 JSON 문자열만 저장(`src/lib/productBlocks.ts`의 zod 스키마). `IMAGE`/`VIDEO` 블록은
  새 업로드를 받지 않고 **이미 업로드된 `ProductMedia`의 id만 참조**(소유자/종류 일치 검증
  필수) — 매직바이트 검증·EXIF 제거 파이프라인을 그대로 재사용하기 위함. 렌더링은
  `dangerouslySetInnerHTML`을 전혀 사용하지 않는 `ProductBlocksView` 컴포넌트가 전담해
  React의 텍스트 자동 이스케이프에 의존한다(스크립트/HTML 삽입 구조적으로 불가능).
  블록이 1개 이상이면 공개 상품 상세페이지는 `Product.description`(기존 단순 텍스트) 대신
  블록을 렌더링한다(없으면 기존 방식으로 자연스럽게 폴백).
- `SellerCategoryPermission`(카테고리별 판매 허가, 마스터 문서 10.2절 5번): 입점 승인과
  **별개로** 카테고리마다 허가를 받아야 그 카테고리에 상품을 등록할 수 있다.
  `createProductAction`은 선택한 `categoryId`에 대해 `(sellerId, categoryId)` 복합 유니크로
  조회한 권한이 `APPROVED`가 아니면 **서버에서** 상품 생성을 거부한다(클라이언트의 카테고리
  선택지 필터링은 UX 편의일 뿐, 실제 방어는 서버 액션 내부에서 이루어짐 — UI를 우회해 다른
  카테고리 id를 강제로 제출해도 동일하게 차단됨을 E2E로 확인). `REJECTED` 상태는 재요청 시
  `upsert`로 다시 `PENDING`으로 되돌아간다. 대리등록(`createProxyProductAction`)은 관리자가
  직접 생성·승인하는 별도 흐름이라 이 검증에서 **제외**된다(PRODUCT_DECISIONS.md 참고).
- `Review`(M3): `Suborder.status`가 `COMPLETED`인 주문 항목에 한해 1건만 작성 가능(`@@unique(orderItemId)`).
  `Suborder.status`는 판매자가 직접 PENDING→PREPARING→SHIPPED→COMPLETED 순서로만 전진시킬 수 있다
  (역행/건너뛰기 불가, `src/server/orders/actions.ts`의 `NEXT_SUBORDER_STATUS` 참고).
- `Order`/`Suborder`/`OrderItem`/`Payment`(M2): 체크아웃 시 장바구니를 판매자별로 묶어 `Suborder`를 생성하고,
  `OrderItem`에 상품명/가격을 **스냅샷**으로 저장한다(이후 판매자가 가격을 바꿔도 과거 주문 금액은 불변).
  재고는 주문 생성 시 즉시 차감하고, 주문 취소 시 전부 복구한다(별도의 `stock_reservations` 타이머는 아직 미구현).
  `Payment.status`는 결제 전 `PENDING` → Mock 확인 시 `CONFIRMED` → 취소 시 `CONFIRMED`였다면 `REFUNDED`,
  아니었다면 `FAILED`로 전이한다.

## M2 이후 추가 예정 (마스터 문서 13장 전체 목록 중 미구현)

`group_buy_tiers`(가격 단계, 현재는 단일가만 지원), `alert_subscriptions`(공동구매 오픈 알림과
광고성 정보 수신동의는 구현했으나, 가격변경/재입고 등 그 외 알림 종류별 구독은 없음),
`notification_outbox`/`notification_logs`(실제 발송 로그/예약/재시도는 `/admin/notifications`
플레이스홀더에서 다룰 범위, 아직 미구현),
`fees`(품목/판매자/기간별 차등 요율 미구현, 전역 상수 `COMMISSION_RATE` 하나만 사용),
`ledger_entries`(불변 원장은 미구현, `Settlement`가 배치 단위 기록만 보존),
`refunds`(현재는 Payment.status=REFUNDED로만 표현), `campaigns`, `policy_versions`,
`audit_logs`, `feature_flags`, `stock_reservations`, `shipments`/송장 등록. 카테고리 구조
(`categories`)는 M1 시드로 고정된 3개(농산물/축산물/수산물)만 사용, 운영자용 트리 편집
UI는 미구현.
(`reviews`/`ads`/`support_tickets`/`banners`/`notices`/`settlements`는 구현 완료 —
각각 `Review`/`Ad`/`SupportTicket`/`Banner`/`Notice`/`Settlement`. FAQ는 마스터 문서에 별도
테이블로 명시되지 않았으나 같은 맥락으로 `Faq` 테이블을 추가.)

## PostgreSQL 전환 (2026-10-19, 완료)

SQLite에서 PostgreSQL 전용 인스턴스(`127.0.0.1:55432`, DB명 `tansaeng_marketplace_dev`)로
전환 완료. 설치부터 마이그레이션·시드·E2E 재검증까지 전부 마쳤다(`docs/PROGRESS.md`의
해당 항목 참고). 다른 환경에서 이 저장소를 새로 받아 세팅할 때는 아래 절차를 그대로 따른다.

```bash
# 1) PostgreSQL 설치(터미널에서 직접 실행 — sudo 비밀번호 입력 필요)
sudo apt update && sudo apt install -y postgresql

# 2) 전용 역할/DB 생성(기존 DB 계정·이름과 절대 겹치지 않게 새로 생성)
sudo -u postgres psql -c "CREATE ROLE tansaeng_dev WITH LOGIN PASSWORD 'tansaeng_dev_local_only';"
sudo -u postgres psql -c "CREATE DATABASE tansaeng_marketplace_dev OWNER tansaeng_dev;"

# 3) 포트를 프로젝트 컨벤션인 55432로 변경(기본 설치는 5432) — /etc/postgresql/16/main/postgresql.conf의
#    `port = 5432`를 `port = 55432`로 수정 후 `sudo systemctl restart postgresql`.
#    `listen_addresses`는 기본값(`localhost`, 즉 127.0.0.1만 바인딩)을 그대로 유지하면 된다.

# 4) 마이그레이션 적용 + 시드
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

이 프로젝트의 모든 도메인 로직(공동구매 재고 경쟁, 정산 집계 등)은 DB 종류에 무관하므로
위 4단계 외 추가 코드 변경은 필요하지 않았다 — 실제로 전환 전/후 `vitest`(39건)와
Playwright E2E(로그인·장바구니·주문·결제·관리자 CRUD·감사로그) 전부 동일하게 통과했다.
