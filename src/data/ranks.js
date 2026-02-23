export const RANKS = [
  { name: 'Iron', tier: 1, minDays: 1, maxDays: 2, color: '#8B7355', emoji: '⚙️' },
  { name: 'Iron', tier: 2, minDays: 3, maxDays: 4, color: '#8B7355', emoji: '⚙️' },
  { name: 'Iron', tier: 3, minDays: 5, maxDays: 7, color: '#8B7355', emoji: '⚙️' },
  { name: 'Bronze', tier: 1, minDays: 8, maxDays: 11, color: '#CD7F32', emoji: '🥉' },
  { name: 'Bronze', tier: 2, minDays: 12, maxDays: 15, color: '#CD7F32', emoji: '🥉' },
  { name: 'Bronze', tier: 3, minDays: 16, maxDays: 20, color: '#CD7F32', emoji: '🥉' },
  { name: 'Silver', tier: 1, minDays: 21, maxDays: 26, color: '#C0C0C0', emoji: '🥈' },
  { name: 'Silver', tier: 2, minDays: 27, maxDays: 33, color: '#C0C0C0', emoji: '🥈' },
  { name: 'Silver', tier: 3, minDays: 34, maxDays: 40, color: '#C0C0C0', emoji: '🥈' },
  { name: 'Gold', tier: 1, minDays: 41, maxDays: 50, color: '#FFD700', emoji: '🥇' },
  { name: 'Gold', tier: 2, minDays: 51, maxDays: 60, color: '#FFD700', emoji: '🥇' },
  { name: 'Gold', tier: 3, minDays: 61, maxDays: 70, color: '#FFD700', emoji: '🥇' },
  { name: 'Platinum', tier: 1, minDays: 71, maxDays: 85, color: '#00CED1', emoji: '💎' },
  { name: 'Platinum', tier: 2, minDays: 86, maxDays: 100, color: '#00CED1', emoji: '💎' },
  { name: 'Platinum', tier: 3, minDays: 101, maxDays: 110, color: '#00CED1', emoji: '💎' },
  { name: 'Diamond', tier: 1, minDays: 111, maxDays: 130, color: '#4f8ef7', emoji: '💠' },
  { name: 'Diamond', tier: 2, minDays: 131, maxDays: 150, color: '#4f8ef7', emoji: '💠' },
  { name: 'Diamond', tier: 3, minDays: 151, maxDays: 160, color: '#4f8ef7', emoji: '💠' },
  { name: 'Grandmaster', tier: null, minDays: 161, maxDays: Infinity, color: '#FF4500', emoji: '👑' },
]

export const getRank = (streak) => {
  if (streak === 0) return { name: 'Unranked', tier: null, color: '#555', emoji: '❓' }
  const rank = RANKS.find(r => streak >= r.minDays && streak <= r.maxDays)
  return rank || RANKS[RANKS.length - 1]
}

export const getNextRank = (streak) => {
  const currentIndex = RANKS.findIndex(r => streak >= r.minDays && streak <= r.maxDays)
  if (currentIndex === -1 || currentIndex === RANKS.length - 1) return null
  return RANKS[currentIndex + 1]
}