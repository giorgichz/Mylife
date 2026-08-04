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

type Props = {
  goal: Goal;
  width?: DimensionValue;
  /** 'grid' centers everything for the 3-up Home layout; 'default' is the horizontal list row. */
  variant?: 'default' | 'grid';
};

export function GoalCard({ goal, width, variant = 'default' }: Props) {
  const areaColor = colors.area[goal.areaKey];
  const isGrid = variant === 'grid';

  return (
    <AnimatedPressable onPress={() => router.push(`/goal/${goal.id}`)} scaleTo={0.97} style={isGrid ? styles.gridWrapper : undefined}>
      <GlassCard style={[isGrid ? undefined : { width: width ?? 220 }, isGrid && styles.gridCard]}>
        <View style={styles.top}>
          <View style={[styles.areaTag, { backgroundColor: `${areaColor}22` }]}>
            <Ionicons name={AREA_ICONS[goal.areaKey]} size={12} color={areaColor} />
            {!isGrid && <Text style={[styles.areaLabel, { color: areaColor }]}>{AREA_LABELS[goal.areaKey]}</Text>}
          </View>
          {isGrid ? (
            <AnimatedPressable
              onPress={() => router.push({ pathname: '/goal/edit', params: { id: goal.id } })}
              hitSlop={8}
            >
              <Ionicons name="ellipsis-horizontal" size={16} color={colors.textTertiary} />
            </AnimatedPressable>
          ) : (
            <ProgressRing value={goal.progress} size={36} strokeWidth={4} colorFrom={areaColor} colorTo={areaColor}>
              <Text style={styles.ringLabel}>{goal.progress}</Text>
            </ProgressRing>
          )}
        </View>

        {isGrid && (
          <ProgressRing
            value={goal.progress}
            size={68}
            strokeWidth={6}
            colorFrom={areaColor}
            colorTo={areaColor}
            style={styles.gridRing}
          >
            <Text style={styles.gridRingLabel}>{goal.progress}%</Text>
          </ProgressRing>
        )}

        <Text style={[styles.title, isGrid && styles.gridTitle]} numberOfLines={isGrid ? 3 : 2}>
          {goal.title}
        </Text>

        {goal.deadline && (
          <View style={isGrid ? styles.gridDeadlineRow : undefined}>
            {isGrid && <Ionicons name="calendar-outline" size={11} color={colors.textTertiary} />}
            <Text style={[styles.deadline, isGrid && styles.gridDeadlineText]}>
              {isGrid ? formatShortDate(goal.deadline) : `bis ${formatShortDate(goal.deadline)}`}
            </Text>
          </View>
        )}
      </GlassCard>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  gridWrapper: {
    flexGrow: 1,
    flexBasis: '31%',
  },
  gridCard: {
    alignItems: 'center',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
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
  gridRing: {
    marginBottom: spacing.md,
  },
  gridRingLabel: {
    ...type.headline,
    fontSize: 15,
    color: colors.textPrimary,
  },
  title: {
    ...type.headline,
    color: colors.textPrimary,
    minHeight: 44,
  },
  gridTitle: {
    ...type.footnote,
    fontWeight: '600',
    textAlign: 'center',
    minHeight: 32,
  },
  deadline: {
    ...type.footnote,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  gridDeadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  gridDeadlineText: {
    marginTop: 0,
    fontSize: 11,
  },
});
