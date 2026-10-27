import { Linking, Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import Today from '@/app/index';
import { t } from '@/lib/i18n';

jest.mock('expo-router', () => ({ Redirect: () => null }));
jest.mock('@/lib/habitContext', () => ({
  useHabit: () => ({
    status: 'ready',
    goal: { id: 'g1', title: '목표', area: 'job', oneThing: '하나', createdAt: '2026-06-01' },
    records: [],
    settings: { notificationTime: '21:00', celebrated66: false },
    reminderStatus: 'permission-denied',
    mark: jest.fn(),
    unmark: jest.fn(),
    markCelebrated: jest.fn(),
  }),
}));

test('알림 거부 안내를 누르면 앱 정보 화면을 연다', async () => {
  const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
  let renderer: ReactTestRenderer | null = null;
  await act(async () => {
    renderer = create(<Today />);
  });
  const notice = renderer!.root
    .findAllByType(Text)
    .find((node) => node.props.children === t('todayReminderDenied'));
  expect(notice?.props.accessibilityRole).toBe('button');
  act(() => notice!.props.onPress());
  expect(openSettings).toHaveBeenCalledTimes(1);
});
