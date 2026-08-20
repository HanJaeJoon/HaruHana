import { Redirect } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/kit/theme';

import { THEME_OVERRIDES, useAccent } from '@/lib/branding';
import { shiftDays } from '@/lib/dates';
import { t } from '@/lib/i18n';
import { findRecord, journeyProgress, monthDensity } from '@/lib/records';
import { useHabit } from '@/lib/habitContext';
import { useToday } from '@/lib/useToday';

import { DayCheck } from '@/components/DayCheck';
import { JourneyBar } from '@/components/JourneyBar';
import { PressButton } from '@/components/PressButton';

export default function Today() {
  const colors = useThemeColors(THEME_OVERRIDES);
  const accent = useAccent();
  const today = useToday();
  const { status, goal, records, settings, mark, unmark, markCelebrated } = useHabit();

  if (status === 'loading') {
    return <View style={[styles.screen, { backgroundColor: colors.background }]} />;
  }
  if (status === 'onboarding' || !goal) {
    return <Redirect href="/onboarding" />;
  }

  const yesterday = shiftDays(today, -1);
  const todayRecord = findRecord(records, today);
  // 목표를 만들기 전날은 물을 것이 없다.
  const askYesterday = !findRecord(records, yesterday) && goal.createdAt <= yesterday;
  const progress = journeyProgress(records);
  const density = monthDensity(records, today);
  const celebrate = progress.reached && !settings.celebrated66;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      {celebrate && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.text }]}>
          <Text style={[styles.celebrationTitle, { color: colors.text }]}>{t('celebrationTitle')}</Text>
          <Text style={[styles.body, { color: colors.subtext }]}>{t('celebrationBody')}</Text>
          <PressButton label={t('celebrationClose')} onPress={markCelebrated} colors={colors} accent={accent} />
        </View>
      )}

      {askYesterday && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.subtext }]}>{t('yesterdayQuestion')}</Text>
          <DayCheck
            record={undefined}
            onMark={(done) => mark(yesterday, done)}
            onUndo={() => unmark(yesterday)}
            colors={colors}
            accent={accent}
            doneText={t('markedDone')}
            notDoneText={t('markedNotDone')}
          />
        </View>
      )}

      <View style={styles.goalBlock}>
        <Text style={[styles.label, { color: colors.faint }]}>{t('goalLabel')}</Text>
        <Text style={[styles.goalTitle, { color: colors.text }]}>{goal.title}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.faint }]}>{t('oneThingLabel')}</Text>
        <Text style={[styles.oneThing, { color: colors.text }]}>{goal.oneThing}</Text>
        <DayCheck
          record={todayRecord}
          onMark={(done) => mark(today, done)}
          onUndo={() => unmark(today)}
          colors={colors}
          accent={accent}
          doneText={t('markedDone')}
          notDoneText={t('markedNotDone')}
        />
      </View>

      <View style={styles.progressBlock}>
        <JourneyBar
          doneDays={progress.doneDays}
          target={progress.target}
          reached={progress.reached}
          colors={colors}
          accentColor={accent.bg}
        />
        <Text style={[styles.density, { color: colors.subtext }]}>
          {t('monthDensity', { done: density.done, total: density.total })}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  goalBlock: {
    gap: 4,
  },
  progressBlock: {
    gap: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  oneThing: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
  },
  celebrationTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  density: {
    fontSize: 13,
  },
});
