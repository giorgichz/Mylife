import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { TaskItem } from '../../data/types';
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
    <AnimatedPressable
      onPress={() => onToggle(task.id)}
      style={styles.row}
      scaleTo={0.99}
    >
      <View style={[styles.checkbox, task.done && { backgroundColor: areaColor, borderColor: areaColor }]}>
        {task.done && <Ionicons name="checkmark" size={13} color={colors.textInverse} />}
      </View>
      <Animated.Text
        style={[styles.title, textStyle, task.done && styles.titleDone]}
        numberOfLines={1}
      >
        {task.title}
      </Animated.Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.glassBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...type.body,
    color: colors.textPrimary,
    flex: 1,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
});
