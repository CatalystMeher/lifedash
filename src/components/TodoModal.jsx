import { useState, useEffect } from 'react'
import Modal from './Modal'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Calendar, AlertTriangle, Circle, Clock, Star } from 'lucide-react'
import dayjs from 'dayjs'
import QuickCalendar from './QuickCalendar'

const priorities = [
  { value: 0, label: 'Normal', icon: Circle, color: 'text-gray-400' },
  { value: 1, label: 'High', icon: AlertTriangle, color: 'text-orange-500' },
  { value: 2, label: 'Urgent', icon: AlertTriangle, color: 'text-red-500' }
]

const dueDatePresets = [
  { value: 'today', label: 'Today', icon: Calendar, date: dayjs().format('YYYY-MM-DD'), color: 'text-blue-500' },
  { value: 'tomorrow', label: 'Tomorrow', icon: Clock, date: dayjs().add(1, 'day').format('YYYY-MM-DD'), color: 'text-orange-500' },
  { value: 'custom', label: 'Custom Date', icon: Star, date: '', color: 'text-purple-500' },
  { value: 'none', label: 'No Due Date', icon: Star, date: null, color: 'text-gray-500' }
]

export default function TodoModal({ open, onClose, user, onCreated, editingTodo }) {
  const [form, setForm] = useState({
    title: '',
    notes: '',
    due_date: dayjs().format('YYYY-MM-DD'), // Default to today
    priority: 0
  })
  const [selectedPreset, setSelectedPreset] = useState('today')
  const [showCustomDate, setShowCustomDate] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [saving, setSaving] = useState(false)

  // Initialize form when editing
  useEffect(() => {
    if (editingTodo) {
      setForm({
        title: editingTodo.title || '',
        notes: editingTodo.notes || '',
        due_date: editingTodo.due_date || '',
        priority: editingTodo.priority || 0
      })
      // Set preset based on existing due date
      if (editingTodo.due_date) {
        const today = dayjs().format('YYYY-MM-DD')
        const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
        if (editingTodo.due_date === today) {
          setSelectedPreset('today')
          setShowCustomDate(false)
        } else if (editingTodo.due_date === tomorrow) {
          setSelectedPreset('tomorrow')
          setShowCustomDate(false)
        } else {
          setSelectedPreset('custom')
          setShowCustomDate(true)
        }
      } else {
        setSelectedPreset('none')
        setShowCustomDate(false)
      }
    } else {
      setForm({
        title: '',
        notes: '',
        due_date: dayjs().format('YYYY-MM-DD'), // Default to today
        priority: 0
      })
      setSelectedPreset('today')
      setShowCustomDate(false)
    }
  }, [editingTodo, open])

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset)
    if (preset === 'custom') {
      setShowCustomDate(true)
      setShowCalendar(true)
      setForm(s => ({ ...s, due_date: '' }))
    } else if (preset === 'none') {
      setShowCustomDate(false)
      setShowCalendar(false)
      setForm(s => ({ ...s, due_date: null }))
    } else {
      setShowCustomDate(false)
      setShowCalendar(false)
      const selectedPresetData = dueDatePresets.find(p => p.value === preset)
      setForm(s => ({ ...s, due_date: selectedPresetData.date }))
    }
  }

  const handleDateSelect = (date) => {
    setForm(s => ({ ...s, due_date: date }))
    setShowCalendar(false)
  }

  async function save() {
    if (!form.title.trim()) return toast.error('Title is required')
    setSaving(true)
    
    const todoData = {
      title: form.title.trim(),
      notes: form.notes.trim() || null,
      due_date: form.due_date || null,
      priority: form.priority
    }

    let error
    if (editingTodo) {
      // Update existing todo
      const { error: updateError } = await supabase
        .from('todos')
        .update(todoData)
        .eq('id', editingTodo.id)
      error = updateError
    } else {
      // Create new todo
      const { error: insertError } = await supabase
        .from('todos')
        .insert({
          user_id: user.id,
          ...todoData
        })
      error = insertError
    }
    
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success(editingTodo ? 'Todo updated' : 'Todo created')
    onCreated?.()
    onClose()
  }

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title={editingTodo ? 'Edit Todo' : 'New Todo'}
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={save} disabled={saving || !form.title.trim()} className="btn-primary">
            {saving ? 'Saving…' : (editingTodo ? 'Update' : 'Create')}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-sm text-muted mb-2 block">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm(s => ({ ...s, title: e.target.value }))}
            className="input"
            placeholder="What needs to be done?"
            autoFocus
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm text-muted mb-2 block">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm(s => ({ ...s, notes: e.target.value }))}
            className="input"
            placeholder="Add any additional details..."
            rows={3}
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="text-sm text-muted mb-2 block">Due Date</label>
          
          {/* Preset Options */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {dueDatePresets.map((preset) => {
              const IconComponent = preset.icon
              return (
                <button
                  key={preset.value}
                  onClick={() => handlePresetSelect(preset.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                    selectedPreset === preset.value
                      ? 'accent-bg accent-text accent-border' 
                      : 'theme-button-secondary'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${preset.color}`} />
                  <span className="text-sm font-medium">{preset.label}</span>
                </button>
              )
            })}
          </div>

          {/* Custom Date Input */}
          {showCustomDate && (
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={form.due_date ? dayjs(form.due_date).format('MMM D, YYYY') : ''}
                    placeholder="Select a date..."
                    readOnly
                    className="input cursor-pointer"
                    onClick={() => setShowCalendar(!showCalendar)}
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                </div>
                {form.due_date && (
                  <button
                    onClick={() => setForm(s => ({ ...s, due_date: null }))}
                    className="p-2 text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Clear date"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Quick Calendar */}
              {showCalendar && (
                <QuickCalendar
                  selectedDate={form.due_date}
                  onDateSelect={handleDateSelect}
                  onClose={() => setShowCalendar(false)}
                />
              )}
            </div>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="text-sm text-muted mb-2 block">Priority</label>
          <div className="grid grid-cols-3 gap-2">
            {priorities.map((priority) => {
              const IconComponent = priority.icon
              return (
                <button
                  key={priority.value}
                  onClick={() => setForm(s => ({ ...s, priority: priority.value }))}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                    form.priority === priority.value
                      ? 'accent-bg accent-text accent-border' 
                      : 'theme-button-secondary'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${priority.color}`} />
                  <span className="text-sm font-medium">{priority.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </Modal>
  )
} 
