import { createContext, useContext, type ReactNode } from 'react';

import { useHabitState } from './useHabit';

type HabitValue = ReturnType<typeof useHabitState>;

const HabitContext = createContext<HabitValue | null>(null);

/**
 * 상태를 루트에 한 번만 두고 모든 화면이 같은 것을 본다.
 * 화면마다 훅을 따로 부르면 설정에서 문구를 고쳐도 스택에 남아 있는
 * 오늘 화면은 옛 값을 계속 보여준다.
 */
export function HabitProvider({ children }: { children: ReactNode }) {
  const value = useHabitState();
  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

export function useHabit(): HabitValue {
  const value = useContext(HabitContext);
  if (!value) throw new Error('useHabit 은 HabitProvider 안에서만 쓸 수 있습니다.');
  return value;
}
