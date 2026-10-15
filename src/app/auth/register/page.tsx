import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-brand-deepgreen">회원가입</h1>
      <p className="mt-1 text-xs text-brand-deepgreen/60">
        구매자 기본 가입만 지원합니다. 판매자 전환은 로그인 후 /seller/onboarding에서
        신청합니다.
      </p>
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-brand-deepgreen/70">
        이미 계정이 있으신가요?{" "}
        <Link href="/auth/login" className="font-semibold text-brand-green">
          로그인
        </Link>
      </p>
    </div>
  );
}
