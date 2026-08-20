import { StyleSheet, Text, View } from 'react-native';

import type { ThemeColors } from '@/kit/theme';

import { t } from '@/lib/i18n';

type Props = {
  doneDays: number;
  target: number;
  reached: boolean;
  colors: ThemeColors;
  accentColor: string;
};

/**
 * 누적 진행 표시. 채운 길이가 진행이고 색은 쓰지 않는다.
 * 66일에 도달하면 바를 걷고 누적 일수만 남긴다 (끝없는 사슬로 만들지 않는다).
 */
export function JourneyBar({ doneDays, target, reached, colors, accentColor }: Props) {
  if (reached) {
    return (
      <View style={styles.block}>
        <Text style={[styles.value, { color: colors.text }]}>{t('cumulative', { days: doneDays })}</Text>
      </View>
    );
  }

  const ratio = Math.min(doneDays / target, 1);

  return (
    <View style={styles.block}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.subtext }]}>{t('journeyLabel')}</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {t('journeyValue', { done: doneDays, target })}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.buttonBg, borderColor: colors.border }]}>
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: accentColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
  },
  track: {
    height: 10,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
