import { createI18n } from '@/kit/i18n';
import { FALLBACK_LOCALE, SUPPORTED_LOCALES, translations, type AppLocale } from './translations';

// kit/i18n 은 앱의 번역과 지원 언어 목록을 인자로 받는다.
// 로케일 감지(pickSupportedLocale)와 fallback 은 kit 이 처리한다.
export const { t, appLocale, deviceCurrencyCode } = createI18n<AppLocale>({
  translations,
  supportedLocales: SUPPORTED_LOCALES,
  fallbackLocale: FALLBACK_LOCALE,
});

export { FALLBACK_LOCALE, SUPPORTED_LOCALES };
export type { AppLocale };
