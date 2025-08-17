import { useState } from 'react'
import { supabase } from '../lib/supabase'
import useUser from '../hooks/useUser'
import toast from 'react-hot-toast'
import { useTheme } from '../contexts/ThemeContext'
import { Palette, Sun, Moon, Droplets, Crown, Sunset } from 'lucide-react'

export default function Settings() {
  const { user } = useUser()
  const { currentTheme, changeTheme, themes } = useTheme()
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetText, setResetText] = useState('')
  const [isResetting, setIsResetting] = useState(false)

  const themeOptions = [
    { key: 'light', icon: Sun, color: 'bg-yellow-500' },
    { key: 'dark', icon: Moon, color: 'bg-gray-800' },
    { key: 'blue', icon: Droplets, color: 'bg-blue-600' },
    { key: 'purple', icon: Crown, color: 'bg-purple-600' },
    { key: 'warm', icon: Sunset, color: 'bg-orange-500' }
  ]

  const handleResetData = async () => {
    if (resetText !== 'DELETE ALL DATA') {
      toast.error('Please type "DELETE ALL DATA" exactly to confirm')
      return
    }

    setIsResetting(true)
    try {
      // Delete all user data from different tables
      const userId = user.id
      
      // Delete habit checkins
      const { error: checkinsError } = await supabase
        .from('habit_checkins')
        .delete()
        .eq('user_id', userId)
      
      if (checkinsError) throw checkinsError

      // Delete entries
      const { error: entriesError } = await supabase
        .from('entries')
        .delete()
        .eq('user_id', userId)
      
      if (entriesError) throw entriesError

      // Delete habits
      const { error: habitsError } = await supabase
        .from('habits')
        .delete()
        .eq('user_id', userId)
      
      if (habitsError) throw habitsError

      // Delete stats
      const { error: statsError } = await supabase
        .from('stats')
        .delete()
        .eq('user_id', userId)
      
      if (statsError) throw statsError

      toast.success('All data has been reset successfully')
      setShowResetDialog(false)
      setResetText('')
      
      // Refresh the page to reflect the changes
      window.location.reload()
      
    } catch (error) {
      console.error('Error resetting data:', error)
      toast.error('Failed to reset data. Please try again.')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
      
      {/* Theme Selection */}
      <div className="p-6 card">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Theme</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {themeOptions.map(({ key, icon: Icon, color }) => {
            const theme = themes[key]
            const isActive = currentTheme === key
            return (
              <button
                key={key}
                onClick={() => changeTheme(key)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  isActive
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {theme.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {theme.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      
      <div className="p-6 card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Account</h3>
        <div className="space-y-3">
          <button
            onClick={() => supabase.auth.signOut()}
            className="btn-secondary w-full"
          >
            Sign out
          </button>
          
          <button
            onClick={() => setShowResetDialog(true)}
            className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
          >
            Reset All Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowResetDialog(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl animate-slide-up">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Reset All Data
                </h3>
                <p className="text-sm text-muted mb-4">
                  This action will permanently delete all your habits, stats, and entries. This cannot be undone.
                </p>
                
                <div className="mb-4">
                  <label className="text-sm text-muted mb-2 block">
                    Type "DELETE ALL DATA" to confirm:
                  </label>
                  <input
                    type="text"
                    value={resetText}
                    onChange={(e) => setResetText(e.target.value)}
                    placeholder="DELETE ALL DATA"
                    className="input"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowResetDialog(false)
                      setResetText('')
                    }}
                    className="flex-1 btn-secondary"
                    disabled={isResetting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetData}
                    disabled={resetText !== 'DELETE ALL DATA' || isResetting}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      resetText === 'DELETE ALL DATA' && !isResetting
                        ? 'bg-red-500 hover:bg-red-600 text-white active:scale-95'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isResetting ? 'Resetting...' : 'Reset All Data'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
