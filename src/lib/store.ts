// 저장소. kit/prefs 는 키당 단일 JSON 값을 다루므로 키를 5개로 나눈다.
//
// 파생값(누적 일수, 월 밀도, 66 도달)은 저장하지 않는다. records 에서 계산한다.

import { createPrefs } from '@/kit/prefs';

import { storageKey } from './branding';
import {
  isArchive,
  isGoal,
  isOnboardingDraft,
  isRecords,
  isSettings,
  type ArchivedGoal,
  type DailyRecord,
  type Goal,
  type OnboardingDraft,
  type Settings,
} from './model';

/** 활성 목표. 없으면 null (온보딩으로 유도). */
export const goalStore = createPrefs<Goal>(storageKey('goal'), isGoal);

/** 활성 목표의 일별 기록. 목표 교체 시 아카이브로 옮기고 비운다. */
export const recordsStore = createPrefs<DailyRecord[]>(storageKey('records'), isRecords);

/** 지난 목표들 (기록 포함, 읽기 전용). */
export const archiveStore = createPrefs<ArchivedGoal[]>(storageKey('archive'), isArchive);

export const settingsStore = createPrefs<Settings>(storageKey('settings'), isSettings);

/**
 * 목표 설정 흐름의 임시 입력값. 흐름 도중 앱을 나가도 이어서 쓰게 한다.
 * 목표를 시작하는 순간 지우므로, 값이 남아 있다는 것은 흐름이 끝나지 않았다는 뜻이다.
 */
export const onboardingDraftStore = createPrefs<OnboardingDraft>(
  storageKey('onboardingDraft'),
  isOnboardingDraft
);

/**
 * 알림 시각의 기본값은 두지 않는다 (온보딩에서 선택 강제).
 * 저장된 설정이 없을 때만 쓰는 초기값이다.
 */
export const INITIAL_SETTINGS: Settings = { notificationTime: null, celebrated66: false };
