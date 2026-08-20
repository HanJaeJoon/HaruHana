// 날짜는 기기 로컬 기준 YYYY-MM-DD 문자열로만 다룬다.
//
// 문자열을 new Date('2026-08-20') 으로 파싱하면 UTC 자정으로 해석돼 시간대에 따라
// 하루가 밀린다. 그래서 파싱은 항상 숫자 3개를 뽑아 로컬 Date 로 만든다.

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function today(now: Date = new Date()): string {
  return toDateString(now);
}

export function yesterday(now: Date = new Date()): string {
  return shiftDays(toDateString(now), -1);
}

export function shiftDays(date: string, delta: number): string {
  const [y, m, d] = splitDate(date);
  // 정오를 기준으로 움직인다. 서머타임 전환일에 자정 기준으로 더하면 날짜가 밀릴 수 있다.
  const shifted = new Date(y, m - 1, d + delta, 12);
  return toDateString(shifted);
}

export function isDateString(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const [y, m, d] = splitDate(value);
  if (m < 1 || m > 12 || d < 1) return false;
  // 존재하지 않는 날짜(2026-02-30)는 Date 가 다음 달로 넘겨버리므로 되돌려 비교한다.
  const parsed = new Date(y, m - 1, d, 12);
  return parsed.getFullYear() === y && parsed.getMonth() === m - 1 && parsed.getDate() === d;
}

/** 'YYYY-MM' - 월 단위 집계와 달력 이동에 쓴다. */
export function monthOf(date: string): string {
  return date.slice(0, 7);
}

export function dayOfMonth(date: string): number {
  return splitDate(date)[2];
}

function splitDate(date: string): [number, number, number] {
  const parts = date.split('-');
  return [Number(parts[0]), Number(parts[1]), Number(parts[2])];
}
