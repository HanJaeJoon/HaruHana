import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/kit/theme';

import { THEME_OVERRIDES } from '@/lib/branding';
import { useHabit } from '@/lib/habitContext';
import { t } from '@/lib/i18n';
import { doneCount } from '@/lib/records';

/**
 * 지난 목표의 성공 목록. v1 은 카드 요약까지만 보여준다.
 * 기록(records)까지 저장돼 있으므로 지난 목표 달력은 v2 에서 MonthCalendar 에 넘기면 붙는다.
 */
export default function Archive() {
  const colors = useThemeColors(THEME_OVERRIDES);
  const { archive } = useHabit();

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{t('archiveTitle')}</Text>

      {archive.length === 0 && <Text style={[styles.empty, { color: colors.subtext }]}>{t('archiveEmpty')}</Text>}

      {archive.map((entry) => (
        <View
          key={entry.goal.id}
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.outcome, { color: colors.faint }]}>
              {entry.outcome === 'achieved' ? t('archiveAchieved') : t('archiveClosed')}
            </Text>
            {entry.goal.area && (
              <Text style={[styles.outcome, { color: colors.faint }]}>{t(`area_${entry.goal.area}`)}</Text>
            )}
          </View>
          <Text style={[styles.goalTitle, { color: colors.text }]}>{entry.goal.title}</Text>
          <Text style={[styles.meta, { color: colors.subtext }]}>{entry.goal.oneThing}</Text>
          <Text style={[styles.meta, { color: colors.subtext }]}>
            {t('archivePeriod', { from: entry.goal.createdAt, to: entry.closedAt })}
          </Text>
          <Text style={[styles.days, { color: colors.text }]}>
            {t('archiveDays', { days: doneCount(entry.records) })}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  empty: {
    fontSize: 14,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  outcome: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  meta: {
    fontSize: 13,
  },
  days: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
});
