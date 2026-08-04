import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AREA_ICONS, AREA_LABELS, TaskItem } from '../../data/types';
import { colors, spacing, type } from '../../theme';
import { AnimatedPressable } from '../ui/AnimatedPressable';

export function TaskRow({ task, onToggle }: { task: TaskItem; onToggle: (id: string) => void }) {
  const areaColor = colors.area[task.areaKey];
  const doneProgress = useSharedValue(task.done ? 1 : 0);

  useEffect(() => {
    doneProgress.value = withTiming(task.done ? 1 : 0, { duration: 220 });
  }, [task.done]);

  const textStyle = useAnimatedStyle(() => ({
    opacity: 1 - doneProgress.value * 0.5,
  }));

  return (
    <AnimatedPressable onPress={() => onToggle(task.id)} style={styles.row} scaleTo={0.99}>
      <View style={[styles.accentBar, { backgroundColor: areaColor }]} />
      <View style={[styles.checkbox, task.done && { backgroundColor: areaColor, borderColor: areaColor }]}>
        {task.done && <Ionicons name="checkmark" size={13} color={colors.textInverse} />}
      </View>
      <View style={styles.textCol}>
        <Animated.Text style={[styles.title, textStyle, task.done && styles.titleDone]} numberOfLines={1}>
          {task.title}
        </Animated.Text>
        <View style={styles.metaRow}>
          <Ionicons name={AREA_ICONS[task.areaKey]} size={11} color={colors.textTertiary} />
          <Text style={styles.metaText}>{AREA_LABELS[task.areaKey]}</Text>
        </View>
      </View>
      {task.done ? (
        <View style={styles.doneTag}>
          <Ionicons name="checkmark" size={12} color={colors.success} />
          <Text style={styles.doneTagText}>Erledigt</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
  },
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.glassBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  title: {
    ...type.body,
    color: colors.textPrimary,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  metaText: {
    ...type.caption,
    color: colors.textTertiary,
    textTransform: 'none',
  },
  doneTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doneTagText: {
    ...type.footnote,
    color: colors.success,
  },
});
