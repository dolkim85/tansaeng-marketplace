import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/auth/register"
      title="회원가입"
      description="구매자 기본 가입. 판매자 전환은 /seller/onboarding에서 별도 심사."
      bullets={undefined}
    />
  );
}
