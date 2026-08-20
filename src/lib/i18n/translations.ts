// 번역 문자열. kit/i18n 은 이 객체를 받기만 하고 내용을 모른다.
//
// 지원 언어는 ko/en 두 개다. 언어는 시스템 로케일을 따르고 앱 안에서 바꾸지 않는다.

export const SUPPORTED_LOCALES = ['ko', 'en'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export const FALLBACK_LOCALE: AppLocale = 'en';

type Strings = {
  tagline: string;
};

export const translations: Record<AppLocale, Strings> = {
  ko: {
    tagline: '올해 목표 하나, 오늘의 하나.',
  },
  en: {
    tagline: 'One goal this year. One thing today.',
  },
};
