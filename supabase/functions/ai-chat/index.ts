import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limiting: 10 requests per minute per user
const rateLimit = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimit.get(userId)
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(userId, { count: 1, resetTime: now + 60000 }) // 1 minute
    return true
  }
  
  if (userLimit.count >= 10) {
    return false
  }
  
  userLimit.count++
  return true
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check rate limit
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again in a minute.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the request body
    const { message, contextData, conversationHistory } = await req.json()

    // Validate required fields
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate message length
    if (message.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Message too long. Maximum 1000 characters.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured')
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare system message with context
    const systemMessage = `You are a personal assistant for a life tracking app called LifeDash. You have access to the user's data including:

- Stats: ${contextData?.stats?.length || 0} tracking metrics (${contextData?.stats?.map(s => s.name).join(', ') || 'none'})
- Habits: ${contextData?.habits?.length || 0} habits (${contextData?.habits?.map(h => h.name).join(', ') || 'none'})
- Recent entries: ${contextData?.recentEntries?.length || 0} data points
- Todos: ${contextData?.todos?.length || 0} tasks
- User preferences: ${JSON.stringify(contextData?.userPreferences || {})}

Your role is to:
1. Help users understand their data and progress
2. Provide insights and recommendations
3. Suggest improvements and goal-setting strategies
4. Answer questions about their habits, stats, and productivity
5. Be encouraging and supportive

Always be concise, helpful, and actionable. Use the user's data to provide personalized insights.`

    // Prepare messages array with conversation history
    const messages = [
      { role: 'system', content: systemMessage },
      ...(conversationHistory || []).slice(-10).map(m => ({ role: m.role, content: m.content })), // Limit history to last 10 messages
      { role: 'user', content: message }
    ]

    // Call OpenAI API with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages,
          max_tokens: 500,
          temperature: 0.2
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('OpenAI API error:', errorData)
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'AI service is busy. Please try again in a moment.' }),
            { 
              status: 503, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        return new Response(
          JSON.stringify({ error: 'AI service temporarily unavailable' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const data = await response.json()
      const aiResponse = data.choices[0].message.content

      // Log usage for monitoring (optional)
      console.log(`AI chat usage for user ${user.id}:`, {
        tokens: data.usage,
        timestamp: new Date().toISOString()
      })

      return new Response(
        JSON.stringify({ 
          response: aiResponse,
          usage: data.usage 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Request timeout. Please try again.' }),
          { 
            status: 408, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      throw fetchError
    }

  } catch (error) {
    console.error('AI chat function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
