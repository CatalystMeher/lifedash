import { useMemo } from 'react'
import dayjs from 'dayjs'
import { Plus } from 'lucide-react'

export default function CalendarYearView({ 
  currentDate, 
  events, 
  todos, 
  onEventClick, 
  onEventDelete, 
  onCreateEvent,
  colorOptions 
}) {
  // Generate months for the year
  const months = useMemo(() => {
    const year = currentDate.year()
    return Array.from({ length: 12 }, (_, i) => dayjs().year(year).month(i))
  }, [currentDate])

  const handleDayClick = (date) => {
    onCreateEvent({ date })
  }

  const isToday = (date) => date.isSame(dayjs(), 'day')
  const isCurrentMonth = (date, month) => date.isSame(month, 'month')
  const isWeekend = (date) => date.day() === 0 || date.day() === 6

  // Generate calendar days for a month
  const getMonthDays = (month) => {
    const startOfMonth = month.startOf('month')
    const endOfMonth = month.endOf('month')
    const startOfWeek = startOfMonth.startOf('week')
    const endOfWeek = endOfMonth.endOf('week')
    
    const days = []
    let currentDay = startOfWeek
    
    while (currentDay.isBefore(endOfWeek) || currentDay.isSame(endOfWeek, 'day')) {
      days.push(currentDay)
      currentDay = currentDay.add(1, 'day')
    }
    
    return days
  }

  // Get event count for a day
  const getDayEventCount = (date) => {
    const dayKey = date.format('YYYY-MM-DD')
    const dayEvents = events[dayKey] || []
    const dayTodos = todos[dayKey] || []
    return dayEvents.length + dayTodos.length
  }

  return (
    <div className="h-full w-full p-4 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-8 gap-4 lg:gap-6">
        {months.map(month => {
          const monthDays = getMonthDays(month)
          
          return (
                         <div
               key={month.format('YYYY-MM')}
               className="theme-bg rounded-lg border theme-border overflow-hidden"
             >
               {/* Month header */}
               <div className="p-3 border-b theme-border theme-bg-secondary">
                 <h3 className="text-lg font-semibold theme-text text-center">
                   {month.format('MMMM YYYY')}
                 </h3>
               </div>

                             {/* Day headers */}
               <div className="grid grid-cols-7 gap-px theme-border">
                 {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                   <div
                     key={day}
                     className="p-1 text-center theme-bg-secondary"
                   >
                     <div className="text-xs font-medium text-muted">
                       {day}
                     </div>
                   </div>
                 ))}
               </div>

                             {/* Calendar grid */}
               <div className="grid grid-cols-7 gap-px theme-border">
                 {monthDays.map(day => {
                   const eventCount = getDayEventCount(day)
                   
                   return (
                     <div
                       key={day.format('YYYY-MM-DD')}
                       onClick={() => handleDayClick(day)}
                       className={`theme-bg p-1 cursor-pointer hover:theme-bg-secondary transition-colors min-h-[32px] flex flex-col items-center justify-center ${
                         !isCurrentMonth(day, month) ? 'opacity-30' : ''
                       } ${
                         isToday(day) ? 'ring-1 ring-accent-bg' : ''
                       }`}
                     >
                                             {/* Day number */}
                       <div className={`text-xs font-medium ${
                         isToday(day) 
                           ? 'accent-text font-bold' 
                           : isWeekend(day)
                           ? 'text-red-500 dark:text-red-400'
                           : isCurrentMonth(day, month)
                           ? 'theme-text'
                           : 'text-muted'
                       }`}>
                        {day.format('D')}
                      </div>

                                             {/* Event indicator */}
                       {eventCount > 0 && (
                         <div className="w-1 h-1 accent-bg rounded-full mt-0.5" />
                       )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
