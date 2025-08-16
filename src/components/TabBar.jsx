import { NavLink, useLocation } from 'react-router-dom'
import {
  Home as HomeIcon,
  LineChart,
  CheckSquare,
  Timer,
  BarChart3,
  Settings,
} from 'lucide-react'

const tabs = [
  { to: '/home', label: 'Home', Icon: HomeIcon },
  { to: '/stats', label: 'Stats', Icon: LineChart },
  { to: '/habits', label: 'Habits', Icon: CheckSquare },
  { to: '/focus', label: 'Focus', Icon: Timer },
  { to: '/analytics', label: 'Insights', Icon: BarChart3 },
  { to: '/settings', label: 'Settings', Icon: Settings },
]

export default function TabBar() {
  const { pathname } = useLocation()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 grid grid-cols-6">
        {tabs.map((tab) => {
          const active = pathname === tab.to
          const IconComponent = tab.Icon
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex flex-col items-center justify-center py-3 transition-all duration-200"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200 ${
                  active
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 scale-110'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <IconComponent
                  size={20}
                  className="transition-colors duration-200"
                />
              </div>
              <span
                className={`text-xs mt-1 font-medium transition-colors duration-200 ${
                  active ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </NavLink>
          )
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
