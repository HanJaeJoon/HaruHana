// 복리 적립 계산. 스타터의 예시 도메인이다.
//
// 금액은 전부 "센트"(통화 최소 단위) 정수로 계산한다.
// 부동소수점으로 누적하면 원금 합계 + 이자 합계 != 최종 잔액 이 되고,
// 이율 0% 에서 이자가 정확히 0 이라는 보장도 깨진다.
// 표시용 반올림은 화면이 하고, 여기서는 정수 불변식을 지킨다.

export type CompoundInput = {
  /** 초기 원금 */
  principal: number;
  /** 매월 적립액 */
  monthlyContribution: number;
  /** 연이율 (%). 0 허용 */
  annualRatePercent: number;
  /** 적립 기간 (년) */
  years: number;
};

export type CompoundPoint = {
  /** 1부터 시작하는 회차 */
  month: number;
  /** 해당 회차 말 잔액 */
  balance: number;
  /** 해당 회차까지 넣은 원금 누계 (초기 원금 포함) */
  contributed: number;
  /** 해당 회차까지 붙은 이자 누계 */
  interest: number;
};

export type CompoundResult = {
  finalBalance: number;
  totalContributed: number;
  totalInterest: number;
  /** 길이는 정확히 years * 12 */
  monthly: CompoundPoint[];
};

const MAX_YEARS = 100;

export function compoundSeries(input: CompoundInput): CompoundResult {
  const { principal, monthlyContribution, annualRatePercent, years } = input;

  if (!Number.isFinite(principal) || principal < 0) {
    throw new RangeError('principal 은 0 이상의 유한한 수여야 합니다');
  }
  if (!Number.isFinite(monthlyContribution) || monthlyContribution < 0) {
    throw new RangeError('monthlyContribution 은 0 이상의 유한한 수여야 합니다');
  }
  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) {
    throw new RangeError('annualRatePercent 은 0 이상의 유한한 수여야 합니다');
  }
  if (!Number.isInteger(years) || years < 0 || years > MAX_YEARS) {
    throw new RangeError(`years 는 0 이상 ${MAX_YEARS} 이하의 정수여야 합니다`);
  }

  const months = years * 12;
  const monthlyRate = annualRatePercent / 100 / 12;

  const startCents = toCents(principal);
  const contributionCents = toCents(monthlyContribution);

  let balanceCents = startCents;
  let contributedCents = startCents;
  let interestCents = 0;

  const monthly: CompoundPoint[] = [];

  for (let month = 1; month <= months; month += 1) {
    // 이자는 회차 시작 잔액에 붙고, 적립은 회차 말에 들어간다 (기말 적립)
    const monthInterest = Math.round(balanceCents * monthlyRate);
    balanceCents += monthInterest + contributionCents;
    contributedCents += contributionCents;
    interestCents += monthInterest;

    monthly.push({
      month,
      balance: fromCents(balanceCents),
      contributed: fromCents(contributedCents),
      interest: fromCents(interestCents),
    });
  }

  return {
    finalBalance: fromCents(balanceCents),
    totalContributed: fromCents(contributedCents),
    totalInterest: fromCents(interestCents),
    monthly,
  };
}

/** 차트용으로 연말 시점만 뽑는다. years 가 0 이면 빈 배열. */
export function yearEndPoints(result: CompoundResult): CompoundPoint[] {
  return result.monthly.filter((p) => p.month % 12 === 0);
}

function toCents(amount: number): number {
  return Math.round(amount * 100);
}

function fromCents(cents: number): number {
  return cents / 100;
}
