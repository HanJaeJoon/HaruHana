import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import AdBanner from '@/kit/ads/AdBanner';
import { useThemeColors } from '@/kit/theme';

import { BRANDING, THEME_OVERRIDES } from '@/lib/branding';

// 배너는 루트 레이아웃 하단에 고정해 전 화면이 공유한다.
// 광고 크리에이티브의 색은 통제할 수 없으므로, 경계선과 배경으로 무채색 본문과 격리한다.
export default function RootLayout() {
  const colors = useThemeColors(THEME_OVERRIDES);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack screenOptions={{ headerShown: false }} />
      <View style={[styles.banner, { backgroundColor: colors.bannerBg, borderTopColor: colors.border }]}>
        <AdBanner productionUnitId={BRANDING.adBannerUnitId ?? undefined} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  banner: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
  },
});
