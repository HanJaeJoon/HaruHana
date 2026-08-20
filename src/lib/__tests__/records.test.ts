import type { DailyRecord } from '../model';
import {
  JOURNEY_TARGET,
  clearRecord,
  doneCount,
  findRecord,
  isEditable,
  journeyProgress,
  monthDensity,
  setRecord,
} from '../records';

const r = (date: string, done: boolean): DailyRecord => ({ date, done });

describe('findRecord', () => {
  it('없는 날짜는 undefined - 미기록은 항목 없음으로 표현한다', () => {
    const records = [r('2026-08-19', true)];
    expect(findRecord(records, '2026-08-19')).toEqual(r('2026-08-19', true));
    expect(findRecord(records, '2026-08-20')).toBeUndefined();
  });
});

describe('setRecord', () => {
  it('새 날짜를 추가하고 날짜 순으로 정렬한다', () => {
    const records = setRecord(setRecord([], '2026-08-20', true), '2026-08-19', false);
    expect(records).toEqual([r('2026-08-19', false), r('2026-08-20', true)]);
  });

  it('같은 날짜는 덮어쓴다 (하루에 항목 하나)', () => {
    const records = setRecord([r('2026-08-20', false)], '2026-08-20', true);
    expect(records).toEqual([r('2026-08-20', true)]);
  });

  it('입력 배열을 변경하지 않는다', () => {
    const before = [r('2026-08-19', true)];
    setRecord(before, '2026-08-20', true);
    expect(before).toEqual([r('2026-08-19', true)]);
  });
});

describe('clearRecord', () => {
  it('항목을 지워 미기록으로 되돌린다', () => {
    const records = clearRecord([r('2026-08-19', true), r('2026-08-20', false)], '2026-08-20');
    expect(records).toEqual([r('2026-08-19', true)]);
  });

  it('없는 날짜를 지워도 그대로다', () => {
    const before = [r('2026-08-19', true)];
    expect(clearRecord(before, '2026-08-20')).toEqual(before);
  });
});

describe('doneCount / journeyProgress', () => {
  it('누적은 done=true 개수다. 못 한 날과 미기록은 세지 않는다', () => {
    const records = [r('2026-08-17', true), r('2026-08-18', false), r('2026-08-20', true)];
    expect(doneCount(records)).toBe(2);
  });

  it('놓친 날이 있어도 0으로 리셋되지 않는다 (연속 아님)', () => {
    let records: DailyRecord[] = [];
    // 하루 해내고, 하루 못 하고, 다시 해낸다
    records = setRecord(records, '2026-08-18', true);
    records = setRecord(records, '2026-08-19', false);
    records = setRecord(records, '2026-08-20', true);
    expect(journeyProgress(records).doneDays).toBe(2);
  });

  it('66일에 도달하면 reached 가 참이 된다', () => {
    const under = Array.from({ length: JOURNEY_TARGET - 1 }, (_, i) =>
      r(`2026-01-${String(i + 1).padStart(2, '0')}`, true)
    );
    expect(journeyProgress(under).reached).toBe(false);

    const at = [...under, r('2026-03-01', true)];
    expect(journeyProgress(at)).toEqual({ doneDays: JOURNEY_TARGET, target: JOURNEY_TARGET, reached: true });
  });

  it('66일을 넘으면 누적이 계속 늘어난다 (진행 바 대신 누적 표기용)', () => {
    const over = Array.from({ length: JOURNEY_TARGET + 5 }, (_, i) => r(dayFrom(i), true));
    const progress = journeyProgress(over);
    expect(progress.doneDays).toBe(JOURNEY_TARGET + 5);
    expect(progress.reached).toBe(true);
  });
});

describe('monthDensity', () => {
  it('분모는 이번 달 오늘까지의 일수다', () => {
    const records = [r('2026-08-01', true), r('2026-08-02', false), r('2026-08-05', true)];
    expect(monthDensity(records, '2026-08-10')).toEqual({ done: 2, total: 10 });
  });

  it('다른 달의 기록은 세지 않는다', () => {
    const records = [r('2026-07-31', true), r('2026-08-03', true)];
    expect(monthDensity(records, '2026-08-05')).toEqual({ done: 1, total: 5 });
  });

  it('달의 첫날에도 분모가 1 이상이다 (0 으로 나누지 않게)', () => {
    expect(monthDensity([], '2026-08-01')).toEqual({ done: 0, total: 1 });
  });
});

describe('isEditable', () => {
  it('오늘과 어제만 수정 가능하고 그 이전은 잠긴다', () => {
    expect(isEditable('2026-08-20', '2026-08-20')).toBe(true);
    expect(isEditable('2026-08-19', '2026-08-20')).toBe(true);
    expect(isEditable('2026-08-18', '2026-08-20')).toBe(false);
  });

  it('미래 날짜는 수정 대상이 아니다', () => {
    expect(isEditable('2026-08-21', '2026-08-20')).toBe(false);
  });

  it('월 경계에서도 어제를 정확히 본다', () => {
    expect(isEditable('2026-07-31', '2026-08-01')).toBe(true);
  });
});

// 1월 1일부터 i 일 뒤의 날짜 문자열
function dayFrom(i: number): string {
  const d = new Date(2026, 0, 1);
  d.setDate(d.getDate() + i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
