import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/kit/theme';

import { BRANDING, THEME_OVERRIDES } from '@/lib/branding';
import { t } from '@/lib/i18n';

// 오늘 화면. 목표/오늘의 하나/66일 진행은 데이터 계층부터 붙인다.
export default function Today() {
  const colors = useThemeColors(THEME_OVERRIDES);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{BRANDING.appName}</Text>
      <Text style={[styles.tagline, { color: colors.subtext }]}>{t('tagline')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 15,
    marginTop: 8,
  },
});
