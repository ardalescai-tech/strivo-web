import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './Auth.css'

function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleRegister = async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username })

      if (profileError) {
        setError('Username-ul există deja. Alege altul.')
        setLoading(false)
        return
      }
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span>⚡</span>
          <h1>Strivo</h1>
        </div>
        <p className="auth-tagline">Strive every day.</p>

        <div className="auth-tabs">
          <button
            className={isLogin ? 'active' : ''}
            onClick={() => { setIsLogin(true); setError('') }}
          >
            Login
          </button>
          <button
            className={!isLogin ? 'active' : ''}
            onClick={() => { setIsLogin(false); setError('') }}
          >
            Register
          </button>
        </div>

        <div className="auth-form">
          {!isLogin && (
            <input
              className="auth-input"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          )}
          <input
            className="auth-input"
            placeholder="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="auth-input"
            placeholder="Parolă"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && <p className="auth-error">{error}</p>}

          <button
            className="auth-btn"
            onClick={isLogin ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? 'Se încarcă...' : isLogin ? 'Intră în cont' : 'Creează cont'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Auth