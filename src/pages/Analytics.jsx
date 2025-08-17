import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { supabase } from '../lib/supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import useUser from '../hooks/useUser'
import HabitCalendar from '../components/HabitCalendar'
import CombinedHabitCalendar from '../components/CombinedHabitCalendar'

function fetchStats() {
  return supabase.from('stats').select('*').order('name')
}

function fetchHabits() {
  return supabase.from('habits').select('*').order('inserted_at', { ascending: false })
}

async function fetchEntries(statId, from, to) {
  if (!statId) return { data: [] }
  const { data, error } = await supabase
    .from('entries')
    .select('day,value,note')
    .eq('stat_id', statId)
    .gte('day', from)
    .lte('day', to)
    .order('day', { ascending: true })
  if (error) throw error
  return { data }
}

async function fetchLifetimeEntries(statId) {
  if (!statId) return { data: [] }
  const { data, error } = await supabase
    .from('entries')
    .select('value')
    .eq('stat_id', statId)
  if (error) throw error
  return { data }
}

export default function Analytics() {
  const { user, loading } = useUser()
  const [viewMode, setViewMode] = useState('stats') // 'stats' or 'habits'
  const [habitsViewMode, setHabitsViewMode] = useState('individual') // 'individual' or 'combined'
  const [statId, setStatId] = useState('')
  const [range, setRange] = useState(30) // days
  const [lifetimePeriod, setLifetimePeriod] = useState('lifetime') // '7d', '30d', 'lifetime'
  const { data: statsData } = useQuery({
    queryKey: ['stats-for-analytics'],
    queryFn: fetchStats,
    enabled: !!user && !loading
  })
  const stats = useMemo(() => statsData?.data || [], [statsData?.data])

  // Fetch habits for calendars
  const { data: habitsData } = useQuery({
    queryKey: ['habits-for-analytics'],
    queryFn: fetchHabits,
    enabled: !!user && !loading
  })
  const habits = useMemo(() => habitsData?.data || [], [habitsData?.data])

  useEffect(()=>{ if (!statId && stats.length) setStatId(stats[0].id) }, [stats, statId])

  const to = dayjs().format('YYYY-MM-DD')
  const from = dayjs().subtract(range-1, 'day').format('YYYY-MM-DD')

  const { data: entriesData } = useQuery({
    queryKey: ['entries-analytics', statId, from, to],
    queryFn: () => fetchEntries(statId, from, to),
    enabled: !!statId
  })

  const { data: lifetimeEntriesData } = useQuery({
    queryKey: ['lifetime-entries-analytics', statId, lifetimePeriod],
    queryFn: () => {
      if (lifetimePeriod === 'lifetime') {
        return fetchLifetimeEntries(statId)
      } else {
        const days = lifetimePeriod === '7d' ? 7 : 30
        const from = dayjs().subtract(days - 1, 'day').format('YYYY-MM-DD')
        const to = dayjs().format('YYYY-MM-DD')
        return fetchEntries(statId, from, to)
      }
    },
    enabled: !!statId
  })

  // Aggregate by day (sum). For text-only, count entries.
  const data = useMemo(() => {
    const map = new Map()
    for (let i = 0; i < range; i++) {
      const d = dayjs(from).add(i, 'day').format('YYYY-MM-DD')
      map.set(d, 0)
    }
    for (const e of (entriesData?.data || [])) {
      const key = dayjs(e.day).format('YYYY-MM-DD')
      const v = (typeof e.value === 'number' && !isNaN(e.value)) ? Number(e.value) : 1
      map.set(key, (map.get(key) || 0) + v)
    }
    return Array.from(map.entries()).map(([d, v]) => ({ d: dayjs(d).format('DD MMM'), v }))
  }, [entriesData?.data, from, range])

  const selected = stats.find(s => s.id === statId)
  const yLabel = selected?.unit || (selected?.type === 'duration' ? 'min' : '')

  // Calculate lifetime total
  const lifetimeTotal = useMemo(() => {
    return (lifetimeEntriesData?.data || []).reduce((sum, entry) => {
      const value = Number(entry.value || 0)
      return sum + (isNaN(value) ? 0 : value)
    }, 0)
  }, [lifetimeEntriesData?.data])

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold theme-text-2xl">Insights</h2>
        <div className="flex gap-2">
          {[
            { key: 'stats', label: 'Stats' },
            { key: 'habits', label: 'Habits' }
          ].map(mode => (
            <button
              key={mode.key}
              onClick={() => setViewMode(mode.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === mode.key
                  ? 'accent-bg accent-text'
                  : 'theme-button-secondary'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats View */}
      {viewMode === 'stats' && (
        <>
          {/* Lifetime Total */}
          {selected && (
            <div className="p-6 card">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted">
                  {lifetimePeriod === 'lifetime' ? 'Lifetime' : lifetimePeriod === '7d' ? 'Last 7 Days' : 'Last 30 Days'} Total
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: '7d', label: '7d' },
                    { key: '30d', label: '30d' },
                    { key: 'lifetime', label: 'All' }
                  ].map(period => (
                    <button
                      key={period.key}
                      onClick={() => setLifetimePeriod(period.key)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                        lifetimePeriod === period.key
                          ? 'accent-bg accent-text'
                          : 'theme-button-secondary'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-4xl font-bold theme-text-4xl">
                  {lifetimeTotal}{yLabel ? ` ${yLabel}` : ''}
                </h3>
                <p className="text-sm text-muted mt-2">{selected.name}</p>
              </div>
            </div>
          )}

          <div className="p-6 card">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-muted mb-2 block">Stat</label>
                <select 
                  className="input"
                  value={statId} 
                  onChange={e=>setStatId(e.target.value)}
                >
                  {stats.map(s => (
                    <option key={s.id} value={s.id}>{s.name} {s.unit ? `(${s.unit})` : ''}</option>
                  ))}
                  {!stats.length && <option value="">No stats</option>}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted mb-2 block">Range</label>
                <div className="flex gap-2 flex-wrap">
                  {[7,30,90].map(n=>(
                    <button key={n} onClick={()=>setRange(n)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                                         range===n 
                       ? 'accent-bg accent-text border-current' 
                       : 'theme-button-secondary'
                      }`}>
                      {n}d
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-64 mb-4 theme-text">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeOpacity={0.2} vertical={false} stroke="#e5e5e5" />
                  <XAxis dataKey="d" tick={{ fontSize: 12, fill: '#737373' }} />
                  <YAxis width={40} tick={{ fontSize: 12, fill: '#737373' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="v" 
                    stroke="currentColor" 
                    strokeWidth={3} 
                    dot={{ fill: 'currentColor', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'currentColor', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {selected && (
              <div className="text-sm text-muted text-center">
                {selected.name}{yLabel ? ` (${yLabel})` : ''} over last {range} days
              </div>
            )}
          </div>

          {!stats.length && (
            <div className="text-center p-8 card">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-lg font-semibold theme-text-lg mb-2">No stats yet</div>
              <div className="text-muted">Create your first stat to see insights here!</div>
            </div>
          )}
        </>
      )}

      {/* Habits View */}
      {viewMode === 'habits' && (
        <>
          {/* Habits View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold theme-text-lg mb-4">Habit Calendars</h3>
            <div className="flex gap-2">
              {[
                { key: 'individual', label: 'Individual' },
                { key: 'combined', label: 'Combined' }
              ].map(mode => (
                <button
                  key={mode.key}
                  onClick={() => setHabitsViewMode(mode.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    habitsViewMode === mode.key
                      ? 'accent-bg accent-text'
                      : 'theme-button-secondary'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Combined Calendar View */}
          {habitsViewMode === 'combined' && habits.length > 0 && (
            <CombinedHabitCalendar habits={habits} user={user} />
          )}

          {/* Individual Habit Calendars */}
          {habitsViewMode === 'individual' && (
            <>
              {habits.length > 0 && (
                <div className="space-y-6">
                  {habits.map(habit => (
                    <div key={habit.id} className="p-6 card">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h5 className="text-base font-semibold theme-text">{habit.name}</h5>
                          {habit.color && (
                            <div 
                              className="w-3 h-3 rounded-sm flex-shrink-0"
                              style={{ backgroundColor: habit.color }}
                              title={`Color: ${habit.color}`}
                            />
                          )}
                        </div>
                      </div>
                      <HabitCalendar habit={habit} user={user} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {habits.length === 0 && (
            <div className="text-center p-8 card">
              <div className="text-4xl mb-4">✅</div>
              <div className="text-lg font-semibold theme-text-lg mb-2">No habits yet</div>
              <div className="text-muted">Create your first habit to see calendar views here!</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
