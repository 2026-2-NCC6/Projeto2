import '@/global.css';

import { Platform } from 'react-native';

export const FluxColors = {
  primary: '#7B68EE',
  primaryLight: '#9D8DF8',
  primaryDark: '#5A46D6',
  primarySoft: 'rgba(123, 104, 238, 0.16)',
  primaryGlow: 'rgba(123, 104, 238, 0.35)',
  background: '#090A10',
  backgroundSecondary: '#11131F',
  glassSurface: 'rgba(24, 27, 42, 0.74)',
  glassSurfaceElevated: 'rgba(34, 38, 58, 0.82)',
  glassBorder: 'rgba(255, 255, 255, 0.09)',
  glassBorderActive: 'rgba(123, 104, 238, 0.55)',
  text: '#F5F7FF',
  textSecondary: '#949AB1',
  textMuted: '#636982',
  success: '#10B981',
  successSoft: 'rgba(16, 185, 129, 0.16)',
  warning: '#F59E0B',
  warningSoft: 'rgba(245, 158, 11, 0.16)',
  danger: '#EF4444',
  dangerSoft: 'rgba(239, 68, 68, 0.16)',
} as const;

export const Colors = {
  light: {
    text: FluxColors.text,
    background: FluxColors.background,
    backgroundElement: FluxColors.backgroundSecondary,
    backgroundSelected: FluxColors.primarySoft,
    textSecondary: FluxColors.textSecondary,
  },
  dark: {
    text: FluxColors.text,
    background: FluxColors.background,
    backgroundElement: FluxColors.backgroundSecondary,
    backgroundSelected: FluxColors.primarySoft,
    textSecondary: FluxColors.textSecondary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 88, android: 88, default: 88 }) ?? 88;
export const MaxContentWidth = 680;
