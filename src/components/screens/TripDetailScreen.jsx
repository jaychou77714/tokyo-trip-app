import React, { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Plus, MapPin, Trash2, Clock, GripVertical } from 'lucide-react'
import { Button, Modal, Input, Textarea, Select, EditorialHeader, EmptyState } from '../Common'
import MapView from '../MapView'
import { listItinerary, saveItineraryItem, deleteItineraryItem } from '../../lib/storage'
import { PLACES, getPlaceById } from '../../data/places'
import { CATEGORIES } from '../../data/categories'
import dayjs from 'dayjs'

export default function TripDetailScreen({ trip, onBack, showToast, onAddFromPlaces }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(1)
  const [editing, setEditing] = useState(null)
  const [pendingPlace, setPendingPlace] = useState(null) // 從外部傳入的待加入景點

  const totalDays = trip.days || 1

  useEffect(() => { load() }, [trip])

  // 外部傳入景點時自動開啟「加入行程」modal
  useEffect(() => {
    if (pendingPlace) {
      setEditing({
        place_id: pendingPlace.id,
        custom_name: '',
        day_number: activeDay,
        start_time: '',
        duration_min: 60,
        notes: '',
      })
    }
  }, [pendingPlace])

  async function load() {
    setLoading(true)
    const data = await listItinerary(trip.id)
    setItems(data)
    setLoading(false)
  }

  async function handleSave(form) {
    const data = {
      ...editing,
      ...form,
      day_number: form.day_number || activeDay,
      order_index: form.order_index ?? (dayItems.length),
    }
    if (!data.place_id && !data.custom_name) {
      showToast('請選擇景點或輸入自訂名稱', 'error')
      return
    }
    await saveItineraryItem(data, trip.id)
    setEditing(null)
    setPendingPlace(null)
    showToast('已加入行程', 'success')
    load()
  }

  async function handleDelete(item) {
    await deleteItineraryItem(item.id, trip.id)
    showToast('已移除', 'success')
    load()
  }

  async function handleMoveDay(item, newDay) {
    await saveItineraryItem({ ...item, day_number: newDay }, trip.id)
    load()
  }

  const dayItems = useMemo(() =>
    items.filter(i => i.day_number === activeDay).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
    [items, activeDay])

  // 為地圖準備 markers（含編號 + 路線）
  const mapMarkers = useMemo(() => {
    return dayItems.map((item, idx) => {
      const place = item.place_id ? getPlaceById(item.place_id) : null
      const lat = place?.lat || item.custom_lat
      const lng = place?.lng || item.custom_lng
      if (!lat || !lng) return null
      return {
        id: item.id,
        lat, lng,
        num: idx + 1,
        color: '#c9302c',
        popup: {
          title: place?.name_zh || item.custom_name,
          subtitle: item.start_time ? `${item.start_time} · ${item.duration_min || 60} 分` : '未指定時間',
        }
      }
    }).filter(Boolean)
  }, [dayItems])

  return (
    <div className="paper-bg min-h-screen pb-24">
      <div className="px-5 pt-12 pb-4 max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-usuzumi tracking-wider uppercase mb-4 hover:text-shu"
        >
          <ArrowLeft size={14} /> 返回行程列表
        </button>

        <div className="flex items-baseline justify-between mb-1">
          <span className="font-display text-shu text-xs tracking-[0.3em]">ITINERARY</span>
          <span className="text-xs text-usuzumi font-mono">{totalDays} 日</span>
        </div>
        <h1 className="editorial-title text-3xl mb-1">{trip.title}</h1>
        {trip.start_date && (
          <p className="text-xs text-usuzumi tracking-widest font-mono">
            {dayjs(trip.start_date).format('YYYY.MM.DD')} – {dayjs(trip.end_date).format('YYYY.MM.DD')}
          </p>
        )}

        {/* 日期分頁 */}
        <div className="flex gap-2 mt-6 mb-4 overflow-x-auto pb-2 -mx-5 px-5">
          {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
            const dateStr = trip.start_date ? dayjs(trip.start_date).add(day - 1, 'day') : null
            const count = items.filter(i => i.day_number === day).length
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`flex-shrink-0 px-4 py-2.5 transition-all ${
                  activeDay === day
                    ? 'bg-sumi text-kinari'
                    : 'bg-white/50 text-sumi border border-sumi/15 hover:bg-white'
                }`}
              >
                <div className="font-display font-bold text-sm">DAY {day}</div>
                {dateStr && <div className="text-[10px] opacity-70 font-mono">{dateStr.format('M/D ddd')}</div>}
                {count > 0 && <div className="text-[10px] mt-0.5">{count} 個地點</div>}
              </button>
            )
          })}
        </div>

        {/* 地圖優先 */}
        <div className="border border-sumi/15 mb-4">
          {mapMarkers.length > 0 ? (
            <MapView height="320px" markers={mapMarkers} showRoute />
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-usuzumi text-xs bg-kinari2">
              <MapPin size={32} className="opacity-30 mb-2" />
              <span>DAY {activeDay} 尚無安排</span>
            </div>
          )}
        </div>

        {/* 當日行程列表 */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-sm tracking-wider">DAY {activeDay} スケジュール</h3>
          <Button variant="shu" size="sm" onClick={() => setEditing({ day_number: activeDay })}>
            <Plus size={14} /> 加入景點
          </Button>
        </div>

        {dayItems.length === 0 ? (
          <EmptyState
            icon="✿"
            title="這天還沒有安排"
            desc="從精選清單加入或新增自訂景點"
            action={
              <div className="flex gap-2">
                <Button variant="shu" onClick={() => setEditing({ day_number: activeDay })}>
                  <Plus size={14} /> 直接新增
                </Button>
                {onAddFromPlaces && (
                  <Button variant="outline" onClick={onAddFromPlaces}>
                    從精選清單
                  </Button>
                )}
              </div>
            }
          />
        ) : (
          <div className="space-y-2">
            {dayItems.map((item, idx) => (
              <ItineraryCard
                key={item.id}
                item={item}
                num={idx + 1}
                onEdit={() => setEditing(item)}
                onDelete={() => handleDelete(item)}
                onMoveDay={(newDay) => handleMoveDay(item, newDay)}
                totalDays={totalDays}
              />
            ))}
          </div>
        )}
      </div>

      {/* 編輯 Modal */}
      <ItineraryEditModal
        open={editing !== null}
        item={editing}
        totalDays={totalDays}
        defaultDay={activeDay}
        onClose={() => { setEditing(null); setPendingPlace(null) }}
        onSave={handleSave}
      />
    </div>
  )
}

