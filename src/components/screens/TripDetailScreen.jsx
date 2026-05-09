import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { ArrowLeft, Plus, MapPin, Trash2, Clock, UserPlus, Copy, Check } from 'lucide-react'
import { Button, Modal, Input, Textarea, Select, EmptyState } from '../Common'
import MapView from '../MapView'
import ReactionBar from '../ReactionBar'
import CommentThread from '../CommentThread'
import { RealtimeNotice } from '../UpdateNotice'
import {
  listItinerary, saveItineraryItem, deleteItineraryItem, listTripMembers,
  listTripReactions, toggleReaction, listTripCommentCounts,
} from '../../lib/storage'
import { useTripRealtime } from '../../lib/realtime'
import { PLACES, getPlaceById } from '../../data/places'
import { CATEGORIES } from '../../data/categories'
import { getRelativeTime } from '../../data/members'
import { listCustomPlaces } from '../../lib/storage'
import dayjs from 'dayjs'

export default function TripDetailScreen({ trip, user, onBack, showToast, onAddFromPlaces }) {
  const [items, setItems] = useState([])
  const [members, setMembers] = useState([])
  const [reactions, setReactions] = useState([])
  const [commentCounts, setCommentCounts] = useState({})
  const [customPlaces, setCustomPlaces] = useState([])
  const [activeDay, setActiveDay] = useState(1)
  const [editing, setEditing] = useState(null)
  const [showShare, setShowShare] = useState(false)
  const [pendingUpdates, setPendingUpdates] = useState(0)
  const totalDays = trip.days || 1

  useEffect(() => { loadAll() }, [trip])

  // 自訂景點查找：把內建 + 自訂合併供顯示
  function lookupPlace(placeId) {
    if (!placeId) return null
    return customPlaces.find(p => p.id === placeId) || getPlaceById(placeId)
  }

  // ===== Realtime =====
  const handleRealtimeChange = useCallback(() => {
    setPendingUpdates(prev => prev + 1)
  }, [])

  useTripRealtime(trip.id, user.id, handleRealtimeChange)

  async function loadAll() {
    const [itemsData, membersData, reactionsData, commentsCount, customData] = await Promise.all([
      listItinerary(trip.id),
      listTripMembers(trip.id),
      listTripReactions(trip.id),
      listTripCommentCounts(trip.id),
      listCustomPlaces(),
    ])
    setItems(itemsData); setMembers(membersData)
    setReactions(reactionsData); setCommentCounts(commentsCount)
    setCustomPlaces(customData || [])
    setPendingUpdates(0)
  }

  async function handleSave(form) {
    const data = {
      ...editing, ...form,
      day_number: form.day_number || activeDay,
      order_index: form.order_index ?? (dayItems.length),
    }
    if (!data.place_id && !data.custom_name) {
      showToast('請選擇景點或輸入自訂名稱', 'error'); return
    }
    await saveItineraryItem(data, trip.id, user.id)
    setEditing(null)
    showToast('✿ 已加入行程', 'success')
    loadAll()
  }

  async function handleDelete(item) {
    await deleteItineraryItem(item.id, trip.id)
    showToast('已移除', 'success')
    loadAll()
  }

  async function handleMoveDay(item, newDay) {
    await saveItineraryItem({ ...item, day_number: newDay }, trip.id, user.id)
    loadAll()
  }

  async function handleToggleReaction(itemId, emoji) {
    await toggleReaction('itinerary', itemId, trip.id, emoji, user.id)
    // 重新撈該行程的所有 reactions
    const fresh = await listTripReactions(trip.id)
    setReactions(fresh)
  }

  const dayItems = useMemo(() =>
    items.filter(i => i.day_number === activeDay).sort((a, b) => (a.order_index || 0) - (b.order_index || 0)),
    [items, activeDay])

  const mapMarkers = useMemo(() => {
    return dayItems.map((item, idx) => {
      const place = item.place_id ? lookupPlace(item.place_id) : null
      const lat = place?.lat || item.custom_lat
      const lng = place?.lng || item.custom_lng
      if (!lat || !lng) return null
      return {
        id: item.id, lat, lng, num: idx + 1, color: '#FF8B5A',
        popup: {
          title: place?.name_zh || item.custom_name,
          subtitle: item.start_time ? `${item.start_time} · ${item.duration_min || 60} 分` : '未指定時間',
        }
      }
    }).filter(Boolean)
  }, [dayItems])

  const memberMap = useMemo(() => {
    const m = {}
    members.forEach(mem => { m[mem.user_id] = mem })
    return m
  }, [members])

  // 表態 by item id
  const reactionsByItem = useMemo(() => {
    const map = {}
    reactions.forEach(r => {
      if (!map[r.item_id]) map[r.item_id] = []
      map[r.item_id].push(r)
    })
    return map
  }, [reactions])

  return (
    <div className="paper-bg min-h-screen pb-24">
      <RealtimeNotice count={pendingUpdates} onSync={loadAll} />

      <div className="px-5 pt-12 pb-4 max-w-4xl mx-auto">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-usuzumi tracking-wider uppercase mb-4 hover:text-shu font-display">
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

        {/* 成員列表 */}
        <div className="mt-4 paper-plain p-3 flex items-center gap-3"
          style={{ border: '1.5px dashed #6B4423' }}>
          <div className="flex -space-x-1.5 flex-shrink-0">
            {members.slice(0, 5).map(m => (
              <div key={m.id} title={m.user.nickname}
                className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-[10px] text-kinari2"
                style={{ background: m.color, border: '1.5px solid #3D2817' }}>
                {m.user.nickname?.charAt(0)}
              </div>
            ))}
            {members.length > 5 && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono"
                style={{ background: '#FFFCF5', border: '1.5px solid #3D2817' }}>
                +{members.length - 5}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-usuzumi font-mono uppercase tracking-wider">★ {members.length} 位成員</div>
            <div className="text-xs font-display truncate">
              {members.map(m => m.user.nickname).join('、')}
            </div>
          </div>
          <button onClick={() => setShowShare(true)}
            className="flex-shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 font-display transition-all"
            style={{ background: '#FF8B5A', color: '#FAF6EC', border: '1.5px solid #3D2817', boxShadow: '2px 2px 0 #3D2817' }}>
            <UserPlus size={12} /> 邀請
          </button>
        </div>

        {/* 日期分頁 */}
        <div className="flex gap-2 mt-6 mb-4 overflow-x-auto pb-2 -mx-5 px-5">
          {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
            const dateStr = trip.start_date ? dayjs(trip.start_date).add(day - 1, 'day') : null
            const count = items.filter(i => i.day_number === day).length
            const isActive = activeDay === day
            return (
              <button key={day} onClick={() => setActiveDay(day)}
                className="flex-shrink-0 px-4 py-2.5 transition-all paper-plain"
                style={{
                  border: isActive ? '2px solid #3D2817' : '1.5px dashed #D4B896',
                  background: isActive ? '#3D2817' : '#FFFCF5',
                  color: isActive ? '#FAF6EC' : '#3D2817',
                  boxShadow: isActive ? '3px 3px 0 #FF8B5A' : 'none',
                }}>
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
            icon="✿" title="這天還沒有安排" desc="從精選清單加入或新增自訂景點"
            action={
              <div className="flex gap-2">
                <Button variant="shu" onClick={() => setEditing({ day_number: activeDay })}>
                  <Plus size={14} /> 直接新增
                </Button>
                {onAddFromPlaces && (
                  <Button variant="outline" onClick={onAddFromPlaces}>從精選清單</Button>
                )}
              </div>
            }
          />
        ) : (
          <div className="space-y-2">
            {dayItems.map((item, idx) => (
              <ItineraryCard
                key={item.id}
                item={item} num={idx + 1}
                tripId={trip.id} user={user} memberMap={memberMap} members={members}
                customPlaces={customPlaces}
                reactions={reactionsByItem[item.id] || []}
                commentCount={commentCounts[item.id] || 0}
                onEdit={() => setEditing(item)}
                onDelete={() => handleDelete(item)}
                onMoveDay={(newDay) => handleMoveDay(item, newDay)}
                onToggleReaction={(emoji) => handleToggleReaction(item.id, emoji)}
                onCommentCountChange={(itemId, count) => {
                  setCommentCounts(prev => ({ ...prev, [itemId]: count }))
                }}
                totalDays={totalDays}
              />
            ))}
          </div>
        )}
      </div>

      <ItineraryEditModal
        open={editing !== null} item={editing}
        totalDays={totalDays} defaultDay={activeDay}
        onClose={() => setEditing(null)} onSave={handleSave}
      />

      <ShareModal
        open={showShare} trip={trip} members={members}
        onClose={() => setShowShare(false)} showToast={showToast}
      />
    </div>
  )
}

function ItineraryCard({ item, num, tripId, user, memberMap, members, customPlaces = [],
                         reactions, commentCount,
                         onEdit, onDelete, onMoveDay, onToggleReaction, onCommentCountChange, totalDays }) {
  const place = item.place_id
    ? (customPlaces.find(p => p.id === item.place_id) || getPlaceById(item.place_id))
    : null
  const cat = place ? CATEGORIES.find(c => c.id === place.category) : null
  const name = place?.name_zh || item.custom_name
  const subtitle = place ? `${place.area} · ${place.type}` : item.custom_address
  const updaterId = item.updated_by || item.added_by
  const updater = updaterId ? memberMap[updaterId] : null

  return (
    <div className="flex gap-3 paper-plain p-3 group transition-all"
      style={{ border: '1.5px solid #3D2817', boxShadow: '2px 2px 0 #3D2817' }}>
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm"
          style={{ background: cat?.color || '#3D2817', color: '#FAF6EC', border: '1.5px solid #3D2817' }}>
          {num}
        </div>
        {item.start_time && (
          <span className="text-[10px] text-usuzumi font-mono mt-1">{item.start_time}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="cursor-pointer" onClick={onEdit}>
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
          {updater && (
            <div className="flex items-center gap-1 mt-1.5 text-[10px] text-usuzumi font-mono">
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: updater.color }} />
              <span>by {updater.user.nickname}</span>
              {item.updated_at && <span>· {getRelativeTime(item.updated_at)}</span>}
            </div>
          )}
        </div>

        {/* 表態 + 留言 (v1.4 新增) */}
        {!item.id.startsWith('local-') && (
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-dashed border-gold flex-wrap">
            <ReactionBar
              reactions={reactions}
              currentUserId={user.id}
              members={members}
              onToggle={onToggleReaction}
              compact
            />
            <CommentThread
              itemId={item.id}
              tripId={tripId}
              currentUser={user}
              members={members}
              count={commentCount}
              onCountChange={(c) => onCommentCountChange(item.id, c)}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {totalDays > 1 && (
          <select value={item.day_number}
            onChange={(e) => onMoveDay(parseInt(e.target.value))}
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] px-1 py-0.5 bg-kinari2 border border-dashed border-usuzumi">
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>D{d}</option>
            ))}
          </select>
        )}
        <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="text-stamp hover:bg-stamp/10 p-1">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

function ShareModal({ open, trip, members, onClose, showToast }) {
  const [copied, setCopied] = useState(false)
  if (!trip) return null
  const shareUrl = `${window.location.origin}/?join=${trip.share_code}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      showToast('✓ 連結已複製', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('複製失敗，請手動複製', 'error')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="✿ 邀請成員加入" maxWidth="max-w-md">
      <div className="px-5 py-4">
        <div className="paper-plain p-4 mb-4" style={{ border: '1.5px dashed #6B4423' }}>
          <div className="text-[10px] text-usuzumi tracking-widest uppercase font-mono mb-1">★ INVITE LINK ★</div>
          <div className="font-mono text-xs break-all text-sumi mb-3 leading-relaxed">{shareUrl}</div>
          <button onClick={handleCopy}
            className="w-full py-2 text-sm font-display font-semibold flex items-center justify-center gap-2 transition-all"
            style={{
              background: copied ? '#7FA468' : '#FF8B5A',
              color: '#FAF6EC',
              border: '1.5px solid #3D2817',
              boxShadow: '3px 3px 0 #3D2817',
            }}>
            {copied ? <><Check size={14} /> 已複製</> : <><Copy size={14} /> 複製連結</>}
          </button>
          <p className="text-[11px] text-usuzumi mt-2 font-display italic text-center">
            分享碼：<span className="font-mono font-bold">{trip.share_code}</span>
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-display font-bold tracking-wider">★ 目前成員</span>
            <span className="text-[10px] text-usuzumi font-mono">{members.length}</span>
          </div>
          <div className="space-y-1.5">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-2 paper-plain p-2"
                style={{ border: '1px dashed #D4B896' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-display font-bold text-kinari2 flex-shrink-0"
                  style={{ background: m.color, border: '1.5px solid #3D2817' }}>
                  {m.user.nickname?.charAt(0)}
                </div>
                <span className="font-display text-sm flex-1">{m.user.nickname}</span>
                {m.role === 'owner' && <span className="text-[9px] text-shu font-mono">建立者</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

function ItineraryEditModal({ open, item, totalDays, defaultDay, onClose, onSave }) {
  const [form, setForm] = useState({})
  const [showPicker, setShowPicker] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [customPlaces, setCustomPlaces] = useState([])

  useEffect(() => {
    if (open) {
      listCustomPlaces().then(setCustomPlaces)
    }
  }, [open])

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

  // 合併內建 + 自訂景點
  const allPlaces = useMemo(() => {
    return [
      ...PLACES.map(p => ({ ...p, isCustom: false })),
      ...customPlaces.map(p => ({ ...p, isCustom: true })),
    ]
  }, [customPlaces])

  const selectedPlace = form.place_id
    ? allPlaces.find(p => p.id === form.place_id) || getPlaceById(form.place_id)
    : null

  const filteredPlaces = useMemo(() => {
    if (!pickerSearch) return allPlaces.slice(0, 50)
    const k = pickerSearch.toLowerCase()
    return allPlaces.filter(p =>
      (p.name_zh || '').toLowerCase().includes(k) ||
      (p.name_jp || '').toLowerCase().includes(k) ||
      (p.type || '').toLowerCase().includes(k) ||
      (p.area || '').toLowerCase().includes(k)
    ).slice(0, 50)
  }, [pickerSearch, allPlaces])

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
              <button onClick={() => setForm({ ...form, place_id: '' })} className="text-xs text-stamp hover:underline">清除</button>
            </div>
          ) : (
            <div className="space-y-2">
              <button onClick={() => setShowPicker(!showPicker)}
                className="w-full p-2.5 paper-plain text-sm text-left hover:bg-shu/10 transition-colors font-display"
                style={{ border: '1.5px dashed #6B4423' }}>
                從 {allPlaces.length} 個地點選擇 → <span className="text-[10px] text-usuzumi">（含自訂）</span>
              </button>
              <div className="text-center text-[11px] text-usuzumi font-display">— 或快速輸入名稱（不存入清單）—</div>
              <Input placeholder="臨時景點（如：○○拉麵）"
                value={form.custom_name || ''}
                onChange={(e) => setForm({ ...form, custom_name: e.target.value })} />
              {form.custom_name && (
                <Input placeholder="地址（選填）"
                  value={form.custom_address || ''}
                  onChange={(e) => setForm({ ...form, custom_address: e.target.value })} />
              )}
            </div>
          )}

          {showPicker && !selectedPlace && (
            <div className="mt-2 max-h-60 overflow-y-auto paper-plain" style={{ border: '1.5px solid #3D2817' }}>
              <input placeholder="搜尋景點..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="w-full px-3 py-2 border-b-2 border-dashed border-gold text-sm bg-kinari2 outline-none font-display" />
              {filteredPlaces.map(p => (
                <button key={p.id}
                  onClick={() => {
                    setForm({ ...form, place_id: p.id, custom_name: '', custom_address: '' })
                    setShowPicker(false)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-shu/10 border-b border-dashed border-gold/50 last:border-b-0">
                  <div className="text-sm font-display flex items-center gap-1">
                    {p.name_zh}
                    {p.isCustom && <span className="text-[9px] px-1 py-0 bg-shu text-kinari2 font-mono">自訂</span>}
                  </div>
                  <div className="text-[11px] text-usuzumi">{p.type} · {p.area}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Select label="第幾天"
            value={form.day_number || 1}
            onChange={(e) => setForm({ ...form, day_number: parseInt(e.target.value) })}
            options={Array.from({ length: totalDays }, (_, i) => ({ value: i + 1, label: `Day ${i + 1}` }))} />
          <Input label="到達時間" type="time"
            value={form.start_time || ''}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
          <Input label="停留分鐘" type="number" min="0" step="15"
            value={form.duration_min || ''}
            onChange={(e) => setForm({ ...form, duration_min: parseInt(e.target.value) || null })} />
        </div>

        <Textarea label="備註（行程細節、預約編號⋯）" rows={2}
          value={form.notes || ''}
          onChange={(e) => setForm({ ...form, notes: e.target.value })} />

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="shu" onClick={() => onSave(form)}>儲存</Button>
        </div>
      </div>
    </Modal>
  )
}
