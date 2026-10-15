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
};

export default nextConfig;
