import React from 'react';
import { DimensionValue, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AREA_ICONS, AREA_LABELS, Goal } from '../../data/types';
import { colors, radius, spacing, type } from '../../theme';
import { GlassCard } from '../ui/GlassCard';
import { ProgressRing } from '../ui/ProgressRing';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { formatShortDate } from '../../lib/greeting';

export function GoalCard({ goal, width = 220 }: { goal: Goal; width?: DimensionValue }) {
  const areaColor = colors.area[goal.areaKey];

  return (
    <AnimatedPressable onPress={() => router.push(`/goal/${goal.id}`)} scaleTo={0.97}>
      <GlassCard style={{ width }}>
        <View style={styles.top}>
          <View style={[styles.areaTag, { backgroundColor: `${areaColor}22` }]}>
            <Ionicons name={AREA_ICONS[goal.areaKey]} size={12} color={areaColor} />
            <Text style={[styles.areaLabel, { color: areaColor }]}>{AREA_LABELS[goal.areaKey]}</Text>
          </View>
          <ProgressRing value={goal.progress} size={36} strokeWidth={4}>
            <Text style={styles.ringLabel}>{goal.progress}</Text>
          </ProgressRing>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {goal.title}
        </Text>
        {goal.deadline && (
          <Text style={styles.deadline}>bis {formatShortDate(goal.deadline)}</Text>
        )}
      </GlassCard>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  areaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  areaLabel: {
    ...type.caption,
    fontSize: 10,
  },
  ringLabel: {
    ...type.caption,
    fontSize: 10,
    color: colors.textPrimary,
  },
  title: {
    ...type.headline,
    color: colors.textPrimary,
    minHeight: 44,
  },
  deadline: {
    ...type.footnote,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
});
