/**
 * 공동구매는 백그라운드 스케줄러 없이, openAt/closeAt과 현재 시각을 비교해
 * 화면 표시용 단계(phase)를 그때그때 계산한다. SUCCEEDED/FAILED/CANCELLED는
 * 관리자의 "마감 처리" 액션으로만 DB에 기록된다(문서 7.3 상태기계의 로컬 전용 단순화).
 */
export type GroupBuyPhase =
  | "TEASER"
  | "OPEN"
  | "AWAITING_FINALIZATION"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED";

export type GroupBuyTiming = {
  status: "SCHEDULED" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  openAt: Date;
  closeAt: Date;
};

export function computeGroupBuyPhase(
  gb: GroupBuyTiming,
  now: Date = new Date()
): GroupBuyPhase {
  if (gb.status === "SUCCEEDED") return "SUCCEEDED";
  if (gb.status === "FAILED") return "FAILED";
  if (gb.status === "CANCELLED") return "CANCELLED";

  if (now < gb.openAt) return "TEASER";
  if (now <= gb.closeAt) return "OPEN";
  return "AWAITING_FINALIZATION";
}

export const PHASE_LABEL: Record<GroupBuyPhase, string> = {
  TEASER: "오픈예정",
  OPEN: "진행중",
  AWAITING_FINALIZATION: "마감(결과 집계중)",
  SUCCEEDED: "성사됨",
  FAILED: "미성사(환불)",
  CANCELLED: "취소됨",
};
