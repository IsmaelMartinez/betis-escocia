// Design System for Peña Bética Escocesa
// Brand-consistent colors, typography, and component styles

export const buttonStyles = {
  base: 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  
  variants: {
    primary: 'bg-betis-green-DEFAULT hover:bg-betis-green-700 text-white focus:ring-betis-green-DEFAULT',
    secondary: 'bg-betis-gold-DEFAULT hover:bg-betis-gold-700 text-neutral-900 focus:ring-betis-gold-DEFAULT',
    outline: 'border border-betis-green-DEFAULT text-betis-green-DEFAULT hover:bg-betis-green-DEFAULT hover:text-white focus:ring-betis-green-DEFAULT',
    ghost: 'text-betis-green-DEFAULT hover:bg-betis-green-DEFAULT/10 focus:ring-betis-green-DEFAULT',
    danger: 'bg-utility-error hover:bg-red-700 text-white focus:ring-utility-error',
  },
  
  sizes: {
    xs: 'px-spacing-2 py-spacing-1 text-xs rounded-sm',
    sm: 'px-spacing-3 py-spacing-1-5 text-sm rounded-md',
    md: 'px-spacing-4 py-spacing-2 text-sm rounded-lg',
    lg: 'px-spacing-6 py-spacing-3 text-base rounded-lg',
    xl: 'px-spacing-8 py-spacing-4 text-lg rounded-xl',
  }
} as const;

export const cardStyles = {
  base: 'bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden transition-shadow duration-300',
  interactive: 'hover:shadow-xl cursor-pointer',
  elevated: 'shadow-xl',
  betis: 'border-betis-green-DEFAULT/20 shadow-betis-green-DEFAULT/20',
} as const;

export const inputStyles = {
  base: 'w-full px-spacing-4 py-spacing-3 border rounded-lg transition-colors focus:ring-2 focus:ring-betis-green-DEFAULT focus:border-transparent',
  states: {
    default: 'border-neutral-300',
    error: 'border-utility-error focus:ring-utility-error',
    success: 'border-utility-success focus:ring-utility-success',
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
  container: 'max-w-breakpoint-7xl mx-auto px-spacing-4 sm:px-spacing-6 lg:px-spacing-8',
  section: 'py-spacing-12 sm:py-spacing-16 lg:py-spacing-20',
  
  grid: {
    auto: 'grid grid-cols-1 gap-spacing-6',
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-spacing-6',
    dense: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-spacing-4',
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
