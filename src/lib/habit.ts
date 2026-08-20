// 목표의 시작과 종료. 활성 목표는 항상 1개이고, 종료한 목표는 기록과 함께
// 아카이브로 옮겨 읽기 전용이 된다.

import type { Area, ArchivedGoal, DailyRecord, Goal, Outcome } from './model';

export function newGoal(input: {
  title: string;
  oneThing: string;
  area?: Area;
  createdAt: string;
}): Goal {
  const goal: Goal = {
    id: newGoalId(),
    title: input.title.trim(),
    oneThing: input.oneThing.trim(),
    createdAt: input.createdAt,
  };
  return input.area ? { ...goal, area: input.area } : goal;
}

export function archiveGoal(
  goal: Goal,
  records: DailyRecord[],
  closedAt: string,
  outcome: Outcome
): ArchivedGoal {
  return { goal, records, closedAt, outcome };
}

// 로컬 저장 안에서만 구분되면 되므로 시각과 난수 조합으로 충분하다.
function newGoalId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
