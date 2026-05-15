import React, { useState, useEffect, useCallback } from 'react'
import { StickyNote, Send, Trash2 } from 'lucide-react'
import { Modal } from './Common'
import {
  listTripNotes, addTripNote, deleteTripNote,
  listTripReactions, toggleReaction,
} from '../lib/storage'
import { REACTION_EMOJIS } from '../data/reactions'
import { getRelativeTime } from '../data/members'

/**
 * 共筆便條紙（行程詳情頁底部）
 * Props:
 * - tripId
 * - currentUser
 * - members
 */
export default function NotepadSection({ tripId, currentUser, members = [] }) {
  const [notes, setNotes] = useState([])
  const [reactions, setReactions] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const memberMap = {}
  members.forEach(m => { memberMap[m.user_id] = m })

  useEffect(() => {
    if (tripId) loadAll()
  }, [tripId])

  async function loadAll() {
    if (!tripId) return
    const [notesData, reactionsData] = await Promise.all([
      listTripNotes(tripId),
      listTripReactions(tripId),
    ])
    setNotes(notesData || [])
    setReactions((reactionsData || []).filter(r => r.item_type === 'note'))
  }

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || !currentUser?.id) return
    setLoading(true)
    setInput('')
    await addTripNote({ trip_id: tripId, content: trimmed }, currentUser.id)
    await loadAll()
    setLoading(false)
  }

  async function handleDelete(noteId) {
    if (!window.confirm('刪除這則便條？')) return
    await deleteTripNote(noteId)
    loadAll()
  }

  async function handleToggleReaction(noteId, emoji) {
    await toggleReaction('note', noteId, tripId, emoji, currentUser.id)
    const r = await listTripReactions(tripId)
    setReactions((r || []).filter(x => x.item_type === 'note'))
  }

  // reactions 按 note_id 分組
  const reactionsByNote = {}
  reactions.forEach(r => {
    if (!reactionsByNote[r.item_id]) reactionsByNote[r.item_id] = []
    reactionsByNote[r.item_id].push(r)
  })

  return (
    <div className="mt-8 pt-6 border-t-2 border-dashed border-gold">
      <div className="flex items-center gap-2 mb-3">
        <StickyNote size={16} className="text-shu" />
        <h3 className="font-display font-bold text-sm">★ 共筆便條紙</h3>
        <span className="text-[10px] text-usuzumi font-mono">{notes.length} 則</span>
        <div className="flex-1 deco-dashed" />
      </div>

      <p className="text-[11px] text-usuzumi font-display italic mb-3">
        ※ 寫下臨時想法、提醒、討論事項，所有成員都看得到 · 可以對留言按表態
      </p>

      {/* 既有便條 */}
      {notes.length === 0 ? (
        <div className="paper-plain p-4 text-center text-xs text-usuzumi font-display"
          style={{ border: '1.5px dashed #D4B896' }}>
          📌 還沒有便條。開始第一個討論吧！
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map(note => {
            const member = memberMap[note.user_id]
            const isMine = note.user_id === currentUser?.id
            const noteReactions = reactionsByNote[note.id] || []
            return (
              <div
                key={note.id}
                className="paper-plain p-3 relative"
                style={{
                  background: '#FFFCE8',
                  border: '1.5px solid #3D2817',
                  boxShadow: '2px 2px 0 ' + (member?.color || '#FF8B5A'),
                  transform: `rotate(${(note.id.charCodeAt(0) % 5 - 2) * 0.3}deg)`,
                }}
              >
                <div className="flex items-start gap-2">
                  {member && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-display font-bold text-kinari2 flex-shrink-0"
                      style={{ background: member.color, border: '1.5px solid #3D2817' }}
                    >
                      {member.user.nickname?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-usuzumi font-display mb-1">
                      <span className="font-bold">{member?.user?.nickname || '?'}</span>
                      <span className="ml-2 font-mono">{getRelativeTime(note.created_at)}</span>
                    </div>
                    <div className="text-sm font-display leading-relaxed whitespace-pre-wrap break-words">
                      {note.content}
                    </div>

                    {/* 表態 */}
                    <div className="mt-2 flex items-center gap-1">
                      {REACTION_EMOJIS.map(({ emoji, label }) => {
                        const list = noteReactions.filter(r => r.emoji === emoji)
                        const myReacted = list.some(r => r.user_id === currentUser?.id)
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleToggleReaction(note.id, emoji)}
                            className="inline-flex items-center gap-0.5 transition-all"
                            style={{
                              padding: '2px 6px',
                              fontSize: '11px',
                              background: myReacted ? '#3D2817' : 'transparent',
                              color: myReacted ? '#FAF6EC' : '#3D2817',
                              border: myReacted ? '1.5px solid #3D2817' : '1.5px dashed #D4B896',
                              fontFamily: '"Klee One", serif',
                            }}
                            title={label}
                          >
                            <span>{emoji}</span>
                            {list.length > 0 && <span className="font-mono font-bold">{list.length}</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {isMine && (
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="flex-shrink-0 text-stamp opacity-50 hover:opacity-100 p-1"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 輸入框 */}
      <div className="mt-3 flex gap-2">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="寫一張便條 (Ctrl+Enter 送出)..."
          className="flex-1 form-input resize-none"
          style={{ minHeight: '50px' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="flex-shrink-0 px-3 transition-all"
          style={{
            background: input.trim() ? '#FF8B5A' : '#D4B896',
            color: '#FAF6EC',
            border: '1.5px solid #3D2817',
            boxShadow: input.trim() ? '2px 2px 0 #3D2817' : 'none',
            opacity: input.trim() ? 1 : 0.5,
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
