import { supabase, hasSupabase } from './supabase'
import { generateShareCode, MEMBER_COLORS, getNextColor } from '../data/members'

const LS_PREFIX = 'tokyo_trip_'

// ===== 使用者 =====
export function getUser() {
  const raw = localStorage.getItem(`${LS_PREFIX}user`)
  return raw ? JSON.parse(raw) : null
}
export function setUser(user) {
  localStorage.setItem(`${LS_PREFIX}user`, JSON.stringify(user))
}
export function clearUser() {
  localStorage.removeItem(`${LS_PREFIX}user`)
}

export async function updateNickname(userId, newNickname) {
  if (!hasSupabase) {
    const u = getUser()
    if (u) { u.nickname = newNickname; setUser(u) }
    return { success: true }
  }

  const trimmed = newNickname.trim()
  if (!trimmed) return { success: false, error: '暱稱不能空白' }

  const { data: existing } = await supabase
    .from('users').select('id').eq('nickname', trimmed)
    .neq('id', userId).limit(1).maybeSingle()
  if (existing) return { success: false, error: '這個暱稱已被使用' }

  const { data, error } = await supabase
    .from('users').update({ nickname: trimmed }).eq('id', userId).select().single()
  if (error) return { success: false, error: error.message }

  setUser(data)
  return { success: true, user: data }
}

function localGet(key, defaultValue) {
  try {
    const raw = localStorage.getItem(`${LS_PREFIX}${key}`)
    return raw ? JSON.parse(raw) : defaultValue
  } catch { return defaultValue }
}
function localSet(key, value) {
  localStorage.setItem(`${LS_PREFIX}${key}`, JSON.stringify(value))
}

// ============================================
// 行程 trips - v1.4.1 修復「孤兒行程消失」bug
// ============================================
/**
 * 列出我能看到的所有行程：
 * (A) 我建立的（user_id = me）
 * (B) 我是成員的（trip_members）
 * = A ∪ B（去重）
 *
 * 修復前：先查 B，沒有才 fallback A → 如果 B 有任何一筆，A 的孤兒行程就消失
 */
export async function listTrips(userId) {
  if (hasSupabase && userId) {
    try {
      // 同時抓兩邊
      const [memberRowsResult, ownTripsResult] = await Promise.all([
        supabase.from('trip_members').select('trip_id').eq('user_id', userId),
        supabase.from('trips').select('*').eq('user_id', userId),
      ])

      const memberTripIds = (memberRowsResult.data || []).map(r => r.trip_id)
      let memberTrips = []
      if (memberTripIds.length > 0) {
        const { data } = await supabase.from('trips').select('*').in('id', memberTripIds)
        memberTrips = data || []
      }

      // 合併並用 Map 去重（以 id 為 key）
      const ownTrips = ownTripsResult.data || []
      const merged = new Map()
      ;[...ownTrips, ...memberTrips].forEach(t => {
        if (t && t.id) merged.set(t.id, t)
      })
      const all = Array.from(merged.values())
      all.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      return all
    } catch (err) {
      console.error('[listTrips] error:', err)
    }
  }
  return localGet(`trips_${userId}`, [])
}

export async function saveTrip(trip, userId) {
  const isNew = !trip.id
  const tripData = { ...trip, user_id: userId, updated_at: new Date().toISOString() }
  if (isNew) {
    tripData.share_code = generateShareCode()
    tripData.owner_id = userId
  }

  if (hasSupabase && userId) {
    if (tripData.id) {
      // 更新既有
      const { data, error } = await supabase.from('trips').update(tripData).eq('id', tripData.id).select().single()
      if (error) console.error('[saveTrip] update failed:', error)
      if (data) return data
    } else {
      // 新建
      const { data, error } = await supabase.from('trips').insert(tripData).select().single()
      if (error) {
        console.error('[saveTrip] insert trip failed:', error)
      }
      if (data) {
        // 把建立者加進 trip_members
        const { error: memberError } = await supabase.from('trip_members').insert({
          trip_id: data.id, user_id: userId, role: 'owner', color: MEMBER_COLORS[0],
        })
        if (memberError) {
          // 即使 trip_members 失敗，trips 表已有，listTrips 用聯集仍能抓到
          console.error('[saveTrip] trip_members insert failed (trip 仍正常建立):', memberError)
        }
        return data
      }
    }
  }

  // 雲端失敗或沒有 → 本地 fallback
  console.warn('[saveTrip] fallback to localStorage')
  const trips = localGet(`trips_${userId}`, [])
  if (tripData.id) {
    const idx = trips.findIndex(t => t.id === tripData.id)
    if (idx >= 0) trips[idx] = tripData
  } else {
    tripData.id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    tripData.created_at = new Date().toISOString()
    trips.unshift(tripData)
  }
  localSet(`trips_${userId}`, trips)
  return tripData
}

