import { listAuditLogs } from "@/server/audit/queries";
import { AUDIT_ACTION_LABEL } from "@/lib/auditLabels";

export default async function AdminAuditPage() {
  const logs = await listAuditLogs();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs text-brand-deepgreen/50">/admin/audit</p>
      <h1 className="mt-1 text-2xl font-semibold text-brand-deepgreen">
        관리자 작업이력
      </h1>
      <p className="mt-1 text-xs text-brand-deepgreen/60">
        승인/반려/삭제 등 관리자의 주요 작업만 기록합니다(단순 조회는 기록하지 않음). 최근{" "}
        {logs.length}건 표시.
      </p>

      {logs.length === 0 ? (
        <p className="mt-6 text-sm text-brand-deepgreen/60">
          기록된 작업이력이 없습니다.
        </p>
      ) : (
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-deepgreen/15 text-xs text-brand-deepgreen/50">
              <th className="py-2">시각</th>
              <th className="py-2">작업자</th>
              <th className="py-2">작업</th>
              <th className="py-2">대상</th>
              <th className="py-2">상세</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-brand-deepgreen/5">
                <td className="py-2 text-xs text-brand-deepgreen/60">
                  {log.createdAt.toLocaleString("ko-KR")}
                </td>
                <td className="py-2">{log.actor.name}</td>
                <td className="py-2">
                  {AUDIT_ACTION_LABEL[log.action] ?? log.action}
                </td>
                <td className="py-2 text-xs text-brand-deepgreen/50">
                  {log.targetType}#{log.targetId.slice(-8)}
                </td>
                <td className="py-2 text-xs text-brand-deepgreen/70">
                  {log.detail ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
