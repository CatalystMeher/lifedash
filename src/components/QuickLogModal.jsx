import { useEffect, useMemo, useState } from 'react'
import Modal from './Modal'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

export default function QuickLogModal({ open, onClose, user, onSave }) {
  const [stats, setStats] = useState([])
  const [saving, setSaving] = useState(false)
  const [vals, setVals] = useState({}) // { [statId]: any }

  useEffect(() => {
    if (!open) return
    supabase.from('stats').select('*').order('inserted_at', { ascending: false }).then(({ data, error }) => {
      if (error) toast.error(error.message)
      else setStats(data || [])
    })
  }, [open])

  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), [])

  function setValue(id, v) {
    setVals(s => ({ ...s, [id]: v }))
  }

  async function saveAll() {
    const rows = []
    for (const s of stats) {
      const v = vals[s.id]
      if (s.type === 'number' || s.type === 'duration') {
        const num = Number(v)
        if (!isNaN(num) && num !== 0) {
          rows.push({ user_id: user.id, stat_id: s.id, day: today, value: num })
        }
      } else if (s.type === 'text') {
        if (v && String(v).trim().length) {
          rows.push({ user_id: user.id, stat_id: s.id, day: today, note: String(v).trim() })
        }
      }
    }
    if (!rows.length) return toast('Nothing to save')

    setSaving(true)
    const { error } = await supabase.from('entries').insert(rows)
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success('Logged!')
    onClose()
    // Call onSave callback to refresh parent data
    if (onSave) onSave()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Quick Log"
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={saveAll} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save all'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {stats.map(s => (
          <div key={s.id} className="p-4 card">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-gray-900 dark:text-gray-100">{s.name}</div>
              <div className="text-sm text-muted">{s.type}{s.unit ? ` • ${s.unit}` : ''}</div>
            </div>

            {s.type === 'number' && (
              <div className="flex items-center gap-3 flex-col sm:flex-row">
                <input 
                  type="number" 
                  inputMode="decimal"
                  className="flex-1 input w-full"
                  placeholder={`Enter ${s.unit || 'value'}`}
                  value={vals[s.id] ?? ''}
                  onChange={e => setValue(s.id, e.target.value)}
                />
                <div className="flex gap-2 flex-wrap">
                  {[+1, +5, +10, +25].map(n => (
                                         <button 
                       key={n} 
                       onClick={() => setValue(s.id, Number(vals[s.id]||0)+n)}
                       className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                     >
                       +{n}
                     </button>
                  ))}
                </div>
              </div>
            )}

            {s.type === 'duration' && (
              <div className="flex items-center gap-3 flex-col sm:flex-row">
                <input 
                  type="number" 
                  className="flex-1 input w-full"
                  placeholder="Minutes"
                  value={vals[s.id] ?? ''}
                  onChange={e => setValue(s.id, e.target.value)}
                />
                <div className="flex gap-2 flex-wrap">
                  {[5, 15, 25].map(n => (
                                         <button 
                       key={n} 
                       onClick={() => setValue(s.id, Number(vals[s.id]||0)+n)}
                       className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                     >
                       +{n}m
                     </button>
                  ))}
                </div>
              </div>
            )}

            {s.type === 'text' && (
              <textarea 
                rows={3} 
                className="input resize-none"
                placeholder="Note for today…" 
                value={vals[s.id] ?? ''}
                onChange={e => setValue(s.id, e.target.value)} 
              />
            )}
          </div>
        ))}
        {!stats.length && (
          <div className="text-center p-8 card">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No stats yet</div>
            <div className="text-muted">Create one first to start logging.</div>
          </div>
        )}
      </div>
    </Modal>
  )
}
