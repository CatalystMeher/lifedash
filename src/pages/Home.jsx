import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Card from '../components/Card'
import Sparkline from '../components/Sparkline'
import FAB from '../components/FAB'
import QuickLogModal from '../components/QuickLogModal'
import InstallPrompt from '../components/InstallPrompt'
import useUser from '../hooks/useUser'
import { supabase } from '../lib/supabase'
import { lastNDays, todayKey, daysBetween } from '../lib/dateRange'
import * as LucideIcons from 'lucide-react'
import dayjs from 'dayjs'
import { Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

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
  const [openQL, setOpenQL] = useState(false)
  const [statsPeriod, setStatsPeriod] = useState('today') // 'today', '7d', '30d', 'lifetime'

  const { from, to } = lastNDays(7)
  const tkey = todayKey()

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

  // Toggle habit completion
  const toggleHabit = async (habit) => {
    if (!user?.id) return
    const done = !doneSet.has(habit.id)
    const { error } = await supabase.from('habit_checkins').upsert({
      user_id: user.id, habit_id: habit.id, day: tkey, done
    }, { onConflict: 'user_id,habit_id,day' })
    if (error) return toast.error(error.message)
    toast.success(done ? 'Marked done' : 'Marked not done')
    // Refetch checkins to update UI
    window.location.reload()
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

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'today': return 'Today'
      case '7d': return '7d'
      case '30d': return '30d'
      case 'lifetime': return 'All'
      default: return period
    }
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
      <section className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted mb-2">Focus (min)</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{focusToday}</h3>
            <span className="text-xs text-muted">today</span>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted mb-2">Habits done</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{habitsDone}/{todaysHabits.length}</h3>
            <span className="text-xs text-muted">today</span>
          </div>
        </Card>

        <Card className="p-6 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">This week (focus)</p>
            <span className="text-xs text-muted">last 7 days</span>
          </div>
          <div className="text-green-500">
            <Sparkline data={spark.map(x => ({ d: x.d, v: x.v }))} />
          </div>
        </Card>
      </section>

      {/* Stats */}
      {stats.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Stats</h4>
            <div className="flex gap-2">
              {[
                { key: 'today', label: 'Today' },
                { key: '7d', label: '7d' },
                { key: '30d', label: '30d' },
                { key: 'lifetime', label: 'All' }
              ].map(period => (
                <button
                  key={period.key}
                  onClick={() => setStatsPeriod(period.key)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    statsPeriod === period.key
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.slice(0, 6).map(stat => {
              const periodValue = periodValues.get(stat.id) || 0
              const unit = stat.unit || (stat.type === 'duration' ? 'min' : '')
              const IconComponent = stat.icon && LucideIcons[stat.icon] ? LucideIcons[stat.icon] : LucideIcons.BarChart3
              return (
                <Card key={stat.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted mb-1">{stat.name}</p>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {periodValue}{unit ? ` ${unit}` : ''}
                      </h3>
                      <p className="text-xs text-muted">
                        {getPeriodDescription(statsPeriod)}
                      </p>
                    </div>
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: stat.color || '#e5e5e5' }}
                    >
                      <IconComponent className="w-4 h-4 text-gray-700 dark:text-gray-300" />
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
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Stats</h4>
          <div className="text-center p-8 card">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No stats yet</div>
            <div className="text-muted">Create your first stat to start tracking!</div>
          </div>
        </section>
      )}

      {/* Today's Habits */}
      {todaysHabits.length > 0 && (
        <section>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Today's Habits</h4>
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
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
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
                        <p className="font-medium text-gray-900 dark:text-gray-100">{habit.name}</p>
                        <p className="text-sm text-muted">Today: {done ? 'Done' : 'Not yet'}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {todaysHabits.length === 0 && habits.length > 0 && (
        <section>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Today's Habits</h4>
          <div className="text-center p-8 card">
            <div className="text-4xl mb-4">✅</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No habits scheduled today</div>
            <div className="text-muted">You have {habits.length} habit{habits.length !== 1 ? 's' : ''} but none are scheduled for today.</div>
          </div>
        </section>
      )}

      {habits.length === 0 && (
        <section>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Today's Habits</h4>
          <div className="text-center p-8 card">
            <div className="text-4xl mb-4">✅</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No habits yet</div>
            <div className="text-muted">Create your first habit to start building good routines!</div>
          </div>
        </section>
      )}

      <FAB onClick={() => setOpenQL(true)} />
      <QuickLogModal open={openQL} onClose={() => setOpenQL(false)} user={user} />
      <InstallPrompt />
    </div>
  )
}
