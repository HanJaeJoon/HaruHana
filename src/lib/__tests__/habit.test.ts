import { archiveGoal, editGoal, newGoal } from '../habit';
import type { DailyRecord, Goal } from '../model';

const goal: Goal = {
  id: 'g1',
  title: '토익 900점',
  oneThing: '최소 1시간 문제 풀기',
  createdAt: '2026-06-01',
};

describe('newGoal', () => {
  it('입력 문구의 앞뒤 공백을 정리해 담는다', () => {
    const g = newGoal({ title: '  토익 900점 ', oneThing: ' 1시간 문제 풀기  ', createdAt: '2026-08-20' });
    expect(g.title).toBe('토익 900점');
    expect(g.oneThing).toBe('1시간 문제 풀기');
    expect(g.createdAt).toBe('2026-08-20');
  });

  it('영역은 선택이며 주지 않으면 필드가 없다', () => {
    expect(newGoal({ title: 'a', oneThing: 'b', createdAt: '2026-08-20' }).area).toBeUndefined();
    expect(newGoal({ title: 'a', oneThing: 'b', area: 'body', createdAt: '2026-08-20' }).area).toBe('body');
  });

  it('id 는 목표마다 다르다', () => {
    const a = newGoal({ title: 'a', oneThing: 'b', createdAt: '2026-08-20' });
    const b = newGoal({ title: 'a', oneThing: 'b', createdAt: '2026-08-20' });
    expect(a.id).not.toBe(b.id);
  });
});

describe('archiveGoal', () => {
  const records: DailyRecord[] = [
    { date: '2026-06-01', done: true },
    { date: '2026-06-02', done: false },
  ];

  it('목표와 기록을 함께 담아 읽기 전용 항목으로 만든다', () => {
    const entry = archiveGoal(goal, records, '2026-08-20', 'achieved');
    expect(entry).toEqual({ goal, records, closedAt: '2026-08-20', outcome: 'achieved' });
  });

  it('아카이브는 최신 항목이 앞에 온다', () => {
    const first = archiveGoal(goal, [], '2026-07-01', 'closed');
    const second = archiveGoal({ ...goal, id: 'g2' }, [], '2026-08-20', 'achieved');
    const archive = [second, first];
    expect(archive.map((e) => e.closedAt)).toEqual(['2026-08-20', '2026-07-01']);
  });
});

describe('editGoal', () => {
  const tagged: Goal = { ...goal, area: 'job' };

  it('제목의 앞뒤 공백을 정리해 담는다', () => {
    expect(editGoal(goal, { title: '  토익 950점 ' }).title).toBe('토익 950점');
  });

  it('id, createdAt, oneThing 은 그대로 둔다 (같은 목표를 이어 간다)', () => {
    const next = editGoal(tagged, { title: '새 제목', area: 'body' });
    expect(next.id).toBe(goal.id);
    expect(next.createdAt).toBe(goal.createdAt);
    expect(next.oneThing).toBe(goal.oneThing);
  });

  it('영역을 바꾸거나 떼어 낼 수 있다', () => {
    expect(editGoal(tagged, { title: 'a', area: 'finance' }).area).toBe('finance');
    expect(editGoal(tagged, { title: 'a' }).area).toBeUndefined();
    expect('area' in editGoal(tagged, { title: 'a' })).toBe(false);
  });

  it('원본을 바꾸지 않는다', () => {
    editGoal(tagged, { title: '새 제목', area: 'body' });
    expect(tagged).toEqual({ ...goal, area: 'job' });
  });
});
