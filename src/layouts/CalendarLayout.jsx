import { Outlet } from 'react-router-dom'
import TabBar from '../components/TabBar'
import SideNav from '../components/SideNav'
import { useMemo } from 'react'
import dayjs from 'dayjs'
import logo from '../assets/logo.png'

export default function CalendarLayout() {
  const today = useMemo(() => {
    return dayjs().format('ddd, MMM D')
  }, [])

  return (
    <div className="min-h-screen h-screen flex theme-bg theme-text font-['Poppins',sans-serif]">
      {/* Side Navigation - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block lg:w-64 xl:w-72">
        <SideNav today={today} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Top App Header - Only on mobile */}
        <header className="lg:hidden sticky top-safe z-20 theme-nav-bg border-b theme-border shadow-sm">
          <div className="w-full px-4 flex items-center py-4">
   
            {/* Center - LifeDash Branding */}
            <div className="flex items-center gap-4">
              <img src={logo} alt="LifeDash Logo" className="w-12 h-12 rounded-xl" />
              <div>
                <h1 className="text-lg font-semibold theme-text">LifeDash</h1>
                <p className="text-sm text-muted">Command center</p>
              </div>
            </div>

            {/* Right side - Date */}
            <div className="flex-1 flex justify-end">
              <div className="text-base font-bold theme-text">
                {today}
              </div>
            </div>
          </div>
        </header>

        {/* Content - Full width and height for calendar */}
        <main className="flex-1 pb-20 lg:pb-6 pt-6 w-full overflow-y-auto min-h-0">
          <Outlet />
        </main>

        {/* Bottom Tabs - Only on mobile */}
        <div className="lg:hidden">
          <TabBar />
        </div>
      </div>
    </div>
  )
}
