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
