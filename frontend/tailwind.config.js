/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'oklch(var(--border) / <alpha-value>)',
        input: 'oklch(var(--input) / <alpha-value>)',
        ring: 'oklch(var(--ring) / <alpha-value>)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'oklch(0.52 0.18 145)',
          foreground: 'oklch(0.98 0.005 120)',
          50: 'oklch(0.97 0.03 145)',
          100: 'oklch(0.93 0.06 145)',
          200: 'oklch(0.86 0.1 145)',
          300: 'oklch(0.76 0.14 145)',
          400: 'oklch(0.65 0.17 145)',
          500: 'oklch(0.52 0.18 145)',
          600: 'oklch(0.44 0.17 145)',
          700: 'oklch(0.37 0.15 145)',
          800: 'oklch(0.3 0.12 145)',
          900: 'oklch(0.22 0.08 145)',
        },
        secondary: {
          DEFAULT: 'oklch(0.65 0.18 55)',
          foreground: 'oklch(0.15 0.02 140)',
          50: 'oklch(0.97 0.03 55)',
          100: 'oklch(0.93 0.07 55)',
          200: 'oklch(0.86 0.12 55)',
          300: 'oklch(0.78 0.16 55)',
          400: 'oklch(0.72 0.18 55)',
          500: 'oklch(0.65 0.18 55)',
          600: 'oklch(0.56 0.17 55)',
          700: 'oklch(0.47 0.15 55)',
          800: 'oklch(0.38 0.12 55)',
          900: 'oklch(0.28 0.08 55)',
        },
        destructive: {
          DEFAULT: 'oklch(0.55 0.22 25)',
          foreground: 'oklch(0.98 0.005 120)',
        },
        muted: {
          DEFAULT: 'oklch(0.94 0.01 120)',
          foreground: 'oklch(0.5 0.04 140)',
        },
        accent: {
          DEFAULT: 'oklch(0.65 0.18 55)',
          foreground: 'oklch(0.15 0.02 140)',
        },
        popover: {
          DEFAULT: 'oklch(1 0 0)',
          foreground: 'oklch(0.15 0.02 140)',
        },
        card: {
          DEFAULT: 'oklch(1 0 0)',
          foreground: 'oklch(0.15 0.02 140)',
        },
        success: 'oklch(0.52 0.18 145)',
        warning: 'oklch(0.75 0.18 75)',
        emergency: 'oklch(0.55 0.25 25)',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
        'green-glow': '0 0 20px oklch(0.52 0.18 145 / 0.3)',
        'orange-glow': '0 0 20px oklch(0.65 0.18 55 / 0.3)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};
