import React from 'react'
import { CheckSquare, Train, ArrowRight } from 'lucide-react'
import { EditorialHeader } from '../Common'

const TOOLS = [
  {
    id: 'checklist',
    name_zh: '行前 Checklist',
    name_jp: '出発前チェック',
    desc: '35 項預設清單 · 出發倒數 · 完成度追蹤',
    icon: CheckSquare,
    color: '#FF8B5A',
    items: ['證件文件', '金錢', '交通', '3C', '衣物', '藥品', '行李', '出發前確認'],
  },
  {
    id: 'jrpass',
    name_zh: 'JR Pass 計算機',
    name_jp: 'JR パス計算',
    desc: '7 種票券對照 · 連動行程估算 · 划算度判斷',
    icon: Train,
    color: '#7FA468',
    items: ['Tokyo Subway 24/48/72h', 'JR Tokyo Wide Pass', 'JR Pass 全國版', '東京一日券', 'Greater Tokyo Pass'],
  },
]

export default function ToolsScreen({ onNavigate }) {
  return (
    <div className="paper-bg min-h-screen pb-24">
      <div className="px-5 pt-12 pb-6 max-w-3xl mx-auto">
        <EditorialHeader jp="道具箱" zh="Travel Tools" accent="06" tape="green" />

        <div className="grid gap-4 md:grid-cols-2">
          {TOOLS.map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={() => onNavigate(tool.id)} />
          ))}
        </div>

        <div className="mt-8 paper-plain p-4 text-center" style={{ border: '1.5px dashed #D4B896' }}>
          <p className="text-xs text-usuzumi font-display italic">
            ✿ 更多工具持續開發中 ✿<br />
            <span className="text-[10px]">天氣預報、機場接駁查詢、退稅計算機⋯</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function ToolCard({ tool, onClick }) {
  const Icon = tool.icon
  return (
    <button
      onClick={onClick}
      className="paper-plain p-5 text-left transition-all w-full"
      style={{
        border: '1.5px solid #3D2817',
        boxShadow: '4px 4px 0 #3D2817',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `5px 5px 0 ${tool.color}`; e.currentTarget.style.transform = 'translate(-1px, -1px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '4px 4px 0 #3D2817'; e.currentTarget.style.transform = 'translate(0, 0)' }}
    >
      {/* 角落紙膠帶 */}
      <div
        className="absolute -top-2 right-4 w-14 h-3.5"
        style={{
          background: tool.color,
          backgroundImage: 'linear-gradient(180deg, transparent 47%, rgba(255,255,255,0.4) 47%, rgba(255,255,255,0.4) 53%, transparent 53%)',
          transform: 'rotate(-3deg)',
          position: 'absolute',
        }}
      />

      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 flex items-center justify-center flex-shrink-0"
          style={{ background: tool.color, color: '#FAF6EC', border: '1.5px solid #3D2817' }}
        >
          <Icon size={22} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="editorial-title text-lg leading-tight">{tool.name_zh}</h3>
          <p className="font-display text-xs text-usuzumi">{tool.name_jp}</p>
        </div>
        <ArrowRight size={16} className="text-usuzumi mt-2" />
      </div>

      <p className="text-xs text-sumi/85 mb-3 font-display">{tool.desc}</p>

      <div className="flex flex-wrap gap-1 pt-3 border-t border-dashed border-gold">
        {tool.items.map(t => (
          <span key={t} className="text-[10px] text-usuzumi font-display"
            style={{ background: '#FAF6EC', border: '1px dashed #D4B896', padding: '2px 6px' }}>
            {t}
          </span>
        ))}
      </div>
    </button>
  )
}
