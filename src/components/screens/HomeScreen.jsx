import React, { useState, useEffect } from 'react'
import { Plus, MapPin, Calendar, Trash2, Edit3 } from 'lucide-react'
import { Button, Modal, Input, EmptyState, EditorialHeader, ConfirmDialog } from '../Common'
import { listTrips, saveTrip, deleteTrip } from '../../lib/storage'
import dayjs from 'dayjs'

export default function HomeScreen({ user, onSelectTrip, showToast }) {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null=未開, {}=新增, {trip}=編輯
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { load() }, [user])

  async function load() {
    setLoading(true)
    const data = await listTrips(user.id)
    setTrips(data)
    setLoading(false)
  }

  async function handleSave(form) {
    if (!form.title?.trim()) { showToast('行程名稱必填', 'error'); return }
    const days = form.start_date && form.end_date
      ? dayjs(form.end_date).diff(dayjs(form.start_date), 'day') + 1
      : (form.days || 1)
    const trip = { ...editing, ...form, days }
    await saveTrip(trip, user.id)
    setEditing(null)
    showToast(editing?.id ? '已更新' : '行程建立完成', 'success')
    load()
  }

  async function handleDelete(trip) {
    await deleteTrip(trip.id, user.id)
    setConfirmDelete(null)
    showToast('已刪除', 'success')
    load()
  }

  return (
    <div className="paper-bg min-h-screen pb-24">
      <div className="px-5 pt-12 pb-6 max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between mb-2">
          <span className="font-display text-shu text-xs tracking-[0.3em]">こんにちは</span>
          <span className="text-xs text-usuzumi font-mono">{dayjs().format('YYYY.MM.DD')}</span>
        </div>
        <h1 className="editorial-title text-3xl mb-1">{user.nickname} さん</h1>
        <p className="text-xs text-usuzumi tracking-[0.2em] uppercase">Welcome Back</p>

        <div className="mt-10">
          <EditorialHeader jp="旅の計画" zh="MY TRIPS" accent="01" />

          {loading ? (
            <div className="text-center py-12 text-usuzumi text-sm">読み込み中...</div>
          ) : trips.length === 0 ? (
            <EmptyState
              icon="✈"
              title="尚無行程"
              desc="開始規劃你的東京之旅"
              action={<Button variant="shu" onClick={() => setEditing({})}><Plus size={16} /> 建立新行程</Button>}
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {trips.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onClick={() => onSelectTrip(trip)}
                  onEdit={() => setEditing(trip)}
                  onDelete={() => setConfirmDelete(trip)}
                />
              ))}
              <button
                onClick={() => setEditing({})}
                className="border-2 border-dashed border-sumi/20 hover:border-shu hover:text-shu p-6 transition-colors flex flex-col items-center justify-center min-h-[140px] text-usuzumi"
              >
                <Plus size={24} className="mb-1" />
                <span className="text-sm font-display">新しい旅 / 新增行程</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 編輯/新增 modal */}
      <TripEditModal
        open={editing !== null}
        trip={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="刪除行程"
        message={`確定刪除「${confirmDelete?.title}」？所有相關行程項目和花費也會一併刪除。`}
        confirmText="刪除"
        danger
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

function TripCard({ trip, onClick, onEdit, onDelete }) {
  const days = trip.days || (trip.start_date && trip.end_date
    ? dayjs(trip.end_date).diff(dayjs(trip.start_date), 'day') + 1 : 1)
  return (
    <div className="group bg-white/50 hover:bg-white/70 border border-sumi/10 hover:border-sumi/30 transition-all card-shadow hover:card-shadow-hover">
      <div onClick={onClick} className="cursor-pointer p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="editorial-title text-xl mb-0.5">{trip.title}</h3>
            <div className="flex items-center gap-1.5 text-xs text-usuzumi">
              <Calendar size={12} />
              {trip.start_date ? (
                <span>{dayjs(trip.start_date).format('M/D')} – {dayjs(trip.end_date).format('M/D')}</span>
              ) : (
                <span>未指定日期</span>
              )}
              <span>·</span>
              <span>{days} 日</span>
            </div>
          </div>
          <span className="text-shu font-display text-xs tracking-widest">TRIP</span>
        </div>
        {trip.notes && (
          <p className="text-xs text-sumi/70 mt-2 line-clamp-2">{trip.notes}</p>
        )}
      </div>
      <div className="flex border-t border-sumi/10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="flex-1 py-2 text-xs text-usuzumi hover:bg-sumi/5 flex items-center justify-center gap-1">
          <Edit3 size={11} /> 編輯
        </button>
        <button onClick={onDelete} className="flex-1 py-2 text-xs text-shu hover:bg-shu/5 flex items-center justify-center gap-1 border-l border-sumi/10">
          <Trash2 size={11} /> 刪除
        </button>
      </div>
    </div>
  )
}

function TripEditModal({ open, trip, onClose, onSave }) {
  const [form, setForm] = useState({})
  useEffect(() => {
    if (trip) setForm({
      title: trip.title || '',
      start_date: trip.start_date || '',
      end_date: trip.end_date || '',
      days: trip.days || 4,
      notes: trip.notes || '',
    })
  }, [trip])

  return (
    <Modal open={open} onClose={onClose} title={trip?.id ? '編輯行程' : '新增行程'}>
      <div className="px-5 py-4 space-y-4">
        <Input label="行程名稱" placeholder="例：2026 春櫻東京 5 日"
          value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="出發日" type="date"
            value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <Input label="返程日" type="date"
            value={form.end_date || ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
        </div>
        <Input label="天數（未填日期時用此）" type="number" min="1" max="30"
          value={form.days || ''} onChange={(e) => setForm({ ...form, days: parseInt(e.target.value) || 1 })} />
        <div>
          <span className="block text-xs font-medium text-usuzumi mb-1.5 tracking-wider">備註</span>
          <textarea rows={3}
            placeholder="同行成員、住宿、目的⋯"
            value={form.notes || ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-white/60 border border-sumi/15 focus:border-shu focus:outline-none text-sm transition-colors resize-none"
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="shu" onClick={() => onSave(form)}>儲存</Button>
        </div>
      </div>
    </Modal>
  )
}
