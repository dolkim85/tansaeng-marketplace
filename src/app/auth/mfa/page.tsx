import { redirect } from "next/navigation";
import { getMfaPendingUserId } from "@/server/session";
import { MfaForm } from "./MfaForm";

export default async function MfaVerifyPage() {
  const userId = await getMfaPendingUserId();
  if (!userId) redirect("/auth/login");

  return (
    <div>
      <h1 className="text-lg font-semibold text-brand-deepgreen">2단계 인증</h1>
      <p className="mt-1 text-xs text-brand-deepgreen/70">
        인증 앱(Google Authenticator 등)의 6자리 코드를 입력하세요. 코드를 분실한
        경우 발급받은 복구 코드를 입력해도 됩니다.
      </p>
      <MfaForm />
    </div>
  );
}
