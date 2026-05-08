import React, { useState } from 'react'
import { Button, Input } from '../Common'
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
      // 先查現有暱稱
      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('nickname', trimmed)
        .limit(1)
        .maybeSingle()

      if (existing) {
        user = existing
      } else {
        const { data: created } = await supabase
          .from('users')
          .insert({ nickname: trimmed })
          .select()
          .single()
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
      {/* 裝飾性日文背景字 */}
      <div className="absolute top-8 left-6 vertical-rl text-[10vw] leading-none font-display font-black text-sumi/[0.04] pointer-events-none select-none">
        東京散策
      </div>
      <div className="absolute bottom-8 right-6 text-[15vw] leading-none font-display font-black text-shu/[0.05] pointer-events-none select-none">
        TOKYO
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-shu" />
            <span className="font-display text-shu text-xs tracking-[0.4em]">EST. 2026</span>
            <div className="w-12 h-px bg-shu" />
          </div>
          <h1 className="editorial-title text-5xl mb-2">東京散策</h1>
          <p className="text-xs text-usuzumi tracking-[0.3em] uppercase">Tokyo Trip Companion</p>
        </div>

        {/* 印章效果 */}
        <div className="flex justify-center mb-8">
          <div className="stamp text-[10px]">自由行專用</div>
        </div>

        <div className={`bg-white/40 backdrop-blur-sm border border-sumi/10 p-6 ${shake ? 'animate-shake' : ''}`}>
          <Input
            label="お名前 / 你的暱稱"
            placeholder="例：山田太郎"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
            maxLength={20}
            autoFocus
          />
          <Button
            variant="shu"
            size="lg"
            className="w-full mt-4"
            onClick={handleEnter}
            disabled={loading}
          >
            {loading ? '進入中...' : '出発 · 開始旅程'}
          </Button>
        </div>

        <p className="text-[11px] text-usuzumi text-center mt-6 leading-relaxed">
          無需密碼，僅以暱稱識別。<br />
          知道網址的旅人即可加入。
        </p>
      </div>
    </div>
  )
}
