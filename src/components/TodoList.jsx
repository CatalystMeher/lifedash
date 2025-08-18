import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useDroppable,
} from '@dnd-kit/core'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import TodoCard from './TodoCard'
import TodoModal from './TodoModal'
import ConfirmDialog from './ConfirmDialog'
import { Plus, Calendar, Clock } from 'lucide-react'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

const sections = [
  { id: 'today', title: 'Today', icon: Calendar, date: dayjs().format('YYYY-MM-DD') },
  { id: 'tomorrow', title: 'Tomorrow', icon: Clock, date: dayjs().add(1, 'day').format('YYYY-MM-DD') },
  { id: 'upcoming', title: 'Upcoming', icon: Calendar, date: null },
  { id: 'no-date', title: 'No Due Date', icon: Calendar, date: null }
]

async function fetchTodos(userId) {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('order_index', { ascending: true })
    .order('inserted_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export default function TodoList({ user, compact = false }) {
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)
  const [deleteTodo, setDeleteTodo] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: todos = [], isLoading, refetch } = useQuery({
    queryKey: ['todos', user?.id],
    queryFn: () => fetchTodos(user.id),
    enabled: !!user
  })

  // Group todos by section
  const groupedTodos = sections.map(section => {
    let sectionTodos = []
    
    if (section.id === 'today') {
      sectionTodos = todos.filter(todo => 
        todo.due_date === section.date && !todo.completed
      )
    } else if (section.id === 'tomorrow') {
      sectionTodos = todos.filter(todo => 
        todo.due_date === section.date && !todo.completed
      )
    } else if (section.id === 'upcoming') {
      sectionTodos = todos.filter(todo => 
        todo.due_date && 
        todo.due_date > dayjs().add(1, 'day').format('YYYY-MM-DD') && 
        !todo.completed
      )
    } else if (section.id === 'no-date') {
      sectionTodos = todos.filter(todo => 
        !todo.due_date && !todo.completed
      )
    }

    return {
      ...section,
      todos: sectionTodos
    }
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
    
    queryClient.invalidateQueries(['todos'])
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
    
    queryClient.invalidateQueries(['todos'])
    toast.success('Todo deleted')
    setShowDeleteDialog(false)
    setDeleteTodo(null)
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find the todo being dragged
    const todo = todos.find(t => t.id === activeId)
    if (!todo) return

    // Find the destination section by checking if the overId matches any section
    const destSection = sections.find(s => s.id === overId)
    
    if (!destSection) return

    // Determine new due date based on destination
    let newDueDate = todo.due_date
    if (destSection.id === 'today') {
      newDueDate = dayjs().format('YYYY-MM-DD')
    } else if (destSection.id === 'tomorrow') {
      newDueDate = dayjs().add(1, 'day').format('YYYY-MM-DD')
    } else if (destSection.id === 'no-date') {
      newDueDate = null
    }
    // For 'upcoming', keep the existing due date if it's in the future

    // Update the todo
    const { error } = await supabase
      .from('todos')
      .update({ due_date: newDueDate })
      .eq('id', todo.id)
    
    if (error) {
      toast.error('Failed to move todo')
      return
    }
    
    queryClient.invalidateQueries(['todos'])
    toast.success('Todo moved')
  }

  const handleCreated = () => {
    refetch()
    setEditingTodo(null)
  }

  // DroppableSection component
  const DroppableSection = ({ section, children }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: section.id,
    })

    return (
      <div
        ref={setNodeRef}
        className={`space-y-2 ${
          isOver ? 'bg-blue-50 dark:bg-blue-900/10 rounded-lg p-2' : ''
        }`}
      >
        {children}
      </div>
    )
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
    <div className="space-y-6">
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold theme-text-2xl">Todos</h2>
          <button 
            onClick={() => setOpenModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Todo
          </button>
        </div>
      )}

      {/* Todo Sections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          {groupedTodos.map(section => {
            const IconComponent = section.icon
            return (
              <div key={section.id} className="space-y-3">
                {/* Section Header */}
                <div className="flex items-center gap-2">
                  <IconComponent className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-semibold theme-text-lg">{section.title}</h3>
                  <span className="text-sm text-gray-500">({section.todos.length})</span>
                </div>

                {/* Todo List */}
                <DroppableSection section={section}>
                  <SortableContext
                    items={section.todos.map(todo => todo.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {section.todos.map((todo) => (
                      <TodoCard
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggle}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </SortableContext>
                </DroppableSection>

                {/* Empty State */}
                {section.todos.length === 0 && (
                  <div className="text-center p-6 card">
                    <div className="text-4xl mb-4">📝</div>
                    <div className="text-sm text-muted">No todos for {section.title.toLowerCase()}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </DndContext>

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
