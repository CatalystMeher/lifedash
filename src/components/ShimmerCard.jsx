import React from 'react'

const ShimmerCard = ({ className = "", children, ...props }) => {
  return (
    <div 
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
        animation: 'shimmer 2s infinite'
      }}
      {...props}
    >
      {children}
    </div>
  )
}

// Shimmer component for the "Today at a glance" cards
export const ShimmerGlanceCard = () => (
  <div className="p-4 rounded-lg theme-card shadow-sm w-full">
    <div className="animate-pulse">
      <div className="h-3 theme-shimmer rounded w-16 mb-2"></div>
      <div className="flex items-end justify-between">
        <div className="h-8 theme-shimmer rounded w-12"></div>
        <div className="h-3 theme-shimmer rounded w-8"></div>
      </div>
    </div>
  </div>
)

// Shimmer component for stat cards
export const ShimmerStatCard = ({ count = 1 }) => {
  if (count === 1) {
    return (
      <div className="p-4 rounded-lg theme-card shadow-sm w-full">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-3 theme-shimmer rounded w-20 mb-2"></div>
              <div className="h-6 theme-shimmer rounded w-16 mb-1"></div>
              <div className="h-2 theme-shimmer rounded w-12"></div>
            </div>
            <div className="w-8 h-8 theme-shimmer rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="p-4 rounded-lg theme-card shadow-sm w-full">
          <div className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-3 theme-shimmer rounded w-20 mb-2"></div>
                <div className="h-6 theme-shimmer rounded w-16 mb-1"></div>
                <div className="h-2 theme-shimmer rounded w-12"></div>
              </div>
              <div className="w-8 h-8 theme-shimmer rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

// Shimmer component for habit cards
export const ShimmerHabitCard = ({ count = 1 }) => {
  if (count === 1) {
    return (
      <div className="p-4 rounded-lg theme-card shadow-sm w-full">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 theme-shimmer rounded-full"></div>
              <div>
                <div className="h-4 theme-shimmer rounded w-24 mb-1"></div>
                <div className="h-3 theme-shimmer rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="p-4 rounded-lg theme-card shadow-sm w-full">
          <div className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 theme-shimmer rounded-full"></div>
                <div>
                  <div className="h-4 theme-shimmer rounded w-24 mb-1"></div>
                  <div className="h-3 theme-shimmer rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Shimmer component for sparkline card
export const ShimmerSparklineCard = () => (
  <div className="p-4 rounded-lg theme-card shadow-sm w-full">
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-3 theme-shimmer rounded w-16"></div>
        <div className="h-3 theme-shimmer rounded w-6"></div>
      </div>
      <div className="h-12 theme-shimmer rounded"></div>
    </div>
  </div>
)

export default ShimmerCard
