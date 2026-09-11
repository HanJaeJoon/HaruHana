import { StyleSheet, View } from 'react-native';

/**
 * 하단 탭 아이콘. 아이콘 폰트나 SVG 의존성 없이 View 도형만으로 그린다.
 *
 * 이 앱은 색을 쓰지 않으므로(설계 결정 8) 아이콘도 단색 선/면이다. 색은 호출부가
 * 활성/비활성에 따라 accent 또는 faint 로 넘긴다.
 * 이모지/유니코드 기호는 기기 폰트마다 모양과 크기가 달라 쓰지 않는다.
 */
export type TabIconName = 'today' | 'calendar' | 'archive' | 'settings';

type Props = {
  name: TabIconName;
  color: string;
  /** 아이콘이 차지하는 정사각형 한 변. 기본 22dp. */
  size?: number;
};

export function TabIcon({ name, color, size = 22 }: Props) {
  return (
    // 아이콘은 장식이다. 라벨은 탭 자체가 accessibilityLabel 로 읽는다.
    <View style={[styles.box, { width: size, height: size }]} accessible={false} importantForAccessibility="no-hide-descendants">
      {name === 'today' && <TodayIcon color={color} size={size} />}
      {name === 'calendar' && <CalendarIcon color={color} size={size} />}
      {name === 'archive' && <ArchiveIcon color={color} size={size} />}
      {name === 'settings' && <SettingsIcon color={color} size={size} />}
    </View>
  );
}

/** 오늘: 체크가 든 원. */
function TodayIcon({ color, size }: { color: string; size: number }) {
  const stroke = Math.max(1.5, size * 0.08);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: stroke,
        borderColor: color,
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: size * 0.26,
          top: size * 0.47,
          width: size * 0.24,
          height: stroke,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: size * 0.36,
          top: size * 0.44,
          width: size * 0.42,
          height: stroke,
          backgroundColor: color,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

/** 기록: 머리띠가 있는 격자 사각형. */
function CalendarIcon({ color, size }: { color: string; size: number }) {
  const stroke = Math.max(1.2, size * 0.07);
  const cell = size * 0.17;
  return (
    <View
      style={{
        width: size,
        height: size * 0.92,
        borderRadius: size * 0.12,
        borderWidth: stroke,
        borderColor: color,
        overflow: 'hidden',
      }}
    >
      <View style={{ height: size * 0.16, backgroundColor: color }} />
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ width: cell, height: cell, backgroundColor: color }} />
        ))}
      </View>
    </View>
  );
}

/** 지난 목표: 뚜껑과 손잡이가 있는 상자. */
function ArchiveIcon({ color, size }: { color: string; size: number }) {
  const stroke = Math.max(1.2, size * 0.07);
  return (
    <View style={styles.center}>
      <View
        style={{
          width: size,
          height: size * 0.26,
          borderRadius: size * 0.06,
          borderWidth: stroke,
          borderColor: color,
        }}
      />
      <View
        style={{
          width: size * 0.84,
          height: size * 0.48,
          marginTop: size * 0.06,
          borderRadius: size * 0.06,
          borderWidth: stroke,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ width: size * 0.34, height: stroke, backgroundColor: color }} />
      </View>
    </View>
  );
}

/** 설정: 손잡이가 달린 슬라이더 3줄 (톱니는 View 로 그리면 뭉개진다). */
function SettingsIcon({ color, size }: { color: string; size: number }) {
  const line = Math.max(1.2, size * 0.07);
  const knob = size * 0.26;
  // 줄마다 손잡이 위치를 달리해 슬라이더로 읽히게 한다.
  const knobLefts = [size * 0.58, size * 0.16, size * 0.42];
  return (
    <View style={styles.rows}>
      {knobLefts.map((left, i) => (
        <View key={i} style={{ width: size, height: knob, justifyContent: 'center' }}>
          <View style={{ width: size, height: line, backgroundColor: color }} />
          <View
            style={{
              position: 'absolute',
              left,
              width: knob,
              height: knob,
              borderRadius: knob / 2,
              backgroundColor: color,
            }}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 2,
  },
  rows: {
    justifyContent: 'space-between',
  },
});
