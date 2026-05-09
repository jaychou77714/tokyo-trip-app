import React, { useState, useEffect, useRef } from 'react'
import { Map, Compass, Train, Wallet, User as UserIcon, Wrench } from 'lucide-react'
import { Toast, Modal, Button, Input } from './components/Common'
import { UpdateNotice } from './components/UpdateNotice'
import LoginScreen from './components/screens/LoginScreen'
import HomeScreen from './components/screens/HomeScreen'
import TripDetailScreen from './components/screens/TripDetailScreen'
import PlacesScreen from './components/screens/PlacesScreen'
import StationsScreen from './components/screens/StationsScreen'
import BudgetScreen from './components/screens/BudgetScreen'
import ProfileScreen from './components/screens/ProfileScreen'
import PlaceDetailModal from './components/screens/PlaceDetailModal'
import ToolsScreen from './components/screens/ToolsScreen'
import ChecklistScreen from './components/screens/ChecklistScreen'
import JrPassScreen from './components/screens/JrPassScreen'
import {
  getUser, clearUser, listTrips, listFavorites, toggleFavorite,
  saveItineraryItem, findTripByShareCode, joinTrip, fetchVersionInfo,
} from './lib/storage'
import { hasSupabase, supabase } from './lib/supabase'
import { setUser as saveUser } from './lib/storage'

