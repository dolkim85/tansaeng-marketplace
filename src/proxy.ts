import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);
const SELLER_ROLES = new Set(["SELLER", "ADMIN", "SUPER_ADMIN"]);

function loginRedirect(req: NextRequest) {
  const url = new URL("/auth/login", req.url);
  url.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function proxy(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!session) return loginRedirect(req);
    if (!ADMIN_ROLES.has(session.role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/seller")) {
    if (!session) return loginRedirect(req);
    if (!SELLER_ROLES.has(session.role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // 로그인은 필요하지만 역할 제한은 없는 구매자 개인화 페이지
  if (!session) return loginRedirect(req);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/seller/:path*",
    "/account",
    "/wishlist",
    "/following",
    "/cart",
    "/checkout",
    "/orders/:path*",
  ],
};
