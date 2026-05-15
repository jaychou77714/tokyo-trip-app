import React, { useState } from 'react'
import { Modal } from './Common'
import { REACTION_EMOJIS, REACTION_COLORS } from '../data/reactions'
import { getRelativeTime } from '../data/members'

/**
 * 表態按鈕列（顯示在景點/花費/Checklist 底部）
 *
 * Props:
 * - reactions: [{ id, emoji, user_id, created_at }, ...]
 * - currentUserId: 目前使用者 ID
 * - members: trip 成員列表（用來顯示誰按的）
 * - onToggle(emoji): 點按時呼叫
 */
export default function ReactionBar({ reactions = [], currentUserId, members = [], onToggle, compact = false }) {
  const [showDetail, setShowDetail] = useState(null)

  const memberMap = {}
  members.forEach(m => { memberMap[m.user_id] = m })

  // 將 reactions 按 emoji 分組
  const grouped = {}
  REACTION_EMOJIS.forEach(({ emoji }) => { grouped[emoji] = [] })
  reactions.forEach(r => {
    if (!grouped[r.emoji]) grouped[r.emoji] = []
    grouped[r.emoji].push(r)
  })

  return (
    <>
      <div className="flex items-center gap-1.5 flex-wrap">
        {REACTION_EMOJIS.map(({ emoji, label }) => {
          const list = grouped[emoji] || []
          const count = list.length
          const myReacted = list.some(r => r.user_id === currentUserId)
          const color = REACTION_COLORS[emoji]

          return (
            <button
              key={emoji}
              onClick={(e) => {
                e.stopPropagation()
                onToggle(emoji)
              }}
              onContextMenu={(e) => {
                e.preventDefault()
                if (count > 0) setShowDetail({ emoji, list })
              }}
              className="inline-flex items-center gap-1 transition-all"
              style={{
                padding: compact ? '2px 6px' : '3px 8px',
                fontSize: compact ? '11px' : '12px',
                background: myReacted ? color : 'transparent',
                color: myReacted ? '#FAF6EC' : '#3D2817',
                border: myReacted ? `1.5px solid ${color}` : '1.5px dashed #D4B896',
                fontFamily: '"Klee One", "Noto Serif JP", serif',
              }}
              title={`${label} (右鍵看詳情)`}
            >
              <span>{emoji}</span>
              {count > 0 && (
                <span
                  className="font-mono font-bold cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDetail({ emoji, list })
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <Modal
        open={!!showDetail}
        onClose={() => setShowDetail(null)}
        title={`${showDetail?.emoji} 誰按了`}
        maxWidth="max-w-sm"
      >
        <div className="px-5 py-4">
          <div className="space-y-2">
            {(showDetail?.list || []).map(r => {
              const member = memberMap[r.user_id]
              return (
                <div key={r.id} className="flex items-center gap-2 paper-plain p-2"
                  style={{ border: '1px dashed #D4B896' }}>
                  {member && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-display font-bold text-kinari2"
                      style={{ background: member.color, border: '1.5px solid #3D2817' }}>
                      {member.user.nickname?.charAt(0)}
                    </div>
                  )}
                  <span className="font-display text-sm flex-1">{member?.user?.nickname || '未知成員'}</span>
                  <span className="text-[10px] text-usuzumi font-mono">{getRelativeTime(r.created_at)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>
    </>
  )
}
