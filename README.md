# 탄생 마켓플레이스 (TANSAENG Marketplace)

산지 직거래·공동구매 플랫폼 "탄생"의 **신규·독립** 로컬 개발 프로젝트입니다.

> ⚠️ 이 프로젝트는 기존에 운영 중인 스마트팜 환경제어시스템 및 `www.tansaeng.com`과
> **완전히 분리된 코드베이스**입니다. 자세한 안전 경계는 [`docs/SAFETY_BASELINE.md`](./docs/SAFETY_BASELINE.md)를 반드시 먼저 읽으세요.

## 1. 요구 사항

- Node.js 20 LTS 이상
- npm 10 이상
- PostgreSQL 16 (전용 인스턴스만 사용, 기존 DB 재사용 금지 — 설치/설정 절차는 [§2](#db-준비-최초-1회) 참고)

## 2. 시작하기

### 중요: `node_modules`는 반드시 "네이티브" 파일시스템에서 설치하세요

이 프로젝트 폴더가 **Windows 드라이브(`D:\dev\...`)에 있고 WSL에서 작업하는 경우**,
`node_modules`를 WSL을 거쳐 Windows 드라이브(`/mnt/d/...`)에 설치하면 파일 수가 많아
**극도로 느립니다** (측정상 네이티브 대비 수십 배 이상). 아래 중 하나를 선택하세요.

- **Windows 11에서 직접 실행(권장)**: PowerShell/CMD에서 `D:\dev\tansaeng-marketplace`로 이동해
  Windows용 Node.js로 `npm install`, `npm run dev`를 실행합니다. 이 경우 `node_modules`가
  NTFS 네이티브로 생성되어 빠릅니다.
- **WSL에서 실행**: 프로젝트를 WSL 네이티브 경로(예: `~/dev/tansaeng-marketplace`)에 두고 작업합니다.

```powershell
# Windows PowerShell 예시
cd D:\dev\tansaeng-marketplace
npm install
npm run dev
```

```bash
# WSL/Linux 예시
npm install
npm run dev
```

### DB 준비 (최초 1회)

이 프로젝트는 **전용 PostgreSQL 인스턴스**(`127.0.0.1:55432`, DB명
`tansaeng_marketplace_dev`)를 사용합니다. 기존 운영 DB 계정·포트·이름을 절대 재사용하지
마세요.

```bash
# 1) PostgreSQL 설치(터미널에서 직접 실행 — sudo 비밀번호 필요)
sudo apt update && sudo apt install -y postgresql

# 2) 전용 역할/DB 생성
sudo -u postgres psql -c "CREATE ROLE tansaeng_dev WITH LOGIN PASSWORD 'tansaeng_dev_local_only';"
sudo -u postgres psql -c "CREATE DATABASE tansaeng_marketplace_dev OWNER tansaeng_dev;"

# 3) 포트를 이 프로젝트 컨벤션인 55432로 변경(기본 설치는 5432)
#    /etc/postgresql/16/main/postgresql.conf의 `port = 5432` → `port = 55432`로 수정 후
#    sudo systemctl restart postgresql
#    (listen_addresses는 기본값 localhost 그대로 유지 — 외부에 공개하지 않음)

# 4) 환경변수 복사 + 마이그레이션 적용 + 시드
cp .env.example .env.local   # DATABASE_URL, AUTH_SECRET 포함
npx prisma migrate deploy    # 저장된 마이그레이션 히스토리를 그대로 적용
npm run db:seed              # 데모 계정/카테고리/상품 시드
npm run dev
```

스키마를 직접 수정하며 반복 작업할 때는 `npm run db:push`(마이그레이션 파일 없이 즉시
동기화)를 써도 되지만, 변경을 커밋할 때는 `npx prisma migrate dev --name <설명>`으로
마이그레이션 파일을 생성해 `prisma/migrations/`에 포함시키세요.

데모 계정(비밀번호 전부 `demo1234`):

| 이메일 | 역할 |
|---|---|
| `buyer_demo@tansaeng.local` | 구매자 |
| `seller_pending@tansaeng.local` | 판매자(입점 심사중) |
| `seller_approved@tansaeng.local` | 판매자(승인됨) |
| `admin_demo@tansaeng.local` | 관리자 |

개발 서버 기본 주소: **http://127.0.0.1:3210** (`-H 127.0.0.1`이 스크립트에 고정되어 있음 —
`-H` 생략 시 Next.js가 기본적으로 `0.0.0.0`에 바인딩되는 것을 확인했기 때문. 포트 충돌 시
`package.json`의 `dev`/`start` 스크립트에서 `-p` 값만 바꾸세요)

## 3. 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 빌드 산출물 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run typecheck` | TypeScript strict 타입 검사 (`tsc --noEmit`) |
| `npm test` | Vitest 단위 테스트 |
| `npm run db:push` | Prisma 스키마를 DB에 즉시 동기화(마이그레이션 파일 생성 안 함, 빠른 반복 작업용) |
| `npm run db:seed` | 데모 계정/카테고리/상품 시드 |
| `npm run db:reset` | DB 강제 초기화 후 재시드 |

마이그레이션 히스토리를 남겨야 할 때는 `npx prisma migrate dev --name <설명>` /
`npx prisma migrate deploy`를 직접 사용하세요(위 스크립트 목록에는 없음).

## 4. 현재 진행 단계

마스터 문서([§17](./TANSAENG_MARKETPLACE_CLAUDE_CODE_MASTER.md)) 기준 **M0~M3 전체 완료**,
그 외 접근성/SEO/보안/동시성 점검과 몇 가지 추가 운영 기능까지 구현되어 있습니다.

- [x] (M0) 안전 경계 확인, Next.js 스캐폴드, 반응형 레이아웃 뼈대
- [x] (M1) 로그인/회원가입/로그아웃, RBAC 라우트 보호
- [x] (M1) 카테고리/상품 목록·상세 (실 DB 연동), 찜·팔로우 토글
- [x] (M1) 판매자 입점 신청 + 관리자 승인/반려, 상품 등록(DRAFT/ON_SALE 자동 분기)
- [x] (M2) 장바구니 → 체크아웃 → Mock 결제 → 주문 취소(재고 자동 복구, 동시성 보호)
- [x] (M2) 공동구매: 출하예정 알림 → 오픈 참여 → Mock결제 → 관리자 마감처리(성사/미성사+자동환불, 행 잠금으로 초과판매 방지)
- [x] 상품 사진/영상 업로드(매직바이트 검증, EXIF 자동 제거, 대표사진 지정)
- [x] 상품 상세페이지 블록 에디터(제목/문단/이미지/영상/표/구분선/FAQ/안내배너, 대체텍스트 입력)
- [x] 배송상태 전이(판매자) + 배송완료 주문 후기 작성/노출
- [x] PWA 기본 설치 지원(manifest, 아이콘, 최소 서비스 워커)
- [x] (M3) 광고 신청/심사/노출(검색/카테고리상단/홈배너, 모의 노출·클릭 집계)
- [x] (M3) 문의/분쟁 티켓(상품질문/주문문의/분쟁, 공개 Q&A)
- [x] (M3) 배너·카테고리 트리·공지·FAQ 운영자 CMS
- [x] (M3) 대리등록(운영자가 농가 대신 상품 등록, 관리자 최종 승인 필요)
- [x] 정산/대사(수수료·GMV, 판매자별 정산 배치)
- [x] 관리자 통계 대시보드(거래액·활성회원·전환율·공동구매 성사율·광고 CTR)
- [x] 관심 알림·수신설정(공동구매 오픈 알림, 광고성 정보 수신동의)
- [x] 관리자 감사로그(승인/반려/생성/삭제 등 주요 작업 이력)
- [x] 카테고리별 판매 허가(입점 승인과 별개로 품목별 허가 필요)
- [x] 상품 기본정보 수정(제목/카테고리/가격/재고/원산지/설명, slug 불변)
- [x] PostgreSQL 전용 인스턴스로 전환 완료
- [x] 접근성(대체텍스트)/SEO(메타데이터·robots·sitemap)/보안 헤더 점검
- [x] 대량주문·동시성 테스트로 경쟁 상태 4건 발견·수정(재고 차감, 주문취소, 공동구매 참여, 정산 배치)

상세 진행 상황은 [`docs/PROGRESS.md`](./docs/PROGRESS.md) 참고(마일스톤별 완료/미완료/테스트
결과를 전부 기록).

## 5. 환경변수

`.env.example`을 복사해 `.env.local`로 사용하세요. 기본값은 전부 Mock/로컬 안전 기본값입니다.

```bash
cp .env.example .env.local
```

기존 운영 서비스의 `.env`, API 키, DB 접속정보를 이 프로젝트에 복사하지 마세요.

## 6. 문서

- [`docs/SAFETY_BASELINE.md`](./docs/SAFETY_BASELINE.md) — 안전 경계·격리 확인 (최우선 필독)
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — 구조 개요
- [`docs/ERD.md`](./docs/ERD.md) — 데이터 모델 및 설계 메모(동시성 보호 설계 포함)
- [`docs/API.md`](./docs/API.md) — 서버 액션/쿼리 목록과 인가 규칙
- [`docs/PRODUCT_DECISIONS.md`](./docs/PRODUCT_DECISIONS.md) — 확정/미확정 제품 정책과 그 근거
- [`docs/PROGRESS.md`](./docs/PROGRESS.md) — 마일스톤 진행 상황
- [`docs/RELEASE_CHECKLIST.md`](./docs/RELEASE_CHECKLIST.md) — 운영 전 승인 게이트 (현재 실행 금지 항목)
- [`TANSAENG_MARKETPLACE_CLAUDE_CODE_MASTER.md`](./TANSAENG_MARKETPLACE_CLAUDE_CODE_MASTER.md) — 전체 제품/구현 명세서

## 7. 절대 금지 사항 (재확인)

- 실제 결제, 실제 SMS/카카오/푸시 발송 금지 (전부 Mock)
- 운영 서버 접속/배포, 도메인/DNS 변경 금지
- 기존 스마트팜 환경제어(ESP32/MQTT/Node-RED) 코드/설정 접근 금지
