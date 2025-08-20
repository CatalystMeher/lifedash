import { useMemo } from 'react'
import dayjs from 'dayjs'
import { Plus } from 'lucide-react'
import CalendarEvent from './CalendarEvent'

export default function CalendarMonthView({ 
  currentDate, 
  events, 
  todos, 
  onEventClick, 
  onEventDelete, 
  onCreateEvent,
  colorOptions 
}) {
  // Generate calendar grid for the month
  const calendarDays = useMemo(() => {
    const startOfMonth = currentDate.startOf('month')
    const endOfMonth = currentDate.endOf('month')
    const startOfWeek = startOfMonth.startOf('week')
    const endOfWeek = endOfMonth.endOf('week')
    
    const days = []
    let currentDay = startOfWeek
    
    while (currentDay.isBefore(endOfWeek) || currentDay.isSame(endOfWeek, 'day')) {
      days.push(currentDay)
      currentDay = currentDay.add(1, 'day')
    }
    
    return days
  }, [currentDate])

  const handleDayClick = (date) => {
    onCreateEvent({ date })
  }

  const isToday = (date) => date.isSame(dayjs(), 'day')
  const isCurrentMonth = (date) => date.isSame(currentDate, 'month')
  const isWeekend = (date) => date.day() === 0 || date.day() === 6

  return (
    <div className="flex flex-col h-full w-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px theme-border">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="p-3 text-center theme-bg-secondary border-b theme-border"
          >
            <div className="text-sm font-medium text-muted">
              {day}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 gap-px theme-border">
        {calendarDays.map(day => {
          const dayKey = day.format('YYYY-MM-DD')
          const dayEvents = events[dayKey] || []
          const dayTodos = todos[dayKey] || []
          
          return (
            <div
              key={dayKey}
              onClick={() => handleDayClick(day)}
              className={`theme-bg p-2 cursor-pointer hover:theme-bg-secondary transition-colors flex flex-col calendar-month-cell ${
                !isCurrentMonth(day) ? 'opacity-50' : ''
              } ${
                isToday(day) ? 'ring-2 ring-accent-bg ring-inset' : ''
              }`}
            >
              {/* Day number */}
              <div className={`text-sm font-medium mb-1 ${
                isToday(day) 
                  ? 'accent-text' 
                  : isWeekend(day)
                  ? 'text-red-500 dark:text-red-400'
                  : isCurrentMonth(day)
                  ? 'theme-text'
                  : 'text-muted'
              }`}>
                {day.format('D')}
              </div>

              {/* Todos */}
              {dayTodos.length > 0 && (
                <div className="mb-2">
                  {dayTodos.slice(0, 2).map(todo => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-1 mb-1"
                    >
                      <div className={`w-1 h-1 rounded-full ${
                        todo.priority === 2 ? 'bg-red-500' :
                        todo.priority === 1 ? 'bg-orange-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-xs theme-text line-clamp-1">
                        {todo.title}
                      </span>
                    </div>
                  ))}
                  {dayTodos.length > 2 && (
                    <div className="text-xs text-muted">
                      +{dayTodos.length - 2} more
                    </div>
                  )}
                </div>
              )}

              {/* Events */}
              <div className="flex-1 space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <CalendarEvent
                    key={event.id}
                    event={event}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                    onDelete={(e) => {
                      e.stopPropagation()
                      onEventDelete(event)
                    }}
                    colorOptions={colorOptions}
                    compact={true}
                  />
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted text-center">
                    +{dayEvents.length - 3} more events
                  </div>
                )}
              </div>

                             {/* Add event button for empty days */}
               {dayEvents.length === 0 && dayTodos.length === 0 && isCurrentMonth(day) && (
                 <div
                   onClick={(e) => {
                     e.stopPropagation()
                     handleDayClick(day)
                   }}
                   className="w-full h-6 cursor-pointer hover:theme-bg-secondary transition-colors opacity-0 hover:opacity-100"
                 />
               )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