function ItineraryCard({ item, num, onEdit, onDelete, onMoveDay, totalDays }) {
  const place = item.place_id ? getPlaceById(item.place_id) : null
  const cat = place ? CATEGORIES.find(c => c.id === place.category) : null
  const name = place?.name_zh || item.custom_name
  const subtitle = place ? `${place.area} · ${place.type}` : item.custom_address

  return (
    <div className="flex gap-3 bg-white/50 hover:bg-white/80 border border-sumi/10 p-3 group card-shadow">
      {/* 編號圓形 */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm"
          style={{ background: cat?.color || '#1a1a1a', color: '#f5efe6' }}
        >
          {num}
        </div>
        {item.start_time && (
          <span className="text-[10px] text-usuzumi font-mono mt-1">{item.start_time}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
        <div className="flex items-center gap-2 mb-0.5">
          {cat && (
            <span className="text-[10px] px-1.5 py-0.5" style={{ background: cat.color, color: '#f5efe6' }}>
              {cat.name}
            </span>
          )}
          {item.duration_min && (
            <span className="text-[10px] text-usuzumi flex items-center gap-1">
              <Clock size={9} /> {item.duration_min} 分
            </span>
          )}
        </div>
        <h4 className="font-display font-bold text-sm">{name}</h4>
        {subtitle && <p className="text-xs text-usuzumi truncate">{subtitle}</p>}
        {item.notes && <p className="text-xs text-sumi/70 mt-1.5 line-clamp-2">{item.notes}</p>}
      </div>

      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {totalDays > 1 && (
          <select
            value={item.day_number}
            onChange={(e) => onMoveDay(parseInt(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] px-1 py-0.5 bg-white border border-sumi/15"
          >
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>D{d}</option>
            ))}
          </select>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="text-shu hover:bg-shu/10 p-1"
          title="刪除"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

function ItineraryEditModal({ open, item, totalDays, defaultDay, onClose, onSave }) {
  const [form, setForm] = useState({})
  const [showPicker, setShowPicker] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')

  useEffect(() => {
    if (item) setForm({
      place_id: item.place_id || '',
      custom_name: item.custom_name || '',
      custom_address: item.custom_address || '',
      custom_lat: item.custom_lat || null,
      custom_lng: item.custom_lng || null,
      day_number: item.day_number || defaultDay,
      start_time: item.start_time || '',
      duration_min: item.duration_min || 60,
      notes: item.notes || '',
    })
  }, [item, defaultDay])

  const selectedPlace = form.place_id ? getPlaceById(form.place_id) : null

  const filteredPlaces = useMemo(() => {
    if (!pickerSearch) return PLACES.slice(0, 30)
    const k = pickerSearch.toLowerCase()
    return PLACES.filter(p =>
      p.name_zh.toLowerCase().includes(k) ||
      p.name_jp.toLowerCase().includes(k) ||
      p.type.toLowerCase().includes(k) ||
      p.area.toLowerCase().includes(k)
    ).slice(0, 30)
  }, [pickerSearch])

  return (
    <Modal open={open} onClose={onClose} title={item?.id ? '編輯行程項目' : '加入行程'}>
      <div className="px-5 py-4 space-y-3">
        {/* 景點選擇 */}
        <div>
          <span className="block text-xs font-medium text-usuzumi mb-1.5 tracking-wider">景點</span>
          {selectedPlace ? (
            <div className="flex items-center justify-between p-3 bg-white/60 border border-sumi/15">
              <div>
                <div className="font-display font-bold text-sm">{selectedPlace.name_zh}</div>
                <div className="text-xs text-usuzumi">{selectedPlace.type} · {selectedPlace.area}</div>
              </div>
              <button onClick={() => setForm({ ...form, place_id: '' })} className="text-xs text-shu hover:underline">
                清除
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="w-full p-2.5 bg-white/60 border border-sumi/15 text-sm text-left hover:bg-white"
              >
                從 110 個精選地點選擇 →
              </button>
              <div className="text-center text-[11px] text-usuzumi">— 或自訂景點 —</div>
              <Input
                placeholder="自訂景點名稱（如：飯店、Airbnb）"
                value={form.custom_name || ''}
                onChange={(e) => setForm({ ...form, custom_name: e.target.value })}
              />
              {form.custom_name && (
                <Input
                  placeholder="地址（選填）"
                  value={form.custom_address || ''}
                  onChange={(e) => setForm({ ...form, custom_address: e.target.value })}
                />
              )}
            </div>
          )}

          {showPicker && !selectedPlace && (
            <div className="mt-2 border border-sumi/15 max-h-60 overflow-y-auto">
              <input
                placeholder="搜尋景點..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full px-3 py-2 border-b border-sumi/10 text-sm bg-white outline-none"
              />
              {filteredPlaces.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setForm({ ...form, place_id: p.id, custom_name: '', custom_address: '' })
                    setShowPicker(false)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-sumi/5 border-b border-sumi/5 last:border-b-0"
                >
                  <div className="text-sm">{p.name_zh}</div>
                  <div className="text-[11px] text-usuzumi">{p.type} · {p.area}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Select
            label="第幾天"
            value={form.day_number || 1}
            onChange={(e) => setForm({ ...form, day_number: parseInt(e.target.value) })}
            options={Array.from({ length: totalDays }, (_, i) => ({ value: i + 1, label: `Day ${i + 1}` }))}
          />
          <Input
            label="到達時間"
            type="time"
            value={form.start_time || ''}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          />
          <Input
            label="停留分鐘"
            type="number"
            min="0"
            step="15"
            value={form.duration_min || ''}
            onChange={(e) => setForm({ ...form, duration_min: parseInt(e.target.value) || null })}
          />
        </div>

        <Textarea
          label="備註（行程細節、預約編號⋯）"
          rows={2}
          value={form.notes || ''}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="shu" onClick={() => onSave(form)}>儲存</Button>
        </div>
      </div>
    </Modal>
  )
}
