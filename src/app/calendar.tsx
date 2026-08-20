import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/kit/theme';

import { THEME_OVERRIDES, useAccent } from '@/lib/branding';
import { shiftMonth } from '@/lib/calendar';
import { monthOf } from '@/lib/dates';
import { useHabit } from '@/lib/habitContext';
import { t } from '@/lib/i18n';
import { findRecord } from '@/lib/records';
import { useToday } from '@/lib/useToday';

import { MonthCalendar } from '@/components/MonthCalendar';
import { PressButton } from '@/components/PressButton';

export default function Calendar() {
  const colors = useThemeColors(THEME_OVERRIDES);
  const accent = useAccent();
  const today = useToday();
  const { status, goal, records, mark, unmark } = useHabit();
  const [month, setMonth] = useState(() => monthOf(today));

  if (status === 'loading') {
    return <View style={[styles.screen, { backgroundColor: colors.background }]} />;
  }
  if (status === 'onboarding' || !goal) {
    return <Redirect href="/onboarding" />;
  }

  // 목표를 시작한 달보다 앞으로는 볼 것이 없다.
  const firstMonth = monthOf(goal.createdAt);
  const canGoBack = month > firstMonth;
  const canGoForward = month < monthOf(today);

  // 탭은 오늘/어제만 열려 있다. 세 상태를 순환한다: 미기록 -> 해냈다 -> 못 했다 -> 미기록.
  const cycle = (date: string) => {
    const record = findRecord(records, date);
    if (!record) return mark(date, true);
    if (record.done) return mark(date, false);
    return unmark(date);
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.month, { color: colors.text }]}>{month}</Text>
        <View style={styles.headerButtons}>
          <PressButton
            label="<"
            onPress={() => setMonth(shiftMonth(month, -1))}
            colors={colors}
            accent={accent}
            variant="outline"
            disabled={!canGoBack}
          />
          <PressButton
            label=">"
            onPress={() => setMonth(shiftMonth(month, 1))}
            colors={colors}
            accent={accent}
            variant="outline"
            disabled={!canGoForward}
          />
        </View>
      </View>

      <MonthCalendar
        month={month}
        records={records}
        today={today}
        colors={colors}
        accentColor={accent.bg}
        onSelectDay={cycle}
      />

      <Text style={[styles.note, { color: colors.faint }]}>{t('oneThingLabel')}: {goal.oneThing}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  month: {
    fontSize: 20,
    fontWeight: '700',
  },
  note: {
    fontSize: 13,
  },
});
