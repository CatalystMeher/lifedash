import { useState, useEffect } from 'react'
import Modal from './Modal'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const WEEK = [
  { v: 0, l: 'Sun' }, { v: 1, l: 'Mon' }, { v: 2, l: 'Tue' },
  { v: 3, l: 'Wed' }, { v: 4, l: 'Thu' }, { v: 5, l: 'Fri' }, { v: 6, l: 'Sat' },
]

export default function CreateHabitModal({ open, onClose, user, onCreated, editingHabit }) {
  const [form, setForm] = useState({ name: '', icon: '✅', color: '#22C55E', days: new Set([0,1,2,3,4,5,6]) })
  const [saving, setSaving] = useState(false)

  // Initialize form when editing
  useEffect(() => {
    if (editingHabit) {
      setForm({
        name: editingHabit.name || '',
        icon: editingHabit.icon || '✅',
        color: editingHabit.color || '#22C55E',
        days: new Set(editingHabit.days_of_week || [0,1,2,3,4,5,6])
      })
    } else {
      setForm({ name: '', icon: '✅', color: '#22C55E', days: new Set([0,1,2,3,4,5,6]) })
    }
  }, [editingHabit, open])

  function toggleDay(d) {
    setForm(s => {
      const next = new Set(s.days)
      next.has(d) ? next.delete(d) : next.add(d)
      return { ...s, days: next }
    })
  }

  async function save() {
    if (!form.name.trim()) return toast.error('Name is required')
    setSaving(true)
    
    const habitData = {
      name: form.name.trim(),
      icon: form.icon || null,
      color: form.color || null,
      days_of_week: Array.from(form.days).sort((a,b)=>a-b)
    }

    let error
    if (editingHabit) {
      // Update existing habit
      const { error: updateError } = await supabase
        .from('habits')
        .update(habitData)
        .eq('id', editingHabit.id)
      error = updateError
    } else {
      // Create new habit
      const { error: insertError } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          ...habitData
        })
      error = insertError
    }
    
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success(editingHabit ? 'Habit updated' : 'Habit created')
    onCreated?.()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingHabit ? "Edit habit" : "Create habit"}
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : (editingHabit ? 'Update' : 'Create')}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted mb-2 block">Name</label>
          <input 
            className="input"
            value={form.name} 
            onChange={e=>setForm(s=>({...s,name:e.target.value}))}
            placeholder="e.g., Morning exercise, Read 30 min"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted mb-2 block">Icon (emoji or text)</label>
            <input 
              className="input"
              value={form.icon} 
              onChange={e=>setForm(s=>({...s,icon:e.target.value}))}
              placeholder="✅"
            />
          </div>
          <div>
            <label className="text-sm text-muted mb-2 block">Color</label>
            <input 
              type="color" 
              className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer"
              value={form.color} 
              onChange={e=>setForm(s=>({...s,color:e.target.value}))}
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-muted mb-2 block">Days of week</label>
          <div className="grid grid-cols-7 gap-2 mt-2">
            {WEEK.map(d=>(
              <button 
                key={d.v} 
                type="button" 
                onClick={()=>toggleDay(d.v)}
                                 className={`px-3 py-2 text-sm font-medium rounded-xl border transition-all duration-200 ${
                   form.days.has(d.v)
                     ? 'bg-green-500 text-white border-green-500' 
                     : 'btn-secondary'
                 }`}
              >
                {d.l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
