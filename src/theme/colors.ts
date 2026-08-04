/**
 * Dark, near-black palette. One accent, used sparingly.
 * Elevation is expressed as lightness steps, not shadows alone —
 * mirrors how iOS builds depth on OLED black.
 */
export const colors = {
  background: '#0A0A0A',
  backgroundElevated: '#111214',
  card: '#17181B',
  cardElevated: '#1C1D21',

  glassFill: 'rgba(255,255,255,0.06)',
  glassFillStrong: 'rgba(255,255,255,0.10)',
  glassBorder: 'rgba(255,255,255,0.09)',
  glassBorderStrong: 'rgba(255,255,255,0.16)',

  hairline: 'rgba(255,255,255,0.08)',

  textPrimary: '#F5F5F7',
  textSecondary: 'rgba(245,245,247,0.62)',
  textTertiary: 'rgba(245,245,247,0.38)',
  textInverse: '#0A0A0A',

  accent: '#4FA8FF',
  accentSoft: 'rgba(79,168,255,0.16)',
  accentGradient: ['#3E9CFF', '#7FD8FF'] as const,

  success: '#33D17A',
  successSoft: 'rgba(51,209,122,0.16)',
  warning: '#FFB03B',
  warningSoft: 'rgba(255,176,59,0.16)',
  danger: '#FF5C5C',
  dangerSoft: 'rgba(255,92,92,0.16)',

  // one signature color per life area — used only as small accents (rings, dots), never as full fills
  area: {
    ausbildung: '#7FD8FF',
    psyche: '#C9A6FF',
    geld: '#5CE0B5',
    fuehrerschein: '#FFB86B',
  },
} as const;

export type AreaKey = keyof typeof colors.area;
