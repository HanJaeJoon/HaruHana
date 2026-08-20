import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

// 공유 시트를 지원하는 환경인지 (웹 일부/시뮬레이터에서 미지원)
export function useShareAvailability(): boolean {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    Sharing.isAvailableAsync()
      .then(setAvailable)
      .catch(() => setAvailable(false));
  }, []);
  return available;
}

export async function captureCard(ref: React.RefObject<View | null>): Promise<string> {
  const uri = await captureRef(ref, { format: 'png', quality: 1 });
  return uri.startsWith('file') ? uri : `file://${uri}`;
}

export async function shareImage(uri: string): Promise<void> {
  await Sharing.shareAsync(uri, { mimeType: 'image/png' });
}

// 권한이 거부되면 'denied'를 반환한다. 사용자 안내 문구는 앱이 번역해 표시한다.
//
// expo-media-library 는 웹 구현이 없다 (SDK 57 의 ExpoMediaLibraryNext 네이티브 모듈).
// 최상위에서 import 하면 웹 번들이 로드되는 순간 throw 해서 앱 전체가 빈 화면이 된다.
// kit/ads 가 Expo Go 를 다루는 것과 같은 방식으로 여기서 지연 require 한다.
// 웹에서 이 함수를 호출하면 throw 하며, 호출부의 try/catch 가 받는다.
export async function saveImageToLibrary(uri: string): Promise<'saved' | 'denied'> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const MediaLibrary = require('expo-media-library') as typeof import('expo-media-library');
  const { granted } = await MediaLibrary.requestPermissionsAsync(true);
  if (!granted) return 'denied';
  await MediaLibrary.saveToLibraryAsync(uri);
  return 'saved';
}
