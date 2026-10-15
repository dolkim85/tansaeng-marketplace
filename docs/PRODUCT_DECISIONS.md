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

## M1에서 추가로 결정한 사항

| 결정 | 이유 |
|---|---|
| DB를 사용자 선택에 따라 **SQLite로 우선 구현** (M2 진입 전 PostgreSQL 전환 예정) | 로컬 PostgreSQL 설치에 `sudo` 비밀번호가 필요해 에이전트가 직접 실행할 수 없었음. 사용자에게 (1)SQLite 우선 (2)직접 sudo 실행 (3)Docker 활성화 중 선택지를 제시했고 SQLite를 선택받음 |
| NextAuth(Auth.js) 대신 **커스텀 세션(bcryptjs+jose+httpOnly 쿠키)** 채택 | 이 프로젝트는 Next.js 16(매우 최신, 베타 성격의 Cache Components 등 포함)을 사용 중이라 NextAuth v5(beta)와의 호환성 리스크가 있다고 판단. 표준 OWASP 권장 요소(단방향 해시, 서명된 세션, HttpOnly/SameSite 쿠키)는 그대로 충족 |
| `next.config.ts`의 `cacheComponents`/`partialPrefetching` 비활성 유지(M0 결정 유지) | M1에서도 로그인 세션·장바구니 등 사용자별 동적 렌더링이 대부분이라 여전히 불필요 |
| `middleware.ts` → **`proxy.ts`로 전환** | Next.js 16.4.1 빌드 시 "middleware 컨벤션은 deprecated, proxy로 이름 변경됨" 경고 발생. 공식 마이그레이션 가이드대로 파일명/함수명만 변경(`middleware` → `proxy`), 동작은 동일 |
| `next dev`/`next start`에 **`-H 127.0.0.1` 명시** | `-H` 생략 시 Node 기본 동작으로 `0.0.0.0`(모든 인터페이스)에 바인딩됨을 실측으로 발견(`docs/SAFETY_BASELINE.md` §6-A). 안전기준 위반 가능성을 코드로 고정해 방지 |
| 판매자 승인 전 상품은 `DRAFT`, 승인 후 상품은 `ON_SALE`로 자동 분기 | 마스터 문서 2장의 "판매자(심사대기): 판매 게시 불가, 초안 가능" 요건을 코드로 구현. 승인 시점에 기존 DRAFT 상품도 일괄 `ON_SALE`로 전환 |
| 상품 사진/영상 업로드는 **M1 범위에서 제외** | M1 체크리스트가 넓어 핵심 거래 흐름(인증/카테고리/찜/입점심사)을 먼저 완성하고 검증하는 것을 우선함. 상세페이지는 "사진 없음" 플레이스홀더로 정직하게 표시 |
| `vitest`를 `^3`→`^4`로 업그레이드 | `npm audit`에서 `tinypool`의 치명적(critical) 프로토타입 오염 취약점 발견, 비파괴적 해결책이 메이저 업그레이드뿐이었음. 테스트 전용 devDependency라 런타임 영향 없음 확인 후 적용 |
| `eslint-config-next`의 `fast-glob` 체인, `prisma`의 `deepmerge-ts` 고위험 취약점은 **수용(accept)** | 둘 다 빌드/린트 전용 도구 체인이며 공개 인터넷에 노출되지 않는 로컬 개발 환경 한정. 수정하려면 Next 버전과 안 맞는 `eslint-config-next@14`로 강제 다운그레이드해야 해서 더 큰 위험(버전 불일치)을 감수해야 함 |

## 아직 미확정 (마스터 문서 20장 그대로 유지)

브랜드 최종 톤, 실제 판매 허용 카테고리 확정, 생산자 자격 법무 검토, 수수료율, 배송비 정책,
직접매입형 활성화 여부, 공동구매 환불 기준, 광고 과금 방식, 실제 PG/택배/알림 공급자,
기존 `www.tansaeng.com` 연결 방식 — 모두 서면 확정 전까지 로컬 Mock 기본값으로만 개발한다.
