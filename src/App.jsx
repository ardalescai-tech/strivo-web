import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Statistics from './pages/Statistics'
import History from './pages/History'
import Leaderboard from './pages/Leaderboard'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) return <div className="loading-screen">Se încarcă...</div>
  if (!user) return <Auth />

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>⚡</span>
          <span className="sidebar-logo-text">Strivo</span>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            <span>⚡</span> Dashboard
          </button>
          <button
            className={`nav-item ${activePage === 'statistics' ? 'active' : ''}`}
            onClick={() => setActivePage('statistics')}
          >
            <span>📊</span> Statistics
          </button>
          <button
            className={`nav-item ${activePage === 'history' ? 'active' : ''}`}
            onClick={() => setActivePage('history')}
          >
            <span>📅</span> History
          </button>
          <button
            className={`nav-item ${activePage === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActivePage('leaderboard')}
          >
            <span>🏆</span> Leaderboard
          </button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          Deconectare
        </button>
      </aside>

      <main className="main-content">
        {activePage === 'dashboard' && <Dashboard user={user} />}
        {activePage === 'statistics' && <Statistics user={user} />}
        {activePage === 'history' && <History user={user} />}
        {activePage === 'leaderboard' && <Leaderboard user={user} />}
      </main>
    </div>
  )
}

export default App