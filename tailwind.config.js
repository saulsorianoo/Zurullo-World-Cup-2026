/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        dark: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a2e',
          600: '#16213e',
          500: '#0f3460',
        },
        accent: {
          gold:   '#FFD700',
          silver: '#C0C0C0',
          bronze: '#CD7F32',
        },
        result: {
          green:  '#22c55e',
          yellow: '#eab308',
          red:    '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'cursive'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 40%, #0f3460 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
        'gold-gradient': 'linear-gradient(135deg, #FFD700, #FFA500)',
        'silver-gradient': 'linear-gradient(135deg, #E8E8E8, #A9A9A9)',
        'bronze-gradient': 'linear-gradient(135deg, #E8A87C, #CD7F32)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255,215,0,0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(255,215,0,0.7)' },
        },
        slideIn: {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.4)',
        'glow-green': '0 0 15px rgba(34, 197, 94, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6)',
      }
    },
  },
  plugins: [],
}
