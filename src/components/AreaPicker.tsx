import { StyleSheet, View } from 'react-native';

import type { ThemeColors } from '@/kit/theme';

import type { Accent } from '@/lib/branding';
import { t } from '@/lib/i18n';
import { AREAS, type Area } from '@/lib/model';

import { PressButton } from './PressButton';

type Props = {
  /** 고른 영역. 영역은 선택 사항이라 없을 수 있다. */
  value?: Area;
  /** 고른 것을 다시 누르면 undefined 로 돌아온다 (태그 떼기). */
  onChange: (area: Area | undefined) => void;
  colors: ThemeColors;
  accent: Accent;
};

/**
 * 7개 영역 중 하나를 고르는 목록. 목표 설정과 설정 화면이 같은 것을 쓴다.
 * 상태 구분은 색이 아니라 채움/외곽선으로 한다.
 */
export function AreaPicker({ value, onChange, colors, accent }: Props) {
  return (
    <View style={styles.list}>
      {AREAS.map((candidate) => (
        <PressButton
          key={candidate}
          label={t(`area_${candidate}`)}
          onPress={() => onChange(value === candidate ? undefined : candidate)}
          colors={colors}
          accent={accent}
          variant={value === candidate ? 'filled' : 'outline'}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
});
