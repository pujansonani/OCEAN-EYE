/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#030712',
          900: '#060e1d',
          850: '#0b162c',
          800: '#102244',
          700: '#173260',
          600: '#1f4582',
          500: '#2c62b5',
          accent: '#00e5ff',
          teal: '#00b4d8',
          glow: '#38bdf8',
          gold: '#d8b452',
          warn: '#ffb703',
          alert: '#ff4d4f',
        }
      },
      fontFamily: {
        display: ['"Syne"', '"Plus Jakarta Sans"', 'sans-serif'],
        tech: ['"Orbitron"', '"Syne"', 'sans-serif'],
        sans: ['"Geist"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'sweep 4s linear infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
