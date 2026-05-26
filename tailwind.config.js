/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Pastel surface palette
        'dark-navy': '#edf6ff',
        'dark-charcoal': '#dcecff',
        'dark-secondary': '#f7fbff',
        // Soft accent palette
        'neon-cyan': '#5fa8ff',
        'neon-lime': '#77cdb7',
        'neon-magenta': '#f88bb0',
        'neon-purple': '#b9a4ff',
        // Text
        'text-primary': '#23314d',
        'text-secondary': '#5b6f90',
        'text-muted': '#8ea0bc'
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        pulseGlow: {
          '0%, 100%': { 'box-shadow': '0 0 20px rgba(0, 217, 255, 0.3)' },
          '50%': { 'box-shadow': '0 0 40px rgba(0, 217, 255, 0.6)' }
        }
      },
      boxShadow: {
        'glow-cyan': '0 10px 30px rgba(95, 168, 255, 0.3)',
        'glow-lime': '0 10px 30px rgba(119, 205, 183, 0.3)',
        'glow-magenta': '0 10px 30px rgba(248, 139, 176, 0.3)'
      }
    }
  },
  plugins: []
}
