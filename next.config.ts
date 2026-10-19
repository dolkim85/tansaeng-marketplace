import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 탄생 마켓플레이스는 장바구니·주문·관리자 등 대부분 화면이 사용자별 동적 렌더링이 필요하다.
  // Cache Components(신규 정적 우선 캐싱 모델)는 M1 이후 SEO가 중요한 공개 상품/카테고리
  // 페이지에 한해 "use cache" 지시어와 함께 선택적으로 재도입을 검토한다.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // 기본적인 보안 헤더만 적용한다. Content-Security-Policy는 Next dev 모드의 HMR/eval,
  // Google Fonts 등 실제 운영 도메인 확정 전까지 정확한 소스 목록을 정하기 어려워
  // 의도적으로 보류한다(docs/PRODUCT_DECISIONS.md 참고) — 운영 배포 직전에 별도로 추가한다.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
