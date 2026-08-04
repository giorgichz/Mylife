import { Easing } from 'react-native-reanimated';

/**
 * Spring presets tuned to feel like iOS UIKit springs, not the
 * bouncy defaults most RN apps ship with. Two presets cover ~95%
 * of cases: `snappy` for taps/toggles, `gentle` for entrances.
 */
export const springs = {
  snappy: { damping: 20, stiffness: 260, mass: 0.7 },
  gentle: { damping: 18, stiffness: 140, mass: 0.9 },
  slow: { damping: 22, stiffness: 90, mass: 1 },
};

export const durations = {
  fast: 180,
  base: 280,
  slow: 420,
};

export const easings = {
  standard: Easing.bezier(0.22, 1, 0.36, 1),
  decelerate: Easing.out(Easing.cubic),
};
