import { createPrefs } from '@/kit/prefs';
import { storageKey } from './branding';

// 화면의 입력값을 저장/복원한다.
// kit/prefs 는 저장 키와 검증 함수를 인자로 받는다. 키 접두사는 branding 에서 온다.

export type SavedInputs = {
  principal: string;
  monthlyContribution: string;
  annualRatePercent: string;
  years: string;
};

function isSavedInputs(value: unknown): value is SavedInputs {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.principal === 'string' &&
    typeof v.monthlyContribution === 'string' &&
    typeof v.annualRatePercent === 'string' &&
    typeof v.years === 'string'
  );
}

export const inputPrefs = createPrefs<SavedInputs>(storageKey('inputs'), isSavedInputs);
