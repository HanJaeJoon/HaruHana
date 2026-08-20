import { compoundSeries, yearEndPoints } from '../compound';

// 독립 검증용 폐형식(closed form). 구현과 다른 방식으로 계산해 교차 확인한다.
// FV = P(1+r)^n + c((1+r)^n - 1)/r,  r = 0 이면 FV = P + c*n
function closedFormFutureValue(
  principal: number,
  contribution: number,
  annualRatePercent: number,
  years: number
): number {
  const n = years * 12;
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal + contribution * n;
  const growth = Math.pow(1 + r, n);
  return principal * growth + contribution * ((growth - 1) / r);
}

describe('compoundSeries 불변식', () => {
  const cases = [
    { principal: 0, monthlyContribution: 100, annualRatePercent: 5, years: 10 },
    { principal: 1_000_000, monthlyContribution: 0, annualRatePercent: 3.5, years: 20 },
    { principal: 500, monthlyContribution: 250.55, annualRatePercent: 7.25, years: 30 },
    { principal: 12_345.67, monthlyContribution: 89.01, annualRatePercent: 0.1, years: 1 },
    { principal: 100, monthlyContribution: 100, annualRatePercent: 12, years: 50 },
  ];

  it.each(cases)('스케줄 길이가 기간(개월)과 같다: %o', (input) => {
    const result = compoundSeries(input);
    expect(result.monthly).toHaveLength(input.years * 12);
  });

  it.each(cases)('원금 누계 + 이자 누계 == 최종 잔액: %o', (input) => {
    const result = compoundSeries(input);
    // 센트 정수로 계산하므로 정확히 일치해야 한다
    expect(cents(result.totalContributed) + cents(result.totalInterest)).toBe(
      cents(result.finalBalance)
    );
  });

  it.each(cases)('마지막 회차 잔액 == 최종 잔액: %o', (input) => {
    const result = compoundSeries(input);
    const last = result.monthly[result.monthly.length - 1];
    expect(last.balance).toBe(result.finalBalance);
    expect(last.contributed).toBe(result.totalContributed);
    expect(last.interest).toBe(result.totalInterest);
  });

  it.each(cases)('원금 누계 == 초기 원금 + 월 적립액 x 개월: %o', (input) => {
    const result = compoundSeries(input);
    const expected =
      cents(input.principal) + cents(input.monthlyContribution) * input.years * 12;
    expect(cents(result.totalContributed)).toBe(expected);
  });

  it.each(cases)('잔액은 단조 증가한다 (이율/적립액이 음수가 아니므로): %o', (input) => {
    const result = compoundSeries(input);
    for (let i = 1; i < result.monthly.length; i += 1) {
      expect(result.monthly[i].balance).toBeGreaterThanOrEqual(result.monthly[i - 1].balance);
    }
  });

  it.each(cases)('이자 누계는 감소하지 않는다: %o', (input) => {
    const result = compoundSeries(input);
    for (let i = 1; i < result.monthly.length; i += 1) {
      expect(result.monthly[i].interest).toBeGreaterThanOrEqual(result.monthly[i - 1].interest);
    }
  });
});

describe('이율 0%', () => {
  it('이자가 정확히 0 이고 잔액은 넣은 만큼이다', () => {
    const result = compoundSeries({
      principal: 1000,
      monthlyContribution: 50,
      annualRatePercent: 0,
      years: 10,
    });
    expect(result.totalInterest).toBe(0);
    expect(result.finalBalance).toBe(1000 + 50 * 120);
    expect(result.totalContributed).toBe(result.finalBalance);
  });

  it('적립액도 0 이면 원금이 그대로 남는다', () => {
    const result = compoundSeries({
      principal: 777.77,
      monthlyContribution: 0,
      annualRatePercent: 0,
      years: 5,
    });
    expect(result.finalBalance).toBe(777.77);
    expect(result.totalInterest).toBe(0);
  });
});

