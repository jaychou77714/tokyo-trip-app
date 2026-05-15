import React from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'

/**
 * 新版可用通知（頂部）
 */
export function UpdateNotice({ visible, currentVersion, newVersion, onReload }) {
  if (!visible) return null
  return (
    <div className="fixed top-0 left-0 right-0 z-[1500] animate-fade-up">
      <div
        className="px-4 py-2.5 text-sm flex items-center justify-between gap-2 max-w-3xl mx-auto"
        style={{
          background: '#FF8B5A',
          color: '#FAF6EC',
          borderBottom: '2px solid #3D2817',
          boxShadow: '0 2px 0 #3D2817',
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Sparkles size={14} className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold">✿ 新版本可用 v{newVersion}</div>
            <div className="text-[11px] opacity-80 truncate font-display">
              你目前使用 v{currentVersion}，點右側更新
            </div>
          </div>
        </div>
        <button
          onClick={onReload}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 font-display font-semibold text-xs"
          style={{
            background: '#3D2817',
            color: '#FAF6EC',
            border: '1.5px solid #FAF6EC',
          }}
        >
          <RefreshCw size={11} />
          更新
        </button>
      </div>
    </div>
  )
}

/**
 * 即時同步提示（下方靠左，不擋畫面）
 */
export function RealtimeNotice({ count, onSync }) {
  if (count === 0) return null
  return (
    <div className="fixed bottom-20 left-4 z-[900] animate-fade-up">
      <button
        onClick={onSync}
        className="flex items-center gap-2 px-3 py-2 transition-all hover:scale-105"
        style={{
          background: '#A8C5D9',
          color: '#2d5168',
          border: '1.5px solid #3D2817',
          boxShadow: '3px 3px 0 #3D2817',
          fontFamily: '"Klee One", serif',
        }}
      >
        <RefreshCw size={13} />
        <span className="text-xs font-semibold">
          ✦ {count} 個更新 · 點此載入
        </span>
      </button>
    </div>
  )
}
