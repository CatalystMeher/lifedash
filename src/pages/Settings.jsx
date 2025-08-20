import { useState } from 'react'
import { supabase } from '../lib/supabase'
import useUser from '../hooks/useUser'
import toast from 'react-hot-toast'
import { useTheme } from '../contexts/ThemeContext'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { Palette, Sun, Moon, Droplets, Github, Zap, Code, Eye, DollarSign, IndianRupee, Shield } from 'lucide-react'

export default function Settings() {
  const { user } = useUser()
  const { currentTheme, changeTheme, themes } = useTheme()
  const { preferences, updatePreferences, isUpdating } = useUserPreferences()
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [resetText, setResetText] = useState('')
  const [isResetting, setIsResetting] = useState(false)



  const themeOptions = [
    { key: 'light', icon: Sun, accentColor: '#fbbf24', textColor: '#000000' },
    { key: 'dark', icon: Moon, accentColor: '#6b7280', textColor: '#ffffff' },
    { key: 'blue', icon: Droplets, accentColor: '#3b82f6', textColor: '#ffffff' },
    { key: 'github', icon: Github, accentColor: '#f78166', textColor: '#ffffff' },
    { key: 'dracula', icon: Zap, accentColor: '#bd93f9', textColor: '#ffffff' },
    { key: 'monokai', icon: Code, accentColor: '#f92672', textColor: '#ffffff' },
    { key: 'solarized', icon: Eye, accentColor: '#268bd2', textColor: '#ffffff' }
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
      <h2 className="theme-text-2xl">Settings</h2>
      
      {/* Theme Selection */}
      <div className="p-6 card">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 theme-text-secondary" />
          <h3 className="theme-text-lg">Theme</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {themeOptions.map(({ key, icon: Icon, accentColor, textColor }) => {
            const theme = themes[key]
            const isActive = currentTheme === key
            return (
              <button
                key={key}
                onClick={() => changeTheme(key)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  isActive
                    ? 'accent-border accent-bg'
                    : 'theme-border hover:theme-bg-secondary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Icon className="w-4 h-4" style={{ color: textColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div 
                      className={`font-medium truncate ${
                        isActive ? 'accent-text' : 'theme-text'
                      }`}
                    >
                      {theme.name}
                    </div>
                    <div 
                      className={`text-sm truncate ${
                        isActive ? 'accent-text opacity-80' : 'theme-text-secondary'
                      }`}
                    >
                      {theme.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="ml-auto flex-shrink-0">
                      <div className="w-2 h-2 accent-bg rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Amount Formatting */}
      <div className="p-6 card">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 theme-text-secondary" />
          <h3 className="theme-text-lg">Amount Formatting</h3>
        </div>
        <div className="space-y-3">
          <div className="text-sm text-muted mb-4">
            Choose how large numbers are displayed in amount-type stats
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => updatePreferences({ amount_format: 'US' })}
              disabled={isUpdating}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                preferences?.amount_format === 'US'
                  ? 'accent-border accent-bg'
                  : 'theme-border hover:theme-bg-secondary'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${
                    preferences.amount_format === 'US' ? 'accent-text' : 'theme-text'
                  }`}>
                    US Format
                  </div>
                  <div className={`text-sm ${
                    preferences.amount_format === 'US' ? 'accent-text opacity-80' : 'theme-text-secondary'
                  }`}>
                    1K, 1M, 1B
                  </div>
                </div>
                {preferences.amount_format === 'US' && (
                  <div className="ml-auto flex-shrink-0">
                    <div className="w-2 h-2 accent-bg rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
            
            <button
              onClick={() => updatePreferences({ amount_format: 'IN' })}
              disabled={isUpdating}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                preferences?.amount_format === 'IN'
                  ? 'accent-border accent-bg'
                  : 'theme-border hover:theme-bg-secondary'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${
                    preferences.amount_format === 'IN' ? 'accent-text' : 'theme-text'
                  }`}>
                    Indian Format
                  </div>
                  <div className={`text-sm ${
                    preferences.amount_format === 'IN' ? 'accent-text opacity-80' : 'theme-text-secondary'
                  }`}>
                    1K, 1L, 1Cr
                  </div>
                </div>
                {preferences.amount_format === 'IN' && (
                  <div className="ml-auto flex-shrink-0">
                    <div className="w-2 h-2 accent-bg rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          </div>
          
          <div className="text-xs text-muted mt-3">
            <strong>US:</strong> 1K = 1,000, 1M = 1,000,000, 1B = 1,000,000,000<br />
            <strong>Indian:</strong> 1K = 1,000, 1L = 1,00,000, 1Cr = 1,00,00,000
          </div>
        </div>
      </div>
      
      <div className="p-6 card">
        <h3 className="theme-text-lg mb-4">Account</h3>
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

      {/* Legal & Privacy */}
      <div className="p-6 card">
        <h3 className="theme-text-lg mb-4">Legal & Privacy</h3>
        <div className="space-y-3">
          <a
            href="/privacy"
            className="flex items-center gap-3 p-3 rounded-xl border theme-border hover:theme-bg-secondary transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium theme-text">Privacy Policy</div>
              <div className="text-sm theme-text-secondary">How we handle your data</div>
            </div>
          </a>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowResetDialog(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md card rounded-2xl shadow-xl animate-slide-up">
              <div className="p-6">
                <h3 className="theme-text-lg mb-2">
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
                        : 'theme-bg-secondary theme-text-secondary cursor-not-allowed'
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
