/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sumi: '#3D2817',
        kinari: '#FAF6EC',
        kinari2: '#FFFCF5',
        shu: '#FF8B5A',
        usuzumi: '#6B4423',
        gold: '#D4B896',
        stamp: '#E84E4E',
        sora: '#A8C5D9',
        wakaba: '#7FA468',
        kohaku: '#F0B450',
        line: '#E8D8B5',
      },
      fontFamily: {
        // 標題保留 Klee One 手寫風
        display: ['"Klee One"', '"Noto Serif JP"', '"Source Han Serif TC"', 'serif'],
        // 內文改用 Noto Sans JP（更粗更清楚）
        body: ['"Noto Sans JP"', '"Source Han Sans TC"', '-apple-system', 'sans-serif'],
        hand: ['"Klee One"', '"Yusei Magic"', '"Noto Serif JP"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}
