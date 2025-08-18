import * as LucideIcons from 'lucide-react'

export default function OverlappedIcons({ stats, maxVisible = 3, size = 'md' }) {
  const visibleStats = stats.slice(0, maxVisible)
  const remainingCount = stats.length - maxVisible
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }
  
  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visibleStats.map((stat, index) => {
          const IconComponent = stat.icon && LucideIcons[stat.icon] 
            ? LucideIcons[stat.icon] 
            : LucideIcons.BarChart3
          
          return (
            <div
              key={stat.id}
              className={`${sizeClasses[size]} rounded-lg flex items-center justify-center border-2 border-white dark:border-gray-800 flex-shrink-0`}
              style={{ 
                background: stat.color || '#e5e5e5',
                zIndex: visibleStats.length - index
              }}
              title={stat.name}
            >
              <IconComponent className={`${iconSizeClasses[size]} text-white theme-icon`} />
            </div>
          )
        })}
        
        {remainingCount > 0 && (
          <div
            className={`${sizeClasses[size]} rounded-lg flex items-center justify-center border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex-shrink-0`}
            style={{ zIndex: 0 }}
            title={`${remainingCount} more stats`}
          >
            <span className={`${iconSizeClasses[size]} text-gray-600 dark:text-gray-300 font-medium text-xs`}>
              +{remainingCount}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
