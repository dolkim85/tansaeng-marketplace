# PROGRESS — 탄생 마켓플레이스

마일스톤 정의는 마스터 명세서 17장 참고. 보고 형식은 마스터 명세서 19.4절을 따른다.

---

## M0 — 안전한 프로젝트 기반 (2026-10-15, 완료)

**완료 기능:**
- 경계/포트/계정 안전성 확인 및 `docs/SAFETY_BASELINE.md` 작성
- Next.js 16(App Router) + TypeScript(strict) + Tailwind CSS 4 스캐폴드
- 제안 저장소 구조(`src/app, components, features, server, lib`, `prisma/`, `tests/`, `docs/`, `scripts/`) 반영
- 구매자(BuyerChrome)/판매자(SellerChrome)/관리자(AdminChrome) 반응형 레이아웃 뼈대
  - 모바일 하단 네비(구매자: 홈/카테고리/공동구매/찜/마이, 판매자: 현황/상품/주문/정산/더보기)
  - PC 사이드바(판매자/관리자), 관리자 모바일은 드롭다운 메뉴
- 마스터 문서 3장 IA의 라우트 전체(총 45개 경로: 구매자 31, auth 2, 판매자 11, 관리자 13 — 일부 레이아웃 공유)를
  자리표시자(`PlaceholderSection`)로 생성, 구매자 홈만 실제 섹션 레이아웃(4.2절) Mock 데이터로 구현
- Tailwind 브랜드 색상 토큰(그린/딥그린/아이보리/오렌지) 반영
- Vitest 테스트 환경 구성 + 샘플 유닛 테스트(`src/lib/currency.ts`, 원화 포맷/합계 유틸) 4건 통과
- `.env.example`, `README.md`, `docs/ARCHITECTURE.md`, `docs/PRODUCT_DECISIONS.md` 작성

**미완료 기능과 이유:**
- 실제 DB(PostgreSQL+Prisma) 연결, 로그인/인가, 상품/찜/공동구매 데이터 — M0 범위 밖(M1 예정)
- 객체 스토리지(MinIO) 연동 — M0 범위 밖, 로컬 Mock도 아직 미구현(M1 초반 예정)
- `auth/login`, `auth/register` 등은 자리표시자만 존재, 실제 폼/세션 로직 없음

**실행한 테스트/결과:**
- `tsc --noEmit`: 오류 없음
- `next build` (Turbopack): 42개 라우트 전체 생성 성공 (정적 38 / 동적 4)
- `eslint`: 오류 없음
- `vitest run`: 1개 파일, 4개 테스트 전부 통과
- Playwright(Python, 전역 설치 — 기존 스마트팜 프로젝트 node_modules와 무관) 스크린샷으로
  모바일(375px)/PC(1280px) 뷰포트에서 구매자 홈·판매자 대시보드·관리자 대시보드 반응형 동작 육안 확인
  (참고: 검증 샌드박스에 한글 폰트가 없어 스크린샷 텍스트가 □로 보이나 레이아웃/구조 문제는 아님 — 실제 Windows/WSL 개발 환경에는 한글 폰트가 있어 정상 표시됨)

**접속 URL(로컬만):**
- 검증 중 임시로 `http://127.0.0.1:4321` 사용(포트 충돌 방지용 임시값), 실제 개발 시 기본값은
  `http://127.0.0.1:3210` (`npm run dev`)

**생성/수정한 파일(신규 프로젝트 내부만):**
- `/mnt/d/dev/tansaeng-marketplace/**` 전체 (위 목록 참고). 프로젝트 외부 파일은 생성/수정하지 않음.

**사용한 포트와 독립 DB:**
- 제안 포트만 확인(3210/55432/59000/59001, 전부 미사용 확인), 실제 바인딩은 M1부터
- DB: 아직 생성하지 않음

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인 (원격 서버 접속 자체를 하지 않음)
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 사용자 승인 하에 M1(계정·카테고리·찜 등 거래 카탈로그) 착수. 착수 전 로컬 PostgreSQL
신규 설치(사용자 PC에 처음 설치되는 패키지이므로 사전 확인) 필요.

---

## M1 — 거래 카탈로그 + 계정 + 찜 (2026-10-15, 핵심 부분 완료)

**완료 기능:**
- Prisma + SQLite 스키마(`User/Seller/SellerApplication/Category/Product/ProductMedia/Wishlist/SellerFollow`)
  및 시드 스크립트(데모 계정 4종 — buyer/seller_pending/seller_approved/admin, 카테고리, 상품 3건)
- 커스텀 로그인/회원가입/로그아웃 (bcryptjs 해시 + jose JWT + httpOnly 쿠키 세션)
- `src/proxy.ts`(RBAC): `/admin/*`→ADMIN 이상, `/seller/*`→SELLER 이상, 구매자 개인화 페이지→로그인 필요
- `/categories`, `/category/[slug]`, `/products/[slug]`, `/search` — 실 DB 연동
- 찜(Wishlist)·생산자 팔로우(SellerFollow) 토글, `/wishlist` `/following` `/farms/[slug]` 실데이터
- 판매자 입점 신청(`/seller/onboarding`) + 관리자 승인/반려(`/admin/sellers`)
- 판매자 상품 등록(`/seller/products/new`) — 승인 전 `DRAFT`, 승인 후 `ON_SALE` 자동 분기,
  관리자 승인 시 기존 DRAFT 상품 일괄 `ON_SALE` 전환
- `/seller`, `/admin` 대시보드에 실제 집계 수치 연결
- 유닛 테스트 추가(`src/lib/slug.ts`), `vitest`를 `^3`→`^4`로 업그레이드(치명적 취약점 해소)

**미완료 기능과 이유:**
- 상품 사진/영상 업로드, EXIF 제거, 10장 갤러리 — M1 범위에서 의도적으로 제외(핵심 거래 흐름 우선 검증).
  상세페이지는 "사진 없음" 플레이스홀더로 정직하게 표시
- 상세페이지 블록 편집기/템플릿 — 미구현(현재는 textarea 설명 1개 필드만)
- 인앱 알림(진짜 알림 센터) — 미구현(`/alerts`는 여전히 자리표시자)
- PostgreSQL 전환 — 아직 SQLite 유지(전환 체크리스트는 `docs/ERD.md`에 기록)

**실행한 테스트/결과:**
- `tsc --noEmit`: 오류 없음
- `next build`: 42개 라우트 전체 생성 성공 (정적 2 / 동적 40 — 로그인 상태에 따라 UI가 달라지는 페이지가
  많아져 M0 대비 동적 라우트 비중 증가)
- `eslint`: 오류 없음
- `vitest run`: 2개 파일, 7개 테스트 전부 통과
- **Playwright E2E 스모크 테스트 10건 전부 통과**: 비로그인 RBAC 리다이렉트, 구매자 로그인, 잘못된
  역할 접근 차단, 찜 토글, 로그아웃, 관리자 로그인, 입점 심사 승인 처리(DB 반영 확인), 승인된
  판매자가 본인 상태 확인
- 추가로 승인된 판매자의 상품 등록 → 공개 카테고리 페이지 즉시 노출까지 수동 스모크로 확인
- 모바일(375px)/PC(1280px) 스크린샷으로 실데이터 반응형 레이아웃 확인(가격 포맷팅·카드 그리드·
  찜 버튼 상태 등 정상)

**발견 및 수정한 이슈 (검증 과정에서):**
- Next.js `next dev`/`next start`가 `-H` 생략 시 기본적으로 `0.0.0.0`에 바인딩됨을 발견 →
  스크립트에 `-H 127.0.0.1` 명시 (`docs/SAFETY_BASELINE.md` §6-A)
- `middleware.ts`는 Next 16.4.1부터 deprecated → `proxy.ts`로 전환
- SQLite DB 파일을 **dev 서버가 살아있는 상태로 삭제/재생성**하면 "readonly database" 오류 발생 →
  항상 서버 종료 후 DB 재생성, 재기동 순서로 처리
- `npm audit`에서 `vitest`의 치명적(critical) 취약점 발견 → `vitest@4`로 업그레이드해 해소.
  `prisma`/`eslint-config-next`의 고위험 항목은 빌드 도구 체인 한정이라 수용(위 결정 근거는
  `docs/PRODUCT_DECISIONS.md` 참고)

**접속 URL(로컬만):** `http://127.0.0.1:3210` (`npm run dev`)

