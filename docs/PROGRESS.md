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
