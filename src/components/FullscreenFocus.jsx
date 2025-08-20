import { useEffect, useState } from 'react'
import { Play, Pause, X, Maximize2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

function fetchDurationStats() {
  return supabase.from('stats').select('*').eq('type','duration').order('inserted_at',{ascending:false})
}

export default function FullscreenFocus({ 
  isOpen, 
  onClose, 
  statId, 
  elapsedSec, 
  isRunning, 
  onPause, 
  onResume, 
  onFinish,
  countdownMode = false,
  modeMin = 25
}) {
  const [isLandscape, setIsLandscape] = useState(false)
  
  // Fetch stats to get the stat name
  const { data } = useQuery({
    queryKey: ['duration-stats'],
    queryFn: fetchDurationStats,
    enabled: isOpen
  })
  
  const stats = data?.data || []
  const currentStat = stats.find(s => s.id === statId)
  
  // Check if device is in landscape mode
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight)
    }
    
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])
  
  // Prevent body scroll when fullscreen is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  const mm = String(Math.floor(elapsedSec/60)).padStart(2,'0')
  const ss = String(elapsedSec%60).padStart(2,'0')
  
  // Calculate remaining time for countdown display
  const remainingTime = countdownMode ? elapsedSec : null
  const remainingMM = remainingTime ? String(Math.floor(remainingTime/60)).padStart(2,'0') : mm
  const remainingSS = remainingTime ? String(remainingTime%60).padStart(2,'0') : ss
  
  return (
    <div className="fixed inset-0 z-50 bg-black animate-fade-in">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 z-10 p-3 text-white/70 hover:text-white transition-colors fullscreen-close-top"
      >
        <X size={24} />
      </button>
      
      {/* Main content */}
      <div className={`h-full flex items-center justify-center ${
        isLandscape ? 'flex-row' : 'flex-col'
      }`}>
        
        {/* Timer Display */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            {/* Stat Name */}
            {currentStat && (
              <div className="mb-8">
                <div className="text-white/60 text-lg font-medium mb-2">
                  Focus Session
                </div>
                <div className="text-white text-2xl font-semibold">
                  {currentStat.name}
                </div>
              </div>
            )}
            
            {/* Timer */}
            <div className="text-white font-light tracking-wider">
              <div className={`text-8xl sm:text-9xl lg:text-[12rem] leading-none ${
                countdownMode && elapsedSec <= 60 && elapsedSec > 0 ? 'text-red-400 animate-pulse' : ''
              }`}>
                {remainingMM}:{remainingSS}
              </div>
              {countdownMode && (
                <div className="text-white/60 text-lg mt-4">
                  Countdown: {Math.floor(modeMin)} minutes
                  {elapsedSec <= 60 && elapsedSec > 0 && (
                    <span className="text-red-400 ml-2">• Less than 1 minute remaining!</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className={`flex items-center justify-center ${
          isLandscape ? 'flex-col mx-8' : 'flex-row mt-8'
        } gap-6`}>
          
          {/* Play/Pause Button */}
          <button
            onClick={isRunning ? onPause : onResume}
            className={`rounded-full flex items-center justify-center transition-all duration-300 ${
              isRunning 
                ? 'bg-white/20 hover:bg-white/30' 
                : 'bg-white hover:bg-white/90'
            }`}
            style={{
              width: isLandscape ? '80px' : '100px',
              height: isLandscape ? '80px' : '100px'
            }}
          >
            {isRunning ? (
              <Pause 
                size={isLandscape ? 32 : 40} 
                className={isRunning ? 'text-white' : 'text-black'} 
              />
            ) : (
              <Play 
                size={isLandscape ? 32 : 40} 
                className={isRunning ? 'text-white' : 'text-black'} 
              />
            )}
          </button>
          
          {/* Finish Button */}
          <button
            onClick={onFinish}
            className="rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-300"
            style={{
              width: isLandscape ? '60px' : '80px',
              height: isLandscape ? '60px' : '80px'
            }}
          >
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </button>
        </div>
      </div>
    </div>
  )
}
