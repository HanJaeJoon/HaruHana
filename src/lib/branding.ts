// 이 앱만의 값을 모아둔 단일 지점.
//
// 스타터를 복제해 새 앱을 만들 때 여기와 app.json 만 고치면 브랜딩이 끝난다.
// kit/ 은 이 값들을 인자나 prop 으로 받으므로 kit 안에는 앱 고유 값이 없다.

export const BRANDING = {
  /** 공유 카드와 화면 헤더에 표시되는 이름. app.json 의 expo.name 과 맞춘다. */
  appName: 'Microapp Starter',

  /** 버튼/차트/공유 카드 배경에 쓰이는 대표 색. */
  brandColor: '#208AEF',

  /**
   * AdMob 배너 광고 단위 ID.
   *
   * null 이면 kit/ads 가 구글 공식 테스트 광고를 띄운다.
   * 실광고 오클릭은 계정 정지 사유이므로 기본값은 null 로 둔다.
   * AdMob 에서 배너 단위를 만든 뒤 그 ID 로 바꾼다.
   */
  adBannerUnitId: null as string | null,

  /**
   * AsyncStorage 키 접두사.
   *
   * 앱마다 달라야 한다. 같은 기기에 여러 마이크로앱이 깔려도
   * 각자 별개의 저장 공간이므로 충돌하지는 않지만,
   * 접두사를 두면 로그와 디버깅에서 어느 앱의 값인지 바로 보인다.
   */
  storageKeyPrefix: 'microapp-starter',
} as const;

/** 브랜드 색에서 파생돼 kit/theme 의 기본 팔레트를 덮어쓰는 값. */
export const THEME_OVERRIDES = {
  light: { bannerBg: '#e7f1fd' },
  dark: { bannerBg: '#16283c' },
} as const;

export function storageKey(name: string): string {
  return `${BRANDING.storageKeyPrefix}:${name}`;
}
