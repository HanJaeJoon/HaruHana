# kit

앱 도메인과 무관한 재사용 모듈. 광고 수익형 오프라인 계산기 앱의 공통 골격이다.

## 규칙

- `kit/`은 `app/`, `lib/`, `components/`를 **import하지 않는다.** 단방향 의존이며 ESLint로 강제한다
- 앱 고유 값(브랜드 색, 광고 단위 ID, 앱 이름, 번역 문자열)은 **인자나 prop으로 받는다.** kit 안에 상수로 두지 않는다
- 사용처가 1개뿐인 추상화는 kit에 올리지 않는다. 두 번째 앱에서 같은 필요가 확인되면 그때 승격한다

## 구성

- `i18n/` - 로케일 감지와 i18n 인스턴스 생성
- `theme.ts` - 라이트/다크 팔레트
- `prefs.ts` - AsyncStorage 기반 값 저장/복원
- `ads/` - AdMob 배너와 UMP 광고 동의 (아래 참고)

microapp-starter 에는 `currency.ts`, `chart/`, `share/` 도 있다. HaruHana 는 쓰지 않아
복제 직후 제거했다. 필요해지면 스타터에서 다시 가져온다.

## ads/ - UMP 광고 동의

EEA/UK 등 규제 지역에 배포하려면 광고를 요청하기 전에 UMP(Google User Messaging
Platform) 동의를 받아야 한다. 동의 흐름 없이 배포하면 정책 위반 소지가 있다.

- `ads/consentLogic.ts` - 결과 해석/재시도/디버그 옵션 정리. 네이티브를 모르는 순수 함수
- `ads/consent.ts` - `AdsConsent` 호출 어댑터와 결과 스토어 (`consent.web.ts` 는 웹 스텁)
- `ads/AdBanner.tsx` - `enabled` 프롭으로 동의 판정 전 배너 요청을 막는다

| 함수 | 용도 |
| --- | --- |
| `ensureAdsConsent(options?)` | 앱 시작 시 1회. 동의 정보 갱신 -> 필요하면 폼 표시 -> `ConsentResult` |
| `shouldRequestAds(result, whenUnavailable?)` | 배너를 띄워도 되는지. 판정 전이면 `false` |
| `showPrivacyOptions()` | 설정 화면의 "광고 개인 설정" 진입점 |
| `usePrivacyOptionsRequired()` | 그 버튼을 노출해야 하는지 |
| `useAdsConsentResult()` | 마지막 판정 구독 (판정 전 `null`) |

네이티브 모듈이 없는 환경(Expo Go/웹)과 UMP 호출 실패는 예외를 던지지 않고
`unavailable` 로 돌아오며, `canRequestAds` 를 임의로 `true` 로 만들지 않는다.
그 경우 광고를 요청할지는 앱이 정한다. 이 앱은 기본값 `'allow'` 를 쓴다.

문구는 kit 에 없다. "광고 개인 설정" 버튼 라벨은 앱 i18n 에 둔다.
이 코드의 원본은 microapp-starter 다. 고칠 일이 생기면 그쪽과 같이 맞춘다.
