import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '../../theme';
import { AnimatedPressable } from '../ui/AnimatedPressable';

export function MoodMetricRow({
  label,
  value,
  onChange,
  color = colors.accent,
}: {
  label: string;
  value: number; // 1-5
  onChange: (value: number) => void;
  color?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dots}>
        {[1, 2, 3, 4, 5].map((n) => (
          <AnimatedPressable key={n} onPress={() => onChange(n)} hitSlop={6} scaleTo={0.85}>
            <View
              style={[
                styles.dot,
                n <= value
                  ? { backgroundColor: color, borderColor: color }
                  : { backgroundColor: 'transparent', borderColor: colors.glassBorderStrong },
              ]}
            />
          </AnimatedPressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
  },
  label: {
    ...type.callout,
    color: colors.textSecondary,
  },
  dots: {
    flexDirection: 'row',
    gap: 7,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
});
