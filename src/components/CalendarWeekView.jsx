import { useMemo } from 'react'
import dayjs from 'dayjs'
import { Plus } from 'lucide-react'
import CalendarEvent from './CalendarEvent'
import DraggableTimeSelector from './DraggableTimeSelector'

export default function CalendarWeekView({ 
  currentDate, 
  events, 
  todos, 
  onEventClick, 
  onEventDelete, 
  onCreateEvent,
  colorOptions,
  daysToShow = 7 
}) {
  // Generate days to show
  const days = useMemo(() => {
    const startDate = currentDate.startOf('week')
    return Array.from({ length: daysToShow }, (_, i) => startDate.add(i, 'day'))
  }, [currentDate, daysToShow])

  const handleDayClick = (date) => {
    onCreateEvent({ date })
  }

  const handleTimeSlotClick = (date, hour) => {
    onCreateEvent({
      date,
      startTime: hour,
      endTime: hour + 1
    })
  }

  const handleTimeSelect = (timeRange) => {
    const startTime = dayjs(timeRange.date)
      .hour(timeRange.startTime)
      .minute(timeRange.startMinute)
      .second(0)
    
    const endTime = dayjs(timeRange.date)
      .hour(timeRange.endTime)
      .minute(timeRange.endMinute)
      .second(0)
    
    onCreateEvent({
      date: timeRange.date,
      startTime: startTime.format('YYYY-MM-DDTHH:mm'),
      endTime: endTime.format('YYYY-MM-DDTHH:mm')
    })
  }

  const isToday = (date) => date.isSame(dayjs(), 'day')

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header with day names */}
      <div className={`grid gap-px theme-border ${daysToShow === 3 ? 'grid-cols-3' : 'grid-cols-7'}`}>
        {days.map(day => (
          <div
            key={day.format('YYYY-MM-DD')}
            className={`p-3 text-center theme-bg-secondary border-b theme-border ${
              isToday(day) ? 'accent-bg accent-text' : ''
            }`}
          >
            <div className="text-sm font-medium text-muted">
              {day.format('ddd')}
            </div>
            <div className={`text-lg font-semibold ${
              isToday(day) ? 'accent-text' : 'theme-text'
            }`}>
              {day.format('D')}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={`flex-1 grid gap-px theme-border ${daysToShow === 3 ? 'grid-cols-3' : 'grid-cols-7'}`}>
        {days.map(day => {
          const dayKey = day.format('YYYY-MM-DD')
          const dayEvents = events[dayKey] || []
          const dayTodos = todos[dayKey] || []
          
          return (
            <div
              key={dayKey}
              className={`theme-bg flex flex-col ${
                isToday(day) ? 'ring-2 ring-accent-bg ring-inset' : ''
              }`}
            >
                             {/* Day Header - Clickable for creating all-day events */}
               <div
                 onClick={() => handleDayClick(day)}
                 className="p-2 border-b theme-border cursor-pointer hover:theme-bg-secondary transition-colors"
               >
                {/* Todos */}
                {dayTodos.length > 0 && (
                  <div className="mb-2">
                    {dayTodos.slice(0, 3).map(todo => (
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
                    {dayTodos.length > 3 && (
                      <div className="text-xs text-muted">
                        +{dayTodos.length - 3} more
                      </div>
                    )}
                  </div>
                )}

                {/* All-day events */}
                {dayEvents.filter(e => e.all_day).length > 0 && (
                  <div className="space-y-1">
                    {dayEvents.filter(e => e.all_day).map(event => (
                      <CalendarEvent
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick(event)}
                        onDelete={() => onEventDelete(event)}
                        colorOptions={colorOptions}
                        compact={true}
                      />
                    ))}
                  </div>
                )}

                                   {/* Add event button */}
                   {dayEvents.length === 0 && dayTodos.length === 0 && (
                     <div
                       onClick={(e) => {
                         e.stopPropagation()
                         handleDayClick(day)
                       }}
                       className="w-full h-6 cursor-pointer hover:theme-bg-secondary transition-colors"
                     />
                   )}
              </div>

                             {/* Time slots */}
               <div className="flex-1 overflow-y-auto relative">
                 {/* Draggable Time Selector */}
                 <DraggableTimeSelector
                   onTimeSelect={handleTimeSelect}
                   startHour={6}
                   endHour={22}
                   currentDate={day}
                   className="left-8 right-1"
                 />
                 
                 {Array.from({ length: 16 }, (_, hour) => {
                   const timeEvents = dayEvents.filter(e => 
                     !e.all_day && dayjs(e.start_time).hour() === hour + 6
                   )
                   const timeLabel = dayjs().hour(hour + 6).minute(0).format('h A')
                   
                   return (
                     <div
                       key={hour}
                       className="relative border-b theme-border calendar-week-time-slot hover:theme-bg-secondary transition-colors"
                     >
                       {/* Time label */}
                       <div className="absolute left-0 top-0 w-8 h-full flex items-start justify-end pr-1 pt-1">
                         <span className="text-xs text-muted">
                           {timeLabel}
                         </span>
                       </div>

                       {/* Events for this time slot */}
                       <div className="ml-8 pr-1 py-1 relative z-10">
                         {timeEvents.map(event => (
                           <CalendarEvent
                             key={event.id}
                             event={event}
                             onClick={() => onEventClick(event)}
                             onDelete={() => onEventDelete(event)}
                             colorOptions={colorOptions}
                             compact={true}
                             draggable={true}
                           />
                         ))}
                         
                         {/* Empty time slot */}
                         {timeEvents.length === 0 && (
                           <div
                             onClick={() => handleTimeSlotClick(day, hour + 6)}
                             className="w-full h-6 cursor-pointer hover:theme-bg-secondary transition-colors opacity-0 hover:opacity-100"
                           />
                         )}
                       </div>
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
