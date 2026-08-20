import AsyncStorage from '@react-native-async-storage/async-storage';

import { archiveStore, goalStore, recordsStore, settingsStore } from '../store';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const goal = {
  id: 'g1',
  title: '토익 900점',
  area: 'job' as const,
  oneThing: '최소 1시간 문제 풀기',
  createdAt: '2026-08-20',
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('저장소 4개', () => {
  it('키가 서로 겹치지 않는다', async () => {
    await goalStore.save(goal);
    await recordsStore.save([{ date: '2026-08-20', done: true }]);
    await archiveStore.save([]);
    await settingsStore.save({ notificationTime: '07:00', celebrated66: false });

    expect(await goalStore.load()).toEqual(goal);
    expect(await recordsStore.load()).toEqual([{ date: '2026-08-20', done: true }]);
    expect(await archiveStore.load()).toEqual([]);
    expect(await settingsStore.load()).toEqual({ notificationTime: '07:00', celebrated66: false });
  });

  it('키는 앱 접두사를 쓴다 (다른 마이크로앱과 로그에서 구분)', async () => {
    await goalStore.save(goal);
    expect(await AsyncStorage.getItem('haruhana:goal')).not.toBeNull();
  });

  it('저장된 값이 없으면 null 이다 - 목표 없음은 온보딩 신호다', async () => {
    expect(await goalStore.load()).toBeNull();
  });

  it('깨진 값이 저장돼 있으면 null 로 떨어진다 (가드가 걸린다)', async () => {
    await AsyncStorage.setItem('haruhana:goal', JSON.stringify({ title: '제목만 있음' }));
    expect(await goalStore.load()).toBeNull();

    await AsyncStorage.setItem('haruhana:records', JSON.stringify([{ date: '어제', done: true }]));
    expect(await recordsStore.load()).toBeNull();
  });
});
