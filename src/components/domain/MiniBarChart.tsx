import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { colors, spacing, type } from '../../theme';

type Bar = { label: string; value: number }; // value 0-1

export function MiniBarChart({ bars, color = colors.accent }: { bars: Bar[]; color?: string }) {
  return (
    <View style={styles.row}>
      {bars.map((bar, i) => (
        <BarColumn key={`${bar.label}-${i}`} bar={bar} index={i} color={color} />
      ))}
    </View>
  );
}

function BarColumn({ bar, index, color }: { bar: Bar; index: number; color: string }) {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withDelay(index * 40, withTiming(Math.max(0.06, bar.value), { duration: 500 }));
  }, [bar.value]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${height.value * 100}%`,
  }));

  return (
    <View style={styles.column}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedStyle, { backgroundColor: color }]} />
      </View>
      <Text style={styles.label}>{bar.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 84,
    gap: spacing.sm,
  },
  column: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  track: {
    flex: 1,
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: colors.glassFillStrong,
  },
  fill: {
    width: '100%',
    borderRadius: 6,
  },
  label: {
    ...type.caption,
    fontSize: 10,
    color: colors.textTertiary,
    textTransform: 'none',
  },
});
