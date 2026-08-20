import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useThemeColors, type ThemeColors } from '@/kit/theme';

import { THEME_OVERRIDES, useAccent } from '@/lib/branding';
import { t } from '@/lib/i18n';
import { AREAS, isTimeString, type Area } from '@/lib/model';
import { useHabit } from '@/lib/useHabit';
import { useToday } from '@/lib/useToday';

import { PressButton } from '@/components/PressButton';

const PRESET_TIMES = ['07:00', '08:00', '09:00'] as const;

type Step = 'stairs' | 'area' | 'goal' | 'oneThing' | 'notify';

const ORDER: Step[] = ['stairs', 'area', 'goal', 'oneThing', 'notify'];

/**
 * 목표 설정 흐름. 첫 실행과 목표 교체가 같은 화면을 쓴다.
 *
 * 계단 안내와 영역 제시는 사고 도구이므로 저장하지 않는다 (영역만 태그로 남는다).
 * 알림 시각은 기본값을 두지 않고 선택을 강제한다 - notify 가 undefined 인 동안은
 * 시작 버튼이 잠긴다 (null 은 "알림 없이 쓰기"를 고른 상태다).
 */
export default function Onboarding() {
  const colors = useThemeColors(THEME_OVERRIDES);
  const accent = useAccent();
  const today = useToday();
  const router = useRouter();
  const { startGoal } = useHabit();

  const [step, setStep] = useState<Step>('stairs');
  const [area, setArea] = useState<Area | undefined>();
  const [title, setTitle] = useState('');
  const [oneThing, setOneThing] = useState('');
  const [notify, setNotify] = useState<string | null | undefined>(undefined);
  const [customTime, setCustomTime] = useState('');
  const [customOpen, setCustomOpen] = useState(false);

  const go = (delta: number) => {
    const next = ORDER[ORDER.indexOf(step) + delta];
    if (next) setStep(next);
  };

  const start = async () => {
    await startGoal({ title, oneThing, area, notificationTime: notify ?? null }, today);
    router.replace('/');
  };

  const canGoOn =
    step === 'goal' ? title.trim().length > 0 : step === 'oneThing' ? oneThing.trim().length > 0 : true;

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      {step === 'stairs' && <Block title={t('obStairsTitle')} body={t('obStairsBody')} colors={colors} />}

      {step === 'area' && (
        <>
          <Block title={t('obAreaTitle')} body={t('obAreaBody')} colors={colors} />
          <View style={styles.list}>
            {AREAS.map((candidate) => (
              <PressButton
                key={candidate}
                label={t(`area_${candidate}`)}
                onPress={() => setArea(area === candidate ? undefined : candidate)}
                colors={colors}
                accent={accent}
                variant={area === candidate ? 'filled' : 'outline'}
              />
            ))}
          </View>
        </>
      )}

      {step === 'goal' && (
        <>
          <Block title={t('obGoalTitle')} body={t('obGoalBody')} colors={colors} />
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('obGoalPlaceholder')}
            placeholderTextColor={colors.faint}
            multiline
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
          />
        </>
      )}

      {step === 'oneThing' && (
        <>
          <Block title={t('obOneThingTitle')} body={t('obOneThingBody')} colors={colors} />
          <Text style={[styles.hint, { color: colors.faint }]}>{t('obOneThingHint')}</Text>
          <TextInput
            value={oneThing}
            onChangeText={setOneThing}
            placeholder={t('obOneThingPlaceholder')}
            placeholderTextColor={colors.faint}
            multiline
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
          />
        </>
      )}

      {step === 'notify' && (
        <>
          <Block title={t('obNotifyTitle')} body={t('obNotifyBody')} colors={colors} />
          <View style={styles.list}>
            {PRESET_TIMES.map((time) => (
              <PressButton
                key={time}
                label={time}
                onPress={() => {
                  setNotify(time);
                  setCustomOpen(false);
                }}
                colors={colors}
                accent={accent}
                variant={!customOpen && notify === time ? 'filled' : 'outline'}
              />
            ))}
            <PressButton
              label={t('obNotifyCustom')}
              onPress={() => {
                setCustomOpen(true);
                setNotify(isTimeString(customTime) ? customTime : undefined);
              }}
              colors={colors}
              accent={accent}
              variant={customOpen ? 'filled' : 'outline'}
            />
            {customOpen && (
              <TextInput
                value={customTime}
                onChangeText={(value) => {
                  setCustomTime(value);
                  // 형식이 맞을 때만 선택으로 인정한다. 그 전에는 시작 버튼이 잠긴 채다.
                  setNotify(isTimeString(value) ? value : undefined);
                }}
                placeholder="07:30"
                placeholderTextColor={colors.faint}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
              />
            )}
            <PressButton
              label={t('obNotifyOff')}
              onPress={() => {
                setNotify(null);
                setCustomOpen(false);
              }}
              colors={colors}
              accent={accent}
              variant={notify === null ? 'filled' : 'outline'}
            />
          </View>
        </>
      )}

      <View style={styles.nav}>
        {step !== 'stairs' && (
          <PressButton
            label={t('obBack')}
            onPress={() => go(-1)}
            colors={colors}
            accent={accent}
            variant="outline"
            grow
          />
        )}
        {step === 'area' && (
          <PressButton
            label={t('obSkip')}
            onPress={() => {
              setArea(undefined);
              go(1);
            }}
            colors={colors}
            accent={accent}
            variant="outline"
            grow
          />
        )}
        {step === 'notify' ? (
          <PressButton
            label={t('obStart')}
            onPress={start}
            colors={colors}
            accent={accent}
            disabled={notify === undefined}
            grow
          />
        ) : (
          <PressButton
            label={t('obNext')}
            onPress={() => go(1)}
            colors={colors}
            accent={accent}
            disabled={!canGoOn}
            grow
          />
        )}
      </View>
    </ScrollView>
  );
}

function Block({ title, body, colors }: { title: string; body: string; colors: ThemeColors }) {
  return (
    <View style={styles.block}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.subtext }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 20,
  },
  block: {
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
  },
  input: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    fontSize: 17,
    minHeight: 56,
  },
  list: {
    gap: 10,
  },
  nav: {
    flexDirection: 'row',
    gap: 12,
  },
});
