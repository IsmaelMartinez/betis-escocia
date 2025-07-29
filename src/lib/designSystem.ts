// Design System for Peña Bética Escocesa
// Brand-consistent colors, typography, and component styles

export const brandColors = {
  // Primary Betis Colors
  primary: {
    green: '#00A651',
    greenDark: '#008542',
    greenLight: '#4EB475',
    greenPale: '#E8F5E8',
  },
  
  // Secondary Colors
  secondary: {
    gold: '#FFD700',
    goldDark: '#e6c200',
    goldLight: '#FFF176',
    goldPale: '#FFFACD',
  },
  
  // Scottish Accent Colors
  accent: {
    blue: '#005EB8',
    navy: '#0B1426',
    tartan: '#2E7D32',
  },
  
  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    dark: '#0f1419',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  },
  
  // Status Colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  }
} as const;

export const typography = {
  fontFamily: {
    primary: 'var(--font-geist-sans, ui-sans-serif, system-ui)',
    display: 'var(--font-geist-sans, ui-sans-serif, system-ui)',
  },
  
  fontSize: {
    // Body text
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    
    // Headings
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  }
} as const;

export const spacing = {
  // Base spacing scale (4px base)
  px: '1px',
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.125rem',     // 2px
  base: '0.25rem',    // 4px
  md: '0.375rem',     // 6px
  lg: '0.5rem',       // 8px
  xl: '0.75rem',      // 12px
  '2xl': '1rem',      // 16px
  '3xl': '1.5rem',    // 24px
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  betis: '0 4px 14px 0 rgb(0 166 81 / 0.39)',
} as const;

// Component style presets
export const buttonStyles = {
  base: 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  
  variants: {
    primary: 'bg-betis-green hover:bg-betis-green-dark text-white focus:ring-betis-green',
    secondary: 'bg-betis-gold hover:bg-betis-gold-dark text-betis-dark focus:ring-betis-gold',
    outline: 'border border-betis-green text-betis-green hover:bg-betis-green hover:text-white focus:ring-betis-green',
    ghost: 'text-betis-green hover:bg-betis-green/10 focus:ring-betis-green',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  },
  
  sizes: {
    xs: 'px-2 py-1 text-xs rounded',
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
    xl: 'px-8 py-4 text-lg rounded-xl',
  }
} as const;

export const cardStyles = {
  base: 'bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-shadow duration-300',
  interactive: 'hover:shadow-xl cursor-pointer',
  elevated: 'shadow-xl',
  betis: 'border-betis-green/20 shadow-betis/20',
} as const;

export const inputStyles = {
  base: 'w-full px-4 py-3 border rounded-lg transition-colors focus:ring-2 focus:ring-betis-green focus:border-transparent',
  states: {
    default: 'border-gray-300',
    error: 'border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:ring-green-500',
  }
} as const;

// Animation and transition presets
export const animations = {
  transition: {
    fast: 'transition-all duration-150 ease-in-out',
    normal: 'transition-all duration-200 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out',
  },
  
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
} as const;

// Layout and grid helpers
export const layout = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-12 sm:py-16 lg:py-20',
  
  grid: {
    auto: 'grid grid-cols-1 gap-6',
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    dense: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  }
} as const;

// Utility functions
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const getButtonClass = (variant: keyof typeof buttonStyles.variants, size: keyof typeof buttonStyles.sizes = 'md') => {
  return cn(buttonStyles.base, buttonStyles.variants[variant], buttonStyles.sizes[size]);
};

export const getCardClass = (variant: keyof typeof cardStyles = 'base') => {
  return cardStyles[variant];
};

export const getInputClass = (state: keyof typeof inputStyles.states = 'default') => {
  return cn(inputStyles.base, inputStyles.states[state]);
};
