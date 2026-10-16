/** 초기 예시 중개수수료율. 품목/판매자/기간별 차등 요율은 미구현(확정 요율 아님 — 마스터 문서 11.1절). */
export const COMMISSION_RATE = 0.05;

export function calcSettlement(grossKrw: number, commissionRate: number = COMMISSION_RATE) {
  const commissionKrw = Math.round(grossKrw * commissionRate);
  const payoutKrw = grossKrw - commissionKrw;
  return { grossKrw, commissionRate, commissionKrw, payoutKrw };
}
