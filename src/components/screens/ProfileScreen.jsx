import React, { useState, useEffect } from 'react'
import { LogOut, Heart, Database, Cloud, CloudOff } from 'lucide-react'
import { Button, EditorialHeader, ConfirmDialog } from '../Common'
import { hasSupabase } from '../../lib/supabase'
import { PLACES, getPlaceById } from '../../data/places'
import { CATEGORIES } from '../../data/categories'

export default function ProfileScreen({ user, favorites, onLogout, onSelectPlace }) {
  const [confirmLogout, setConfirmLogout] = useState(false)
  const favPlaces = favorites
    .map(f => getPlaceById(f.place_id))
    .filter(Boolean)

  return (
    <div className="paper-bg min-h-screen pb-24">
      <div className="px-5 pt-12 pb-6 max-w-3xl mx-auto">
        <EditorialHeader jp="プロフィール" zh="MY PROFILE" accent="05" />

        {/* 使用者資訊 */}
        <div className="bg-sumi text-kinari p-5 mb-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-display text-shu text-xs tracking-[0.3em]">USER</span>
            <div className="flex-1 h-px bg-kinari/30" />
          </div>
          <h2 className="editorial-title text-2xl mb-1">{user.nickname}</h2>
          <p className="text-xs opacity-70 font-mono break-all">ID: {user.id}</p>
        </div>

        {/* 連線狀態 */}
        <div className="bg-white/40 border border-sumi/10 p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            {hasSupabase ? (
              <Cloud size={16} className="text-[#7a8a5a]" />
            ) : (
              <CloudOff size={16} className="text-shu" />
            )}
            <span className="text-sm font-medium">
              {hasSupabase ? '雲端同步啟用中' : '本地模式（未連 Supabase）'}
            </span>
          </div>
          <p className="text-[11px] text-usuzumi leading-relaxed">
            {hasSupabase
              ? '資料儲存在 Supabase 雲端，更換裝置時用同樣暱稱即可繼續使用。'
              : '尚未設定 Supabase 環境變數，資料只存在這台裝置的瀏覽器中。換瀏覽器或清除快取會遺失資料。'}
          </p>
        </div>

        {/* 收藏 */}
        <div className="mb-5">
          <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <Heart size={14} className="text-shu" /> 我的收藏 · {favPlaces.length} 個
          </h3>
          {favPlaces.length === 0 ? (
            <div className="bg-white/30 border border-dashed border-sumi/20 p-6 text-center text-xs text-usuzumi">
              尚無收藏。在「景點美食」頁面點愛心可加入收藏。
            </div>
          ) : (
            <div className="grid gap-2">
              {favPlaces.map(p => {
                const cat = CATEGORIES.find(c => c.id === p.category)
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPlace && onSelectPlace(p)}
                    className="text-left bg-white/50 hover:bg-white/80 border border-sumi/10 p-3 flex items-center gap-3 transition-all"
                  >
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

        {/* 資料統計 */}
        <div className="bg-white/40 border border-sumi/10 p-4 mb-5">
          <h3 className="text-[11px] tracking-widest uppercase text-usuzumi mb-3">DATABASE STATS</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="精選地點" value={`${PLACES.length} 個`} />
            <Stat label="分類" value={`${CATEGORIES.length} 大類`} />
            <Stat label="收藏" value={`${favPlaces.length} 個`} />
            <Stat label="App 版本" value="v1.0" />
          </div>
        </div>

        <Button variant="danger" className="w-full" onClick={() => setConfirmLogout(true)}>
          <LogOut size={14} /> 登出
        </Button>

        <p className="text-[10px] text-center text-usuzumi mt-6 leading-relaxed">
          東京散策 · Tokyo Trip Companion v1.0<br />
          Built with React + Supabase + OpenStreetMap<br />
          地圖資料 © OpenStreetMap contributors
        </p>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="登出"
        message="確定要登出？下次需要重新輸入暱稱。雲端資料會保留。"
        confirmText="登出"
        danger
        onConfirm={() => { setConfirmLogout(false); onLogout() }}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-usuzumi">{label}</div>
      <div className="font-display font-bold">{value}</div>
    </div>
  )
}
