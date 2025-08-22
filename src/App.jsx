import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import RequireAuth from './auth/RequireAuth'
import MainLayout from './layouts/MainLayout'
import CalendarLayout from './layouts/CalendarLayout'
import Home from './pages/Home'
import Stats from './pages/Stats'
import Habits from './pages/Habits'
import Todos from './pages/Todos'
import Calendar from './pages/Calendar'
import Focus from './pages/Focus'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Auth from './pages/Auth'
import StatDetail from './pages/StatDetail'
import AIChat from './pages/AIChat'
import Landing from './pages/Landing'
import Privacy from './pages/Privacy'
import ErrorBoundary from './components/ErrorBoundary'
import GuidedTour from './components/GuidedTour'
import { ThemeProvider } from './contexts/ThemeContext'
import { TourProvider } from './contexts/TourContext'
import { initializeCapacitor } from './lib/capacitor'
import useFirstTimeUser from './hooks/useFirstTimeUser'
import { initIAP } from './lib/iap';


export default function App() {
  const { isFirstTimeUser } = useFirstTimeUser();
  
  useEffect(() => {
    // Initialize Capacitor when the app starts
    initializeCapacitor();
  }, []);

  useEffect(() => {
    initIAP(); // run once
  }, []);

  return (
    <ThemeProvider>
      <TourProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route element={<RequireAuth />}>
              <Route element={<MainLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/habits" element={<Habits />} />
                <Route path="/todos" element={<Todos />} />
                <Route path="/focus" element={<Focus />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/stats/:id" element={<StatDetail />} />
              </Route>
              <Route path="/ai-chat" element={<AIChat />} />
              {/* Calendar temporarily disabled
              <Route element={<CalendarLayout />}>
                <Route path="/calendar" element={<Calendar />} />
              </Route>
              */}
            </Route>
          </Routes>
          
          {/* Guided Tour */}
          <GuidedTour isFirstTimeUser={isFirstTimeUser} />
        </ErrorBoundary>
      </TourProvider>
    </ThemeProvider>
  )
}
