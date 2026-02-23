import { supabase } from './supabase'

export const getTodayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`
}

export const getYesterdayKey = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`
}

export const getDayData = async (userId, date) => {
  const { data, error } = await supabase
    .from('days')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single()
  if (error) return null
  return data
}

export const saveDayData = async (userId, date, tasks, isRestDay) => {
  const { data, error } = await supabase
    .from('days')
    .upsert({ user_id: userId, date, tasks, is_rest_day: isRestDay }, { onConflict: 'user_id,date' })
  return data
}

export const getStreak = async (userId) => {
  const { data, error } = await supabase
    .from('streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .single()
  if (error) return 0
  return data?.current_streak || 0
}

export const saveStreak = async (userId, streak) => {
  await supabase
    .from('streaks')
    .upsert({ user_id: userId, current_streak: streak, updated_at: new Date() }, { onConflict: 'user_id' })
}

export const recalculateStreak = async (userId) => {
  let streak = 0
  for (let i = 1; i <= 365; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`
    const data = await getDayData(userId, key)
    if (!data) break
    if (data.is_rest_day) continue
    const allDone = data.tasks && data.tasks.every(t => t.done)
    if (allDone) {
      streak++
    } else {
      break
    }
  }
  await saveStreak(userId, streak)
  return streak
}

export const getAllProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, streaks(current_streak)')
  if (error) return []
  return data
}