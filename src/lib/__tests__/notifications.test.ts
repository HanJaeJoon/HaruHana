// 알림 예약은 네이티브 모듈이라 실기기에서만 도는데, 07:00 알림이 오지 않는 사고는
// 전부 "권한이 없어 조용히 빠져나갔다" 쪽이었다. 그래서 여기서는 발송이 아니라
// 분기(권한/취소/채널 순서)와 반환값을 고정한다.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { syncDailyReminder } from '../notifications';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  getPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
  scheduleNotificationAsync: jest.fn(async () => 'id-1'),
  getAllScheduledNotificationsAsync: jest.fn(async () => [{ identifier: 'id-1' }]),
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
  AndroidImportance: { DEFAULT: 3 },
}));

const mocked = Notifications as unknown as {
  setNotificationChannelAsync: jest.Mock;
  getPermissionsAsync: jest.Mock;
  requestPermissionsAsync: jest.Mock;
  cancelAllScheduledNotificationsAsync: jest.Mock;
  scheduleNotificationAsync: jest.Mock;
  getAllScheduledNotificationsAsync: jest.Mock;
};

/** 권한 응답을 한 번만 바꾼다. */
function givenPermission(current: { granted: boolean; canAskAgain: boolean }) {
  mocked.getPermissionsAsync.mockResolvedValue(current);
}

beforeEach(() => {
  jest.clearAllMocks();
  mocked.setNotificationChannelAsync.mockResolvedValue(undefined);
  mocked.getPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true });
  mocked.requestPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true });
  mocked.cancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);
  mocked.scheduleNotificationAsync.mockResolvedValue('id-1');
  mocked.getAllScheduledNotificationsAsync.mockResolvedValue([{ identifier: 'id-1' }]);
});

describe('syncDailyReminder', () => {
  it('권한이 이미 있으면 예약하고 scheduled 를 준다', async () => {
    const result = await syncDailyReminder('07:00', '30분 걷기');

    expect(result).toBe('scheduled');
    expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(mocked.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const arg = mocked.scheduleNotificationAsync.mock.calls[0][0];
    expect(arg.trigger).toMatchObject({ hour: 7, minute: 0 });
  });

  it('아직 묻지 않았고 사용자가 허용하면 예약한다', async () => {
    givenPermission({ granted: false, canAskAgain: true });
    mocked.requestPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true });

    const result = await syncDailyReminder('07:00', '30분 걷기');

    expect(result).toBe('scheduled');
    expect(mocked.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mocked.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it('사용자가 거부하면 예약하지 않고, 살아 있는 예약도 지우지 않는다', async () => {
    givenPermission({ granted: false, canAskAgain: true });
    mocked.requestPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true });

    const result = await syncDailyReminder('07:00', '30분 걷기');

    expect(result).toBe('permission-denied');
    expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect(mocked.cancelAllScheduledNotificationsAsync).not.toHaveBeenCalled();
  });

  it('기기 설정에서 막혀 있으면 묻지 않고 permission-blocked 를 준다', async () => {
    givenPermission({ granted: false, canAskAgain: false });

    const result = await syncDailyReminder('07:00', '30분 걷기');

    expect(result).toBe('permission-blocked');
    expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('canPrompt 가 false 면 시스템 다이얼로그를 띄우지 않는다', async () => {
    givenPermission({ granted: false, canAskAgain: true });

    const result = await syncDailyReminder('07:00', '30분 걷기', { canPrompt: false });

    expect(result).toBe('permission-denied');
    expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('시각이 null 이면 권한과 무관하게 취소하고 off 를 준다', async () => {
    givenPermission({ granted: false, canAskAgain: false });

    const result = await syncDailyReminder(null, '');

    expect(result).toBe('off');
    expect(mocked.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('예약이 하나도 남지 않으면 unavailable 을 준다', async () => {
    mocked.getAllScheduledNotificationsAsync.mockResolvedValue([]);

    expect(await syncDailyReminder('07:00', '30분 걷기')).toBe('unavailable');
  });

  it('네이티브 호출이 실패하면 unavailable 을 준다', async () => {
    mocked.scheduleNotificationAsync.mockRejectedValue(new Error('no native module'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(await syncDailyReminder('07:00', '30분 걷기')).toBe('unavailable');

    warn.mockRestore();
  });

  // 채널이 있어야 사용자가 기기 설정에서 이 앱의 알림 항목을 찾아 켤 수 있다.
  // 권한이 없을 때 채널 생성까지 건너뛰면 켤 방법 자체가 사라진다.
  it('채널을 권한 확인보다 먼저 만든다 (안드로이드)', async () => {
    const original = Platform.OS;
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
    givenPermission({ granted: false, canAskAgain: false });

    await syncDailyReminder('07:00', '30분 걷기');

    Object.defineProperty(Platform, 'OS', { value: original, configurable: true });

    expect(mocked.setNotificationChannelAsync).toHaveBeenCalledTimes(1);
    expect(mocked.setNotificationChannelAsync.mock.invocationCallOrder[0]).toBeLessThan(
      mocked.getPermissionsAsync.mock.invocationCallOrder[0]
    );
  });
});
