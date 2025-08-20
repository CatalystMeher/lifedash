import { useEffect } from 'react'
import useUser from '../hooks/useUser'
import CalendarManager from '../components/CalendarManager'

export default function Calendar() {
  const { user, loading } = useUser()

 
  if (loading) {
      return (
    <div className="space-y-6 pb-10">
        <div className="text-center p-6 card">
          <div className="text-muted">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col px-4 lg:px-6 pb-10">
      <CalendarManager user={user} />
    </div>
  )
}
