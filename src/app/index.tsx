import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import AdBanner from '@/kit/ads/AdBanner';
import { ThemedLineChart } from '@/kit/chart/ThemedLineChart';
import { decimateLabels } from '@/kit/chart/decimateLabels';
import { formatCurrency, resolveTargetCurrency } from '@/kit/currency';
import { BrandCard } from '@/kit/share/BrandCard';
import {
  captureCard,
  saveImageToLibrary,
  shareImage,
  useShareAvailability,
} from '@/kit/share/capture';
import { useThemeColors } from '@/kit/theme';

import { BRANDING, THEME_OVERRIDES, useAccent } from '@/lib/branding';
import { compoundSeries, yearEndPoints, type CompoundResult } from '@/lib/compound';
import { appLocale, deviceCurrencyCode, t } from '@/lib/i18n';
import { inputPrefs } from '@/lib/prefs';

// 기기 지역 통화로 표기한다. USD 지역이거나 통화를 알 수 없으면 USD.
const DISPLAY_CURRENCY = resolveTargetCurrency(deviceCurrencyCode) ?? 'USD';

// 차트 x축 라벨이 겹치지 않는 최대 개수
const MAX_CHART_LABELS = 8;

const DEFAULTS = {
  principal: '10000',
  monthlyContribution: '300',
  annualRatePercent: '5',
  years: '20',
};

export default function Index() {
  const colors = useThemeColors(THEME_OVERRIDES);
  const accent = useAccent();
  const { width } = useWindowDimensions();
  const canShare = useShareAvailability();

  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [monthlyContribution, setMonthlyContribution] = useState(DEFAULTS.monthlyContribution);
  const [annualRatePercent, setAnnualRatePercent] = useState(DEFAULTS.annualRatePercent);
  const [years, setYears] = useState(DEFAULTS.years);
  const [hydrated, setHydrated] = useState(false);
  const [result, setResult] = useState<CompoundResult | null>(null);
  const [resultYears, setResultYears] = useState(0);

  const cardRef = useRef<View>(null);

  // 저장된 입력값 복원. setState 가 await 이후에 일어나므로 이펙트 동기 setState 가 아니다.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await inputPrefs.load();
      if (cancelled) return;
      if (saved) {
        setPrincipal(saved.principal);
        setMonthlyContribution(saved.monthlyContribution);
        setAnnualRatePercent(saved.annualRatePercent);
        setYears(saved.years);
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 입력값 저장. 복원 완료 전에는 기본값으로 덮어쓰지 않는다.
  useEffect(() => {
    if (!hydrated) return;
    inputPrefs.save({ principal, monthlyContribution, annualRatePercent, years });
  }, [hydrated, principal, monthlyContribution, annualRatePercent, years]);

  const calculate = useCallback(() => {
    const parsed = parseInputs({ principal, monthlyContribution, annualRatePercent, years });
    if (!parsed) {
      Alert.alert(t('invalidInput'), undefined, [{ text: t('ok') }]);
      return;
    }
    setResult(compoundSeries(parsed));
    setResultYears(parsed.years);
  }, [principal, monthlyContribution, annualRatePercent, years]);

  const chart = useMemo(() => {
    if (!result) return null;
    const points = yearEndPoints(result);
    if (points.length < 2) return null;
    return {
      labels: decimateLabels(
        points.map((p) => String(p.month / 12)),
        MAX_CHART_LABELS
      ),
      values: points.map((p) => p.balance),
    };
  }, [result]);

  const money = useCallback(
    (amount: number) => formatCurrency(amount, appLocale, DISPLAY_CURRENCY),
    []
  );

  const onShare = useCallback(async () => {
    try {
      const uri = await captureCard(cardRef);
      await shareImage(uri);
    } catch {
      Alert.alert(t('shareFailTitle'), t('shareFailBody'), [{ text: t('ok') }]);
    }
  }, []);

  const onSave = useCallback(async () => {
    try {
      const uri = await captureCard(cardRef);
      // kit 은 'saved' | 'denied' 만 돌려준다. 안내 문구는 앱이 번역해 띄운다.
      const outcome = await saveImageToLibrary(uri);
      if (outcome === 'denied') {
        Alert.alert(t('deniedTitle'), t('deniedBody'), [{ text: t('ok') }]);
        return;
      }
      Alert.alert(t('savedTitle'), t('savedBody'), [{ text: t('ok') }]);
    } catch {
      Alert.alert(t('shareFailTitle'), t('shareFailBody'), [{ text: t('ok') }]);
    }
  }, []);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>{t('title')}</Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>{t('subtitle')}</Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <NumberField
          label={t('principalLabel')}
          value={principal}
          onChangeText={setPrincipal}
          colors={colors}
        />
        <NumberField
          label={t('monthlyLabel')}
          value={monthlyContribution}
          onChangeText={setMonthlyContribution}
          colors={colors}
        />
        <NumberField
          label={t('rateLabel')}
          value={annualRatePercent}
          onChangeText={setAnnualRatePercent}
          colors={colors}
        />
        <NumberField
          label={t('yearsLabel')}
          value={years}
          onChangeText={setYears}
          colors={colors}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: accent.bg }]}
          onPress={calculate}
        >
          <Text style={[styles.buttonText, { color: accent.fg }]}>{t('calculate')}</Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SummaryRow
            label={t('finalBalance')}
            value={money(result.finalBalance)}
            colors={colors}
            emphasis
          />
          <SummaryRow
            label={t('totalContributed')}
            value={money(result.totalContributed)}
            colors={colors}
          />
          <SummaryRow
            label={t('totalInterest')}
            value={money(result.totalInterest)}
            colors={colors}
          />
        </View>
      )}

      {chart && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('chartTitle')}</Text>
          {/*
            yAxisSuffix 는 y축(금액)에 붙는다. x축 단위(년)를 여기 주면
            "50436.5년" 처럼 금액 뒤에 년이 붙는다. x축 단위는 카드 제목으로 알린다.
          */}
          <ThemedLineChart
            labels={chart.labels}
            values={chart.values}
            width={Math.max(width - 64, 240)}
            decimalPlaces={0}
            brandColor={accent.bg}
            colors={colors}
            style={styles.chart}
          />
        </View>
      )}

      {result && (
        <View style={styles.shareRow}>
          {canShare && (
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { borderColor: colors.border, backgroundColor: colors.buttonBg },
              ]}
              onPress={onShare}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{t('share')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              { borderColor: colors.border, backgroundColor: colors.buttonBg },
            ]}
            onPress={onSave}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{t('save')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <AdBanner productionUnitId={BRANDING.adBannerUnitId ?? undefined} />

      {/* 공유 카드는 화면 밖에 렌더링해 두고 캡처한다 */}
      <View style={styles.offscreen} pointerEvents="none">
        <BrandCard
          ref={cardRef}
          brandColor={accent.bg}
          appName={BRANDING.appName}
          footerText={t('shareFooter')}
        >
          <Text style={styles.cardHeadline}>
            {t('shareHeadline', {
              years: resultYears,
              balance: money(result?.finalBalance ?? 0),
            })}
          </Text>
          <Text style={styles.cardSub}>
            {t('totalInterest')} {money(result?.totalInterest ?? 0)}
          </Text>
        </BrandCard>
      </View>
    </ScrollView>
  );
}

