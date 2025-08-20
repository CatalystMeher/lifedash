import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Link as LinkIcon,
  Bell,
  Repeat,
  CheckCircle,
  ChevronDown
} from 'lucide-react'
import Modal from './Modal'
import toast from 'react-hot-toast'

const repeatOptions = [
  { value: 'none', label: 'No repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
]

const reminderOptions = [
  { value: 0, label: 'No reminder' },
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' }
]

export default function EventModal({ 
  open, 
  onClose, 
  user, 
  onCreated, 
  editingEvent, 
  selectedTimeSlot,
  colorOptions 
}) {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    all_day: false,
    color: '#3b82f6',
    location: '',
    url: '',
    reminder_minutes: 15,
    repeat_type: 'none',
    repeat_until: ''
  })

  // Initialize form data when editing or when time slot is selected
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title || '',
        description: editingEvent.description || '',
        start_time: dayjs(editingEvent.start_time).format('YYYY-MM-DDTHH:mm'),
        end_time: dayjs(editingEvent.end_time).format('YYYY-MM-DDTHH:mm'),
        all_day: editingEvent.all_day || false,
        color: editingEvent.color || '#3b82f6',
        location: editingEvent.location || '',
        url: editingEvent.url || '',
        reminder_minutes: editingEvent.reminder_minutes || 15,
        repeat_type: editingEvent.repeat_type || 'none',
        repeat_until: editingEvent.repeat_until ? dayjs(editingEvent.repeat_until).format('YYYY-MM-DD') : ''
      })
    } else if (selectedTimeSlot) {
      const { date, startTime, endTime } = selectedTimeSlot
      setFormData({
        title: '',
        description: '',
        start_time: dayjs(date).hour(startTime).minute(0).format('YYYY-MM-DDTHH:mm'),
        end_time: dayjs(date).hour(endTime).minute(0).format('YYYY-MM-DDTHH:mm'),
        all_day: false,
        color: '#3b82f6',
        location: '',
        url: '',
        reminder_minutes: 15,
        repeat_type: 'none',
        repeat_until: ''
      })
    } else {
      // Default to current time
      const now = dayjs()
      setFormData({
        title: '',
        description: '',
        start_time: now.format('YYYY-MM-DDTHH:mm'),
        end_time: now.add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
        all_day: false,
        color: '#3b82f6',
        location: '',
        url: '',
        reminder_minutes: 15,
        repeat_type: 'none',
        repeat_until: ''
      })
    }
  }, [editingEvent, selectedTimeSlot])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Please enter an event title')
      return
    }

    setLoading(true)
    try {
      const eventData = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        start_time: formData.all_day 
          ? dayjs(formData.start_time).startOf('day').toISOString()
          : dayjs(formData.start_time).toISOString(),
        end_time: formData.all_day 
          ? dayjs(formData.end_time).endOf('day').toISOString()
          : dayjs(formData.end_time).toISOString(),
        all_day: formData.all_day,
        color: formData.color,
        location: formData.location.trim(),
        url: formData.url.trim(),
        reminder_minutes: formData.reminder_minutes,
        repeat_type: formData.repeat_type,
        repeat_until: formData.repeat_until ? dayjs(formData.repeat_until).toISOString() : null
      }

      if (editingEvent) {
        const { error } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', editingEvent.id)
        
        if (error) throw error
        toast.success('Event updated successfully')
      } else {
        const { error } = await supabase
          .from('calendar_events')
          .insert([eventData])
        
        if (error) throw error
        toast.success('Event created successfully')
      }

      queryClient.invalidateQueries(['calendar-events'])
      onCreated()
      onClose()
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error(editingEvent ? 'Failed to update event' : 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAllDayChange = (checked) => {
    setFormData(prev => ({ 
      ...prev, 
      all_day: checked,
      start_time: checked 
        ? dayjs(prev.start_time).format('YYYY-MM-DD')
        : dayjs(prev.start_time).format('YYYY-MM-DDTHH:mm'),
      end_time: checked 
        ? dayjs(prev.end_time).format('YYYY-MM-DD')
        : dayjs(prev.end_time).format('YYYY-MM-DDTHH:mm')
    }))
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold theme-text">
            {editingEvent ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl theme-button-secondary hover:theme-bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium theme-text mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="input"
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Start Date & Time
              </label>
              <input
                type={formData.all_day ? 'date' : 'datetime-local'}
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                End Date & Time
              </label>
              <input
                type={formData.all_day ? 'date' : 'datetime-local'}
                value={formData.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
                className="input"
                required
              />
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="all_day"
              checked={formData.all_day}
              onChange={(e) => handleAllDayChange(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="all_day" className="text-sm theme-text">
              All day event
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium theme-text mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="input min-h-[100px] resize-none"
              placeholder="Add event description..."
              rows={4}
            />
          </div>

          {/* Location and URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="input"
                placeholder="Add location..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text mb-2">
                <LinkIcon className="w-4 h-4 inline mr-2" />
                URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                className="input"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium theme-text mb-2">
              Event Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange('color', color.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color.class
                  } ${
                    formData.color === color.value
                      ? 'border-white ring-2 ring-offset-2 ring-offset-gray-800 ring-white'
                      : 'border-transparent hover:scale-110'
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* Reminder and Repeat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text mb-2">
                <Bell className="w-4 h-4 inline mr-2" />
                Reminder
              </label>
              <select
                value={formData.reminder_minutes}
                onChange={(e) => handleInputChange('reminder_minutes', parseInt(e.target.value))}
                className="input"
              >
                {reminderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium theme-text mb-2">
                <Repeat className="w-4 h-4 inline mr-2" />
                Repeat
              </label>
              <select
                value={formData.repeat_type}
                onChange={(e) => handleInputChange('repeat_type', e.target.value)}
                className="input"
              >
                {repeatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Repeat Until */}
          {formData.repeat_type !== 'none' && (
            <div>
              <label className="block text-sm font-medium theme-text mb-2">
                Repeat Until
              </label>
              <input
                type="date"
                value={formData.repeat_until}
                onChange={(e) => handleInputChange('repeat_until', e.target.value)}
                className="input"
                min={dayjs().format('YYYY-MM-DD')}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t theme-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {editingEvent ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
