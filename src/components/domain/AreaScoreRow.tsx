import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AREA_ICONS, AREA_LABELS, AreaKey } from '../../data/types';
import { colors, spacing, type } from '../../theme';
import { ProgressBar } from '../ui/ProgressBar';

export function AreaScoreRow({ area, score }: { area: AreaKey; score: number }) {
  const color = colors.area[area];
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: `${color}26`,
            borderColor: `${color}55`,
            shadowColor: color,
          },
        ]}
      >
        <View style={[styles.orbCore, { backgroundColor: color }]} />
        <Ionicons name={AREA_ICONS[area]} size={14} color={colors.textPrimary} style={styles.orbIcon} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {AREA_LABELS[area]}
      </Text>
      <View style={styles.barWrap}>
        <ProgressBar value={score} color={color} />
      </View>
      <Text style={styles.value}>{score}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  orbCore: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.9,
  },
  orbIcon: {
    opacity: 0.95,
  },
  label: {
    ...type.footnote,
    color: colors.textSecondary,
    width: 84,
  },
  barWrap: {
    flex: 1,
  },
  value: {
    ...type.footnote,
    color: colors.textPrimary,
    width: 36,
    textAlign: 'right',
  },
});
