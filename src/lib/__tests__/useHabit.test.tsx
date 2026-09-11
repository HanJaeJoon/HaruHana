import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import type { Area, Goal } from '../model';
import { goalStore, recordsStore } from '../store';
import { useHabitState } from '../useHabit';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// 알림은 네이티브 모듈이라 테스트 환경에 없다. 호출 여부만 관찰한다.
jest.mock('../notifications', () => ({ syncDailyReminder: jest.fn(async () => undefined) }));

const goal: Goal = {
  id: 'g1',
  title: '토익 900점',
  area: 'job',
  oneThing: '최소 1시간 문제 풀기',
  createdAt: '2026-06-01',
};

const records = [
  { date: '2026-06-01', done: true },
  { date: '2026-06-02', done: true },
];

type State = ReturnType<typeof useHabitState>;

function Probe({ onState }: { onState: (state: State) => void }) {
  onState(useHabitState());
  return null;
}

/** 훅을 한 번 마운트하고 저장된 값을 다 읽어 들인 상태의 반환값을 준다. */
async function mountHabit(): Promise<{ current: () => State; renderer: ReactTestRenderer }> {
  let latest: State | null = null;
  let renderer: ReactTestRenderer | null = null;
  await act(async () => {
    renderer = create(<Probe onState={(state) => (latest = state)} />);
  });
  return {
    current: () => {
      if (!latest) throw new Error('훅이 아직 마운트되지 않았습니다.');
      return latest;
    },
    renderer: renderer as unknown as ReactTestRenderer,
  };
}

beforeEach(async () => {
  jest.clearAllMocks();
  await goalStore.save(goal);
  await recordsStore.save(records);
});

describe('useHabitState().updateGoal', () => {
  it('제목과 영역을 바꿔 저장한다', async () => {
    const habit = await mountHabit();
    await act(async () => habit.current().updateGoal({ title: ' 토익 950점 ', area: 'personal' }));

    expect(habit.current().goal?.title).toBe('토익 950점');
    expect(habit.current().goal?.area).toBe('personal');
    expect(await goalStore.load()).toEqual({ ...goal, title: '토익 950점', area: 'personal' });
    await act(async () => habit.renderer.unmount());
  });

  it('기록과 createdAt/id 는 그대로 둔다 (66일 카운트가 유지된다)', async () => {
    const habit = await mountHabit();
    await act(async () => habit.current().updateGoal({ title: '새 제목' }));

    expect(habit.current().records).toEqual(records);
    expect(habit.current().goal?.id).toBe(goal.id);
    expect(habit.current().goal?.createdAt).toBe(goal.createdAt);
    expect(await recordsStore.load()).toEqual(records);
    await act(async () => habit.renderer.unmount());
  });

  it('영역을 주지 않으면 태그를 뗀다', async () => {
    const habit = await mountHabit();
    await act(async () => habit.current().updateGoal({ title: '새 제목' }));

    expect(habit.current().goal?.area).toBeUndefined();
    await act(async () => habit.renderer.unmount());
  });

  it('빈 제목은 저장하지 않는다', async () => {
    const habit = await mountHabit();
    await act(async () => habit.current().updateGoal({ title: '   ', area: 'body' as Area }));

    expect(habit.current().goal).toEqual(goal);
    expect(await goalStore.load()).toEqual(goal);
    await act(async () => habit.renderer.unmount());
  });

  it('알림 문구는 오늘의 하나만 쓰므로 재예약하지 않는다', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { syncDailyReminder } = require('../notifications') as { syncDailyReminder: jest.Mock };
    const habit = await mountHabit();
    syncDailyReminder.mockClear();

    await act(async () => habit.current().updateGoal({ title: '새 제목' }));
    expect(syncDailyReminder).not.toHaveBeenCalled();

    // 대칭 확인: 오늘의 하나를 고치면 문구가 바뀌므로 다시 예약한다.
    await act(async () => habit.current().updateOneThing('30분 듣기'));
    expect(syncDailyReminder).toHaveBeenCalledWith(null, '30분 듣기');
    await act(async () => habit.renderer.unmount());
  });
});