const VERSION_CHECK_INTERVAL = 5 * 60 * 1000 // 5 分鐘

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('home')
  const [toolView, setToolView] = useState(null)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [trips, setTrips] = useState([])
  const [favorites, setFavorites] = useState([])
  const [budgetTripId, setBudgetTripId] = useState(null)
  const [toast, setToast] = useState({ message: '', type: 'info' })
  const [globalPlaceModal, setGlobalPlaceModal] = useState(null)

  // 共編
  const [joinPending, setJoinPending] = useState(null)
  const [joinNickname, setJoinNickname] = useState('')

  // 版本檢查
  const [appVersion, setAppVersion] = useState(null)        // 啟動時的版本
  const [latestVersion, setLatestVersion] = useState(null)  // 最新版本
  const [hasUpdate, setHasUpdate] = useState(false)

  useEffect(() => {
    parseJoinUrl()
    const u = getUser()
    if (u) { setUser(u); loadUserData(u) }
    initVersionCheck()
  }, [])

  // ===== 版本檢查 =====
  async function initVersionCheck() {
    const info = await fetchVersionInfo()
    if (info?.version) {
      setAppVersion(info.version)
      setLatestVersion(info.version)
    }
    // 啟動 5 分鐘輪詢
    const intervalId = setInterval(checkForUpdate, VERSION_CHECK_INTERVAL)
    return () => clearInterval(intervalId)
  }

  async function checkForUpdate() {
    const info = await fetchVersionInfo()
    if (info?.version && appVersion && info.version !== appVersion) {
      setLatestVersion(info.version)
      setHasUpdate(true)
    }
  }

  function handleReload() {
    window.location.reload()
  }

  async function parseJoinUrl() {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('join')
    if (!code || !hasSupabase) return
    const trip = await findTripByShareCode(code)
    if (trip) setJoinPending(trip)
  }

  async function loadUserData(u) {
    const [t, f] = await Promise.all([listTrips(u.id), listFavorites(u.id)])
    setTrips(t); setFavorites(f)
  }

  function showToast(message, type = 'info') {
    setToast({ message, type })
  }

  async function handleLogin(u) {
    setUser(u)
    await loadUserData(u)
    showToast(`歡迎回來，${u.nickname}！`, 'success')
  }

  function handleLogout() {
    clearUser()
    setUser(null); setSelectedTrip(null); setTrips([]); setFavorites([])
    setView('home'); setToolView(null)
  }

  async function handleToggleFavorite(placeId) {
    const isNow = await toggleFavorite(placeId, user.id)
    const f = await listFavorites(user.id)
    setFavorites(f)
    showToast(isNow ? '★ 已加入收藏' : '☆ 已移除收藏', 'success')
  }

  function handleSelectTrip(trip) {
    setSelectedTrip(trip); setView('trip')
  }

  async function handleAddPlaceToTrip(place) {
    if (!selectedTrip) {
      showToast('請先建立或選擇行程', 'error')
      setView('home'); return
    }
    await saveItineraryItem({
      place_id: place.id, day_number: 1, order_index: 999, duration_min: 60,
    }, selectedTrip.id, user.id)
    showToast(`✿ 已加入「${selectedTrip.title}」`, 'success')
    setView('trip')
  }

  function handleSwitchView(newView) {
    setView(newView); setToolView(null)
  }

  async function handleConfirmJoin() {
    if (!user) {
      const trimmed = joinNickname.trim()
      if (!trimmed) { showToast('請輸入暱稱', 'error'); return }
      let newUser = { id: null, nickname: trimmed }
      if (hasSupabase) {
        const { data: existing } = await supabase
          .from('users').select('*').eq('nickname', trimmed).limit(1).maybeSingle()
        if (existing) newUser = existing
        else {
          const { data: created } = await supabase
            .from('users').insert({ nickname: trimmed }).select().single()
          if (created) newUser = created
        }
      }
      saveUser(newUser); setUser(newUser)
      const result = await joinTrip(joinPending.id, newUser.id)
      if (result.success) {
        await loadUserData(newUser)
        showToast(result.alreadyMember ? '你已經是成員了' : `✿ 已加入「${joinPending.title}」`, 'success')
        const updatedTrips = await listTrips(newUser.id)
        setTrips(updatedTrips)
        const trip = updatedTrips.find(t => t.id === joinPending.id)
        if (trip) { setSelectedTrip(trip); setView('trip') }
      } else {
        showToast(result.error || '加入失敗', 'error')
      }
    } else {
      const result = await joinTrip(joinPending.id, user.id)
      if (result.success) {
        showToast(result.alreadyMember ? '你已經是成員了' : `✿ 已加入「${joinPending.title}」`, 'success')
        const updatedTrips = await listTrips(user.id)
        setTrips(updatedTrips)
        const trip = updatedTrips.find(t => t.id === joinPending.id)
        if (trip) { setSelectedTrip(trip); setView('trip') }
      } else {
        showToast(result.error || '加入失敗', 'error')
      }
    }
    window.history.replaceState({}, '', window.location.pathname)
    setJoinPending(null); setJoinNickname('')
  }

  function handleCancelJoin() {
    window.history.replaceState({}, '', window.location.pathname)
    setJoinPending(null); setJoinNickname('')
  }

  useEffect(() => {
    if (user && (view === 'budget' || view === 'tools')) listTrips(user.id).then(setTrips)
  }, [view])

  function refreshTrips() {
    if (user) listTrips(user.id).then(setTrips)
  }

  if (!user) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} pendingJoin={joinPending} />
        <JoinTripModal
          open={!!joinPending && !user}
          trip={joinPending}
          nickname={joinNickname}
          setNickname={setJoinNickname}
          isLoggedIn={false}
          onConfirm={handleConfirmJoin}
          onCancel={handleCancelJoin}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      <UpdateNotice
        visible={hasUpdate}
        currentVersion={appVersion}
        newVersion={latestVersion}
        onReload={handleReload}
      />

      {view === 'home' && <HomeScreen user={user} trips={trips} appVersion={appVersion} onSelectTrip={handleSelectTrip} showToast={showToast} onRefresh={refreshTrips} />}
      {view === 'trip' && selectedTrip && (
        <TripDetailScreen
          trip={selectedTrip}
          user={user}
          onBack={() => { setSelectedTrip(null); setView('home') }}
          showToast={showToast}
          onAddFromPlaces={() => setView('places')}
        />
      )}
      {view === 'places' && (
        <PlacesScreen favorites={favorites} onToggleFavorite={handleToggleFavorite}
          user={user} showToast={showToast}
          onAddToTrip={selectedTrip ? handleAddPlaceToTrip : null} />
      )}
      {view === 'stations' && <StationsScreen onSelectPlace={setGlobalPlaceModal} />}
      {view === 'budget' && (
        <BudgetScreen trips={trips} user={user}
          selectedTripId={budgetTripId || trips[0]?.id}
          onSelectTrip={setBudgetTripId} showToast={showToast} />
      )}
      {view === 'tools' && !toolView && <ToolsScreen onNavigate={(toolId) => setToolView(toolId)} />}
      {view === 'tools' && toolView === 'checklist' && (
        <ChecklistScreen trips={trips} user={user} onBack={() => setToolView(null)} showToast={showToast} />
      )}
      {view === 'tools' && toolView === 'jrpass' && (
        <JrPassScreen trips={trips} onBack={() => setToolView(null)} showToast={showToast} />
      )}
      {view === 'profile' && (
        <ProfileScreen
          user={user} favorites={favorites} appVersion={appVersion}
          onLogout={handleLogout} onSelectPlace={setGlobalPlaceModal}
          onUserUpdate={(newUser) => { setUser(newUser); refreshTrips() }}
          showToast={showToast}
        />
      )}

      <PlaceDetailModal
        open={!!globalPlaceModal} place={globalPlaceModal}
        onClose={() => setGlobalPlaceModal(null)}
        isFavorite={globalPlaceModal ? favorites.some(f => f.place_id === globalPlaceModal.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onAddToTrip={selectedTrip ? (p) => { handleAddPlaceToTrip(p); setGlobalPlaceModal(null) } : null}
      />

      <JoinTripModal
        open={!!joinPending && !!user}
        trip={joinPending} isLoggedIn={true} currentUser={user}
        onConfirm={handleConfirmJoin} onCancel={handleCancelJoin}
      />

      <TabBar view={view} onChange={handleSwitchView} />
    </div>
  )
}

