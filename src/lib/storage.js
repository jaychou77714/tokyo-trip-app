import { supabase, hasSupabase } from './supabase'

// localStorage key
const LS_PREFIX = 'tokyo_trip_'

// 暱稱 / 使用者
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

// 通用本地存取
function localGet(key, defaultValue) {
  try {
    const raw = localStorage.getItem(`${LS_PREFIX}${key}`)
    return raw ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}

function localSet(key, value) {
  localStorage.setItem(`${LS_PREFIX}${key}`, JSON.stringify(value))
}

// ===== 行程 trips =====
export async function listTrips(userId) {
  if (hasSupabase && userId) {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error && data) return data
  }
  return localGet(`trips_${userId}`, [])
}

export async function saveTrip(trip, userId) {
  const tripData = { ...trip, user_id: userId, updated_at: new Date().toISOString() }
  if (hasSupabase && userId) {
    if (tripData.id) {
      const { data } = await supabase.from('trips').update(tripData).eq('id', tripData.id).select().single()
      if (data) {
        const trips = localGet(`trips_${userId}`, [])
        const idx = trips.findIndex(t => t.id === data.id)
        if (idx >= 0) trips[idx] = data; else trips.push(data)
        localSet(`trips_${userId}`, trips)
        return data
      }
    } else {
      const { data } = await supabase.from('trips').insert(tripData).select().single()
      if (data) {
        const trips = localGet(`trips_${userId}`, [])
        trips.unshift(data)
        localSet(`trips_${userId}`, trips)
        return data
      }
    }
  }
  // 本地後備
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

// ===== 行程項目 itinerary_items =====
export async function listItinerary(tripId) {
  if (hasSupabase && !tripId.startsWith('local-')) {
    const { data } = await supabase
      .from('itinerary_items')
      .select('*')
      .eq('trip_id', tripId)
      .order('day_number', { ascending: true })
      .order('order_index', { ascending: true })
    if (data) {
      localSet(`itinerary_${tripId}`, data)
      return data
    }
  }
  return localGet(`itinerary_${tripId}`, [])
}

export async function saveItineraryItem(item, tripId) {
  const itemData = { ...item, trip_id: tripId }
  if (hasSupabase && !tripId.startsWith('local-')) {
    if (itemData.id && !itemData.id.startsWith('local-')) {
      const { data } = await supabase.from('itinerary_items').update(itemData).eq('id', itemData.id).select().single()
      if (data) {
        const items = localGet(`itinerary_${tripId}`, [])
        const idx = items.findIndex(i => i.id === data.id)
        if (idx >= 0) items[idx] = data; else items.push(data)
        localSet(`itinerary_${tripId}`, items)
        return data
      }
    } else {
      delete itemData.id
      const { data } = await supabase.from('itinerary_items').insert(itemData).select().single()
      if (data) {
        const items = localGet(`itinerary_${tripId}`, [])
        items.push(data)
        localSet(`itinerary_${tripId}`, items)
        return data
      }
    }
  }
  // 本地後備
  const items = localGet(`itinerary_${tripId}`, [])
  if (itemData.id) {
    const idx = items.findIndex(i => i.id === itemData.id)
    if (idx >= 0) items[idx] = itemData
  } else {
    itemData.id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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

// ===== 收藏 favorites =====
export async function listFavorites(userId) {
  if (hasSupabase && userId) {
    const { data } = await supabase.from('favorites').select('*').eq('user_id', userId)
    if (data) {
      localSet(`favs_${userId}`, data)
      return data
    }
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
      if (data) {
        current.push(data)
        localSet(`favs_${userId}`, current)
        return true
      }
    }
    current.push({ ...newFav, id: `local-${Date.now()}` })
    localSet(`favs_${userId}`, current)
    return true
  }
}

// ===== 花費 expenses =====
export async function listExpenses(tripId) {
  if (hasSupabase && !tripId.startsWith('local-')) {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('trip_id', tripId)
      .order('date', { ascending: false })
    if (data) {
      localSet(`expenses_${tripId}`, data)
      return data
    }
  }
  return localGet(`expenses_${tripId}`, [])
}

export async function saveExpense(expense, tripId) {
  const data = { ...expense, trip_id: tripId }
  if (hasSupabase && !tripId.startsWith('local-')) {
    if (data.id && !data.id.startsWith('local-')) {
      const { data: res } = await supabase.from('expenses').update(data).eq('id', data.id).select().single()
      if (res) {
        const list = localGet(`expenses_${tripId}`, [])
        const idx = list.findIndex(e => e.id === res.id)
        if (idx >= 0) list[idx] = res; else list.unshift(res)
        localSet(`expenses_${tripId}`, list)
        return res
      }
    } else {
      delete data.id
      const { data: res } = await supabase.from('expenses').insert(data).select().single()
      if (res) {
        const list = localGet(`expenses_${tripId}`, [])
        list.unshift(res)
        localSet(`expenses_${tripId}`, list)
        return res
      }
    }
  }
  const list = localGet(`expenses_${tripId}`, [])
  if (data.id) {
    const idx = list.findIndex(e => e.id === data.id)
    if (idx >= 0) list[idx] = data
  } else {
    data.id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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

// ===== 退稅紀錄 tax_free_items =====
export async function listTaxFree(tripId) {
  if (hasSupabase && !tripId.startsWith('local-')) {
    const { data } = await supabase.from('tax_free_items').select('*').eq('trip_id', tripId).order('date', { ascending: false })
    if (data) {
      localSet(`taxfree_${tripId}`, data)
      return data
    }
  }
  return localGet(`taxfree_${tripId}`, [])
}

export async function saveTaxFree(item, tripId) {
  const data = { ...item, trip_id: tripId }
  if (hasSupabase && !tripId.startsWith('local-')) {
    if (data.id && !data.id.startsWith('local-')) {
      const { data: res } = await supabase.from('tax_free_items').update(data).eq('id', data.id).select().single()
      if (res) {
        const list = localGet(`taxfree_${tripId}`, [])
        const idx = list.findIndex(i => i.id === res.id)
        if (idx >= 0) list[idx] = res; else list.unshift(res)
        localSet(`taxfree_${tripId}`, list)
        return res
      }
    } else {
      delete data.id
      const { data: res } = await supabase.from('tax_free_items').insert(data).select().single()
      if (res) {
        const list = localGet(`taxfree_${tripId}`, [])
        list.unshift(res)
        localSet(`taxfree_${tripId}`, list)
        return res
      }
    }
  }
  const list = localGet(`taxfree_${tripId}`, [])
  if (data.id) {
    const idx = list.findIndex(i => i.id === data.id)
    if (idx >= 0) list[idx] = data
  } else {
    data.id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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
export function getICCards(userId) {
  return localGet(`ic_${userId}`, [])
}
export function saveICCards(userId, cards) {
  localSet(`ic_${userId}`, cards)
}

// ===== 自訂景點 =====
export async function listCustomPlaces(userId) {
  if (hasSupabase && userId) {
    const { data } = await supabase.from('custom_places').select('*').eq('user_id', userId)
    if (data) {
      localSet(`custom_${userId}`, data)
      return data
    }
  }
  return localGet(`custom_${userId}`, [])
}

export async function saveCustomPlace(place, userId) {
  const data = { ...place, user_id: userId }
  if (hasSupabase) {
    if (data.id && !data.id.startsWith('local-')) {
      const { data: res } = await supabase.from('custom_places').update(data).eq('id', data.id).select().single()
      if (res) return res
    } else {
      delete data.id
      const { data: res } = await supabase.from('custom_places').insert(data).select().single()
      if (res) {
        const list = localGet(`custom_${userId}`, [])
        list.push(res)
        localSet(`custom_${userId}`, list)
        return res
      }
    }
  }
  const list = localGet(`custom_${userId}`, [])
  if (!data.id) data.id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const idx = list.findIndex(p => p.id === data.id)
  if (idx >= 0) list[idx] = data; else list.push(data)
  localSet(`custom_${userId}`, list)
  return data
}

export async function deleteCustomPlace(id, userId) {
  if (hasSupabase && !id.startsWith('local-')) {
    await supabase.from('custom_places').delete().eq('id', id)
  }
  const list = localGet(`custom_${userId}`, []).filter(p => p.id !== id)
  localSet(`custom_${userId}`, list)
}
