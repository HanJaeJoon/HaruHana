// 매일 반복되는 로컬 알림. 서버 없이 기기에서만 예약한다.
//
// kit 에 넣지 않는다 - 사용처가 이 앱 하나뿐이다. 두 번째 알림 사용 앱이 나오면 승격한다.
// 이미 오늘 기록이 있어도 알림은 항상 발송한다: 반복 트리거는 조건부 발송을 지원하지
// 않고, "다음 1회만 재예약" 방식은 앱을 며칠 열지 않으면 알림이 끊긴다.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { BRANDING } from './branding';
import { t } from './i18n';

const CHANNEL_ID = 'daily-one-thing';

/**
 * 동기화 결과. 화면이 "설정에는 07:00 인데 실제로는 예약되지 않은" 상태를 알 수 있게
 * 한다. 실패를 조용히 삼키면 사용자는 알림이 켜져 있다고 믿는다.
 *
 * - scheduled: 예약됐다
 * - off: 알림을 쓰지 않기로 한 상태 (time 이 null)
 * - permission-denied: 권한이 없다. 다시 물어볼 수는 있다
 * - permission-blocked: 기기 설정에서 막혀 있어 앱이 다시 물을 수 없다
 * - unavailable: 네이티브 모듈이 없거나(Expo Go / 웹) 예약이 등록되지 않았다
 */
export type ReminderSyncResult = 'scheduled' | 'off' | 'permission-denied' | 'permission-blocked' | 'unavailable';

export type SyncDailyReminderOptions = {
  /**
   * 권한이 없을 때 시스템 다이얼로그를 띄워도 되는지. 앱 시작이나 포그라운드 복귀의
   * 자동 동기화에서는 false 로 불러 사용자가 건드리지 않은 순간에 창이 뜨지 않게 한다.
   */
  canPrompt?: boolean;
};

// 앱이 열려 있을 때도 배너로 보이게 한다.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * 예약 상태를 알림 시각과 문구에 맞춘다.
 *
 * 항상 전부 취소하고 다시 예약한다 (예약이 하나뿐이라 이게 가장 단순하다).
 * time 이 null 이면 취소만 한다.
 *
 * 취소는 권한 확인 뒤에 한다. 권한이 없는데 먼저 지워 버리면 예전에 예약해 둔
 * 살아 있는 알림까지 잃는다. 채널 생성은 반대로 권한 확인 앞에 둔다 - 채널이 있어야
 * 사용자가 기기 설정에서 이 앱의 알림 항목을 찾아 켤 수 있다.
 *
 * Expo Go 와 웹에는 네이티브 모듈이 없어 호출이 실패할 수 있다. 알림은 부가 기능이므로
 * 앱은 그대로 동작하게 두고, 실패는 반환값으로만 알린다.
 */
export async function syncDailyReminder(
  time: string | null,
  oneThing: string,
  opts?: SyncDailyReminderOptions
): Promise<ReminderSyncResult> {
  const canPrompt = opts?.canPrompt ?? true;
  try {
    await ensureChannel();

    if (!time) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return 'off';
    }

    const permission = await checkPermission(canPrompt);
    if (permission !== 'granted') return permission;

    await Notifications.cancelAllScheduledNotificationsAsync();

    const [hour, minute] = time.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: BRANDING.appName,
        body: t('notificationBody', { oneThing }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: CHANNEL_ID,
        hour,
        minute,
      },
    });

    // 예약 호출이 조용히 실패하는 기기가 있다. 실제로 남았는지 확인한다.
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    if (scheduled.length === 0) return 'unavailable';
    return 'scheduled';
  } catch (error) {
    if (__DEV__) console.warn('[notifications] syncDailyReminder 실패', error);
    return 'unavailable';
  }
}

type PermissionResult = 'granted' | 'permission-denied' | 'permission-blocked';

async function checkPermission(canPrompt: boolean): Promise<PermissionResult> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'granted';
  if (!current.canAskAgain) return 'permission-blocked';
  if (!canPrompt) return 'permission-denied';
  const asked = await Notifications.requestPermissionsAsync();
  if (asked.granted) return 'granted';
  return asked.canAskAgain ? 'permission-denied' : 'permission-blocked';
}

/** Android 8 이상은 채널 없이는 알림이 표시되지 않는다. */
async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: t('notificationChannel'),
    importance: Notifications.AndroidImportance.DEFAULT,
    // 소리를 끄면 안드로이드에서 배너가 뜨지 않으므로 기본 소리를 그대로 둔다.
  });
}
