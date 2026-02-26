import { useState, useEffect } from 'react'
import { getDayData, saveDayData, getTodayKey, getYesterdayKey, recalculateStreak } from '../lib/storage'
import { getRank, getNextRank } from '../data/ranks'
import { getRandomMessage, messagesZiRatata } from '../data/messages'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import './Dashboard.css'

const DEFAULT_TASKS = [
  { id: 1, label: 'Mers la sală' },
  { id: 2, label: 'Luat sora de la școală' },
  { id: 3, label: 'Mâncat acasă' },
  { id: 4, label: 'Studiat CompTIA' },
  { id: 5, label: 'Lucrat la Strivo' },
]

function SortableTask({ task, toggleTask, updateNote, updateTime, deleteTask, startEdit, editingId, editingLabel, setEditingLabel, saveEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={`task-card ${task.done ? 'done' : ''}`}>
      <div className="task-top">
        <span className="drag-handle" {...attributes} {...listeners}>⠿</span>
        <button className={`task-check ${task.done ? 'checked' : ''}`} onClick={() => toggleTask(task.id)}>
          {task.done ? '✓' : ''}
        </button>
        {editingId === task.id ? (
          <input
            className="task-edit-input"
            value={editingLabel}
            onChange={e => setEditingLabel(e.target.value)}
            onBlur={() => saveEdit(task.id)}
            onKeyDown={e => e.key === 'Enter' && saveEdit(task.id)}
            autoFocus
          />
        ) : (
          <span className="task-label" onDoubleClick={() => startEdit(task)}>{task.label}</span>
        )}
        {!task.done && (
          <input
            type="time"
            className="task-time-mobile"
            value={task.time || ''}
            onChange={e => updateTime(task.id, e.target.value)}
          />
        )}
        {!task.done && (
          <button className="task-delete" onClick={() => deleteTask(task.id)}>✕</button>
        )}
      </div>
      {task.done && (
        <input
          className="task-note"
          placeholder="Adaugă o notă..."
          value={task.note}
          onChange={e => updateNote(task.id, e.target.value)}
        />
      )}
    </div>
  )
}

