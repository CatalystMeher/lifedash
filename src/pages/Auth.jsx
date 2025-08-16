import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendMagicLink(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    setLoading(false)
    if (error) toast.error(error.message)
    else toast.success('Check your email for the sign-in link.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-gray-900">
      <div className="w-full max-w-sm p-8 card shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-md flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome to LifeDash</h1>
          <p className="text-muted">We'll email you a magic link to sign in.</p>
        </div>
        
        <form onSubmit={sendMagicLink} className="space-y-4">
          <div>
            <label className="text-sm text-muted mb-2 block">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input"
            />
          </div>
          <button
            disabled={loading}
            className="btn-primary w-full py-3 text-lg"
          >
            {loading ? 'Sending…' : 'Send magic link'}
          </button>
        </form>
      </div>
    </div>
  )
}
