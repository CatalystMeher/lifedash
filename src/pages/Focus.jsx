import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { supabase } from '../lib/supabase'
import useUser from '../hooks/useUser'
import { Edit, Trash2, Play, Maximize2 } from 'lucide-react'
import FullscreenFocus from '../components/FullscreenFocus'

function fetchDurationStats() {
  return supabase.from('stats').select('*').eq('type','duration').order('inserted_at',{ascending:false})
}

function fetchFocusSessions(userId) {
  return supabase
    .from('entries')
    .select(`
      id,
      day,
      value,
      note,
      inserted_at,
      stats!inner(name, color, icon)
    `)
    .eq('user_id', userId)
    .eq('source', 'focusTimer')
    .order('inserted_at', { ascending: false })
    .limit(50)
}

// Timer persistence helpers
const TIMER_STORAGE_KEY = 'focus-timer-state'

function saveTimerState(state) {
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save timer state:', e)
  }
}

function loadTimerState() {
  try {
    const saved = localStorage.getItem(TIMER_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch (e) {
    console.warn('Failed to load timer state:', e)
    return null
  }
}

function clearTimerState() {
  try {
    localStorage.removeItem(TIMER_STORAGE_KEY)
  } catch (e) {
    console.warn('Failed to clear timer state:', e)
  }
}

export default function Focus() {
  const { user, loading } = useUser()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['duration-stats'],
    queryFn: fetchDurationStats,
    enabled: !!user && !loading
  })
  
  // Fetch focus sessions
  const { data: focusSessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['focus-sessions', user?.id],
    queryFn: () => fetchFocusSessions(user.id),
    enabled: !!user && !loading
  })
  
  const [statId, setStatId] = useState(null)
  const [modeMin, setModeMin] = useState(25) // preset minutes
  const [running, setRunning] = useState(false)
  const startRef = useRef(null)  // Date
  const [elapsedSec, setElapsedSec] = useState(0)
  const tickRef = useRef(null)
  const pausedRef = useRef(0)    // total paused seconds
  const lastPauseStart = useRef(null)
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Edit session state
  const [editingSession, setEditingSession] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [editNote, setEditNote] = useState('')

  const list = useMemo(() => data?.data || [], [data?.data])
  const focusSessions = useMemo(() => focusSessionsData?.data || [], [focusSessionsData?.data])
  const today = useMemo(()=>dayjs().format('YYYY-MM-DD'), [])

  useEffect(()=>{
    if (!statId && list.length) setStatId(list[0].id)
  }, [list, statId])

  // Load persistent timer state on mount
  useEffect(() => {
    const savedState = loadTimerState()
    if (savedState && savedState.userId === user?.id) {
      const now = Date.now()
      const timeSinceStart = Math.floor((now - savedState.startTime) / 1000)
      const totalPaused = savedState.pausedSeconds || 0
      
      if (savedState.running) {
        // Timer was running, calculate current elapsed time
        const currentElapsed = Math.max(0, timeSinceStart - totalPaused)
        setElapsedSec(currentElapsed)
        setRunning(true)
        startRef.current = new Date(savedState.startTime)
        pausedRef.current = totalPaused
        lastPauseStart.current = null
        
        // Restart the timer
        tickRef.current = setInterval(() => {
          setElapsedSec(Math.floor((Date.now() - startRef.current.getTime() - pausedRef.current * 1000) / 1000))
        }, 1000)
      } else if (savedState.elapsedSeconds > 0) {
        // Timer was paused, restore the state
        setElapsedSec(savedState.elapsedSeconds)
        setRunning(false)
        startRef.current = new Date(savedState.startTime)
        pausedRef.current = totalPaused
        lastPauseStart.current = null
      }
    }
  }, [user?.id])

  // Save timer state when it changes
  useEffect(() => {
    if (startRef.current) {
      const state = {
        userId: user?.id,
        startTime: startRef.current.getTime(),
        running,
        elapsedSeconds: elapsedSec,
        pausedSeconds: pausedRef.current,
        statId,
        modeMin
      }
      saveTimerState(state)
    }
  }, [running, elapsedSec, user?.id, statId, modeMin])

  function startTimer(min=null) {
    if (!statId) return toast.error('Pick a duration stat')
    const targetMin = Number(min ?? modeMin)
    if (isNaN(targetMin) || targetMin <= 0) return toast.error('Invalid minutes')
    startRef.current = new Date()
    pausedRef.current = 0
    lastPauseStart.current = null
    setElapsedSec(0)
    setRunning(true)
    tickRef.current = setInterval(()=>{
      setElapsedSec(Math.floor((Date.now() - startRef.current.getTime() - pausedRef.current*1000)/1000))
    }, 1000)
  }

  function pause() {
    if (!running) return
    lastPauseStart.current = Date.now()
    setRunning(false)
    clearInterval(tickRef.current)
  }

  function resume() {
    if (running) return
    if (lastPauseStart.current) {
      pausedRef.current += Math.floor((Date.now() - lastPauseStart.current)/1000)
    }
    lastPauseStart.current = null
    setRunning(true)
    tickRef.current = setInterval(()=>{
      setElapsedSec(Math.floor((Date.now() - startRef.current.getTime() - pausedRef.current*1000)/1000))
    }, 1000)
  }

  function cancel() {
    clearInterval(tickRef.current)
    setRunning(false)
    setElapsedSec(0)
    clearTimerState()
  }

  async function finish() {
    clearInterval(tickRef.current)
    const endedAt = new Date()
    const startedAt = startRef.current
    const durationMin = Math.max(1, Math.floor((endedAt - startedAt)/60000) - Math.floor(pausedRef.current/60))
    try {
      const { error } = await supabase.from('entries').insert({
        user_id: user.id,
        stat_id: statId,
        day: today,
        value: durationMin,
        source: 'focusTimer',
        note: 'Focus session'
      })
      if (error) throw error
      toast.success(`Saved ${durationMin} min`)
      // Refresh focus sessions
      queryClient.invalidateQueries(['focus-sessions'])
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    }
    setRunning(false)
    setElapsedSec(0)
    clearTimerState()
    setIsFullscreen(false)
  }

  // Session management functions
  function startFromSession(session) {
    setStatId(session.stats.id)
    setModeMin(session.value)
    startTimer(session.value)
  }

  function editSession(session) {
    setEditingSession(session)
    setEditValue(session.value.toString())
    setEditNote(session.note || '')
  }

  async function saveEdit() {
    if (!editingSession) return
    
    const value = Number(editValue)
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid duration')
      return
    }

    try {
      const { error } = await supabase
        .from('entries')
        .update({
          value,
          note: editNote.trim() || null
        })
        .eq('id', editingSession.id)
      
      if (error) throw error
      
      toast.success('Session updated')
      queryClient.invalidateQueries(['focus-sessions'])
      setEditingSession(null)
    } catch (err) {
      toast.error(err.message || 'Failed to update session')
    }
  }

  async function deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this focus session?')) return
    
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', sessionId)
      
      if (error) throw error
      
      toast.success('Session deleted')
      queryClient.invalidateQueries(['focus-sessions'])
    } catch (err) {
      toast.error(err.message || 'Failed to delete session')
    }
  }

  const mm = String(Math.floor(elapsedSec/60)).padStart(2,'0')
  const ss = String(elapsedSec%60).padStart(2,'0')

  // Show loading state while user is being authenticated
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center p-6 card">
          <div className="text-muted">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold theme-text-2xl">Focus</h2>

      <div className="p-6 card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-muted mb-2 block">Log to stat</label>
            <select 
              className="input"
              value={statId || ''} 
              onChange={e=>setStatId(e.target.value)}
            >
              {list.map(s => <option key={s.id} value={s.id}>{s.name} {s.unit ? `(${s.unit})` : ''}</option>)}
              {!list.length && <option value="">No duration stats</option>}
            </select>
          </div>
          <div>
            <label className="text-sm text-muted mb-2 block">Preset (minutes)</label>
            <div className="flex gap-2 flex-wrap">
              {[25,50,90].map(m=>(
                <button key={m}
                  onClick={()=>setModeMin(m)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                                       modeMin===m 
                     ? 'accent-bg accent-text border-current' 
                     : 'theme-button-secondary'
                  }`}>
                  {m}
                </button>
              ))}
              <input 
                type="number" 
                min="1"
                value={modeMin} 
                onChange={e=>setModeMin(Number(e.target.value)||25)}
                className="w-20 input text-sm" 
              />
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center">
          <div className="text-6xl font-bold tabular-nums theme-text-4xl mb-6">{mm}:{ss}</div>
          <div className="flex gap-3 flex-wrap justify-center">
            {!running && elapsedSec===0 && (
              <button onClick={()=>startTimer()} className="btn-primary px-8 py-3 text-lg">Start</button>
            )}
            {running && (
              <>
                <button onClick={pause} className="btn-secondary px-6 py-3">Pause</button>
                <button onClick={finish} className="btn-primary px-6 py-3">End & Save</button>
                <button 
                  onClick={() => setIsFullscreen(true)}
                  className="btn-secondary px-6 py-3 flex items-center gap-2"
                >
                  <Maximize2 size={18} />
                  Fullscreen
                </button>
              </>
            )}
            {!running && elapsedSec>0 && (
              <>
                <button onClick={resume} className="btn-secondary px-6 py-3">Resume</button>
                <button onClick={cancel} className="btn-secondary px-6 py-3">Cancel</button>
                <button 
                  onClick={() => setIsFullscreen(true)}
                  className="btn-secondary px-6 py-3 flex items-center gap-2"
                >
                  <Maximize2 size={18} />
                  Fullscreen
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Previous Focus Sessions */}
      <div className="p-6 card">
        <h3 className="text-lg font-semibold theme-text-lg mb-4">Previous Sessions</h3>
        
        {sessionsLoading && (
          <div className="text-center py-8">
            <div className="text-muted">Loading sessions...</div>
          </div>
        )}
        
        {!sessionsLoading && focusSessions.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📚</div>
            <div className="theme-text-lg mb-2">No focus sessions yet</div>
            <div className="text-muted">Complete your first focus session to see it here</div>
          </div>
        )}
        
        {!sessionsLoading && focusSessions.length > 0 && (
          <div className="space-y-3">
            {focusSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-4 border theme-border rounded-xl">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: session.stats?.color || '#e5e5e5' }}
                  >
                    <span className="text-white text-sm font-medium">
                      {session.stats?.icon ? session.stats.icon.charAt(0).toUpperCase() : 'F'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium theme-text">{session.stats?.name || 'Unknown Stat'}</div>
                    <div className="text-sm text-muted">
                      {dayjs(session.day).format('MMM DD, YYYY')} • {session.value} min
                    </div>
                    {session.note && (
                      <div className="text-sm theme-text-secondary mt-1">{session.note}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startFromSession(session)}
                    className="p-2 text-accent-text bg-accent-bg rounded-lg hover:opacity-80 transition-opacity"
                    title="Start new session with this duration"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => editSession(session)}
                    className="p-2 theme-text-secondary hover:theme-bg-secondary rounded-lg transition-colors"
                    title="Edit session"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingSession(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md card rounded-2xl shadow-xl animate-slide-up">
              <div className="p-6">
                <h3 className="text-lg font-semibold theme-text mb-4">Edit Focus Session</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted mb-2 block">Duration (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-muted mb-2 block">Note (optional)</label>
                    <textarea
                      rows={3}
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      className="input resize-none"
                      placeholder="Add a note about this session..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setEditingSession(null)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="flex-1 btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Focus */}
      <FullscreenFocus
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        statId={statId}
        elapsedSec={elapsedSec}
        isRunning={running}
        onPause={pause}
        onResume={resume}
        onFinish={finish}
      />

      {isLoading && (
        <div className="text-center p-6 card">
          <div className="text-muted">Loading duration stats...</div>
        </div>
      )}
      {!isLoading && !list.length && (
        <div className="text-center p-12 card">
          <div className="text-4xl mb-4">⏱️</div>
          <div className="text-lg font-semibold theme-text-lg mb-2">No duration stats</div>
          <div className="text-muted">Create a stat of type <span className="font-semibold">duration</span> first.</div>
        </div>
      )}
    </div>
  )
}
