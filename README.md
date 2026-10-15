# 탄생 마켓플레이스 (TANSAENG Marketplace)

산지 직거래·공동구매 플랫폼 "탄생"의 **신규·독립** 로컬 개발 프로젝트입니다.

> ⚠️ 이 프로젝트는 기존에 운영 중인 스마트팜 환경제어시스템 및 `www.tansaeng.com`과
> **완전히 분리된 코드베이스**입니다. 자세한 안전 경계는 [`docs/SAFETY_BASELINE.md`](./docs/SAFETY_BASELINE.md)를 반드시 먼저 읽으세요.

## 1. 요구 사항

- Node.js 20 LTS 이상
- npm 10 이상
- DB는 M1 기준 **SQLite(설치 불필요, 파일 기반)**. M2 진입 전 PostgreSQL 16으로 전환 예정
  (전용 인스턴스만 사용, 기존 DB 재사용 금지 — `docs/ERD.md` 전환 체크리스트 참고)

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

### DB 준비 (최초 1회 + 스키마 변경 시)

```bash
cp .env.example .env.local   # DATABASE_URL, AUTH_SECRET 포함
npm run db:push              # SQLite 파일(prisma/dev.db) 생성/동기화
npm run db:seed              # 데모 계정/카테고리/상품 시드
npm run dev
```

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
| `npm run db:push` | Prisma 스키마를 SQLite DB에 반영 |
| `npm run db:seed` | 데모 계정/카테고리/상품 시드 |
| `npm run db:reset` | DB 강제 초기화 후 재시드 |

## 4. 현재 진행 단계 (M1)

- [x] (M0) 안전 경계 확인, Next.js 스캐폴드, 반응형 레이아웃 뼈대
- [x] 로그인/회원가입/로그아웃, RBAC 라우트 보호
- [x] 카테고리/상품 목록·상세 (실 DB 연동)
- [x] 찜·팔로우 토글
- [x] 판매자 입점 신청 + 관리자 승인/반려
- [x] 판매자 상품 등록(승인 여부에 따라 DRAFT/ON_SALE 자동 분기)
- [ ] 상품 사진/영상 업로드 — 다음 단계
- [ ] 장바구니/주문/결제/공동구매 — M2에서 진행

상세 진행 상황은 [`docs/PROGRESS.md`](./docs/PROGRESS.md) 참고.

## 5. 환경변수

`.env.example`을 복사해 `.env.local`로 사용하세요. 기본값은 전부 Mock/로컬 안전 기본값입니다.

```bash
cp .env.example .env.local
```

기존 운영 서비스의 `.env`, API 키, DB 접속정보를 이 프로젝트에 복사하지 마세요.

## 6. 문서

- [`docs/SAFETY_BASELINE.md`](./docs/SAFETY_BASELINE.md) — 안전 경계·격리 확인 (최우선 필독)
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — 구조 개요
- [`docs/PRODUCT_DECISIONS.md`](./docs/PRODUCT_DECISIONS.md) — 확정/미확정 제품 정책
- [`docs/PROGRESS.md`](./docs/PROGRESS.md) — 마일스톤 진행 상황
- [`docs/RELEASE_CHECKLIST.md`](./docs/RELEASE_CHECKLIST.md) — 운영 전 승인 게이트 (현재 실행 금지 항목)
- [`TANSAENG_MARKETPLACE_CLAUDE_CODE_MASTER.md`](./TANSAENG_MARKETPLACE_CLAUDE_CODE_MASTER.md) — 전체 제품/구현 명세서

## 7. 절대 금지 사항 (재확인)

- 실제 결제, 실제 SMS/카카오/푸시 발송 금지 (전부 Mock)
- 운영 서버 접속/배포, 도메인/DNS 변경 금지
- 기존 스마트팜 환경제어(ESP32/MQTT/Node-RED) 코드/설정 접근 금지
