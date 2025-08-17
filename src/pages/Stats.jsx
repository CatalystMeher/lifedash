import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import useUser from '../hooks/useUser'
import CreateStatModal from '../components/CreateStatModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as LucideIcons from 'lucide-react'
import toast from 'react-hot-toast'

function fetchStats() {
  return supabase.from('stats').select('*').order('inserted_at', { ascending: false })
}

export default function Stats() {
  const { user, loading } = useUser()
  const [open, setOpen] = useState(false)
  const [editingStat, setEditingStat] = useState(null)
  const [deleteStat, setDeleteStat] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { data, refetch, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    enabled: !!user && !loading
  })

  const handleEdit = (stat) => {
    setEditingStat(stat)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingStat(null)
  }

  const handleCreated = () => {
    refetch()
    setEditingStat(null)
  }

  const handleDeleteClick = (stat) => {
    setDeleteStat(stat)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteStat) return
    
    try {
      const { error } = await supabase.from('stats').delete().eq('id', deleteStat.id)
      if (error) throw error
      
      toast.success('Stat deleted successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to delete stat: ' + error.message)
    } finally {
      setShowDeleteDialog(false)
      setDeleteStat(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
    setDeleteStat(null)
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
        <h2 className="text-2xl font-bold theme-text-2xl">Stats</h2>
        <button
          onClick={() => setOpen(true)}
          className="btn-primary"
        >
          New
        </button>
      </div>

      {isLoading && (
        <div className="text-center p-6 card">
          <div className="text-muted">Loading stats...</div>
        </div>
      )}

      <div className="space-y-4">
        {data?.data?.map(s => {
          const IconComponent = s.icon && LucideIcons[s.icon] ? LucideIcons[s.icon] : LucideIcons.BarChart3
          return (
            <div key={s.id} className="p-6 card hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex flex-shrink-0 items-center justify-center"
                    style={{ background: s.color || '#e5e5e5' }}
                  >
                    <IconComponent className="w-6 h-6 text-white theme-icon" />
                  </div>
                  <div>
                    <div className="font-semibold theme-text">{s.name}</div>
                    <div className="text-sm text-muted">{s.type}{s.unit ? ` • ${s.unit}` : ''}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/stats/${s.id}`}
                    className="btn-secondary text-sm"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleEdit(s)}
                    className="btn-secondary text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(s)}
                    className="btn-secondary text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {!isLoading && !data?.data?.length && (
          <div className="text-center p-12 card">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-lg font-semibold theme-text-lg mb-2">No stats yet</div>
            <div className="text-muted">Create your first stat to start tracking!</div>
          </div>
        )}
      </div>

      <CreateStatModal
        open={open}
        onClose={handleClose}
        user={user}
        onCreated={handleCreated}
        editingStat={editingStat}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Stat"
        message={`Are you sure you want to delete "${deleteStat?.name}"? This action cannot be undone and will also delete all associated entries.`}
        confirmText="Delete Stat"
      />
    </div>
  )
}
