import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import L from 'leaflet'

// 修復 leaflet 預設 icon 問題（Vite 打包會壞）
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// 自訂編號 marker
function makeNumberedIcon(num, color = '#c9302c') {
  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="
        position: relative; width: 36px; height: 44px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <svg viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
          <path d="M18 0C8 0 0 8 0 18c0 13 18 26 18 26s18-13 18-26C36 8 28 0 18 0z" fill="${color}"/>
          <circle cx="18" cy="18" r="11" fill="#f5efe6"/>
        </svg>
        <span style="
          position: absolute; top: 9px; left: 0; right: 0; text-align: center;
          font-family: 'Noto Serif JP', serif; font-weight: 700; font-size: 14px; color: ${color};
        ">${num}</span>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
  })
}

// 普通 marker（給景點瀏覽用）
function makeDotIcon(color = '#1a1a1a') {
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="
      width: 14px; height: 14px; background: ${color}; border-radius: 50%;
      border: 3px solid #f5efe6; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

// 地圖自動 fit bounds
function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (!points || points.length === 0) return
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 15)
    } else {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
    }
  }, [points, map])
  return null
}

/**
 * MapView
 * - markers: [{ id, lat, lng, label, num, color, popup, onClick }]
 * - showRoute: 是否畫路線（按 num 順序）
 * - center, zoom: 預設中心與縮放
 * - height: 地圖高度
 */
export default function MapView({
  markers = [],
  showRoute = false,
  center = [35.6812, 139.7671],
  zoom = 12,
  height = '400px',
  onMapClick,
}) {
  const validMarkers = markers.filter(m => m.lat && m.lng)
  const polylinePoints = showRoute
    ? validMarkers.filter(m => m.num).sort((a, b) => a.num - b.num).map(m => [m.lat, m.lng])
    : []

  return (
    <div style={{ height, width: '100%' }} className="relative">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={validMarkers} />
        {validMarkers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={m.num != null ? makeNumberedIcon(m.num, m.color) : makeDotIcon(m.color)}
            eventHandlers={{ click: () => m.onClick && m.onClick(m) }}
          >
            {m.popup && (
              <Popup>
                <div className="font-display font-bold text-base">{m.popup.title}</div>
                {m.popup.subtitle && <div className="text-xs opacity-80 mt-0.5">{m.popup.subtitle}</div>}
                {m.popup.action && (
                  <button
                    onClick={m.popup.action.onClick}
                    className="text-shu hover:underline text-xs mt-2 tracking-wide"
                  >
                    {m.popup.action.label} →
                  </button>
                )}
              </Popup>
            )}
          </Marker>
        ))}
        {polylinePoints.length > 1 && (
          <Polyline
            positions={polylinePoints}
            pathOptions={{ color: '#c9302c', weight: 3, opacity: 0.7, dashArray: '6,8' }}
          />
        )}
      </MapContainer>
    </div>
  )
}
