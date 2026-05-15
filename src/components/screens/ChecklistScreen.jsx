import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { ArrowLeft, Plus, Trash2, Sparkles } from 'lucide-react'
import { Button, Modal, Input, Select, EditorialHeader, EmptyState, ConfirmDialog } from '../Common'
import { RealtimeNotice } from '../UpdateNotice'
import {
  listChecklist, saveChecklistItem, deleteChecklistItem,
  bulkInsertChecklist, clearChecklist, listTripMembers,
} from '../../lib/storage'
import { useTripRealtime } from '../../lib/realtime'
import { CHECKLIST_CATEGORIES, CHECKLIST_TEMPLATE, generateInitialChecklist } from '../../data/checklist-template'
import { getRelativeTime } from '../../data/members'
import dayjs from 'dayjs'

export default function ChecklistScreen({ trips, user, onBack, showToast }) {
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id || null)
  const trip = trips.find(t => t.id === selectedTripId)

  if (!trips.length) {
    return (
      <div className="paper-bg min-h-screen pb-24 px-5 pt-12 max-w-3xl mx-auto">
        <BackBtn onBack={onBack} />
        <EditorialHeader jp="出発前チェック" zh="Pre-Trip Checklist" accent="01" tape="shu" />
        <EmptyState icon="📋" title="尚無行程" desc="請先到「行程」頁建立行程" />
      </div>
    )
  }
  return <ChecklistForTrip trip={trip} trips={trips} user={user} onSelectTrip={setSelectedTripId} onBack={onBack} showToast={showToast} />
}

