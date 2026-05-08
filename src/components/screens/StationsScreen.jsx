import React, { useState, useMemo } from 'react'
import { Search, Train } from 'lucide-react'
import { EditorialHeader, EmptyState, Modal } from '../Common'
import { STATIONS, MAIN_LINES } from '../../data/stations'
import { PLACES } from '../../data/places'
import MapView from '../MapView'

// 計算兩點距離（粗略，公里）
function distance(a, b) {
  const R = 6371
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const x = Math.sin(dLat/2)**2 +
    Math.cos(a.lat*Math.PI/180) * Math.cos(b.lat*Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x))
}

export default function StationsScreen({ onSelectPlace }) {
  const [search, setSearch] = useState('')
  const [activeLine, setActiveLine] = useState('全部')
  const [selectedStation, setSelectedStation] = useState(null)

  const filtered = useMemo(() => {
    let list = STATIONS
    if (activeLine !== '全部') list = list.filter(s => s.lines.some(l => l.includes(activeLine)))
    if (search.trim()) {
      const k = search.toLowerCase()
      list = list.filter(s =>
        s.name_zh.toLowerCase().includes(k) ||
        s.name_jp.toLowerCase().includes(k) ||
        s.kana.toLowerCase().includes(k) ||
        s.lines.some(l => l.toLowerCase().includes(k))
      )
    }
    return list
  }, [search, activeLine])

  const nearbyPlaces = useMemo(() => {
    if (!selectedStation) return []
    return PLACES.map(p => ({ ...p, _dist: distance(selectedStation, p) }))
      .filter(p => p._dist < 1.2) // 1.2 km 範圍
      .sort((a, b) => a._dist - b._dist)
      .slice(0, 12)
  }, [selectedStation])

  return (
    <div className="paper-bg min-h-screen pb-24">
      <div className="px-5 pt-12 pb-6 max-w-5xl mx-auto">
        <EditorialHeader jp="駅探し" zh="STATIONS · TOKYO RAIL MAP" accent="03" />

        <div className="bg-white/40 border border-sumi/10 p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Search size={14} className="text-usuzumi" />
            <input
              placeholder="搜尋站名、路線、假名（如 shibuya）..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={activeLine === '全部'} onClick={() => setActiveLine('全部')}>全部</FilterChip>
            {MAIN_LINES.slice(0, 12).map(line => (
              <FilterChip
                key={line}
                active={activeLine === line}
                onClick={() => setActiveLine(line)}
              >
                {line.replace('東京Metro', 'M').replace('都營', '都').replace('JR', 'JR')}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-3">
          <span className="text-xs text-usuzumi tracking-wider uppercase">{filtered.length} 站</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="🚉" title="無符合結果" />
        ) : (
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(s => (
              <StationCard key={s.id} station={s} onClick={() => setSelectedStation(s)} />
            ))}
          </div>
        )}
      </div>

      {/* 站點詳情 */}
      <Modal
        open={!!selectedStation}
        onClose={() => setSelectedStation(null)}
        title={selectedStation ? `${selectedStation.name_zh} 站` : ''}
        maxWidth="max-w-2xl"
      >
        {selectedStation && (
          <div>
            <div className="px-5 py-4 border-b border-sumi/10">
              <p className="font-display text-sumi/60 text-sm mb-3">{selectedStation.name_jp} · {selectedStation.kana}</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedStation.lines.map(l => (
                  <span key={l} className="text-[11px] px-2 py-0.5 bg-sumi text-kinari font-mono">
                    {l}
                  </span>
                ))}
              </div>
            </div>

            <MapView
              height="220px"
              center={[selectedStation.lat, selectedStation.lng]}
              zoom={15}
              markers={[
                { id: selectedStation.id, lat: selectedStation.lat, lng: selectedStation.lng, color: '#1a1a1a' },
                ...nearbyPlaces.map(p => ({
                  id: p.id, lat: p.lat, lng: p.lng, color: '#c9302c',
                  popup: { title: p.name_zh, subtitle: p.type }
                }))
              ]}
            />

            <div className="px-5 py-4">
              <h4 className="font-display font-bold mb-2">附近精選 · {nearbyPlaces.length} 個</h4>
              {nearbyPlaces.length === 0 ? (
                <p className="text-xs text-usuzumi">附近暫無精選地點</p>
              ) : (
                <div className="space-y-1.5">
                  {nearbyPlaces.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { onSelectPlace && onSelectPlace(p); setSelectedStation(null) }}
                      className="w-full text-left flex items-center justify-between gap-2 p-2 hover:bg-sumi/5 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{p.name_zh}</div>
                        <div className="text-[11px] text-usuzumi truncate">{p.type}</div>
                      </div>
                      <span className="text-xs text-shu font-mono">{p._dist.toFixed(2)} km</span>
                    </button>
                  ))}
                </div>
              )}

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedStation.lat},${selectedStation.lng}`}
                target="_blank"
                rel="noreferrer"
                className="block text-center mt-4 text-xs text-shu hover:underline"
              >
                在 Google Maps 開啟 ↗
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`text-[11px] px-2.5 py-1 transition-colors ${
        active ? 'bg-sumi text-kinari' : 'bg-white/60 text-usuzumi hover:bg-white border border-sumi/10'
      }`}
    >
      {children}
    </button>
  )
}

function StationCard({ station, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white/50 hover:bg-white/80 border border-sumi/10 p-3 transition-all card-shadow hover:card-shadow-hover"
    >
      <div className="flex items-start gap-2">
        <Train size={14} className="text-shu mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="editorial-title text-base">{station.name_zh}</div>
          <div className="font-display text-[11px] text-usuzumi truncate">{station.name_jp}</div>
          <div className="flex flex-wrap gap-0.5 mt-1.5">
            {station.lines.slice(0, 3).map(l => (
              <span key={l} className="text-[9px] px-1 py-0.5 bg-sumi/5 text-sumi/80 font-mono">
                {l.replace('東京Metro', 'M').replace('都營', '都')}
              </span>
            ))}
            {station.lines.length > 3 && (
              <span className="text-[9px] px-1 py-0.5 text-usuzumi">+{station.lines.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
