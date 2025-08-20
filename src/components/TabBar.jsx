import { NavLink, useLocation } from 'react-router-dom'
import {
  Home as HomeIcon,
  LineChart,
  CheckSquare,
  ListTodo,
  Calendar as CalendarIcon,
  Timer,
  BarChart3,
} from 'lucide-react'

const tabs = [
  { to: '/home', label: 'Home', Icon: HomeIcon },
  { to: '/stats', label: 'Stats', Icon: LineChart },
  { to: '/habits', label: 'Habits', Icon: CheckSquare },
  { to: '/todos', label: 'Todos', Icon: ListTodo },
  { to: '/focus', label: 'Focus', Icon: Timer },
  { to: '/analytics', label: 'Insights', Icon: BarChart3 },
]

export default function TabBar() {
  const { pathname } = useLocation()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t theme-border theme-nav-bg shadow-sm pb-[10px]">
      <div className="flex justify-around items-center px-2 py-2">
        {tabs.map((tab) => {
          const active = pathname === tab.to || pathname.startsWith(`${tab.to}/`)
          const IconComponent = tab.Icon
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex flex-col items-center justify-center py-2 px-1 min-w-0 flex-1 transition-all duration-200"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200 mb-1 ${
                  active
                    ? 'accent-bg scale-110'
                    : 'bg-transparent theme-text-secondary hover:theme-bg-secondary'
                }`}
              >
                <IconComponent
                  size={20}
                  className={`transition-colors duration-200 ${
                    active ? 'accent-text' : ''
                  }`}
                />
              </div>
              <span
                className={`text-xs font-medium transition-colors duration-200 text-center truncate w-full ${
                  active ? 'theme-text font-semibold' : 'theme-text-secondary'
                }`}
              >
                {tab.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
