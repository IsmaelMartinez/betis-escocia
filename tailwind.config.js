/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Real Betis official brand colors
        'betis': {
          'green': '#00A651',
          'green-dark': '#008542',
          'green-light': '#33B76A',
          'white': '#FFFFFF',
          'dark': '#0f1419',
          'black': '#000000',
          'gold': '#FFD700',
          'gold-dark': '#e6c200',
          'gold-light': '#FFF44F',
        },
        // Scottish accent colors
        'scotland': {
          'blue': '#005EB8',
          'navy': '#0B1426',
          'light-blue': '#4A90C2',
        },
        // Enhanced grays for better hierarchy
        'custom-gray': {
          '25': '#FCFCFD',
          '50': '#F9FAFB',
          '100': '#F3F4F6',
          '200': '#E5E7EB',
          '300': '#D1D5DB',
          '400': '#9CA3AF',
          '500': '#6B7280',
          '600': '#4B5563',
          '700': '#374151',
          '800': '#1F2937',
          '900': '#111827',
          '950': '#030712',
        }
      },
      fontFamily: {
        'sans': ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
        'mono': ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'betis': '0 4px 14px 0 rgba(0, 166, 81, 0.25)',
        'betis-lg': '0 10px 25px -3px rgba(0, 166, 81, 0.1), 0 4px 6px -2px rgba(0, 166, 81, 0.05)',
        'betis-xl': '0 20px 25px -5px rgba(0, 166, 81, 0.1), 0 10px 10px -5px rgba(0, 166, 81, 0.04)',
        'gold': '0 4px 14px 0 rgba(255, 215, 0, 0.25)',
        'gold-lg': '0 10px 25px -3px rgba(255, 215, 0, 0.1), 0 4px 6px -2px rgba(255, 215, 0, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-betis': 'linear-gradient(135deg, #00A651 0%, #008542 100%)',
        'gradient-betis-reverse': 'linear-gradient(135deg, #008542 0%, #00A651 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FFD700 0%, #e6c200 100%)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        '0': '0ms',
        '2000': '2000ms',
        '3000': '3000ms',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [
    // Add any additional Tailwind plugins here
  ],
}
