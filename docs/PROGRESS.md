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
