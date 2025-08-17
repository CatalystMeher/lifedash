import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useUser from '../hooks/useUser'

export default function RequireAuth() {
  const { user, loading } = useUser()
  const loc = useLocation()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-bg theme-text">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Loading LifeDash...</div>
          <div className="text-sm text-muted">Please wait while we verify your session</div>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: loc.pathname }} />
  }
  
  return <Outlet />
}
