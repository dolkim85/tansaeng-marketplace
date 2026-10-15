# ERD — 탄생 마켓플레이스

> M0 시점: 아직 실제 Prisma 스키마/DB가 없다. 마스터 문서 13장의 데이터 모델 초안을
> 참고용으로만 링크하고, 실제 ERD는 M1에서 PostgreSQL+Prisma 도입과 함께 작성한다.

- 엔터티 후보 전체 목록: `TANSAENG_MARKETPLACE_CLAUDE_CODE_MASTER.md` 13장 참고
- M1 착수 시 최소 범위: `users`, `profiles`, `addresses`, `sellers`, `seller_applications`,
  `categories`, `products`, `product_variants`, `product_media`, `wishlists`, `seller_follows`
- 이 문서는 실제 `prisma/schema.prisma` 작성 시점에 구체 ERD(필드/관계/인덱스)로 갱신한다.
