# HaruHana

올해 목표 1개와 그 목표를 전진시키는 "오늘의 하나" 1개만 허용하는 일일 체크 앱.
100% 오프라인, 서버 없음. Expo SDK 57 / expo-router / TypeScript strict.

설계의 원천은 `docs/haruhana-spec.md`(스펙)와 `docs/design-decisions.md`(결정 12건의
근거)다. **화면/데이터/흐름을 결정해야 할 때는 여기서 요약을 읽지 말고 스펙을 열 것.**
이 파일에는 코드를 쓰다가 어기기 쉬운 제약만 적는다.

## 절대 제약 (어기면 이 앱이 아니게 된다)

1. **색을 쓰지 않는다.** 흑백과 회색 계조만. 색으로 유도하는 것 자체가 게임화의
   재료다. 앱이 색을 넘기는 지점은 `src/lib/branding.ts` 의 accent 와 bannerBg
   두 곳뿐이고, 그 값도 무채색이다. 상태 구분은 색이 아니라 채움/외곽선/굵기로 한다
2. **연속(streak) 개념을 만들지 않는다.** 지표는 누적 달성 일수 / 66 이며 0 리셋이
   없다. "연속 N일", "끊겼습니다", 끊긴 지점 강조 표시를 넣지 않는다
3. **하나만 허용한다.** 활성 목표 1개, 오늘의 하나 1개. 목록으로 늘리는 기능
   (여러 목표, 여러 습관, 태그별 다중 체크)은 추가하지 않는다
4. **앱은 측정하거나 검증하지 않는다.** 정량 기준("최소 1시간")은 사용자가 쓴 문구
   안에만 있고, 판정은 이진 체크로 사용자가 한다. 타이머/카운터/자동 판정 금지
5. **기록은 성공 목록으로 읽혀야 한다.** 해낸 날만 마킹하고, 못 한 날과 미기록은
   빈 칸과 같은 시각 무게로 둔다
6. **파생값을 저장하지 않는다.** 누적 일수, 월 밀도, 66 도달 여부는 `records` 에서
   계산한다. 저장하는 파생 상태는 축하 1회 노출 플래그(`celebrated66`)뿐이다

## 코드 경계

- `src/kit/` 은 앱 도메인과 무관한 재사용 모듈이다. **kit 은 `src/lib` 나 `src/app`
  을 import 하지 않는다** (ESLint `no-restricted-imports` 로 강제, CI 검사). 앱 고유
  값은 kit 안에 상수로 두지 말고 인자나 prop 으로 넘긴다. 자세한 규칙은
  `src/kit/README.md`
- kit 은 `microapp-starter` 와 공유하는 코드다. kit 을 고칠 일이 생기면 그 변경이
  다른 앱에도 맞는 변경인지 먼저 판단한다. **사용처가 1개뿐인 추상화는 kit 에 올리지
  않는다** (그래서 로컬 알림은 `src/lib` 에 둔다)
- 이 앱은 kit 의 `theme`, `prefs`, `i18n`, `ads/AdBanner` 만 쓴다
- 달력은 `records` 배열을 prop 으로 받는 순수 컴포넌트로 만든다 (활성 목표를 내부에서
  직접 읽지 않는다). 아카이브 상세에 재사용하기 위한 제약
- 날짜는 기기 로컬 기준 `YYYY-MM-DD` 문자열로 다룬다
- 순수 함수(파생값 계산, 날짜 처리)는 테스트를 먼저 쓴다

## 환경 함정

- **Expo 는 바뀌었다.** 코드를 쓰기 전에 https://docs.expo.dev/versions/v57.0.0/ 의
  해당 버전 문서를 확인할 것. 기억에 있는 예전 API 를 그대로 쓰지 말 것
- `react-native-google-mobile-ads` 는 `16.3.4` 고정이다. 16.4.0 이상이 쓰는 GMA SDK
  25.4.0 은 Kotlin 2.3 컴파일이라 RN 0.86(Kotlin 2.1.20)에서 빌드가 깨진다
- `tsconfig.json` 의 `"types": ["jest", "node"]` 를 지우면 안 된다. TypeScript 6 은
  `@types` 를 자동 포함하지 않아 테스트 전역이 전부 미해결이 된다
- `npm install <패키지>` 를 개별 실행한 뒤에는 **반드시 `npm ci` 가 통과하는지 확인**
  한다. Windows 개별 설치가 락파일의 optional 바인딩을 지워 Linux CI 가 EUSAGE 로
  거부하는 함정이 있다. 이 경우 `npm install` 재실행으로는 안 고쳐지고
  `node_modules` 와 `package-lock.json` 을 지우고 처음부터 설치해야 한다
- Expo Go 에서는 광고 배너가 나오지 않는다 (네이티브 모듈 없음). 광고는 Actions
  빌드에서만 확인된다
- `android.package` 는 Play 에 한 번 올리면 영구히 바꿀 수 없다 (`com.hanjaejoon.haruhana`)

## 검증

| 명령 | 하는 일 |
|---|---|
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run test:ci` | Jest 1회 |
| `npm run lint` | ESLint (kit 단방향 의존 규칙 포함) |
| `npx jest src/kit` | kit 테스트만 (경계 확인) |

완료를 주장하기 전에 위 셋을 실제로 돌리고 출력을 확인한다.