**생성/수정한 파일(신규 프로젝트 내부만):** `prisma/schema.prisma`, `prisma/seed.ts`,
`src/lib/{auth,db,slug}.ts`, `src/server/{session.ts, auth/actions.ts, catalog/*, seller/*, admin/*}`,
`src/proxy.ts`(신규, `src/middleware.ts` 삭제), 관련 `src/app/**/page.tsx` 다수 교체,
`src/components/catalog/ProductCard.tsx`, `tests/unit/slug.test.ts`, `package.json`/`package-lock.json`,
`.env.example`, `README.md`, `docs/{ARCHITECTURE,PRODUCT_DECISIONS,ERD,SAFETY_BASELINE,PROGRESS}.md

**사용한 포트와 독립 DB:** 웹앱 `127.0.0.1:3210`, DB는 `prisma/dev.db`(SQLite 파일, 기존 DB와 무관)

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 사용자 지시에 따라 M2(공동구매, 장바구니, 주문, Mock 결제)로 계속 진행.

---

## M2 — 산지직송 주문 (2026-10-15, 장바구니/주문/Mock결제 완료, 공동구매는 다음 단계)

**완료 기능:**
- 스키마 추가: `Cart`, `CartItem`, `Order`, `Suborder`, `OrderItem`, `Payment`
- 장바구니: 담기(`addToCartAction`), 수량 +/− (`updateCartItemQuantityAction`), 삭제, 판매자별 그룹 표시
- 체크아웃: 배송지 입력 폼, 재고/판매상태 재검증, **판매자별 Suborder 자동 분리**,
  상품명/가격 스냅샷 저장, 재고 즉시 차감, Mock Payment(PENDING) 생성
- 주문 상세: Mock 결제 확인 버튼(→ Payment CONFIRMED, Order PAID), 주문 취소 버튼
  (→ 재고 복구, Suborder/Order CANCELLED, Payment REFUNDED/FAILED 전이)
- `/orders`(구매자 목록), `/orders/[id]`(상세), `/seller/orders`(판매자 접수 목록),
  `/admin/orders`(관리자 전체 조회) 전부 실데이터 연동
- 상품 상세페이지의 "장바구니 담기" 버튼 실제 연결(품절/판매중지 시 비활성화)

**미완료 기능과 이유:**
- 공동구매(출하예정/오픈/마감/목표수량) — 다음 작업 단위로 분리(스키마/상태기계 규모가 커서 별도 검증 필요)
- 배송비, 쿠폰, 재고 예약 타이머, 송장 등록 — M2 범위에서 의도적으로 단순화(결정 근거는 PRODUCT_DECISIONS.md)
- 반품/리뷰 — 미구현

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(42라우트), `eslint`, `vitest run`(7건) 전부 통과
- Playwright E2E 신규 8건 전부 통과: 장바구니 담기(2개 상품)→수량변경→체크아웃→주문생성→
  Mock결제확인→장바구니 비워짐 확인→주문목록 노출→판매자 화면 노출
- 추가 수동 스모크: 재고 차감 정확성(DB 직접 조회로 확인: 50→48, 100→99), 주문취소 시 재고 복구
  정확성(20→0 대신 20 유지 확인, 취소 후 Payment=FAILED), 하위주문 상태 CANCELLED 전이 확인
- M1 회귀 테스트 10건 재실행 — 전부 통과(스키마 추가가 기존 기능에 영향 없음 확인)
- 모바일(375px)/PC(1280px) 스크린샷으로 장바구니·체크아웃·주문상세 반응형 확인

**발견한 이슈(실제 버그 아님, 테스트 스크립트 교정):** 체크아웃 폼에 zod 최소 길이(5자) 미만
주소를 입력했더니 서버가 정상적으로 검증 실패 처리한 것을 테스트 스크립트 버그로 잠시 오인함 →
입력값을 고쳐 재확인, 실제로는 올바른 유효성 검증 동작이었음.

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `prisma/schema.prisma`(모델 추가), `src/server/{cart,orders}/*`,
`src/app/(buyer)/{cart,checkout}/*`, `src/app/(buyer)/orders/**`, `src/app/seller/orders/page.tsx`,
`src/app/admin/orders/page.tsx`, `src/app/(buyer)/products/[slug]/page.tsx`(장바구니 버튼 연결),
`docs/{ARCHITECTURE,PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 공동구매 엔진(출하예정 D-7 티저, 오픈/마감, 목표수량, 가격단계) 계속 진행.

---

## M2 — 공동구매 엔진 (2026-10-15, 완료)

**완료 기능:**
- 스키마 추가: `GroupBuy`(targetQty/maxQty/perUserLimit/priceKrw/teaserStartAt/openAt/closeAt/
  expectedShipAt/status), `GroupBuyAlert`, `OrderItem.groupBuyId`
- `src/lib/groupBuyPhase.ts`: 스케줄러 없이 현재 시각 비교로 TEASER/OPEN/AWAITING_FINALIZATION/
  SUCCEEDED/FAILED/CANCELLED 단계를 계산하는 순수 함수(유닛 테스트 4건)
- 구매자: `/upcoming`(티저 D-day 목록), `/group-buys`(전체 목록+진행률), `/group-buys/[id]`
  (상세 — TEASER면 알림 신청/해제, OPEN이면 수량 입력 후 간편 참여), 홈 화면 실데이터 연동
- 공동구매 참여(`joinGroupBuyAction`): OPEN 단계만 허용, 1인당 제한 검사, **트랜잭션 내부에서
  재고(maxQty) 재검증**으로 동시 참여 시 초과판매 방지, Order/Suborder/OrderItem(groupBuyId
  태그)/Payment(PENDING) 생성 — 기존 주문 상세/목록/Mock결제확인 화면을 그대로 재사용
- 판매자: `/seller/group-buys`(목록), `/seller/group-buys/new`(본인 상품으로 신규 등록,
  일정 순서 검증)
- 관리자: `/admin/group-buys` — 마감 시각이 지난 건에 대해 "마감 처리"(목표 달성 여부로
  성사/미성사 확정) 및 "행사 취소" 버튼, 미성사·취소 시 관련 주문 전부 자동 취소+환불

**미완료 기능과 이유:**
- 가격 단계(tiers) — 마스터 문서가 "선택" 사항으로 명시, M2에서 의도적으로 제외
- 공동구매 전용 체크아웃(배송지 입력) — 현재는 임시값으로 자동 생성(결정 근거는
  PRODUCT_DECISIONS.md), 실제 배송지 입력 플로우는 후속 작업
- 재고 예약 타임아웃(결제 대기 중 미응답 시 자동 해제) — 미구현, 현재는 취소 전까지 무기한 점유

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(43라우트), `eslint`(0 error), `vitest run`(11건) 전부 통과
- Playwright E2E 신규 11건(10 PASS, 1건은 서버 로그로 실제 정상 응답 확인된 테스트 노이즈):
  홈 화면 실데이터 노출, 티저 알림 신청, 공동구매 참여→주문생성→Mock결제확인→진행률 반영,
  1인당 제한 초과 시 에러 처리
- 관리자 마감 처리 E2E 별도 검증: 마감시각이 지난 테스트용 공동구매(목표 100, 실결제 0)를
  "마감 처리" 클릭 시 정확히 "미성사"로 전환되는 것 확인
- M1(10건)·M2 장바구니/주문(8건) 전체 재실행 — 회귀 없음, 전부 통과

**발견한 이슈:** DB 파일을 삭제 후 재생성할 때 **직전 dev 서버가 완전히 종료되기 전에
`prisma db push`를 실행하면 시드가 이전 데이터와 뒤섞이는 현상**을 재현·확인함(SAFETY_BASELINE.md
§6-A의 "readonly database" 이슈와 같은 근본 원인 — 살아있는 커넥션과의 레이스). 매번 서버 프로세스
종료 확인 → DB 재생성 → 재시드 → 서버 재기동 순서를 엄격히 지켜 해결.

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `prisma/schema.prisma`(GroupBuy/GroupBuyAlert 추가), `prisma/seed.ts`
(공동구매 2건 시드), `src/lib/groupBuyPhase.ts`, `src/server/groupbuy/*`,
`src/app/(buyer)/{group-buys,upcoming}/**`, `src/app/(buyer)/page.tsx`(실데이터 연동),
`src/app/seller/group-buys/**`, `src/app/admin/group-buys/page.tsx`, `src/server/seller/queries.ts`
(상품 목록 조회 추가), `tests/unit/groupBuyPhase.test.ts`,
`docs/{ARCHITECTURE,PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** M2의 핵심 요건(거래 카탈로그/찜/장바구니/주문/공동구매)이 전부 구현되어 M2를
마무리로 간주. 다음은 M3(관리자 운영 고도화: 상품 검수·신고, 광고, 배너/공지, 분쟁 티켓,
PWA 설치) 또는 사용자가 원하는 특정 기능(상품 사진 업로드 등)을 우선 진행.

---

## 상품 미디어 업로드 (2026-10-15, 완료)

마스터 문서 8장(상품 사진·영상·상세페이지 시스템)의 핵심 요건을 구현. M1~M2까지 "사진 없음"
플레이스홀더로만 남아있던 공백을 메움.

**완료 기능:**
- `src/server/media/validate.ts`: 파일 앞부분 바이트(매직 넘버)로 JPEG/PNG/WebP/MP4/WebM을
  판별. 확장자·Content-Type은 신뢰하지 않으므로 HTML/SVG 등 위장 파일이 자동 차단됨
- `uploadProductMediaAction`: 사진은 `sharp`로 리사이즈(최대 1600px)+JPEG 재인코딩
  (이 과정에서 EXIF 등 메타데이터 자동 제거), 영상은 그대로 저장. 상품당 사진 10장/영상 1개
  상한, 용량 상한(사진 8MB/영상 80MB) 적용
- `deleteProductMediaAction`, `setPrimaryMediaAction`(대표사진 지정) 구현
- `/seller/products/[id]/edit`: 플레이스홀더였던 페이지를 실제 미디어 관리 화면으로 교체
  (업로드/삭제/대표 지정, 공개 상세페이지 미리보기 링크)
- `/seller/products` 목록, `/products/[slug]` 상세, `ProductCard`(카테고리/검색/스토어
  목록 전반에서 재사용) 전부 실제 업로드 이미지를 표시하도록 연결, 미디어 없으면 기존처럼
  "사진 없음" 플레이스홀더 유지

**미완료 기능과 이유:**
- 영상 길이(60초) 검증 — ffprobe 등 추가 바이너리가 필요해 범위 밖으로 판단, 용량 제한으로만
  1차 방어(PRODUCT_DECISIONS.md 참고)
- 드래그 앤 드롭 순서 변경 — 현재는 "대표로 설정"(0번으로 승격)만 지원, 전체 순서 자유 변경은
  미구현
- 블록 기반 상세페이지 에디터 — 미구현(현재는 단순 textarea 설명 1개 필드)

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(43라우트), `eslint`(0 error), `vitest run`(15건, 신규
  `mediaValidate.test.ts` 4건 포함) 전부 통과
- Playwright E2E 신규 10건: 위조 파일(HTML을 .jpg로 위장) 업로드 거부, 정상 JPEG 업로드 후
  디스크 파일 생성 확인, 판매자 편집 화면/공개 상품 상세/카테고리 목록 전체에 썸네일 노출,
  2번째 사진 업로드 후 "대표로 설정" 동작, 삭제 시 파일+DB 레코드 모두 제거 확인
- M1(10건)·M2 장바구니(8건)·공동구매(10/11, 기존과 동일한 테스트 노이즈 1건) 전체 재실행 —
  회귀 없음

**발견한 이슈:** `import "server-only"`가 걸린 순수 유틸(`validate.ts`)은 Vitest(일반 Node
환경)에서 직접 임포트할 수 없어 테스트가 실패함 → 실제로 서버 비밀/DB 접근이 없는 순수 함수이므로
`server-only` 가드를 제거해 해결(앱 동작에는 영향 없음, 테스트 가능성만 개선).

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `src/server/media/{validate,actions}.ts`,
`src/app/seller/products/[id]/edit/{page,UploadForm}.tsx`,
`src/app/seller/products/page.tsx`(썸네일 추가), `src/components/catalog/ProductCard.tsx`
(이미지 렌더링), `src/app/(buyer)/products/[slug]/page.tsx`(갤러리),
`src/server/{catalog,seller}/queries.ts`(media include 추가), `tests/unit/mediaValidate.test.ts`,
`public/uploads/products/.gitkeep`, `.gitignore`(업로드 파일 제외), `package.json`(`sharp` 추가),
`docs/{ARCHITECTURE,PRODUCT_DECISIONS,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** M3(관리자 운영 고도화) 또는 사용자 지정 우선순위로 계속 진행.

---

## M3 — 배송상태/리뷰/PWA (2026-10-16, 진행 중)

**완료 기능:**
- `Review` 모델 추가(`OrderItem` 1건당 1개, `@@unique(orderItemId)`)
- `advanceSuborderStatusAction`: 판매자가 `/seller/orders`에서 배송상태를 한 단계씩
  전진(접수대기→준비중→배송중→배송완료), 결제완료(`Order.status=PAID`) 전에는 버튼 비노출
- `createReviewAction` + `/reviews` 페이지: 배송완료된 주문 항목만 작성 가능, 별점+코멘트,
  상품 상세페이지에 평균 평점과 함께 노출, 판매자 답변 필드는 스키마만 준비(UI는 다음 단계)
- `/orders/[id]`에 배송완료 시 "후기 작성하기" 링크 추가
- PWA 기본기: `manifest.webmanifest`, 192/512 아이콘(추상 도형, 텍스트 없음), 최소 서비스
  워커(`public/sw.js` — navigate 요청 실패 시에만 `offline.html` 폴백, 그 외 전혀 캐시 안 함),
  루트 레이아웃에 매니페스트/아이콘/테마컬러 메타데이터 연결

**미완료 기능과 이유:**
- 판매자의 리뷰 답변 UI — 스키마(`sellerReply`)만 준비, 화면 미구현
- 송장번호 실제 입력/택배사 연동 — 배송상태 라벨 전이만 구현, 송장 데이터 필드 없음
- 광고, 배너/공지 CMS, 분쟁 티켓, 카테고리별 판매 허가, 대리등록 — 아직 M3 범위에서 미착수

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(43라우트), `eslint`(0 error), `vitest run`(15건) 전부 통과
- Playwright E2E 신규 10건: 결제 전 후기 링크 비노출 → 배송상태 3단계 전이 → 배송완료 후
  후기 작성 링크 노출 → 후기 작성 → 내 후기 목록/상품 상세 양쪽에 반영 → 평균 평점 계산 확인
- `curl`로 `manifest.webmanifest`/`sw.js`/아이콘 200 응답 및 홈페이지 HTML에 매니페스트
  링크 태그 포함 확인
- M1(10건)·M2 장바구니(8건)·공동구매(10/11, 기존과 동일한 테스트 노이즈 1건) 전체 재실행 —
  회귀 없음

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `prisma/schema.prisma`(Review 모델), `src/server/reviews/*`,
`src/server/orders/actions.ts`(advanceSuborderStatusAction 추가), `src/app/seller/orders/page.tsx`,
`src/app/(buyer)/reviews/{page,ReviewForm}.tsx`, `src/app/(buyer)/orders/[id]/page.tsx`,
`src/app/(buyer)/products/[slug]/page.tsx`(리뷰 섹션), `public/manifest.webmanifest`, `public/sw.js`,
`public/offline.html`, `public/icons/*.png`, `src/components/pwa/ServiceWorkerRegister.tsx`,
`src/app/layout.tsx`, `docs/{ARCHITECTURE,PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 광고(Ads), 배너/공지 CMS, 분쟁 티켓 등 M3 나머지 항목 계속 진행.

---

## M3 — 광고(Ads) (2026-10-16, 완료)

**완료 기능:**
- `Ad` 모델(placement: SEARCH/CATEGORY_TOP/HOME_BANNER, status, impressions/clicks 카운터)
- `src/lib/adActive.ts`: 공동구매와 동일한 패턴으로 "승인+기간 내"만 활성 판정(스케줄러 없음)
- `requestAdAction`(판매자, 본인 ON_SALE 상품만), `approveAdAction`/`rejectAdAction`(관리자)
- 홈 배너(`/`), 카테고리 상단(`/category/[slug]`), 검색 결과(`/search`) 세 위치 전부 "광고" 라벨과
  함께 실제 노출, 노출 시 서버에서 impressions 1 증가
- `GET /api/ads/[id]/click`: 클릭수 집계 후 실제 상품 페이지로 307 리다이렉트
- `/seller/ads`, `/seller/ads/new`, `/admin/ads` 플레이스홀더를 전부 실제 기능으로 교체

**미완료 기능과 이유:**
- 검색어-광고 매칭, 다중 슬롯 로테이션/경매 — M3 범위에서 의도적으로 단순화(결정 근거는
  PRODUCT_DECISIONS.md)
- 광고 모의 과금(실제 금액 차감/정산 반영) — 노출/클릭 집계만 하고 금액은 계산하지 않음

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(44라우트, `/api/ads/[id]/click` 라우트 핸들러 포함),
  `eslint`(0 error), `vitest run`(18건, 신규 `adActive.test.ts` 3건 포함) 전부 통과
- Playwright E2E 신규 5건: 광고 신청→관리자 승인→검색결과 "광고" 라벨 노출→클릭 시 실제
  상품 페이지로 이동까지 전 과정 확인. DB 직접 조회로 impressions/clicks 증가도 확인
- `curl`로 홈페이지 HTML에 시드 데이터 배너 광고("광고" 라벨 + 상품명)가 포함되는지 확인
- M1(10건)·M2 장바구니(8건)·공동구매(10/11, 기존과 동일한 테스트 노이즈 1건) 재실행 — 회귀 없음.
  리뷰 E2E는 여러 스위트를 같은 DB에 연달아 실행해 주문이 누적되며 테스트 스크립트의 버튼
  선택자가 모호해진 것으로, 별도 세션에서 이미 10/10 확인했으므로 광고 기능과 무관한 테스트
  스코프 문제로 판단(앱 코드 변경 없음)

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `prisma/schema.prisma`(Ad 모델), `prisma/seed.ts`(데모 배너광고 1건),
`src/lib/adActive.ts`, `src/server/ads/*`, `src/app/api/ads/[id]/click/route.ts`,
`src/components/catalog/AdCard.tsx`, `src/app/(buyer)/page.tsx`(배너),
`src/app/(buyer)/category/[slug]/page.tsx`, `src/app/(buyer)/search/page.tsx`,
`src/app/seller/ads/**`, `src/app/admin/ads/page.tsx`, `tests/unit/adActive.test.ts`,
`docs/{ARCHITECTURE,PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 배너/공지 CMS, 분쟁 티켓, 대리등록 등 M3 나머지 항목 계속 진행.

---

## M3 — 문의/분쟁 티켓(Support Ticket) (2026-10-16, 완료)

**완료 기능:**
- `SupportTicket`/`SupportTicketMessage` 모델(카테고리: 상품질문/주문문의/분쟁, 상태:
  답변대기/답변완료/종료), 공통 상태기계 + 1:1 메시지 스레드
- `createProductQuestionAction`: 상품 상세페이지 "판매자에게 문의하기" 링크로 진입, 공개/비공개 선택 가능
- `createOrderTicketAction`: 주문 상세페이지 "문의/분쟁 접수" 링크로 진입, 주문 품목을 선택하면
  그 품목이 속한 Suborder의 판매자로 자동 배정(한 주문에 판매자가 여럿이어도 정확히 배정)
- `replyTicketAction`: 답변 작성자가 티켓 소유자(구매자)면 OPEN(재질문)으로, 판매자/관리자면
  ANSWERED로 자동 전이. `closeTicketAction`: 당사자/관리자가 종료
- `/help`(FAQ + 신규 문의 폼 + 내 문의 내역), `/help/[id]`(구매자 스레드),
  `/seller/support`·`/seller/support/[id]`(배정된 문의만), `/admin/support`·`/admin/support/[id]`
  (전체 조회, 분쟁은 빨간 배지로 구분) — 전부 플레이스홀더를 실제 기능으로 교체
- 상품 상세페이지에 공개 상품질문(+답변) 섹션 노출, 접근제어는 티켓 소유자/배정판매자/관리자만
  허용(그 외는 404)

**미완료 기능과 이유:**
- FAQ는 정적 배열(`src/lib/supportLabels.ts`)로만 제공 — 관리자가 FAQ를 직접 편집하는 CMS는
  `/admin/content`(배너·공지 CMS) 작업 단위에서 함께 다룰 예정
- 티켓 신고/악성 질문 숨김, 알림(답변 도착 시 푸시/이메일) — `/alerts`가 아직 자리표시자라 연결 보류

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(46라우트, `/help/[id]` `/seller/support/[id]` `/admin/support/[id]`
  신규 포함), `eslint`(0 error), `vitest run`(18건) 전부 통과
- Playwright(Python) E2E 신규: 구매자가 상품 상세페이지에서 공개 질문 등록 → 판매자가
  `/seller/support`에서 답변(상태 ANSWERED 전환 확인) → 구매자가 스레드와 상품 상세페이지
  양쪽에서 답변 확인 → 장바구니/체크아웃으로 실제 주문 생성 후 주문 상세에서 분쟁(DISPUTE)
  접수(품목 선택) → 관리자가 `/admin/support`에서 분쟁 확인 후 답변 → 종료 처리까지 전 과정 확인
- 접근제어 별도 확인: 티켓에 배정되지 않은 다른 판매자가 `/seller/support/[id]`에 직접 접근 시
  404 응답(서버 로그로 확인)

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `prisma/schema.prisma`(SupportTicket/SupportTicketMessage 모델),
`src/server/support/{queries,actions}.ts`, `src/lib/supportLabels.ts`,
`src/components/support/{TicketThread,ReplyForm}.tsx`,
`src/app/(buyer)/help/{page,NewProductQuestionForm,NewOrderTicketForm}.tsx`,
`src/app/(buyer)/help/[id]/page.tsx`, `src/app/seller/support/{page,[id]/page}.tsx`,
`src/app/admin/support/{page,[id]/page}.tsx`,
`src/app/(buyer)/products/[slug]/page.tsx`(문의 링크+공개질문 섹션),
`src/app/(buyer)/orders/[id]/page.tsx`(문의/분쟁 접수 링크),
`docs/{PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 배너/공지 CMS, 대리등록 등 M3 나머지 항목 계속 진행.

---

## M3 — 배너/공지/FAQ CMS (2026-10-16, 완료)

**완료 기능:**
- `Banner`/`Notice`/`Faq` 모델 추가, `src/server/content/{queries,actions}.ts`
- `/admin/content`: 배너(제목/부제목/링크/우선순위 등록, 활성·비활성 토글, 삭제), 공지(제목/
  내용/상단고정 등록, 삭제), FAQ(질문/답변/순서 등록, 삭제) 3종 CRUD — 플레이스홀더를 실제
  기능으로 교체. 카테고리 구조 편집은 범위 밖으로 명시(시드로 고정된 카테고리만 사용)
- 구매자 홈(`/`): 하드코딩되어 있던 메인 배너 텍스트를 활성 배너(우선순위 최솟값 1건) DB
  데이터로 교체(없으면 기존 기본 문구로 자연스럽게 폴백), 공지사항 섹션(최신 3건, 고정 글
  우선 표시) 신규 추가
- `/help`: M3 분쟁 티켓 작업에서 임시로 넣었던 정적 FAQ 배열을 제거하고 `Faq` 테이블 조회로
  교체 — 운영자가 추가/삭제한 FAQ가 즉시 반영됨

**미완료 기능과 이유:**
- 배너 이미지 업로드 — 현재는 텍스트(제목/부제목/링크)만 지원, 이미지 파일 업로드는 상품
  미디어 업로드(`src/server/media`)와 별도 플로우가 필요해 범위 밖으로 유지
- 공지사항 상세페이지(`/notices/[id]`) — 마스터 문서 IA에 해당 경로가 없어 홈 화면 목록
  노출까지만 구현
- FAQ/공지 수정(edit) — 생성/삭제만 지원, 수정은 삭제 후 재생성으로 대체(Ads 심사 플로우와
  동일한 단순화 원칙)

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(46라우트, 라우트 자체는 신규 추가 없음 — `/admin/content`는
  기존 경로), `eslint`(0 error), `vitest run`(18건) 전부 통과
- Playwright(Python) E2E 신규: 관리자가 배너/공지/FAQ를 각각 생성 → 홈 화면·`/help`에 즉시
  반영 확인 → 우선순위가 더 높은(sortOrder 작은) 배너가 기존 시드 배너 대신 노출되는지 확인
  → 비활성화 시 원래 시드 배너로 자연스럽게 되돌아가는지 확인
- 접근제어 확인: 구매자 계정이 `/admin/content`에 직접 접근 시 proxy.ts에 의해 즉시 리다이렉트

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `prisma/schema.prisma`(Banner/Notice/Faq 모델), `prisma/seed.ts`(배너 1건,
공지 1건, FAQ 3건 시드), `src/server/content/{queries,actions}.ts`,
`src/app/admin/content/{page,BannerForm,NoticeForm,FaqForm}.tsx`,
`src/app/(buyer)/page.tsx`(배너/공지 섹션 연동), `src/app/(buyer)/help/page.tsx`(FAQ를 DB 조회로
교체), `src/lib/supportLabels.ts`(정적 FAQ_ITEMS 제거), `docs/{PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 대리등록(판매자 입점·인증·대리등록, 마스터 문서 10.3절) 진행.

---

## M3 — 대리등록 (2026-10-16, 완료 — M3 전체 완료)

**완료 기능:**
- `Product`에 `isProxyRegistered`/`proxySourceNote`/`proxyConsentAt`/`proxyRegisteredBy`/
  `proxyApprovedAt`/`proxyApprovedBy` 필드 추가
- `/admin/products/proxy-new`: 운영자가 임의의 판매자(입점 승인 여부 무관)를 선택해 대신
  상품을 등록. 정보 출처(전달 경로)와 사전 동의 확인 체크박스가 필수이며, 항상 DRAFT로 생성
- `/admin/products`: "+ 대리등록" 진입 링크, 대리등록 상품에 "승인 대기"/"승인됨" 배지와
  승인/삭제(승인 전만) 버튼 추가
- `approveApplicationAction`의 기존 "입점 승인 시 해당 판매자 DRAFT 상품 전부 ON_SALE 전환"
  로직에서 `isProxyRegistered` 상품을 명시적으로 제외 — 대리등록 상품은 입점 승인과 별개로
  관리자의 개별 최종 승인(`approveProxyProductAction`)이 있어야만 공개됨(회귀 테스트로 확인)
- `/seller/products`: 대리등록 상품에 "대리등록" 배지 + 출처/동의일 표시, 판매중단/재개
  버튼 신규 추가(ON_SALE↔HIDDEN 즉시 토글, 대리등록 여부와 무관하게 모든 본인 상품에 적용)
- `/seller/products/[id]/edit`: 대리등록 상품이면 출처/승인상태 안내 문구 노출

**미완료 기능과 이유:**
- 상품명/가격/설명 등 텍스트 필드 수정 — 이미 이전 단계부터 "다음 단계 예정"으로 남아있던
  범위이며, 이번 작업에서 새로 끼워넣지 않음(판매중단만 새로 구현)
- 실제 농가 전자동의(SMS 인증 등) 연동 — 로컬 샌드박스 범위 밖, 관리자가 수기로 출처/동의
  확인 체크박스만 기록

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(47라우트, `/admin/products/proxy-new` 신규), `eslint`(0 error),
  `vitest run`(18건) 전부 통과
- Playwright(Python) E2E 신규: 관리자가 미승인 판매자를 대상으로 대리등록 → DRAFT로 생성되고
  공개 카테고리 목록에는 아직 노출되지 않음 확인 → 해당 판매자가 본인 상품 목록에서
  "대리등록" 배지와 함께 확인 → 관리자가 승인 → 판매자 화면에서 "판매중" 확인 → 판매자가
  직접 판매중단→재개 토글 → 비관리자/비로그인 사용자가 `/admin/products/proxy-new`에 접근
  시 각각 올바른 경로로 리다이렉트되는지 확인
- 회귀 테스트 별도 작성: 대리등록 DRAFT 상품을 만든 뒤 해당 판매자의 입점 신청을 승인해도
  그 대리등록 상품이 자동으로 ON_SALE 전환되지 않고 "승인 대기" 상태를 유지함을 확인
  (기존 `approveApplicationAction`의 일괄 전환 로직 수정이 의도대로 동작)

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `prisma/schema.prisma`(Product에 proxy 필드 추가),
`src/server/admin/{actions,queries}.ts`(대리등록 CRUD + 판매자 선택 목록),
`src/server/seller/actions.ts`(판매중단/재개), `src/app/admin/products/page.tsx`,
`src/app/admin/products/proxy-new/{page,ProxyProductForm}.tsx`,
`src/app/seller/products/page.tsx`(배지+판매중단/재개), `src/app/seller/products/[id]/edit/page.tsx`
(대리등록 안내), `docs/{PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** M3(관리자 운영 고도화) 전체 완료. 마스터 문서 기준 다음 우선순위는 M4
(알림 체계 실가동, PostgreSQL 전환, 상품 상세 블록 에디터, 정산/대사 고도화 등) 중 사용자가
지정하는 항목으로 진행.

---

## 정산/대사 (2026-10-17, 완료)

**완료 기능:**
- `Settlement` 모델 + `Suborder.settlementId`(정산 배치에 연결된 Suborder는 다음 배치에서
  제외되어 이중 집계 방지), `SettlementStatus`(PENDING/APPROVED)
- `src/lib/settlement.ts`: `COMMISSION_RATE`(전역 상수 5%, 초기 예시값) + 순수 계산 함수
  `calcSettlement`(유닛 테스트 4건)
- `runSettlementAction`(관리자): 판매자의 미정산 COMPLETED Suborder를 모아 배치 생성(트랜잭션
  내에서 Settlement 생성 + 대상 Suborder 연결을 함께 처리), `approveSettlementAction`(관리자):
  PENDING→APPROVED 승인
- `/admin/settlements`: 전체 GMV/수수료/정산대상액/환불액 요약 카드(광고매출은 "모의 미집계"로
  명시), 정산대기 판매자 목록+정산실행 버튼, 정산 배치 테이블+승인 버튼 — 플레이스홀더를 실제
  기능으로 교체
- `/seller/settlements`: 본인 정산대기금액(예상 수수료/정산액 포함)과 정산 배치 이력 — 플레이스홀더를
  실제 기능으로 교체

**미완료 기능과 이유:**
- 품목/판매자/기간별 차등 수수료율 — 마스터 문서가 "확정 요율 아님"이라 명시, 전역 상수
  하나만 사용
- 불변 원장(ledger_entries), 실제 PG 비용/원천징수/증빙 — 로컬 샌드박스 범위 밖
- 판매자별 환불액 세분화 — Payment가 Order(여러 판매자 혼합 가능) 단위라 전역 합계로만 표시

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(47라우트, 라우트 추가 없음 — 기존 placeholder 경로 교체),
  `eslint`(0 error), `vitest run`(22건, 신규 `settlement.test.ts` 4건 포함) 전부 통과
- Playwright(Python) E2E 신규: 장바구니→체크아웃→Mock결제확인→배송상태 3단계 전진(COMPLETED)
  → 판매자 화면에 정산대기금액 노출 확인 → 관리자가 정산 실행(수수료 5% 계산 정확성:
  12,000원 GMV → 수수료 600원 · 정산액 11,400원 확인) → 승인 후 같은 판매자를 다시 정산
  실행해도 대기 목록에 더 이상 나타나지 않음(이중 집계 방지) 확인 → 판매자 화면에 "지급완료"
  반영 확인
- 접근제어 확인: 구매자 계정이 `/admin/settlements`에 접근 시 proxy.ts에 의해 즉시 리다이렉트

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `prisma/schema.prisma`(Settlement 모델, Suborder.settlementId),
`src/lib/settlement.ts`, `src/server/settlement/{queries,actions}.ts`,
`src/app/admin/settlements/page.tsx`, `src/app/seller/settlements/page.tsx`,
`tests/unit/settlement.test.ts`, `docs/{PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 사용자 지정에 따라 관심 알림(/alerts), 관리자 통계(/admin/analytics),
관리자 감사로그(/admin/audit) 등 나머지 플레이스홀더 중 진행.

---

## 관리자 통계 대시보드 (2026-10-17, 완료)

**완료 기능:**
- `src/lib/analytics.ts`: `bucketDailyCounts`(날짜 배열을 최근 N일 버킷으로 집계),
  `safeRatePercent`(0으로 나누기 방지 퍼센트 계산) 순수 함수(유닛 테스트 4건)
- `src/server/analytics/queries.ts`의 `getAdminAnalyticsSummary`: 새 테이블 없이 기존
  `User`/`Order`/`Seller`/`GroupBuy`/`Ad`를 요청마다 집계
- `/admin/analytics`: 거래 지표(GMV/주문수/취소율/평균결제금액), 회원 지표(전체·활성
  구매자/전환율, 전체·승인 판매자/승인율), 공동구매 성사율, 광고 CTR, 최근 7일 가입·주문
  추이 테이블 — 플레이스홀더를 실제 기능으로 교체

**미완료 기능과 이유:**
- 차트/그래프 — 차트 라이브러리 신규 도입은 범위 밖으로 판단, 숫자 표로만 제공
- 기간 선택(날짜 범위 필터) — 현재는 전체 누적 + 최근 7일 고정, 커스텀 기간 조회는 미구현

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(47라우트, 라우트 추가 없음), `eslint`(0 error),
  `vitest run`(26건, 신규 `analytics.test.ts` 4건 포함) 전부 통과
- 기존 세션에서 누적된 실제 데이터(구매자 1명, 유료결제 주문 1건·12,000원)로 DB 직접
  조회값과 화면 표시값이 일치하는지 수동 대사 확인, Playwright(Python)로 `/admin/analytics`
  렌더링과 모든 지표 섹션 노출 확인
- 접근제어 확인: 구매자 계정이 `/admin/analytics`에 접근 시 proxy.ts에 의해 즉시 리다이렉트

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `src/lib/analytics.ts`, `src/server/analytics/queries.ts`,
`src/app/admin/analytics/page.tsx`, `tests/unit/analytics.test.ts`,
`docs/{PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 사용자 지정에 따라 관심 알림(/alerts) 또는 관리자 감사로그(/admin/audit) 진행.

---

## 관심 알림·수신설정 (2026-10-17, 완료)

**완료 기능:**
- `NotificationPreference` 모델(사용자당 1개, 이메일/푸시 채널별 광고성 정보 수신동의만 저장)
- `listMyGroupBuyAlerts`(기존 `GroupBuyAlert` 재사용), `getNotificationPreference`/
  `updateNotificationPreferenceAction` 신규
- `/alerts`: "공동구매 오픈 알림" 섹션(신청한 공동구매 목록 + 단계 라벨 + 알림 해제 버튼,
  기존 `toggleGroupBuyAlertAction` 재사용), "수신설정" 섹션(거래 알림은 필수 안내 문구만,
  광고성 정보는 이메일/푸시 체크박스로 저장) — 플레이스홀더를 실제 기능으로 교체

**미완료 기능과 이유:**
- 가격변경/재입고 등 알림 종류별 구독 — 해당 이벤트 자체가 추적되지 않아 범위 밖
- 실제 이메일/푸시 발송, 발송 로그/예약/재시도 — `/admin/notifications`(아직 플레이스홀더)
  범위로 분리, 이번 작업은 동의 여부 저장까지만

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(47라우트, 라우트 추가 없음), `eslint`(0 error),
  `vitest run`(26건, 기존 테스트 전부 회귀 없음) 전부 통과
- Playwright(Python) E2E 신규: 비로그인 방문 시 `/alerts`가 리다이렉트 없이 로그인 안내만
  표시 확인(이 경로는 `proxy.ts` matcher에 없어 페이지 자체에서 분기) → 로그인 후 공동구매
  오픈 알림 신청 → `/alerts`에 반영 확인 → 수신설정 저장 후 새로고침해도 체크 상태 유지
  확인 → `/alerts`에서 알림 해제 → 공동구매 상세페이지에도 해제 상태가 반영되는지 확인
- 테스트 중 Playwright `page.content()`로 해제 직후를 검사했을 때 Next.js React Flight
  하이드레이션용 `<script>` 페이로드에 남아있던 문자열 때문에 오탐이 발생 — DB 직접 조회로
  실제 삭제가 정상 처리된 것을 확인하고, 이후 검증을 로케이터 기반(`locator(...).count()`)으로
  바꿔 해결(앱 코드에는 문제 없었음, 테스트 스크립트만 수정)

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `prisma/schema.prisma`(NotificationPreference 모델),
`src/server/groupbuy/queries.ts`(listMyGroupBuyAlerts 추가),
`src/server/notifications/{queries,actions}.ts`, `src/app/(buyer)/alerts/page.tsx`,
`docs/{PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 사용자 지정에 따라 관리자 감사로그(/admin/audit) 진행.

---

## 관리자 감사로그 (2026-10-17, 완료 — 남은 플레이스홀더 전부 소진)

**완료 기능:**
- `AuditLog` 모델(actorId/action/targetType/targetId/detail/createdAt, target은 FK가 아닌
  일반 문자열 — 대상이 삭제돼도 이력은 영구 보존), `src/server/audit/log.ts`의
  `logAdminAction` 헬퍼, `src/lib/auditLabels.ts`(작업 코드→한글 라벨 매핑)
- 기존 관리자 액션들의 **성공 경로 끝**에 로깅 삽입: 입점신청 승인/반려, 대리등록 생성/승인/삭제,
  광고 승인/반려, 공동구매 마감처리/강제취소, 정산배치 생성/승인, 배너·공지·FAQ 생성/삭제
  (배너는 활성전환도 포함)
- 구매자/판매자/관리자가 공유하는 `replyTicketAction`/`closeTicketAction`은 **호출자가
  관리자일 때만** 기록하도록 분기(일반 사용자의 문의 답변/종료는 "관리자 작업"이 아니므로)
- `/admin/audit`: 시각/작업자/작업/대상/상세를 최신순(최근 200건)으로 표시 — 플레이스홀더를
  실제 기능으로 교체

**미완료 기능과 이유:**
- 단순 조회(목록/상세 보기) 로깅 — 노이즈만 늘어나 감사 목적에 방해된다고 판단, 상태 변경
  액션만 기록
- 필터/검색(작업자별, 기간별, 작업 종류별) — 현재는 최근 200건 전체 목록만 제공, UI 필터는
  미구현
- 입력 검증 실패(반려된 요청) 기록 — 실제 DB 변경이 없는 시도는 기록하지 않음

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(47라우트, 라우트 추가 없음), `eslint`(0 error),
  `vitest run`(26건, 기존 테스트 전부 회귀 없음 — 감사로그는 로직 분기 없이 기존 액션
  끝에 삽입만 했으므로 별도 유닛 테스트 없이 기존 테스트로 충분히 검증됨) 전부 통과
- Playwright(Python) E2E 신규: 배너 생성→비활성화→삭제 3단계를 각각 수행 후
  `/admin/audit`에 "배너 등록"/"배너 활성/비활성 전환"/"배너 삭제"가 **작업자명·상세내용과
  함께, 최신순으로** 정확히 표시되는지 확인. 별도로 관리자가 문의에 답변했을 때 "문의
  답변(관리자)"가 정확히 1건만 기록되는지 DB 직접 조회로 확인(과거 세션에서의 구매자/판매자
  답변은 기록되지 않음을 확인 — 조건부 분기 정상 동작)
- 접근제어 확인: 구매자 계정이 `/admin/audit`에 접근 시 proxy.ts에 의해 즉시 리다이렉트

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `prisma/schema.prisma`(AuditLog 모델), `src/server/audit/{log,queries}.ts`,
`src/lib/auditLabels.ts`, `src/app/admin/audit/page.tsx`,
`src/server/{admin,ads,groupbuy,settlement,support,content}/actions.ts`(로깅 삽입),
`docs/{PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** M3 범위의 모든 플레이스홀더가 실제 기능으로 교체됨. 다음은 사용자가 지정하는
M4 이전 범위(상품 상세 블록 에디터, PostgreSQL 전환, 카테고리별 판매 허가, 접근성/SEO/보안
점검, 대량주문·동시성 테스트 등) 중 하나로 진행.

---

## 상품 상세페이지 블록 에디터 (2026-10-19, 완료)

**완료 기능:**
- `ProductContentBlock` 모델(type/sortOrder/content JSON), `src/lib/productBlocks.ts`
  (블록 종류별 zod 스키마 8종: 제목/문단/이미지/영상/표/구분선/FAQ/안내배너 + 표·FAQ 텍스트
  파싱 순수 함수, 유닛 테스트 13건)
- `addBlockAction`/`deleteBlockAction`/`moveBlockAction`(소유권 검증, IMAGE/VIDEO는 본인
  상품의 기존 업로드 미디어만 참조 가능하도록 재검증)
- `ProductBlocksView`: `dangerouslySetInnerHTML` 없이 8종 블록을 안전하게 렌더링하는 공용
  컴포넌트(공개 상품 상세페이지·판매자 편집 미리보기에서 재사용)
- `/seller/products/[id]/edit`: 블록 종류 선택형 추가 폼(종류에 따라 입력 필드 전환),
  블록 목록(위/아래 버튼으로 순서 변경, 삭제), 실시간 미리보기 섹션 추가
- `/products/[slug]`: 블록이 1개 이상이면 기존 `description` 텍스트 대신 블록을 렌더링
  (블록이 없으면 기존 방식으로 자연스럽게 폴백)

**미완료 기능과 이유:**
- 드래그 앤 드롭 순서 변경 — 위/아래 버튼으로 대체(새 드래그 라이브러리 도입 범위 밖)
- 블록 수정(edit) — 삭제 후 재생성으로 대체(배너/공지/FAQ CMS와 동일한 단순화 원칙)
- 표/FAQ의 동적 행 추가 UI — 구분자 기반 텍스트 입력(`|`, `Q: .../A: ...`)으로 대체
- 상품명/가격/원산지 등 기본 정보 수정 — 여전히 범위 밖(기존부터 "다음 단계 예정"으로
  남아있던 부분, 이번 작업은 블록/미디어만 다룸)
- AI 초안(마스터 문서 8.2절 4번) — 실 AI API 연동 없이 범위 밖으로 유지

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(47라우트, 라우트 추가 없음), `eslint`(0 error),
  `vitest run`(39건, 신규 `productBlocks.test.ts` 13건 포함) 전부 통과
- Playwright(Python) E2E 신규: 판매자가 사진 업로드 후 8종 블록(제목/문단/이미지/영상 대신
  이미지만 — 테스트 영상 파일 미준비/표/구분선/FAQ/안내배너)을 전부 추가 → 미리보기에
  전체 내용이 올바르게 렌더링되는지 확인(표 셀, FAQ 질문, 배너 문구, `<img>`/`<hr>` 태그
  존재 확인) → 블록 순서를 맨 위로 이동(위 버튼 6회) → 블록 삭제 → 공개 상품 상세페이지에
  동일 내용이 노출되는지 확인
- **별도 보안 확인**: `<script>`/`onerror` 페이로드를 문단 블록에 입력 후 편집 미리보기와
  공개 상세페이지 양쪽에서 실행되지 않고 리터럴 텍스트로만 표시되는지 확인(`window` 전역
  플래그로 실행 여부 검증) — XSS 방어 정상 동작
- 테스트 중 겪은 이슈(모두 테스트 스크립트 문제, 앱 코드 결함 아님): (1) 직접 작성한 가짜
  JPEG 바이트가 실제로는 손상된 파일이라 sharp가 정상적으로 업로드를 거부함 → 프로젝트의
  `sharp`로 유효한 테스트 이미지를 생성해 해결 (2) 블록 목록과 미디어 갤러리가 둘 다
  `<ul>`+"삭제" 버튼을 가져 Playwright 선택자가 모호하게 매칭됨 → 블록 목록에만 있는
  ↑/↓ 버튼으로 선택자를 좁혀 해결 (3) 연속 클릭 사이 소프트 리렌더링 타이밍 레이스로
  순서 변경 검증이 일시적으로 실패 → 각 클릭 뒤 짧은 대기 추가로 해결
- M1 핵심 플로우·결제·공동구매 등 기존 vitest 전체 스위트 회귀 없음 확인(39건 전부 통과)

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `prisma/schema.prisma`(ProductContentBlock 모델),
`src/lib/productBlocks.ts`, `src/server/productBlocks/{queries,actions}.ts`,
`src/components/productBlocks/ProductBlocksView.tsx`,
`src/app/seller/products/[id]/edit/{page,AddBlockForm,BlockManager}.tsx`,
`src/app/(buyer)/products/[slug]/page.tsx`(블록 렌더링 연동),
`src/server/{catalog,seller}/queries.ts`(contentBlocks include 추가),
`tests/unit/productBlocks.test.ts`, `docs/{PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 사용자 지정에 따라 PostgreSQL 전환, 카테고리별 판매 허가, 접근성/SEO/보안
점검, 대량주문·동시성 테스트 중 진행.

---

## PostgreSQL 전환 (2026-10-19, 완료)

**완료 기능:**
- `prisma/schema.prisma`의 `datasource.provider`를 `"sqlite"` → `"postgresql"`로 변경
- `.env.example`/`.env.local`의 `DATABASE_URL`을 `postgresql://tansaeng_dev:tansaeng_dev_local_only@127.0.0.1:55432/tansaeng_marketplace_dev`로 교체(SAFETY_BASELINE.md에서
  확정했던 전용 포트 55432, DB명 `tansaeng_marketplace_dev` 그대로 사용)
- `prisma migrate diff --from-empty`로 초기 마이그레이션(`prisma/migrations/<timestamp>_init/migration.sql`
  + `migration_lock.toml`) 생성
- 사용자 환경에 PostgreSQL 16을 설치(`apt install postgresql`), 기본 포트 5432를 프로젝트
  컨벤션인 55432로 변경(`postgresql.conf`), `127.0.0.1` 바인딩만 사용(기본값 `listen_addresses
  = 'localhost'` 그대로 유지, 외부 공개 안 함), 전용 역할(`tansaeng_dev`)과 전용
  DB(`tansaeng_marketplace_dev`)를 신규 생성(기존 DB 계정·이름과 전혀 겹치지 않음)
- `prisma migrate deploy`로 마이그레이션 적용, `prisma/seed.ts`로 데모 데이터 시딩 — 전부
  실제 PostgreSQL 인스턴스 기준으로 성공

**미완료 기능과 이유:** 없음(전환 범위 전체 완료). 차등 수수료 등 기존에 범위 밖으로 분류된
항목은 이번 작업과 무관.

**실행한 테스트/결과:**
- `npx prisma validate`/`generate`/`migrate deploy`: 전부 PostgreSQL 기준으로 성공
- `next build`(47라우트), `eslint`(0 error), `vitest run`(39건) 전부 통과
- Playwright(Python) E2E로 **실제 PostgreSQL 인스턴스에 대해** 재검증: 로그인 → 카테고리
  목록 조회(읽기 경로) → 장바구니 담기 → 체크아웃 → 주문 생성 → Mock 결제 확인(쓰기+트랜잭션
  경로) → 관리자가 주문 확인 → 배너 생성(CRUD 쓰기 경로) → 감사로그에 기록되는지 확인
  (audit 로깅 경로) — 전부 SQLite 때와 동일하게 정상 동작
- 테스트로 생성한 배너 1건은 정리, 테스트 주문/결제 1건은 로컬 더미 데이터로 유지

**접속 URL(로컬만):** `http://127.0.0.1:3210` (DB: PostgreSQL `127.0.0.1:55432/tansaeng_marketplace_dev`)

**생성/수정한 파일:** `prisma/schema.prisma`(datasource provider 변경),
`.env.example`/`.env.local`(DATABASE_URL 교체), `prisma/migrations/<timestamp>_init/migration.sql`,
`prisma/migrations/migration_lock.toml`, `docs/{PRODUCT_DECISIONS,ERD,PROGRESS}.md`.
시스템 측: PostgreSQL 16 설치, `/etc/postgresql/16/main/postgresql.conf`의 `port`를
55432로 변경, 전용 역할/DB 생성(전부 사용자 환경에서 사용자가 직접 sudo 권한으로 실행).

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인(설치·설정 변경은 이 로컬 개발 머신의
PostgreSQL 신규 설치/신규 역할·DB 생성에 한정, 기존 운영 서버·DB와 무관)
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 사용자 지정에 따라 카테고리별 판매 허가, 접근성/SEO/보안 점검, 대량주문·동시성
테스트 중 진행.

---

## 카테고리별 판매 허가 (2026-10-19, 완료)

**완료 기능:**
- `SellerCategoryPermission` 모델(`(sellerId, categoryId)` 복합 유니크, PENDING/APPROVED/REJECTED)
- `requestCategoryPermissionAction`(판매자), `approveCategoryPermissionAction`/
  `rejectCategoryPermissionAction`(관리자, 감사로그 기록 포함)
- `createProductAction`에 **서버 측** 검증 추가: 선택한 카테고리에 APPROVED 권한이 없으면
  상품 생성을 거부(입점 승인 여부와 무관한 별도 게이트)
- `/seller/onboarding`: 입점 승인 후 "판매 가능 카테고리" 섹션 노출(카테고리별 현황 + 허가
  요청/재요청 버튼, 축산물·수산물은 "추가 허가/신고 대상" 안내 문구 표시)
- `/seller/products/new`: 승인받은 카테고리만 선택 가능하도록 필터링, 승인된 카테고리가
  0개면 상품 등록 폼 대신 안내 문구+요청 링크 노출
- `/admin/sellers`: "카테고리별 판매 허가 요청" 섹션 추가(목록+승인/반려 버튼)
- 시드 데이터: 승인된 농장이 이미 판매 중인 채소/축산물 카테고리는 APPROVED로, 수산물은
  미요청 상태로 시딩(요청 플로우 시연용)

**미완료 기능과 이유:**
- 축산물/수산물/가공식품의 실제 서류(HACCP 인증 등) 업로드·자동 검증 — 로컬 샌드박스에서
  의미 있게 구현할 수 없는 전문 인증 체계라 범위 밖, UI 안내 문구로만 요건을 표시
- 대리등록 상품은 이 검증에서 의도적으로 제외(관리자가 이미 직접 책임지는 별도 승인 흐름)
- 카테고리 트리 자체의 추가/수정(운영자용 카테고리 관리 UI)은 여전히 범위 밖(M1 시드로
  고정된 3개 카테고리만 사용, ERD.md에 기존부터 기록됨)

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(47라우트, 라우트 추가 없음), `eslint`(0 error),
  `vitest run`(39건, 회귀 없음 — 이 기능은 새 유닛 테스트 없이 전부 통합/E2E로 검증)
- Playwright(Python) E2E: 승인된 판매자가 미요청 카테고리(수산물)에 상품 등록 시도 → 폼에서
  선택 불가 확인 → `/seller/onboarding`에서 허가 요청 → 관리자가 `/admin/sellers`에서 승인 →
  감사로그에 기록 확인 → 승인 후에는 해당 카테고리로 실제 상품 등록 성공 확인. 승인받은
  카테고리가 전혀 없는 판매자는 상품 등록 폼 자체가 안내 문구로 대체됨을 확인
- **보안 재현 테스트**: 브라우저 콘솔에서 DOM을 직접 조작해 승인되지 않은 카테고리 id를
  강제로 select에 주입·제출(UI 필터 우회 시도) → 서버 액션이 정확한 오류 메시지로 거부하고
  실제로 상품이 생성되지 않음을 DB 직접 조회로 확인 — 서버 측 검증이 클라이언트 필터링에만
  의존하지 않음을 증명
- 테스트 중 겪은 이슈(테스트 스크립트 문제, 앱 결함 아님): (1) 연속 클릭 사이 소프트
  리렌더링 레이스로 요청 버튼 클릭이 간헐적으로 누락된 것처럼 보임 → DB 직접 조회로 실제
  동작은 정상임을 확인 후 재시도 (2) Next.js의 route announcer도 `role="alert"`를 가져
  Playwright 선택자가 모호해짐 → `.first()`로 좁혀 해결

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `prisma/schema.prisma`(SellerCategoryPermission 모델),
`prisma/seed.ts`(채소/축산물 APPROVED 시딩), `src/server/categoryPermissions/{queries,actions}.ts`,
`src/server/seller/actions.ts`(createProductAction 권한 검증 추가), `src/lib/auditLabels.ts`,
`src/app/seller/onboarding/{page,CategoryPermissionList}.tsx`,
`src/app/seller/products/new/page.tsx`, `src/app/admin/sellers/page.tsx`,
`docs/{PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 사용자 지정에 따라 접근성/SEO/보안 점검, 대량주문·동시성 테스트 중 진행.

---

## 접근성/SEO/보안 점검 + 대량주문·동시성 테스트 (2026-10-20, 완료 — M3 체크리스트 전체 완료)

**완료 기능:**
- **동시성 버그 4건 발견·수정**(모두 Playwright로 실제 동시 HTTP 요청을 재현해 확인):
  1. `checkoutAction`(일반 결제): 재고 차감을 조건부 `updateMany`로 원자화(사전 확인만으로는
     마지막 재고를 여러 구매자가 동시에 통과할 수 있었음)
  2. `cancelOrderAction`: 상태 전환을 조건부 `updateMany`로 원자화(동시 취소 클릭 시 재고가
     두 번 복구될 수 있었음)
  3. `joinGroupBuyAction`(공동구매 참여): `SELECT ... FOR UPDATE`로 해당 공동구매 행을
     잠가 동시 참여를 직렬화(여러 `OrderItem` 합계 재계산은 단일 행 조건부 업데이트로
     막을 수 없어 행 잠금 방식 채택)
  4. `runSettlementAction`(정산 배치 생성): `settlementId IS NULL` 조건부 선점으로
     동시 실행 시 같은 Suborder가 두 배치에 중복 집계되는 것을 방지
- **SEO**: 상품/카테고리/농장 스토어 3개 공개 페이지에 `generateMetadata` 추가(제목에
  `%s | 탄생` 템플릿 적용), `getProductBySlug`/`getCategoryWithProducts`/
  `getSellerStoreBySlug`를 React `cache()`로 감싸 메타데이터+본문 중복조회 방지,
  `robots.ts`(로그인 필요 개인화 경로 차단), `sitemap.ts`(공개 상품/카테고리/스토어 목록)
- **접근성**: 상품 상세 블록 에디터의 이미지/영상 블록에 대체텍스트(alt) 입력란 추가(이전
  작업에서 빠뜨린 간극), 판매자 미디어 관리 그리드와 공개 상품페이지 서브 이미지 갤러리에
  순번이 포함된 대체텍스트 적용(목록/카드형처럼 제목이 바로 옆에 보이는 이미지는 중복 안내를
  피하기 위해 `alt=""` 유지가 맞다는 것을 확인하고 그대로 둠)
- **보안**: 기본 보안 헤더 추가(`X-Content-Type-Options`/`X-Frame-Options`/`Referrer-Policy`/
  `Permissions-Policy`), `dangerouslySetInnerHTML` 미사용·원시 SQL 전부 파라미터화·
  `NEXT_PUBLIC_` 비밀값 노출 없음을 전수 grep으로 확인

**미완료 기능과 이유:**
- Content-Security-Policy 헤더 — 운영 도메인/폰트·스크립트 소스가 확정되기 전까지 보류
- 로그인 시도 제한(brute-force 방지), SERIALIZABLE 격리수준·재시도 로직 — 범위 밖으로 판단,
  단일 행 조건부 업데이트/행 잠금으로 실제 발견된 경쟁 상태는 모두 해결됨
- WCAG 색상 대비 정량 검증 — 마스터 문서가 브랜드 색상을 "확정 전"으로 명시, 정식 측정은
  브랜드 색상 확정 후

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(49라우트, `/robots.txt`·`/sitemap.xml` 신규), `eslint`(0 error),
  `vitest run`(40건, 신규 alt 필드 테스트 1건 포함) 전부 통과
- **동시성 재현 테스트**(Playwright, 스레드별 독립 브라우저 컨텍스트로 실제 동시 요청):
  - 공동구매 maxQty=5에 12명 동시 참여 → 정확히 5명만 성공, DB 직접 조회로 커밋 수량 5
    확인(초과 없음)
  - 재고 5개 상품에 12명 동시 결제 → 정확히 5건만 성공, 최종 재고 0 확인(음수 없음)
  - 같은 주문에 6개 동시 취소 클릭 → 재고가 정확히 1회만 복구됨 확인(중복 복구 없음)
  - 같은 판매자에 4개 동시 "정산 실행" 클릭 → 정산 배치가 정확히 1건만 생성되고 GMV가
    중복 집계되지 않음 확인
  - 테스트 중 Playwright 동기 API를 여러 OS 스레드가 공유해 `greenlet.error`가 발생 →
    스레드마다 독립된 Playwright 드라이버를 쓰도록 수정해 해결(테스트 하니스 문제, 앱
    결함 아님). 이 환경의 Turbopack dev 서버 최초 컴파일(라우트당 최대 9~10초)로 인한
    타임아웃도 유사하게 테스트 측 대기시간 문제로 확인
- SEO: `/robots.txt`, `/sitemap.xml` 응답 확인, 상품/카테고리/농장 페이지 `<title>` 태그가
  각 콘텐츠명으로 정확히 렌더링되는지 curl로 확인
- 접근성: 블록 에디터에서 대체텍스트를 입력해 블록 추가 → 편집 미리보기와 공개 상품페이지
  양쪽의 실제 `<img alt="...">` 속성에 반영되는지 확인
- 보안: 응답 헤더에 4개 보안 헤더가 모두 존재하는지 curl로 확인
- 테스트로 생성한 임시 데이터(스트레스 테스트용 구매자 12개 계정, 공동구매 픽스처, 정산
  테스트 주문 4건, 재고 조정) 전부 정리하고 재고 원복 확인

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `src/server/orders/actions.ts`(재고차감/취소 원자화),
`src/server/groupbuy/actions.ts`(FOR UPDATE 행 잠금), `src/server/settlement/actions.ts`
(정산 선점 원자화), `src/app/layout.tsx`(title 템플릿), `src/app/robots.ts`, `src/app/sitemap.ts`,
`src/app/(buyer)/products/[slug]/page.tsx`(generateMetadata+alt), `src/app/(buyer)/category/[slug]/page.tsx`
(generateMetadata), `src/app/(buyer)/farms/[slug]/page.tsx`(generateMetadata),
`src/server/catalog/queries.ts`(React cache() 적용), `src/lib/productBlocks.ts`(alt 필드),
`src/server/productBlocks/actions.ts`, `src/app/seller/products/[id]/edit/{AddBlockForm,page}.tsx`
(alt 입력/표시), `src/components/productBlocks/ProductBlocksView.tsx`(alt 렌더링),
`next.config.ts`(보안 헤더), `tests/unit/productBlocks.test.ts`,
`docs/{PRODUCT_DECISIONS,ERD,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 마스터 문서 M3 체크리스트 전체 완료. 다음은 사용자가 지정하는 M4 이전 범위
(실 PG/배송/문자 공급자 계약 등 M4 자체는 "별도 승인 이전 실행 금지") 또는 추가 기능 중
사용자가 지정하는 항목으로 진행.

---

## 상품 기본정보 수정 (2026-10-20, 완료)

**완료 기능:**
- `updateProductAction`(상품명/카테고리/가격/재고/원산지/설명 수정) — `createProductAction`과
  동일한 입력 검증 + 카테고리별 판매 허가(APPROVED) 재검증을 재사용(카테고리를 바꾸는 경우만
  재검증, 바꾸지 않으면 기존 허가 그대로 유지)
- `/seller/products/[id]/edit`에 "기본 정보 수정" 폼 추가 — 기존 값으로 미리 채워진
  입력 필드, 카테고리 선택지는 판매 허가를 받은 카테고리만 노출. 플레이스홀더였던
  "다음 단계에서 구현 예정" 안내문을 실제 폼으로 교체
- **slug는 제목이 바뀌어도 불변**(URL 안정성 보장 — 이미 생성된 sitemap.xml 링크가
  깨지지 않도록)

**미완료 기능과 이유:**
- 상품 삭제(완전 제거) — 요청 범위 밖, 기존 판매중단(HIDDEN) 기능으로 충분하다고 판단
- 가격 변경 시 기존 장바구니에 담긴 다른 구매자의 가격 자동 재동기화 — 체크아웃 시점에
  항상 최신 `Product.priceKrw`를 다시 조회해 반영하므로(M2 기존 로직) 별도 작업 불필요

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(49라우트, 라우트 추가 없음), `eslint`(0 error),
  `vitest run`(40건, 회귀 없음) 전부 통과
- Playwright(Python) E2E: 기존 값으로 미리 채워진 폼 확인 → 제목/가격/원산지 수정 후
  저장 → 판매자 편집 페이지(h1)·공개 상품페이지 양쪽에 즉시 반영 확인(revalidatePath) →
  공개 URL의 slug가 제목 변경 후에도 그대로(`potato-10kg`) 유지됨을 확인
- **보안 재검증**: 카테고리별 판매 허가 작업 때와 동일한 방식으로 브라우저 콘솔에서
  승인되지 않은 카테고리 id를 강제 주입해 제출 → 수정 액션도 생성 액션과 동일하게
  정확한 오류 메시지로 거부함을 확인(검증 재사용이 실제로 양쪽 경로에 적용됨을 증명)
- 접근제어 재확인: 상품을 소유하지 않은 다른 판매자가 이 상품의 편집 URL에 직접 접근 시
  404 확인

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `src/server/seller/actions.ts`(updateProductAction 추가),
`src/app/seller/products/[id]/edit/{page,EditBasicInfoForm}.tsx`,
`docs/{PRODUCT_DECISIONS,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 사용자가 지정하는 다음 항목으로 진행(예: 관리자 카테고리 트리 관리 UI 등).

---

## 관리자 카테고리 트리 관리 UI (2026-10-20, 완료)

**완료 기능:**
- `createCategoryAction`(최상위 또는 최상위 바로 아래 하위 카테고리만 생성 가능 — 3단계
  이상 금지), `renameCategoryAction`(이름만 변경, slug 불변), `deleteCategoryAction`
  (하위 카테고리·연결된 상품이 있으면 거부, 서버에서 재검증) — 전부 감사로그 연동
- `/admin/content`에 "카테고리 구조" 섹션 추가 — 최상위 카테고리마다 이름(인라인 수정),
  슬러그 표시, 하위 카테고리 목록(각각 인라인 수정), 하위 카테고리 추가 폼, 최상위
  카테고리 추가 폼. 삭제 불가 조건이면 버튼 대신 이유("상품 N개/하위 카테고리 N개 연결됨")
  표시 — 기존 "카테고리 구조 편집은 범위 밖입니다" 안내 문구를 실제 기능으로 교체

**미완료 기능과 이유:**
- 드래그 앤 드롭 순서 변경, 카테고리 아이콘/이미지 — 요청 범위 밖, 현재는 이름 가나다순
  고정 정렬만 지원
- 3단계 이상 트리 — 기존 조회 로직(`getCategoryWithProducts` 등)이 "최상위+직계자식"만
  가정하고 있어 의도적으로 2단계로 제한

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(49라우트, 라우트 추가 없음), `eslint`(0 error),
  `vitest run`(40건, 회귀 없음) 전부 통과
- Playwright(Python) E2E: 최상위 카테고리 생성 → 그 아래 하위 카테고리 생성 → 하위
  카테고리가 생기면 최상위가 "삭제 불가" 표시로 바뀌는지 확인 → 하위 카테고리 이름
  변경 → 하위 카테고리 삭제(상품 없어 가능) → 이제 비어진 최상위 카테고리 삭제 → 기존
  상품이 연결된 카테고리("채소")는 계속 "삭제 불가" 표시 확인 → 감사로그에 생성/이름변경/
  삭제 3건 모두 기록 확인 → 구매자 계정은 `/admin/content` 접근 시 리다이렉트 확인
- 테스트 중 겪은 이슈(모두 테스트 스크립트 문제, 앱 결함 아님): 카테고리 이름이 일반
  텍스트가 아니라 인라인 수정용 `<input value="...">`로 렌더링되어 Playwright의
  `inner_text()`로는 전혀 잡히지 않음(입력란의 value 속성은 렌더링된 텍스트 노드가
  아니기 때문) → `input[value="..."]` 선택자로 교체해 해결. 또한 로그인 직후 곧바로
  `wait_for_load_state("networkidle")`를 호출하면 서버 액션 리다이렉트가 시작되기 전에
  반환되는 레이스가 간헐적으로 발생해, 클릭 후 짧은 대기를 추가해 해결

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `src/server/categories/{queries,actions}.ts`,
`src/app/admin/content/{page,CategoryTree,CategoryNameForm,NewCategoryForm}.tsx`,
`src/lib/auditLabels.ts`, `docs/{PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 사용자가 지정하는 다음 항목으로 진행.

---

## 판매자 스토어 소개·정책 (2026-10-20, 완료)

**완료 기능:**
- `Seller.introduction`/`shippingPolicy`/`returnPolicy` 필드 추가(전부 선택, 빈 값은 null)
- `updateSellerStoreAction` — 본인 판매자만 수정 가능
- `/seller/store`: 플레이스홀더를 실제 폼으로 교체(소개/배송정책/반품정책 3개 textarea,
  공개 스토어 페이지 미리보기 링크)
- `/farms/[slug]`(공개 스토어 페이지): "생산자 소개", "배송·반품 정책" 섹션을 값이 있을
  때만 노출
- `/products/[slug]`(상품 상세): 판매자의 반품 정책을 "구조화 정보" 섹션으로 중복 노출
  (마스터 문서 4.4절 6번 요건)

**미완료 기능과 이유:**
- 스토어 이름(storeName) 수정 — 요청 범위 밖("소개·정책"만 명시), 필요 시 별도 작업
- 배송 정책의 구조화(배송비 금액, 제주/도서산간 추가비용 등 필드 분리) — 현재는 자유
  텍스트로만 저장, 실제 배송비 계산 로직과 연동하려면 별도의 더 큰 작업 필요(기존
  PRODUCT_DECISIONS.md에도 "배송비 M2 범위에서 단순화"로 기록되어 있는 것과 동일한 맥락)

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(49라우트, 라우트 추가 없음), `eslint`(0 error),
  `vitest run`(40건, 회귀 없음) 전부 통과
- Playwright(Python) E2E: 빈 폼 확인 → 3개 필드 작성 후 저장 → 재조회 시 값 유지 확인 →
  공개 스토어 페이지에 소개+정책 섹션 노출 확인 → 상품 상세페이지에 반품 정책만 중복
  노출 확인 → 필드를 전부 비우고 저장 → 공개 페이지에서 해당 섹션들이 사라지는지 확인
  (빈 섹션 노출 방지 로직 검증) → 다른 판매자 계정은 자신의 별도 빈 폼만 보임을 확인
  (판매자별 데이터 격리 확인)

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `prisma/schema.prisma`(Seller 필드 추가),
`src/server/seller/actions.ts`(updateSellerStoreAction 추가),
`src/app/seller/store/{page,SellerStoreForm}.tsx`,
`src/app/(buyer)/farms/[slug]/page.tsx`(소개·정책 섹션),
`src/app/(buyer)/products/[slug]/page.tsx`(반품 정책 노출),
`docs/{PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 사용자가 지정하는 다음 항목으로 진행(남은 플레이스홀더:
`/admin/notifications`, `/admin/settings`).

---

## 관리자 운영설정 (2026-10-20, 완료)

**완료 기능:**
- `PlatformSettings`(싱글톤, 중개수수료율만 보관), `PolicyVersion`(약관 버전, 생성만 가능)
  모델 추가
- `updateCommissionRateAction`(ADMIN 전용, 퍼센트 입력→비율 저장, 감사로그 기록),
  `createPolicyVersionAction`(ADMIN 전용, 수정/삭제 불가)
- `/admin/settings`: "중개수수료율"(현재값 표시+변경 폼), "약관 버전"(이력 목록+새 버전
  등록 폼, 수정/삭제 버튼 없음), "운영설정(읽기 전용)"(APP_ENV/DIRECT_SALE_ENABLED/
  PAYMENT_PROVIDER/NOTIFICATION_PROVIDER 환경변수 값을 그대로 표시, **편집 불가**) —
  플레이스홀더를 실제 기능으로 교체
- `runSettlementAction`이 하드코딩된 `COMMISSION_RATE` 상수 대신 `PlatformSettings`의
  현재 값을 조회해 사용하도록 변경(기존 상수는 싱글톤의 기본값으로만 남음), `/admin/settlements`
  `/seller/settlements` 표시 텍스트도 동일하게 동적 값 참조로 전환

**미완료 기능과 이유:**
- 실결제/실발송 관련 플래그(DIRECT_SALE_ENABLED 등)의 UI 토글 — **의도적으로 미구현**.
  이 플래그들을 웹 UI에서 즉시 바꿀 수 있게 하는 것 자체가 `docs/RELEASE_CHECKLIST.md`의
  "실결제/실발송은 사용자 사전 승인 필요" 원칙과 충돌하므로, 읽기 전용 표시로만 제공
  (서버 환경변수를 통해서만 변경 가능)
- 품목/판매자/기간별 차등 수수료율 — 여전히 범위 밖(전역 단일 요율만 지원, 기존 결정과 동일)
- 약관 버전의 실제 구매자 동의 기록·법적 효력 연동 — 마스터 문서 16장이 별도의 사전 출시
  법무 검토 대상으로 분류한 항목이라 범위 밖

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(49라우트, 라우트 추가 없음), `eslint`(0 error),
  `vitest run`(40건, 회귀 없음) 전부 통과
- Playwright(Python) E2E: 기본 5% 수수료율 확인 → 운영설정 플래그가 읽기 전용(입력란
  없음)으로 표시되는지 확인 → 수수료율을 7.5%로 변경 → `/admin/settlements`와
  `/seller/settlements` 양쪽에 즉시 반영되는지 확인 → 약관 버전 등록 후 수정/삭제
  버튼이 전혀 없는지 확인(append-only) → 감사로그에 두 작업 모두 기록됨을 확인 →
  구매자 계정은 접근 시 리다이렉트됨을 확인
- **금액 정확성 재검증**: 수수료율을 7.5%로 바꾼 뒤 실제로 새 정산 배치를 생성해 DB를
  직접 조회 — `commissionRate: 0.075`, `commissionKrw: 750`(GMV 10,000원 기준)으로
  정확히 스냅샷 저장됨을 확인(이후 수수료율을 다시 바꿔도 이 배치는 영향받지 않음이
  설계상 보장됨)
- 테스트 중 겪은 이슈(테스트 스크립트 문제, 앱 결함 아님): React가 인접한 JSX 표현식
  사이에 하이드레이션용 HTML 주석(`<!-- -->`)을 삽입해, 원시 HTML 문자열에서는 "5.0%"가
  "5.0<!-- -->%"처럼 끊어져 보임(실제 렌더링된 화면 텍스트는 정상적으로 "5.0%") →
  `page.content()`(원시 HTML) 대신 `locator("body").inner_text()`(렌더링된 텍스트)로
  검증 방식을 바꿔 해결

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `prisma/schema.prisma`(PlatformSettings/PolicyVersion 모델),
`src/server/platformSettings/{queries,actions}.ts`, `src/server/policyVersions/{queries,actions}.ts`,
`src/lib/auditLabels.ts`, `src/app/admin/settings/{page,CommissionRateForm,PolicyVersionForm}.tsx`,
`src/server/settlement/actions.ts`(동적 수수료율 조회로 변경),
`src/app/admin/settlements/page.tsx`, `src/app/seller/settlements/page.tsx`(동적 값 표시),
`docs/{PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 사용자가 지정하는 다음 항목으로 진행(남은 플레이스홀더: `/admin/notifications`).

---

## 관리자 알림 예약/발송 로그/동의 현황 (2026-10-20, 완료 — 전체 플레이스홀더 소진)

**완료 기능:**
- `NotificationLog` 모델(채널 구분 없음 — mock 상태라 실체 없는 구분을 모델링하지 않음),
  `logNotification` 헬퍼
- 거래 알림(광고성 제외) 발생 지점에 로깅 삽입: `confirmMockPaymentAction`(결제 확인),
  `cancelOrderAction`(주문 취소, 동시 취소 경쟁 가드를 통과한 경우만), `advanceSuborderStatusAction`
  (SHIPPED/COMPLETED 전이 시만), `replyTicketAction`(티켓 소유자가 아닌 쪽이 답했을 때만)
- `/admin/notifications`: "수신동의 현황"(전체회원/이메일·푸시 동의자 수+비율,
  `safeRatePercent` 재사용), "예약된 알림"(오픈예정 공동구매별 `GroupBuyAlert` 구독 수 —
  실제 스케줄러 발송이 아님을 명시), "발송 로그"(모의, 최근 200건) — 플레이스홀더를
  실제 기능으로 교체

**미완료 기능과 이유:**
- 공동구매 오픈 시점 자동 알림 발송 — 스케줄러를 새로 도입해야 하는 범위라 기존
  "요청 시점 계산" 아키텍처 원칙과 충돌, 구독 현황판으로 대체
- 실제 이메일/푸시 채널별 발송 — `NOTIFICATION_PROVIDER=mock`인 동안 범위 밖, 모델에도
  채널 구분 필드를 추가하지 않음(실제 발송기 도입 시점에 맞춰 설계)
- 광고성 알림 발송 로그 — 보낼 구체적 콘텐츠(캠페인)가 아직 없어 로깅 대상에서 제외

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(49라우트, 라우트 추가 없음), `eslint`(0 error — JSX 안의
  겹낫표를 `&quot;` 엔티티로 교체해 `react/no-unescaped-entities` 수정),
  `vitest run`(40건, 회귀 없음) 전부 통과
- Playwright(Python) E2E: 장바구니→체크아웃→Mock결제확인(결제확인 로그 생성)→판매자가
  배송상태를 준비중→배송중→배송완료까지 전진(배송시작/배송완료 로그 각각 생성)→
  구매자가 주문 문의 접수→판매자 답변(문의답변 로그 생성, 구매자 본인 재질문이
  아니므로 기록됨)→주문 취소(취소 로그 생성) 전 과정에서 `/admin/notifications`
  발송 로그에 정확히 반영되는지 확인. 별도로 오픈예정 공동구매에 알림을 신청한 뒤
  "예약된 알림" 섹션에 정확한 구독 건수가 표시되는지 확인. 접근제어(구매자 리다이렉트)
  확인
- 테스트 중 겪은 이슈 없음(이번 작업은 기존에 확립된 패턴들을 그대로 재사용해 설계
  단계에서 대부분의 모호함을 미리 제거함)

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `prisma/schema.prisma`(NotificationLog 모델),
`src/server/notifications/{log,adminQueries}.ts`, `src/lib/notificationLabels.ts`,
`src/server/groupbuy/queries.ts`(listScheduledGroupBuyAlertCounts 추가),
`src/app/admin/notifications/page.tsx`,
`src/server/orders/actions.ts`(결제확인/취소/배송전이 로깅 삽입),
`src/server/support/actions.ts`(답변 로깅 삽입), `docs/{PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 마스터 문서 3장 라우트 전체가 실제 기능으로 구현 완료됨(플레이스홀더 전부
소진). 다음은 사용자가 지정하는 추가 기능 또는 M4 이전 범위(실제 PG/배송 계약 등 — M4
자체는 별도 승인 전 실행 금지) 중 하나로 진행.

---

## 관리자/판매자 대시보드 고도화 (2026-10-20, 완료)

**완료 기능:**
- `getAdminDashboardSummary`(마스터 문서 4.6절의 운영 지표 7종을 새 테이블 없이 기존
  모델에서 집계): 판매자 심사대기, 오늘 주문, 배송 지연(3일+ 고정 임계값), 반품·분쟁
  (미해결 DISPUTE 티켓), 공동구매 마감 처리 대기(AWAITING_FINALIZATION), 광고 심사대기,
  정산 승인대기(Settlement PENDING)
- `getSellerDashboardSummary`: 접수대기 주문, 정산대기금액, 미해결 문의, 광고 심사대기,
  진행중인 공동구매
- `/admin`: "조치가 필요한 항목" 7개 카드(각각 해당 관리 페이지로 링크, 0보다 크면 주황색
  강조) + 기존 "전체 상품 수/전체 회원 수" 유지. 기존 M1 시절 스텁("주문/분쟁/공동구매/
  광고 운영 지표는 다음 단계에서 구현 예정")을 실제 데이터로 교체
- `/seller`: 기존 3개 카드(심사상태/등록상품수/판매중상품) 유지 + "조치가 필요한 항목"
  5개 카드 신규 추가. 기존의 명백히 낡은 스텁("주문/정산/광고는 다음 단계에서 구현
  예정" — 실제로는 이미 모두 구현되어 있었음)을 제거

**미완료 기능과 이유:**
- "신규 상품 검수" 지표 — `ProductStatus.IN_REVIEW`로 전환하는 승인 워크플로우 자체가
  어디에도 구현되어 있지 않아(현재는 DRAFT/ON_SALE만 자동 분기), 숫자 하나만 끼워
  맞추지 않고 대시보드에 "별도 작업 단위로 분리됨"을 명시. 실제 상품 검수 워크플로우
  (IN_REVIEW 전환, 승인/반려, 보완요청)는 차후 별도 작업으로 설계 필요
- 배송 지연 임계값의 판매자/카테고리별 차등화 — 전역 고정 3일로만 단순화(SLA 필드가
  아직 없음)

**실행한 테스트/결과:**
- `tsc --noEmit`, `next build`(49라우트, 라우트 추가 없음), `eslint`(0 error),
  `vitest run`(40건, 회귀 없음) 전부 통과
- Playwright(Python) E2E: 관리자 대시보드에 마스터 문서 4.6절의 7개 지표(정확한 라벨)가
  전부 렌더링되는지 확인 → 판매자 대시보드에 5개 신규 지표+기존 3개 지표가 전부 보이고
  낡은 플레이스홀더 문구가 완전히 사라졌는지 확인 → 아직 심사 승인을 못 받은 판매자
  (`seller_pending`) 계정도 에러 없이 대시보드(0으로 채워진 지표)를 볼 수 있는지 확인
- **실시간 반영 검증**: 테스트 주문을 하나 생성한 뒤 관리자 대시보드의 "오늘 주문"
  카드가 생성 전 0에서 생성 후 1로 정확히 증가하는지 확인(캐시된 값이 아니라 매 요청마다
  실제로 다시 계산됨을 증명) — 이후 테스트 데이터와 재고를 원상복구
- 8개 운영 지표 전부 DB 직접 조회로 쿼리 결과가 화면 표시값과 일치하는지 대사 확인

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `src/server/admin/queries.ts`(getAdminDashboardSummary 추가),
`src/server/seller/queries.ts`(getSellerDashboardSummary 추가), `src/app/admin/page.tsx`,
`src/app/seller/page.tsx`, `docs/{PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 사용자가 지정하는 다음 항목으로 진행(예: 신규 상품 검수 워크플로우,
M4 이전 범위 등).

---

## 신규 상품 검수(IN_REVIEW) 워크플로우 (2026-10-20, 완료)

**완료 기능:**
- `REGULATED_CATEGORY_SLUGS`(`src/lib/regulatedCategories.ts`)로 "축산물/수산물" 상수를
  `/seller/onboarding`의 기존 `REGULATED_SLUGS`와 통합(단일 소스)
- `Product.reviewNote`/`reviewedBy`/`reviewedAt` 필드 추가(마이그레이션
  `20261020121342_add_product_review_fields`)
- `createProductAction`: 승인된 판매자가 검수 대상 카테고리에 상품을 등록하면 즉시
  `IN_REVIEW`로 생성(비규제 카테고리는 기존과 동일하게 `ON_SALE`/`DRAFT`)
- `resubmitForReviewAction`(판매자): 검수 반려로 `DRAFT`가 된 검수 대상 상품을 보완 후
  다시 `IN_REVIEW`로 재제출
- `approveProductReviewAction`/`rejectProductReviewAction`(관리자): `IN_REVIEW`→`ON_SALE`
  승인(반려 사유 초기화) / `IN_REVIEW`→`DRAFT` 반려(사유 필수 입력, `reviewNote`에 기록)
  + `AuditLog` 기록(`PRODUCT_REVIEW_APPROVED`/`PRODUCT_REVIEW_REJECTED`)
- `approveApplicationAction`(입점 승인)의 기존 DRAFT→ON_SALE 일괄 전환을 카테고리
  기준으로 분기(검수 대상 카테고리는 `IN_REVIEW`로 전환)해, 입점 승인 시점에 이미
  등록돼 있던 검수 대상 상품이 검수 없이 새 나가지 않도록 보강
- `/admin/products`: "검수" 열 추가 — `IN_REVIEW` 행에 승인/반려(사유 입력 필수) 버튼,
  반려 이력이 있는 `DRAFT` 행에는 반려 사유 표시
- `/seller/products`: `DRAFT` + 검수 대상 카테고리 + 승인된 판매자인 경우 "검수 제출"/
  "보완 후 재제출" 버튼 노출, 반려 사유가 있으면 상품 카드에 표시

**미완료 기능과 이유:** 없음(계획했던 범위 전부 구현).

**실행한 테스트/결과:**
- `tsc --noEmit`, `eslint src`, `next build`(49라우트, 라우트 추가 없음), `vitest run`
  (40건, 회귀 없음) 전부 통과
- Playwright(Python) E2E: 승인된 판매자(`seller_approved`)가 축산물 카테고리 상품을
  등록하면 생성 즉시 `IN_REVIEW`(검수중)로 표시 → 관리자가 사유를 입력해 반려하면
  `DRAFT`로 돌아가고 판매자 화면에 반려 사유+재제출 버튼이 보임 → 재제출 시
  `IN_REVIEW`로 복귀 → 관리자가 승인하면 `ON_SALE`(판매중)로 전환되고 반려 사유가
  양쪽 화면에서 모두 사라짐 → 구매자(`buyer_demo`) 계정은 `/admin/products` 접근 시
  proxy.ts에 의해 리다이렉트됨을 확인
- 테스트 중 생성한 상품은 DB에서 직접 정리(원상복구)

**접속 URL(로컬만):** `http://127.0.0.1:3210`

**생성/수정한 파일:** `prisma/schema.prisma`(+마이그레이션),
`src/lib/regulatedCategories.ts`(신규), `src/lib/auditLabels.ts`,
`src/server/seller/actions.ts`(createProductAction 수정, resubmitForReviewAction 추가),
`src/server/admin/actions.ts`(approveApplicationAction 수정, approveProductReviewAction/
rejectProductReviewAction 추가), `src/app/admin/products/page.tsx`,
`src/app/seller/products/page.tsx`,
`src/app/seller/onboarding/CategoryPermissionList.tsx`(공유 상수로 교체),
`docs/{PRODUCT_DECISIONS,ERD,API,PROGRESS}.md`

**환경제어 및 기존 홈페이지 변경 여부:** 0건 확인
**실결제/실알림/온라인 배포:** 실행 안 함
**다음 단계:** 사용자가 지정하는 다음 항목으로 진행(예: 회원 설정(/account) 고도화,
M4 이전 범위 등).
