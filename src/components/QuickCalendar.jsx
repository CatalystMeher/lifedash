import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import dayjs from 'dayjs'

export default function QuickCalendar({ selectedDate, onDateSelect, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(dayjs())

  const calendarDays = useMemo(() => {
    const start = currentMonth.startOf('month').startOf('week')
    const end = currentMonth.endOf('month').endOf('week')
    const days = []
    let day = start

    while (day.isBefore(end) || day.isSame(end, 'day')) {
      days.push(day)
      day = day.add(1, 'day')
    }

    return days
  }, [currentMonth])

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handleDateClick = (date) => {
    onDateSelect(date.format('YYYY-MM-DD'))
    onClose()
  }

  const isToday = (date) => dayjs().isSame(date, 'day')
  const isSelected = (date) => selectedDate && dayjs(selectedDate).isSame(date, 'day')
  const isCurrentMonth = (date) => currentMonth.isSame(date, 'month')

  return (
    <div className="absolute top-full left-0 right-0 mt-2 theme-bg-secondary border theme-border rounded-xl shadow-lg z-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(prev => prev.subtract(1, 'month'))}
          className="p-2 hover:theme-bg rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-muted" />
        </button>
        <h3 className="text-sm font-semibold theme-text">
          {currentMonth.format('MMMM YYYY')}
        </h3>
        <button
          onClick={() => setCurrentMonth(prev => prev.add(1, 'month'))}
          className="p-2 hover:theme-bg rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-muted" />
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-xs text-center text-muted font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(date)}
            className={`
              w-8 h-8 text-xs rounded-full flex items-center justify-center transition-all duration-200
              ${isToday(date) 
                ? 'accent-bg accent-text font-semibold' 
                : isSelected(date)
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold'
                : isCurrentMonth(date)
                ? 'hover:theme-bg theme-text'
                : 'text-muted'
              }
            `}
          >
            {date.format('D')}
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mt-4 pt-3 border-t theme-border">
        <button
          onClick={() => handleDateClick(dayjs())}
          className="flex-1 px-3 py-2 text-xs theme-button-secondary rounded-lg transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => handleDateClick(dayjs().add(1, 'day'))}
          className="flex-1 px-3 py-2 text-xs theme-button-secondary rounded-lg transition-colors"
        >
          Tomorrow
        </button>
        <button
          onClick={onClose}
          className="px-3 py-2 text-xs theme-button-secondary rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
