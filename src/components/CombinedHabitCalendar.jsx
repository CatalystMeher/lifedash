import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import weekday from 'dayjs/plugin/weekday'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
dayjs.extend(isoWeek); dayjs.extend(weekday)

export default function CombinedHabitCalendar({ habits, user }) {
  const [allCheckins, setAllCheckins] = useState(new Map()) // 'YYYY-MM-DD' -> { habitId: done }
  const month = dayjs()
  const start = month.startOf('month').weekday(0) // start on Sunday row
  const end = month.endOf('month').weekday(6)
  const grid = useMemo(() => {
    const arr = []
    let d = start
    while (d.isBefore(end) || d.isSame(end, 'day')) {
      arr.push(d)
      d = d.add(1, 'day')
    }
    return arr
  }, [start, end])

  useEffect(() => {
    if (!habits.length || !user?.id) return
    
    const from = month.startOf('month').format('YYYY-MM-DD')
    const to = month.endOf('month').format('YYYY-MM-DD')
    const habitIds = habits.map(h => h.id)
    
    supabase.from('habit_checkins')
      .select('day, done, habit_id')
      .eq('user_id', user.id)
      .in('habit_id', habitIds)
      .gte('day', from)
      .lte('day', to)
      .then(({ data, error }) => {
        if (error) { toast.error(error.message); return }
        
        const checkinsMap = new Map()
        data?.forEach(r => {
          const dayKey = dayjs(r.day).format('YYYY-MM-DD')
          if (!checkinsMap.has(dayKey)) {
            checkinsMap.set(dayKey, new Map())
          }
          checkinsMap.get(dayKey).set(r.habit_id, !!r.done)
        })
        setAllCheckins(checkinsMap)
      })
  }, [habits, user?.id, month])

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold theme-text">{month.format('MMMM YYYY')}</div>
        <div className="text-sm text-muted">Combined View</div>
      </div>
      
      {/* Legend */}
      <div className="mb-4 p-3 theme-bg-secondary rounded-lg">
        <div className="text-sm font-medium theme-text mb-2">Habits:</div>
        <div className="flex flex-wrap gap-2">
          {habits.map(habit => (
            <div key={habit.id} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: habit.color || '#e5e5e5' }}
              />
              <span className="text-xs theme-text-secondary">{habit.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {grid.map((d) => {
          const key = d.format('YYYY-MM-DD')
          const dayCheckins = allCheckins.get(key) || new Map()
          const dim = d.month() !== month.month()
          const completedHabits = habits.filter(habit => dayCheckins.get(habit.id))
          
          return (
            <div key={key}
              className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center text-sm font-medium transition-all duration-200 ${
                completedHabits.length > 0
                  ? 'accent-bg accent-border'
                  : 'theme-bg-secondary theme-border'
              } ${
                dim ? 'opacity-40' : ''
              }`}>
              <div className="flex flex-col items-center">
                <span className="text-xs theme-text">{d.date()}</span>
                {!dim && completedHabits.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-0.5 justify-center max-w-full">
                    {completedHabits.map(habit => (
                      <div 
                        key={habit.id}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: habit.color || '#e5e5e5' }}
                        title={`${habit.name} - Done`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
