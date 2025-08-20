import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Link as LinkIcon,
  Bell,
  Repeat,
  Trash2,
  Edit,
  MoreHorizontal,
  Grid3X3,
  CalendarDays,
  CalendarRange,
  CalendarCheck
} from 'lucide-react'
import CalendarDayView from './CalendarDayView'
import CalendarWeekView from './CalendarWeekView'
import CalendarMonthView from './CalendarMonthView'
import CalendarYearView from './CalendarYearView'
import EventModal from './EventModal'
import ConfirmDialog from './ConfirmDialog'
import toast from 'react-hot-toast'

const viewModes = [
  { id: 'day', label: 'Day', icon: CalendarCheck },
  { id: '3day', label: '3 Days', icon: CalendarDays },
  { id: 'week', label: 'Week', icon: CalendarRange },
  { id: 'month', label: 'Month', icon: CalendarIcon },
  { id: 'year', label: 'Year', icon: Grid3X3 }
]

const colorOptions = [
  { value: '#3b82f6', label: 'Blue', class: 'bg-blue-500' },
  { value: '#ef4444', label: 'Red', class: 'bg-red-500' },
  { value: '#10b981', label: 'Green', class: 'bg-green-500' },
  { value: '#f59e0b', label: 'Orange', class: 'bg-orange-500' },
  { value: '#8b5cf6', label: 'Purple', class: 'bg-purple-500' },
  { value: '#ec4899', label: 'Pink', class: 'bg-pink-500' },
  { value: '#06b6d4', label: 'Cyan', class: 'bg-cyan-500' },
  { value: '#84cc16', label: 'Lime', class: 'bg-lime-500' }
]

async function fetchCalendarEvents(userId, startDate, endDate) {
  const { data, error } = await supabase
    .from('calendar_events')
    .select(`
      *,
      todos (
        id,
        title,
        completed
      )
    `)
    .eq('user_id', userId)
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString())
    .order('start_time', { ascending: true })
  
  if (error) throw error
  return data || []
}

async function fetchTodos(userId) {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', false)
    .order('due_date', { ascending: true })
    .order('priority', { ascending: false })
  
  if (error) throw error
  return data || []
}

