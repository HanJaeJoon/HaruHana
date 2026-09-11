import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { showPrivacyOptions, usePrivacyOptionsRequired } from '@/kit/ads/consent';
import { useThemeColors } from '@/kit/theme';

import { THEME_OVERRIDES, useAccent } from '@/lib/branding';
import { useHabit } from '@/lib/habitContext';
import { t } from '@/lib/i18n';
import { isTimeString, type Area, type Outcome } from '@/lib/model';
import { useToday } from '@/lib/useToday';

import { AreaPicker } from '@/components/AreaPicker';
import { GoalTitleInput } from '@/components/GoalTitleInput';
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
  // 규제 지역(EEA/UK)에서만 UMP 가 REQUIRED 를 준다. 그 밖에서는 항상 false 라 버튼이 없다.
  const privacyOptionsRequired = usePrivacyOptionsRequired();
  const { status, goal, settings, reminderStatus, updateOneThing, updateGoal, setNotificationTime, finishGoal } =
    useHabit();

  const [draft, setDraft] = useState(goal?.oneThing ?? '');
  const [titleDraft, setTitleDraft] = useState(goal?.title ?? '');
  const [areaDraft, setAreaDraft] = useState<Area | undefined>(goal?.area);
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

  // 저장된 시각이 있어도 OS 가 막고 있으면 알림은 오지 않는다. 그 차이를 화면에 보인다.
  const reminderFailed =
    settings.notificationTime !== null &&
    (reminderStatus === 'permission-denied' ||
      reminderStatus === 'permission-blocked' ||
      reminderStatus === 'unavailable');

  const finish = async (outcome: Outcome) => {
    await finishGoal(outcome, today);
    router.replace('/onboarding');
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{t('settingsTitle')}</Text>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.faint }]}>{t('settingsGoalEdit')}</Text>
        <Text style={[styles.body, { color: colors.subtext }]}>{t('settingsGoalTitle')}</Text>
        <GoalTitleInput value={titleDraft} onChangeText={setTitleDraft} colors={colors} compact />
        <Text style={[styles.body, { color: colors.subtext }]}>{t('settingsGoalArea')}</Text>
        <Text style={[styles.hint, { color: colors.faint }]}>{t('settingsGoalAreaHint')}</Text>
        <AreaPicker value={areaDraft} onChange={setAreaDraft} colors={colors} accent={accent} />
        {/* 제목/영역만 고치는 것이므로 66일 카운트는 유지된다. */}
        <PressButton
          label={t('settingsGoalSave')}
          onPress={() => updateGoal({ title: titleDraft, area: areaDraft })}
          colors={colors}
          accent={accent}
          disabled={
            titleDraft.trim().length === 0 ||
            (titleDraft.trim() === goal.title && areaDraft === goal.area)
          }
        />
      </View>

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
        {reminderFailed ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.text }]}>
            <Text style={[styles.body, { color: colors.text }]}>{t('settingsNotificationBlocked')}</Text>
            <PressButton
              label={t('settingsNotificationOpenSettings')}
              onPress={() => void Linking.openSettings()}
              colors={colors}
              accent={accent}
              variant="outline"
            />
          </View>
        ) : null}
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
              // 같은 값이면 다시 예약할 것이 없다 (한 글자 지웠다 같은 값을 넣은 경우 등).
              if (isTimeString(value) && value !== settings.notificationTime) setNotificationTime(value);
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

      {privacyOptionsRequired ? (
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.faint }]}>{t('settingsAdsSection')}</Text>
          <PressButton
            label={t('settingsAdsPrivacy')}
            onPress={() => void showPrivacyOptions()}
            colors={colors}
            accent={accent}
            variant="outline"
          />
        </View>
      ) : null}
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
  hint: {
    fontSize: 13,
    lineHeight: 19,
  },
  input: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    fontSize: 16,
    minHeight: 52,
  },
});
