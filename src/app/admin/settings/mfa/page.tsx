import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { getSession } from "@/server/session";
import { getMfaStatus, getPendingTotpSecret } from "@/server/mfa/queries";
import { generateTotpUri } from "@/lib/totp";
import { MfaManager } from "./MfaManager";

export default async function MfaSetupPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const status = await getMfaStatus(session.sub);
  if (!status) redirect("/auth/login");

  let pendingSecret: string | undefined;
  let pendingQrDataUrl: string | undefined;
  if (status.enrollmentPending) {
    const pending = await getPendingTotpSecret(session.sub);
    if (pending) {
      pendingSecret = pending.secret;
      const uri = generateTotpUri(pending.secret, pending.email);
      pendingQrDataUrl = await QRCode.toDataURL(uri, { width: 220, margin: 1 });
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/70">/admin/settings/mfa</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        2단계 인증 설정
      </h1>
      <MfaManager
        initialEnabled={status.enabled}
        initialEnrollmentPending={status.enrollmentPending}
        initialRemainingRecoveryCodes={status.remainingRecoveryCodes}
        pendingSecret={pendingSecret}
        pendingQrDataUrl={pendingQrDataUrl}
      />
    </div>
  );
}
