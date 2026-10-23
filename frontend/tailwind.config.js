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
        background: '#f4f8f8',
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f4f8f8',
          border: '#dbe7e7',
          highlight: '#eaf3f3',
        },
        gs: {
          bg: '#f4f8f8',
          surface: '#ffffff',
          border: '#dbe7e7',
          grid: '#e3eded',
          teal: '#0e6670',
          tealHover: '#0a4e56',
          tealSubtle: '#eaf3f3',
          text: '#1f2a2e',
          muted: '#55696e',
          black: '#0b0f10',
          amber: '#d98a00',
          red: '#b3261e',
        },
        brand: {
          emerald: '#0e6670',
          cyan: '#178996',
          indigo: '#0e6670',
          amber: '#d98a00',
          rose: '#b3261e',
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
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
      },
      borderRadius: {
        'card': '20px',
        'card-lg': '24px',
        'pill': '999px',
        'cnr-sm': '10px',
        'cnr-md': '20px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 16px -2px rgba(14, 102, 112, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 12px 28px -4px rgba(14, 102, 112, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'cnr-card': '0 10px 30px rgba(0, 0, 0, 0.04)',
        'cnr-hover': '0 20px 40px rgba(22, 113, 125, 0.08)',
      }
    },
  },
  plugins: [],
}

