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
- `ads/` - AdMob 배너

microapp-starter 에는 `currency.ts`, `chart/`, `share/` 도 있다. HaruHana 는 쓰지 않아
복제 직후 제거했다. 필요해지면 스타터에서 다시 가져온다.
