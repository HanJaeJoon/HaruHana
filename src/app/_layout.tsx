import { Link, Stack, usePathname } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import AdBanner from '@/kit/ads/AdBanner';
import { useThemeColors, type ThemeColors } from '@/kit/theme';

import { BRANDING, THEME_OVERRIDES, useAccent } from '@/lib/branding';
import { HabitProvider } from '@/lib/habitContext';
import { t } from '@/lib/i18n';

const TABS = [
  { href: '/', labelKey: 'navToday' },
  { href: '/calendar', labelKey: 'navCalendar' },
  { href: '/archive', labelKey: 'navArchive' },
  { href: '/settings', labelKey: 'navSettings' },
] as const;

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
 */
function Shell() {
  const colors = useThemeColors(THEME_OVERRIDES);
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  // 목표 설정 흐름 중에는 다른 화면으로 새지 않게 한다.
  const showNav = pathname !== '/onboarding';

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {showNav && <TopNav pathname={pathname} colors={colors} />}
      <Stack screenOptions={{ headerShown: false }} />
      {/*
        광고 크리에이티브의 색은 통제할 수 없다. 경계선과 배경으로 무채색 본문과
        격리하고, 체크 버튼과는 거리를 둔다 (오클릭 유도 금지).
      */}
      <View style={[styles.banner, { backgroundColor: colors.bannerBg, borderTopColor: colors.border }]}>
        <AdBanner productionUnitId={BRANDING.adBannerUnitId ?? undefined} />
      </View>
    </View>
  );
}

function TopNav({ pathname, colors }: { pathname: string; colors: ThemeColors }) {
  const accent = useAccent();

  return (
    <View style={[styles.nav, { borderBottomColor: colors.border }]}>
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link key={tab.href} href={tab.href} style={styles.navItem}>
            <Text
              style={[
                styles.navLabel,
                { color: active ? colors.text : colors.faint },
                active ? { borderBottomColor: accent.bg } : null,
                active ? styles.navLabelActive : null,
              ]}
            >
              {t(tab.labelKey)}
            </Text>
          </Link>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navItem: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 12,
  },
  navLabel: {
    fontSize: 13,
    textAlign: 'center',
    paddingBottom: 4,
  },
  navLabelActive: {
    fontWeight: '700',
    borderBottomWidth: 2,
  },
  banner: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
  },
});
