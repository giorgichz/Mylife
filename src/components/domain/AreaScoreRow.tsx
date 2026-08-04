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
      <View style={[styles.iconWrap, { backgroundColor: `${color}22` }]}>
        <Ionicons name={AREA_ICONS[area]} size={15} color={color} />
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
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
