import { useState } from 'react'
import dayjs from 'dayjs'
import { 
  Clock, 
  MapPin, 
  Link as LinkIcon, 
  Bell, 
  Repeat, 
  MoreHorizontal,
  Trash2,
  Edit
} from 'lucide-react'

export default function CalendarEvent({ 
  event, 
  onClick, 
  onDelete, 
  colorOptions,
  compact = false,
  draggable = false 
}) {
  const [showMenu, setShowMenu] = useState(false)
  
  const colorOption = colorOptions?.find(c => c.value === event.color) || colorOptions?.[0]
  const startTime = dayjs(event.start_time)
  const endTime = dayjs(event.end_time)
  const duration = endTime.diff(startTime, 'minute')
  
  const handleClick = (e) => {
    e.stopPropagation()
    onClick(event)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete(event)
    setShowMenu(false)
  }

  const handleMenuToggle = (e) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className={`relative p-2 rounded-lg cursor-pointer transition-all hover:shadow-md group ${
          draggable ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        style={{ backgroundColor: event.color + '20', borderLeft: `4px solid ${event.color}` }}
        draggable={draggable}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium theme-text line-clamp-1">
              {event.title}
            </div>
            {!event.all_day && (
              <div className="text-xs text-muted">
                {startTime.format('h:mm A')} - {endTime.format('h:mm A')}
              </div>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={handleMenuToggle}
              className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-6 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border theme-border min-w-[120px]">
                <button
                  onClick={handleClick}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      className={`relative p-3 rounded-lg cursor-pointer transition-all hover:shadow-md group border theme-border ${
        draggable ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      style={{ backgroundColor: event.color + '10', borderColor: event.color + '30' }}
      draggable={draggable}
    >
      {/* Event Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium theme-text line-clamp-1">
            {event.title}
          </h4>
          {event.description && (
            <p className="text-sm text-muted line-clamp-2 mt-1">
              {event.description}
            </p>
          )}
        </div>
        
        <div className="relative ml-2">
          <button
            onClick={handleMenuToggle}
            className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-6 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border theme-border min-w-[120px]">
              <button
                onClick={handleClick}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-1">
        {/* Time */}
        <div className="flex items-center gap-2 text-sm text-muted">
          <Clock className="w-3 h-3" />
          <span>
            {event.all_day 
              ? 'All day'
              : `${startTime.format('h:mm A')} - ${endTime.format('h:mm A')}`
            }
          </span>
          {!event.all_day && duration > 0 && (
            <span className="text-xs">({Math.round(duration / 60 * 10) / 10}h)</span>
          )}
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <MapPin className="w-3 h-3" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        )}

        {/* URL */}
        {event.url && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <LinkIcon className="w-3 h-3" />
            <a 
              href={event.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="line-clamp-1 text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {event.url}
            </a>
          </div>
        )}

        {/* Reminder */}
        {event.reminder_minutes > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Bell className="w-3 h-3" />
            <span>
              {event.reminder_minutes >= 60 
                ? `${Math.floor(event.reminder_minutes / 60)}h ${event.reminder_minutes % 60}m before`
                : `${event.reminder_minutes}m before`
              }
            </span>
          </div>
        )}

        {/* Repeat */}
        {event.repeat_type !== 'none' && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Repeat className="w-3 h-3" />
            <span className="capitalize">{event.repeat_type}</span>
            {event.repeat_until && (
              <span>until {dayjs(event.repeat_until).format('MMM D, YYYY')}</span>
            )}
          </div>
        )}
      </div>

      {/* Color indicator */}
      <div 
        className="absolute top-0 left-0 w-1 h-full rounded-l-lg"
        style={{ backgroundColor: event.color }}
      />
    </div>
  )
}
