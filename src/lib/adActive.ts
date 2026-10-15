export type AdTiming = {
  status: "REQUESTED" | "APPROVED" | "REJECTED";
  startAt: Date;
  endAt: Date;
};

/** 승인되었고 현재 시각이 집행 기간 안에 있을 때만 실제로 노출한다. */
export function isAdActive(ad: AdTiming, now: Date = new Date()): boolean {
  return ad.status === "APPROVED" && now >= ad.startAt && now <= ad.endAt;
}
