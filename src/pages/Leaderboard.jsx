import { useState, useEffect } from 'react'
import { getAllProfiles } from '../lib/storage'
import { getRank } from '../data/ranks'
import './Leaderboard.css'

function Leaderboard({ user }) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    const profiles = await getAllProfiles()
    const sorted = profiles.sort((a, b) => b.streak - a.streak)
    setPlayers(sorted)
    setLoading(false)
  }

  if (loading) return <div className="page leaderboard"><p className="loading">Se încarcă...</p></div>

  return (
    <div className="page leaderboard">
      <h2>Leaderboard</h2>
      <p className="leaderboard-subtitle">Cine e mai consistent?</p>

      <div className="leaderboard-list">
        {players.map((player, index) => {
          const rank = getRank(player.streak)
          const isMe = player.id === user.id
          return (
            <div key={player.id} className={`leaderboard-card ${isMe ? 'me' : ''}`}>
              <span className="leaderboard-position">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </span>
              <div className="leaderboard-info">
                <span className="leaderboard-username">
                  {player.username} {isMe ? '(tu)' : ''}
                </span>
                <span className="leaderboard-rank" style={{ color: rank.color }}>
                  {rank.emoji} {rank.name} {rank.tier || ''}
                </span>
              </div>
              <div className="leaderboard-streak">
                <span className="leaderboard-streak-count">{player.streak}</span>
                <span className="leaderboard-streak-label">zile</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Leaderboard