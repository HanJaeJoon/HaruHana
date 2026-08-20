import { buildMonthGrid, monthLength, shiftMonth } from '../calendar';
import { dayOfMonth, monthOf } from '../dates';

describe('monthLength', () => {
  it('달의 길이를 센다', () => {
    expect(monthLength('2026-08')).toBe(31);
    expect(monthLength('2026-04')).toBe(30);
    expect(monthLength('2026-02')).toBe(28);
    expect(monthLength('2028-02')).toBe(29);
  });
});

describe('shiftMonth', () => {
  it('앞뒤 달로 이동하며 연 경계를 넘는다', () => {
    expect(shiftMonth('2026-08', 1)).toBe('2026-09');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
  });
});

describe('buildMonthGrid', () => {
  const grid = buildMonthGrid('2026-08');
  const cells = grid.flat();

  it('주 단위로 7칸씩 채운다', () => {
    grid.forEach((week) => expect(week).toHaveLength(7));
  });

  it('그 달의 모든 날을 순서대로 한 번씩 담는다', () => {
    const dates = cells.filter((cell): cell is string => cell !== null);
    expect(dates).toHaveLength(31);
    expect(dates[0]).toBe('2026-08-01');
    expect(dates[30]).toBe('2026-08-31');
    expect(dates.every((d) => monthOf(d) === '2026-08')).toBe(true);
    expect(dates.map(dayOfMonth)).toEqual(Array.from({ length: 31 }, (_, i) => i + 1));
  });

  it('첫날은 그 요일 자리에 놓이고 앞은 빈 칸이다', () => {
    const weekday = new Date(2026, 7, 1).getDay();
    expect(grid[0][weekday]).toBe('2026-08-01');
    expect(grid[0].slice(0, weekday).every((cell) => cell === null)).toBe(true);
  });

  it('마지막 주의 남는 칸은 빈 칸이다', () => {
    const last = grid[grid.length - 1];
    const lastDateIndex = last.findLastIndex((cell) => cell !== null);
    expect(last.slice(lastDateIndex + 1).every((cell) => cell === null)).toBe(true);
  });

  it('2월처럼 짧은 달도 같은 규칙을 따른다', () => {
    const february = buildMonthGrid('2026-02');
    const dates = february.flat().filter((cell): cell is string => cell !== null);
    expect(dates).toHaveLength(28);
    expect(dates[0]).toBe('2026-02-01');
  });
});
