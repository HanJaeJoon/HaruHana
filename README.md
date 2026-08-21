# HaruHana

올해 목표 1개와, 그 목표를 전진시키는 "오늘의 하나" 1개만 허용하는 일일 체크 앱.

유일한 차별점은 기능이 아니라 제약이다 - 일반 습관 트래커가 습관을 10-20개로 늘리게
유도하는 자리에서, 이 앱은 하나만 허용한다. 100% 오프라인, 서버 없음, 운영비 0원.
수익은 하단 배너 광고.

지표는 연속(streak)이 아니라 **누적 달성 일수 / 66일**이다. 놓친 날은 전진이 없을 뿐,
쌓은 것이 무너지지 않는다.

## 문서

| 문서 | 내용 |
|---|---|
| `docs/haruhana-spec.md` | 스펙 - 개념, 화면, 데이터 모델, 구현 계획 |
| `docs/design-decisions.md` | 설계 결정 12건과 그 근거 |
| `docs/RELEASE.md` | Play 출시 절차 (키스토어, Secrets, 서명 검증) |
| `CLAUDE.md` | 코드를 쓸 때 지켜야 하는 제약 |
| `src/kit/README.md` | kit 경계 규칙 |

## 구조

```
src/
  kit/            앱 도메인과 무관한 재사용 모듈 (microapp-starter 와 공유)
    theme.ts        라이트/다크 무채색 팔레트
    prefs.ts        AsyncStorage 저장/복원
    i18n/           로케일 감지 + i18n 인스턴스
    ads/            AdMob 배너
  lib/            이 앱의 코드
    branding.ts     앱 고유 값 (이름/accent/광고 단위 ID/저장 키 접두사)
  app/            expo-router 화면
```

배선(광고 배너, 다국어, 테마, 값 저장, CI 릴리스 빌드, 서명 검증)은
[microapp-starter](https://github.com/HanJaeJoon/microapp-starter) 에서 가져왔다.

## 개발

```bash
pnpm install
pnpm run typecheck && pnpm run test:ci && pnpm run lint
pnpm start
```

pnpm 이 없으면 `corepack enable pnpm` 으로 활성화한다. 버전은 `package.json` 의
`packageManager` 필드가 고정한다.

광고 배너와 로컬 알림은 Expo Go 에서 확인되지 않는다 (네이티브 모듈). GitHub Actions
릴리스 빌드로 확인한다.
