import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { GlassCard, SectionHeader } from '../ui';
import { AnimatedPressable } from '../ui/AnimatedPressable';
import { colors, spacing, type } from '../../theme';

export type WeekDayInfo = {
  label: string;
  isToday: boolean;
  openCount: number;
  hasDeadline: boolean;
};

export function WeekStrip({ days }: { days: WeekDayInfo[] }) {
  return (
    <View>
      <SectionHeader title="Diese Woche" actionLabel="Ansehen" onAction={() => router.push('/week')} />
      <AnimatedPressable onPress={() => router.push('/week')} scaleTo={0.99}>
        <GlassCard style={styles.card}>
          <View style={styles.row}>
            {days.map((day, i) => (
              <View key={i} style={styles.dayCol}>
                <Text style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}>{day.label}</Text>
                <View style={[styles.dot, day.isToday && styles.dotToday, day.openCount === 0 && styles.dotEmpty]}>
                  <Text style={[styles.dotText, day.openCount === 0 && styles.dotTextEmpty]}>
                    {day.openCount > 0 ? day.openCount : '·'}
                  </Text>
                </View>
                <View style={[styles.deadlineMark, !day.hasDeadline && styles.deadlineMarkHidden]} />
              </View>
            ))}
          </View>
        </GlassCard>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.screenX,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
    width: 34,
  },
  dayLabel: {
    ...type.caption,
    color: colors.textTertiary,
    textTransform: 'none',
  },
  dayLabelToday: {
    color: colors.accent,
    fontWeight: '700',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.glassFillStrong,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.glassBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotToday: {
    borderColor: colors.accent,
  },
  dotEmpty: {
    opacity: 0.5,
  },
  dotText: {
    ...type.caption,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  dotTextEmpty: {
    color: colors.textTertiary,
    fontWeight: '400',
  },
  deadlineMark: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.warning,
  },
  deadlineMarkHidden: {
    opacity: 0,
  },
});
