// 저장소 4개를 화면이 쓸 하나의 상태로 묶는다.
//
// 파생값은 여기서 계산하지 않는다 - records 를 그대로 넘겨 화면이 records.ts 의
// 순수 함수로 계산하게 둔다 (달력도 records 를 prop 으로 받는 순수 컴포넌트다).

import { useCallback, useEffect, useState } from 'react';

import { archiveGoal, newGoal } from './habit';
import type { Area, DailyRecord, Goal, Outcome, Settings } from './model';
import { clearRecord, setRecord } from './records';
import { INITIAL_SETTINGS, archiveStore, goalStore, recordsStore, settingsStore } from './store';

export type HabitStatus = 'loading' | 'onboarding' | 'ready';

export type NewGoalInput = {
  title: string;
  oneThing: string;
  area?: Area;
  notificationTime: string | null;
};

export function useHabit() {
  const [loaded, setLoaded] = useState(false);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [savedGoal, savedRecords, savedSettings] = await Promise.all([
        goalStore.load(),
        recordsStore.load(),
        settingsStore.load(),
      ]);
      if (cancelled) return;
      setGoal(savedGoal);
      setRecords(savedRecords ?? []);
      setSettings(savedSettings ?? INITIAL_SETTINGS);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const putRecords = useCallback((next: DailyRecord[]) => {
    setRecords(next);
    void recordsStore.save(next);
  }, []);

  const putSettings = useCallback((next: Settings) => {
    setSettings(next);
    void settingsStore.save(next);
  }, []);

  /** 오늘/어제의 기록을 남긴다. 범위 판정은 화면이 isEditable 로 먼저 한다. */
  const mark = useCallback(
    (date: string, done: boolean) => putRecords(setRecord(records, date, done)),
    [records, putRecords]
  );

  /** 기록을 지워 미기록으로 되돌린다. */
  const unmark = useCallback((date: string) => putRecords(clearRecord(records, date)), [records, putRecords]);

  const updateOneThing = useCallback(
    (oneThing: string) => {
      if (!goal) return;
      // 문구만 고치는 것이므로 66일 카운트(records)는 그대로 둔다.
      const next = { ...goal, oneThing: oneThing.trim() };
      setGoal(next);
      void goalStore.save(next);
    },
    [goal]
  );

  const startGoal = useCallback(
    async (input: NewGoalInput, createdAt: string) => {
      const next = newGoal({ title: input.title, oneThing: input.oneThing, area: input.area, createdAt });
      const nextSettings: Settings = { notificationTime: input.notificationTime, celebrated66: false };
      setGoal(next);
      setRecords([]);
      setSettings(nextSettings);
      await Promise.all([goalStore.save(next), recordsStore.save([]), settingsStore.save(nextSettings)]);
    },
    []
  );

  /** 목표를 종료해 아카이브로 옮긴다. 새 목표 = 새 습관 = 새 카운트. */
  const finishGoal = useCallback(
    async (outcome: Outcome, closedAt: string) => {
      if (!goal) return;
      const archive = (await archiveStore.load()) ?? [];
      await archiveStore.save([archiveGoal(goal, records, closedAt, outcome), ...archive]);
      // 알림 시각은 사용자의 생활 리듬이므로 목표가 바뀌어도 유지한다. 축하 플래그만 리셋.
      const nextSettings: Settings = { ...settings, celebrated66: false };
      setGoal(null);
      setRecords([]);
      setSettings(nextSettings);
      await Promise.all([goalStore.remove(), recordsStore.save([]), settingsStore.save(nextSettings)]);
    },
    [goal, records, settings]
  );

  const markCelebrated = useCallback(() => {
    if (settings.celebrated66) return;
    putSettings({ ...settings, celebrated66: true });
  }, [settings, putSettings]);

  const setNotificationTime = useCallback(
    (notificationTime: string | null) => putSettings({ ...settings, notificationTime }),
    [settings, putSettings]
  );

  const status: HabitStatus = !loaded ? 'loading' : goal ? 'ready' : 'onboarding';

  return {
    status,
    goal,
    records,
    settings,
    mark,
    unmark,
    updateOneThing,
    startGoal,
    finishGoal,
    markCelebrated,
    setNotificationTime,
  };
}
