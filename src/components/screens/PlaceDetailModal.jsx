import React from 'react'
import { Modal, Button, StampLabel } from '../Common'
import { CATEGORIES } from '../../data/categories'
import { MapPin, Clock, Tag, ExternalLink, Heart, Plus } from 'lucide-react'

export default function PlaceDetailModal({ place, open, onClose, isFavorite, onToggleFavorite, onAddToTrip }) {
  if (!place) return null
  const cat = CATEGORIES.find(c => c.id === place.category)

  return (
    <Modal open={open} onClose={onClose} title={place.name_zh} maxWidth="max-w-md">
      <div className="px-5 py-4">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <StampLabel color={cat?.color}>{cat?.name}</StampLabel>
            <span className="text-xs text-usuzumi font-display">· {place.type}</span>
          </div>
          <p className="font-display text-usuzumi text-sm mb-1">{place.name_jp}</p>
          {place.description && (
            <p className="text-sm leading-relaxed text-sumi/85 mt-3 font-display">{place.description}</p>
          )}
        </div>

        <div className="space-y-3 border-t-2 border-dashed border-gold pt-4 text-sm">
          <Row icon={<MapPin size={14} />} label="地址">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`}
              target="_blank" rel="noreferrer"
              className="text-shu hover:underline font-display"
            >
              {place.address} ↗
            </a>
          </Row>
          <Row icon={<Clock size={14} />} label="營業時間">{place.hours || '–'}</Row>
          <Row icon="¥" label="費用">{place.price || '–'}</Row>
          <Row icon="◎" label="所在地區">{place.area}</Row>
          {place.tags?.length > 0 && (
            <Row icon={<Tag size={14} />} label="標籤">
              <div className="flex flex-wrap gap-1.5">
                {place.tags.map(t => (
                  <span key={t} className="text-[11px] px-2 py-0.5 font-display"
                    style={{ background: '#FAF6EC', border: '1px dashed #6B4423' }}>
                    {t}
                  </span>
                ))}
              </div>
            </Row>
          )}
          {place.website && (
            <Row icon={<ExternalLink size={14} />} label="官網">
              <a href={place.website} target="_blank" rel="noreferrer" className="text-shu hover:underline break-all font-display">
                {place.website.replace(/https?:\/\//, '')}
              </a>
            </Row>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant={isFavorite ? 'stamp' : 'outline'} className="flex-1" onClick={() => onToggleFavorite(place.id)}>
            <Heart size={14} fill={isFavorite ? '#FAF6EC' : 'none'} />
            {isFavorite ? '已收藏' : '收藏'}
          </Button>
          {onAddToTrip && (
            <Button variant="shu" className="flex-1" onClick={() => onAddToTrip(place)}>
              <Plus size={14} /> 加入行程
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

function Row({ icon, label, children }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-5 flex-shrink-0 text-shu mt-0.5 flex justify-center font-bold">{icon}</div>
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-widest text-usuzumi mb-0.5 font-mono">{label}</div>
        <div className="text-sumi">{children}</div>
      </div>
    </div>
  )
}
