import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import weekday from 'dayjs/plugin/weekday'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Check, X } from 'lucide-react'
dayjs.extend(isoWeek); dayjs.extend(weekday)

export default function HabitCalendar({ habit, user }) {
  const [daysMap, setDaysMap] = useState(new Map()) // 'YYYY-MM-DD' -> done:boolean
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
    if (!habit) return
    const from = month.startOf('month').format('YYYY-MM-DD')
    const to = month.endOf('month').format('YYYY-MM-DD')
    supabase.from('habit_checkins').select('day,done').eq('user_id', user.id).eq('habit_id', habit.id).gte('day', from).lte('day', to)
      .then(({ data, error }) => {
        if (error) { toast.error(error.message); return }
        const m = new Map()
        data?.forEach(r => m.set(dayjs(r.day).format('YYYY-MM-DD'), !!r.done))
        setDaysMap(m)
      })
  }, [habit, user?.id, month])

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-gray-900 dark:text-gray-100">{month.format('MMMM YYYY')}</div>
        <div className="text-sm text-muted">Sun–Sat</div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {grid.map((d) => {
          const key = d.format('YYYY-MM-DD')
          const done = daysMap.get(key)
          const dim = d.month() !== month.month()
          return (
            <div key={key}
              className={`aspect-square rounded-xl border-2 flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                done 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
              } ${
                dim ? 'opacity-40' : ''
              }`}>
              <div className="flex flex-col items-center">
                <span className="text-xs">{d.date()}</span>
                {!dim && (
                  <div className="mt-1">
                    {done ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <X className="w-3 h-3 text-gray-400" />
                    )}
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
