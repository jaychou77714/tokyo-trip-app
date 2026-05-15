import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Trash2 } from 'lucide-react'
import { Modal } from './Common'
import { listComments, addComment, deleteComment } from '../lib/storage'
import { getRelativeTime } from '../data/members'

/**
 * 留言按鈕 + 展開後的留言串 Modal
 *
 * Props:
 * - itemId: 景點 itinerary item id
 * - tripId: 行程 id
 * - currentUser: 目前使用者
 * - members: 行程成員（用來查暱稱+顏色）
 * - count: 已知留言數（從外部傳入避免每次點都查）
 * - onCountChange(newCount): 留言數變動通知
 */
export default function CommentThread({ itemId, tripId, currentUser, members = [], count = 0, onCountChange }) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const listEndRef = useRef(null)

  const memberMap = {}
  members.forEach(m => { memberMap[m.user_id] = m })

  useEffect(() => {
    if (open && itemId) loadComments()
  }, [open, itemId])

  // 自動滾到底
  useEffect(() => {
    if (open && comments.length > 0) {
      setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [comments.length, open])

  async function loadComments() {
    setLoading(true)
    const data = await listComments(itemId)
    setComments(data)
    setLoading(false)
    if (onCountChange) onCountChange(data.length)
  }

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || !currentUser?.id) return
    setInput('')
    await addComment({
      item_id: itemId,
      trip_id: tripId,
      content: trimmed,
    }, currentUser.id)
    loadComments()
  }

  async function handleDelete(commentId) {
    await deleteComment(commentId)
    loadComments()
  }

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true) }}
        className="inline-flex items-center gap-1 transition-all hover:bg-shu/10"
        style={{
          padding: '3px 8px',
          fontSize: '12px',
          background: count > 0 ? '#A8C5D9' : 'transparent',
          color: count > 0 ? '#2d5168' : '#3D2817',
          border: count > 0 ? '1.5px solid #A8C5D9' : '1.5px dashed #D4B896',
          fontFamily: '"Klee One", serif',
        }}
      >
        <MessageCircle size={11} />
        {count > 0 && <span className="font-mono font-bold">{count}</span>}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="💬 景點留言" maxWidth="max-w-md">
        <div className="flex flex-col" style={{ height: '60vh', maxHeight: '60vh' }}>
          {/* 留言列表 */}
          <div className="flex-1 overflow-y-auto px-5 py-3">
            {loading ? (
              <div className="text-center text-usuzumi text-sm py-8 font-display">読み込み中...</div>
            ) : comments.length === 0 ? (
              <div className="text-center text-usuzumi text-sm py-12 font-display">
                <MessageCircle size={28} className="mx-auto mb-2 opacity-30" />
                還沒有留言<br />
                <span className="text-[11px]">用下方輸入框開始討論吧</span>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map(c => {
                  const member = memberMap[c.user_id]
                  const isMine = c.user_id === currentUser?.id
                  const color = member?.color || '#6B4423'

                  return (
                    <div
                      key={c.id}
                      className={`flex gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-display font-bold text-kinari2 flex-shrink-0"
                        style={{ background: color, border: '1.5px solid #3D2817' }}
                      >
                        {member?.user?.nickname?.charAt(0) || '?'}
                      </div>
                      <div className={`flex-1 max-w-[78%] ${isMine ? 'text-right' : 'text-left'}`}>
                        <div className={`text-[10px] text-usuzumi font-display mb-0.5 ${isMine ? 'text-right' : ''}`}>
                          {member?.user?.nickname || '未知'} · {getRelativeTime(c.created_at)}
                        </div>
                        <div
                          className="inline-block paper-plain px-3 py-2 text-sm font-display text-left"
                          style={{
                            border: '1.5px solid #3D2817',
                            background: isMine ? '#FFE8DD' : '#FFFCF5',
                            wordBreak: 'break-word',
                          }}
                        >
                          {c.content}
                          {isMine && (
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="ml-2 text-[10px] text-stamp opacity-60 hover:opacity-100"
                            >
                              <Trash2 size={9} className="inline" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={listEndRef} />
              </div>
            )}
          </div>

          {/* 輸入框 */}
          <div className="border-t-2 border-dashed border-gold p-3 flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="輸入留言... (Enter 送出)"
              className="flex-1 form-input resize-none"
              style={{ minHeight: '40px', maxHeight: '100px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex-shrink-0 p-2 transition-all"
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
      </Modal>
    </>
  )
}
