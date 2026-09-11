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

/**
 * 활성 목표의 제목/영역만 고친다.
 *
 * 같은 목표를 계속 이어 가는 것이므로 id, createdAt, oneThing 은 그대로 두고
 * 기록(records)도 건드리지 않는다. 목표를 바꾸는 것이 아니라 표현을 고치는 것이다.
 * area 를 주지 않으면 태그를 떼는 것으로 본다.
 */
export function editGoal(goal: Goal, input: { title: string; area?: Area }): Goal {
  const { area: _dropped, ...rest } = goal;
  const next: Goal = { ...rest, title: input.title.trim() };
  return input.area ? { ...next, area: input.area } : next;
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
