# PRODUCT DECISIONS — 탄생 마켓플레이스

> 마스터 명세서(`TANSAENG_MARKETPLACE_CLAUDE_CODE_MASTER.md`) 1.3/20장 기준으로,
> M0 구현 과정에서 실제로 선택한 기본값과 그 이유를 기록한다. 법적/세무/계약 판단은 포함하지 않는다.

## 확정 사항 (마스터 문서 그대로 적용)

- 브랜드명 "탄생 / TANSAENG", 웹+PWA, 로컬 선개발.
- 기존 환경제어·운영 홈페이지와 완전 분리.
- 직접판매형(`DIRECT_SALE_ENABLED`) 기본 `false`.
- 실PG/실SMS/실카카오/실푸시 전부 Mock, 기본 비활성.

## M0에서 추가로 결정한 사항

| 결정 | 이유 |
|---|---|
| Next.js 16(App Router) + Tailwind CSS 4 + TypeScript strict 채택 | 마스터 문서 12.1 권장안과 일치, 생성 시점 기준 안정 최신 버전 |
| `next.config.ts`의 `cacheComponents`/`partialPrefetching` 비활성화 | 이 신규 버전의 기본 템플릿이 활성화하는 실험적 정적 우선 캐싱 모델이 `usePathname()` 등 런타임 훅과 충돌해 빌드 실패 발생. 마켓플레이스는 장바구니·주문·관리자 등 대부분 사용자별 동적 렌더링이 필요해 M0에서는 끄는 것이 안전. M1 이후 SEO가 중요한 공개 상품/카테고리 목록에 한해 `"use cache"`와 함께 선택적 재도입 검토 |
| IA(정보구조) 라우트를 공용 `PlaceholderSection` 컴포넌트로 일괄 생성 | 40개 이상의 라우트 뼈대를 각각 손으로 작성하면 중복이 커짐. 실제 기능은 M1부터 개별 구현 |
| M0 단계에서 실제 PostgreSQL/Prisma 연결 보류 | 마스터 문서 17장 M0 범위는 "안전한 프로젝트 기반"이며 DB/스토리지는 M1에서 본격 도입. 이 머신에 PostgreSQL이 아직 설치되어 있지 않아(§SAFETY_BASELINE §3) 설치 여부를 M1 착수 시 사용자에게 먼저 확인 |
| `node_modules`를 프로젝트 폴더(Windows 드라이브, `/mnt/d/...`)에 두지 않고 로컬 검증은 별도 네이티브 경로에서 수행 | WSL에서 Windows 드라이브(drvfs)로 수만 개의 작은 파일을 쓰는 `npm install`이 비정상적으로 느림(실측: 네이티브 8~9초 vs drvfs에서 10분 이상 진행 중 중단). `node_modules`는 원래 Git에도 커밋되지 않는 산출물이므로, 실제 개발 시 Windows 네이티브 Node 또는 WSL 네이티브 경로에서 `npm install`을 직접 실행하도록 README에 안내 |

## 아직 미확정 (마스터 문서 20장 그대로 유지)

브랜드 최종 톤, 실제 판매 허용 카테고리 확정, 생산자 자격 법무 검토, 수수료율, 배송비 정책,
직접매입형 활성화 여부, 공동구매 환불 기준, 광고 과금 방식, 실제 PG/택배/알림 공급자,
기존 `www.tansaeng.com` 연결 방식 — 모두 서면 확정 전까지 로컬 Mock 기본값으로만 개발한다.
