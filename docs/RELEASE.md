# 출시 체크리스트

새 앱을 Play 에 처음 올릴 때의 순서. 위에서 아래로 그대로 따라간다.

계정 작업(GitHub / AdMob / Play Console)은 사람만 할 수 있고, 코드 작업은 로컬에서 한다. 순서를 지키는 이유는 뒤 단계가 앞 단계의 산출물을 요구하기 때문이다.

## 0. 코드 준비

- [ ] `src/lib/branding.ts` 의 값 4개를 이 앱 값으로 교체
- [ ] `app.json` 의 `name` / `slug` / `scheme` / `android.package` / splash 색 교체
- [ ] `package.json` 의 `name` 교체
- [ ] `src/lib/i18n/translations.ts` 번역 교체
- [ ] `app.json` 의 `android.versionCode` 를 `1` 로 확인
- [ ] `npm run typecheck && npm run test:ci && npm run lint` 통과

`android.package` 는 Play 에 한 번 올리면 **영구히 바꿀 수 없다.** 여기서 확정한다.

## 0.5 아이콘과 스토어 그래픽 (사람만 가능)

**`assets/images/` 는 create-expo-app 템플릿의 Expo 로고 그대로다.** 스타터를 복제한 직후 상태에서는 항상 그렇다. 이대로 올리면 Expo 로고를 쓴 앱이 스토어에 올라간다.

교체해야 하는 파일:

| 파일 | 용도 | 요구 규격 |
|---|---|---|
| `assets/images/icon.png` | 앱 아이콘 원본 | 1024x1024 PNG, 투명 배경 없이 |
| `assets/images/android-icon-foreground.png` | 적응형 아이콘 전경 | 432x432 PNG, 투명 배경, 안쪽 66% 안에 도형 배치 |
| `assets/images/android-icon-background.png` | 적응형 아이콘 배경 | 432x432 PNG |
| `assets/images/android-icon-monochrome.png` | 테마 아이콘 (Android 13+) | 432x432 PNG, 단색 실루엣 |
| `assets/images/splash-icon.png` | 스플래시 로고 | 정사각 PNG, `app.json` 의 `imageWidth` 기준 |
| `assets/images/favicon.png` | 웹 파비콘 | 48x48 PNG (Android 출시에는 무관) |
| `assets/images/splash-icon-dark.png` | 다크 테마 스플래시 로고 | 정사각 PNG (밝은 도형) |

Play Console 에 따로 업로드하는 것 (저장소에 두지 않아도 된다):

- 앱 아이콘 512x512 PNG
- 그래픽 이미지 1024x500 PNG/JPG
- 스크린샷 최소 2장 (16:9 또는 9:16, 최소 320px)

`app.json` 의 `android.adaptiveIcon.backgroundColor` 를 브랜드 색의 연한 톤으로 맞춰 두면 도형만 바꿔도 통일감이 난다.

HaruHana 는 위 자산을 `scripts/make-icons.py` 로 만든다 (무채색 도형 하나: 테두리 원 +
가운데 점). 도형을 바꿀 때는 그 스크립트를 고치고 다시 돌리면 7개 파일이 한 번에
갱신된다. 실제 디자인이 나오면 스크립트째로 교체하거나 지우면 된다.

## 1. GitHub 저장소

- [ ] 저장소 생성 (Public 권장 - Actions 분 무제한)
- [ ] 코드 push, 기본 브랜치는 `main`

`workflow_dispatch` 워크플로는 **기본 브랜치에 파일이 있어야** Actions UI 목록에 나온다. 작업 브랜치에만 있으면 실행 버튼이 보이지 않는다.

## 2. 업로드 키스토어

로컬에서 만든다. 이 파일을 잃으면 **앱 업데이트를 영구히 올릴 수 없다.** 안전한 곳에 백업할 것.

```bash
keytool -genkeypair -v \
  -keystore upload.jks \
  -alias upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

GitHub 저장소 > Settings > Secrets and variables > Actions > New repository secret 에 4개 등록:

| Secret 이름 | 값 |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 upload.jks` 출력 |
| `ANDROID_KEYSTORE_PASSWORD` | 키스토어 비밀번호 |
| `ANDROID_KEY_ALIAS` | `upload` |
| `ANDROID_KEY_PASSWORD` | 키 비밀번호 |

`.github/workflows/build.yml` 의 `EXPECTED_UPLOAD_CERT_SHA256` 은 **아직 비워 둔다.** 비어 있으면 워크플로가 서명 검증을 건너뛰고 경고만 남긴다. 5단계에서 채운다.

## 3. AdMob

- [ ] AdMob > 앱 > 앱 추가. 플랫폼 Android, "앱이 아직 스토어에 등록되어 있지 않습니다" 선택
- [ ] 앱 ID(`ca-app-pub-...~...`)를 `app.json` 의 `androidAppId` 에 넣기
- [ ] 광고 단위 > 배너 생성. 단위 ID(`ca-app-pub-.../...`)를 `src/lib/branding.ts` 의 `adBannerUnitId` 에 넣기
- [ ] `app-ads.txt` - **게시자 계정 단위라 앱마다 다시 할 필요 없다.** 이미 설정돼 있으면 넘어간다

