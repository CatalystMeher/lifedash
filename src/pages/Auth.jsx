import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, Github, Key, Check } from 'lucide-react'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authMode, setAuthMode] = useState('email') // 'email', 'magic', 'setPassword', or 'resetPassword'
  const [isSettingPassword, setIsSettingPassword] = useState(false)
  const [resetToken, setResetToken] = useState(null)

  // Check URL parameters and session for password reset
  useEffect(() => {
    const checkPasswordReset = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const hash = window.location.hash
      
      console.log('URL Search Params:', Object.fromEntries(urlParams.entries()))
      console.log('URL Hash:', hash)
      console.log('Full URL:', window.location.href)
      
      // Check for different possible password reset formats
      const accessToken = urlParams.get('access_token') || urlParams.get('token')
      const refreshToken = urlParams.get('refresh_token')
      const type = urlParams.get('type')
      const error = urlParams.get('error')
      const errorDescription = urlParams.get('error_description')
      
      // Check if this is a password reset flow
      if (type === 'recovery' || type === 'reset' || accessToken) {
        console.log('Password reset detected:', { type, accessToken, refreshToken })
        
        if (accessToken) {
          setResetToken({ access_token: accessToken, refresh_token: refreshToken })
          setAuthMode('resetPassword')
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname)
        } else if (error) {
          toast.error(errorDescription || 'Password reset failed')
        }
      } else if (urlParams.get('mode') === 'setPassword') {
        setAuthMode('setPassword')
        setIsSettingPassword(true)
      } else {
        // Check if user is already authenticated (from Supabase redirect)
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          console.log('User is authenticated, showing password reset form')
          setAuthMode('resetPassword')
          setResetToken({ access_token: session.access_token, refresh_token: session.refresh_token })
        }
      }
    }

    checkPasswordReset()
  }, [])

  async function handleEmailAuth(e) {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin }
        })
        if (error) throw error
        toast.success('Check your email to confirm your account!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) {
          // If password doesn't exist, offer to set one
          if (error.message.includes('Invalid login credentials')) {
            setIsSettingPassword(true)
            setAuthMode('setPassword')
            toast.error('No password set for this account. Please set a password first.')
          } else {
            throw error
          }
        } else {
          toast.success('Welcome back!')
        }
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function setPasswordForAccount(e) {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Send a password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth'
      })
      
      if (error) throw error
      
      toast.success('Check your email for the password reset link!')
      setAuthMode('magic') // Switch back to magic link mode
      setIsSettingPassword(false)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordReset(e) {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) throw error
      
      toast.success('Password updated successfully! You can now sign in with your new password.')
      setAuthMode('email')
      setPassword('')
      setConfirmPassword('')
      setResetToken(null)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function sendMagicLink(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin }
      })
      if (error) throw error
      toast.success('Check your email for the sign-in link.')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function signInWithGithub() {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin }
      })
      if (error) throw error
    } catch (error) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 theme-bg">
      <div className="w-full max-w-md p-8 card shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl accent-bg shadow-md flex items-center justify-center mx-auto mb-4">
            <span className="accent-text font-bold text-2xl">L</span>
          </div>
          <h1 className="text-2xl font-bold theme-text mb-2">Welcome to LifeDash</h1>
          <p className="text-muted">Sign in to continue to your dashboard</p>
        </div>
        
        {/* Auth Mode Toggle */}
        {!resetToken && (
          <div className="flex rounded-lg p-1 theme-bg-secondary mb-6">
            <button
              onClick={() => {
                setAuthMode('email')
                setIsSettingPassword(false)
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                authMode === 'email' 
                  ? 'accent-bg accent-text' 
                  : 'theme-text-secondary hover:theme-text'
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => {
                setAuthMode('magic')
                setIsSettingPassword(false)
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                authMode === 'magic' 
                  ? 'accent-bg accent-text' 
                  : 'theme-text-secondary hover:theme-text'
              }`}
            >
              Magic Link
            </button>
          </div>
        )}

        {/* Reset Password Form */}
        {authMode === 'resetPassword' && resetToken && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full accent-bg flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 accent-text" />
              </div>
              <h2 className="text-lg font-semibold theme-text mb-2">Set New Password</h2>
              <p className="text-sm text-muted">
                Enter your new password below
              </p>
            </div>
            
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="text-sm text-muted mb-2 block">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="input pl-10 pr-10"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:theme-text"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-muted mb-2 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="input pl-10 pr-10"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:theme-text"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <button
                disabled={loading}
                className="btn-primary w-full py-3 text-lg"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* Set Password Form */}
        {authMode === 'setPassword' && !resetToken && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full accent-bg flex items-center justify-center mx-auto mb-3">
                <Key className="w-6 h-6 accent-text" />
              </div>
              <h2 className="text-lg font-semibold theme-text mb-2">Set Password</h2>
              <p className="text-sm text-muted">
                Your account was created with magic link. Set a password to use email & password login.
              </p>
            </div>
            
            <form onSubmit={setPasswordForAccount} className="space-y-4">
              <div>
                <label className="text-sm text-muted mb-2 block">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input pl-10"
                  />
                </div>
              </div>
              
              <button
                disabled={loading}
                className="btn-primary w-full py-3 text-lg"
              >
                {loading ? 'Sending...' : 'Send Password Reset Link'}
              </button>
            </form>
            
            <div className="text-center">
              <button
                onClick={() => {
                  setAuthMode('magic')
                  setIsSettingPassword(false)
                }}
                className="text-sm accent-text hover:underline"
              >
                Or continue with magic link
              </button>
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        {authMode === 'email' && !resetToken && (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="text-sm text-muted mb-2 block">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-muted mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:theme-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="btn-primary w-full py-3 text-lg"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>
        )}

        {/* Magic Link Form */}
        {authMode === 'magic' && !resetToken && (
          <form onSubmit={sendMagicLink} className="space-y-4">
            <div>
              <label className="text-sm text-muted mb-2 block">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-10"
                />
              </div>
            </div>
            <button
              disabled={loading}
              className="btn-primary w-full py-3 text-lg"
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
          </form>
        )}

        {/* Toggle between Sign In and Sign Up */}
        {authMode === 'email' && !resetToken && (
          <div className="text-center mt-4">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm accent-text hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        )}

        {/* Help text for magic link users */}
        {authMode === 'magic' && !resetToken && (
          <div className="text-center mt-4">
            <button
              onClick={() => {
                setAuthMode('setPassword')
                setIsSettingPassword(true)
              }}
              className="text-sm accent-text hover:underline"
            >
              Want to set a password for faster login?
            </button>
          </div>
        )}

        {/* Divider */}
        {!resetToken && (
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full theme-border border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 theme-bg text-muted">Or continue with</span>
            </div>
          </div>
        )}

        {/* Social Login */}
        {!resetToken && (
          <button
            onClick={signInWithGithub}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border theme-border rounded-lg hover:theme-bg-secondary transition-colors"
          >
            <Github className="w-5 h-5" />
            <span className="theme-text">Continue with GitHub</span>
          </button>
        )}

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