export async function deleteTrip(tripId, userId) {
  if (hasSupabase && !tripId.startsWith('local-')) {
    await supabase.from('trips').delete().eq('id', tripId)
  }
  const trips = localGet(`trips_${userId}`, []).filter(t => t.id !== tripId)
  localSet(`trips_${userId}`, trips)
}

export async function findTripByShareCode(shareCode) {
  if (!hasSupabase) return null
  const { data } = await supabase
    .from('trips').select('*').eq('share_code', shareCode.toUpperCase()).maybeSingle()
  return data
}

/**
 * 修復「孤兒行程」：把 trips 表裡 user_id = me 但不在 trip_members 的行程，補進 trip_members
 * 用於診斷 / 一鍵修復用
 */
export async function repairOrphanTrips(userId) {
  if (!hasSupabase || !userId) return { repaired: 0 }

  const [{ data: ownTrips }, { data: memberRows }] = await Promise.all([
    supabase.from('trips').select('id, title').eq('user_id', userId),
    supabase.from('trip_members').select('trip_id').eq('user_id', userId),
  ])

  const inMembers = new Set((memberRows || []).map(m => m.trip_id))
  const orphans = (ownTrips || []).filter(t => !inMembers.has(t.id))

  let repaired = 0
  for (const orphan of orphans) {
    const { error } = await supabase.from('trip_members').insert({
      trip_id: orphan.id, user_id: userId, role: 'owner', color: MEMBER_COLORS[0],
    })
    if (!error) repaired++
  }
  return { repaired, orphans: orphans.map(o => o.title) }
}

// ============================================
// 成員管理
// ============================================
export async function listTripMembers(tripId) {
  if (!hasSupabase || tripId.startsWith('local-')) return []
  const { data: memberRows } = await supabase
    .from('trip_members').select('*').eq('trip_id', tripId)
  if (!memberRows || memberRows.length === 0) return []
  const userIds = memberRows.map(m => m.user_id)
  const { data: users } = await supabase
    .from('users').select('id, nickname').in('id', userIds)
  return memberRows.map(m => ({
    ...m,
    user: users?.find(u => u.id === m.user_id) || { nickname: '?' },
  })).sort((a, b) => {
    if (a.role === 'owner' && b.role !== 'owner') return -1
    if (b.role === 'owner' && a.role !== 'owner') return 1
    return new Date(a.joined_at) - new Date(b.joined_at)
  })
}

export async function joinTrip(tripId, userId) {
  if (!hasSupabase || tripId.startsWith('local-')) return { success: false, error: '本地模式無法共編' }
  const { data: existing } = await supabase
    .from('trip_members').select('id').eq('trip_id', tripId).eq('user_id', userId).maybeSingle()
  if (existing) return { success: true, alreadyMember: true }
  const { data: members } = await supabase
    .from('trip_members').select('color').eq('trip_id', tripId)
  const usedColors = (members || []).map(m => m.color)
  const newColor = getNextColor(usedColors)
  const { data, error } = await supabase
    .from('trip_members').insert({ trip_id: tripId, user_id: userId, role: 'editor', color: newColor }).select().single()
  if (error) return { success: false, error: error.message }
  return { success: true, member: data }
}

// ============================================
// 行程項目 itinerary
// ============================================
export async function listItinerary(tripId) {
  if (hasSupabase && !tripId.startsWith('local-')) {
    const { data } = await supabase.from('itinerary_items').select('*').eq('trip_id', tripId)
      .order('day_number').order('order_index')
    if (data) { localSet(`itinerary_${tripId}`, data); return data }
  }
  return localGet(`itinerary_${tripId}`, [])
}

