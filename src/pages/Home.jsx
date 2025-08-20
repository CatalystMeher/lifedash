import { useMemo, useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Sparkline from '../components/Sparkline'
import FAB from '../components/FAB'
import AIChatButton from '../components/AIChatButton'
import QuickLogModal from '../components/QuickLogModal'

import TodoListCompact from '../components/TodoListCompact'
import useUser from '../hooks/useUser'
import { supabase } from '../lib/supabase'
import { lastNDays, todayKey, daysBetween } from '../lib/dateRange'
import * as LucideIcons from 'lucide-react'
import dayjs from 'dayjs'
import { Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { triggerConfetti } from '../lib/confetti'
import OverlappedIcons from '../components/OverlappedIcons'
import { useUserPreferences, formatAmount } from '../hooks/useUserPreferences'

// Number formatting function - now uses user preferences
function formatNumber(num, amountFormat = 'US') {
  return formatAmount(num, amountFormat)
}

async function fetchStats() {
  const { data, error } = await supabase.from('stats').select('*').order('inserted_at', { ascending: false })
  if (error) throw error
  return data || []
}

async function fetchEntriesFor(statIds, from, to) {
  if (!statIds.length) return []
  const { data, error } = await supabase
    .from('entries')
    .select('stat_id, day, value')
    .in('stat_id', statIds)
    .gte('day', from)
    .lte('day', to)
  if (error) throw error
  return data || []
}

async function fetchLifetimeEntries(statIds) {
  if (!statIds.length) return []
  const { data, error } = await supabase
    .from('entries')
    .select('stat_id, value')
    .in('stat_id', statIds)
  if (error) throw error
  return data || []
}

async function fetchHabits(userId) {
  const { data, error } = await supabase.from('habits').select('*').eq('user_id', userId).order('inserted_at', { ascending: false })
  if (error) throw error
  return data || []
}

async function fetchTodayCheckins(today, userId) {
  const { data, error } = await supabase.from('habit_checkins').select('habit_id, done').eq('day', today).eq('user_id', userId)
  if (error) throw error
  return data || []
}

export default function Home() {
  const { user, loading } = useUser()
  const { preferences } = useUserPreferences()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [openQL, setOpenQL] = useState(false)
  
  // Get the last selected period from localStorage, default to 'today'
  const [statsPeriod, setStatsPeriod] = useState(() => {
    try {
      const saved = localStorage.getItem('lifedash-stats-period')
      return saved && ['today', '7d', '30d', 'lifetime'].includes(saved) ? saved : 'today'
    } catch (error) {
      console.warn('Failed to load stats period from localStorage:', error)
      return 'today'
    }
  })

  const { from, to } = lastNDays(7)
  const tkey = todayKey()

  // Handle period change and save to localStorage
  const handlePeriodChange = (period) => {
    setStatsPeriod(period)
    try {
      localStorage.setItem('lifedash-stats-period', period)
    } catch (error) {
      console.warn('Failed to save stats period to localStorage:', error)
    }
  }

  // Save the current period to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('lifedash-stats-period', statsPeriod)
    } catch (error) {
      console.warn('Failed to save stats period to localStorage:', error)
    }
  }, [statsPeriod])

  // all stats
  const { data: stats = [], error: statsError } = useQuery({
    queryKey: ['stats-home'],
    queryFn: fetchStats,
    enabled: !!user && !loading
  })

  // entries for all stats
  const { data: entries = [], error: entriesError } = useQuery({
    queryKey: ['entries-home', stats.map(s => s.id), from, to],
    queryFn: () => fetchEntriesFor(stats.map(s => s.id), from, to),
    enabled: !!user && !loading && !!stats.length
  })

  // entries for stats based on selected period
  const { data: periodEntries = [], error: periodEntriesError } = useQuery({
    queryKey: ['period-entries', stats.map(s => s.id), statsPeriod],
    queryFn: () => {
      if (statsPeriod === 'lifetime') {
        return fetchLifetimeEntries(stats.map(s => s.id))
      } else if (statsPeriod === 'today') {
        return fetchEntriesFor(stats.map(s => s.id), tkey, tkey)
      } else {
        const days = statsPeriod === '7d' ? 7 : 30
        const from = dayjs().subtract(days - 1, 'day').format('YYYY-MM-DD')
        const to = dayjs().format('YYYY-MM-DD')
        return fetchEntriesFor(stats.map(s => s.id), from, to)
      }
    },
    enabled: !!user && !loading && !!stats.length
  })

  // habits + today checkins
  const { data: habits = [], error: habitsError } = useQuery({
    queryKey: ['habits-home', user?.id],
    queryFn: () => fetchHabits(user.id),
    enabled: !!user && !loading
  })
  const { data: checkins = [], error: checkinsError } = useQuery({
    queryKey: ['habit-checkins-today', tkey, user?.id],
    queryFn: () => fetchTodayCheckins(tkey, user.id),
    enabled: !!user && !loading
  })

  // compute values for each stat based on selected period
  const periodValues = useMemo(() => {
    const values = new Map()
    for (const entry of periodEntries) {
      const stat = stats.find(s => s.id === entry.stat_id)
      if (stat) {
        const current = values.get(stat.id) || 0
        const value = Number(entry.value || 0)
        if (!isNaN(value)) {
          values.set(stat.id, current + value)
        }
      }
    }
    return values
  }, [periodEntries, stats])

  // Group amount stats by unit and compute totals
  const amountStatsByUnit = useMemo(() => {
    const amountStats = stats.filter(s => s.type === 'amount')
    const grouped = new Map()
    
    for (const stat of amountStats) {
      const statUnit = stat.unit || 'no-unit'
      if (!grouped.has(statUnit)) {
        grouped.set(statUnit, [])
      }
      grouped.get(statUnit).push(stat)
    }
    
    // Convert to array and sort stats within each group by insertion date (newest first)
    return Array.from(grouped.entries())
      .map(([unit, stats]) => {
        // Sort stats within the group by insertion date (newest first)
        const sortedStats = stats.sort((a, b) => new Date(b.inserted_at) - new Date(a.inserted_at))
        
        return {
          unit,
          stats: sortedStats,
          total: sortedStats.reduce((sum, stat) => sum + (periodValues.get(stat.id) || 0), 0)
        }
      })
      .sort((a, b) => a.unit.localeCompare(b.unit))
  }, [stats, periodValues])

  // compute focus (today + 7-day spark) - only duration stats
  const durationStats = useMemo(() => stats.filter(s => s.type === 'duration'), [stats])
  const durationEntries = useMemo(() => entries.filter(e => durationStats.some(s => s.id === e.stat_id)), [entries, durationStats])
  
  const spark = useMemo(() => {
    const days = daysBetween(from, to)
    const agg = new Map(days.map(d => [d, 0]))
    for (const e of durationEntries) {
      const k = e.day
      const v = Number(e.value || 0)
      if (!isNaN(v)) agg.set(k, (agg.get(k) || 0) + v)
    }
    return days.map(d => ({ d, v: agg.get(d) || 0 }))
  }, [durationEntries, from, to])

  const focusToday = useMemo(() => {
    return durationEntries
      .filter(e => e.day === tkey)
      .reduce((sum, e) => sum + (Number(e.value || 0) || 0), 0)
  }, [durationEntries, tkey])

  // habits scheduled today
  const dayIdx = useMemo(() => new Date().getDay(), [])
  const todaysHabits = useMemo(
    () => habits.filter(h => (h.days_of_week || [0,1,2,3,4,5,6]).includes(dayIdx)),
    [habits, dayIdx]
  )
  const doneSet = useMemo(() => new Set(checkins.filter(c => c.done === true).map(c => c.habit_id)), [checkins])
  const habitsDone = todaysHabits.filter(h => doneSet.has(h.id)).length

  // Sort stats by insertion date (newest first)
  const sortedStats = useMemo(() => {
    return stats.sort((a, b) => new Date(b.inserted_at) - new Date(a.inserted_at))
  }, [stats])



  // Toggle habit completion
  const toggleHabit = async (habit) => {
    if (!user?.id) return
    const done = !doneSet.has(habit.id)
    const { error } = await supabase.from('habit_checkins').upsert({
      user_id: user.id, habit_id: habit.id, day: tkey, done
    }, { onConflict: 'user_id,habit_id,day' })
    if (error) return toast.error(error.message)
    
    if (done) {
      triggerConfetti()
      toast.success('Marked done')
    } else {
      toast.success('Marked not done')
    }
    
    // Refetch checkins to update UI
    queryClient.invalidateQueries(['habit-checkins-today'])
  }

  // Refresh function for QuickLogModal
  const refreshData = () => {
    queryClient.invalidateQueries(['entries-home'])
    queryClient.invalidateQueries(['period-entries'])
    queryClient.invalidateQueries(['lifetime-entries'])
  }

  // Debug logging
  console.log('Day index:', dayIdx, 'type:', typeof dayIdx)
  console.log('All habits:', habits.map(h => ({ id: h.id, name: h.name, days: h.days_of_week, daysType: typeof h.days_of_week })))
  console.log('Today\'s habits:', todaysHabits.map(h => ({ id: h.id, name: h.name, days: h.days_of_week })))
  console.log('All checkins:', checkins.map(c => ({ habit_id: c.habit_id, done: c.done, doneType: typeof c.done })))
  console.log('Done checkins:', checkins.filter(c => c.done === true).map(c => ({ habit_id: c.habit_id, done: c.done, doneType: typeof c.done })))
  console.log('Done set:', Array.from(doneSet))
  console.log('Habits done:', habitsDone)
  console.log('Habits done details:', todaysHabits.filter(h => doneSet.has(h.id)).map(h => ({ id: h.id, name: h.name })))

  // Check for Supabase configuration
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return (
      <div className="space-y-6">
        <div className="text-center p-6 card">
          <div className="text-red-500 font-medium">Missing Supabase configuration</div>
          <div className="text-sm text-muted mt-2">Please check your environment variables.</div>
        </div>
      </div>
    )
  }

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

  // Show error if any query failed
  if (statsError || entriesError || periodEntriesError || habitsError || checkinsError) {
    return (
      <div className="space-y-6">
        <div className="text-center p-6 card">
          <div className="text-red-500 font-medium">Error loading data</div>
          <div className="text-sm text-muted mt-2">Please try refreshing the page.</div>
        </div>
      </div>
    )
  }

  const getPeriodDescription = (period) => {
    switch (period) {
      case 'today': return 'today'
      case '7d': return '7 days'
      case '30d': return '30 days'
      case 'lifetime': return 'lifetime'
      default: return period
    }
  }

  return (
    <div className="space-y-6">
      {/* Today at a glance */}
      <section className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted mb-1">Focus (min)</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold theme-text-2xl">{formatNumber(focusToday)}</h3>
            <span className="text-xs text-muted">today</span>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-muted mb-1">Habits done</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold theme-text-2xl">{habitsDone}/{todaysHabits.length}</h3>
            <span className="text-xs text-muted">today</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted">This week</p>
            <span className="text-xs text-muted">7d</span>
          </div>
          <div className="theme-text">
            <Sparkline data={spark.map(x => ({ d: x.d, v: x.v }))} />
          </div>
        </Card>
      </section>

      {/* Amount Totals */}
      {amountStatsByUnit.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold theme-text-lg">Amount Stats</h4>
            <span className="text-xs text-muted">
              {getPeriodDescription(statsPeriod)}
            </span>
          </div>
          <div className="space-y-4">
            {amountStatsByUnit.map(({ unit, stats, total }) => {
              // If only one stat in the group, show it as an individual stat
              if (stats.length === 1) {
                const stat = stats[0]
                const periodValue = periodValues.get(stat.id) || 0
                const IconComponent = stat.icon && LucideIcons[stat.icon] ? LucideIcons[stat.icon] : LucideIcons.BarChart3
                return (
                  <Card key={stat.id} className="p-4 w-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted mb-1">{stat.name}</p>
                        <h3 className="text-xl font-bold theme-text-xl">
                          {formatNumber(periodValue, preferences.amount_format)}{unit !== 'no-unit' ? ` ${unit}` : ''}
                        </h3>
                        <p className="text-xs text-muted">
                          {getPeriodDescription(statsPeriod)}
                        </p>
                      </div>
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: stat.color || '#e5e5e5' }}
                      >
                        <IconComponent className="w-4 h-4 text-white theme-icon" />
                      </div>
                    </div>
                  </Card>
                )
              }
              
              // If multiple stats, show as grouped total
              return (
                <Card key={unit} className="p-4 w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted mb-1">Total {unit}</p>
                      <h3 className="text-xl font-bold theme-text-xl">
                        {formatNumber(total, preferences.amount_format)}{unit !== 'no-unit' ? ` ${unit}` : ''}
                      </h3>
                      <p className="text-xs text-muted">
                        {stats.length} stat{stats.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <OverlappedIcons stats={stats} size="md" />
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Stats */}
      {sortedStats.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold theme-text-lg">All Stats</h4>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'today', label: 'Today' },
                { key: '7d', label: '7d' },
                { key: '30d', label: '30d' },
                { key: 'lifetime', label: 'All' }
              ].map(period => (
                <button
                  key={period.key}
                  onClick={() => handlePeriodChange(period.key)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    statsPeriod === period.key
                      ? 'accent-bg accent-text'
                      : 'theme-button-secondary hover:theme-button-secondary'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {sortedStats.map(stat => {
              const periodValue = periodValues.get(stat.id) || 0
              const unit = stat.unit || (stat.type === 'duration' ? 'min' : '')
              const IconComponent = stat.icon && LucideIcons[stat.icon] ? LucideIcons[stat.icon] : LucideIcons.BarChart3
              return (
                <Card key={stat.id} className="p-4 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted mb-1">{stat.name}</p>
                      <h3 className="text-xl font-bold theme-text-xl">
                        {formatNumber(periodValue, preferences.amount_format)}{unit ? ` ${unit}` : ''}
                      </h3>
                      <p className="text-xs text-muted">
                        {getPeriodDescription(statsPeriod)}
                      </p>
                    </div>
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: stat.color || '#e5e5e5' }}
                    >
                      <IconComponent className="w-4 h-4 text-white theme-icon" />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {stats.length === 0 && (
        <section>
          <h4 className="text-lg font-semibold theme-text-lg mb-4">All Stats</h4>
          <div className="text-center p-8 card">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-lg font-semibold theme-text-lg mb-2">No stats yet</div>
            <div className="text-muted">Create your first stat to start tracking!</div>
          </div>
        </section>
      )}

      {/* Todos and Habits Section */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Todos - Show first on mobile, left side on desktop */}
          <div className="order-1 lg:order-1">
            <TodoListCompact user={user} />
          </div>

          {/* Habits - Show second on mobile, right side on desktop */}
          <div className="order-2 lg:order-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <h3 className="text-lg font-semibold theme-text-lg">Today's Habits</h3>
                <span className="text-sm text-gray-500">({habitsDone}/{todaysHabits.length})</span>
              </div>

              {todaysHabits.length > 0 && (
                <div className="space-y-3">
                  {todaysHabits.map(habit => {
                    const done = doneSet.has(habit.id)
                    return (
                      <Card key={habit.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleHabit(habit)}
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                                done 
                                  ? 'accent-bg accent-text' 
                                  : 'theme-bg-secondary theme-text-secondary'
                              }`}
                              title="Tap to toggle"
                            >
                              {done ? (
                                <Check className="w-5 h-5" />
                              ) : (
                                <X className="w-5 h-5" />
                              )}
                            </button>
                            <div>
                              <p className="font-medium theme-text">{habit.name}</p>
                              <p className="text-sm text-muted">Today: {done ? 'Done' : 'Not yet'}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}

              {todaysHabits.length === 0 && habits.length > 0 && (
                <div className="text-center p-8 card">
                  <div className="text-4xl mb-4">✅</div>
                  <div className="text-lg font-semibold theme-text-lg mb-2">No habits scheduled today</div>
                  <div className="text-muted">You have {habits.length} habit{habits.length !== 1 ? 's' : ''} but none are scheduled for today.</div>
                </div>
              )}

              {habits.length === 0 && (
                <div className="text-center p-8 card">
                  <div className="text-4xl mb-4">✅</div>
                  <div className="text-lg font-semibold theme-text-lg mb-2">No habits yet</div>
                  <div className="text-muted">Create your first habit to start building good routines!</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom padding for better scrolling */}
      <div className="pb-20" />

      <AIChatButton onClick={() => navigate('/ai-chat')} />
      <FAB onClick={() => setOpenQL(true)} />
      <QuickLogModal open={openQL} onClose={() => setOpenQL(false)} user={user} onSave={refreshData} />

    </div>
  )
}
