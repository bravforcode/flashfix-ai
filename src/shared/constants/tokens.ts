/**
 * Design Token System (Requirement 1.11)
 * Single source of truth for design values in TypeScript.
 */

export const COLORS = {
  primary: 'var(--color-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
  surface: 'var(--color-surface)',
  onSurface: 'var(--color-on-surface)',
  background: 'var(--color-background)',
  
  // Topic Colors
  topics: {
    derivative: 'var(--color-topic-calculus)', // mapped to calculus
    integral: 'var(--color-topic-integral)',
    limit: 'var(--color-topic-limit)',
    trigonometry: 'var(--color-topic-trigonometry)',
    algebra: 'var(--color-topic-algebra)',
    probability: 'var(--color-topic-probability)',
    geometry: 'var(--color-topic-geometry)',
    statistics: 'var(--color-topic-statistics)',
  }
}

export const SPACING = {
  1: 'var(--space-1)',
  2: 'var(--space-2)',
  3: 'var(--space-3)',
  4: 'var(--space-4)',
  5: 'var(--space-5)',
  6: 'var(--space-6)',
  8: 'var(--space-8)',
  10: 'var(--space-10)',
  12: 'var(--space-12)',
  16: 'var(--space-16)',
}

export const TYPOGRAPHY = {
  xs: 'var(--text-xs)',
  sm: 'var(--text-sm)',
  base: 'var(--text-base)',
  lg: 'var(--text-lg)',
  xl: 'var(--text-xl)',
  '2xl': 'var(--text-2xl)',
  '3xl': 'var(--text-3xl)',
}

export const RADIUS = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  full: 'var(--radius-full)',
}

export const Z_INDEX = {
  dropdown: 'var(--z-dropdown)',
  sticky: 'var(--z-sticky)',
  modal: 'var(--z-modal)',
  toast: 'var(--z-toast)',
  tooltip: 'var(--z-tooltip)',
}

export const SHADOWS = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
}

export const ANIMATION = {
  duration: {
    fast: 'var(--duration-fast)',
    base: 'var(--duration-base)',
    slow: 'var(--duration-slow)',
    '3d': 'var(--duration-3d)',
  },
  ease: 'var(--ease)',
  easeSpring: 'var(--ease-spring)',
}
