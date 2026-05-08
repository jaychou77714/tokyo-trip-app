import React, { useState, useEffect } from 'react'
import { Map, Compass, Train, Wallet, User as UserIcon } from 'lucide-react'
import { Toast } from './components/Common'
import LoginScreen from './components/screens/LoginScreen'
import HomeScreen from './components/screens/HomeScreen'
import TripDetailScreen from './components/screens/TripDetailScreen'
import PlacesScreen from './components/screens/PlacesScreen'
import StationsScreen from './components/screens/StationsScreen'
import BudgetScreen from './components/screens/BudgetScreen'
import ProfileScreen from './components/screens/ProfileScreen'
import PlaceDetailModal from './components/screens/PlaceDetailModal'
import { getUser, clearUser, listTrips, listFavorites, toggleFavorite, saveItineraryItem } from './lib/storage'

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('home') // home | trip | places | stations | budget | profile
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [trips, setTrips] = useState([])
  const [favorites, setFavorites] = useState([])
  const [budgetTripId, setBudgetTripId] = useState(null)
  const [toast, setToast] = useState({ message: '', type: 'info' })
  const [globalPlaceModal, setGlobalPlaceModal] = useState(null)

  // 初始化：從 localStorage 載入暱稱
  useEffect(() => {
    const u = getUser()
    if (u) {
      setUser(u)
      loadUserData(u)
    }
  }, [])

  async function loadUserData(u) {
    const [t, f] = await Promise.all([listTrips(u.id), listFavorites(u.id)])
    setTrips(t)
    setFavorites(f)
  }

  function showToast(message, type = 'info') {
    setToast({ message, type })
  }

  function handleLogin(u) {
    setUser(u)
    loadUserData(u)
    showToast(`歡迎，${u.nickname}!`, 'success')
  }

  function handleLogout() {
    clearUser()
    setUser(null)
    setSelectedTrip(null)
    setTrips([])
    setFavorites([])
    setView('home')
  }

  async function handleToggleFavorite(placeId) {
    const isNow = await toggleFavorite(placeId, user.id)
    const f = await listFavorites(user.id)
    setFavorites(f)
    showToast(isNow ? '已加入收藏' : '已移除收藏', 'success')
  }

  function handleSelectTrip(trip) {
    setSelectedTrip(trip)
    setView('trip')
  }

  // 從景點頁加入行程
  async function handleAddPlaceToTrip(place) {
    if (!selectedTrip) {
      // 沒選行程就建立 - 引導去首頁
      showToast('請先在首頁建立或選擇行程', 'error')
      setView('home')
      return
    }
    // 加入到行程的 day 1
    await saveItineraryItem({
      place_id: place.id,
      day_number: 1,
      order_index: 999,
      duration_min: 60,
    }, selectedTrip.id)
    showToast(`已加入「${selectedTrip.title}」Day 1`, 'success')
    setView('trip')
  }

  // 重新整理 trips（從 budget 切換時可能需要）
  useEffect(() => {
    if (user && view === 'budget') {
      listTrips(user.id).then(setTrips)
    }
  }, [view])

  if (!user) return <LoginScreen onLogin={handleLogin} />

  return (
    <div className="min-h-screen">
      {/* Toast */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />

      {/* 主內容 */}
      {view === 'home' && (
        <HomeScreen user={user} onSelectTrip={handleSelectTrip} showToast={showToast} />
      )}
      {view === 'trip' && selectedTrip && (
        <TripDetailScreen
          trip={selectedTrip}
          onBack={() => { setSelectedTrip(null); setView('home') }}
          showToast={showToast}
          onAddFromPlaces={() => setView('places')}
        />
      )}
      {view === 'places' && (
        <PlacesScreen
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onAddToTrip={selectedTrip ? handleAddPlaceToTrip : null}
        />
      )}
      {view === 'stations' && (
        <StationsScreen onSelectPlace={setGlobalPlaceModal} />
      )}
      {view === 'budget' && (
        <BudgetScreen
          trips={trips}
          selectedTripId={budgetTripId || trips[0]?.id}
          onSelectTrip={setBudgetTripId}
          showToast={showToast}
        />
      )}
      {view === 'profile' && (
        <ProfileScreen
          user={user}
          favorites={favorites}
          onLogout={handleLogout}
          onSelectPlace={setGlobalPlaceModal}
        />
      )}

      {/* 共用景點詳情 */}
      <PlaceDetailModal
        open={!!globalPlaceModal}
        place={globalPlaceModal}
        onClose={() => setGlobalPlaceModal(null)}
        isFavorite={globalPlaceModal ? favorites.some(f => f.place_id === globalPlaceModal.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onAddToTrip={selectedTrip ? (p) => { handleAddPlaceToTrip(p); setGlobalPlaceModal(null) } : null}
      />

      {/* TabBar */}
      <TabBar view={view} onChange={setView} hasTrip={!!selectedTrip} />
    </div>
  )
}

function TabBar({ view, onChange, hasTrip }) {
  const tabs = [
    { id: 'home', label: '行程', jp: '旅', icon: Map },
    { id: 'places', label: '景點', jp: '名所', icon: Compass },
    { id: 'stations', label: '站點', jp: '駅', icon: Train },
    { id: 'budget', label: '預算', jp: '会計', icon: Wallet },
    { id: 'profile', label: '我的', jp: '私', icon: UserIcon },
  ]

  // 如果在 trip detail 內，把 home 切回 home 而不是 trip
  const displayView = view === 'trip' ? 'home' : view

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-kinari border-t border-sumi/15 backdrop-blur-md">
      <div className="max-w-3xl mx-auto flex">
        {tabs.map(t => {
          const Icon = t.icon
          const active = displayView === t.id
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-colors ${
                active ? 'text-shu' : 'text-usuzumi hover:text-sumi'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-display tracking-wider">{t.jp}</span>
              <span className="text-[9px] tracking-wider opacity-70">{t.label}</span>
              {active && <div className="absolute bottom-0 w-8 h-[2px] bg-shu" style={{ marginBottom: '0' }} />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
