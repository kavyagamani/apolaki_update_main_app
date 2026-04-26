/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apolaki Design System - Solar Energy Platform
        // Based on MVP.PRD.md specifications
        
        // Primary: Solar Gold - Main brand color
        solar: {
          50: '#FFFBF0',
          100: '#FFF5DB',
          200: '#FFE8B6',
          300: '#FFDAA1',
          400: '#FFCC7F',
          500: '#FFB81C', // Primary Solar Gold
          600: '#F5A700',
          700: '#D68900',
          800: '#A85D00',
          900: '#7A3F00',
        },
        
        // Secondary: Sky Blue
        sky: {
          50: '#F0F8FF',
          100: '#E0F2FF',
          200: '#B8DCFF',
          300: '#86BFFF',
          400: '#4C9FFF',
          500: '#0066CC', // Secondary Sky Blue
          600: '#0052A3',
          700: '#003D7A',
          800: '#002847',
          900: '#001A33',
        },
        
        // Success: Green
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBDFC5',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#00B050', // Success Green
          600: '#00843D',
          700: '#165830',
          800: '#15803D',
          900: '#0F3F23',
        },
        
        // Warning: Orange
        warning: {
          50: '#FFF8F0',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FF9500', // Warning Orange
          600: '#EA580C',
          700: '#C2410C',
          800: '#92400E',
          900: '#67230B',
        },
        
        // Error: Red
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#E74C3C', // Error Red
          600: '#DC2626',
          700: '#B91C1C',
          800: '#7F1D1D',
          900: '#431313',
        },
        
        // Neutral: Gray Scale
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      backgroundColor: {
        solar: '#FFB81C',
        'sky-blue': '#0066CC',
      },
      textColor: {
        solar: '#FFB81C',
        'sky-blue': '#0066CC',
      },
      borderColor: {
        solar: '#FFB81C',
        'sky-blue': '#0066CC',
      },
      gradientColorStops: {
        solar: '#FFB81C',
        'sky-blue': '#0066CC',
      },
    },
  },
  plugins: [],
}
