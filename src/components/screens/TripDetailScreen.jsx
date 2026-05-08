import React, { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Plus, MapPin, Trash2, Clock } from 'lucide-react'
import { Button, Modal, Input, Textarea, Select, EmptyState } from '../Common'
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
  const totalDays = trip.days || 1

  useEffect(() => { load() }, [trip])

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
    showToast('✿ 已加入行程', 'success')
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
        color: '#FF8B5A',
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
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-usuzumi tracking-wider uppercase mb-4 hover:text-shu font-display"
        >
          <ArrowLeft size={14} /> 返回行程列表
        </button>

        <div className="flex items-baseline justify-between mb-1">
          <span className="font-display text-shu text-xs tracking-[0.3em]">★ ITINERARY ★</span>
          <span className="text-xs text-usuzumi font-mono">{totalDays} 日</span>
        </div>
        <h1 className="editorial-title text-3xl mb-1">{trip.title}</h1>
        {trip.start_date && (
          <p className="text-xs text-usuzumi tracking-widest font-mono">
            {dayjs(trip.start_date).format('YYYY.MM.DD')} – {dayjs(trip.end_date).format('YYYY.MM.DD')}
          </p>
        )}

        {/* 日期分頁（紙標籤式）*/}
        <div className="flex gap-2 mt-6 mb-4 overflow-x-auto pb-2 -mx-5 px-5">
          {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
            const dateStr = trip.start_date ? dayjs(trip.start_date).add(day - 1, 'day') : null
            const count = items.filter(i => i.day_number === day).length
            const isActive = activeDay === day
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className="flex-shrink-0 px-4 py-2.5 transition-all paper-plain"
                style={{
                  border: isActive ? '2px solid #3D2817' : '1.5px dashed #D4B896',
                  background: isActive ? '#3D2817' : '#FFFCF5',
                  color: isActive ? '#FAF6EC' : '#3D2817',
                  boxShadow: isActive ? '3px 3px 0 #FF8B5A' : 'none',
                }}
              >
                <div className="font-display font-bold text-sm">DAY {day}</div>
                {dateStr && <div className="text-[10px] opacity-80 font-mono">{dateStr.format('M/D ddd')}</div>}
                {count > 0 && <div className="text-[10px] mt-0.5">★ {count}</div>}
              </button>
            )
          })}
        </div>

        {/* 地圖 */}
        <div className="mb-4" style={{ border: '1.5px solid #3D2817', boxShadow: '3px 3px 0 #3D2817' }}>
          {mapMarkers.length > 0 ? (
            <MapView height="320px" markers={mapMarkers} showRoute />
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-usuzumi text-xs paper-plain">
              <MapPin size={32} className="opacity-30 mb-2" />
              <span className="font-display">DAY {activeDay} 尚無安排</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-sm tracking-wider">★ DAY {activeDay} スケジュール</h3>
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

      <ItineraryEditModal
        open={editing !== null}
        item={editing}
        totalDays={totalDays}
        defaultDay={activeDay}
        onClose={() => setEditing(null)}
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
    <div
      className="flex gap-3 paper-plain p-3 group transition-all"
      style={{
        border: '1.5px solid #3D2817',
        boxShadow: '2px 2px 0 #3D2817',
      }}
    >
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm"
          style={{ background: cat?.color || '#3D2817', color: '#FAF6EC', border: '1.5px solid #3D2817' }}
        >
          {num}
        </div>
        {item.start_time && (
          <span className="text-[10px] text-usuzumi font-mono mt-1">{item.start_time}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          {cat && (
            <span className="text-[10px] px-1.5 py-0.5 font-display" style={{ background: cat.color, color: '#FAF6EC' }}>
              {cat.name}
            </span>
          )}
          {item.duration_min && (
            <span className="text-[10px] text-usuzumi flex items-center gap-1 font-mono">
              <Clock size={9} /> {item.duration_min} 分
            </span>
          )}
        </div>
        <h4 className="font-display font-bold text-sm">{name}</h4>
        {subtitle && <p className="text-xs text-usuzumi truncate">{subtitle}</p>}
        {item.notes && <p className="text-xs text-sumi/75 mt-1.5 line-clamp-2 italic font-display">{item.notes}</p>}
      </div>

      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {totalDays > 1 && (
          <select
            value={item.day_number}
            onChange={(e) => onMoveDay(parseInt(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] px-1 py-0.5 bg-kinari2 border border-dashed border-usuzumi"
          >
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>D{d}</option>
            ))}
          </select>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="text-stamp hover:bg-stamp/10 p-1"
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
        <div>
          <span className="block text-xs font-display font-semibold text-usuzumi mb-1.5 tracking-wider">✎ 景點</span>
          {selectedPlace ? (
            <div className="flex items-center justify-between p-3 paper-plain" style={{ border: '1.5px dashed #6B4423' }}>
              <div>
                <div className="font-display font-bold text-sm">{selectedPlace.name_zh}</div>
                <div className="text-xs text-usuzumi">{selectedPlace.type} · {selectedPlace.area}</div>
              </div>
              <button onClick={() => setForm({ ...form, place_id: '' })} className="text-xs text-stamp hover:underline">
                清除
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="w-full p-2.5 paper-plain text-sm text-left hover:bg-shu/10 transition-colors font-display"
                style={{ border: '1.5px dashed #6B4423' }}
              >
                從 110 個精選地點選擇 →
              </button>
              <div className="text-center text-[11px] text-usuzumi font-display">— 或自訂景點 —</div>
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
            <div className="mt-2 max-h-60 overflow-y-auto paper-plain" style={{ border: '1.5px solid #3D2817' }}>
              <input
                placeholder="搜尋景點..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full px-3 py-2 border-b-2 border-dashed border-gold text-sm bg-kinari2 outline-none font-display"
              />
              {filteredPlaces.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setForm({ ...form, place_id: p.id, custom_name: '', custom_address: '' })
                    setShowPicker(false)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-shu/10 border-b border-dashed border-gold/50 last:border-b-0"
                >
                  <div className="text-sm font-display">{p.name_zh}</div>
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
