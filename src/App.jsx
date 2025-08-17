import { Routes, Route, Navigate } from 'react-router-dom'
import RequireAuth from './auth/RequireAuth'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Stats from './pages/Stats'
import Habits from './pages/Habits'
import Focus from './pages/Focus'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Auth from './pages/Auth'
import StatDetail from './pages/StatDetail'
import ErrorBoundary from './components/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/focus" element={<Focus />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/stats/:id" element={<StatDetail />} />
            </Route>
          </Route>
        </Routes>
      </ErrorBoundary>
    </ThemeProvider>
  )
}
