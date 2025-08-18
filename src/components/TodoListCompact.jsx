import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import TodoCard from './TodoCard'
import TodoModal from './TodoModal'
import ConfirmDialog from './ConfirmDialog'
import { Plus, Calendar } from 'lucide-react'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

async function fetchTodayTodos(userId) {
  const today = dayjs().format('YYYY-MM-DD')
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .eq('due_date', today)
    .eq('completed', false)
    .order('order_index', { ascending: true })
    .order('inserted_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export default function TodoListCompact({ user }) {
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)
  const [deleteTodo, setDeleteTodo] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: todos = [], isLoading, refetch } = useQuery({
    queryKey: ['todos-today', user?.id],
    queryFn: () => fetchTodayTodos(user.id),
    enabled: !!user
  })

  const handleToggle = async (todo) => {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', todo.id)
    
    if (error) {
      toast.error('Failed to update todo')
      return
    }
    
    queryClient.invalidateQueries(['todos-today'])
    toast.success(todo.completed ? 'Marked as incomplete' : 'Marked as complete')
  }

  const handleEdit = (todo) => {
    setEditingTodo(todo)
    setOpenModal(true)
  }

  const handleDelete = (todo) => {
    setDeleteTodo(todo)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTodo) return
    
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', deleteTodo.id)
    
    if (error) {
      toast.error('Failed to delete todo')
      return
    }
    
    queryClient.invalidateQueries(['todos-today'])
    toast.success('Todo deleted')
    setShowDeleteDialog(false)
    setDeleteTodo(null)
  }

  const handleCreated = () => {
    refetch()
    setEditingTodo(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center p-6 card">
          <div className="text-muted">Loading todos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold theme-text-lg">Today's Todos</h3>
          <span className="text-sm text-gray-500">({todos.length})</span>
        </div>
        <button 
          onClick={() => setOpenModal(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Todo List */}
      <div className="space-y-2">
        {todos.map(todo => (
          <TodoCard
            key={todo.id}
            todo={todo}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Empty State */}
      {todos.length === 0 && (
        <div className="text-center p-6 card">
          <div className="text-4xl mb-4">📝</div>
          <div className="text-sm text-muted">No todos for today</div>
        </div>
      )}

      {/* Modals */}
      <TodoModal
        open={openModal}
        onClose={() => {
          setOpenModal(false)
          setEditingTodo(null)
        }}
        user={user}
        onCreated={handleCreated}
        editingTodo={editingTodo}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setDeleteTodo(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Todo"
        message={`Are you sure you want to delete "${deleteTodo?.title}"? This action cannot be undone.`}
        confirmText="Delete Todo"
      />
    </div>
  )
}