describe('폐형식과의 교차 검증', () => {
  // 구현은 매 회차 이자를 센트로 반올림하므로 폐형식과 완전히 같을 수 없다.
  // 회차당 최대 0.5센트 오차가 복리로 누적되므로 개월 수에 비례한 허용 오차를 둔다.
  const cases = [
    { principal: 0, monthlyContribution: 100, annualRatePercent: 5, years: 10 },
    { principal: 10_000, monthlyContribution: 0, annualRatePercent: 6, years: 25 },
    { principal: 2_000, monthlyContribution: 300, annualRatePercent: 4.5, years: 15 },
  ];

  it.each(cases)('최종 잔액이 폐형식 값과 일치한다 (반올림 오차 범위): %o', (input) => {
    const result = compoundSeries(input);
    const expected = closedFormFutureValue(
      input.principal,
      input.monthlyContribution,
      input.annualRatePercent,
      input.years
    );
    const tolerance = 0.01 * input.years * 12;
    expect(Math.abs(result.finalBalance - expected)).toBeLessThanOrEqual(tolerance);
  });
});

describe('극단 입력', () => {
  it('기간 0 이면 스케줄이 비고 원금만 남는다', () => {
    const result = compoundSeries({
      principal: 500,
      monthlyContribution: 100,
      annualRatePercent: 5,
      years: 0,
    });
    expect(result.monthly).toEqual([]);
    expect(result.finalBalance).toBe(500);
    expect(result.totalContributed).toBe(500);
    expect(result.totalInterest).toBe(0);
  });

  it('원금과 적립액이 모두 0 이면 전부 0 이다', () => {
    const result = compoundSeries({
      principal: 0,
      monthlyContribution: 0,
      annualRatePercent: 10,
      years: 10,
    });
    expect(result.finalBalance).toBe(0);
    expect(result.totalInterest).toBe(0);
    expect(result.monthly).toHaveLength(120);
  });

  it('최대 기간(100년 = 1200회차)도 계산된다', () => {
    const result = compoundSeries({
      principal: 100,
      monthlyContribution: 10,
      annualRatePercent: 5,
      years: 100,
    });
    expect(result.monthly).toHaveLength(1200);
    expect(cents(result.totalContributed) + cents(result.totalInterest)).toBe(
      cents(result.finalBalance)
    );
  });

  it.each([
    { principal: -1, monthlyContribution: 0, annualRatePercent: 5, years: 10 },
    { principal: 0, monthlyContribution: -1, annualRatePercent: 5, years: 10 },
    { principal: 0, monthlyContribution: 0, annualRatePercent: -1, years: 10 },
    { principal: 0, monthlyContribution: 0, annualRatePercent: 5, years: -1 },
    { principal: 0, monthlyContribution: 0, annualRatePercent: 5, years: 1.5 },
    { principal: 0, monthlyContribution: 0, annualRatePercent: 5, years: 101 },
    { principal: NaN, monthlyContribution: 0, annualRatePercent: 5, years: 10 },
    { principal: Infinity, monthlyContribution: 0, annualRatePercent: 5, years: 10 },
  ])('잘못된 입력은 RangeError 로 거부한다: %o', (input) => {
    expect(() => compoundSeries(input)).toThrow(RangeError);
  });
});

describe('yearEndPoints', () => {
  it('연말 시점만 뽑고 개수는 연수와 같다', () => {
    const result = compoundSeries({
      principal: 0,
      monthlyContribution: 100,
      annualRatePercent: 5,
      years: 7,
    });
    const points = yearEndPoints(result);
    expect(points).toHaveLength(7);
    expect(points.map((p) => p.month)).toEqual([12, 24, 36, 48, 60, 72, 84]);
    expect(points[points.length - 1].balance).toBe(result.finalBalance);
  });

  it('기간 0 이면 빈 배열', () => {
    const result = compoundSeries({
      principal: 100,
      monthlyContribution: 0,
      annualRatePercent: 5,
      years: 0,
    });
    expect(yearEndPoints(result)).toEqual([]);
  });
});

function cents(amount: number): number {
  return Math.round(amount * 100);
}
