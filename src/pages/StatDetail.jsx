import { useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { lastNDays } from '../lib/dateRange'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import useUser from '../hooks/useUser'

async function fetchStat(id) {
  const { data, error } = await supabase.from('stats').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

async function fetchEntries(statId, from, to) {
  const { data, error } = await supabase
    .from('entries')
    .select('id, day, value, note, inserted_at')
    .eq('stat_id', statId)
    .gte('day', from)
    .lte('day', to)
    .order('day', { ascending: true })
  if (error) throw error
  return data || []
}

async function fetchLifetimeEntries(statId) {
  const { data, error } = await supabase
    .from('entries')
    .select('value')
    .eq('stat_id', statId)
  if (error) throw error
  return data || []
}

export default function StatDetail() {
  const { id } = useParams()
  const { user, loading } = useUser()
  const [range, setRange] = useState(30)
  const [lifetimePeriod, setLifetimePeriod] = useState('lifetime') // '7d', '30d', 'lifetime'
  const [numValue, setNumValue] = useState('')
  const [durValue, setDurValue] = useState('')
  const [noteValue, setNoteValue] = useState('')
  const { from, to } = useMemo(() => lastNDays(range), [range])

  const { data: stat } = useQuery({
    queryKey: ['stat', id],
    queryFn: () => fetchStat(id),
    enabled: !!id && !!user && !loading
  })
  const { data: entries = [], refetch } = useQuery({
    queryKey: ['entries', id, from, to],
    queryFn: () => fetchEntries(id, from, to),
    enabled: !!id && !!user && !loading
  })

  const { data: lifetimeEntries = [] } = useQuery({
    queryKey: ['lifetime-entries', id, lifetimePeriod],
    queryFn: () => {
      if (lifetimePeriod === 'lifetime') {
        return fetchLifetimeEntries(id)
      } else {
        const days = lifetimePeriod === '7d' ? 7 : 30
        const from = dayjs().subtract(days - 1, 'day').format('YYYY-MM-DD')
        const to = dayjs().format('YYYY-MM-DD')
        return fetchEntries(id, from, to)
      }
    },
    enabled: !!id && !!user && !loading
  })

  // aggregate day -> sum (text counts as 1)
  const chartData = useMemo(() => {
    const map = new Map()
    for (let i = 0; i < range; i++) {
      const d = dayjs(from).add(i, 'day').format('YYYY-MM-DD')
      map.set(d, 0)
    }
    for (const e of entries) {
      const key = dayjs(e.day).format('YYYY-MM-DD')
      const v = (typeof e.value === 'number' && !isNaN(e.value)) ? Number(e.value) : 1
      map.set(key, (map.get(key) || 0) + v)
    }
    return Array.from(map.entries()).map(([d, v]) => ({ d: dayjs(d).format('DD MMM'), v }))
  }, [entries, from, range])

  const unit = stat?.unit || (stat?.type === 'duration' ? 'min' : '')
  const today = dayjs().format('YYYY-MM-DD')

  // Calculate lifetime total
  const lifetimeTotal = useMemo(() => {
    return lifetimeEntries.reduce((sum, entry) => {
      const value = Number(entry.value || 0)
      return sum + (isNaN(value) ? 0 : value)
    }, 0)
  }, [lifetimeEntries])

  // Show loading state while user is being authenticated
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center p-6 card">
          <div className="text-muted">Loading...</div>
        </div>
      </div>
    )
  }

  async function logToday(payload) {
    try {
      const { error } = await supabase.from('entries').insert({
        user_id: user.id,
        stat_id: id,
        day: today,
        ...payload
      })
      if (error) throw error
      toast.success('Saved')
      refetch()
    } catch (e) {
      toast.error(e.message || 'Failed to save')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat?.name || 'Stat'}</h2>
        <div className="text-sm text-muted">{stat?.type}{unit ? ` • ${unit}` : ''}</div>
      </div>

      {/* Lifetime Total */}
      <div className="p-6 card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted">
            {lifetimePeriod === 'lifetime' ? 'Lifetime' : lifetimePeriod === '7d' ? 'Last 7 Days' : 'Last 30 Days'} Total
          </p>
          <div className="flex gap-2">
            {[
              { key: '7d', label: '7d' },
              { key: '30d', label: '30d' },
              { key: 'lifetime', label: 'All' }
            ].map(period => (
              <button
                key={period.key}
                onClick={() => setLifetimePeriod(period.key)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                  lifetimePeriod === period.key
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {lifetimeTotal}{unit ? ` ${unit}` : ''}
          </h3>
        </div>
      </div>

      {/* Log today (type-aware) */}
      {stat?.type === 'number' && (
        <div className="p-6 card">
          <label className="text-sm text-muted mb-3 block">Add value ({unit || 'value'})</label>
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              inputMode="decimal" 
              className="flex-1 input" 
              placeholder={`Enter ${unit || 'value'}`}
              value={numValue}
              onChange={(e) => setNumValue(e.target.value)}
            />
            {[1,5,10,25].map(n=>(
              <button 
                key={n} 
                onClick={()=>setNumValue(String((Number(numValue||0))+n))} 
                className="px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                +{n}
              </button>
            ))}
            <button 
              onClick={()=>{
                const v = Number(numValue||0)
                if (isNaN(v)) return toast.error('Enter a number')
                logToday({ value: v })
                setNumValue('')
              }} 
              className="btn-primary"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {stat?.type === 'duration' && (
        <div className="p-6 card">
          <label className="text-sm text-muted mb-3 block">Add minutes</label>
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              className="flex-1 input" 
              placeholder="Minutes"
              value={durValue}
              onChange={(e) => setDurValue(e.target.value)}
            />
            {[5,15,25].map(n=>(
              <button 
                key={n} 
                onClick={()=>setDurValue(String((Number(durValue||0))+n))} 
                className="px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                +{n}m
              </button>
            ))}
            <button 
              onClick={()=>{
                const v = Number(durValue||0)
                if (isNaN(v) || v <= 0) return toast.error('Enter minutes')
                logToday({ value: v, source: 'manual' })
                setDurValue('')
              }} 
              className="btn-primary"
            >
              Save
            </button>
          </div>
        </div>
      )}



      {stat?.type === 'text' && (
        <div className="p-6 card">
          <label className="text-sm text-muted mb-3 block">Note for today</label>
          <div className="flex items-center gap-3">
            <textarea 
              rows={3} 
              className="flex-1 input resize-none" 
              placeholder="Write a short note…"
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
            />
            <button 
              onClick={()=>{
                const v = String(noteValue||'').trim()
                if (!v) return toast.error('Enter a note')
                logToday({ note: v })
                setNoteValue('')
              }} 
              className="btn-primary"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="p-6 card">
        <div className="flex items-center justify-between mb-6">
                     <div className="text-base font-semibold text-gray-900 dark:text-gray-100">Last {range} days</div>
          <div className="flex gap-2">
            {[7,30,90].map(n=>(
              <button 
                key={n} 
                onClick={()=>setRange(n)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                                     range===n 
                     ? 'bg-green-500 text-white border-green-500' 
                     : 'btn-secondary'
                }`}
              >
                {n}d
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeOpacity={0.2} vertical={false} stroke="#e5e5e5" />
              <XAxis dataKey="d" tick={{ fontSize: 12, fill: '#737373' }} />
              <YAxis width={40} tick={{ fontSize: 12, fill: '#737373' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e5e5',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="v" 
                stroke="#22c55e" 
                strokeWidth={3} 
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {unit && <div className="text-sm text-muted text-center">Units: {unit}</div>}
      </div>

      {/* Recent entries */}
      <div className="p-6 card">
                 <div className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent</div>
        <ul className="space-y-3">
          {[...entries].slice(-10).reverse().map(e => (
            <li key={e.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <span className="text-sm text-muted">{dayjs(e.day).format('DD MMM')}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {typeof e.value === 'number' && !isNaN(e.value) ? e.value : (e.note ? 'note' : '—')}
              </span>
            </li>
          ))}
          {!entries.length && (
            <li className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-muted">No entries yet.</div>
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