function ChecklistForTrip({ trip, trips, user, onSelectTrip, onBack, showToast }) {
  const [items, setItems] = useState([])
  const [members, setMembers] = useState([])
  const [editing, setEditing] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [pendingUpdates, setPendingUpdates] = useState(0)

  useEffect(() => { loadAll() }, [trip])

  const handleRealtimeChange = useCallback(() => {
    setPendingUpdates(prev => prev + 1)
  }, [])
  useTripRealtime(trip.id, user?.id, handleRealtimeChange)

  async function loadAll() {
    const [itemsData, membersData] = await Promise.all([
      listChecklist(trip.id),
      listTripMembers(trip.id),
    ])
    setItems(itemsData); setMembers(membersData)
    setPendingUpdates(0)
  }

  const memberMap = useMemo(() => {
    const m = {}
    members.forEach(mem => { m[mem.user_id] = mem })
    return m
  }, [members])

  async function handleToggle(item) {
    await saveChecklistItem({ ...item, is_done: !item.is_done }, trip.id, user.id)
    loadAll()
  }
  async function handleDelete(item) {
    await deleteChecklistItem(item.id, trip.id)
    showToast('已刪除', 'success'); loadAll()
  }
  async function handleAdd(form) {
    if (!form.item_name?.trim()) { showToast('項目名稱必填', 'error'); return }
    await saveChecklistItem({
      category: form.category || 'docs',
      item_name: form.item_name,
      item_desc: form.item_desc || '',
      is_done: false, is_custom: true, sort_order: items.length,
    }, trip.id, user.id)
    setEditing(null); showToast('✓ 已加入', 'success'); loadAll()
  }
  async function handleLoadTemplate() {
    const initial = generateInitialChecklist(trip.id)
    await bulkInsertChecklist(initial, trip.id, user.id)
    showToast(`✿ 已載入 ${CHECKLIST_TEMPLATE.length} 項預設清單`, 'success'); loadAll()
  }
  async function handleClearAll() {
    await clearChecklist(trip.id)
    setConfirmClear(false); showToast('已清空', 'success'); loadAll()
  }

  const stats = useMemo(() => {
    const total = items.length
    const done = items.filter(i => i.is_done).length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    let daysLeft = null
    if (trip.start_date) {
      daysLeft = dayjs(trip.start_date).startOf('day').diff(dayjs().startOf('day'), 'day')
    }
    return { total, done, pct, daysLeft }
  }, [items, trip])

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return items
    return items.filter(i => i.category === activeCategory)
  }, [items, activeCategory])

  const groupedByCategory = useMemo(() => {
    const groups = {}
    CHECKLIST_CATEGORIES.forEach(c => { groups[c.id] = [] })
    filteredItems.forEach(item => {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    })
    return groups
  }, [filteredItems])

  return (
    <div className="paper-bg min-h-screen pb-24">
      <RealtimeNotice count={pendingUpdates} onSync={loadAll} />

      <div className="px-5 pt-12 pb-6 max-w-3xl mx-auto">
        <BackBtn onBack={onBack} />
        <EditorialHeader jp="出発前チェック" zh="Pre-Trip Checklist" accent="01" tape="shu" />

        {trips.length > 1 && (
          <div className="mb-4">
            <select value={trip.id} onChange={(e) => onSelectTrip(e.target.value)} className="form-input">
              {trips.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
        )}

        <div className="paper-plain p-5 mb-5 relative"
          style={{ border: '2px solid #3D2817', boxShadow: '4px 4px 0 #FF8B5A' }}>
          <div className="absolute -top-2 left-6 w-20 h-4"
            style={{
              background: '#FF8B5A',
              backgroundImage: 'linear-gradient(180deg, transparent 47%, rgba(255,255,255,0.4) 47%, rgba(255,255,255,0.4) 53%, transparent 53%)',
              transform: 'rotate(-3deg)',
            }} />
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] text-usuzumi tracking-widest uppercase font-mono">出発まで · COUNTDOWN</div>
              <h2 className="editorial-title text-lg mt-0.5">{trip.title}</h2>
            </div>
            {stats.daysLeft !== null && (
              <div className="text-right">
                <div className="font-display font-bold text-3xl text-shu">
                  {stats.daysLeft > 0 ? stats.daysLeft : stats.daysLeft === 0 ? '今天' : '已出發'}
                </div>
                {stats.daysLeft > 0 && <div className="text-xs text-usuzumi font-display">天</div>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs mb-2">
            <span className="font-display font-semibold text-sumi">完成度</span>
            <div className="flex-1 h-3 bg-kinari" style={{ border: '1.5px solid #3D2817' }}>
              <div className="h-full transition-all" style={{ width: `${stats.pct}%`, background: '#7FA468' }} />
            </div>
            <span className="font-mono font-bold text-sm">{stats.pct}%</span>
          </div>
          <div className="text-[11px] text-usuzumi font-display">
            ✓ 完成 {stats.done} 項 · 剩餘 {stats.total - stats.done} 項 · 共 {stats.total} 項
          </div>
        </div>

        {items.length === 0 && (
          <EmptyState
            icon="📋" title="清單還是空的" desc="載入 35 項預設範本，或自己加項目"
            action={
              <div className="flex gap-2">
                <Button variant="shu" onClick={handleLoadTemplate}>
                  <Sparkles size={14} /> 載入預設範本
                </Button>
                <Button variant="outline" onClick={() => setEditing({})}>
                  <Plus size={14} /> 自己加
                </Button>
              </div>
            }
          />
        )}

        {items.length > 0 && (
          <>
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 -mx-5 px-5">
              <CategoryChip active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} emoji="✦" name="全部" count={items.length} />
              {CHECKLIST_CATEGORIES.map(cat => {
                const count = items.filter(i => i.category === cat.id).length
                if (count === 0) return null
                return (
                  <CategoryChip key={cat.id} active={activeCategory === cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    emoji={cat.emoji} name={cat.name} count={count} color={cat.color} />
                )
              })}
            </div>

            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-usuzumi tracking-wider uppercase font-mono">★ {filteredItems.length} 項 ★</span>
              <div className="flex gap-1.5">
                <Button variant="shu" size="sm" onClick={() => setEditing({ category: activeCategory === 'all' ? 'docs' : activeCategory })}>
                  <Plus size={12} /> 新增
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)}>
                  <Trash2 size={12} /> 清空
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {CHECKLIST_CATEGORIES.map(cat => {
                const list = groupedByCategory[cat.id] || []
                if (list.length === 0) return null
                return (
                  <div key={cat.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ color: cat.color }} className="text-base">{cat.emoji}</span>
                      <h4 className="font-display font-bold text-sm">{cat.name}</h4>
                      <span className="text-[10px] text-usuzumi font-mono">
                        {list.filter(i => i.is_done).length}/{list.length}
                      </span>
                      <div className="flex-1 deco-dashed" />
                    </div>
                    <div className="space-y-1.5">
                      {list.map(item => (
                        <ChecklistItemRow key={item.id} item={item} memberMap={memberMap}
                          onToggle={() => handleToggle(item)}
                          onDelete={() => handleDelete(item)} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <AddItemModal
        open={editing !== null}
        defaultCategory={editing?.category}
        onClose={() => setEditing(null)}
        onSave={handleAdd}
      />

      <ConfirmDialog
        open={confirmClear}
        title="清空所有項目"
        message="確定清空這個行程的所有 checklist 項目？此操作不可復原。"
        confirmText="清空" danger
        onConfirm={handleClearAll}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  )
}

function BackBtn({ onBack }) {
  return (
    <button onClick={onBack}
      className="flex items-center gap-1.5 text-xs text-usuzumi tracking-wider uppercase mb-4 hover:text-shu font-display">
      <ArrowLeft size={14} /> 返回工具箱
    </button>
  )
}

function CategoryChip({ active, onClick, emoji, name, count, color }) {
  return (
    <button onClick={onClick}
      className="flex-shrink-0 px-3 py-1.5 transition-all flex items-center gap-1.5 font-display text-xs"
      style={{
        background: active ? '#3D2817' : '#FFFCF5',
        color: active ? '#FAF6EC' : '#3D2817',
        border: active ? '1.5px solid #3D2817' : '1.5px dashed #D4B896',
      }}>
      <span style={{ color: active ? '#FF8B5A' : color }}>{emoji}</span>
      {name}
      <span className="text-[10px] opacity-70 font-mono">{count}</span>
    </button>
  )
}

function ChecklistItemRow({ item, memberMap, onToggle, onDelete }) {
  const updaterId = item.updated_by || item.added_by
  const updater = updaterId ? memberMap[updaterId] : null
  return (
    <div className="group flex items-start gap-3 paper-plain p-2.5 transition-all"
      style={{
        border: item.is_done ? '1.5px dashed #D4B896' : '1.5px solid #3D2817',
        opacity: item.is_done ? 0.6 : 1,
      }}>
      <button onClick={onToggle}
        className="w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all"
        style={{
          background: item.is_done ? '#7FA468' : 'transparent',
          border: '1.5px solid #3D2817',
        }}>
        {item.is_done && <span className="text-kinari2 text-xs font-bold">✓</span>}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-display ${item.is_done ? 'line-through text-usuzumi' : ''}`}>
          {item.item_name}
          {item.is_custom && <span className="ml-2 text-[9px] text-shu font-mono">+自訂</span>}
        </div>
        {item.item_desc && <div className="text-[11px] text-usuzumi mt-0.5">{item.item_desc}</div>}
        {updater && (
          <div className="flex items-center gap-1 mt-1 text-[10px] text-usuzumi font-mono">
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: updater.color }} />
            <span>by {updater.user.nickname}</span>
            {item.updated_at && <span>· {getRelativeTime(item.updated_at)}</span>}
          </div>
        )}
      </div>
      <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-stamp p-1 transition-opacity flex-shrink-0">
        <Trash2 size={12} />
      </button>
    </div>
  )
}

function AddItemModal({ open, defaultCategory, onClose, onSave }) {
  const [form, setForm] = useState({})
  useEffect(() => {
    if (open) setForm({
      category: defaultCategory || 'docs',
      item_name: '', item_desc: '',
    })
  }, [open, defaultCategory])
  return (
    <Modal open={open} onClose={onClose} title="新增 Checklist 項目">
      <div className="px-5 py-4 space-y-3">
        <Select label="分類" value={form.category || 'docs'}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          options={CHECKLIST_CATEGORIES.map(c => ({ value: c.id, label: `${c.emoji} ${c.name}` }))} />
        <Input label="項目名稱" placeholder="例：泡麵 / 環保杯"
          value={form.item_name || ''} onChange={(e) => setForm({ ...form, item_name: e.target.value })} autoFocus />
        <Input label="補充說明（可選）" placeholder="例：飯店宵夜備用"
          value={form.item_desc || ''} onChange={(e) => setForm({ ...form, item_desc: e.target.value })} />
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="shu" onClick={() => onSave(form)}>加入</Button>
        </div>
      </div>
    </Modal>
  )
}
