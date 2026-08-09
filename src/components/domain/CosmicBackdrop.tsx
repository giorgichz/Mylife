import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '../../theme';

type Star = { x: number; y: number; r: number; o: number };

/** Small deterministic PRNG so the star field is stable across renders/reloads. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function useStars(count: number, seed: number): Star[] {
  return useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      r: 0.5 + rand() * 1.3,
      o: 0.15 + rand() * 0.55,
    }));
  }, [count, seed]);
}

/**
 * Ambient "own universe" backdrop: soft colored nebula blooms + a scattered
 * star field. Absolutely positioned, non-interactive — sits behind content.
 */
export function CosmicBackdrop({ height = 460 }: { height?: number }) {
  const stars = useStars(46, 1337);

  return (
    <View style={[styles.wrapper, { height }]} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id="bloomBlue" cx="20%" cy="8%" r="55%">
            <Stop offset="0%" stopColor={colors.area.ausbildung} stopOpacity={0.22} />
            <Stop offset="100%" stopColor={colors.area.ausbildung} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="bloomViolet" cx="88%" cy="2%" r="60%">
            <Stop offset="0%" stopColor={colors.area.psyche} stopOpacity={0.2} />
            <Stop offset="100%" stopColor={colors.area.psyche} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="bloomTeal" cx="50%" cy="30%" r="50%">
            <Stop offset="0%" stopColor={colors.area.geld} stopOpacity={0.12} />
            <Stop offset="100%" stopColor={colors.area.geld} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Circle cx="20" cy="8" r="55" fill="url(#bloomBlue)" />
        <Circle cx="88" cy="2" r="60" fill="url(#bloomViolet)" />
        <Circle cx="50" cy="30" r="50" fill="url(#bloomTeal)" />

        {stars.map((s, i) => (
          <Circle key={i} cx={s.x} cy={s.y} r={s.r * 0.35} fill="#FFFFFF" opacity={s.o} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
});
