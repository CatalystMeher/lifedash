import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import CalendarEvent from './CalendarEvent'

export default function DraggableCalendarEvent({ 
  event, 
  onClick, 
  onDelete, 
  colorOptions,
  compact = false 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <CalendarEvent
        event={event}
        onClick={onClick}
        onDelete={onDelete}
        colorOptions={colorOptions}
        compact={compact}
      />
    </div>
  )
}
