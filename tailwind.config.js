/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: '#00f3ff', // 核心赛博蓝
        dark: '#0a0a0a',
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'], // 极客字体
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}