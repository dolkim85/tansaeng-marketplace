import type { MetadataRoute } from "next";

/// 로그인 필요 개인화 페이지·관리자/판매자 대시보드는 검색엔진에 노출할 이유가 없어 차단한다.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/seller",
        "/account",
        "/cart",
        "/checkout",
        "/orders",
        "/alerts",
        "/wishlist",
        "/following",
        "/help",
        "/reviews",
        "/auth",
        "/api",
      ],
    },
  };
}
