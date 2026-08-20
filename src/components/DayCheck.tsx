import { StyleSheet, Text, View } from 'react-native';

import type { ThemeColors } from '@/kit/theme';

import type { Accent } from '@/lib/branding';
import { t } from '@/lib/i18n';
import type { DailyRecord } from '@/lib/model';

import { PressButton } from './PressButton';

type Props = {
  record: DailyRecord | undefined;
  onMark: (done: boolean) => void;
  onUndo: () => void;
  colors: ThemeColors;
  accent: Accent;
  /** 기록이 남은 뒤 보여줄 문구. 어제 프롬프트와 오늘 카드가 다른 문구를 쓴다. */
  doneText: string;
  notDoneText: string;
};

/**
 * 하루의 이진 체크. 앱은 측정하지 않고 판정은 사용자가 한다.
 * [해냈다]는 채운 버튼, [못 했다]는 외곽선 버튼 - 색으로 구분하지 않는다.
 */
export function DayCheck({ record, onMark, onUndo, colors, accent, doneText, notDoneText }: Props) {
  if (record) {
    return (
      <View style={styles.markedRow}>
        <Text style={[styles.marked, { color: colors.text }]}>{record.done ? doneText : notDoneText}</Text>
        <PressButton label={t('undo')} onPress={onUndo} colors={colors} accent={accent} variant="outline" />
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <PressButton label={t('done')} onPress={() => onMark(true)} colors={colors} accent={accent} grow />
      <PressButton
        label={t('notDone')}
        onPress={() => onMark(false)}
        colors={colors}
        accent={accent}
        variant="outline"
        grow
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  markedRow: {
    gap: 12,
  },
  marked: {
    fontSize: 15,
  },
});
