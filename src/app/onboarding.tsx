import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useThemeColors, type ThemeColors } from '@/kit/theme';

import { THEME_OVERRIDES, useAccent } from '@/lib/branding';
import { debounce } from '@/lib/debounce';
import { t } from '@/lib/i18n';
import {
  AREAS,
  ONBOARDING_STEPS,
  isTimeString,
  type Area,
  type OnboardingDraft,
  type OnboardingStep,
} from '@/lib/model';
import { useHabit } from '@/lib/habitContext';
import { onboardingDraftStore } from '@/lib/store';
import { useToday } from '@/lib/useToday';

import { PressButton } from '@/components/PressButton';

const PRESET_TIMES = ['07:00', '08:00', '09:00'] as const;

/** 텍스트 입력이 키 입력마다 AsyncStorage 를 두드리지 않게 저장을 이만큼 미룬다. */
const DRAFT_SAVE_DELAY_MS = 300;

const ORDER: readonly OnboardingStep[] = ONBOARDING_STEPS;

function isPreset(time: string): boolean {
  return (PRESET_TIMES as readonly string[]).includes(time);
}

/**
 * 목표 설정 흐름. 첫 실행과 목표 교체가 같은 화면을 쓴다.
 *
 * 계단 안내와 영역 제시는 사고 도구이므로 저장하지 않는다 (영역만 태그로 남는다).
 * 알림 시각은 기본값을 두지 않고 선택을 강제한다 - notify 가 undefined 인 동안은
 * 시작 버튼이 잠긴다 (null 은 "알림 없이 쓰기"를 고른 상태다).
 *
 * 입력값은 단계마다 임시 저장한다. 흐름 도중 앱을 나갔다 와도 처음부터 다시 쓰지
 * 않게 하려는 것이고, 목표를 시작하는 순간 임시 저장은 지운다.
 * 저장은 300ms 디바운스한다 (텍스트 입력이 키 입력마다 저장하지 않게). 대신
 * 단계 이동 시점과 unmount 시점에 flush 해서 마지막 입력이 유실되지 않게 한다.
 */
export default function Onboarding() {
  const colors = useThemeColors(THEME_OVERRIDES);
  const accent = useAccent();
  const today = useToday();
  const router = useRouter();
  const { startGoal } = useHabit();

  const [step, setStep] = useState<OnboardingStep>('stairs');
  const [area, setArea] = useState<Area | undefined>();
  const [title, setTitle] = useState('');
  const [oneThing, setOneThing] = useState('');
  const [notify, setNotify] = useState<string | null | undefined>(undefined);
  const [customTime, setCustomTime] = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  // 임시 저장을 읽기 전에는 화면을 그리지 않는다 (첫 단계가 스쳐 보이지 않게).
  const [restored, setRestored] = useState(false);
  // 시작 직후에는 다시 저장하지 않는다 (지운 것을 되살리지 않기 위해).
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const draft = await onboardingDraftStore.load();
      if (cancelled) return;
      if (draft) {
        setStep(draft.step);
        setArea(draft.area);
        setTitle(draft.title);
        setOneThing(draft.oneThing);
        setNotify(draft.notificationTime);
        if (typeof draft.notificationTime === 'string' && !isPreset(draft.notificationTime)) {
          setCustomTime(draft.notificationTime);
          setCustomOpen(true);
        }
      }
      setRestored(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveDraft = useMemo(
    () =>
      debounce((draft: OnboardingDraft) => {
        void onboardingDraftStore.save(draft);
      }, DRAFT_SAVE_DELAY_MS),
    []
  );

  useEffect(() => {
    if (!restored || starting) return;
    saveDraft({ step, area, title, oneThing, notificationTime: notify });
  }, [saveDraft, restored, starting, step, area, title, oneThing, notify]);

  // 단계가 바뀌는 순간에는 미루지 않고 바로 저장한다. 위의 저장 effect 가 먼저 돌아
  // 새 단계가 포함된 최신 초안을 예약해 두므로, 여기서 그것을 즉시 반영하게 된다.
  useEffect(() => {
    saveDraft.flush();
  }, [saveDraft, step]);

  // 화면을 떠날 때 대기 중인 마지막 입력을 유실하지 않는다
  // (마지막 키 입력 후 300ms 안에 나가는 경우).
  useEffect(() => () => saveDraft.flush(), [saveDraft]);

  const go = (delta: number) => {
    const next = ORDER[ORDER.indexOf(step) + delta];
    if (next) setStep(next);
  };

  const start = async () => {
    setStarting(true);
    // 지우기 직전에 대기 중인 저장을 버린다. flush 하면 지운 초안이 되살아난다.
    saveDraft.cancel();
    await onboardingDraftStore.remove();
    await startGoal({ title, oneThing, area, notificationTime: notify ?? null }, today);
    router.replace('/');
  };

  const canGoOn =
    step === 'goal' ? title.trim().length > 0 : step === 'oneThing' ? oneThing.trim().length > 0 : true;

  if (!restored) {
    return <View style={[styles.screen, { backgroundColor: colors.background }]} />;
  }

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
  screen: {
    flex: 1,
  },
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