export async function saveItineraryItem(item, tripId, userId) {
  const itemData = { ...item, trip_id: tripId, updated_by: userId, updated_at: new Date().toISOString() }
  if (hasSupabase && !tripId.startsWith('local-')) {
    if (itemData.id && !itemData.id.startsWith('local-')) {
      const { data } = await supabase.from('itinerary_items').update(itemData).eq('id', itemData.id).select().single()
      if (data) return data
    } else {
      delete itemData.id
      itemData.added_by = userId
      const { data } = await supabase.from('itinerary_items').insert(itemData).select().single()
      if (data) return data
    }
  }
  const items = localGet(`itinerary_${tripId}`, [])
  if (itemData.id) {
    const idx = items.findIndex(i => i.id === itemData.id)
    if (idx >= 0) items[idx] = itemData
  } else {
    itemData.id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    itemData.added_by = userId
    items.push(itemData)
  }
  localSet(`itinerary_${tripId}`, items)
  return itemData
}

export async function deleteItineraryItem(itemId, tripId) {
  if (hasSupabase && !itemId.startsWith('local-')) {
    await supabase.from('itinerary_items').delete().eq('id', itemId)
  }
  const items = localGet(`itinerary_${tripId}`, []).filter(i => i.id !== itemId)
  localSet(`itinerary_${tripId}`, items)
}

// ============================================
// 收藏
// ============================================
export async function listFavorites(userId) {
  if (hasSupabase && userId) {
    const { data } = await supabase.from('favorites').select('*').eq('user_id', userId)
    if (data) { localSet(`favs_${userId}`, data); return data }
  }
  return localGet(`favs_${userId}`, [])
}

export async function toggleFavorite(placeId, userId) {
  const current = localGet(`favs_${userId}`, [])
  const exists = current.find(f => f.place_id === placeId)
  if (exists) {
    if (hasSupabase) await supabase.from('favorites').delete().eq('user_id', userId).eq('place_id', placeId)
    const next = current.filter(f => f.place_id !== placeId)
    localSet(`favs_${userId}`, next)
    return false
  } else {
    const newFav = { user_id: userId, place_id: placeId, created_at: new Date().toISOString() }
    if (hasSupabase) {
      const { data } = await supabase.from('favorites').insert(newFav).select().single()
      if (data) { current.push(data); localSet(`favs_${userId}`, current); return true }
    }
    current.push({ ...newFav, id: `local-${Date.now()}` })
    localSet(`favs_${userId}`, current)
    return true
  }
}

// ============================================
// 花費 / 退稅
// ============================================
export async function listExpenses(tripId) {
  if (hasSupabase && !tripId.startsWith('local-')) {
    const { data } = await supabase.from('expenses').select('*').eq('trip_id', tripId).order('date', { ascending: false })
    if (data) { localSet(`expenses_${tripId}`, data); return data }
  }
  return localGet(`expenses_${tripId}`, [])
}

export async function saveExpense(expense, tripId, userId) {
  const data = { ...expense, trip_id: tripId, updated_by: userId, updated_at: new Date().toISOString() }
  if (hasSupabase && !tripId.startsWith('local-')) {
    if (data.id && !data.id.startsWith('local-')) {
      const { data: res } = await supabase.from('expenses').update(data).eq('id', data.id).select().single()
      if (res) return res
    } else {
      delete data.id
      data.added_by = userId
      const { data: res } = await supabase.from('expenses').insert(data).select().single()
      if (res) return res
    }
  }
  const list = localGet(`expenses_${tripId}`, [])
  if (data.id) {
    const idx = list.findIndex(e => e.id === data.id)
    if (idx >= 0) list[idx] = data
  } else {
    data.id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    data.added_by = userId
    data.created_at = new Date().toISOString()
    list.unshift(data)
  }
  localSet(`expenses_${tripId}`, list)
  return data
}

