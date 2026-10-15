# ARCHITECTURE — 탄생 마켓플레이스

> M2 시점 기준. 실제 구현이 진행될수록 갱신한다.

## 1. 경계 원칙

이 저장소(`/mnt/d/dev/tansaeng-marketplace`)는 기존 스마트팜 환경제어시스템 및
`www.tansaeng.com` 운영 서비스와 **코드/런타임/네트워크/DB/스토리지를 완전히 분리**한 독립 애플리케이션이다.
상세 근거는 [`SAFETY_BASELINE.md`](./SAFETY_BASELINE.md) 참조.

## 2. 논리 구성

```text
UI (Buyer / Seller / Admin, 반응형 + PWA)
  -> Next.js App Router (서버 컴포넌트 + 서버 액션)
     -> src/proxy.ts  (RBAC: /admin, /seller, 구매자 개인화 페이지 접근 제어)
     -> src/server/session.ts (쿠키 기반 세션 조회/발급)
     -> src/server/{auth,catalog,seller,admin,cart,orders,groupbuy}  (서버 전용 쿼리/액션)
        -> Prisma Client -> SQLite(M2 시점 유지) / PostgreSQL(M3 진입 전 전환 예정)
     -> src/server/media (sharp 재인코딩+매직바이트 검증) -> public/uploads/products/ (로컬 정적 서빙)
     -> Mock PG / Mock 알림 어댑터: 아직 미구현
```

## 3. 인증/세션 설계 (M1)

- NextAuth(Auth.js) 대신 **커스텀 세션**을 선택함: `bcryptjs`로 비밀번호 해시, `jose`로 서명한 JWT를
  httpOnly/SameSite=Lax 쿠키(`tansaeng_session`)에 저장. 이유는 `docs/PRODUCT_DECISIONS.md` 참고.
- `src/proxy.ts`(Next.js 16 신규 컨벤션, 구 `middleware.ts`)가 쿠키를 검증해 `/admin/*`은 `ADMIN|SUPER_ADMIN`,
  `/seller/*`는 `SELLER|ADMIN|SUPER_ADMIN`만 허용하고, 그 외 개인화 페이지(`/account`, `/wishlist` 등)는
  로그인만 요구한다.
- 서버 액션(`src/server/**/actions.ts`) 내부에서도 `getSession()`으로 재검증한다(화면 라우팅 보호와 별개로
  API/서버 단 권한 검사를 중복 적용 — 문서 2장 RBAC 원칙).

## 4. 현재 구현 상태 (M2)

- 로그인/회원가입/로그아웃, RBAC 라우트 보호 — 동작함(Playwright E2E로 검증).
- 카테고리/상품 목록·상세 — 실제 Prisma 쿼리로 렌더링.
- 찜(Wishlist)·팔로우(SellerFollow) — 토글 서버 액션 연결, 중복 방지(`@@unique`).
- 판매자 입점 신청(SellerApplication) 및 관리자 승인/반려 — 동작함.
- 판매자 상품 등록 — 승인 여부에 따라 `ON_SALE`/`DRAFT` 자동 분기.
- **장바구니 → 체크아웃 → Mock 결제 → 주문 취소**(재고 복구 포함) — 전부 동작함(E2E로 검증).
  판매자별 Suborder 분리, 상품명/가격 스냅샷 저장.
- **공동구매**(출하예정 티저 → 오픈 → 참여(Mock결제대기) → 결제확인 → 관리자 마감처리로
  성사/미성사 확정 → 미성사 시 자동 환불) — 전부 동작함(E2E로 검증). 스케줄러 없이
  `openAt`/`closeAt` 시각 비교로 단계를 계산(`src/lib/groupBuyPhase.ts`).
- **상품 사진/영상 업로드** — 동작함(E2E로 검증). 매직바이트로 실제 파일 포맷을 확인해
  위장 파일(HTML/SVG 등)을 거부하고, 사진은 `sharp`로 재인코딩하며 이 과정에서 EXIF 등
  메타데이터가 자동 제거된다. 저장 위치는 `public/uploads/products/{productId}/`(로컬
  전용, git에 커밋되지 않음 — M2 ARCHITECTURE §6 참고). 대표사진 지정/삭제 지원.
- 배송비/쿠폰/재고 예약 타이머/가격 단계(tiers) — **미구현**.
- 미디어 CDN/별도 객체 스토리지(MinIO 등) — **미구현**, 현재는 Next.js `/public` 정적 서빙.

## 5. 저장소 구조

```text
tansaeng-marketplace/
  src/app/                 라우트 (buyer, seller, admin, auth)
  src/components/          공통 UI(layout, catalog)
  src/features/            도메인별 기능 모듈 (추후)
  src/server/              auth, catalog, seller, admin, cart, orders, groupbuy, media — 서버 전용 쿼리/액션
  src/lib/                 공통 유틸(auth 토큰, currency, slug)
  src/proxy.ts             RBAC 라우트 보호
  prisma/                  schema.prisma(SQLite), seed.ts
  public/                  정적 자산, PWA manifest
  tests/                   단위 테스트(Vitest)
  docs/                    정책·안전기준·진행문서
  .env.example
  README.md
```

## 6. 외부 서비스 경계

| 외부 요소 | M2 상태 | 향후 계획 |
|---|---|---|
| DB | **SQLite 파일(`prisma/dev.db`)** | M3 진입 전 PostgreSQL(127.0.0.1:55432)로 전환 |
| 객체 스토리지 | **로컬 `/public/uploads/products/` 정적 서빙**(sharp 재인코딩, 매직바이트 검증) | 트래픽/운영 규모가 커지면 MinIO(Docker) 또는 클라우드 스토리지로 전환 검토 |
| 결제(PG) | 없음 | Mock PG 인터페이스, 실키 사용 금지 |
| 알림(SMS/카카오/푸시) | 없음 | Mock 발송 로그만, 실발송 금지 |
| 기존 스마트팜 MQTT/ESP32/Node-RED | 연결 안 함 | 연결 계획 없음(설계상 완전 분리) |
| 기존 운영 DB/서버 | 연결 안 함 | 연결 금지 |