export default function CalendarManager({ user }) {
  const queryClient = useQueryClient()
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [viewMode, setViewMode] = useState('week')
  const [openEventModal, setOpenEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [deleteEvent, setDeleteEvent] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    const start = currentDate.startOf(viewMode === '3day' ? 'day' : viewMode)
    const end = currentDate.endOf(viewMode === '3day' ? 'day' : viewMode)
    
    if (viewMode === '3day') {
      return {
        start: start,
        end: start.add(2, 'day').endOf('day')
      }
    }
    
    return { start, end }
  }, [currentDate, viewMode])

  // Fetch events for the current date range
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['calendar-events', user?.id, dateRange.start.format('YYYY-MM-DD'), dateRange.end.format('YYYY-MM-DD')],
    queryFn: () => fetchCalendarEvents(user.id, dateRange.start, dateRange.end),
    enabled: !!user
  })

  // Fetch todos for display
  const { data: todos = [] } = useQuery({
    queryKey: ['todos-calendar', user?.id],
    queryFn: () => fetchTodos(user.id),
    enabled: !!user
  })

  // Group events by date for easier rendering
  const eventsByDate = useMemo(() => {
    const grouped = {}
    events.forEach(event => {
      const dateKey = dayjs(event.start_time).format('YYYY-MM-DD')
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    return grouped
  }, [events])

  // Group todos by date
  const todosByDate = useMemo(() => {
    const grouped = {}
    todos.forEach(todo => {
      if (todo.due_date) {
        if (!grouped[todo.due_date]) {
          grouped[todo.due_date] = []
        }
        grouped[todo.due_date].push(todo)
      }
    })
    return grouped
  }, [todos])

  const navigateDate = (direction) => {
    let newDate
    switch (viewMode) {
      case 'day':
        newDate = currentDate.add(direction, 'day')
        break
      case '3day':
        newDate = currentDate.add(direction * 3, 'day')
        break
      case 'week':
        newDate = currentDate.add(direction, 'week')
        break
      case 'month':
        newDate = currentDate.add(direction, 'month')
        break
      case 'year':
        newDate = currentDate.add(direction, 'year')
        break
      default:
        newDate = currentDate.add(direction, 'week')
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(dayjs())
  }

  const handleCreateEvent = (timeSlot = null) => {
    setSelectedTimeSlot(timeSlot)
    setEditingEvent(null)
    setOpenEventModal(true)
  }

  const handleEditEvent = (event) => {
    setEditingEvent(event)
    setSelectedTimeSlot(null)
    setOpenEventModal(true)
  }

  const handleDeleteEvent = (event) => {
    setDeleteEvent(event)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteEvent) return
    
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', deleteEvent.id)
    
    if (error) {
      toast.error('Failed to delete event')
      return
    }
    
    queryClient.invalidateQueries(['calendar-events'])
    toast.success('Event deleted')
    setShowDeleteDialog(false)
    setDeleteEvent(null)
  }

  const handleEventCreated = () => {
    queryClient.invalidateQueries(['calendar-events'])
    setEditingEvent(null)
    setSelectedTimeSlot(null)
  }

  const handleEventMove = async (event, newTimeSlot) => {
    const { date, hour } = newTimeSlot
    const newStartTime = dayjs(date).hour(hour).minute(0)
    const duration = dayjs(event.end_time).diff(dayjs(event.start_time), 'minute')
    const newEndTime = newStartTime.add(duration, 'minute')

    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({
          start_time: newStartTime.toISOString(),
          end_time: newEndTime.toISOString()
        })
        .eq('id', event.id)
      
      if (error) throw error
      
      queryClient.invalidateQueries(['calendar-events'])
      toast.success('Event moved successfully')
    } catch (error) {
      console.error('Error moving event:', error)
      toast.error('Failed to move event')
    }
  }

  const renderCalendarView = () => {
    const props = {
      currentDate,
      events: eventsByDate,
      todos: todosByDate,
      onEventClick: handleEditEvent,
      onEventDelete: handleDeleteEvent,
      onCreateEvent: handleCreateEvent,
      onEventMove: handleEventMove,
      colorOptions
    }

    switch (viewMode) {
      case 'day':
        return <CalendarDayView {...props} />
      case '3day':
        return <CalendarWeekView {...props} daysToShow={3} />
      case 'week':
        return <CalendarWeekView {...props} daysToShow={7} />
      case 'month':
        return <CalendarMonthView {...props} />
      case 'year':
        return <CalendarYearView {...props} />
      default:
        return <CalendarWeekView {...props} daysToShow={7} />
    }
  }

  const getViewTitle = () => {
    switch (viewMode) {
      case 'day':
        return currentDate.format('dddd, MMMM D, YYYY')
      case '3day':
        const endDate = currentDate.add(2, 'day')
        return `${currentDate.format('MMM D')} - ${endDate.format('MMM D, YYYY')}`
      case 'week':
        return `${currentDate.startOf('week').format('MMM D')} - ${currentDate.endOf('week').format('MMM D, YYYY')}`
      case 'month':
        return currentDate.format('MMMM YYYY')
      case 'year':
        return currentDate.format('YYYY')
      default:
        return currentDate.format('MMMM YYYY')
    }
  }

  if (eventsLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center p-6 card">
          <div className="text-muted">Loading calendar...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold theme-text">Calendar</h2>
          <p className="text-sm text-muted">
            {events.length} events • {todos.length} todos
          </p>
        </div>
        <button 
          onClick={() => handleCreateEvent()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 rounded-xl theme-button-secondary hover:theme-bg-secondary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium theme-button-secondary rounded-xl hover:theme-bg-secondary transition-colors"
          >
            Today
          </button>
          
          <button
            onClick={() => navigateDate(1)}
            className="p-2 rounded-xl theme-button-secondary hover:theme-bg-secondary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* View Title */}
        <h3 className="text-lg font-semibold theme-text">
          {getViewTitle()}
        </h3>

        {/* View Mode Selector */}
        <div className="flex items-center gap-1 p-1 theme-bg-secondary rounded-xl">
          {viewModes.map((mode) => {
            const IconComponent = mode.icon
            const isActive = viewMode === mode.id
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'accent-bg accent-text shadow-sm'
                    : 'theme-text-secondary hover:theme-text'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 card p-0 overflow-hidden w-full min-h-0">
        {renderCalendarView()}
      </div>

      {/* Modals */}
      <EventModal
        open={openEventModal}
        onClose={() => {
          setOpenEventModal(false)
          setEditingEvent(null)
          setSelectedTimeSlot(null)
        }}
        user={user}
        onCreated={handleEventCreated}
        editingEvent={editingEvent}
        selectedTimeSlot={selectedTimeSlot}
        colorOptions={colorOptions}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setDeleteEvent(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteEvent?.title}"? This action cannot be undone.`}
        confirmText="Delete Event"
      />
    </div>
  )
}
