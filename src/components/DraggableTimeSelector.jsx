import { useState, useRef, useEffect } from 'react'
import dayjs from 'dayjs'

export default function DraggableTimeSelector({ 
  onTimeSelect, 
  startHour = 0, 
  endHour = 24, 
  currentDate,
  className = "" 
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragEnd, setDragEnd] = useState(null)
  const [selection, setSelection] = useState(null)
  const containerRef = useRef(null)

  const totalHours = endHour - startHour
  const hourHeight = 100 / totalHours // percentage height per hour

  const getTimeFromPosition = (clientY) => {
    if (!containerRef.current) return null
    
    const rect = containerRef.current.getBoundingClientRect()
    const relativeY = clientY - rect.top
    const percentage = (relativeY / rect.height) * 100
    const hourOffset = (percentage / 100) * totalHours
    const hour = startHour + hourOffset
    
    // Snap to 15-minute intervals
    const roundedHour = Math.floor(hour)
    const minutes = Math.round((hour - roundedHour) * 4) * 15
    
    return dayjs(currentDate)
      .hour(roundedHour)
      .minute(minutes)
      .second(0)
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    const time = getTimeFromPosition(e.clientY)
    if (time) {
      setIsDragging(true)
      setDragStart(time)
      setDragEnd(time)
      setSelection({ start: time, end: time })
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    const time = getTimeFromPosition(e.clientY)
    if (time && dragStart) {
      const start = time.isBefore(dragStart) ? time : dragStart
      const end = time.isAfter(dragStart) ? time : dragStart
      
      setDragEnd(time)
      setSelection({ start, end })
    }
  }

  const handleMouseUp = () => {
    if (isDragging && selection) {
      const duration = selection.end.diff(selection.start, 'minute')
      if (duration >= 15) { // Minimum 15 minutes
        onTimeSelect({
          startTime: selection.start.hour(),
          startMinute: selection.start.minute(),
          endTime: selection.end.hour(),
          endMinute: selection.end.minute(),
          date: currentDate
        })
      }
    }
    
    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
    setSelection(null)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart])

  const getSelectionStyle = () => {
    if (!selection) return {}
    
    const startPercentage = ((selection.start.hour() + selection.start.minute() / 60 - startHour) / totalHours) * 100
    const endPercentage = ((selection.end.hour() + selection.end.minute() / 60 - startHour) / totalHours) * 100
    
    return {
      position: 'absolute',
      left: '0',
      right: '0',
      top: `${Math.min(startPercentage, endPercentage)}%`,
      height: `${Math.abs(endPercentage - startPercentage)}%`,
      backgroundColor: 'var(--accent-bg)',
      opacity: '0.2',
      border: '1px solid var(--accent-bg)',
      borderRadius: '4px',
      pointerEvents: 'none',
      zIndex: 5
    }
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 cursor-crosshair ${className}`}
      onMouseDown={handleMouseDown}
      style={{ userSelect: 'none' }}
    >
      {selection && (
        <div style={getSelectionStyle()} />
      )}
    </div>
  )
} 
