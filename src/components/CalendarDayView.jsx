import { useMemo } from 'react'
import dayjs from 'dayjs'
import { Clock, Plus, MapPin, Link as LinkIcon } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useDroppable,
} from '@dnd-kit/core'
import CalendarEvent from './CalendarEvent'
import DraggableTimeSelector from './DraggableTimeSelector'

const timeSlots = Array.from({ length: 24 }, (_, i) => i)

export default function CalendarDayView({ 
  currentDate, 
  events, 
  todos, 
  onEventClick, 
  onEventDelete, 
  onCreateEvent,
  onEventMove,
  colorOptions 
}) {
  const dayEvents = events[currentDate.format('YYYY-MM-DD')] || []
  const dayTodos = todos[currentDate.format('YYYY-MM-DD')] || []
  
  // Group events by hour for rendering
  const eventsByHour = useMemo(() => {
    const grouped = {}
    dayEvents.forEach(event => {
      const hour = dayjs(event.start_time).hour()
      if (!grouped[hour]) {
        grouped[hour] = []
      }
      grouped[hour].push(event)
    })
    return grouped
  }, [dayEvents])

  const handleTimeSlotClick = (hour) => {
    onCreateEvent({
      date: currentDate,
      startTime: hour,
      endTime: hour + 1
    })
  }

  const handleTimeSelect = (timeRange) => {
    const startTime = dayjs(currentDate)
      .hour(timeRange.startTime)
      .minute(timeRange.startMinute)
      .second(0)
    
    const endTime = dayjs(currentDate)
      .hour(timeRange.endTime)
      .minute(timeRange.endMinute)
      .second(0)
    
    onCreateEvent({
      date: currentDate,
      startTime: startTime.format('YYYY-MM-DDTHH:mm'),
      endTime: endTime.format('YYYY-MM-DDTHH:mm')
    })
  }

  const isToday = currentDate.isSame(dayjs(), 'day')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find the event being dragged
    const draggedEvent = dayEvents.find(e => e.id === activeId)
    if (!draggedEvent) return

    // Check if dropped on a time slot
    if (overId.startsWith('time-slot-')) {
      const hour = parseInt(overId.replace('time-slot-', ''))
      onEventMove(draggedEvent, { date: currentDate, hour })
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b theme-border theme-bg-secondary">
        <div>
          <h3 className="text-lg font-semibold theme-text">
            {currentDate.format('dddd, MMMM D, YYYY')}
          </h3>
          <p className="text-sm text-muted">
            {dayEvents.length} events • {dayTodos.length} todos
          </p>
        </div>
        {isToday && (
          <div className="text-sm font-medium accent-text">
            Today
          </div>
        )}
      </div>

      {/* Todos Section */}
      {dayTodos.length > 0 && (
        <div className="p-4 border-b theme-border theme-bg-secondary">
          <h4 className="text-sm font-medium theme-text mb-2">Todos</h4>
          <div className="space-y-1">
            {dayTodos.map(todo => (
              <div
                key={todo.id}
                className="flex items-center gap-2 p-2 rounded-lg theme-bg border theme-border"
              >
                <div className={`w-2 h-2 rounded-full ${
                  todo.priority === 2 ? 'bg-red-500' :
                  todo.priority === 1 ? 'bg-orange-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm theme-text line-clamp-1">{todo.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

            {/* Time Grid */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Draggable Time Selector */}
        <DraggableTimeSelector
          onTimeSelect={handleTimeSelect}
          startHour={0}
          endHour={24}
          currentDate={currentDate}
          className="left-16 right-4"
        />
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={dayEvents.map(event => event.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="relative">
              {timeSlots.map(hour => {
                const hourEvents = eventsByHour[hour] || []
                const timeLabel = dayjs().hour(hour).minute(0).format('h A')
                const isCurrentHour = isToday && hour === dayjs().hour()
                
                return (
                  <DroppableTimeSlot key={hour} hour={hour}>
                    <div
                      className={`relative border-b theme-border calendar-time-slot ${
                        isCurrentHour ? 'theme-bg-secondary' : ''
                      }`}
                    >
                      {/* Time Label */}
                      <div className="absolute left-0 top-0 w-16 h-full flex items-start justify-end pr-2 pt-1">
                        <span className="text-xs text-muted font-medium">
                          {timeLabel}
                        </span>
                      </div>

                      {/* Current Time Indicator */}
                      {isCurrentHour && (
                        <div className="absolute left-16 right-0 top-0 flex items-center">
                          <div className="w-full h-0.5 bg-red-500 relative">
                            <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full" />
                          </div>
                        </div>
                      )}

                      {/* Events for this hour */}
                      <div className="ml-16 pr-4 py-1 relative z-10">
                        {hourEvents.map(event => (
                          <CalendarEvent
                            key={event.id}
                            event={event}
                            onClick={() => onEventClick(event)}
                            onDelete={() => onEventDelete(event)}
                            colorOptions={colorOptions}
                            draggable={true}
                          />
                        ))}
                        
                        {/* Empty time slot - clickable for creating events */}
                        {hourEvents.length === 0 && (
                          <div
                            onClick={() => handleTimeSlotClick(hour)}
                            className="w-full h-8 cursor-pointer hover:theme-bg-secondary transition-colors"
                          />
                        )}
                      </div>
                    </div>
                  </DroppableTimeSlot>
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}

// DroppableTimeSlot component
function DroppableTimeSlot({ children, hour }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `time-slot-${hour}`,
  })

  return (
    <div
      ref={setNodeRef}
      className={`${isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
    >
      {children}
    </div>
  )
}
