import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:          '#1A5C2A',
        'primary-light':  '#2E7D40',
        'primary-dark':   '#0F3D1A',
        'primary-surface':'#EEF5F0',
        accent:           '#F4521E',
        background:       '#F7F7F7',
        surface:          '#FFFFFF',
        'surface-grey':   '#F0F0F0',
        'text-primary':   '#1A1A1A',
        'text-secondary': '#6B6B6B',
        'text-light':     '#AAAAAA',
        'text-on-primary':'#FFFFFF',
        border:           '#E0E0E0',
        divider:          '#F0F0F0',
        success:          '#2E7D32',
        error:            '#D32F2F',
        warning:          '#F9A825',
        info:             '#0277BD',
        'status-pending':    '#9E9E9E',
        'status-confirmed':  '#1565C0',
        'status-preparing':  '#F57C00',
        'status-ready':      '#388E3C',
        'status-delivering': '#F57C00',
        'status-delivered':  '#1A5C2A',
        'status-completed':  '#1A5C2A',
        'status-cancelled':  '#D32F2F',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '24px',
        full: '9999px',
      },
      spacing: {
        xs:   '4px',
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '24px',
        xxl:  '32px',
        xxxl: '48px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.08)',
        md: '0 4px 12px rgba(0,0,0,0.10)',
        lg: '0 8px 24px rgba(0,0,0,0.12)',
      },
      maxWidth: {
        content: '1280px',
      },
      width: {
        sidebar: '260px',
      },
      height: {
        navbar: '64px',
      },
      keyframes: {
        'slide-up': {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in':  'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
