import { Outlet } from 'react-router-dom'
import TabBar from '../components/TabBar'
import { useMemo } from 'react'
import dayjs from 'dayjs'

export default function MainLayout() {
  const today = useMemo(() => {
    return dayjs().format('ddd, MMM D')
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-['Poppins',sans-serif]">
      {/* Top App Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 flex items-center py-4">
 
          {/* Center - LifeDash Branding */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-md flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Main wavy diagonal line */}
                <path d="M8 20 Q12 18 16 20 Q20 22 24 20" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/>
                
                {/* Upper-right branch */}
                <path d="M20 18 Q22 16 24 14 Q26 12 28 10" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>
                <path d="M26 12 L28 10 L26 8" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>
                <path d="M28 10 L30 10 L28 12" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>
                
                {/* Lower-left branch */}
                <path d="M12 22 Q10 24 8 26 Q6 28 4 30" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>
                <path d="M6 28 L4 30 L6 32" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>
                <path d="M4 30 L2 30 L4 28" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>
                
                {/* Smaller protrusions on upper curve */}
                <path d="M12 18 L12 20" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>
                <path d="M14 18 L14 20" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>
                
                {/* Smaller protrusions on lower curve */}
                <path d="M18 20 L18 22" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>
                <path d="M20 20 L20 22" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">LifeDash</h1>
              <p className="text-base text-muted">Your daily command center</p>
            </div>
          </div>

          {/* Right side - Date */}
          <div className="flex-1 flex justify-end">
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {today}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 pb-24 pt-6">
        <Outlet />
      </main>

      {/* Bottom Tabs */}
      <TabBar />
    </div>
  )
}
