import { Platform, TextStyle } from 'react-native';

/**
 * SF Pro on iOS is the system font already. Android's system font
 * (Roboto) reads noticeably heavier at the same sizes, so we tighten
 * tracking there to keep the two platforms feeling like one product.
 */
const fontFamily = Platform.select({
  ios: undefined, // system = SF Pro
  android: undefined, // system = Roboto, tracking compensated below
  default: undefined,
});

const trackingBoost = Platform.OS === 'android' ? -0.1 : 0;

export const type = {
  largeTitle: {
    fontFamily,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.6 + trackingBoost,
  },
  title1: {
    fontFamily,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.4 + trackingBoost,
  },
  title2: {
    fontFamily,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.3 + trackingBoost,
  },
  headline: {
    fontFamily,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.2 + trackingBoost,
  },
  body: {
    fontFamily,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: -0.1 + trackingBoost,
  },
  callout: {
    fontFamily,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500' as const,
    letterSpacing: -0.1 + trackingBoost,
  },
  footnote: {
    fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
    letterSpacing: 0 + trackingBoost,
  },
  caption: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  numeric: {
    fontFamily,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '700' as const,
    letterSpacing: -0.8 + trackingBoost,
    fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
  },
};
