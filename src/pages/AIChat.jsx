import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, Bot, User, Loader2, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '../lib/supabase'
import useUser from '../hooks/useUser'
import { useUserPreferences } from '../hooks/useUserPreferences'

const QUICK_MESSAGES = [
  "How am I doing with my habits?",
  "Analyze my stats",
  "Productivity tips",
  "Goal suggestions",
  "Progress summary"
]

export default function AIChat() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { preferences } = useUserPreferences()
  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage on component mount
    try {
      const saved = localStorage.getItem('lifedash-ai-chat-messages')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.warn('Failed to load chat messages from localStorage:', error)
      return []
    }
  })
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
    enabled: !!user
  })

  const { data: habits = [] } = useQuery({
    queryKey: ['habits-ai'],
    queryFn: async () => {
      const { data, error } = await supabase.from('habits').select('*').eq('user_id', user?.id).order('inserted_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    enabled: !!user
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
    enabled: !!user
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
    enabled: !!user
  })

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('lifedash-ai-chat-messages', JSON.stringify(messages))
    } catch (error) {
      console.warn('Failed to save chat messages to localStorage:', error)
    }
  }, [messages])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when component mounts
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const sendMessage = async (content) => {
    if (!content.trim() || isLoading) return

    const userMessage = { role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Prepare context data for AI
      const contextData = {
        user: {
          id: user.id,
          preferences: preferences
        },
        stats: stats,
        habits: habits,
        recentEntries: recentEntries,
        todos: todos
      }

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



      // Call Supabase Edge Function instead of OpenAI directly
      const { data: aiResponse, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: content,
          contextData: {
            stats: statsSummary,
            habits: habitsSummary,
            todos: todosSummary,
            userPreferences: preferences
          },
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
        }
      })

      if (error) {
        throw new Error(error.message || 'Failed to get AI response')
      }

      if (aiResponse.error) {
        throw new Error(aiResponse.error)
      }

      const assistantMessage = { 
        role: 'assistant', 
        content: aiResponse.response, 
        timestamp: new Date() 
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.', 
        timestamp: new Date() 
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleQuickMessage = (message) => {
    sendMessage(message)
  }

  const clearChat = () => {
    setMessages([])
    setInputValue('')
    // Also clear from localStorage
    try {
      localStorage.removeItem('lifedash-ai-chat-messages')
    } catch (error) {
      console.warn('Failed to clear chat messages from localStorage:', error)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="h-screen theme-bg theme-text font-['Poppins',sans-serif] flex flex-col">
      {/* Header - Fixed */}
      <div 
        className="flex items-center justify-between p-4 border-b theme-border theme-bg flex-shrink-0"
        style={{
          paddingTop: 'calc(0.5rem + var(--safe-area-inset-top))',
          paddingLeft: 'calc(1rem + var(--safe-area-inset-left))',
          paddingRight: 'calc(1rem + var(--safe-area-inset-right))',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 theme-text-secondary hover:theme-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-lg font-semibold theme-text-lg">AI Assistant</h1>
        <button
          onClick={clearChat}
          disabled={messages.length === 0}
          className="flex items-center gap-2 theme-text-secondary hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Clear chat"
        >
          <Trash2 className="w-5 h-5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* Messages Area - Scrollable */}
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
                    ? 'accent-bg accent-text'
                    : 'theme-bg-secondary theme-text'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="text-sm leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-2">{children}</p>,
                        h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-sm font-semibold mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
                        li: ({ children }) => <li>{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        del: ({ children }) => <del className="line-through text-gray-500">{children}</del>,
                        code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                        blockquote: ({ children }) => <blockquote className="border-l-2 border-blue-500 pl-3 py-1 my-2 italic">{children}</blockquote>,
                        table: ({ children }) => <div className="overflow-x-auto my-2"><table className="min-w-full border border-gray-300 dark:border-gray-600">{children}</table></div>,
                        thead: ({ children }) => <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>,
                        tbody: ({ children }) => <tbody>{children}</tbody>,
                        tr: ({ children }) => <tr className="border-b border-gray-300 dark:border-gray-600">{children}</tr>,
                        th: ({ children }) => <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-left font-semibold">{children}</th>,
                        td: ({ children }) => <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">{children}</td>,
                        input: ({ checked, ...props }) => <input type="checkbox" checked={checked} readOnly className="mr-2" {...props} />,
                        a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">{children}</a>,
                        hr: () => <hr className="my-3 border-gray-300 dark:border-gray-600" />
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted mt-1">
                {formatTime(message.timestamp)}
              </p>
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full accent-bg flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 accent-text" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="theme-bg-secondary p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

        {/* Input Area with Quick Messages */}
        <div 
          className="flex-shrink-0 theme-bg border-t theme-border"
          style={{
            paddingBottom: 'var(--safe-area-inset-bottom)',
            paddingLeft: 'var(--safe-area-inset-left)',
            paddingRight: 'var(--safe-area-inset-right)',
          }}
        >
          {/* Quick Messages */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {QUICK_MESSAGES.map((message, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickMessage(message)}
                  disabled={isLoading}
                  className="flex-shrink-0 px-4 py-2 text-sm theme-bg-secondary theme-text-secondary rounded-full hover:theme-bg transition-colors disabled:opacity-50 border theme-border"
                >
                  {message}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your data..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border theme-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2 accent-bg accent-text rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
  
  )
}
