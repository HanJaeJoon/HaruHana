import { StyleSheet, TextInput } from 'react-native';

import type { ThemeColors } from '@/kit/theme';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  colors: ThemeColors;
  placeholder?: string;
  /** 설정 화면처럼 다른 입력 칸과 나란히 놓일 때 쓰는 한 단계 작은 크기. */
  compact?: boolean;
};

/**
 * 올해의 목표 제목 입력. 목표 설정과 설정 화면이 같은 것을 쓴다.
 * 길이 제한은 두지 않는다 - 제한은 문구가 아니라 사용자의 판단에 맡긴다.
 */
export function GoalTitleInput({ value, onChangeText, colors, placeholder, compact }: Props) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.faint}
      multiline
      style={[
        styles.input,
        compact ? styles.compact : styles.regular,
        { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  regular: {
    fontSize: 17,
    minHeight: 56,
  },
  compact: {
    fontSize: 16,
    minHeight: 52,
  },
});
