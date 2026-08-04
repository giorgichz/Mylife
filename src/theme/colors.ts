/**
 * Dark, near-black palette. One accent, used sparingly.
 * Elevation is expressed as lightness steps, not shadows alone —
 * mirrors how iOS builds depth on OLED black.
 */
export const colors = {
  background: '#060608',
  backgroundElevated: '#0D0E11',
  card: '#131418',
  cardElevated: '#191A1F',

  glassFill: 'rgba(255,255,255,0.055)',
  glassFillStrong: 'rgba(255,255,255,0.11)',
  glassBorder: 'rgba(255,255,255,0.10)',
  glassBorderStrong: 'rgba(255,255,255,0.18)',

  hairline: 'rgba(255,255,255,0.08)',

  textPrimary: '#F5F5F7',
  textSecondary: 'rgba(245,245,247,0.62)',
  textTertiary: 'rgba(245,245,247,0.38)',
  textInverse: '#0A0A0A',

  accent: '#5FA8FF',
  accentSoft: 'rgba(95,168,255,0.18)',
  accentGradient: ['#4A7CFF', '#7FD8FF'] as const,

  success: '#33D17A',
  successSoft: 'rgba(51,209,122,0.16)',
  warning: '#FFB03B',
  warningSoft: 'rgba(255,176,59,0.16)',
  danger: '#FF5C5C',
  dangerSoft: 'rgba(255,92,92,0.16)',

  // one signature color per life area — used only as small accents (rings, dots), never as full fills
  area: {
    ausbildung: '#5FD1FF',
    psyche: '#B98CFF',
    geld: '#3DDBA0',
    fuehrerschein: '#FFA94D',
  },
} as const;

export type AreaKey = keyof typeof colors.area;
