/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      colors: {
        base: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          800: '#18181b',
          900: '#09090b',
        },
        brand: {
          DEFAULT: '#eab308',
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
        },
        bg: {
          DEFAULT: '#0a0a0b',
          elevated: '#121214',
          hover: '#1a1a1d',
          subtle: '#17171a',
        },
        text: {
          DEFAULT: '#f5f5f7',
          muted: '#9a9a9d',
          subtle: '#6a6a6e',
          'subtle-2': '#4a4a4e',
        },
        border: {
          DEFAULT: '#262628',
          hover: '#363638',
        },
        status: {
          amber: '#f59e0b',
          green: '#22c55e',
          red: '#ef4444',
          gray: '#6b7280',
          cancelled: '#9ca3af',
        },
        warning: {
          DEFAULT: '#f59e0b',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#feebc7',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        success: {
          DEFAULT: '#22c55e',
        },
        error: {
          DEFAULT: '#ef4444',
        },
        'brand-muted': {
          DEFAULT: '#fef9c3',
        },
        'warning-muted': {
          DEFAULT: '#fffbeb',
        },
        'success-muted': {
          DEFAULT: '#dcfce8',
        },
        'error-muted': {
          DEFAULT: '#fee2e2',
        },
        'neutral-muted': {
          DEFAULT: '#27272a',
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      animation: {
        'slide-down': 'slide-down 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
      keyframes: {
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};