function JoinTripModal({ open, trip, nickname, setNickname, isLoggedIn, currentUser, onConfirm, onCancel }) {
  if (!open || !trip) return null
  return (
    <Modal open={open} onClose={onCancel} title="✿ 受邀加入行程" maxWidth="max-w-sm">
      <div className="px-5 py-4">
        <div className="paper-plain p-4 mb-4" style={{ border: '1.5px dashed #6B4423' }}>
          <div className="text-[11px] text-usuzumi tracking-widest uppercase font-mono mb-1">★ INVITATION ★</div>
          <h3 className="editorial-title text-xl">{trip.title}</h3>
          <div className="text-xs text-usuzumi mt-1 font-display">
            {trip.days || 1} 日行程 · 邀請碼 {trip.share_code}
          </div>
        </div>
        {!isLoggedIn ? (
          <>
            <p className="text-sm font-display mb-3">輸入你的暱稱加入這個行程：</p>
            <Input
              placeholder="例：太郎"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
            />
          </>
        ) : (
          <p className="text-sm font-display">
            以「<span className="font-bold text-shu">{currentUser.nickname}</span>」身份加入這個行程？
          </p>
        )}
        <div className="flex gap-2 justify-end mt-5">
          <Button variant="ghost" onClick={onCancel}>取消</Button>
          <Button variant="shu" onClick={onConfirm}>✿ 加入</Button>
        </div>
      </div>
    </Modal>
  )
}

function TabBar({ view, onChange }) {
  const tabs = [
    { id: 'home', label: '行程', jp: '旅', icon: Map },
    { id: 'places', label: '景點', jp: '名所', icon: Compass },
    { id: 'stations', label: '站點', jp: '駅', icon: Train },
    { id: 'budget', label: '預算', jp: '会計', icon: Wallet },
    { id: 'tools', label: '工具', jp: '道具', icon: Wrench },
    { id: 'profile', label: '我的', jp: '私', icon: UserIcon },
  ]
  const displayView = view === 'trip' ? 'home' : view
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: '#FFFCF5',
        borderTop: '2px solid #3D2817',
        boxShadow: '0 -2px 0 rgba(212, 184, 150, 0.4), 0 -8px 20px rgba(61, 40, 23, 0.05)',
      }}>
      <div className="max-w-3xl mx-auto flex relative">
        {tabs.map((t) => {
          const Icon = t.icon
          const active = displayView === t.id
          return (
            <button key={t.id} onClick={() => onChange(t.id)}
              className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all relative ${
                active ? 'text-shu' : 'text-usuzumi hover:text-sumi'
              }`}>
              {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1.5" style={{ background: '#FF8B5A' }} />}
              <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-display font-semibold tracking-wider">{t.jp}</span>
              <span className="text-[8.5px] tracking-wider opacity-70">{t.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
