import { Outlet } from 'react-router-dom'
import TabBar from '../components/TabBar'
import SideNav from '../components/SideNav'
import { useMemo } from 'react'
import dayjs from 'dayjs'
import logo from '../assets/logo.png'
import { Settings } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

export default function MainLayout() {
  const { pathname } = useLocation()
  const today = useMemo(() => {
    return dayjs().format('ddd, MMM D')
  }, [])
  
  const isSettingsActive = pathname === '/settings' || pathname.startsWith('/settings/')

  return (
    <div
      className="
        min-h-screen h-screen flex theme-bg theme-text font-['Poppins',sans-serif]
      "
      style={{
        paddingTop: 'var(--safe-area-inset-top)',
        paddingBottom: 'var(--safe-area-inset-bottom)',
        paddingLeft: 'var(--safe-area-inset-left)',
        paddingRight: 'var(--safe-area-inset-right)',
      }}
    >
      {/* Side Navigation - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block lg:w-64 xl:w-72">
        <SideNav today={today} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Top App Header - Only on mobile */}
        <header className="lg:hidden sticky z-20 theme-nav-bg border-b theme-border shadow-sm">
          <div className="w-full px-4 flex items-center py-4">
            {/* Center - LifeDash Branding */}
            <div className="flex items-center gap-4">
              <img src={logo} alt="LifeDash Logo" className="w-12 h-12 rounded-xl" />
              <div>
                <h1 className="text-lg font-semibold theme-text">LifeDash</h1>
                <p className="text-sm text-muted">Command center</p>
              </div>
            </div>

            {/* Right side - Date and Settings */}
            <div className="flex-1 flex justify-end items-center gap-3">
              <div className="text-base font-bold theme-text">
                {today}
              </div>
              <NavLink
                to="/settings"
                className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200 ${
                  isSettingsActive
                    ? 'accent-bg scale-110'
                    : 'theme-text-secondary hover:theme-bg-secondary'
                }`}
              >
                <Settings 
                  size={20} 
                  className={`transition-colors duration-200 ${
                    isSettingsActive ? 'accent-text' : ''
                  }`}
                />
              </NavLink>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 w-full pb-20 lg:pb-6 pt-6 px-4 lg:px-6 overflow-y-auto min-h-0">
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
