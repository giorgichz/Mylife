import React, { useRef } from 'react';
import { LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from 'expo-router/tabs';
import { colors, radius, spacing, type } from '../../theme';
import { springs } from '../../theme/motion';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home',
  ziele: 'flag',
  ki: 'sparkles',
  statistiken: 'stats-chart',
  profil: 'person',
};

const LABELS: Record<string, string> = {
  index: 'Home',
  ziele: 'Ziele',
  ki: 'KI',
  statistiken: 'Stats',
  profil: 'Profil',
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const layouts = useRef<Record<number, { x: number; width: number }>>({});

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  const onTabLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    layouts.current[index] = { x, width };
    if (index === state.index) {
      indicatorX.value = x;
      indicatorWidth.value = width;
    }
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View style={styles.bar}>
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.tint]} />
        <View style={styles.border} />

        <Animated.View style={[styles.indicator, indicatorStyle]} />

        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = LABELS[route.name] ?? route.name;
          const icon = ICONS[route.name] ?? 'ellipse';

          return (
            <Pressable
              key={route.key}
              onLayout={onTabLayout(index)}
              onPress={() => {
                if (!focused) {
                  Haptics.selectionAsync();
                  const layout = layouts.current[index];
                  if (layout) {
                    indicatorX.value = withSpring(layout.x, springs.snappy);
                    indicatorWidth.value = withSpring(layout.width, springs.snappy);
                  }
                }
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={styles.tab}
              hitSlop={6}
            >
              <Ionicons
                name={icon}
                size={22}
                color={focused ? colors.textPrimary : colors.textTertiary}
              />
              <Text style={[styles.label, { color: focused ? colors.textPrimary : colors.textTertiary }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const BAR_HEIGHT = 64;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  bar: {
    flexDirection: 'row',
    height: BAR_HEIGHT,
    width: '100%',
    borderRadius: radius.xxl,
    overflow: 'hidden',
    ...Platform.select({ android: { elevation: 16 } }),
  },
  tint: {
    backgroundColor: colors.glassFill,
  },
  border: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.xxl,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.glassBorder,
  },
  indicator: {
    position: 'absolute',
    top: 8,
    height: BAR_HEIGHT - 16,
    borderRadius: radius.lg,
    backgroundColor: colors.glassFillStrong,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    ...type.caption,
    textTransform: 'none',
    fontSize: 11,
  },
});
