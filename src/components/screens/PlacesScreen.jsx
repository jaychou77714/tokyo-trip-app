import React, { useState, useMemo } from 'react'
import { Search, Heart, MapPin } from 'lucide-react'
import { EditorialHeader, StampLabel, EmptyState } from '../Common'
import { PLACES, getPlacesByCategory } from '../../data/places'
import { CATEGORIES, AREAS } from '../../data/categories'
import PlaceDetailModal from './PlaceDetailModal'
import MapView from '../MapView'

export default function PlacesScreen({ favorites, onToggleFavorite, onAddToTrip }) {
  const [activeCategory, setActiveCategory] = useState(0)
  const [filterMode, setFilterMode] = useState('area')
  const [activeFilter, setActiveFilter] = useState('全部')
  const [search, setSearch] = useState('')
  const [showFavOnly, setShowFavOnly] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showMap, setShowMap] = useState(false)

  const favSet = useMemo(() => new Set(favorites.map(f => f.place_id)), [favorites])

  const allTypes = useMemo(() => {
    const set = new Set()
    PLACES.forEach(p => set.add(p.type))
    return ['全部', ...Array.from(set).sort()]
  }, [])

  const filtered = useMemo(() => {
    let list = activeCategory === 0 ? PLACES : getPlacesByCategory(activeCategory)
    if (filterMode === 'area' && activeFilter !== '全部') list = list.filter(p => p.area === activeFilter)
    if (filterMode === 'type' && activeFilter !== '全部') list = list.filter(p => p.type === activeFilter)
    if (search.trim()) {
      const k = search.toLowerCase()
      list = list.filter(p =>
        p.name_zh.toLowerCase().includes(k) ||
        p.name_jp.toLowerCase().includes(k) ||
        p.area.toLowerCase().includes(k) ||
        p.type.toLowerCase().includes(k) ||
        (p.description || '').toLowerCase().includes(k)
      )
    }
    if (showFavOnly) list = list.filter(p => favSet.has(p.id))
    return list
  }, [activeCategory, filterMode, activeFilter, search, showFavOnly, favSet])

  const filterOptions = filterMode === 'area' ? ['全部', ...AREAS] : allTypes

  return (
    <div className="paper-bg min-h-screen pb-24">
      <div className="px-5 pt-12 pb-6 max-w-5xl mx-auto">
        <EditorialHeader jp="名所案内" zh="Places & Food · 110 Spots" accent="02" tape="blue" />

        {/* 5 大類別卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-5">
          <CategoryCard
            active={activeCategory === 0}
            onClick={() => setActiveCategory(0)}
            emoji="✦"
            name="全部"
            count={PLACES.length}
            color="#3D2817"
          />
          {CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.id}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
              emoji={cat.emoji}
              name={cat.name}
              count={getPlacesByCategory(cat.id).length}
              color={cat.color}
            />
          ))}
        </div>

        {/* 搜尋 + 篩選（紙片風格）*/}
        <div className="paper-plain p-4 mb-5" style={{ border: '1.5px dashed #6B4423' }}>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-dashed border-gold">
            <Search size={14} className="text-shu" />
            <input
              placeholder="搜尋景點、地址、類型..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm font-display"
            />
            <button
              onClick={() => setShowFavOnly(!showFavOnly)}
              className={`px-2 py-1 text-xs flex items-center gap-1 transition-all ${
                showFavOnly ? 'bg-stamp text-kinari2' : 'text-usuzumi border border-dashed border-gold'
              }`}
            >
              <Heart size={12} fill={showFavOnly ? '#FAF6EC' : 'none'} /> 收藏
            </button>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] text-usuzumi tracking-wider uppercase font-mono">分類</span>
            <div className="flex gap-1">
              {['area', 'type'].map(m => (
                <button
                  key={m}
                  onClick={() => { setFilterMode(m); setActiveFilter('全部') }}
                  className={`text-xs px-2.5 py-1 transition-all ${
                    filterMode === m ? 'bg-sumi text-kinari2' : 'text-usuzumi border border-dashed border-gold'
                  }`}
                >
                  {m === 'area' ? '依地區' : '依類型'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`ml-auto text-xs px-2.5 py-1 flex items-center gap-1 transition-all ${
                showMap ? 'bg-shu text-kinari2' : 'text-usuzumi border border-dashed border-gold'
              }`}
            >
              <MapPin size={11} /> 地圖
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {filterOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setActiveFilter(opt)}
                className={`text-[11px] px-2.5 py-1 transition-all font-display ${
                  activeFilter === opt
                    ? 'bg-sumi text-kinari2'
                    : 'bg-kinari text-usuzumi hover:bg-kinari2 border border-dashed border-gold'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {showMap && (
          <div className="mb-5" style={{ border: '1.5px solid #3D2817', boxShadow: '3px 3px 0 #3D2817' }}>
            <MapView
              height="340px"
              markers={filtered.map(p => ({
                id: p.id, lat: p.lat, lng: p.lng,
                color: CATEGORIES.find(c => c.id === p.category)?.color || '#3D2817',
                popup: {
                  title: p.name_zh,
                  subtitle: p.type,
                  action: { label: '查看詳情', onClick: () => setSelectedPlace(p) }
                }
              }))}
            />
          </div>
        )}

        <div className="flex items-baseline justify-between mb-3">
          <span className="text-xs text-usuzumi tracking-wider uppercase font-mono">★ {filtered.length} 筆結果 ★</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="∅" title="無符合結果" desc="試試其他分類或搜尋詞" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(p => (
              <PlaceCard
                key={p.id}
                place={p}
                isFavorite={favSet.has(p.id)}
                onClick={() => setSelectedPlace(p)}
                onToggleFavorite={(e) => { e.stopPropagation(); onToggleFavorite(p.id) }}
              />
            ))}
          </div>
        )}
      </div>

      <PlaceDetailModal
        open={!!selectedPlace}
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
        isFavorite={selectedPlace ? favSet.has(selectedPlace.id) : false}
        onToggleFavorite={onToggleFavorite}
        onAddToTrip={onAddToTrip ? (p) => { onAddToTrip(p); setSelectedPlace(null) } : null}
      />
    </div>
  )
}

function CategoryCard({ active, onClick, emoji, name, count, color }) {
  return (
    <button
      onClick={onClick}
      className="p-3 transition-all text-left relative paper-plain"
      style={{
        border: active ? `2px solid ${color}` : '1.5px dashed #D4B896',
        boxShadow: active ? `3px 3px 0 ${color}` : 'none',
      }}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-2xl" style={{ color }}>{emoji}</span>
        <div className="flex-1">
          <div className="font-display font-semibold text-sm">{name}</div>
          <div className="text-[10px] text-usuzumi font-mono">{count} spots</div>
        </div>
      </div>
    </button>
  )
}

function PlaceCard({ place, isFavorite, onClick, onToggleFavorite }) {
  const cat = CATEGORIES.find(c => c.id === place.category)
  return (
    <div
      onClick={onClick}
      className="paper-plain p-4 cursor-pointer relative transition-all"
      style={{
        border: '1.5px solid #3D2817',
        boxShadow: '3px 3px 0 #3D2817',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `4px 4px 0 ${cat?.color || '#3D2817'}`; e.currentTarget.style.transform = 'translate(-1px, -1px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '3px 3px 0 #3D2817'; e.currentTarget.style.transform = 'translate(0, 0)' }}
    >
      <button
        onClick={onToggleFavorite}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform z-10"
      >
        <Heart size={16} fill={isFavorite ? '#E84E4E' : 'none'} stroke={isFavorite ? '#E84E4E' : '#6B4423'} strokeWidth={2} />
      </button>

      <div className="flex items-center gap-2 mb-2">
        <StampLabel color={cat?.color}>{cat?.name}</StampLabel>
      </div>

      <h3 className="editorial-title text-base mb-0.5">{place.name_zh}</h3>
      <p className="font-display text-xs text-usuzumi mb-2">{place.name_jp}</p>

      <div className="space-y-1 text-[11px] text-sumi/75 font-display">
        <div className="flex gap-1.5">
          <span className="text-shu">◎</span>
          <span>{place.area} · {place.type}</span>
        </div>
        {place.hours && (
          <div className="flex gap-1.5">
            <span className="text-shu">⌚</span>
            <span className="line-clamp-1">{place.hours}</span>
          </div>
        )}
        {place.price && (
          <div className="flex gap-1.5">
            <span className="text-shu font-bold">¥</span>
            <span>{place.price}</span>
          </div>
        )}
      </div>

      {place.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-dashed border-gold">
          {place.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[10px] text-usuzumi font-display"
              style={{ background: '#FAF6EC', border: '1px dashed #D4B896', padding: '2px 6px' }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
