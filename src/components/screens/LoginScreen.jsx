import React, { useState } from 'react'
import { Button, Input, WashiTape } from '../Common'
import { hasSupabase, supabase } from '../../lib/supabase'
import { setUser as saveUser } from '../../lib/storage'

export default function LoginScreen({ onLogin }) {
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const handleEnter = async () => {
    const trimmed = nickname.trim()
    if (!trimmed) {
      setShake(true)
      setTimeout(() => setShake(false), 300)
      return
    }
    setLoading(true)
    let user = { id: null, nickname: trimmed }

    if (hasSupabase) {
      const { data: existing } = await supabase
        .from('users').select('*').eq('nickname', trimmed).limit(1).maybeSingle()
      if (existing) user = existing
      else {
        const { data: created } = await supabase
          .from('users').insert({ nickname: trimmed }).select().single()
        if (created) user = created
      }
    } else {
      user.id = `local-${trimmed}`
    }

    saveUser(user)
    onLogin(user)
    setLoading(false)
  }

  return (
    <div className="paper-bg min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-6 left-4 vertical-rl text-[10vw] leading-none font-display font-black text-shu/[0.07] pointer-events-none select-none">
        東京散策
      </div>
      <div className="absolute bottom-6 right-4 text-[12vw] leading-none font-display font-black text-stamp/[0.08] pointer-events-none select-none">
        ことし
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex justify-center mb-8 gap-2">
          <WashiTape color="shu">EST.2026</WashiTape>
          <WashiTape color="blue" className="hidden sm:inline-flex">TOKYO</WashiTape>
        </div>

        <div className="text-center mb-8 relative">
          <h1 className="editorial-title text-5xl mb-3">東京散策</h1>
          <div className="flex items-center gap-2 justify-center">
            <span className="text-stamp">✿</span>
            <p className="text-xs text-usuzumi tracking-[0.4em] uppercase font-mono">Tokyo Trip</p>
            <span className="text-stamp">✿</span>
          </div>
        </div>

        <div className={`paper-card-dashed relative px-6 pt-7 pb-6 ${shake ? 'animate-shake' : ''}`}>
          <div className="washi-strip" style={{ top: -8, left: -10, transform: 'rotate(-8deg)', width: 70 }} />
          <div className="washi-strip" style={{ top: -8, right: -10, transform: 'rotate(7deg)', width: 70, background: '#A8C5D9' }} />

          <div className="text-center mb-4">
            <span className="inline-block text-xs font-display text-usuzumi tracking-widest">
              ✎ お名前を書いて始めましょう
            </span>
          </div>

          <Input
            label="你的暱稱 / Your Name"
            placeholder="例：哈利"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
            maxLength={20}
            autoFocus
          />

          <button
            onClick={handleEnter}
            disabled={loading}
            className="w-full mt-4 py-3 font-display font-semibold text-sm tracking-widest text-kinari2 transition-all"
            style={{
              background: '#FF8B5A',
              border: '1.5px solid #3D2817',
              boxShadow: '4px 4px 0 #3D2817',
            }}
            onMouseDown={(e) => {
              if (loading) return
              e.currentTarget.style.boxShadow = '1px 1px 0 #3D2817'
              e.currentTarget.style.transform = 'translate(3px, 3px)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.boxShadow = '4px 4px 0 #3D2817'
              e.currentTarget.style.transform = 'translate(0, 0)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '4px 4px 0 #3D2817'
              e.currentTarget.style.transform = 'translate(0, 0)'
            }}
          >
            {loading ? '進入中...' : '✈ 出発する · 開始旅程 ✈'}
          </button>

          <div className="absolute -bottom-3 -right-2">
            <div
              className="w-12 h-12 rounded-full flex flex-col items-center justify-center text-[8px] font-display font-bold leading-tight"
              style={{
                border: '1.5px solid #E84E4E',
                color: '#E84E4E',
                background: 'rgba(250,246,236,0.85)',
                transform: 'rotate(-12deg)',
              }}
            >
              <span>承認</span>
              <span>済</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-usuzumi text-center mt-8 leading-relaxed">
          <span className="inline-block deco-dotted w-12 align-middle"></span>
          {' '}無需密碼，僅以暱稱識別 {' '}
          <span className="inline-block deco-dotted w-12 align-middle"></span>
          <br />
          知道網址的旅人即可加入
        </p>

        <div className="flex justify-center items-center gap-3 mt-6 text-usuzumi text-xs">
          <span>♡</span>
          <span className="font-mono tracking-widest">2026</span>
          <span>·</span>
          <span className="font-mono tracking-widest">TRIP NO.1</span>
          <span>♡</span>
        </div>
      </div>
    </div>
  )
}
