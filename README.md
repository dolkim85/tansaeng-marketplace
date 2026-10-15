# 탄생 마켓플레이스 (TANSAENG Marketplace)

산지 직거래·공동구매 플랫폼 "탄생"의 **신규·독립** 로컬 개발 프로젝트입니다.

> ⚠️ 이 프로젝트는 기존에 운영 중인 스마트팜 환경제어시스템 및 `www.tansaeng.com`과
> **완전히 분리된 코드베이스**입니다. 자세한 안전 경계는 [`docs/SAFETY_BASELINE.md`](./docs/SAFETY_BASELINE.md)를 반드시 먼저 읽으세요.

## 1. 요구 사항

- Node.js 20 LTS 이상
- npm 10 이상
- (M1 이후) PostgreSQL 16 — 이 프로젝트 전용 인스턴스만 사용, 기존 DB 재사용 금지

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

개발 서버 기본 주소: **http://127.0.0.1:3210** (포트 충돌 시 `next dev -p <포트>`로 변경, 포트 제안값은
`docs/SAFETY_BASELINE.md` §2 참고)

package.json의 `dev` 스크립트에 포트가 고정되어 있지 않다면 아래처럼 실행합니다.

```bash
npx next dev -p 3210
```

## 3. 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 빌드 산출물 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run typecheck` | TypeScript strict 타입 검사 (`tsc --noEmit`) |
| `npm test` | Vitest 단위 테스트 |

## 4. 현재 진행 단계 (M0)

- [x] 안전 경계 확인 및 `docs/SAFETY_BASELINE.md` 작성
- [x] Next.js(App Router) + TypeScript strict + Tailwind CSS 4 스캐폴드
- [x] 구매자/판매자/관리자 반응형 레이아웃 뼈대 및 정보구조(IA) 라우트 자리표시자
- [x] Vitest 테스트 실행 환경
- [ ] 실제 DB(PostgreSQL/Prisma) 연결 — M1에서 진행
- [ ] 실제 로그인/인가, 상품 데이터, 찜 기능 — M1에서 진행

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
