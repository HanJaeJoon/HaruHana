import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { ThemeColors } from '@/kit/theme';

import { buildMonthGrid, type Month } from '@/lib/calendar';
import { dayOfMonth } from '@/lib/dates';
import { t } from '@/lib/i18n';
import type { DailyRecord } from '@/lib/model';
import { findRecord, isEditable } from '@/lib/records';

const WEEKDAYS = ['wd0', 'wd1', 'wd2', 'wd3', 'wd4', 'wd5', 'wd6'] as const;

type Props = {
  month: Month;
  /** 활성 목표를 내부에서 읽지 않는다 - 아카이브 상세에 그대로 재사용하기 위한 제약. */
  records: DailyRecord[];
  today: string;
  colors: ThemeColors;
  accentColor: string;
  onSelectDay?: (date: string) => void;
};

/**
 * 월 달력. 해낸 날만 채운 점으로 표시한다.
 * 못 한 날과 미기록은 빈 칸과 같은 시각 무게로 둔다 - 끊김을 강조하지 않는다.
 */
export function MonthCalendar({ month, records, today, colors, accentColor, onSelectDay }: Props) {
  const weeks = buildMonthGrid(month);

  return (
    <View style={styles.calendar}>
      <View style={styles.week}>
        {WEEKDAYS.map((key) => (
          <Text key={key} style={[styles.weekday, { color: colors.faint }]}>
            {t(key)}
          </Text>
        ))}
      </View>

      {weeks.map((week, index) => (
        <View key={`${month}-w${index}`} style={styles.week}>
          {week.map((date, cellIndex) => {
            if (!date) return <View key={`${month}-w${index}-e${cellIndex}`} style={styles.cell} />;

            const record = findRecord(records, date);
            const editable = onSelectDay !== undefined && isEditable(date, today);

            return (
              <TouchableOpacity
                key={date}
                style={styles.cell}
                disabled={!editable}
                onPress={() => onSelectDay?.(date)}
              >
                <Text style={[styles.day, { color: date === today ? colors.text : colors.subtext }]}>
                  {dayOfMonth(date)}
                </Text>
                <View
                  style={[
                    styles.dot,
                    record?.done
                      ? { backgroundColor: accentColor }
                      : editable
                        ? { borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth }
                        : null,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: {
    gap: 6,
  },
  week: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  day: {
    fontSize: 13,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
