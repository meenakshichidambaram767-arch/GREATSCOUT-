/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: {
          DEFAULT: '#0f172a',
          muted: '#131e36',
          border: '#1e293b',
          highlight: '#273552',
        },
        brand: {
          emerald: '#10b981',
          cyan: '#06b6d4',
          indigo: '#6366f1',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
        axiom: {
          black: '#0c0c0d',
          accent: '#DA840A',
          light: '#FFFFFF',
          paper: '#f2f2f2',
          border: 'rgba(255, 255, 255, 0.16)',
          paperBorder: 'rgba(12, 12, 13, 0.23)',
        },
        cnr: {
          bg: '#F4F9F9',
          surface: '#DDDDDD',
          dark: '#000000',
          card: '#FFFFFF',
          teal: '#16717d',
          tealLight: '#70a8af',
          emerald: '#10b981',
          dim: 'rgba(0, 0, 0, 0.05)',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        pretendard: ['Outfit', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Space Mono"', 'JetBrains Mono', 'monospace'],
      },
      spacing: {
        'cnr-1': '6px',
        'cnr-2': '10px',
        'cnr-3': '16px',
        'cnr-4': '20px',
        'cnr-5': '100px',
      },
      borderRadius: {
        'cnr-sm': '10px',
        'cnr-md': '20px',
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
        'glow-axiom': '0 0 25px -5px rgba(218, 132, 10, 0.35)',
        'cnr-card': '0 10px 30px rgba(0, 0, 0, 0.04)',
        'cnr-hover': '0 20px 40px rgba(22, 113, 125, 0.08)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
