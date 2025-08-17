import { NavLink, useLocation } from 'react-router-dom'
import {
  Home as HomeIcon,
  LineChart,
  CheckSquare,
  Timer,
  BarChart3,
  Settings,
} from 'lucide-react'
import logo from '../assets/logo.png'

const tabs = [
  { to: '/home', label: 'Home', Icon: HomeIcon },
  { to: '/stats', label: 'Stats', Icon: LineChart },
  { to: '/habits', label: 'Habits', Icon: CheckSquare },
  { to: '/focus', label: 'Focus', Icon: Timer },
  { to: '/analytics', label: 'Insights', Icon: BarChart3 },
  { to: '/settings', label: 'Settings', Icon: Settings },
]

export default function SideNav({ today }) {
  const { pathname } = useLocation()

  return (
    <nav className="h-screen sticky top-0 flex flex-col theme-sidebar-bg border-r theme-border">
      {/* Header */}
      <div className="p-6 border-b theme-border">
        <div className="flex items-center gap-4 mb-4">
          <img src={logo} alt="LifeDash Logo" className="w-12 h-12 rounded-xl" />
          <div>
            <h1 className="text-lg font-semibold theme-text">LifeDash</h1>
            <p className="text-sm text-muted">Command center</p>
          </div>
        </div>
        <div className="text-sm font-medium theme-text">
          {today}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => {
          const active = pathname === tab.to
          const IconComponent = tab.Icon
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'theme-text-secondary hover:theme-bg-secondary'
              }`}
            >
              <IconComponent
                size={20}
                className="transition-colors duration-200"
              />
              <span className="font-medium transition-colors duration-200">
                {tab.label}
              </span>
            </NavLink>
          )
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t theme-border">
        <div className="text-xs text-muted text-center">
          LifeDash v1.0
        </div>
      </div>
    </nav>
  )
}
