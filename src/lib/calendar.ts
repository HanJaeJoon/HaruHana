// 달력 그리드 계산. 달력 UI 는 의존성을 더하지 않고 자체 구현한다
// (무채색 방침과 "records prop 순수 컴포넌트" 제약을 통제하기 쉬운 쪽).

/** 'YYYY-MM' */
export type Month = string;

export function monthLength(month: Month): number {
  const [year, m] = splitMonth(month);
  // 다음 달 0일 = 이번 달 마지막 날
  return new Date(year, m, 0).getDate();
}

export function shiftMonth(month: Month, delta: number): Month {
  const [year, m] = splitMonth(month);
  const shifted = new Date(year, m - 1 + delta, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * 주 단위 7칸 배열. 날짜가 없는 칸은 null 이다.
 * 주는 일요일에 시작한다 (Date.getDay 와 같은 기준).
 */
export function buildMonthGrid(month: Month): (string | null)[][] {
  const [year, m] = splitMonth(month);
  const length = monthLength(month);
  const firstWeekday = new Date(year, m - 1, 1).getDay();

  const cells: (string | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= length; day += 1) {
    cells.push(`${month}-${String(day).padStart(2, '0')}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function splitMonth(month: Month): [number, number] {
  const parts = month.split('-');
  return [Number(parts[0]), Number(parts[1])];
}
