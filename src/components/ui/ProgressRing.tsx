import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  /** 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  trackColor?: string;
  children?: React.ReactNode;
};

export function ProgressRing({
  value,
  size = 96,
  strokeWidth = 10,
  colorFrom = colors.accentGradient[0],
  colorTo = colors.accentGradient[1],
  trackColor = colors.glassFillStrong,
  children,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);
  const gradientId = `ring-${colorFrom}-${colorTo}`.replace(/[^a-zA-Z0-9]/g, '');

  useEffect(() => {
    progress.value = withTiming(Math.max(0, Math.min(100, value)) / 100, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [value]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colorFrom} />
            <Stop offset="100%" stopColor={colorTo} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}
