import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '../../theme';
import { AnimatedPressable } from '../ui/AnimatedPressable';

const FACES = ['😞', '🙁', '😐', '🙂', '😄'];

export function MoodFaceSelector({
  value,
  onChange,
  color = colors.area.psyche,
}: {
  value: number; // 0 = unanswered, 1-5 otherwise
  onChange: (value: number) => void;
  color?: string;
}) {
  return (
    <View style={styles.row}>
      {FACES.map((face, i) => {
        const n = i + 1;
        const active = n === value;
        return (
          <AnimatedPressable key={n} onPress={() => onChange(n)} scaleTo={0.88} hitSlop={4}>
            <View
              style={[
                styles.faceWrap,
                active && {
                  backgroundColor: `${color}22`,
                  borderColor: color,
                  shadowColor: color,
                },
                !active && value > 0 && styles.faceDimmed,
              ]}
            >
              <Text style={[styles.face, !active && value > 0 && styles.faceTextDimmed]}>{face}</Text>
            </View>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  faceWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.glassBorderStrong,
    backgroundColor: colors.glassFillStrong,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 4,
  },
  faceDimmed: {
    opacity: 0.45,
  },
  face: {
    fontSize: 26,
  },
  faceTextDimmed: {
    opacity: 0.8,
  },
  label: {
    ...type.footnote,
    color: colors.textTertiary,
  },
  spacing: {
    height: spacing.sm,
  },
});
