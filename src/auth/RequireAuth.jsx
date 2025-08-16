import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useUser from '../hooks/useUser'

export default function RequireAuth() {
  const { user, loading } = useUser()
  const loc = useLocation()
  if (loading) return <div className="p-6 text-sm opacity-70">Loading…</div>
  if (!user) return <Navigate to="/auth" replace state={{ from: loc.pathname }} />
  return <Outlet />
}
