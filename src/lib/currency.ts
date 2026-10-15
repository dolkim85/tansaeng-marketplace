/**
 * 원화 정수 포맷 유틸.
 * 문서 13장 "데이터 무결성 원칙": 금액은 부동소수점 금지, 원화 정수(또는 Decimal)로 저장.
 * 이 함수는 저장된 정수 원화 금액을 화면 표시용 문자열로만 변환한다.
 */
export function formatKRW(amount: number): string {
  if (!Number.isInteger(amount)) {
    throw new RangeError(`원화 금액은 정수여야 합니다: ${amount}`);
  }
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function sumKRW(amounts: number[]): number {
  return amounts.reduce((total, amount) => {
    if (!Number.isInteger(amount)) {
      throw new RangeError(`원화 금액은 정수여야 합니다: ${amount}`);
    }
    return total + amount;
  }, 0);
}
