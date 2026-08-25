export const colors = {
  background: '#FCFBF4',
  text: '#3E3A39',
  textMuted: '#9B9593',
  accentRose: '#D89B94',
  fabTasks: '#5C4A3A',
  fabDaily: '#8B7355',
  iconSquare: '#F3EFEA',
  card: '#FFFFFF',
  accentPink: '#E88B85',
  accentBrown: '#C4A484',
  accentGreen: '#A8C090',
  beige: '#E8E0D8',
  beigeLight: '#F3EFEA',
  danger: '#D89B94',
  overlay: 'rgba(62, 58, 57, 0.4)',
  shadow: 'rgba(62, 58, 57, 0.08)',
  toggleTrack: '#E8E0D8',
  toggleActive: '#D89B94',
} as const;

export const fonts = {
  lora: 'Lora_700Bold',
  inter: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const taskAccentColors = {
  pink: colors.accentPink,
  brown: colors.accentBrown,
  green: colors.accentGreen,
} as const;

export type TaskAccent = keyof typeof taskAccentColors;

export const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

export const dailyIconOptions = [
  'Users',
  'Palmtree',
  'FileCode',
  'Coffee',
  'BookOpen',
  'Dumbbell',
] as const;

export type DailyIconName = (typeof dailyIconOptions)[number];
