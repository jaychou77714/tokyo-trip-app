/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sumi: '#3D2817',         // 深咖啡（取代墨黑）
        kinari: '#FAF6EC',       // 紙張米白
        kinari2: '#FFFCF5',      // 奶白卡片
        shu: '#FF8B5A',          // 紙膠帶橘（主強調）
        usuzumi: '#6B4423',      // 中咖啡
        gold: '#D4B896',         // 米黃邊框
        stamp: '#E84E4E',        // 印章紅
        sora: '#A8C5D9',         // 淡藍
        wakaba: '#7FA468',       // 嫩綠
        kohaku: '#F0B450',       // 琥珀黃
        line: '#E8D8B5',         // 紙張橫線
      },
      fontFamily: {
        display: ['"Klee One"', '"Noto Serif JP"', '"Source Han Serif TC"', 'serif'],
        body: ['"Noto Sans JP"', '"Source Han Sans TC"', 'sans-serif'],
        hand: ['"Klee One"', '"Yusei Magic"', '"Noto Serif JP"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}
