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
      // Prepare context data for AI
      const contextData = {
        stats: stats.map(stat => ({
          id: stat.id,
          name: stat.name,
          type: stat.type,
          unit: stat.unit,
          color: stat.color,
          icon: stat.icon
        })),
        habits: habits.map(habit => ({
          id: habit.id,
          name: habit.name,
          description: habit.description,
          days_of_week: habit.days_of_week,
          color: habit.color,
          icon: habit.icon
        })),
        recentEntries: recentEntries.slice(0, 50), // Limit to recent entries
        todos: todos.map(todo => ({
          id: todo.id,
          title: todo.title,
          description: todo.description,
          completed: todo.completed,
          priority: todo.priority,
          due_date: todo.due_date
        })),
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
