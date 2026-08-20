import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { today } from './dates';

/**
 * "오늘"은 기기 로컬 날짜다. 앱을 켜둔 채 자정을 넘길 수 있으므로
 * 포그라운드로 돌아올 때마다 날짜를 다시 본다.
 */
export function useToday(): string {
  const [date, setDate] = useState(() => today());

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setDate(today());
    });
    return () => subscription.remove();
  }, []);

  return date;
}
