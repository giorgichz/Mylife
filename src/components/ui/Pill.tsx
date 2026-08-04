import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, type } from '../../theme';

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.glassFillStrong, fg: colors.textSecondary },
  accent: { bg: colors.accentSoft, fg: colors.accent },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
};

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const t = toneStyles[tone];
  return (
    <View style={[styles.base, { backgroundColor: t.bg }]}>
      <Text style={[styles.label, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  label: {
    ...type.caption,
    textTransform: 'uppercase',
  },
});
