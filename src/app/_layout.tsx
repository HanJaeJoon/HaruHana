import { Stack, useRouter, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import AdBanner from '@/kit/ads/AdBanner';
import { ensureAdsConsent, shouldRequestAds, useAdsConsentResult } from '@/kit/ads/consent';
import { useThemeColors, type ThemeColors } from '@/kit/theme';

import { BRANDING, THEME_OVERRIDES, useAccent } from '@/lib/branding';
import { HabitProvider } from '@/lib/habitContext';
import { t } from '@/lib/i18n';
import { isTabActive, shouldShowTabs } from '@/lib/nav';

import { TabIcon, type TabIconName } from '@/components/TabIcon';

const TABS: readonly { href: '/' | '/calendar' | '/archive' | '/settings'; labelKey: 'navToday' | 'navCalendar' | 'navArchive' | 'navSettings'; icon: TabIconName }[] = [
  { href: '/', labelKey: 'navToday', icon: 'today' },
  { href: '/calendar', labelKey: 'navCalendar', icon: 'calendar' },
  { href: '/archive', labelKey: 'navArchive', icon: 'archive' },
  { href: '/settings', labelKey: 'navSettings', icon: 'settings' },
];

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <HabitProvider>
        <Shell />
      </HabitProvider>
    </SafeAreaProvider>
  );
}

/**
 * 화면 틀. 상단 인셋은 여기서 한 번만 준다.
 *
 * 앱은 edge-to-edge 로 그려지므로 상태바 높이를 고정값으로 두면 기기마다 어긋난다.
 * 탭이 없는 화면(목표 설정 흐름)에서는 제목이 상태바와 겹쳤다 - 그래서 탭이 아니라
 * 루트에 인셋을 주고 모든 화면이 같은 여백을 받게 한다.
 *
 * 하단 인셋은 화면 맨 아래 요소인 광고 배너가 받는다 (탭 바가 아니다).
 * 탭 바 위가 아니라 아래에 배너가 있으므로, 인셋을 탭 바에 주면 배너가
 * 제스처 바에 깔린다.
 */
function Shell() {
  const colors = useThemeColors(THEME_OVERRIDES);
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const showNav = shouldShowTabs(pathname);
  const consent = useAdsConsentResult();

  // UMP 동의는 앱 시작 시 1회만 확인한다. kit 이 중복 호출을 합쳐 주지만
  // 마운트 이펙트 한 곳에서만 부르는 것을 규칙으로 둔다.
  useEffect(() => {
    void ensureAdsConsent();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Stack screenOptions={{ headerShown: false }} />
      {showNav && <BottomNav pathname={pathname} colors={colors} />}
      {/*
        광고 크리에이티브의 색은 통제할 수 없다. 경계선과 배경으로 무채색 본문과
        격리하고, 체크 버튼과는 거리를 둔다 (오클릭 유도 금지).
        탭 바와도 간격을 둬서 탭을 누르려다 배너를 누르는 일이 없게 한다.
      */}
      <View
        style={[
          styles.banner,
          { backgroundColor: colors.bannerBg, borderTopColor: colors.border, paddingBottom: 4 + insets.bottom },
        ]}
      >
        {/* 판정 전에는 배너를 요청하지 않는다. 판단 불가(Expo Go/웹/UMP 실패)면 기존대로 띄운다. */}
        <AdBanner
          productionUnitId={BRANDING.adBannerUnitId ?? undefined}
          enabled={shouldRequestAds(consent)}
        />
      </View>
    </View>
  );
}

/** 하단 탭 바. 아이콘 + 짧은 라벨, 활성은 accent 색으로만 구분한다. */
function BottomNav({ pathname, colors }: { pathname: string; colors: ThemeColors }) {
  const accent = useAccent();
  const router = useRouter();

  return (
    <View style={[styles.nav, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      {TABS.map((tab) => {
        const active = isTabActive(pathname, tab.href);
        const label = t(tab.labelKey);
        const tint = active ? accent.bg : colors.faint;
        return (
          <Pressable
            key={tab.href}
            onPress={() => router.navigate(tab.href)}
            style={styles.navItem}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}
          >
            <TabIcon name={tab.icon} color={tint} />
            <Text style={[styles.navLabel, { color: tint }, active ? styles.navLabelActive : null]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  nav: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    // 배너와의 최소 간격. 오클릭 유도로 읽히지 않게 띄운다.
    marginBottom: 8,
  },
  navItem: {
    flex: 1,
    // 터치 영역 48dp 이상.
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  navLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  navLabelActive: {
    fontWeight: '700',
  },
  banner: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 4,
  },
});
