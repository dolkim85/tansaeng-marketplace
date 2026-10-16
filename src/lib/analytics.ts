/** 지정한 날짜들을 UTC 날짜(YYYY-MM-DD) 기준으로 최근 `days`일 버킷에 집계한다. */
export function bucketDailyCounts(
  dates: Date[],
  days: number,
  now: Date = new Date()
): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const d of dates) {
    const key = d.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const buckets: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    buckets.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return buckets;
}

/** 0으로 나누기를 방지한 퍼센트 계산(소수점 1자리 반올림). */
export function safeRatePercent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}
