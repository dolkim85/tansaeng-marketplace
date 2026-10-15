import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-brand-deepgreen">로그인</h1>
      <p className="mt-1 text-xs text-brand-deepgreen/60">
        데모 계정: buyer_demo@tansaeng.local / seller.approved@tansaeng.local /
        admin_demo@tansaeng.local (비밀번호: demo1234)
      </p>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-brand-deepgreen/70">
        아직 계정이 없으신가요?{" "}
        <Link href="/auth/register" className="font-semibold text-brand-green">
          회원가입
        </Link>
      </p>
    </div>
  );
}
