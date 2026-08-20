// 저장되는 값의 형과 검증 가드. kit/prefs 는 키당 isValid 가드를 요구한다.

import { isDateString } from './dates';

/** 목표 설정 시 제시하는 7개 영역. 저장되는 것은 태그 1개뿐이다. */
export const AREAS = ['spirit', 'body', 'personal', 'relationships', 'job', 'business', 'finance'] as const;
export type Area = (typeof AREAS)[number];

export type Goal = {
  id: string;
  title: string;
  area?: Area;
  oneThing: string;
  /** YYYY-MM-DD */
  createdAt: string;
};

/** 하루의 기록. 미기록은 항목이 없는 것으로 표현한다 (3상태 중 하나를 배열로). */
export type DailyRecord = {
  /** YYYY-MM-DD, 로컬 기준 */
  date: string;
  done: boolean;
};

export type Outcome = 'achieved' | 'closed';

export type ArchivedGoal = {
  goal: Goal;
  records: DailyRecord[];
  /** YYYY-MM-DD */
  closedAt: string;
  outcome: Outcome;
};

export type Settings = {
  /** 'HH:mm', null 이면 알림 꺼짐. 기본값은 없다 - 온보딩에서 선택을 강제한다. */
  notificationTime: string | null;
  /** 66일 축하를 이미 보여줬는지. 저장하는 유일한 파생 상태다. */
  celebrated66: boolean;
};

/** 목표 설정 흐름의 단계. 임시 저장한 진행 지점을 복원하는 데도 쓴다. */
export const ONBOARDING_STEPS = ['stairs', 'area', 'goal', 'oneThing', 'notify'] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

/**
 * 목표 설정 흐름의 임시 입력값. 목표를 시작하면 지운다.
 *
 * 파생값이 아니라 사용자가 직접 쓴 입력이므로 저장한다 (결정: 파생값 저장 금지의
 * 대상이 아니다). notificationTime 이 없는 것은 아직 고르지 않은 상태다.
 */
export type OnboardingDraft = {
  step: OnboardingStep;
  area?: Area;
  title: string;
  oneThing: string;
  notificationTime?: string | null;
};

export function isGoal(value: unknown): value is Goal {
  const v = asRecord(value);
  if (!v) return false;
  if (typeof v.title !== 'string' || typeof v.oneThing !== 'string' || typeof v.id !== 'string') return false;
  if (!isDateString(v.createdAt)) return false;
  if (v.area !== undefined && !isArea(v.area)) return false;
  return true;
}

export function isRecords(value: unknown): value is DailyRecord[] {
  if (!Array.isArray(value)) return false;
  const seen = new Set<string>();
  for (const item of value) {
    const v = asRecord(item);
    if (!v || !isDateString(v.date) || typeof v.done !== 'boolean') return false;
    if (seen.has(v.date)) return false;
    seen.add(v.date);
  }
  return true;
}

export function isArchive(value: unknown): value is ArchivedGoal[] {
  if (!Array.isArray(value)) return false;
  return value.every((item) => {
    const v = asRecord(item);
    if (!v) return false;
    if (!isGoal(v.goal) || !isRecords(v.records)) return false;
    if (!isDateString(v.closedAt)) return false;
    return v.outcome === 'achieved' || v.outcome === 'closed';
  });
}

export function isSettings(value: unknown): value is Settings {
  const v = asRecord(value);
  if (!v) return false;
  if (typeof v.celebrated66 !== 'boolean') return false;
  return v.notificationTime === null || isTimeString(v.notificationTime);
}

export function isOnboardingStep(value: unknown): value is OnboardingStep {
  return typeof value === 'string' && (ONBOARDING_STEPS as readonly string[]).includes(value);
}

export function isOnboardingDraft(value: unknown): value is OnboardingDraft {
  const v = asRecord(value);
  if (!v) return false;
  if (!isOnboardingStep(v.step)) return false;
  if (typeof v.title !== 'string' || typeof v.oneThing !== 'string') return false;
  if (v.area !== undefined && !isArea(v.area)) return false;
  if (v.notificationTime !== undefined && v.notificationTime !== null && !isTimeString(v.notificationTime)) return false;
  return true;
}

/** 'HH:mm' 24시간 표기. */
export function isTimeString(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return false;
  const [h, m] = value.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

export function isArea(value: unknown): value is Area {
  return typeof value === 'string' && (AREAS as readonly string[]).includes(value);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}
