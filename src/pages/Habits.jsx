import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import { supabase } from '../lib/supabase'
import useUser from '../hooks/useUser'
import CreateHabitModal from '../components/CreateHabitModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { Check, X, Edit, Trash2 } from 'lucide-react'

function fetchHabits() {
  return supabase.from('habits').select('*').order('inserted_at', { ascending: false })
}

export default function Habits() {
  const { user, loading } = useUser()
  const [open, setOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [deleteHabit, setDeleteHabit] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), [])
  const { data, refetch, isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: fetchHabits,
    enabled: !!user && !loading
  })
  const [todayMap, setTodayMap] = useState(new Map()) // habitId -> done

  useEffect(() => {
    if (!user?.id) return
    supabase.from('habit_checkins').select('habit_id, done').eq('user_id', user.id).eq('day', today)
      .then(({ data, error }) => {
        if (error) { toast.error(error.message); return }
        const m = new Map()
        data?.forEach(r => m.set(r.habit_id, !!r.done))
        setTodayMap(m)
      })
  }, [user?.id, today])

  async function toggle(h) {
    if (!user?.id) return
    const done = !todayMap.get(h.id)
    const { error } = await supabase.from('habit_checkins').upsert({
      user_id: user.id, habit_id: h.id, day: today, done
    }, { onConflict: 'user_id,habit_id,day' })
    if (error) return toast.error(error.message)
    toast.success(done ? 'Marked done' : 'Marked not done')
    setTodayMap(m => new Map(m.set(h.id, done)))
  }

  const handleEdit = (habit) => {
    setEditingHabit(habit)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingHabit(null)
  }

  const handleCreated = () => {
    refetch()
    setEditingHabit(null)
  }

  const handleDeleteClick = (habit) => {
    setDeleteHabit(habit)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteHabit) return
    
    try {
      const { error } = await supabase.from('habits').delete().eq('id', deleteHabit.id)
      if (error) throw error
      
      toast.success('Habit deleted successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to delete habit: ' + error.message)
    } finally {
      setShowDeleteDialog(false)
      setDeleteHabit(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
    setDeleteHabit(null)
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Habits</h2>
        <button onClick={() => setOpen(true)} className="btn-primary">New</button>
      </div>

      {isLoading && (
        <div className="text-center p-6 card">
          <div className="text-muted">Loading habits...</div>
        </div>
      )}

      <div className="space-y-4">
        {data?.data?.map(h => {
          const done = !!todayMap.get(h.id)
          const dayIdx = new Date().getDay()
          const isScheduledToday = (h.days_of_week || [0,1,2,3,4,5,6]).includes(dayIdx)
          
          return (
            <div key={h.id} className="p-6 card hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggle(h)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                      done 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}
                    title="Tap to toggle today"
                  >
                    {done ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{h.name}</div>
                    <div className="text-sm text-muted">
                      Today: {done ? 'Done' : 'Not yet'}
                      {!isScheduledToday && ' • Not scheduled today'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(h)}
                    className="btn-secondary text-sm"
                    title="Edit habit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(h)}
                    className="btn-secondary text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!isLoading && !data?.data?.length && (
        <div className="text-center p-12 card">
          <div className="text-4xl mb-4">✅</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No habits yet</div>
          <div className="text-muted">Create your first habit to start building good routines!</div>
        </div>
      )}

      <CreateHabitModal 
        open={open} 
        onClose={handleClose} 
        user={user} 
        onCreated={handleCreated}
        editingHabit={editingHabit}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Habit"
        message={`Are you sure you want to delete "${deleteHabit?.name}"? This action cannot be undone and will also delete all associated check-ins.`}
        confirmText="Delete Habit"
      />
    </div>
  )
}
