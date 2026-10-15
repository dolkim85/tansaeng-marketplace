# ARCHITECTURE — 탄생 마켓플레이스

> M0 시점 기준 초안. 실제 구현이 진행될수록 갱신한다.

## 1. 경계 원칙

이 저장소(`/mnt/d/dev/tansaeng-marketplace`)는 기존 스마트팜 환경제어시스템 및
`www.tansaeng.com` 운영 서비스와 **코드/런타임/네트워크/DB/스토리지를 완전히 분리**한 독립 애플리케이션이다.
상세 근거는 [`SAFETY_BASELINE.md`](./SAFETY_BASELINE.md) 참조.

## 2. 논리 구성 (목표 아키텍처)

```text
UI (Buyer / Seller / Admin, 반응형 + PWA)
  -> Next.js App Router (서버 컴포넌트 + 서버 액션 / route handlers)
     -> src/server  (auth, permissions, services, repositories)
        -> Prisma Client -> PostgreSQL (전용, 127.0.0.1:55432)
     -> 파일 스토리지 어댑터 (초기: 로컬 디렉토리 Mock / 추후: MinIO 127.0.0.1:59000)
     -> Mock PG / Mock 알림 어댑터 (실제 공급자 연동 전)
```

## 3. 현재(M0) 구현 상태

- Next.js 16 (App Router, TypeScript strict, Tailwind CSS 4) 스캐폴드만 존재.
- 실제 DB/Prisma 연결 없음 — M1에서 도입 예정.
- 실제 파일 업로드/스토리지 없음 — M1에서 도입 예정.
- 결제/알림은 전부 추후 Mock으로 구현 예정, 현재는 라우트 자리표시자만 존재.

## 4. 저장소 구조

```text
tansaeng-marketplace/
  src/app/                 라우트 (buyer, seller, admin)
  src/components/          공통 UI
  src/features/            도메인별 기능 모듈 (추후)
  src/server/               auth, permissions, services, repositories (추후)
  src/lib/                 공통 유틸/설정
  prisma/                  DB 스키마 (추후 M1)
  public/                  정적 자산, PWA manifest
  tests/                   단위/통합/E2E
  docs/                    정책·안전기준·진행문서
  scripts/                 본 프로젝트 전용 로컬 스크립트
  .env.example
  README.md
```

## 5. 외부 서비스 경계

| 외부 요소 | M0 상태 | 향후 계획 |
|---|---|---|
| PostgreSQL | 미설치 | M1에서 로컬 전용 인스턴스 신규 설치, 포트 55432 |
| 객체 스토리지 | 없음 | 로컬 디렉토리 Mock → 필요 시 MinIO(Docker) 검토 |
| 결제(PG) | 없음 | Mock PG 인터페이스만, 실키 사용 금지 |
| 알림(SMS/카카오/푸시) | 없음 | Mock 발송 로그만, 실발송 금지 |
| 기존 스마트팜 MQTT/ESP32/Node-RED | 연결 안 함 | 연결 계획 없음(설계상 완전 분리) |
| 기존 운영 DB/서버 | 연결 안 함 | 연결 금지 |