기본값은 구글 공식 테스트 ID 다. 자기 ID 로 바꾸는 순간부터 실광고가 뜨므로, 개발 중 자기 앱을 눌러 보는 일이 없게 한다. **자기 광고 클릭은 AdMob 계정 정지 사유다.** `kit/ads` 는 `__DEV__` 에서 항상 테스트 광고를 쓰도록 되어 있다.

## 4. 첫 빌드

- [ ] Actions > Android Build > Run workflow, 브랜치 `main`
- [ ] 약 25분 대기
- [ ] Artifacts 에서 `app-release-aab` 다운로드

`main` 에서 1회 빌드해야 Gradle 캐시가 저장된다. 캐시는 저장소별이고 기본 브랜치에서만 저장되므로, 작업 브랜치에서만 빌드하면 매번 처음부터 컴파일한다.

## 5. Play Console 앱 생성과 첫 업로드

- [ ] Play Console > 앱 만들기. 앱 이름 / 기본 언어 / 앱 or 게임 / 무료 or 유료
- [ ] 테스트 > 내부 테스트 > 새 버전 만들기 > AAB 업로드
- [ ] 내부 테스트에 테스터 등록 후 실기기에서 확인

**프로덕션 트랙에 바로 올리지 않는다.** 내부 테스트에서 실기기 확인을 먼저 한다. 테스트로 잡히지 않는 것들이 있다.

- [ ] 차트가 실제로 렌더링되는지
- [ ] 공유 카드 캡처 이미지가 정상인지
- [ ] 광고 배너가 뜨는지
- [ ] 다크모드 색이 깨지지 않는지

첫 업로드가 끝나면 업로드 키 인증서가 생긴다.

- [ ] Play Console > Google Play로 보호됨 > 앱 서명 > **업로드 키 인증서**의 SHA-256 복사
- [ ] `.github/workflows/build.yml` 의 `EXPECTED_UPLOAD_CERT_SHA256` 에 붙여넣고 커밋

**이걸 채우지 않으면 잘못된 키로 서명된 AAB 가 조용히 통과한다.** 서명 키가 틀리면 Play 가 업로드를 거부하는데, 25분 빌드를 다 쓴 뒤에 알게 된다. 채워 두면 빌드가 직접 대조해서 알려준다.

## 6. 스토어 등록정보와 콘텐츠 선언

- [ ] 스토어 설정 > 스토어 등록정보: 앱 이름, 간단한 설명, 자세한 설명
- [ ] 그래픽: 앱 아이콘 512x512, 그래픽 이미지 1024x500, 스크린샷 최소 2장
- [ ] **스토어 등록정보 > 웹사이트에 도메인 입력.** AdMob 이 앱별 등록정보의 도메인을 크롤링한다. 빠뜨리면 앱 인증이 실패한다
- [ ] 앱 콘텐츠 > 개인정보처리방침 URL
- [ ] 앱 콘텐츠 > 광고: **"앱에 광고가 있습니다"** 선택
- [ ] 앱 콘텐츠 > 데이터 보안: 광고 ID 수집 선언
- [ ] 앱 콘텐츠 > 콘텐츠 등급(IARC) 설문
- [ ] 앱 콘텐츠 > 타겟 고객층, 뉴스 앱 여부, 코로나19 앱 여부
- [ ] 국가/지역 선택

## 7. 프로덕션 출시

내부 테스트에서 문제가 없으면 진행한다.

- [ ] 프로덕션 > 새 버전 만들기 > 같은 AAB 를 내부 테스트에서 승격
- [ ] 검토 제출
- [ ] 승인 후 `git tag vc1 && git push origin vc1`

**태그를 반드시 남긴다.** 워크플로의 versionCode 가드가 `vc*` 태그를 기준으로 중복 versionCode 를 막는다. 태그가 없으면 이미 출시한 번호로 다시 빌드해도 통과해서, Play 업로드 단계에서야 거부당한다.

## 업데이트할 때

- [ ] `app.json` 의 `android.versionCode` 를 `+1`, 필요하면 `version` 도 올리기
- [ ] `main` 에서 빌드
- [ ] 내부 테스트 업로드 > 실기기 확인 > 프로덕션 승격
- [ ] `git tag vc<N> && git push origin vc<N>`

## 계정 단위 1회성

앱마다 반복하지 않아도 되는 것.

- `app-ads.txt` - AdMob 게시자 계정에 묶인다
- Play 개인 개발자 계정의 비공개 테스트 요건 (테스터 12명 / 14일) - 계정 단위 관문으로 보인다. 다만 신규 앱을 프로덕션에 올릴 때도 면제되는지는 미확인이다
