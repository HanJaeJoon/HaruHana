import { dayOfMonth, isDateString, monthOf, shiftDays, toDateString, today, yesterday } from '../dates';

describe('toDateString', () => {
  it('로컬 기준 YYYY-MM-DD 로 만든다', () => {
    // Date 의 월은 0-based. 로컬 자정 직후와 자정 직전이 같은 날로 나와야 한다.
    expect(toDateString(new Date(2026, 7, 20, 0, 0, 0))).toBe('2026-08-20');
    expect(toDateString(new Date(2026, 7, 20, 23, 59, 59))).toBe('2026-08-20');
  });

  it('월과 일을 두 자리로 채운다', () => {
    expect(toDateString(new Date(2026, 0, 1))).toBe('2026-01-01');
  });
});

describe('today / yesterday', () => {
  it('주어진 시각의 로컬 날짜를 쓴다', () => {
    const now = new Date(2026, 7, 20, 13, 0, 0);
    expect(today(now)).toBe('2026-08-20');
    expect(yesterday(now)).toBe('2026-08-19');
  });

  it('월 경계를 넘는다', () => {
    expect(yesterday(new Date(2026, 7, 1, 9, 0, 0))).toBe('2026-07-31');
  });

  it('연 경계를 넘는다', () => {
    expect(yesterday(new Date(2026, 0, 1, 9, 0, 0))).toBe('2025-12-31');
  });
});

describe('shiftDays', () => {
  it('앞뒤로 이동한다', () => {
    expect(shiftDays('2026-08-20', 1)).toBe('2026-08-21');
    expect(shiftDays('2026-08-20', -1)).toBe('2026-08-19');
    expect(shiftDays('2026-08-20', 0)).toBe('2026-08-20');
  });

  it('윤년 2월을 정확히 넘는다', () => {
    expect(shiftDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(shiftDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('월/연 경계에서 DST 와 무관하게 날짜만 움직인다', () => {
    expect(shiftDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(shiftDays('2026-01-01', -1)).toBe('2025-12-31');
    // 서머타임 전환일(예시: 미국 3월 둘째 주 일요일) 주변에서도 하루씩 움직인다
    expect(shiftDays('2026-03-08', 1)).toBe('2026-03-09');
    expect(shiftDays('2026-03-08', -1)).toBe('2026-03-07');
  });
});

describe('isDateString', () => {
  it('YYYY-MM-DD 형식만 통과시킨다', () => {
    expect(isDateString('2026-08-20')).toBe(true);
    expect(isDateString('2026-8-20')).toBe(false);
    expect(isDateString('20260820')).toBe(false);
    expect(isDateString('')).toBe(false);
    expect(isDateString(20260820)).toBe(false);
    expect(isDateString(null)).toBe(false);
  });

  it('형식은 맞지만 존재하지 않는 날짜는 거부한다', () => {
    expect(isDateString('2026-02-30')).toBe(false);
    expect(isDateString('2026-13-01')).toBe(false);
    expect(isDateString('2026-00-10')).toBe(false);
    expect(isDateString('2028-02-29')).toBe(true);
  });
});

describe('monthOf / dayOfMonth', () => {
  it('월 키와 일자를 뽑는다', () => {
    expect(monthOf('2026-08-20')).toBe('2026-08');
    expect(dayOfMonth('2026-08-20')).toBe(20);
    expect(dayOfMonth('2026-08-01')).toBe(1);
  });
});
