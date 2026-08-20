// 번역 문자열. kit/i18n 은 이 객체를 받기만 하고 내용을 모른다.
//
// 새 앱을 만들 때 키 구조는 그대로 두고 값만 갈아끼우면 된다.
// 지원 언어를 늘리려면 SUPPORTED_LOCALES 와 여기에 항목을 함께 추가한다.

export const SUPPORTED_LOCALES = ['ko', 'en', 'ja', 'de', 'es', 'zh'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export const FALLBACK_LOCALE: AppLocale = 'en';

type Strings = {
  title: string;
  subtitle: string;
  principalLabel: string;
  monthlyLabel: string;
  rateLabel: string;
  yearsLabel: string;
  calculate: string;
  finalBalance: string;
  totalContributed: string;
  totalInterest: string;
  chartTitle: string;
  share: string;
  save: string;
  shareFooter: string;
  shareHeadline: string;
  invalidInput: string;
  savedTitle: string;
  savedBody: string;
  deniedTitle: string;
  deniedBody: string;
  shareFailTitle: string;
  shareFailBody: string;
  ok: string;
};

export const translations: Record<AppLocale, Strings> = {
  ko: {
    title: '복리 계산기',
    subtitle: '스타터 예시 화면 - kit 모듈 전체를 실제로 호출한다',
    principalLabel: '초기 원금',
    monthlyLabel: '매월 적립액',
    rateLabel: '연이율 (%)',
    yearsLabel: '기간 (년)',
    calculate: '계산하기',
    finalBalance: '최종 잔액',
    totalContributed: '넣은 원금',
    totalInterest: '이자 수익',
    chartTitle: '연도별 잔액',
    share: '공유',
    save: '이미지 저장',
    shareFooter: 'Microapp Starter 로 계산',
    shareHeadline: '%{years}년 뒤 %{balance}',
    invalidInput:
      '숫자를 확인해 주세요. 원금/적립액/이율은 0 이상, 기간은 1 이상 100 이하의 정수입니다.',
    savedTitle: '저장 완료',
    savedBody: '사진 앱에 이미지를 저장했습니다.',
    deniedTitle: '권한 필요',
    deniedBody: '이미지를 저장하려면 사진 접근 권한이 필요합니다.',
    shareFailTitle: '공유 실패',
    shareFailBody: '이미지를 만들지 못했습니다. 다시 시도해 주세요.',
    ok: '확인',
  },
  en: {
    title: 'Compound Interest',
    subtitle: 'Starter example screen - exercises every kit module',
    principalLabel: 'Initial principal',
    monthlyLabel: 'Monthly contribution',
    rateLabel: 'Annual rate (%)',
    yearsLabel: 'Years',
    calculate: 'Calculate',
    finalBalance: 'Final balance',
    totalContributed: 'Total contributed',
    totalInterest: 'Interest earned',
    chartTitle: 'Balance by year',
    share: 'Share',
    save: 'Save image',
    shareFooter: 'Calculated with Microapp Starter',
    shareHeadline: '%{balance} after %{years} years',
    invalidInput:
      'Check the numbers. Principal, contribution and rate must be 0 or more; years must be a whole number from 1 to 100.',
    savedTitle: 'Saved',
    savedBody: 'The image was saved to your photo library.',
    deniedTitle: 'Permission needed',
    deniedBody: 'Photo library access is required to save the image.',
    shareFailTitle: 'Share failed',
    shareFailBody: 'Could not create the image. Please try again.',
    ok: 'OK',
  },
  ja: {
    title: '複利計算',
    subtitle: 'スターターのサンプル画面 - kit の全モジュールを実際に呼び出す',
    principalLabel: '初期元金',
    monthlyLabel: '毎月の積立額',
    rateLabel: '年利 (%)',
    yearsLabel: '期間 (年)',
    calculate: '計算する',
    finalBalance: '最終残高',
    totalContributed: '払い込み元金',
    totalInterest: '利息',
    chartTitle: '年ごとの残高',
    share: '共有',
    save: '画像を保存',
    shareFooter: 'Microapp Starter で計算',
    shareHeadline: '%{years}年後に %{balance}',
    invalidInput:
      '数値を確認してください。元金/積立額/年利は 0 以上、期間は 1 以上 100 以下の整数です。',
    savedTitle: '保存しました',
    savedBody: '写真に画像を保存しました。',
    deniedTitle: '権限が必要です',
    deniedBody: '画像を保存するには写真へのアクセス権限が必要です。',
    shareFailTitle: '共有に失敗しました',
    shareFailBody: '画像を作成できませんでした。もう一度お試しください。',
    ok: 'OK',
  },
  de: {
    title: 'Zinseszins-Rechner',
    subtitle: 'Beispielbildschirm des Starters - nutzt jedes kit-Modul',
    principalLabel: 'Anfangskapital',
    monthlyLabel: 'Monatliche Einzahlung',
    rateLabel: 'Jahreszins (%)',
    yearsLabel: 'Laufzeit (Jahre)',
    calculate: 'Berechnen',
    finalBalance: 'Endkapital',
    totalContributed: 'Eingezahlt',
    totalInterest: 'Zinsertrag',
    chartTitle: 'Kapital pro Jahr',
    share: 'Teilen',
    save: 'Bild speichern',
    shareFooter: 'Berechnet mit Microapp Starter',
    shareHeadline: '%{balance} nach %{years} Jahren',
    invalidInput:
      'Bitte Zahlen prüfen. Kapital, Einzahlung und Zins müssen 0 oder mehr sein; die Laufzeit eine ganze Zahl von 1 bis 100.',
    savedTitle: 'Gespeichert',
    savedBody: 'Das Bild wurde in der Fotogalerie gespeichert.',
    deniedTitle: 'Berechtigung nötig',
    deniedBody: 'Zum Speichern des Bildes wird Zugriff auf die Fotogalerie benötigt.',
    shareFailTitle: 'Teilen fehlgeschlagen',
    shareFailBody: 'Das Bild konnte nicht erstellt werden. Bitte erneut versuchen.',
    ok: 'OK',
  },
  es: {
    title: 'Interés compuesto',
    subtitle: 'Pantalla de ejemplo del starter - usa todos los módulos de kit',
    principalLabel: 'Capital inicial',
    monthlyLabel: 'Aporte mensual',
    rateLabel: 'Tasa anual (%)',
    yearsLabel: 'Años',
    calculate: 'Calcular',
    finalBalance: 'Saldo final',
    totalContributed: 'Total aportado',
    totalInterest: 'Intereses ganados',
    chartTitle: 'Saldo por año',
    share: 'Compartir',
    save: 'Guardar imagen',
    shareFooter: 'Calculado con Microapp Starter',
    shareHeadline: '%{balance} en %{years} años',
    invalidInput:
      'Revisa los números. Capital, aporte y tasa deben ser 0 o más; los años, un entero de 1 a 100.',
    savedTitle: 'Guardado',
    savedBody: 'La imagen se guardó en tu galería.',
    deniedTitle: 'Permiso necesario',
    deniedBody: 'Se necesita acceso a la galería para guardar la imagen.',
    shareFailTitle: 'Error al compartir',
    shareFailBody: 'No se pudo crear la imagen. Inténtalo de nuevo.',
    ok: 'OK',
  },
  zh: {
    title: '复利计算器',
    subtitle: '模板示例页面 - 实际调用 kit 的全部模块',
    principalLabel: '初始本金',
    monthlyLabel: '每月投入',
    rateLabel: '年利率 (%)',
    yearsLabel: '年限',
    calculate: '开始计算',
    finalBalance: '最终余额',
    totalContributed: '累计投入',
    totalInterest: '利息收益',
    chartTitle: '各年度余额',
    share: '分享',
    save: '保存图片',
    shareFooter: '由 Microapp Starter 计算',
    shareHeadline: '%{years} 年后 %{balance}',
    invalidInput: '请检查数字。本金/投入/利率需大于等于 0，年限需为 1 到 100 的整数。',
    savedTitle: '已保存',
    savedBody: '图片已保存到相册。',
    deniedTitle: '需要权限',
    deniedBody: '保存图片需要访问相册的权限。',
    shareFailTitle: '分享失败',
    shareFailBody: '未能生成图片，请重试。',
    ok: '确定',
  },
};
