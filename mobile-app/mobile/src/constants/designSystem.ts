/**
 * Design System - Inspired by vouschurch.com
 * High-contrast, bold, modern aesthetic for influencer trust platform
 */

export const COLORS = {
  // Foundation (High Contrast)
  black: '#000000',
  white: '#FFFFFF',
  
  // Grays (Minimal use)
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  
  // Trust Score Colors (Vibrant)
  trustExcellent: '#10B981',    // Green - 80-100%
  trustGood: '#3B82F6',         // Blue - 60-79%
  trustNeutral: '#F59E0B',      // Orange - 40-59%
  trustPoor: '#EF4444',         // Red - 20-39%
  trustBad: '#DC2626',          // Dark Red - 0-19%
  
  // Accent Colors
  accentPurple: '#8B5CF6',
  accentPink: '#EC4899',
  accentCyan: '#06B6D4',
  
  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayHeavy: 'rgba(0, 0, 0, 0.8)',
};

export const TYPOGRAPHY = {
  // Font Families (System fonts for performance)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  
  // Font Sizes (Dramatic scale)
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter Spacing (Generous for uppercase)
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
  
  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const ANIMATION = {
  // Durations (ms)
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
    slower: 600,
  },
  
  // Easing
  easing: {
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    easeInOut: 'ease-in-out',
    spring: 'spring',
  },
  
  // Spring configs
  spring: {
    damping: 15,
    mass: 1,
    stiffness: 150,
  },
  
  // Timing configs
  timing: {
    fast: { duration: 150 },
    normal: { duration: 250 },
    slow: { duration: 400 },
  },
};

export const LAYOUT = {
  // Screen padding
  screenPadding: SPACING.md,
  
  // Card spacing
  cardGap: SPACING.md,
  
  // Section spacing
  sectionGap: SPACING['2xl'],
  
  // Touch targets
  minTouchTarget: 44,
  
  // Max widths
  maxContentWidth: 600,
};

// Helper function to get trust score color
export const getTrustScoreColor = (score: number): string => {
  if (score >= 80) return COLORS.trustExcellent;
  if (score >= 60) return COLORS.trustGood;
  if (score >= 40) return COLORS.trustNeutral;
  if (score >= 20) return COLORS.trustPoor;
  return COLORS.trustBad;
};

// Helper function to get trust score label
export const getTrustScoreLabel = (score: number): string => {
  if (score >= 80) return 'EXCELLENT';
  if (score >= 60) return 'FIABLE';
  if (score >= 40) return 'NEUTRE';
  if (score >= 20) return 'PRUDENCE';
  return 'RISQUÉ';
};

// Gradient presets
export const GRADIENTS = {
  trustExcellent: ['#10B981', '#059669'],
  trustGood: ['#3B82F6', '#2563EB'],
  trustNeutral: ['#F59E0B', '#D97706'],
  trustPoor: ['#EF4444', '#DC2626'],
  dark: ['#171717', '#000000'],
  hero: ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)'],
};
