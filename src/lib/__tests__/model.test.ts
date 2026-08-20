import { isArchive, isGoal, isOnboardingDraft, isRecords, isSettings } from '../model';

const goal = {
  id: 'g1',
  title: '토익 900점',
  oneThing: '최소 1시간 문제 풀기',
  createdAt: '2026-08-20',
};

describe('isGoal', () => {
  it('필수 필드가 있으면 통과한다 (영역은 선택)', () => {
    expect(isGoal(goal)).toBe(true);
    expect(isGoal({ ...goal, area: 'job' })).toBe(true);
  });

  it('필수 필드가 없거나 형이 다르면 거부한다', () => {
    expect(isGoal(null)).toBe(false);
    expect(isGoal({})).toBe(false);
    expect(isGoal({ ...goal, title: 42 })).toBe(false);
    expect(isGoal({ ...goal, oneThing: undefined })).toBe(false);
  });

  it('날짜 형식이 아닌 createdAt 은 거부한다', () => {
    expect(isGoal({ ...goal, createdAt: '2026/08/20' })).toBe(false);
  });

  it('7개 영역에 없는 태그는 거부한다', () => {
    expect(isGoal({ ...goal, area: 'hobby' })).toBe(false);
  });
});

describe('isRecords', () => {
  it('날짜/여부 쌍의 배열만 통과시킨다', () => {
    expect(isRecords([])).toBe(true);
    expect(isRecords([{ date: '2026-08-20', done: true }])).toBe(true);
    expect(isRecords([{ date: '2026-08-20' }])).toBe(false);
    expect(isRecords([{ date: 'yesterday', done: true }])).toBe(false);
    expect(isRecords({})).toBe(false);
  });

  it('같은 날짜가 두 번 들어 있으면 거부한다 (하루에 항목 하나)', () => {
    expect(
      isRecords([
        { date: '2026-08-20', done: true },
        { date: '2026-08-20', done: false },
      ])
    ).toBe(false);
  });
});

describe('isArchive', () => {
  it('지난 목표 항목의 배열을 통과시킨다', () => {
    expect(isArchive([])).toBe(true);
    expect(
      isArchive([
        { goal, records: [{ date: '2026-08-20', done: true }], closedAt: '2026-09-01', outcome: 'achieved' },
      ])
    ).toBe(true);
  });

  it('outcome 이 achieved/closed 가 아니면 거부한다', () => {
    expect(isArchive([{ goal, records: [], closedAt: '2026-09-01', outcome: 'dropped' }])).toBe(false);
  });

  it('내부 목표나 기록이 깨져 있으면 거부한다', () => {
    expect(isArchive([{ goal: {}, records: [], closedAt: '2026-09-01', outcome: 'closed' }])).toBe(false);
    expect(isArchive([{ goal, records: [{ date: 'x', done: true }], closedAt: '2026-09-01', outcome: 'closed' }])).toBe(
      false
    );
  });
});

describe('isSettings', () => {
  it('알림 시각은 HH:mm 이거나 null(꺼짐) 이다', () => {
    expect(isSettings({ notificationTime: '07:00', celebrated66: false })).toBe(true);
    expect(isSettings({ notificationTime: null, celebrated66: true })).toBe(true);
    expect(isSettings({ notificationTime: '7:00', celebrated66: false })).toBe(false);
    expect(isSettings({ notificationTime: '24:00', celebrated66: false })).toBe(false);
    expect(isSettings({ notificationTime: '07:60', celebrated66: false })).toBe(false);
  });

  it('celebrated66 이 없으면 거부한다', () => {
    expect(isSettings({ notificationTime: null })).toBe(false);
  });
});

describe('isOnboardingDraft', () => {
  const draft = { step: 'goal', title: '토익 900점', oneThing: '' };

  it('단계와 두 입력이 있으면 통과한다', () => {
    expect(isOnboardingDraft(draft)).toBe(true);
    expect(isOnboardingDraft({ ...draft, area: 'body' })).toBe(true);
  });

  it('아직 고르지 않은 알림 시각(없음)과 꺼짐(null)을 모두 허용한다', () => {
    expect(isOnboardingDraft({ ...draft, notificationTime: undefined })).toBe(true);
    expect(isOnboardingDraft({ ...draft, notificationTime: null })).toBe(true);
    expect(isOnboardingDraft({ ...draft, notificationTime: '07:30' })).toBe(true);
    expect(isOnboardingDraft({ ...draft, notificationTime: '7:30' })).toBe(false);
  });

  it('알 수 없는 단계나 깨진 영역은 거부한다', () => {
    expect(isOnboardingDraft({ ...draft, step: 'summary' })).toBe(false);
    expect(isOnboardingDraft({ ...draft, area: 'sleep' })).toBe(false);
    expect(isOnboardingDraft({ title: 'x', oneThing: '' })).toBe(false);
    expect(isOnboardingDraft(null)).toBe(false);
  });
});
