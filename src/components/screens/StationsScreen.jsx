import React, { useState, useMemo } from 'react'
import { Search, Train } from 'lucide-react'
import { EditorialHeader, EmptyState, Modal } from '../Common'
import { STATIONS, MAIN_LINES } from '../../data/stations'
import { PLACES } from '../../data/places'
import MapView from '../MapView'

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
      .filter(p => p._dist < 1.2)
      .sort((a, b) => a._dist - b._dist)
      .slice(0, 12)
  }, [selectedStation])

  return (
    <div className="paper-bg min-h-screen pb-24">
      <div className="px-5 pt-12 pb-6 max-w-5xl mx-auto">
        <EditorialHeader jp="駅探し" zh="Stations · Tokyo Rail Map" accent="03" tape="green" />

        <div className="paper-plain p-4 mb-5" style={{ border: '1.5px dashed #6B4423' }}>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-dashed border-gold">
            <Search size={14} className="text-shu" />
            <input
              placeholder="搜尋站名、路線、假名（如 shibuya）..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm font-display"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={activeLine === '全部'} onClick={() => setActiveLine('全部')}>全部</FilterChip>
            {MAIN_LINES.slice(0, 12).map(line => (
              <FilterChip key={line} active={activeLine === line} onClick={() => setActiveLine(line)}>
                {line.replace('東京Metro', 'M').replace('都營', '都').replace('JR', 'JR')}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-3">
          <span className="text-xs text-usuzumi tracking-wider uppercase font-mono">★ {filtered.length} 站 ★</span>
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

      <Modal
        open={!!selectedStation}
        onClose={() => setSelectedStation(null)}
        title={selectedStation ? `${selectedStation.name_zh} 站` : ''}
        maxWidth="max-w-2xl"
      >
        {selectedStation && (
          <div>
            <div className="px-5 py-4 border-b-2 border-dashed border-gold">
              <p className="font-display text-usuzumi text-sm mb-3">{selectedStation.name_jp} · {selectedStation.kana}</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedStation.lines.map(l => (
                  <span key={l} className="text-[11px] px-2 py-0.5 bg-sumi text-kinari2 font-mono">{l}</span>
                ))}
              </div>
            </div>

            <MapView
              height="220px"
              center={[selectedStation.lat, selectedStation.lng]}
              zoom={15}
              markers={[
                { id: selectedStation.id, lat: selectedStation.lat, lng: selectedStation.lng, color: '#3D2817' },
                ...nearbyPlaces.map(p => ({
                  id: p.id, lat: p.lat, lng: p.lng, color: '#FF8B5A',
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
                      className="w-full text-left flex items-center justify-between gap-2 p-2 hover:bg-shu/10 transition-colors border-b border-dashed border-gold/50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate font-display">{p.name_zh}</div>
                        <div className="text-[11px] text-usuzumi truncate">{p.type}</div>
                      </div>
                      <span className="text-xs text-shu font-mono">{p._dist.toFixed(2)} km</span>
                    </button>
                  ))}
                </div>
              )}

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedStation.lat},${selectedStation.lng}`}
                target="_blank" rel="noreferrer"
                className="block text-center mt-4 text-xs text-shu hover:underline font-display"
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
      className={`text-[11px] px-2.5 py-1 transition-all font-display ${
        active ? 'bg-sumi text-kinari2' : 'bg-kinari text-usuzumi hover:bg-kinari2 border border-dashed border-gold'
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
      className="text-left paper-plain p-3 transition-all"
      style={{ border: '1.5px solid #3D2817', boxShadow: '2px 2px 0 #3D2817' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '3px 3px 0 #FF8B5A'; e.currentTarget.style.transform = 'translate(-1px, -1px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '2px 2px 0 #3D2817'; e.currentTarget.style.transform = 'translate(0, 0)' }}
    >
      <div className="flex items-start gap-2">
        <Train size={14} className="text-stamp mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="editorial-title text-base">{station.name_zh}</div>
          <div className="font-display text-[11px] text-usuzumi truncate">{station.name_jp}</div>
          <div className="flex flex-wrap gap-0.5 mt-1.5">
            {station.lines.slice(0, 3).map(l => (
              <span key={l} className="text-[9px] px-1 py-0.5 bg-kinari text-sumi/80 font-mono border border-dashed border-gold/60">
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
