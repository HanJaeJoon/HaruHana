// 기록에서 파생값을 계산한다. 파생값은 저장하지 않는다 (불일치 원천 차단).
//
// 여기에 "연속" 개념은 없다. 지표는 누적이고 놓친 날은 전진이 없을 뿐이다.

import { dayOfMonth, monthOf, shiftDays } from './dates';
import type { DailyRecord } from './model';

/** 습관 형성의 기준일. 이 수를 채우는 것이 목표다 (연속이 아니라 누적). */
export const JOURNEY_TARGET = 66;

export type JourneyProgress = {
  doneDays: number;
  target: number;
  reached: boolean;
};

export type MonthDensity = {
  done: number;
  /** 이번 달 오늘까지의 일수. 분모다. */
  total: number;
};

export function findRecord(records: DailyRecord[], date: string): DailyRecord | undefined {
  return records.find((r) => r.date === date);
}

export function setRecord(records: DailyRecord[], date: string, done: boolean): DailyRecord[] {
  const rest = records.filter((r) => r.date !== date);
  return [...rest, { date, done }].sort((a, b) => a.date.localeCompare(b.date));
}

/** 항목을 지워 미기록으로 되돌린다. */
export function clearRecord(records: DailyRecord[], date: string): DailyRecord[] {
  return records.filter((r) => r.date !== date);
}

export function doneCount(records: DailyRecord[]): number {
  return records.reduce((n, r) => (r.done ? n + 1 : n), 0);
}

export function journeyProgress(records: DailyRecord[]): JourneyProgress {
  const doneDays = doneCount(records);
  return { doneDays, target: JOURNEY_TARGET, reached: doneDays >= JOURNEY_TARGET };
}

/** 누적의 약점(장기간에 걸쳐 채우는 경우)을 드러내는 보조 지표. */
export function monthDensity(records: DailyRecord[], today: string): MonthDensity {
  const month = monthOf(today);
  const done = records.filter((r) => r.done && monthOf(r.date) === month && r.date <= today).length;
  return { done, total: dayOfMonth(today) };
}

/** 기록/수정이 열려 있는 범위는 오늘과 어제뿐이다. */
export function isEditable(date: string, today: string): boolean {
  return date === today || date === shiftDays(today, -1);
}
