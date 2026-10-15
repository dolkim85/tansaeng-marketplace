import { PlaceholderSection } from "@/components/ui/PlaceholderSection";

export default function Page() {
  return (
    <PlaceholderSection
      path="/account"
      title="회원/주소/동의/보안 설정"
      description="회원 정보, 배송지, 약관 동의, 보안 설정을 관리합니다."
      bullets={["로그인/회원가입은 /auth 경로", "마케팅 동의 별도 관리"]}
    />
  );
}
