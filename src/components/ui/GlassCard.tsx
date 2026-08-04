import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, shadow } from '../../theme';

type GlassCardProps = ViewProps & {
  /** Larger radius + padding for hero cards (e.g. Life Score, greeting). */
  size?: 'default' | 'hero';
  /** Skip the blur for perf-sensitive lists; falls back to a flat glass fill. */
  flat?: boolean;
};

// Flow props affect how *children* are arranged, so they must land on the
// inner content container. Everything else (width, margin, flex, ...) sizes
// the card itself and stays on the outer wrapper.
const FLOW_KEYS = ['flexDirection', 'alignItems', 'justifyContent', 'flexWrap', 'gap', 'rowGap', 'columnGap'] as const;

function splitStyle(style: ViewStyle | undefined) {
  const flat = (StyleSheet.flatten(style) ?? {}) as ViewStyle;
  const flow: ViewStyle = {};
  const box: ViewStyle = {};
  for (const key of Object.keys(flat) as (keyof ViewStyle)[]) {
    if ((FLOW_KEYS as readonly string[]).includes(key)) {
      (flow as any)[key] = flat[key];
    } else {
      (box as any)[key] = flat[key];
    }
  }
  return { flow, box };
}

export function GlassCard({ style, size = 'default', flat = false, children, ...rest }: GlassCardProps) {
  const cardRadius = size === 'hero' ? radius.xxl : radius.lg;
  const { flow, box } = splitStyle(style as ViewStyle | undefined);

  return (
    <View style={[styles.wrapper, { borderRadius: cardRadius }, shadow.card, box]} {...rest}>
      {!flat && (
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      )}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: flat ? colors.card : colors.glassFill, borderRadius: cardRadius },
        ]}
      />
      <View style={[styles.border, { borderRadius: cardRadius }]} />
      <View style={[size === 'hero' ? styles.heroContent : styles.content, flow]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  border: {
    ...StyleSheet.absoluteFill,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    borderColor: colors.glassBorder,
  },
  content: {
    padding: 18,
  },
  heroContent: {
    padding: 24,
  },
});
