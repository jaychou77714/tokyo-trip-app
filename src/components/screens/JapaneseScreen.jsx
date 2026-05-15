import React, { useState, useMemo } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, Shuffle } from 'lucide-react'
import { Button, EditorialHeader } from '../Common'
import { PHRASES, PHRASE_CATEGORIES, getPhrasesByCategory } from '../../data/japanese-phrases'

const FAV_KEY = 'tokyo_trip_fav_phrases'

export default function JapaneseScreen({ onBack }) {
  const [activeCategory, setActiveCategory] = useState(PHRASE_CATEGORIES[0].id)
  const [index, setIndex] = useState(0)
  const [favorites, setFavorites] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]')) }
    catch { return new Set() }
  })

  const phrases = useMemo(() => getPhrasesByCategory(activeCategory), [activeCategory])
  const phrase = phrases[index] || phrases[0]
  const cat = PHRASE_CATEGORIES.find(c => c.id === activeCategory)

  function changeCategory(id) {
    setActiveCategory(id)
    setIndex(0)
  }

  function next() {
    setIndex(i => (i + 1) % phrases.length)
  }

  function prev() {
    setIndex(i => (i - 1 + phrases.length) % phrases.length)
  }

  function shuffle() {
    setIndex(Math.floor(Math.random() * phrases.length))
  }

  function toggleFav() {
    if (!phrase) return
    const key = `${phrase.cat}-${phrase.jp}`
    const newFavs = new Set(favorites)
    if (newFavs.has(key)) newFavs.delete(key)
    else newFavs.add(key)
    setFavorites(newFavs)
    localStorage.setItem(FAV_KEY, JSON.stringify([...newFavs]))
  }

  const isFav = phrase ? favorites.has(`${phrase.cat}-${phrase.jp}`) : false

  // 鍵盤快捷鍵
  React.useEffect(() => {
    function handleKey(e) {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === ' ') { e.preventDefault(); shuffle() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [phrases.length])

  return (
    <div className="paper-bg min-h-screen pb-24">
      <div className="px-5 pt-12 pb-4 max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-usuzumi tracking-wider uppercase mb-4 hover:text-shu font-display"
        >
          <ArrowLeft size={14} /> 返回工具箱
        </button>

        <EditorialHeader jp="日本語フレーズ" zh="Japanese Phrases · 250 句" accent="03" tape="blue" />

        <p className="text-xs text-usuzumi font-display mb-4 italic">
          ※ 點擊卡片可前後翻 · 鍵盤 ← → 切換 · 空白鍵隨機
        </p>

        {/* 分類標籤 */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-5 px-5">
          {PHRASE_CATEGORIES.map(c => {
            const count = getPhrasesByCategory(c.id).length
            const active = activeCategory === c.id
            return (
              <button
                key={c.id}
                onClick={() => changeCategory(c.id)}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-display flex items-center gap-1.5 transition-all"
                style={{
                  background: active ? c.color : '#FFFCF5',
                  color: active ? '#FAF6EC' : '#3D2817',
                  border: active ? '1.5px solid #3D2817' : '1.5px dashed #D4B896',
                }}
              >
                <span>{c.emoji}</span>
                {c.name}
                <span className="text-[10px] opacity-70 font-mono">{count}</span>
              </button>
            )
          })}
        </div>

        {/* 卡片 */}
        {phrase && (
          <div
            className="paper-plain p-6 mb-4 relative"
            style={{
              border: '2px solid #3D2817',
              boxShadow: '5px 5px 0 ' + cat.color,
              minHeight: '280px',
            }}
          >
            {/* 紙膠帶 */}
            <div
              className="absolute -top-2 left-6 w-24 h-4"
              style={{
                background: cat.color,
                backgroundImage: 'linear-gradient(180deg, transparent 47%, rgba(255,255,255,0.4) 47%, rgba(255,255,255,0.4) 53%, transparent 53%)',
                transform: 'rotate(-3deg)',
              }}
            />

            {/* 進度 */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] tracking-widest uppercase text-usuzumi font-mono">
                {cat.emoji} {cat.name} · {index + 1} / {phrases.length}
              </div>
              <button
                onClick={toggleFav}
                className="p-1 transition-all"
                title="收藏"
              >
                <Heart
                  size={16}
                  fill={isFav ? '#E84E4E' : 'none'}
                  color={isFav ? '#E84E4E' : '#6B4423'}
                />
              </button>
            </div>

            {/* 日文 */}
            <div className="text-center my-6">
              <div
                className="font-display font-bold mb-3 leading-tight"
                style={{ fontSize: '28px', color: '#3D2817' }}
              >
                {phrase.jp}
              </div>
              <div className="text-sm text-usuzumi font-mono mb-4 italic">
                {phrase.romaji}
              </div>
              <div className="font-display text-base text-shu border-t border-dashed border-gold pt-3">
                {phrase.zh}
              </div>
            </div>

            {/* 翻卡按鈕 */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={prev}
                className="flex items-center gap-1 px-3 py-2 transition-all"
                style={{
                  background: '#FFFCF5',
                  border: '1.5px solid #3D2817',
                  boxShadow: '2px 2px 0 #3D2817',
                }}
              >
                <ChevronLeft size={16} />
                <span className="text-xs font-display">上一張</span>
              </button>

              <button
                onClick={shuffle}
                className="p-2 transition-all"
                title="隨機"
                style={{
                  background: '#FFFCF5',
                  border: '1.5px dashed #6B4423',
                }}
              >
                <Shuffle size={14} />
              </button>

              <button
                onClick={next}
                className="flex items-center gap-1 px-3 py-2 transition-all"
                style={{
                  background: '#FF8B5A',
                  color: '#FAF6EC',
                  border: '1.5px solid #3D2817',
                  boxShadow: '2px 2px 0 #3D2817',
                }}
              >
                <span className="text-xs font-display font-bold">下一張</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* 統計 */}
        <div className="paper-plain p-3 text-center"
          style={{ border: '1.5px dashed #6B4423' }}>
          <div className="text-[10px] tracking-widest uppercase text-usuzumi font-mono mb-1">
            ★ 我的學習進度
          </div>
          <div className="text-xs font-display">
            <span className="text-shu font-bold">已收藏 {favorites.size}</span> 句 · 總共 {PHRASES.length} 句
          </div>
        </div>
      </div>
    </div>
  )
}
