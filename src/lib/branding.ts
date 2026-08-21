// 이 앱만의 값을 모아둔 단일 지점.
//
// kit/ 은 이 값들을 인자나 prop 으로 받으므로 kit 안에는 앱 고유 값이 없다.
// 색은 전부 무채색이다 (설계 결정 8) - 색으로 유도하는 것 자체가 게임화의 재료다.

import { useColorScheme } from 'react-native';

export const BRANDING = {
  /** 화면 헤더와 공유 이미지에 표시되는 이름. app.json 의 expo.name 과 맞춘다. */
  appName: 'HaruHana',

  /**
   * AdMob 배너 광고 단위 ID.
   *
   * null 이면 kit/ads 가 구글 공식 테스트 광고를 띄운다.
   * 실제 ID 를 넣어도 __DEV__ 빌드에서는 kit/ads 가 테스트 광고를 쓴다
   * (실광고 오클릭은 계정 정지 사유).
   */
  adBannerUnitId: 'ca-app-pub-2903995158289675/7480232822' as string | null,

  /** AsyncStorage 키 접두사. 로그에서 어느 앱의 값인지 바로 보이게 둔다. */
  storageKeyPrefix: 'haruhana',
} as const;

/**
 * 강조에 쓰는 accent. 브랜드 색 단일 상수 대신 테마별로 반전한다.
 *
 * 검정 단일값은 다크 배경(#121212)에서 버튼이 묻히고, 흰 단일값은 라이트
 * 배경에서 묻힌다. 그래서 배경과 반대쪽 끝을 골라 쓴다.
 * fg 는 그 위에 올라가는 글자색이다.
 */
export const ACCENT = {
  light: { bg: '#111111', fg: '#ffffff' },
  dark: { bg: '#f2f2f2', fg: '#111111' },
} as const;

export type Accent = (typeof ACCENT)[keyof typeof ACCENT];

export function useAccent(): Accent {
  return useColorScheme() === 'dark' ? ACCENT.dark : ACCENT.light;
}

/** kit/theme 의 기본 팔레트를 덮어쓰는 값. 광고 배너를 본문과 격리한다. */
export const THEME_OVERRIDES = {
  light: { bannerBg: '#eeeeee' },
  dark: { bannerBg: '#262626' },
} as const;

export function storageKey(name: string): string {
  return `${BRANDING.storageKeyPrefix}:${name}`;
}