function NumberField(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  colors: { text: string; subtext: string; border: string; background: string };
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: props.colors.subtext }]}>{props.label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            color: props.colors.text,
            borderColor: props.colors.border,
            backgroundColor: props.colors.background,
          },
        ]}
        value={props.value}
        onChangeText={props.onChangeText}
        keyboardType="decimal-pad"
        inputMode="decimal"
      />
    </View>
  );
}

function SummaryRow(props: {
  label: string;
  value: string;
  colors: { text: string; subtext: string };
  emphasis?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: props.colors.subtext }]}>{props.label}</Text>
      <Text
        style={[
          styles.summaryValue,
          { color: props.colors.text },
          props.emphasis && styles.summaryValueEmphasis,
        ]}
      >
        {props.value}
      </Text>
    </View>
  );
}

// 빈 문자열이나 잘못된 숫자는 null 로 돌려 화면이 안내를 띄우게 한다.
// 도메인 함수는 RangeError 를 던지므로 여기서 미리 걸러 예외로 흐름을 만들지 않는다.
function parseInputs(raw: {
  principal: string;
  monthlyContribution: string;
  annualRatePercent: string;
  years: string;
}): {
  principal: number;
  monthlyContribution: number;
  annualRatePercent: number;
  years: number;
} | null {
  const principal = Number(raw.principal);
  const monthlyContribution = Number(raw.monthlyContribution);
  const annualRatePercent = Number(raw.annualRatePercent);
  const years = Number(raw.years);

  // 빈 문자열은 Number('') === 0 이 되므로 따로 걸러낸다
  if ([raw.principal, raw.monthlyContribution, raw.annualRatePercent, raw.years].some((s) => s.trim() === '')) {
    return null;
  }

  const nonNegative = [principal, monthlyContribution, annualRatePercent];
  if (nonNegative.some((n) => !Number.isFinite(n) || n < 0)) return null;
  if (!Number.isInteger(years) || years < 1 || years > 100) return null;

  return { principal, monthlyContribution, annualRatePercent, years };
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryValueEmphasis: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  chart: {
    borderRadius: 8,
    marginLeft: -8,
  },
  shareRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  offscreen: {
    position: 'absolute',
    left: -9999,
    top: 0,
  },
  cardHeadline: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginBottom: 20,
  },
});
