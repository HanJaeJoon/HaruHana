// 번역 문자열. kit/i18n 은 이 객체를 받기만 하고 내용을 모른다.
//
// 지원 언어는 ko/en 두 개다. 언어는 시스템 로케일을 따르고 앱 안에서 바꾸지 않는다.
// 문구에 색이나 게임화 표현(연속, 끊김)을 쓰지 않는다.

export const SUPPORTED_LOCALES = ['ko', 'en'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export const FALLBACK_LOCALE: AppLocale = 'en';

type Strings = {
  tagline: string;
  goalLabel: string;
  oneThingLabel: string;
  done: string;
  notDone: string;
  markedDone: string;
  markedNotDone: string;
  undo: string;
  yesterdayQuestion: string;
  journeyLabel: string;
  journeyValue: string;
  cumulative: string;
  monthDensity: string;
  celebrationTitle: string;
  celebrationBody: string;
  celebrationClose: string;
  noGoalTitle: string;
  noGoalBody: string;
  obStairsTitle: string;
  obStairsBody: string;
  obAreaTitle: string;
  obAreaBody: string;
  obGoalTitle: string;
  obGoalBody: string;
  obGoalPlaceholder: string;
  obOneThingTitle: string;
  obOneThingBody: string;
  obOneThingHint: string;
  obOneThingPlaceholder: string;
  obNotifyTitle: string;
  obNotifyBody: string;
  obNotifyCustom: string;
  obNotifyOff: string;
  obNext: string;
  obBack: string;
  obSkip: string;
  obStart: string;
  area_spirit: string;
  area_body: string;
  area_personal: string;
  area_relationships: string;
  area_job: string;
  area_business: string;
  area_finance: string;
};

export const translations: Record<AppLocale, Strings> = {
  ko: {
    tagline: '올해 목표 하나, 오늘의 하나.',
    goalLabel: '목표',
    oneThingLabel: '오늘의 하나',
    done: '해냈다',
    notDone: '못 했다',
    markedDone: '오늘 해냈다고 기록했어요',
    markedNotDone: '오늘은 못 했다고 기록했어요',
    undo: '되돌리기',
    yesterdayQuestion: '어제는 어땠나요?',
    journeyLabel: '습관 형성까지',
    journeyValue: '%{done}/%{target}일',
    cumulative: '누적 %{days}일',
    monthDensity: '이번 달 %{done}/%{total}',
    celebrationTitle: '66일',
    celebrationBody: '습관이 만들어졌어요. 이제부터는 누적으로 세어 나갑니다.',
    celebrationClose: '확인',
    noGoalTitle: '올해 목표가 아직 없어요',
    noGoalBody: '목표 하나와 그 목표를 전진시킬 오늘의 하나를 정하면 시작합니다.',
    obStairsTitle: '어디까지 가고 싶나요?',
    obStairsBody: '최종적으로 이루고 싶은 것에서 거꾸로 내려옵니다. 그것을 위해 5년 안에, 올해는 무엇을 해야 할까요? 지금 정하는 것은 올해의 목표 하나입니다.',
    obAreaTitle: '어느 영역인가요?',
    obAreaBody: '고르지 않아도 됩니다. 막막할 때 영감 재료로만 쓰세요. 영역별 목표를 따로 두지는 않습니다.',
    obGoalTitle: '올해 목표',
    obGoalBody: '크고 구체적으로 적어보세요. 하나만 적습니다.',
    obGoalPlaceholder: '예: 상반기 안에 토익 900점',
    obOneThingTitle: '오늘의 하나',
    obOneThingBody: '그 목표를 위해, 다른 모든 일들을 쉽게 혹은 필요 없게 만들 단 하나의 일은 무엇인가요?',
    obOneThingHint: '정량적 최소 기준을 문구에 넣으세요. 앱은 측정하지 않고, 해냈는지는 스스로 판단합니다.',
    obOneThingPlaceholder: '예: 최소 1시간 문제 풀기',
    obNotifyTitle: '알림 시각',
    obNotifyBody: '의지력이 남아 있는 시간이 좋습니다. 하나를 골라야 시작할 수 있고, 나중에 설정에서 바꾸거나 끌 수 있습니다.',
    obNotifyCustom: '직접 입력',
    obNotifyOff: '알림 없이 쓰기',
    obNext: '다음',
    obBack: '이전',
    obSkip: '건너뛰기',
    obStart: '시작하기',
    area_spirit: '정신적 행복',
    area_body: '신체적 건강',
    area_personal: '개인적 삶',
    area_relationships: '핵심 인간관계',
    area_job: '일',
    area_business: '회사',
    area_finance: '재정적 문제',
  },
  en: {
    tagline: 'One goal this year. One thing today.',
    goalLabel: 'Goal',
    oneThingLabel: 'Today, one thing',
    done: 'Did it',
    notDone: 'Did not',
    markedDone: 'Marked as done today',
    markedNotDone: 'Marked as not done today',
    undo: 'Undo',
    yesterdayQuestion: 'How did yesterday go?',
    journeyLabel: 'Toward a habit',
    journeyValue: '%{done}/%{target} days',
    cumulative: '%{days} days total',
    monthDensity: 'This month %{done}/%{total}',
    celebrationTitle: '66 days',
    celebrationBody: 'The habit is formed. From here it is counted as a running total.',
    celebrationClose: 'OK',
    noGoalTitle: 'No goal for this year yet',
    noGoalBody: 'Pick one goal and the one thing that moves it forward.',
    obStairsTitle: 'How far do you want to go?',
    obStairsBody: 'Start from what you ultimately want, then walk back down. For that, what about the next five years, and this year? What you set now is one goal for this year.',
    obAreaTitle: 'Which area is it?',
    obAreaBody: 'Optional. Use it only as inspiration when the goal feels vague. There is no per-area goal.',
    obGoalTitle: 'Your goal this year',
    obGoalBody: 'Write it big and specific. Just one.',
    obGoalPlaceholder: 'e.g. Run a half marathon by June',
    obOneThingTitle: 'Today, one thing',
    obOneThingBody: 'What is the ONE thing that makes everything else easier or unnecessary for that goal?',
    obOneThingHint: 'Put the minimum bar in the wording. The app measures nothing - you judge it.',
    obOneThingPlaceholder: 'e.g. Run at least 5 km',
    obNotifyTitle: 'Reminder time',
    obNotifyBody: 'Pick a time while your willpower is still full. You have to choose one to start, and you can change or turn it off later.',
    obNotifyCustom: 'Enter a time',
    obNotifyOff: 'Start without reminders',
    obNext: 'Next',
    obBack: 'Back',
    obSkip: 'Skip',
    obStart: 'Start',
    area_spirit: 'Spiritual life',
    area_body: 'Physical health',
    area_personal: 'Personal life',
    area_relationships: 'Key relationships',
    area_job: 'Job',
    area_business: 'Business',
    area_finance: 'Finances',
  },
};
