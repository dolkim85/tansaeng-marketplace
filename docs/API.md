# API — 탄생 마켓플레이스

> M0 시점: 실제 구현된 API 엔드포인트 없음 (라우트는 전부 UI 자리표시자).
> 마스터 문서 14장의 초기 설계 목록을 참고하며, 실제 구현 시 이 문서를 구현된 범위로 갱신한다.

엔드포인트 설계 초안: `TANSAENG_MARKETPLACE_CLAUDE_CODE_MASTER.md` 14장 참고.

M1에서 처음 구현될 것으로 예상되는 범위:
- `GET /api/catalog/categories`
- `GET /api/products`, `GET /api/products/:id`
- `POST/DELETE /api/wishlist/:productId`, `GET /api/wishlist`
- 인증(로그인/회원가입) 관련 엔드포인트 또는 서버 액션
