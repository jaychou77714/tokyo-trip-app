import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, Heart, MapPin, Plus, Trash2 } from 'lucide-react'
import { EditorialHeader, StampLabel, EmptyState, ConfirmDialog } from '../Common'
import { PLACES } from '../../data/places'
import { CATEGORIES, AREAS } from '../../data/categories'
import PlaceDetailModal from './PlaceDetailModal'
import MapView from '../MapView'
import AddPlaceModal from '../AddPlaceModal'
import { listCustomPlaces, saveCustomPlace, deleteCustomPlace } from '../../lib/storage'

export default function PlacesScreen({ favorites, onToggleFavorite, onAddToTrip, user, showToast }) {
  const [activeCategory, setActiveCategory] = useState(0)
  const [filterMode, setFilterMode] = useState('area')
  const [activeFilter, setActiveFilter] = useState('全部')
  const [search, setSearch] = useState('')
  const [showFavOnly, setShowFavOnly] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showMap, setShowMap] = useState(false)

  // v1.5：自訂景點
  const [customPlaces, setCustomPlaces] = useState([])
  const [editingPlace, setEditingPlace] = useState(null) // null = 不開, {} = 新增, {...} = 編輯
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { loadCustom() }, [])

  async function loadCustom() {
    const data = await listCustomPlaces(user?.id)
    setCustomPlaces(data || [])
  }

  // 合併內建 + 自訂景點（自訂景點加上 isCustom 標記）
  const allPlaces = useMemo(() => {
    return [
      ...PLACES.map(p => ({ ...p, isCustom: false })),
      ...customPlaces.map(p => ({ ...p, isCustom: true })),
    ]
  }, [customPlaces])

  const favSet = useMemo(() => new Set(favorites.map(f => f.place_id)), [favorites])

  const allTypes = useMemo(() => {
    const set = new Set()
    allPlaces.forEach(p => p.type && set.add(p.type))
    return ['全部', ...Array.from(set).sort()]
  }, [allPlaces])

  // 篩選
  const filtered = useMemo(() => {
    let list = activeCategory === 0 ? allPlaces : allPlaces.filter(p => p.category === activeCategory)

    if (filterMode === 'area' && activeFilter !== '全部') {
      list = list.filter(p => p.area === activeFilter)
    } else if (filterMode === 'type' && activeFilter !== '全部') {
      list = list.filter(p => p.type === activeFilter)
    }

    if (search) {
      const k = search.toLowerCase()
      list = list.filter(p =>
        (p.name_zh || '').toLowerCase().includes(k) ||
        (p.name_jp || '').toLowerCase().includes(k) ||
        (p.type || '').toLowerCase().includes(k) ||
        (p.area || '').toLowerCase().includes(k) ||
        (p.description || '').toLowerCase().includes(k)
      )
    }

    if (showFavOnly) list = list.filter(p => favSet.has(p.id))

    return list
  }, [allPlaces, activeCategory, filterMode, activeFilter, search, showFavOnly, favSet])

  const stats = useMemo(() => ({
    total: allPlaces.length,
    custom: customPlaces.length,
    showing: filtered.length,
  }), [allPlaces, customPlaces, filtered])

  async function handleSaveCustom(form) {
    const result = await saveCustomPlace({ ...editingPlace, ...form }, user.id)
    setEditingPlace(null)
    showToast && showToast(editingPlace?.id ? '✓ 已更新' : '✿ 已新增景點', 'success')
    loadCustom()
  }

  async function handleDeleteCustom(place) {
    await deleteCustomPlace(place.id, user.id)
    setConfirmDelete(null)
    showToast && showToast('已刪除', 'success')
    loadCustom()
  }

  return (
    <div className="paper-bg min-h-screen pb-24">
      <div className="px-5 pt-12 pb-4 max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-2">
          <EditorialHeader jp="名所・グルメ" zh="Places" accent="02" tape="blue" />
          <button
            onClick={() => setEditingPlace({})}
            className="flex-shrink-0 mt-3 ml-2 flex items-center gap-1 px-3 py-1.5 text-xs font-display transition-all"
            style={{
              background: '#FF8B5A',
              color: '#FAF6EC',
              border: '1.5px solid #3D2817',
              boxShadow: '2px 2px 0 #3D2817',
            }}
          >
            <Plus size={12} /> 新增景點
          </button>
        </div>

        {/* 搜尋 + 統計 */}
        <div className="mb-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-usuzumi" />
            <input
              type="text"
              placeholder="搜尋景點 / 美食 / 區域..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full form-input pl-9"
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] font-mono">
            <span className="text-usuzumi">
              ★ 顯示 {stats.showing} / 共 {stats.total} 個
              {stats.custom > 0 && <span className="text-shu"> · 自訂 {stats.custom}</span>}
            </span>
            <button
              onClick={() => setShowFavOnly(!showFavOnly)}
              className="flex items-center gap-1 transition-all"
              style={{ color: showFavOnly ? '#E84E4E' : '#6B4423' }}
            >
              <Heart size={11} fill={showFavOnly ? '#E84E4E' : 'none'} />
              {showFavOnly ? '只看收藏' : '只看收藏'}
            </button>
          </div>
        </div>

        {/* 分類 Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 -mx-5 px-5">
          <CategoryChip
            active={activeCategory === 0}
            onClick={() => setActiveCategory(0)}
            emoji="✦" name="全部" count={allPlaces.length}
          />
          {CATEGORIES.map(c => {
            const count = allPlaces.filter(p => p.category === c.id).length
            return (
              <CategoryChip
                key={c.id}
                active={activeCategory === c.id}
                onClick={() => setActiveCategory(c.id)}
                emoji={c.emoji} name={c.name} count={count} color={c.color}
              />
            )
          })}
        </div>

        {/* 篩選模式 */}
        <div className="flex gap-1.5 mb-2 text-xs">
          <button
            onClick={() => { setFilterMode('area'); setActiveFilter('全部') }}
            className="px-2.5 py-1 font-display"
            style={{
              background: filterMode === 'area' ? '#3D2817' : 'transparent',
              color: filterMode === 'area' ? '#FAF6EC' : '#6B4423',
              border: '1.5px solid #3D2817',
            }}
          >
            按地區
          </button>
          <button
            onClick={() => { setFilterMode('type'); setActiveFilter('全部') }}
            className="px-2.5 py-1 font-display"
            style={{
              background: filterMode === 'type' ? '#3D2817' : 'transparent',
              color: filterMode === 'type' ? '#FAF6EC' : '#6B4423',
              border: '1.5px solid #3D2817',
            }}
          >
            按類型
          </button>
          <button
            onClick={() => setShowMap(!showMap)}
            className="ml-auto px-2.5 py-1 font-display flex items-center gap-1"
            style={{
              background: showMap ? '#FF8B5A' : 'transparent',
              color: showMap ? '#FAF6EC' : '#6B4423',
              border: '1.5px solid #3D2817',
            }}
          >
            <MapPin size={11} /> {showMap ? '隱藏地圖' : '顯示地圖'}
          </button>
        </div>

        {/* 篩選選項 */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-3 -mx-5 px-5">
          {(filterMode === 'area' ? ['全部', ...AREAS] : allTypes).map(item => (
            <button
              key={item}
              onClick={() => setActiveFilter(item)}
              className="flex-shrink-0 px-2.5 py-1 text-[11px] font-display transition-all"
              style={{
                background: activeFilter === item ? '#FF8B5A' : '#FFFCF5',
                color: activeFilter === item ? '#FAF6EC' : '#6B4423',
                border: activeFilter === item ? '1.5px solid #3D2817' : '1.5px dashed #D4B896',
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {/* 地圖 */}
        {showMap && filtered.length > 0 && (
          <div className="mb-4" style={{ border: '1.5px solid #3D2817', boxShadow: '3px 3px 0 #3D2817' }}>
            <MapView
              height="300px"
              markers={filtered.filter(p => p.lat && p.lng).slice(0, 50).map(p => ({
                id: p.id, lat: p.lat, lng: p.lng,
                num: '', color: CATEGORIES.find(c => c.id === p.category)?.color || '#3D2817',
                popup: { title: p.name_zh, subtitle: p.area }
              }))}
            />
          </div>
        )}

        {/* 景點列表 */}
        {filtered.length === 0 ? (
          <EmptyState icon="🔍" title="找不到符合的景點" desc="試試別的關鍵字或篩選條件" />
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {filtered.map(p => (
              <PlaceCard
                key={p.id}
                place={p}
                isFav={favSet.has(p.id)}
                onClick={() => setSelectedPlace(p)}
                onToggleFav={(e) => { e.stopPropagation(); onToggleFavorite(p.id) }}
                onEdit={p.isCustom ? (e) => { e.stopPropagation(); setEditingPlace(p) } : null}
                onDelete={p.isCustom ? (e) => { e.stopPropagation(); setConfirmDelete(p) } : null}
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
        onAddToTrip={onAddToTrip}
      />

      <AddPlaceModal
        open={editingPlace !== null}
        place={editingPlace}
        onClose={() => setEditingPlace(null)}
        onSave={handleSaveCustom}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="刪除自訂景點"
        message={`確定刪除「${confirmDelete?.name_zh}」？\n\n⚠️ 已加進行程的此景點不會被影響，但其他成員看不到這個景點了。`}
        confirmText="刪除" danger
        onConfirm={() => handleDeleteCustom(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

function CategoryChip({ active, onClick, emoji, name, count, color }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-3 py-1.5 transition-all flex items-center gap-1.5 font-display text-xs"
      style={{
        background: active ? '#3D2817' : '#FFFCF5',
        color: active ? '#FAF6EC' : '#3D2817',
        border: active ? '1.5px solid #3D2817' : '1.5px dashed #D4B896',
      }}
    >
      <span style={{ color: active ? '#FF8B5A' : color }}>{emoji}</span>
      {name}
      <span className="text-[10px] opacity-70 font-mono">{count}</span>
    </button>
  )
}

function PlaceCard({ place, isFav, onClick, onToggleFav, onEdit, onDelete }) {
  const cat = CATEGORIES.find(c => c.id === place.category)
  return (
    <div
      onClick={onClick}
      className="paper-plain p-3 cursor-pointer transition-all relative group"
      style={{ border: '1.5px solid #3D2817', boxShadow: '2px 2px 0 #3D2817' }}
    >
      {/* 自訂徽章 */}
      {place.isCustom && (
        <div
          className="absolute -top-2 -right-1 px-1.5 py-0.5 text-[9px] font-mono font-bold"
          style={{
            background: '#FF8B5A',
            color: '#FAF6EC',
            border: '1.5px solid #3D2817',
            transform: 'rotate(3deg)',
          }}
        >
          + 自訂
        </div>
      )}

      <div className="flex items-start gap-2">
        <div
          className="flex-shrink-0 w-1 self-stretch"
          style={{ background: cat?.color || '#3D2817' }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 mb-1">
            <h4 className="font-display font-bold text-sm leading-tight">{place.name_zh}</h4>
            <button
              onClick={onToggleFav}
              className="flex-shrink-0 -mt-1 -mr-1 p-1 transition-all"
            >
              <Heart
                size={14}
                fill={isFav ? '#E84E4E' : 'none'}
                color={isFav ? '#E84E4E' : '#6B4423'}
              />
            </button>
          </div>
          {place.name_jp && (
            <div className="text-[10px] text-usuzumi font-mono mb-1">{place.name_jp}</div>
          )}
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span
              className="text-[10px] px-1.5 py-0.5 font-display"
              style={{ background: cat?.color, color: '#FAF6EC' }}
            >
              {cat?.emoji} {cat?.name}
            </span>
            <span className="text-[10px] text-usuzumi">{place.area}</span>
            {place.type && (
              <span className="text-[10px] text-usuzumi">· {place.type}</span>
            )}
          </div>
          {place.description && (
            <p className="text-[11px] text-sumi/75 line-clamp-2 leading-snug">
              {place.description}
            </p>
          )}

          {/* 自訂景點操作按鈕 */}
          {(onEdit || onDelete) && (
            <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="text-[10px] text-usuzumi hover:text-shu px-1"
                >
                  ✏️ 編輯
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="text-[10px] text-stamp hover:underline px-1 flex items-center gap-0.5"
                >
                  <Trash2 size={9} /> 刪除
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
