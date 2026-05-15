import React, { useState, useEffect } from 'react'
import { MapPin, Search } from 'lucide-react'
import { Modal, Button, Input, Select } from './Common'
import { CATEGORIES, AREAS } from '../data/categories'

/**
 * 新增 / 編輯自訂景點 Modal
 *
 * Props:
 * - open: 是否開啟
 * - place: 編輯時帶入既有景點，新增則為 {} 或 null
 * - onClose: 關閉
 * - onSave(formData): 儲存
 */
export default function AddPlaceModal({ open, place, onClose, onSave }) {
  const [form, setForm] = useState({})
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    if (place) {
      setForm({
        name_zh: place.name_zh || '',
        name_jp: place.name_jp || '',
        category: place.category || 6,  // 預設住宿
        area: place.area || '其他',
        type: place.type || '景點',
        lat: place.lat || null,
        lng: place.lng || null,
        address: place.address || '',
        description: place.description || '',
        price: place.price || '',
        hours: place.hours || '',
        website: place.website || '',
      })
    } else {
      setForm({
        category: 6, area: '其他', type: '景點',
      })
    }
  }, [place, open])

  // 用 OpenStreetMap Nominatim 搜尋地址 → 拿經緯度
  async function searchAddress() {
    const query = form.address || form.name_zh
    if (!query) return
    setSearching(true)
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' 東京')}&format=json&limit=5&accept-language=zh-TW`
      const r = await fetch(url, { headers: { 'User-Agent': 'TokyoTripApp/1.5' } })
      const data = await r.json()
      setSearchResults(data || [])
    } catch (err) {
      console.error('地址搜尋失敗', err)
      setSearchResults([])
    }
    setSearching(false)
  }

  function handlePickResult(r) {
    setForm({
      ...form,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      address: form.address || r.display_name?.slice(0, 80),
    })
    setSearchResults([])
  }

  function handleSubmit() {
    if (!form.name_zh?.trim()) {
      alert('景點名稱必填')
      return
    }
    if (!form.lat || !form.lng) {
      alert('請設定地圖位置（搜尋地址或手動輸入經緯度）')
      return
    }
    onSave(form)
  }

  const selectedCat = CATEGORIES.find(c => c.id === form.category)

  return (
    <Modal open={open} onClose={onClose} title={place?.id ? '編輯景點' : '✿ 新增景點'} maxWidth="max-w-md">
      <div className="px-5 py-4 space-y-3">
        {/* 分類 */}
        <div>
          <span className="block text-xs font-display font-semibold text-usuzumi mb-1.5 tracking-wider">★ 分類</span>
          <div className="grid grid-cols-3 gap-1.5">
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setForm({ ...form, category: c.id })}
                className="px-2 py-2 transition-all text-xs font-display flex flex-col items-center gap-0.5"
                style={{
                  background: form.category === c.id ? c.color : '#FFFCF5',
                  color: form.category === c.id ? '#FAF6EC' : '#3D2817',
                  border: form.category === c.id ? '2px solid #3D2817' : '1.5px dashed #D4B896',
                }}
              >
                <span className="text-base">{c.emoji}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 名稱 */}
        <Input
          label="景點 / 飯店名稱（必填）"
          placeholder={form.category === 6 ? '例：東橫 INN 上野駅前' : '例：澀谷 109'}
          value={form.name_zh || ''}
          onChange={(e) => setForm({ ...form, name_zh: e.target.value })}
        />

        <Input
          label="日文名稱（選填）"
          placeholder={form.category === 6 ? '例：東横INN 上野駅前' : '例：SHIBUYA 109'}
          value={form.name_jp || ''}
          onChange={(e) => setForm({ ...form, name_jp: e.target.value })}
        />

        {/* 地區 + 類型 */}
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="地區"
            value={form.area || '其他'}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
            options={AREAS.map(a => ({ value: a, label: a }))}
          />
          <Input
            label="類型"
            placeholder={form.category === 6 ? '飯店' : '咖啡廳'}
            value={form.type || ''}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />
        </div>

        {/* 地址 + 搜尋 */}
        <div>
          <span className="block text-xs font-display font-semibold text-usuzumi mb-1.5 tracking-wider">📍 地址（必設位置）</span>
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="輸入地址或景點名"
              value={form.address || ''}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="flex-1 form-input"
            />
            <button
              type="button"
              onClick={searchAddress}
              disabled={searching || (!form.address && !form.name_zh)}
              className="flex-shrink-0 px-3 py-2 transition-all"
              style={{
                background: '#FF8B5A',
                color: '#FAF6EC',
                border: '1.5px solid #3D2817',
                opacity: (searching || (!form.address && !form.name_zh)) ? 0.5 : 1,
              }}
            >
              <Search size={14} />
            </button>
          </div>

          {/* 搜尋結果 */}
          {searchResults.length > 0 && (
            <div className="mt-2 paper-plain" style={{ border: '1.5px solid #3D2817' }}>
              <div className="text-[10px] text-usuzumi font-mono px-2 py-1 border-b border-dashed border-gold">
                ★ 搜尋到 {searchResults.length} 個位置，點選使用：
              </div>
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePickResult(r)}
                  className="w-full text-left px-2 py-2 hover:bg-shu/10 border-b border-dashed border-gold/50 last:border-b-0 text-xs"
                >
                  <div className="font-display truncate">{r.display_name}</div>
                  <div className="text-[10px] text-usuzumi font-mono">
                    {parseFloat(r.lat).toFixed(4)}, {parseFloat(r.lon).toFixed(4)}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 已選位置 */}
          {form.lat && form.lng && (
            <div className="mt-2 paper-plain p-2 flex items-center gap-2 text-xs"
              style={{ border: '1.5px dashed #7FA468' }}>
              <MapPin size={12} className="text-wakaba" />
              <span className="font-mono">
                ✓ 已設定位置：{form.lat.toFixed(4)}, {form.lng.toFixed(4)}
              </span>
            </div>
          )}
        </div>

        {/* 簡介 */}
        <div>
          <span className="block text-xs font-display font-semibold text-usuzumi mb-1.5 tracking-wider">✎ 簡介（選填）</span>
          <textarea
            rows={2}
            placeholder={form.category === 6 ? '例：上野駅前步行 3 分，含早餐' : '例：澀谷地標，年輕人潮流時尚百貨'}
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full form-input resize-none"
          />
        </div>

        {/* 進階：營業時間 / 價格 / 網站 */}
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="價格 / 房價（選填）"
            placeholder={form.category === 6 ? '¥8,000/晚' : '¥1,500'}
            value={form.price || ''}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <Input
            label="營業時間（選填）"
            placeholder={form.category === 6 ? 'check-in 15:00' : '10:00–22:00'}
            value={form.hours || ''}
            onChange={(e) => setForm({ ...form, hours: e.target.value })}
          />
        </div>

        <Input
          label="網站連結（選填）"
          placeholder="https://..."
          value={form.website || ''}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />

        {/* 按鈕 */}
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="shu" onClick={handleSubmit}>儲存</Button>
        </div>

        {/* 提示 */}
        <p className="text-[10px] text-usuzumi font-display italic leading-relaxed">
          ※ 自訂景點會出現在「{selectedCat?.name}」分類，所有使用者都看得到。<br />
          ※ 也會出現在「+ 加入行程」的選擇清單裡。
        </p>
      </div>
    </Modal>
  )
}
