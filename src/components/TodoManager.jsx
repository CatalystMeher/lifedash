import { useState, useEffect, useMemo } from 'react'
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
import { Plus, Search, Calendar, Clock, Star, CheckCircle, Archive, Filter } from 'lucide-react'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

const sections = [
  { id: 'today', title: 'Today', icon: Calendar, date: dayjs().format('YYYY-MM-DD'), color: 'text-blue-500' },
  { id: 'tomorrow', title: 'Tomorrow', icon: Clock, date: dayjs().add(1, 'day').format('YYYY-MM-DD'), color: 'text-orange-500' },
  { id: 'upcoming', title: 'Upcoming', icon: Calendar, date: null, color: 'text-purple-500' },
  { id: 'no-date', title: 'No Due Date', icon: Star, date: null, color: 'text-gray-500' },
  { id: 'completed', title: 'Completed', icon: CheckCircle, date: null, color: 'text-green-500' }
]

const priorityFilters = [
  { value: 'all', label: 'All Priorities' },
  { value: '0', label: 'Normal' },
  { value: '1', label: 'High' },
  { value: '2', label: 'Urgent' }
]

async function fetchAllTodos(userId) {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('order_index', { ascending: true })
    .order('inserted_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export default function TodoManager({ user }) {
  const queryClient = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)
  const [deleteTodo, setDeleteTodo] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showCompleted, setShowCompleted] = useState(true)
  const [viewMode, setViewMode] = useState('sections') // 'sections' or 'list'

  const { data: todos = [], isLoading, refetch } = useQuery({
    queryKey: ['todos-all', user?.id],
    queryFn: () => fetchAllTodos(user.id),
    enabled: !!user
  })

  // Filter todos based on search and priority
  const filteredTodos = useMemo(() => {
    let filtered = todos

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.notes && todo.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(todo => todo.priority === parseInt(priorityFilter))
    }

    // Apply completed filter
    if (!showCompleted) {
      filtered = filtered.filter(todo => !todo.completed)
    }

    return filtered
  }, [todos, searchQuery, priorityFilter, showCompleted])

  // Group todos by section
  const groupedTodos = useMemo(() => {
    return sections.map(section => {
      let sectionTodos = []
      
      if (section.id === 'today') {
        sectionTodos = filteredTodos.filter(todo => 
          todo.due_date === section.date && !todo.completed
        )
      } else if (section.id === 'tomorrow') {
        sectionTodos = filteredTodos.filter(todo => 
          todo.due_date === section.date && !todo.completed
        )
      } else if (section.id === 'upcoming') {
        sectionTodos = filteredTodos.filter(todo => 
          todo.due_date && 
          todo.due_date > dayjs().add(1, 'day').format('YYYY-MM-DD') && 
          !todo.completed
        )
      } else if (section.id === 'no-date') {
        sectionTodos = filteredTodos.filter(todo => 
          !todo.due_date && !todo.completed
        )
      } else if (section.id === 'completed') {
        sectionTodos = filteredTodos.filter(todo => todo.completed)
      }

      return {
        ...section,
        todos: sectionTodos
      }
    })
  }, [filteredTodos])

  // Get statistics
  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter(t => t.completed).length
    const pending = total - completed
    const overdue = todos.filter(t => 
      t.due_date && 
      !t.completed && 
      dayjs(t.due_date).isBefore(dayjs(), 'day')
    ).length

    return { total, completed, pending, overdue }
  }, [todos])

  const handleToggle = async (todo) => {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', todo.id)
    
    if (error) {
      toast.error('Failed to update todo')
      return
    }
    
    queryClient.invalidateQueries(['todos-all'])
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
    
    queryClient.invalidateQueries(['todos-all'])
    queryClient.invalidateQueries(['todos-today'])
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
    
    queryClient.invalidateQueries(['todos-all'])
    queryClient.invalidateQueries(['todos-today'])
    toast.success('Todo moved')
  }

  const handleCreated = () => {
    refetch()
    setEditingTodo(null)
  }

  const clearCompleted = async () => {
    const completedTodos = todos.filter(t => t.completed)
    if (completedTodos.length === 0) return

    const { error } = await supabase
      .from('todos')
      .delete()
      .in('id', completedTodos.map(t => t.id))
    
    if (error) {
      toast.error('Failed to clear completed todos')
      return
    }
    
    queryClient.invalidateQueries(['todos-all'])
    queryClient.invalidateQueries(['todos-today'])
    toast.success(`Cleared ${completedTodos.length} completed todos`)
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold theme-text">Todos</h2>
          <p className="text-sm text-muted">
            {stats.pending} pending • {stats.completed} completed
            {stats.overdue > 0 && ` • ${stats.overdue} overdue`}
          </p>
        </div>
        <button 
          onClick={() => setOpenModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Todo
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted" />
            <span className="text-sm font-medium theme-text">Filters:</span>
          </div>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-sm theme-button-secondary rounded-xl"
          >
            {priorityFilters.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded"
            />
            Show completed
          </label>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('sections')}
              className={`px-3 py-2 text-sm rounded-xl transition-colors ${
                viewMode === 'sections' 
                  ? 'accent-bg accent-text' 
                  : 'theme-button-secondary'
              }`}
            >
              Sections
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm rounded-xl transition-colors ${
                viewMode === 'list' 
                  ? 'accent-bg accent-text' 
                  : 'theme-button-secondary'
              }`}
            >
              List
            </button>
          </div>

          {stats.completed > 0 && (
            <button
              onClick={clearCompleted}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              Clear completed
            </button>
          )}
        </div>
      </div>

      {/* Todo Sections */}
      {viewMode === 'sections' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTodos.map(todo => todo.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {groupedTodos.map(section => {
                const IconComponent = section.icon
                if (section.todos.length === 0 && !showCompleted) return null
                
                return (
                  <div key={section.id} className="space-y-3">
                    {/* Section Header */}
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-5 h-5 ${section.color}`} />
                      <h3 className="text-lg font-semibold theme-text">{section.title}</h3>
                      <span className="text-sm text-muted">({section.todos.length})</span>
                    </div>

                    {/* Todo List */}
                    <DroppableSection section={section}>
                      <div className="space-y-2">
                        {section.todos.map((todo) => (
                          <TodoCard
                            key={todo.id}
                            todo={todo}
                            onToggle={handleToggle}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
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
          </SortableContext>
        </DndContext>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredTodos.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          
          {filteredTodos.length === 0 && (
            <div className="text-center p-8 card">
              <div className="text-4xl mb-4">📝</div>
              <div className="text-lg font-semibold theme-text mb-2">No todos found</div>
              <div className="text-muted">Try adjusting your search or filters</div>
            </div>
          )}
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
