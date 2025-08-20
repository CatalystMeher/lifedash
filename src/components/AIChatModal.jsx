import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, User, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import useUser from '../hooks/useUser'
import { useUserPreferences } from '../hooks/useUserPreferences'

const QUICK_MESSAGES = [
  "How am I doing with my habits this week?",
  "What's my focus time trend?",
  "Give me tips to improve my productivity",
  "Analyze my stats and suggest improvements",
  "Help me set better goals",
  "What should I focus on today?",
  "How can I build better routines?",
  "Show me my progress summary"
]

export default function AIChatModal({ open, onClose }) {
  const { user } = useUser()
  const { preferences } = useUserPreferences()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Fetch user data for AI context
  const { data: stats = [] } = useQuery({
    queryKey: ['stats-ai'],
    queryFn: async () => {
      const { data, error } = await supabase.from('stats').select('*').order('inserted_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    enabled: open && !!user
  })

  const { data: habits = [] } = useQuery({
    queryKey: ['habits-ai'],
    queryFn: async () => {
      const { data, error } = await supabase.from('habits').select('*').eq('user_id', user?.id).order('inserted_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    enabled: open && !!user
  })

  const { data: recentEntries = [] } = useQuery({
    queryKey: ['entries-ai'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entries')
        .select('stat_id, day, value')
        .gte('day', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('day', { ascending: false })
      if (error) throw error
      return data || []
    },
    enabled: open && !!user
  })

  const { data: todos = [] } = useQuery({
    queryKey: ['todos-ai'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data || []
    },
    enabled: open && !!user
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return

    const userMessage = { role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Calculate comprehensive summaries to minimize token usage
      const statsSummary = stats.map(stat => {
        const statEntries = recentEntries.filter(entry => entry.stat_id === stat.id)
        const totalEntries = statEntries.length
        const totalValue = statEntries.reduce((sum, entry) => sum + entry.value, 0)
        const avgValue = totalEntries > 0 ? (totalValue / totalEntries).toFixed(2) : 0
        
        // Get recent trend (last 7 days vs previous 7 days)
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        
        const recentWeek = statEntries.filter(entry => new Date(entry.inserted_at) >= weekAgo)
        const previousWeek = statEntries.filter(entry => {
          const entryDate = new Date(entry.inserted_at)
          return entryDate >= twoWeeksAgo && entryDate < weekAgo
        })
        
        const recentWeekTotal = recentWeek.reduce((sum, entry) => sum + entry.value, 0)
        const previousWeekTotal = previousWeek.reduce((sum, entry) => sum + entry.value, 0)
        const weekChange = previousWeekTotal > 0 ? ((recentWeekTotal - previousWeekTotal) / previousWeekTotal * 100).toFixed(1) : 0
        
        return {
          name: stat.name,
          type: stat.type,
          unit: stat.unit,
          totalEntries,
          totalValue: totalValue.toFixed(2),
          averageValue: avgValue,
          recentWeekTotal: recentWeekTotal.toFixed(2),
          weekChange: `${weekChange}%`,
          lastEntry: statEntries.length > 0 ? new Date(statEntries[0].inserted_at).toLocaleDateString() : 'Never'
        }
      })

      const habitsSummary = habits.map(habit => {
        const checkins = habit.checkins || []
        const totalCheckins = checkins.length
        const currentStreak = habit.streak || 0
        
        // Calculate weekly and monthly completion rates
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        
        const weeklyCheckins = checkins.filter(checkin => new Date(checkin.date) >= weekAgo).length
        const monthlyCheckins = checkins.filter(checkin => new Date(checkin.date) >= monthAgo).length
        
        // Calculate expected checkins based on schedule
        const daysSinceStart = habit.created_at ? Math.floor((now - new Date(habit.created_at)) / (24 * 60 * 60 * 1000)) : 30
        const expectedWeekly = habit.schedule === 'daily' ? 7 : habit.schedule === 'weekly' ? 1 : 3
        const expectedMonthly = expectedWeekly * 4
        
        const weeklyRate = expectedWeekly > 0 ? Math.round((weeklyCheckins / expectedWeekly) * 100) : 0
        const monthlyRate = expectedMonthly > 0 ? Math.round((monthlyCheckins / expectedMonthly) * 100) : 0
        
        return {
          name: habit.name,
          description: habit.description,
          schedule: habit.schedule || 'daily',
          totalCheckins,
          currentStreak,
          weeklyCheckins,
          weeklyRate: `${weeklyRate}%`,
          monthlyCheckins,
          monthlyRate: `${monthlyRate}%`,
          lastCheckin: checkins.length > 0 ? new Date(checkins[0].date).toLocaleDateString() : 'Never'
        }
      })

      // Get detailed todo summary with pending items
      const pendingTodos = todos.filter(todo => !todo.completed)
      const highPriorityTodos = pendingTodos.filter(todo => todo.priority === 'high')
      const mediumPriorityTodos = pendingTodos.filter(todo => todo.priority === 'medium')
      const lowPriorityTodos = pendingTodos.filter(todo => todo.priority === 'low')
      
      const todosSummary = {
        total: todos.length,
        completed: todos.filter(todo => todo.completed).length,
        pending: pendingTodos.length,
        highPriority: highPriorityTodos.length,
        mediumPriority: mediumPriorityTodos.length,
        lowPriority: lowPriorityTodos.length,
        completionRate: todos.length > 0 ? Math.round((todos.filter(todo => todo.completed).length / todos.length) * 100) : 0,
        pendingTodos: pendingTodos.slice(0, 10).map(todo => ({
          title: todo.title,
          priority: todo.priority,
          dueDate: todo.due_date ? new Date(todo.due_date).toLocaleDateString() : null,
          overdue: todo.due_date ? new Date(todo.due_date) < now : false
        }))
      }

      // Prepare optimized context data
      const contextData = {
        stats: statsSummary,
        habits: habitsSummary,
        todos: todosSummary,
        userPreferences: preferences
      }

      // Call Supabase Edge Function instead of OpenAI directly
      const { data: aiResponse, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: content,
          contextData,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
        }
      })

      if (error) {
        throw new Error(error.message || 'Failed to get AI response')
      }

      if (aiResponse.error) {
        throw new Error(aiResponse.error)
      }

      const aiMessage = {
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('AI chat error:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickMessage = (message) => {
    sendMessage(message)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-2xl rounded-2xl card shadow-xl animate-slide-up my-4 max-h-[calc(100vh-2rem)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold theme-text-lg">AI Assistant</h2>
                <p className="text-sm text-muted">Your personal life coach</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Messages */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <p className="text-sm text-muted mb-3">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_MESSAGES.map((message, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickMessage(message)}
                  disabled={isLoading}
                  className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {message}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold theme-text-lg mb-2">Hello! I'm your AI assistant</h3>
                <p className="text-muted">I can help you analyze your data, provide insights, and guide you on your journey. Try asking me about your habits, stats, or productivity!</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 theme-text'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your data..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
