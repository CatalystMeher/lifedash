import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, Circle, AlertTriangle, Clock, GripVertical, Calendar } from 'lucide-react'
import dayjs from 'dayjs'
import Card from './Card'

const priorityColors = {
  0: 'text-gray-400',
  1: 'text-orange-500',
  2: 'text-red-500'
}

const priorityIcons = {
  0: Circle,
  1: AlertTriangle,
  2: AlertTriangle
}

export default function TodoCard({ 
  todo, 
  onToggle, 
  onEdit, 
  onDelete, 
  onSchedule,
  isDragging = false,
  dragHandleProps = null,
  isOver = false
}) {
  const [isHovered, setIsHovered] = useState(false)
  const PriorityIcon = priorityIcons[todo.priority]
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: dndIsDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  
  const isOverdue = todo.due_date && !todo.completed && dayjs(todo.due_date).isBefore(dayjs(), 'day')
  const isToday = todo.due_date && dayjs(todo.due_date).isSame(dayjs(), 'day')
  const isTomorrow = todo.due_date && dayjs(todo.due_date).isSame(dayjs().add(1, 'day'), 'day')

  const getDueDateText = () => {
    if (!todo.due_date) return null
    if (isToday) return 'Today'
    if (isTomorrow) return 'Tomorrow'
    if (isOverdue) return `Overdue ${dayjs(todo.due_date).format('MMM D')}`
    return dayjs(todo.due_date).format('MMM D')
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group relative p-4 transition-all duration-200 ${
        dndIsDragging ? 'opacity-50 scale-95' : ''
      } ${isOver ? 'ring-2 ring-blue-500' : ''} ${
        todo.completed ? 'opacity-60' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={`cursor-grab active:cursor-grabbing p-1 rounded-lg ${
            isHovered ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-200 hover:bg-gray-100 dark:hover:bg-gray-800`}
        >
          <GripVertical className="w-4 h-4 text-muted" />
        </div>

        {/* Checkbox */}
        <button
          onClick={() => onToggle(todo)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            todo.completed
              ? 'accent-bg border-transparent'
              : 'theme-border hover:border-gray-400'
          }`}
        >
          {todo.completed && <Check className="w-4 h-4 accent-text" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 
                className={`font-medium transition-all duration-200 ${
                  todo.completed 
                    ? 'line-through text-muted' 
                    : 'theme-text'
                }`}
              >
                {todo.title}
              </h3>
              
              {/* Due Date */}
              {todo.due_date && (
                <div className={`flex items-center gap-1 mt-1 text-sm ${
                  isOverdue ? 'text-red-500' : 
                  isToday ? 'text-blue-500' : 
                  'text-muted'
                }`}>
                  <Clock className="w-3 h-3" />
                  <span>{getDueDateText()}</span>
                </div>
              )}

              {/* Notes */}
              {todo.notes && (
                <p className="text-sm text-muted mt-1 line-clamp-2">
                  {todo.notes}
                </p>
              )}
            </div>

            {/* Priority Icon */}
            {todo.priority > 0 && (
              <PriorityIcon className={`w-4 h-4 flex-shrink-0 ${priorityColors[todo.priority]}`} />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={`flex items-center gap-1 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          {onSchedule && (
            <button
              onClick={() => onSchedule(todo)}
              className="p-2 rounded-lg hover:theme-bg-secondary transition-colors"
              title="Schedule as event"
            >
              <Calendar className="w-4 h-4 text-muted" />
            </button>
          )}
          <button
            onClick={() => onEdit(todo)}
            className="p-2 rounded-lg hover:theme-bg-secondary transition-colors"
            title="Edit todo"
          >
            <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(todo)}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            title="Delete todo"
          >
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  )
} 