export async function deleteExpense(expenseId, tripId) {
  if (hasSupabase && !expenseId.startsWith('local-')) {
    await supabase.from('expenses').delete().eq('id', expenseId)
  }
  const list = localGet(`expenses_${tripId}`, []).filter(e => e.id !== expenseId)
  localSet(`expenses_${tripId}`, list)
}

export async function listTaxFree(tripId) {
  if (hasSupabase && !tripId.startsWith('local-')) {
    const { data } = await supabase.from('tax_free_items').select('*').eq('trip_id', tripId).order('date', { ascending: false })
    if (data) { localSet(`taxfree_${tripId}`, data); return data }
  }
  return localGet(`taxfree_${tripId}`, [])
}

export async function saveTaxFree(item, tripId, userId) {
  const data = { ...item, trip_id: tripId, updated_by: userId, updated_at: new Date().toISOString() }
  if (hasSupabase && !tripId.startsWith('local-')) {
    if (data.id && !data.id.startsWith('local-')) {
      const { data: res } = await supabase.from('tax_free_items').update(data).eq('id', data.id).select().single()
      if (res) return res
    } else {
      delete data.id
      data.added_by = userId
      const { data: res } = await supabase.from('tax_free_items').insert(data).select().single()
      if (res) return res
    }
  }
  const list = localGet(`taxfree_${tripId}`, [])
  if (data.id) {
    const idx = list.findIndex(i => i.id === data.id)
    if (idx >= 0) list[idx] = data
  } else {
    data.id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    data.added_by = userId
    data.created_at = new Date().toISOString()
    list.unshift(data)
  }
  localSet(`taxfree_${tripId}`, list)
  return data
}

export async function deleteTaxFree(id, tripId) {
  if (hasSupabase && !id.startsWith('local-')) {
    await supabase.from('tax_free_items').delete().eq('id', id)
  }
  const list = localGet(`taxfree_${tripId}`, []).filter(i => i.id !== id)
  localSet(`taxfree_${tripId}`, list)
}

// ===== IC 卡 =====
export function getICCards(userId) { return localGet(`ic_${userId}`, []) }
export function saveICCards(userId, cards) { localSet(`ic_${userId}`, cards) }

// ===== 自訂景點（v1.5：公共共享池）=====
// 所有使用者共用同一份自訂景點清單
export async function listCustomPlaces(userId) {
  if (hasSupabase) {
    const { data } = await supabase.from('custom_places').select('*').order('created_at', { ascending: false })
    if (data) { localSet(`custom_places_all`, data); return data }
  }
  return localGet(`custom_places_all`, [])
}

export async function saveCustomPlace(place, userId) {
  const data = { ...place }
  if (hasSupabase) {
    if (data.id && !data.id.startsWith('local-')) {
      const { data: res } = await supabase.from('custom_places').update(data).eq('id', data.id).select().single()
      if (res) return res
    } else {
      delete data.id
      data.created_by = userId
      data.user_id = userId  // 保留舊欄位相容
      const { data: res } = await supabase.from('custom_places').insert(data).select().single()
      if (res) {
        const list = localGet(`custom_places_all`, [])
        list.unshift(res); localSet(`custom_places_all`, list)
        return res
      }
    }
  }
  // 本地後備
  const list = localGet(`custom_places_all`, [])
  if (!data.id) {
    data.id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    data.created_by = userId
    data.created_at = new Date().toISOString()
  }
  const idx = list.findIndex(p => p.id === data.id)
  if (idx >= 0) list[idx] = data; else list.unshift(data)
  localSet(`custom_places_all`, list)
  return data
}

export async function deleteCustomPlace(id, userId) {
  if (hasSupabase && !id.startsWith('local-')) {
    await supabase.from('custom_places').delete().eq('id', id)
  }
  const list = localGet(`custom_places_all`, []).filter(p => p.id !== id)
  localSet(`custom_places_all`, list)
}

// ============================================
// Checklist
// ============================================
export async function listChecklist(tripId) {
  if (hasSupabase && !tripId.startsWith('local-')) {
    const { data } = await supabase.from('checklist_items').select('*').eq('trip_id', tripId).order('sort_order')
    if (data) { localSet(`checklist_${tripId}`, data); return data }
  }
  return localGet(`checklist_${tripId}`, [])
}

