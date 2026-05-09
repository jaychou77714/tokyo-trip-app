import React, { useState, useEffect } from 'react'
import { Plus, Calendar, Trash2, Edit3, Users } from 'lucide-react'
import { Button, Modal, Input, EmptyState, EditorialHeader, ConfirmDialog } from '../Common'
import { saveTrip, deleteTrip, listTripMembers } from '../../lib/storage'
import { useTripsRealtime } from '../../lib/realtime'
import dayjs from 'dayjs'

const TRIP_TAPE_COLORS = ['shu', 'blue', 'green', 'yellow']

export default function HomeScreen({ user, trips, appVersion, onSelectTrip, showToast, onRefresh }) {
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [memberCounts, setMemberCounts] = useState({})

  // 即時更新 trips 列表（有新行程加入時自動 refresh）
  useTripsRealtime(user.id, () => {
    if (onRefresh) onRefresh()
  })

  useEffect(() => {
    async function loadCounts() {
      const counts = {}
      for (const trip of trips) {
        if (!trip.id.startsWith('local-')) {
          const members = await listTripMembers(trip.id)
          counts[trip.id] = members.length
        }
      }
      setMemberCounts(counts)
    }
    if (trips.length > 0) loadCounts()
  }, [trips])

  async function handleSave(form) {
    if (!form.title?.trim()) { showToast('行程名稱必填', 'error'); return }
    // 自動算天數
    let days = form.days || 1
    if (form.start_date && form.end_date) {
      days = dayjs(form.end_date).diff(dayjs(form.start_date), 'day') + 1
    }
    const trip = { ...editing, ...form, days }
    await saveTrip(trip, user.id)
    setEditing(null)
    showToast(editing?.id ? '✓ 已更新' : '✿ 行程建立完成', 'success')
    onRefresh && onRefresh()
  }

  async function handleDelete(trip) {
    await deleteTrip(trip.id, user.id)
    setConfirmDelete(null)
    showToast('已刪除', 'success')
    onRefresh && onRefresh()
  }

  const ownedTrips = trips.filter(t => t.owner_id === user.id || (!t.owner_id && t.user_id === user.id))
  const sharedTrips = trips.filter(t => t.owner_id && t.owner_id !== user.id)

  return (
    <div className="paper-bg min-h-screen pb-24">
      <div className="px-5 pt-12 pb-6 max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between mb-2">
          <span className="font-display text-shu text-xs tracking-[0.3em]">こんにちは ♡</span>
          <span className="text-xs text-usuzumi font-mono">{dayjs().format('YYYY.MM.DD')}</span>
        </div>
        <h1 className="editorial-title text-3xl mb-1">
          {user.nickname} <span className="text-usuzumi text-base font-normal">さん</span>
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-xs text-usuzumi tracking-[0.2em] uppercase font-mono">★ Welcome Back ★</p>
          {appVersion && (
            <span className="text-[10px] font-mono px-1.5 py-0.5"
              style={{ background: '#FF8B5A', color: '#FAF6EC' }}>
              v{appVersion}
            </span>
          )}
        </div>

        <div className="mt-10">
          <EditorialHeader jp="旅の計画" zh="My Trips" accent="01" tape="shu" />

          {trips.length === 0 ? (
            <EmptyState
              icon="✈" title="尚無行程" desc="開始規劃你的東京之旅"
              action={<Button variant="shu" onClick={() => setEditing({})}><Plus size={16} /> 建立新行程</Button>}
            />
          ) : (
            <>
              {ownedTrips.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-display font-bold text-sumi">★ 我建立的</span>
                    <span className="text-[10px] text-usuzumi font-mono">{ownedTrips.length}</span>
                    <div className="flex-1 deco-dashed" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {ownedTrips.map((trip, idx) => (
                      <TripCard key={trip.id} trip={trip}
                        memberCount={memberCounts[trip.id] || 1}
                        tapeColor={TRIP_TAPE_COLORS[idx % TRIP_TAPE_COLORS.length]}
                        onClick={() => onSelectTrip(trip)}
                        onEdit={() => setEditing(trip)}
                        onDelete={() => setConfirmDelete(trip)}
                        canDelete={true}
                      />
                    ))}
                    <button onClick={() => setEditing({})}
                      className="border-2 border-dashed border-gold hover:border-shu hover:text-shu p-6 transition-all flex flex-col items-center justify-center min-h-[150px] text-usuzumi paper-plain group">
                      <Plus size={28} className="mb-1 group-hover:rotate-90 transition-transform" />
                      <span className="text-sm font-display tracking-wider">新しい旅 / 新增行程</span>
                    </button>
                  </div>
                </div>
              )}

              {sharedTrips.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={12} className="text-shu" />
                    <span className="text-xs font-display font-bold text-sumi">★ 共編中</span>
                    <span className="text-[10px] text-usuzumi font-mono">{sharedTrips.length}</span>
                    <div className="flex-1 deco-dashed" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {sharedTrips.map((trip, idx) => (
                      <TripCard key={trip.id} trip={trip}
                        memberCount={memberCounts[trip.id] || 1}
                        tapeColor={TRIP_TAPE_COLORS[(idx + 2) % TRIP_TAPE_COLORS.length]}
                        onClick={() => onSelectTrip(trip)}
                        onEdit={() => setEditing(trip)}
                        onDelete={() => setConfirmDelete(trip)}
                        canDelete={false} isShared={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {ownedTrips.length === 0 && (
                <button onClick={() => setEditing({})}
                  className="mt-4 w-full border-2 border-dashed border-gold hover:border-shu hover:text-shu p-6 transition-all flex flex-col items-center justify-center text-usuzumi paper-plain group">
                  <Plus size={28} className="mb-1 group-hover:rotate-90 transition-transform" />
                  <span className="text-sm font-display tracking-wider">新しい旅 / 新增行程</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <TripEditModal
        open={editing !== null} trip={editing}
        onClose={() => setEditing(null)} onSave={handleSave}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="刪除行程"
        message={`確定刪除「${confirmDelete?.title}」？所有相關行程項目和花費也會一併刪除。`}
        confirmText="刪除" danger
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

function TripCard({ trip, memberCount, tapeColor, onClick, onEdit, onDelete, canDelete, isShared }) {
  const days = trip.days || (trip.start_date && trip.end_date
    ? dayjs(trip.end_date).diff(dayjs(trip.start_date), 'day') + 1 : 1)
  const tapeBg = { shu: '#FF8B5A', blue: '#A8C5D9', green: '#7FA468', yellow: '#F0B450' }[tapeColor]
  return (
    <div className="group relative paper-plain p-5 transition-all"
      style={{ border: '1.5px solid #3D2817', boxShadow: '3px 3px 0 #3D2817' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '5px 5px 0 #3D2817'; e.currentTarget.style.transform = 'translate(-1px, -1px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '3px 3px 0 #3D2817'; e.currentTarget.style.transform = 'translate(0, 0)' }}>
      <div className="absolute -top-2 left-4 w-16 h-4 opacity-90"
        style={{
          background: tapeBg,
          backgroundImage: 'linear-gradient(180deg, transparent 47%, rgba(255,255,255,0.4) 47%, rgba(255,255,255,0.4) 53%, transparent 53%)',
          transform: 'rotate(-2deg)',
        }} />

      <div onClick={onClick} className="cursor-pointer pt-2">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="editorial-title text-xl mb-1 truncate">{trip.title}</h3>
            <div className="flex items-center gap-1.5 text-xs text-usuzumi flex-wrap">
              <Calendar size={11} />
              {trip.start_date ? (
                <span className="font-mono">{dayjs(trip.start_date).format('M/D')} – {dayjs(trip.end_date).format('M/D')}</span>
              ) : (
                <span>未指定日期</span>
              )}
              <span>·</span>
              <span className="font-mono">{days} 日</span>
              {memberCount > 1 && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5 text-shu font-mono">
                    <Users size={10} /> {memberCount}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full flex flex-col items-center justify-center flex-shrink-0 ml-2 text-[8px] font-display font-bold"
            style={{ border: '1.5px solid #E84E4E', color: '#E84E4E', background: 'rgba(250,246,236,0.6)', transform: 'rotate(-8deg)' }}>
            <span>TRIP</span>
            <span>{String(days).padStart(2, '0')}D</span>
          </div>
        </div>
        {trip.notes && <p className="text-xs text-sumi/75 mt-2 line-clamp-2 italic font-display">{trip.notes}</p>}
        {isShared && (
          <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-display tracking-wider"
            style={{ color: '#FF8B5A', border: '1px dashed #FF8B5A', padding: '2px 6px' }}>
            ◉ 共編行程
          </div>
        )}
      </div>

      <div className="flex border-t-2 border-dashed border-gold mt-3 pt-2 -mx-5 px-5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="flex-1 py-1 text-xs text-usuzumi hover:text-sumi flex items-center justify-center gap-1">
          <Edit3 size={11} /> 編輯
        </button>
        {canDelete && (
          <>
            <span className="text-gold">|</span>
            <button onClick={onDelete} className="flex-1 py-1 text-xs text-stamp hover:text-stamp/80 flex items-center justify-center gap-1">
              <Trash2 size={11} /> 刪除
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ===== TripEditModal v1.4：自動算天數 =====
function TripEditModal({ open, trip, onClose, onSave }) {
  const [form, setForm] = useState({})

  useEffect(() => {
    if (trip) setForm({
      title: trip.title || '',
      start_date: trip.start_date || '',
      end_date: trip.end_date || '',
      notes: trip.notes || '',
    })
  }, [trip])

  // 自動計算天數
  const calculatedDays = (() => {
    if (form.start_date && form.end_date) {
      const d = dayjs(form.end_date).diff(dayjs(form.start_date), 'day') + 1
      return d > 0 ? d : null
    }
    return null
  })()

  const dateError = (() => {
    if (form.start_date && form.end_date) {
      if (dayjs(form.end_date).isBefore(dayjs(form.start_date))) return '返程日不能早於出發日'
    }
    return null
  })()

  return (
    <Modal open={open} onClose={onClose} title={trip?.id ? '編輯行程' : '新增行程'}>
      <div className="px-5 py-4 space-y-4">
        <Input
          label="行程名稱"
          placeholder="例：2026 春櫻東京 5 日"
          value={form.title || ''}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="出發日"
            type="date"
            value={form.start_date || ''}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
          <Input
            label="返程日"
            type="date"
            value={form.end_date || ''}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>

        {/* 天數顯示（自動計算）*/}
        <div className="paper-plain p-3 flex items-center justify-between"
          style={{
            border: dateError ? '1.5px dashed #E84E4E' : calculatedDays ? '1.5px solid #7FA468' : '1.5px dashed #D4B896',
          }}>
          <div>
            <div className="text-[10px] text-usuzumi tracking-widest uppercase font-mono">★ 行程天數（自動計算）</div>
            <div className="font-display text-xs text-usuzumi italic mt-0.5">
              {dateError ? `⚠ ${dateError}` : (calculatedDays ? `從出發日到返程日共 ${calculatedDays} 天` : '請先填出發日 + 返程日')}
            </div>
          </div>
          <div className="font-display font-bold text-2xl"
            style={{ color: dateError ? '#E84E4E' : calculatedDays ? '#7FA468' : '#D4B896' }}>
            {calculatedDays || '—'}
            <span className="text-xs ml-1 text-usuzumi">日</span>
          </div>
        </div>

        <div>
          <span className="block text-xs font-display font-semibold text-usuzumi mb-1.5 tracking-wider">✎ 備註</span>
          <textarea rows={3}
            placeholder="同行成員、住宿、目的⋯"
            value={form.notes || ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full form-input resize-none"
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="shu" disabled={!!dateError} onClick={() => onSave({ ...form, days: calculatedDays || 1 })}>
            儲存
          </Button>
        </div>
      </div>
    </Modal>
  )
}