function Dashboard({ user }) {
  const [tasks, setTasks] = useState([])
  const [streak, setStreak] = useState(0)
  const [yesterdayScore, setYesterdayScore] = useState(null)
  const [isRestDay, setIsRestDay] = useState(false)
  const [newTaskLabel, setNewTaskLabel] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [startupMessage, setStartupMessage] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    const todayKey = getTodayKey()
    const todayData = await getDayData(user.id, todayKey)
    const streakData = await recalculateStreak(user.id)
    const yesterdayData = await getDayData(user.id, getYesterdayKey())

    if (todayData) {
      setTasks(todayData.tasks)
      setIsRestDay(todayData.is_rest_day || false)
    } else {
      const initialTasks = DEFAULT_TASKS.map(t => ({ ...t, done: false, note: '', time: '', notified: false }))
      setTasks(initialTasks)
    }

    setStreak(streakData)

    if (yesterdayData) {
      const done = yesterdayData.tasks.filter(t => t.done).length
      const total = yesterdayData.tasks.length
      const score = Math.round((done / total) * 100)
      setYesterdayScore(score)
      if (!yesterdayData.is_rest_day && done < total) {
        setStartupMessage(getRandomMessage(messagesZiRatata))
      }
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id)
      const newIndex = tasks.findIndex(t => t.id === over.id)
      const updated = arrayMove(tasks, oldIndex, newIndex)
      setTasks(updated)
      await saveDay(updated)
    }
  }

  const toggleTask = async (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
    setTasks(updated)
    await saveDay(updated)
  }

  const updateNote = async (id, note) => {
    const updated = tasks.map(t => t.id === id ? { ...t, note } : t)
    setTasks(updated)
    await saveDay(updated)
  }

  const updateTime = async (id, time) => {
    const updated = tasks.map(t => t.id === id ? { ...t, time, notified: false } : t)
    setTasks(updated)
    await saveDay(updated)
  }

  const addTask = async () => {
    if (!newTaskLabel.trim()) return
    const newTask = { id: Date.now(), label: newTaskLabel.trim(), done: false, note: '', time: '', notified: false }
    const updated = [...tasks, newTask]
    setTasks(updated)
    setNewTaskLabel('')
    await saveDay(updated)
  }

  const deleteTask = async (id) => {
    const updated = tasks.filter(t => t.id !== id)
    setTasks(updated)
    await saveDay(updated)
  }

  const startEdit = (task) => {
    setEditingId(task.id)
    setEditingLabel(task.label)
  }

  const saveEdit = async (id) => {
    if (!editingLabel.trim()) return
    const updated = tasks.map(t => t.id === id ? { ...t, label: editingLabel.trim() } : t)
    setTasks(updated)
    setEditingId(null)
    await saveDay(updated)
  }

  const saveDay = async (updatedTasks) => {
    await saveDayData(user.id, getTodayKey(), updatedTasks, isRestDay)
    const allDone = updatedTasks.every(t => t.done)
    if (allDone) {
      const newStreak = await recalculateStreak(user.id)
      setStreak(newStreak)
    }
  }

  const toggleRestDay = async () => {
    const newVal = !isRestDay
    setIsRestDay(newVal)
    await saveDayData(user.id, getTodayKey(), tasks, newVal)
  }

  const todayScore = tasks.length > 0
    ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100)
    : 0

  const rank = getRank(streak)
  const nextRank = getNextRank(streak)

  return (
    <div className="page dashboard">
      {startupMessage && (
        <div className="startup-message">
          <span>💀</span>
          <p>{startupMessage}</p>
          <button onClick={() => setStartupMessage(null)}>✕</button>
        </div>
      )}

      <div className="streak-banner">
        <span className="streak-fire">🔥</span>
        <span className="streak-count">{streak}</span>
        <span className="streak-label">day streak</span>
        <div className="rank-badge" style={{ borderColor: rank.color }}>
          <span>{rank.emoji}</span>
          <span style={{ color: rank.color }}>{rank.name} {rank.tier ? `${rank.tier}` : ''}</span>
        </div>
      </div>

      {nextRank && (
        <div className="rank-progress">
          <span className="rank-progress-label">Până la {nextRank.name} {nextRank.tier}: <strong>{nextRank.minDays - streak} zile</strong></span>
          <div className="rank-progress-track">
            <div className="rank-progress-fill" style={{
              width: `${Math.round(((streak - (rank.minDays || 1)) / ((nextRank.minDays - 1) - (rank.minDays || 1))) * 100)}%`,
              background: rank.color
            }} />
          </div>
        </div>
      )}

      {yesterdayScore !== null && (
        <div className="comparison-bar">
          <div className="comparison-item">
            <span className="comparison-label">Ieri</span>
            <div className="comparison-track">
              <div className="comparison-fill yesterday" style={{ width: `${yesterdayScore}%` }} />
            </div>
            <span className="comparison-percent">{yesterdayScore}%</span>
          </div>
          <div className="comparison-item">
            <span className="comparison-label">Azi</span>
            <div className="comparison-track">
              <div className="comparison-fill today" style={{ width: `${todayScore}%` }} />
            </div>
            <span className="comparison-percent" style={{ color: todayScore >= yesterdayScore ? '#4caf50' : '#f44336' }}>
              {todayScore}% {todayScore >= yesterdayScore ? '↑' : '↓'}
            </span>
          </div>
        </div>
      )}

      <div className="tasks-section">
        <div className="tasks-header">
          <h2>Task-urile de azi</h2>
          <button className={`rest-day-btn ${isRestDay ? 'active' : ''}`} onClick={toggleRestDay}>
            {isRestDay ? '😴 Rest Day activ' : 'Set Rest Day'}
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="tasks-list">
              {tasks.map(task => (
                <SortableTask
                  key={task.id}
                  task={task}
                  toggleTask={toggleTask}
                  updateNote={updateNote}
                  updateTime={updateTime}
                  deleteTask={deleteTask}
                  startEdit={startEdit}
                  editingId={editingId}
                  editingLabel={editingLabel}
                  setEditingLabel={setEditingLabel}
                  saveEdit={saveEdit}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="add-task-row">
          <input
            className="add-task-input"
            placeholder="Adaugă un task nou..."
            value={newTaskLabel}
            onChange={e => setNewTaskLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
          />
          <button className="add-task-btn" onClick={addTask}>+</button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard