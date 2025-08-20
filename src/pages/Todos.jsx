import { useEffect } from 'react'
import useUser from '../hooks/useUser'
import TodoManager from '../components/TodoManager'

export default function Todos() {
  const { user, loading } = useUser()

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
    <div className="space-y-6 pb-10">
      <TodoManager user={user} />
    </div>
  )
}
