import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import type { ThemeColors } from '@/kit/theme';

import type { Accent } from '@/lib/branding';

type Props = {
  label: string;
  onPress: () => void;
  colors: ThemeColors;
  accent: Accent;
  /** filled = 채운 버튼, outline = 외곽선 버튼. 상태 구분은 색이 아니라 채움으로 한다. */
  variant?: 'filled' | 'outline';
  disabled?: boolean;
  grow?: boolean;
};

export function PressButton({ label, onPress, colors, accent, variant = 'filled', disabled, grow }: Props) {
  const filled = variant === 'filled';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        grow ? styles.grow : null,
        filled
          ? { backgroundColor: accent.bg, borderColor: accent.bg }
          : { backgroundColor: 'transparent', borderColor: colors.border },
        disabled ? styles.disabled : null,
      ]}
    >
      <Text style={[styles.label, { color: filled ? accent.fg : colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  grow: {
    flex: 1,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
