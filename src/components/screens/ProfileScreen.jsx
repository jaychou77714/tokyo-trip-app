import React, { useState } from 'react'
import { LogOut, Heart, Cloud, CloudOff, Edit3, Sparkles } from 'lucide-react'
import { Button, EditorialHeader, ConfirmDialog, Modal, Input } from '../Common'
import { hasSupabase } from '../../lib/supabase'
import { updateNickname } from '../../lib/storage'
import { PLACES, getPlaceById } from '../../data/places'
import { CATEGORIES } from '../../data/categories'

export default function ProfileScreen({ user, favorites, appVersion, onLogout, onSelectPlace, onUserUpdate, showToast }) {
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [editingNickname, setEditingNickname] = useState(false)
  const favPlaces = favorites.map(f => getPlaceById(f.place_id)).filter(Boolean)
  const versionDisplay = appVersion ? `v${appVersion}` : 'v1.4'

  return (
    <div className="paper-bg min-h-screen pb-24">
      <div className="px-5 pt-12 pb-6 max-w-3xl mx-auto">
        <EditorialHeader jp="プロフィール" zh="My Profile" accent="05" tape="shu" />

        <div className="p-5 mb-5 relative"
          style={{
            background: '#3D2817', color: '#FAF6EC',
            border: '1.5px solid #3D2817', boxShadow: '4px 4px 0 #FF8B5A',
          }}>
          <div className="absolute -top-2 right-6 w-20 h-4 opacity-90"
            style={{
              background: '#FF8B5A',
              backgroundImage: 'linear-gradient(180deg, transparent 47%, rgba(255,255,255,0.4) 47%, rgba(255,255,255,0.4) 53%, transparent 53%)',
              transform: 'rotate(-3deg)',
            }} />
          <div className="flex items-center gap-3 mb-3">
            <span className="font-display text-shu text-xs tracking-[0.3em]">★ USER ★</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(250,246,236,0.3)' }} />
            <button
              onClick={() => setEditingNickname(true)}
              className="text-xs flex items-center gap-1 px-2 py-1 hover:opacity-80 font-display"
              style={{ border: '1px dashed #FAF6EC', borderRadius: 0 }}
            >
              <Edit3 size={11} /> 改暱稱
            </button>
          </div>
          <h2 className="editorial-title text-2xl mb-1">{user.nickname}</h2>
          <p className="text-xs opacity-70 font-mono break-all">ID: {user.id}</p>
        </div>

        <div className="paper-plain p-4 mb-5"
          style={{ border: hasSupabase ? '1.5px dashed #7FA468' : '1.5px dashed #E84E4E' }}>
          <div className="flex items-center gap-2 mb-2">
            {hasSupabase ? <Cloud size={16} className="text-wakaba" /> : <CloudOff size={16} className="text-stamp" />}
            <span className="text-sm font-display font-semibold">
              {hasSupabase ? '雲端同步啟用中 ✓' : '本地模式（未連 Supabase）'}
            </span>
          </div>
          <p className="text-[11px] text-usuzumi leading-relaxed font-display">
            {hasSupabase
              ? '資料儲存在 Supabase 雲端 · v1.4 已啟用即時同步（其他人改了會即時通知）'
              : '尚未設定 Supabase 環境變數，資料只存在這台裝置的瀏覽器中'}
          </p>
        </div>

        <div className="mb-5">
          <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <Heart size={14} className="text-stamp" fill="#E84E4E" />
            ★ 我的收藏 · {favPlaces.length} 個
          </h3>
          {favPlaces.length === 0 ? (
            <div className="paper-plain p-6 text-center text-xs text-usuzumi font-display"
              style={{ border: '1.5px dashed #D4B896' }}>
              尚無收藏。在「景點美食」頁面點愛心可加入收藏。
            </div>
          ) : (
            <div className="grid gap-2">
              {favPlaces.map(p => {
                const cat = CATEGORIES.find(c => c.id === p.category)
                return (
                  <button key={p.id}
                    onClick={() => onSelectPlace && onSelectPlace(p)}
                    className="text-left paper-plain p-3 flex items-center gap-3 transition-all"
                    style={{ border: '1.5px solid #3D2817', boxShadow: '2px 2px 0 #3D2817' }}>
                    <div className="w-2 h-10" style={{ background: cat?.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-sm">{p.name_zh}</div>
                      <div className="text-[11px] text-usuzumi truncate">{p.area} · {p.type}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* v1.4 新增：版本資訊卡片 */}
        <div className="paper-plain p-4 mb-5"
          style={{ border: '1.5px solid #FF8B5A', boxShadow: '2px 2px 0 #FF8B5A' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-display font-bold text-sm flex items-center gap-1.5">
              <Sparkles size={14} className="text-shu" />
              ★ 應用版本
            </span>
            <span className="font-mono font-bold text-shu text-base">{versionDisplay}</span>
          </div>
          <div className="text-[11px] text-usuzumi font-display leading-relaxed">
            ★ 自動偵測新版（每 5 分鐘）<br />
            ★ 新版可用時頂部會顯示 ✿ 更新提示
          </div>
        </div>

        <div className="paper-plain p-4 mb-5" style={{ border: '1.5px dashed #6B4423' }}>
          <h3 className="text-[11px] tracking-widest uppercase text-usuzumi mb-3 font-mono">★ DATABASE STATS ★</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="精選地點" value={`${PLACES.length} 個`} />
            <Stat label="分類" value={`${CATEGORIES.length} 大類`} />
            <Stat label="收藏" value={`${favPlaces.length} 個`} />
            <Stat label="App 版本" value={versionDisplay} />
          </div>
        </div>

        <Button variant="danger" className="w-full" onClick={() => setConfirmLogout(true)}>
          <LogOut size={14} /> 登出
        </Button>

        <p className="text-[10px] text-center text-usuzumi mt-6 leading-relaxed font-display italic">
          東京散策 · Tokyo Trip Companion {versionDisplay}<br />
          Built with React + Supabase + OpenStreetMap<br />
          地圖資料 © OpenStreetMap contributors
        </p>
      </div>

      <NicknameEditModal
        open={editingNickname}
        currentNickname={user.nickname}
        onClose={() => setEditingNickname(false)}
        onSave={async (newName) => {
          const result = await updateNickname(user.id, newName)
          if (result.success) {
            showToast(`✿ 已改名為「${newName}」`, 'success')
            onUserUpdate && onUserUpdate(result.user || { ...user, nickname: newName })
            setEditingNickname(false)
          } else {
            showToast(result.error || '改名失敗', 'error')
          }
        }}
      />

      <ConfirmDialog
        open={confirmLogout}
        title="登出"
        message="確定要登出？下次需要重新輸入暱稱。雲端資料會保留。"
        confirmText="登出" danger
        onConfirm={() => { setConfirmLogout(false); onLogout() }}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  )
}

function NicknameEditModal({ open, currentNickname, onClose, onSave }) {
  const [name, setName] = useState('')
  React.useEffect(() => {
    if (open) setName(currentNickname || '')
  }, [open, currentNickname])

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) return
    if (trimmed === currentNickname) { onClose(); return }
    onSave(trimmed)
  }

  return (
    <Modal open={open} onClose={onClose} title="修改暱稱" maxWidth="max-w-sm">
      <div className="px-5 py-4">
        <p className="text-xs text-usuzumi font-display mb-4 leading-relaxed">
          改名後，所有共編行程裡的「by 你」紀錄會自動更新為新名字。<br />
          ※ 如果新暱稱已被別人使用，無法更改。
        </p>
        <Input
          label="新暱稱"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
          maxLength={20}
        />
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="shu" onClick={handleSubmit}>確認修改</Button>
        </div>
      </div>
    </Modal>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-usuzumi font-mono">{label}</div>
      <div className="font-display font-bold">{value}</div>
    </div>
  )
}
