/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sumi: '#1a1a1a',         // 墨黑
        kinari: '#f5efe6',       // 生成色
        shu: '#c9302c',          // 朱紅
        usuzumi: '#5a5a5a',      // 薄墨
        kinari2: '#ebe3d4',      // 較深生成色
        gold: '#b8945f',         // 古金
      },
      fontFamily: {
        display: ['"Noto Serif JP"', '"Source Han Serif TC"', 'serif'],
        body: ['"Noto Sans JP"', '"Source Han Sans TC"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}
