import React, { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, Train, Calculator, Info } from 'lucide-react'
import { Button, EditorialHeader, EmptyState, Modal, Select } from '../Common'
import { listItinerary } from '../../lib/storage'
import { JR_PASSES, FARE_OPTIONS, AVG_FARE_TOKYO_METRO, evaluatePass } from '../../data/jrpass'

export default function JrPassScreen({ trips, onBack, showToast }) {
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id || null)
  const [tripsCount, setTripsCount] = useState(0)
  const [tripDays, setTripDays] = useState(3)
  const [avgFare, setAvgFare] = useState(AVG_FARE_TOKYO_METRO)
  const [manualMode, setManualMode] = useState(false) // 手動模式
  const [manualFare, setManualFare] = useState(0)
  const [showInfo, setShowInfo] = useState(null)

  const trip = trips.find(t => t.id === selectedTripId)

  // 從行程載入 itinerary
  useEffect(() => {
    if (!trip) return
    setTripDays(trip.days || 3)
    if (trip.id.startsWith('local-')) {
      setTripsCount(0)
      return
    }
    listItinerary(trip.id).then(items => {
      // 估算移動次數：每個地點視為一次移動（首日 -1，含返程移動其實 N 個地點 = N-1 段移動，但保守估算用 N）
      setTripsCount(items.length)
    })
  }, [trip])

  // 計算估計票價
  const estimatedFare = manualMode
    ? parseInt(manualFare) || 0
    : tripsCount * avgFare

  // 評估每張 Pass
  const evaluations = useMemo(() => {
    return JR_PASSES.map(pass => ({
      ...pass,
      eval: evaluatePass(pass, estimatedFare, tripDays),
    })).sort((a, b) => {
      // 划算的排前面
      const aWorth = a.eval.isWorthIt ? 1 : 0
      const bWorth = b.eval.isWorthIt ? 1 : 0
      if (aWorth !== bWorth) return bWorth - aWorth
      return a.price - b.price
    })
  }, [estimatedFare, tripDays])

  return (
    <div className="paper-bg min-h-screen pb-24">
      <div className="px-5 pt-12 pb-6 max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-usuzumi tracking-wider uppercase mb-4 hover:text-shu font-display"
        >
          <ArrowLeft size={14} /> 返回工具箱
        </button>

        <EditorialHeader jp="JRパス計算" zh="JR Pass Calculator" accent="02" tape="green" />

        {/* 連動行程設定 */}
        {trips.length > 0 ? (
          <div className="paper-plain p-4 mb-5" style={{ border: '1.5px dashed #6B4423' }}>
            <div className="flex items-center gap-2 mb-3">
              <Calculator size={14} className="text-shu" />
              <h3 className="font-display font-bold text-sm">行程連動估算</h3>
            </div>

            {trips.length > 1 && (
              <div className="mb-3">
                <span className="block text-[11px] text-usuzumi mb-1 font-mono">選擇行程</span>
                <select
                  value={trip?.id || ''}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="form-input w-full"
                >
                  {trips.map(t => <option key={t.id} value={t.id}>{t.title} ({t.days || 1} 日)</option>)}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <span className="block text-[11px] text-usuzumi mb-1 font-mono">行程天數</span>
                <input
                  type="number" min="1" max="30"
                  value={tripDays}
                  onChange={(e) => setTripDays(parseInt(e.target.value) || 1)}
                  className="form-input w-full"
                />
              </div>
              <div>
                <span className="block text-[11px] text-usuzumi mb-1 font-mono">行程內地點數</span>
                <input
                  type="number" min="0"
                  value={tripsCount}
                  onChange={(e) => setTripsCount(parseInt(e.target.value) || 0)}
                  className="form-input w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setManualMode(false)}
                className={`flex-1 text-xs px-3 py-1.5 transition-all font-display ${
                  !manualMode ? 'bg-sumi text-kinari2' : 'bg-kinari border border-dashed border-gold text-usuzumi'
                }`}
              >
                ⚙ 自動估算
              </button>
              <button
                onClick={() => setManualMode(true)}
                className={`flex-1 text-xs px-3 py-1.5 transition-all font-display ${
                  manualMode ? 'bg-sumi text-kinari2' : 'bg-kinari border border-dashed border-gold text-usuzumi'
                }`}
              >
                ✎ 手動輸入
              </button>
            </div>

            {!manualMode ? (
              <div>
                <span className="block text-[11px] text-usuzumi mb-1 font-mono">平均單程票價</span>
                <select
                  value={avgFare}
                  onChange={(e) => setAvgFare(parseInt(e.target.value))}
                  className="form-input w-full"
                >
                  {FARE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <p className="text-[10px] text-usuzumi mt-1 font-display italic">
                  {FARE_OPTIONS.find(o => o.value === avgFare)?.desc}
                </p>
              </div>
            ) : (
              <div>
                <span className="block text-[11px] text-usuzumi mb-1 font-mono">直接輸入估計總票價（¥）</span>
                <input
                  type="number" min="0"
                  placeholder="例：3500"
                  value={manualFare}
                  onChange={(e) => setManualFare(e.target.value)}
                  className="form-input w-full"
                />
              </div>
            )}

            {/* 估算結果 */}
            <div className="mt-3 pt-3 border-t border-dashed border-gold">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] text-usuzumi font-mono uppercase tracking-wider">預估總票價</span>
                <span className="font-display font-bold text-2xl text-shu">¥{estimatedFare.toLocaleString()}</span>
              </div>
              {!manualMode && tripsCount > 0 && (
                <p className="text-[10px] text-usuzumi font-display italic mt-1">
                  {tripsCount} 個地點 × ¥{avgFare}/趟 = 估算總額
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="paper-plain p-4 mb-5" style={{ border: '1.5px dashed #D4B896' }}>
            <p className="text-sm text-usuzumi font-display text-center">
              建議先建立行程，可自動連動估算 ✦<br />
              <span className="text-[11px]">或直接看下方 7 種 Pass 比較</span>
            </p>
          </div>
        )}

        {/* Pass 列表 */}
        <h3 className="font-display font-bold text-sm mb-3">★ 7 種 Pass 對照</h3>
        <div className="space-y-3">
          {evaluations.map(pass => (
            <PassCard key={pass.id} pass={pass} estimatedFare={estimatedFare} onInfo={() => setShowInfo(pass)} />
          ))}
        </div>

        <p className="text-[10px] text-usuzumi mt-6 leading-relaxed font-display italic">
          ※ 估算為粗略參考，實際票價依路線距離計算（每兩站價格不同）。<br />
          ※ Pass 價格為 2026 年參考價，可能調整，建議出發前確認官網。
        </p>
      </div>

      {/* Pass 詳情 Modal */}
      <Modal open={!!showInfo} onClose={() => setShowInfo(null)} title={showInfo?.name_zh}>
        {showInfo && (
          <div className="px-5 py-4 space-y-3">
            <div>
              <p className="font-display text-usuzumi text-sm mb-2">{showInfo.name_jp}</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-3xl text-shu">¥{showInfo.price.toLocaleString()}</span>
                <span className="text-sm text-usuzumi">/ {showInfo.days} 天</span>
              </div>
            </div>

            <InfoRow label="涵蓋範圍">{showInfo.coverage}</InfoRow>
            <InfoRow label="適合對象">{showInfo.target}</InfoRow>
            <InfoRow label="購買地點">{showInfo.sale_locations}</InfoRow>
            <InfoRow label="注意事項">{showInfo.notes}</InfoRow>
          </div>
        )}
      </Modal>
    </div>
  )
}

function PassCard({ pass, estimatedFare, onInfo }) {
  const e = pass.eval
  const isWorth = e.isWorthIt && e.coverageMatch

  return (
    <div
      className="paper-plain p-4 relative cursor-pointer transition-all"
      style={{
        border: isWorth ? '2px solid #7FA468' : '1.5px solid #3D2817',
        boxShadow: isWorth ? '4px 4px 0 #7FA468' : '2px 2px 0 #3D2817',
      }}
      onClick={onInfo}
    >
      {isWorth && (
        <div
          className="absolute -top-2 right-3 w-16 h-4 flex items-center justify-center"
          style={{
            background: '#7FA468',
            backgroundImage: 'linear-gradient(180deg, transparent 47%, rgba(255,255,255,0.4) 47%, rgba(255,255,255,0.4) 53%, transparent 53%)',
            transform: 'rotate(-3deg)',
          }}
        >
          <span className="text-[9px] font-display font-bold text-kinari2 tracking-wider">★ 划算</span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 flex flex-col items-center justify-center flex-shrink-0"
          style={{ background: pass.color, color: '#FAF6EC', border: '1.5px solid #3D2817' }}
        >
          <Train size={14} />
          <span className="text-[8px] font-mono mt-0.5">{pass.days}D</span>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="editorial-title text-base leading-tight">{pass.name_zh}</h4>
          <p className="text-[11px] text-usuzumi font-display truncate">{pass.target}</p>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display font-bold text-lg">¥{pass.price.toLocaleString()}</span>
            <span className="text-[10px] text-usuzumi">≈ ¥{e.passDailyAvg}/天</span>
          </div>

          {estimatedFare > 0 && (
            <div className="mt-2 pt-2 border-t border-dashed border-gold">
              {!e.coverageMatch ? (
                <p className="text-[11px] text-stamp font-display">
                  ⚠ 行程 {e.fareDailyAvg ? '少於' : '不足'} {pass.days} 天，使用率不足
                </p>
              ) : e.isWorthIt ? (
                <p className="text-[11px] font-display text-wakaba">
                  ✓ 比單買便宜 <span className="font-bold">¥{e.savings.toLocaleString()}</span>
                </p>
              ) : (
                <p className="text-[11px] text-stamp font-display">
                  ✗ 比單買貴 ¥{Math.abs(e.savings).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        <Info size={14} className="text-usuzumi mt-1 flex-shrink-0" />
      </div>
    </div>
  )
}

function InfoRow({ label, children }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-usuzumi mb-0.5 font-mono">{label}</div>
      <div className="text-sm font-display">{children}</div>
    </div>
  )
}