export async function saveChecklistItem(item, tripId, userId) {
  const data = { ...item, trip_id: tripId, updated_by: userId, updated_at: new Date().toISOString() }
  if (hasSupabase && !tripId.startsWith('local-')) {
    if (data.id && !data.id.startsWith('local-')) {
      const { data: res } = await supabase.from('checklist_items').update(data).eq('id', data.id).select().single()
      if (res) return res
    } else {
      delete data.id
      data.added_by = userId
      const { data: res } = await supabase.from('checklist_items').insert(data).select().single()
      if (res) return res
    }
  }
  const list = localGet(`checklist_${tripId}`, [])
  if (!data.id) {
    data.id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    data.added_by = userId
  }
  const idx = list.findIndex(i => i.id === data.id)
  if (idx >= 0) list[idx] = data; else list.push(data)
  localSet(`checklist_${tripId}`, list)
  return data
}

export async function deleteChecklistItem(id, tripId) {
  if (hasSupabase && !id.startsWith('local-')) {
    await supabase.from('checklist_items').delete().eq('id', id)
  }
  const list = localGet(`checklist_${tripId}`, []).filter(i => i.id !== id)
  localSet(`checklist_${tripId}`, list)
}

export async function bulkInsertChecklist(items, tripId, userId) {
  const enriched = items.map(item => ({
    ...item, added_by: userId, updated_by: userId,
    updated_at: new Date().toISOString(),
  }))
  if (hasSupabase && !tripId.startsWith('local-')) {
    const { data } = await supabase.from('checklist_items').insert(enriched).select()
    if (data) { localSet(`checklist_${tripId}`, data); return data }
  }
  const local = enriched.map(item => ({
    ...item,
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${item.sort_order}`,
  }))
  localSet(`checklist_${tripId}`, local)
  return local
}

export async function clearChecklist(tripId) {
  if (hasSupabase && !tripId.startsWith('local-')) {
    await supabase.from('checklist_items').delete().eq('trip_id', tripId)
  }
  localSet(`checklist_${tripId}`, [])
}

// ============================================
// 表態 reactions
// ============================================
export async function listTripReactions(tripId) {
  if (!hasSupabase || tripId.startsWith('local-')) return []
  const { data } = await supabase.from('reactions').select('*').eq('trip_id', tripId)
  return data || []
}

export async function toggleReaction(itemType, itemId, tripId, emoji, userId) {
  if (!hasSupabase || tripId.startsWith('local-')) return null
  const { data: existing } = await supabase
    .from('reactions').select('id')
    .eq('item_type', itemType).eq('item_id', itemId)
    .eq('user_id', userId).eq('emoji', emoji).maybeSingle()

  if (existing) {
    await supabase.from('reactions').delete().eq('id', existing.id)
    return { action: 'removed' }
  } else {
    const { data } = await supabase.from('reactions').insert({
      item_type: itemType, item_id: itemId, trip_id: tripId,
      user_id: userId, emoji,
    }).select().single()
    return { action: 'added', reaction: data }
  }
}

// ============================================
// 留言 comments
// ============================================
export async function listComments(itemId) {
  if (!hasSupabase) return []
  const { data } = await supabase
    .from('comments').select('*').eq('item_id', itemId)
    .order('created_at', { ascending: true })
  return data || []
}

export async function listTripCommentCounts(tripId) {
  if (!hasSupabase || tripId.startsWith('local-')) return {}
  const { data } = await supabase
    .from('comments').select('item_id').eq('trip_id', tripId)
  const counts = {}
  ;(data || []).forEach(c => { counts[c.item_id] = (counts[c.item_id] || 0) + 1 })
  return counts
}

export async function addComment(comment, userId) {
  if (!hasSupabase || comment.trip_id?.startsWith?.('local-')) return null
  const { data } = await supabase.from('comments').insert({
    ...comment, user_id: userId,
  }).select().single()
  return data
}

export async function deleteComment(commentId) {
  if (!hasSupabase) return
  await supabase.from('comments').delete().eq('id', commentId)
}

// ============================================
// 版本檢查
// ============================================
export async function fetchVersionInfo() {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
