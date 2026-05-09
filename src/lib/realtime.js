import { useEffect, useRef } from 'react'
import { supabase, hasSupabase } from './supabase'

/**
 * 訂閱單一 trip 內所有相關表的變更
 * onChange(eventInfo) 會在以下情況呼叫：
 *   - 別人改了東西（過濾掉自己的更動）
 * eventInfo: { table, eventType: 'INSERT'|'UPDATE'|'DELETE', new, old }
 */
export function useTripRealtime(tripId, userId, onChange) {
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  useEffect(() => {
    if (!hasSupabase || !tripId || tripId.startsWith('local-')) return

    const tables = [
      { name: 'itinerary_items', filter: `trip_id=eq.${tripId}` },
      { name: 'expenses', filter: `trip_id=eq.${tripId}` },
      { name: 'tax_free_items', filter: `trip_id=eq.${tripId}` },
      { name: 'checklist_items', filter: `trip_id=eq.${tripId}` },
      { name: 'trip_members', filter: `trip_id=eq.${tripId}` },
      { name: 'reactions', filter: `trip_id=eq.${tripId}` },
      { name: 'comments', filter: `trip_id=eq.${tripId}` },
    ]

    const channel = supabase.channel(`trip-${tripId}-${Date.now()}`)

    tables.forEach(({ name, filter }) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: name, filter }, (payload) => {
        const updaterField = payload.new?.updated_by || payload.new?.user_id || payload.new?.added_by
        // 自己的改動不通知（避免自己改自己看到通知）
        if (updaterField === userId) return

        if (onChangeRef.current) {
          onChangeRef.current({
            table: name,
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
          })
        }
      })
    })

    channel.subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tripId, userId])
}

/**
 * 訂閱「使用者所有行程列表」的變更（首頁用）
 */
export function useTripsRealtime(userId, onChange) {
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  useEffect(() => {
    if (!hasSupabase || !userId) return

    const channel = supabase
      .channel(`user-trips-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_members', filter: `user_id=eq.${userId}` }, () => {
        if (onChangeRef.current) onChangeRef.current()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => {
        if (onChangeRef.current) onChangeRef.current()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])
}
