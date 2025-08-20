# AI Assistant Feature

## Overview

The AI Assistant is a personal coach feature that provides insights and guidance based on your LifeDash data. It uses OpenAI's GPT-3.5-turbo model to analyze your habits, stats, and productivity patterns.

## Features

### Quick Messages
Pre-defined questions that users can quickly select:
- "How am I doing with my habits this week?"
- "What's my focus time trend?"
- "Give me tips to improve my productivity"
- "Analyze my stats and suggest improvements"
- "Help me set better goals"
- "What should I focus on today?"
- "How can I build better routines?"
- "Show me my progress summary"

### Data Access
The AI has access to:
- **Stats**: All tracking metrics with their types, units, and recent values
- **Habits**: Habit names, descriptions, schedules, and completion data
- **Todos**: Task titles, descriptions, completion status, and priorities
- **User Preferences**: Amount formatting preferences and other settings
- **Recent Entries**: Last 30 days of data entries for context

### System Message
The AI is configured with a comprehensive system message that:
- Defines its role as a personal assistant for LifeDash
- Provides context about the user's data structure
- Sets guidelines for being concise, helpful, and actionable
- Encourages personalized insights based on actual user data

## Implementation Details

### Components

1. **AIChatButton** (`src/components/AIChatButton.jsx`)
   - Floating button positioned above the FAB
   - Purple-to-blue gradient design
   - Opens the AI chat modal

2. **AIChatModal** (`src/components/AIChatModal.jsx`)
   - Full-featured chat interface
   - Quick message buttons
   - Real-time message display
   - Loading states and error handling

### API Integration

- Uses Supabase Edge Functions for secure API calls
- OpenAI API key is stored securely on the backend
- Sends user data as context in system message
- Maintains conversation history for context
- Handles errors gracefully with user-friendly messages
- Includes rate limiting and authentication

### Data Fetching

- Uses React Query for efficient data fetching
- Only fetches data when modal is open
- Includes stats, habits, entries, and todos
- Limits recent entries to prevent token overflow

## Setup Requirements

1. **Supabase Edge Function**: AI chat is handled by Supabase Edge Functions
   - See [SUPABASE_AI_SETUP.md](./SUPABASE_AI_SETUP.md) for setup instructions
   - OpenAI API key is stored securely in Supabase

2. **Environment Variables**: No OpenAI API key needed in frontend

## Privacy & Security

- Data is sent to OpenAI for processing but not stored
- Conversation history is session-only (not persisted)
- No sensitive data is logged or stored
- API key is stored securely in Supabase Edge Functions
- All requests are authenticated and rate-limited

## Usage

1. Click the AI Assistant button (purple gradient) above the FAB
2. Use quick messages or type custom questions
3. Get personalized insights about your data
4. Receive actionable recommendations

## Future Enhancements

- Add conversation persistence
- Implement data visualization in responses
- Add voice input/output capabilities
- Create custom AI personas for different use cases
- Enhanced analytics and insights

## Troubleshooting

### Common Issues

1. **"Failed to get AI response"**
   - Check Supabase Edge Function deployment
   - Verify OpenAI API key is set in Supabase secrets
   - Check network connectivity

2. **No data in responses**
   - Ensure user has created stats/habits/todos
   - Check Supabase connection
   - Verify user authentication

3. **Modal not opening**
   - Check browser console for errors
   - Verify component imports
   - Ensure user is authenticated

4. **Rate limit exceeded**
   - Wait 1 minute before trying again
   - Limit is 10 requests per minute per user
