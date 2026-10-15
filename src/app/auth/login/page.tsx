import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/auth/login"
      title="로그인"
      description="구매자/판매자/관리자 공통 로그인(로컬 세션 기반, 자격증명은 Mock)."
      bullets={undefined}
    />
  );
}
