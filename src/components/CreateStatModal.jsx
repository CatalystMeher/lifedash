import { useState, useEffect } from 'react'
import Modal from './Modal'
import IconPicker from './IconPicker'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Settings } from 'lucide-react'

const TYPES = ['number','duration','text']

export default function CreateStatModal({ open, onClose, user, onCreated, editingStat = null }) {
  const [form, setForm] = useState({
    name: '',
    type: 'number',
    unit: '',
    color: '#6EE7B7',
    goal_value: '',
    icon: 'BarChart3'
  })
  const [saving, setSaving] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState(false)

  // Initialize form when editing
  useEffect(() => {
    if (editingStat) {
      setForm({
        name: editingStat.name || '',
        type: editingStat.type || 'number',
        unit: editingStat.unit || '',
        color: editingStat.color || '#6EE7B7',
        goal_value: editingStat.goal_value || '',
        icon: editingStat.icon || 'BarChart3'
      })
    } else {
      setForm({
        name: '',
        type: 'number',
        unit: '',
        color: '#6EE7B7',
        goal_value: '',
        icon: 'BarChart3'
      })
    }
  }, [editingStat, open])

  function set(k,v){ setForm(s=>({...s,[k]:v})) }

  async function save() {
    if (!form.name.trim()) return toast.error('Name is required')
    setSaving(true)
    
    const statData = {
      name: form.name.trim(),
      type: form.type,
      unit: form.unit || null,
      color: form.color || null,
      goal_value: form.goal_value ? Number(form.goal_value) : null,
      icon: form.icon || null,
      pinned: editingStat ? editingStat.pinned : true
    }

    let result
    if (editingStat) {
      result = await supabase.from('stats').update(statData).eq('id', editingStat.id)
    } else {
      result = await supabase.from('stats').insert({
        ...statData,
        user_id: user.id
      })
    }
    
    setSaving(false)
    if (result.error) return toast.error(result.error.message)
    toast.success(editingStat ? 'Stat updated' : 'Stat created')
    onCreated?.()
    onClose()
  }

  return (
    <>
      <Modal 
        open={open} 
        onClose={onClose} 
        title={editingStat ? "Edit stat" : "Create stat"} 
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving…' : (editingStat ? 'Update' : 'Create')}
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
              onChange={e=>set('name', e.target.value)}
              placeholder="e.g., Water intake, Exercise time"
            />
          </div>
          
          <div>
            <label className="text-sm text-muted mb-2 block">Icon</label>
            <button
              type="button"
              onClick={() => setShowIconPicker(true)}
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                {form.icon ? (
                  <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <span className="text-gray-900 dark:text-gray-100">
                {form.icon || 'Choose an icon'}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted mb-2 block">Type</label>
              <select 
                className="input"
                value={form.type} 
                onChange={e=>set('type', e.target.value)}
              >
                {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted mb-2 block">Unit (optional)</label>
              <input 
                className="input"
                placeholder="ml, kg, min…" 
                value={form.unit}
                onChange={e=>set('unit', e.target.value)} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted mb-2 block">Color</label>
              <input 
                type="color" 
                className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer"
                value={form.color} 
                onChange={e=>set('color', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm text-muted mb-2 block">Daily goal (optional)</label>
              <input 
                type="number" 
                min="0" 
                className="input"
                value={form.goal_value} 
                onChange={e=>set('goal_value', e.target.value)} 
              />
            </div>
          </div>
        </div>
      </Modal>

      {showIconPicker && (
        <IconPicker
          value={form.icon}
          onChange={(icon) => set('icon', icon)}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </>
  )
}
