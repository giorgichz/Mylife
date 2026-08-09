import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, type } from '../../theme';
import { AnimatedPressable } from '../ui/AnimatedPressable';

/** A single tappable meter (5 segments) — reads as one continuous bar, not a row of quiz radio-buttons. */
export function MoodMeterRow({
  icon,
  label,
  value,
  onChange,
  color = colors.accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number; // 0-5
  onChange: (value: number) => void;
  color?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={14} color={value > 0 ? color : colors.textTertiary} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.segments}>
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= value;
          return (
            <AnimatedPressable key={n} onPress={() => onChange(n)} style={styles.segmentPressable} scaleTo={0.94}>
              <View
                style={[
                  styles.segment,
                  filled ? { backgroundColor: color, shadowColor: color } : styles.segmentEmpty,
                ]}
              />
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    ...type.footnote,
    color: colors.textSecondary,
  },
  segments: {
    flexDirection: 'row',
    gap: 5,
  },
  segmentPressable: {
    flex: 1,
  },
  segment: {
    height: 10,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentEmpty: {
    backgroundColor: colors.glassFillStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorderStrong,
  },
});
