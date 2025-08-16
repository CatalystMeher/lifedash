import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { supabase } from '../lib/supabase'
import useUser from '../hooks/useUser'

function fetchDurationStats() {
  return supabase.from('stats').select('*').eq('type','duration').order('inserted_at',{ascending:false})
}

export default function Focus() {
  const { user, loading } = useUser()
  const { data, isLoading } = useQuery({
    queryKey: ['duration-stats'],
    queryFn: fetchDurationStats,
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

  const list = useMemo(() => data?.data || [], [data?.data])
  const today = useMemo(()=>dayjs().format('YYYY-MM-DD'), [])

  useEffect(()=>{
    if (!statId && list.length) setStatId(list[0].id)
  }, [list, statId])

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
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    }
    setRunning(false)
    setElapsedSec(0)
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Focus</h2>

      <div className="p-6 card">
        <div className="grid grid-cols-2 gap-4 mb-6">
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
            <div className="flex gap-2">
              {[25,50,90].map(m=>(
                <button key={m}
                  onClick={()=>setModeMin(m)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                                       modeMin===m 
                     ? 'bg-green-500 text-white border-green-500' 
                     : 'btn-secondary'
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
          <div className="text-6xl font-bold tabular-nums text-gray-900 dark:text-gray-100 mb-6">{mm}:{ss}</div>
          <div className="flex gap-3">
            {!running && elapsedSec===0 && (
              <button onClick={()=>startTimer()} className="btn-primary px-8 py-3 text-lg">Start</button>
            )}
            {running && (
              <>
                <button onClick={pause} className="btn-secondary px-6 py-3">Pause</button>
                <button onClick={finish} className="btn-primary px-6 py-3">End & Save</button>
              </>
            )}
            {!running && elapsedSec>0 && (
              <>
                <button onClick={resume} className="btn-secondary px-6 py-3">Resume</button>
                <button onClick={cancel} className="btn-secondary px-6 py-3">Cancel</button>
              </>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center p-6 card">
          <div className="text-muted">Loading duration stats...</div>
        </div>
      )}
      {!isLoading && !list.length && (
        <div className="text-center p-12 card">
          <div className="text-4xl mb-4">⏱️</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No duration stats</div>
          <div className="text-muted">Create a stat of type <span className="font-semibold">duration</span> first.</div>
        </div>
      )}
    </div>
  )
}
