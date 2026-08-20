import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useThemeColors } from '@/kit/theme';

import { THEME_OVERRIDES, useAccent } from '@/lib/branding';
import { useHabit } from '@/lib/habitContext';
import { t } from '@/lib/i18n';
import { isTimeString, type Outcome } from '@/lib/model';
import { useToday } from '@/lib/useToday';

import { PressButton } from '@/components/PressButton';

const PRESET_TIMES = ['07:00', '08:00', '09:00'] as const;

function isPreset(time: string): boolean {
  return (PRESET_TIMES as readonly string[]).includes(time);
}

export default function Settings() {
  const colors = useThemeColors(THEME_OVERRIDES);
  const accent = useAccent();
  const today = useToday();
  const router = useRouter();
  const { status, goal, settings, updateOneThing, setNotificationTime, finishGoal } = useHabit();

  const [draft, setDraft] = useState(goal?.oneThing ?? '');
  // null 이면 아직 입력 칸을 건드리지 않은 것이다 - 그동안은 저장된 값을 그대로 비춘다.
  const [customTime, setCustomTime] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<Outcome | null>(null);

  if (status === 'loading') {
    return <View style={[styles.screen, { backgroundColor: colors.background }]} />;
  }
  if (status === 'onboarding' || !goal) {
    return <Redirect href="/onboarding" />;
  }

  // 프리셋에 없는 시각으로 설정돼 있으면 입력 칸이 그 값을 보여준다.
  const savedCustom =
    settings.notificationTime !== null && !isPreset(settings.notificationTime) ? settings.notificationTime : '';

  const finish = async (outcome: Outcome) => {
    await finishGoal(outcome, today);
    router.replace('/onboarding');
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{t('settingsTitle')}</Text>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.faint }]}>{t('settingsOneThing')}</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          multiline
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
        />
        {/* 문구만 고치는 것이므로 66일 카운트는 유지된다. */}
        <PressButton
          label={t('settingsOneThingSave')}
          onPress={() => updateOneThing(draft)}
          colors={colors}
          accent={accent}
          disabled={draft.trim().length === 0 || draft.trim() === goal.oneThing}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.faint }]}>{t('settingsNotification')}</Text>
        {/* 어느 버튼이 채워져 있는지만으로는 "지금 꺼져 있음"과 "누르면 꺼짐"이 구분되지 않는다. */}
        <Text style={[styles.body, { color: colors.subtext }]}>
          {settings.notificationTime === null
            ? t('settingsNotificationCurrentOff')
            : t('settingsNotificationCurrent', { value: settings.notificationTime })}
        </Text>
        <View style={styles.list}>
          {PRESET_TIMES.map((time) => (
            <PressButton
              key={time}
              label={time}
              onPress={() => setNotificationTime(time)}
              colors={colors}
              accent={accent}
              variant={settings.notificationTime === time ? 'filled' : 'outline'}
            />
          ))}
          <TextInput
            value={customTime ?? savedCustom}
            onChangeText={(value) => {
              setCustomTime(value);
              if (isTimeString(value)) setNotificationTime(value);
            }}
            placeholder={t('obNotifyCustom')}
            placeholderTextColor={colors.faint}
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
          />
          <PressButton
            label={t('settingsNotificationOff')}
            onPress={() => setNotificationTime(null)}
            colors={colors}
            accent={accent}
            variant={settings.notificationTime === null ? 'filled' : 'outline'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.faint }]}>{t('settingsGoalSection')}</Text>
        {confirming ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.text }]}>
            <Text style={[styles.body, { color: colors.text }]}>
              {confirming === 'achieved' ? t('settingsConfirmAchieved') : t('settingsConfirmClose')}
            </Text>
            <View style={styles.row}>
              <PressButton
                label={t('settingsConfirmCancel')}
                onPress={() => setConfirming(null)}
                colors={colors}
                accent={accent}
                variant="outline"
                grow
              />
              <PressButton
                label={confirming === 'achieved' ? t('settingsAchieved') : t('settingsClose')}
                onPress={() => finish(confirming)}
                colors={colors}
                accent={accent}
                grow
              />
            </View>
          </View>
        ) : (
          <View style={styles.row}>
            <PressButton
              label={t('settingsAchieved')}
              onPress={() => setConfirming('achieved')}
              colors={colors}
              accent={accent}
              variant="outline"
              grow
            />
            <PressButton
              label={t('settingsClose')}
              onPress={() => setConfirming('closed')}
              colors={colors}
              accent={accent}
              variant="outline"
              grow
            />
          </View>
        )}
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
    gap: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    gap: 10,
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    fontSize: 16,
    minHeight: 52,
  },
});
