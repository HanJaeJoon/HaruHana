// 저장소 4개를 화면이 쓸 하나의 상태로 묶는다.
//
// 파생값은 여기서 계산하지 않는다 - records 를 그대로 넘겨 화면이 records.ts 의
// 순수 함수로 계산하게 둔다 (달력도 records 를 prop 으로 받는 순수 컴포넌트다).

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { archiveGoal, editGoal, newGoal } from './habit';
import type { Area, ArchivedGoal, DailyRecord, Goal, Outcome, Settings } from './model';
import { syncDailyReminder, type ReminderSyncResult } from './notifications';
import { clearRecord, setRecord } from './records';
import { INITIAL_SETTINGS, archiveStore, goalStore, recordsStore, settingsStore } from './store';

export type HabitStatus = 'loading' | 'onboarding' | 'ready';

export type NewGoalInput = {
  title: string;
  oneThing: string;
  area?: Area;
  notificationTime: string | null;
};

export function useHabitState() {
  const [loaded, setLoaded] = useState(false);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [archive, setArchive] = useState<ArchivedGoal[]>([]);
  // 파생/일시 상태라 저장하지 않는다. 켤 때마다 실제 예약 상태를 다시 본다.
  const [reminderStatus, setReminderStatus] = useState<ReminderSyncResult | null>(null);

  // 포그라운드 복귀 리스너가 최신 값을 읽되 리스너를 다시 달지는 않으려고 ref 로 들고 있는다.
  const latest = useRef({ notificationTime: INITIAL_SETTINGS.notificationTime, oneThing: '' });
  useEffect(() => {
    latest.current = { notificationTime: settings.notificationTime, oneThing: goal?.oneThing ?? '' };
  }, [settings.notificationTime, goal?.oneThing]);

  useEffect(() => {
    let cancelled = false;

    /**
     * 저장된 설정대로 다시 예약한다. 여러 번 불러도 결과가 같다.
     * 사용자가 부른 것이 아니므로 권한 다이얼로그는 띄우지 않는다(canPrompt: false).
     */
    async function resync(time: string | null, oneThing: string) {
      const result = await syncDailyReminder(time, oneThing, { canPrompt: false });
      if (!cancelled) setReminderStatus(result);
    }

    (async () => {
      const [savedGoal, savedRecords, savedSettings, savedArchive] = await Promise.all([
        goalStore.load(),
        recordsStore.load(),
        settingsStore.load(),
        archiveStore.load(),
      ]);
      if (cancelled) return;
      setGoal(savedGoal);
      setRecords(savedRecords ?? []);
      setSettings(savedSettings ?? INITIAL_SETTINGS);
      setArchive(savedArchive ?? []);
      setLoaded(true);
      // 사용자가 아무것도 하지 않아도 예약을 되살린다. 시스템 설정에서 나중에 알림을
      // 켰거나 절전/강제 중지로 예약이 날아간 경우, 여기 말고는 복구할 경로가 없다.
      void resync((savedSettings ?? INITIAL_SETTINGS).notificationTime, savedGoal?.oneThing ?? '');
    })();

    // 포그라운드로 돌아올 때도 같은 확인을 한다 (기기 설정에서 알림을 켜고 돌아온 경우).
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      void resync(latest.current.notificationTime, latest.current.oneThing);
    });

    return () => {
      cancelled = true;
      subscription.remove();
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
      // 알림 문구에 오늘의 하나가 들어가므로 문구가 바뀌면 다시 예약한다.
      void syncDailyReminder(settings.notificationTime, next.oneThing).then(setReminderStatus);
    },
    [goal, settings.notificationTime]
  );

  /**
   * 목표의 제목/영역을 고친다. 같은 목표를 이어 가는 것이므로 66일 카운트(records)와
   * createdAt/id 는 그대로 둔다. 알림 문구는 오늘의 하나만 쓰므로 재예약할 것이 없다.
   */
  const updateGoal = useCallback(
    (input: { title: string; area?: Area }) => {
      if (!goal) return;
      // 제목이 비면 저장하지 않는다 (온보딩에서도 빈 제목으로는 넘어가지 못한다).
      if (input.title.trim().length === 0) return;
      const next = editGoal(goal, input);
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
      setReminderStatus(await syncDailyReminder(nextSettings.notificationTime, next.oneThing));
    },
    []
  );

  /** 목표를 종료해 아카이브로 옮긴다. 새 목표 = 새 습관 = 새 카운트. */
  const finishGoal = useCallback(
    async (outcome: Outcome, closedAt: string) => {
      if (!goal) return;
      const nextArchive = [archiveGoal(goal, records, closedAt, outcome), ...archive];
      setArchive(nextArchive);
      await archiveStore.save(nextArchive);
      // 알림 시각은 사용자의 생활 리듬이므로 목표가 바뀌어도 유지한다. 축하 플래그만 리셋.
      const nextSettings: Settings = { ...settings, celebrated66: false };
      setGoal(null);
      setRecords([]);
      setSettings(nextSettings);
      await Promise.all([goalStore.remove(), recordsStore.save([]), settingsStore.save(nextSettings)]);
      // 다음 목표를 정하기 전까지는 알릴 것이 없다.
      setReminderStatus(await syncDailyReminder(null, ''));
    },
    [goal, records, settings, archive]
  );

  const markCelebrated = useCallback(() => {
    if (settings.celebrated66) return;
    putSettings({ ...settings, celebrated66: true });
  }, [settings, putSettings]);

  const setNotificationTime = useCallback(
    (notificationTime: string | null) => {
      putSettings({ ...settings, notificationTime });
      void syncDailyReminder(notificationTime, goal?.oneThing ?? '').then(setReminderStatus);
    },
    [settings, putSettings, goal]
  );

  const status: HabitStatus = !loaded ? 'loading' : goal ? 'ready' : 'onboarding';

  return {
    status,
    goal,
    records,
    settings,
    archive,
    reminderStatus,
    mark,
    unmark,
    updateOneThing,
    updateGoal,
    startGoal,
    finishGoal,
    markCelebrated,
    setNotificationTime,
  };
}
