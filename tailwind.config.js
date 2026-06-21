/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Quicksand', 'system-ui', 'sans-serif'],
      },
      colors: {
        'surface': '#fdf7ff',
        'surface-dim': '#ded8e2',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f8f1fb',
        'surface-container': '#f2ecf6',
        'on-surface': '#1d1a21',
        'on-surface-variant': '#494552',
        'inverse-surface': '#322f37',
        'inverse-on-surface': '#f5eff8',
        'outline': '#7a7583',
        'outline-variant': '#cac4d4',
        'primary': '#674bb5',
        'on-primary': '#ffffff',
        'primary-container': '#a78bfa',
        'on-primary-container': '#3c1989',
        'inverse-primary': '#cebdff',
        'primary-fixed': '#e8ddff',
        'primary-fixed-dim': '#cebdff',
        'on-primary-fixed': '#21005e',
        'on-primary-fixed-variant': '#4f319c',
        'secondary': '#765469',
        'on-secondary': '#ffffff',
        'secondary-container': '#fdd0ea',
        'on-secondary-container': '#79576c',
        'secondary-fixed': '#e8ddff',
        'secondary-fixed-dim': '#e5bad3',
        'on-secondary-fixed': '#2c1325',
        'on-secondary-fixed-variant': '#5c3d51',
        'tertiary': '#6d5e00',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#b49c00',
        'tertiary-fixed': '#ffe24c',
        'tertiary-fixed-dim': '#e2c62d',
        'on-tertiary-fixed': '#211b00',
        'on-tertiary-fixed-variant': '#524600',
        'error': '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        'success': '#4ade80',
        'on-success': '#ffffff',
      },
      borderRadius: {
        'sm': '0.25rem',
        'base': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
      },
      spacing: {
        'gutter': '16px',
        'card-gap': '16px',
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(103, 75, 181, 0.12)',
        'soft-lg': '0 8px 24px rgba(103, 75, 181, 0.12)',
      },
      animation: {
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'success-pop': 'successPop 2.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
      },
      keyframes: {
        bounceIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.3)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.05)',
          },
          '100%': {
            transform: 'scale(1)',
          },
        },
        successPop: {
          '0%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '70%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
            transform: 'scale(1.2)',
          },
        },
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
}
