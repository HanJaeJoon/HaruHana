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
 * Expo Go 와 웹에는 네이티브 모듈이 없어 호출이 실패할 수 있다. 알림은 부가 기능이므로
 * 실패를 삼키고 앱은 그대로 동작하게 둔다.
 */
export async function syncDailyReminder(time: string | null, oneThing: string): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!time) return;

    const granted = await ensurePermission();
    if (!granted) return;

    await ensureChannel();

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
  } catch {
    // 네이티브 모듈이 없는 환경 (Expo Go / 웹)
  }
}

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
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
