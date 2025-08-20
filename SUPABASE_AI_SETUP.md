# Supabase AI Chat Setup Guide

This guide will help you set up the AI chat feature using Supabase Edge Functions instead of direct OpenAI API calls from the frontend.

## Prerequisites

1. Supabase CLI installed: `npm install -g supabase`
2. Supabase project created
3. OpenAI API key

## Setup Steps

### 1. Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link your project

```bash
supabase link --project-ref YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID.

### 4. Set Environment Variables in Supabase

```bash
# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=your-openai-api-key-here

# Set Supabase service role key (for authentication)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Note**: You can find your service role key in your Supabase project dashboard under Settings > API.

### 5. Deploy the Edge Function

```bash
supabase functions deploy ai-chat
```

### 6. Update Environment Variables

Remove the `VITE_OPENAI_API_KEY` from your `.env.local` file since it's no longer needed in the frontend.

Your `.env.local` should now only contain:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Testing the Function

You can test the Edge Function locally:

```bash
supabase functions serve ai-chat --env-file .env.local
```

Then test with curl:

```bash
curl -X POST http://localhost:54321/functions/v1/ai-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how can you help me?",
    "contextData": {
      "stats": [],
      "habits": [],
      "recentEntries": [],
      "todos": [],
      "userPreferences": {}
    },
    "conversationHistory": []
  }'
```

## Security Benefits

By moving the AI chat to Supabase Edge Functions:

1. **API Key Security**: Your OpenAI API key is no longer exposed in the frontend
2. **User Authentication**: All requests are authenticated using Supabase auth tokens
3. **Rate Limiting**: Built-in rate limiting (10 requests per minute per user)
4. **Input Validation**: Message length and content validation
5. **Cost Control**: Better monitoring and control of API usage
6. **Timeout Protection**: 30-second timeout prevents hanging requests
7. **Error Handling**: Comprehensive error handling with user-friendly messages

## Troubleshooting

### Function Not Found
Make sure you've deployed the function:
```bash
supabase functions deploy ai-chat
```

### API Key Issues
Verify your OpenAI API key is set:
```bash
supabase secrets list
```

### CORS Issues
The function includes CORS headers, but if you're still having issues, check your Supabase project settings.

### Function Errors
Check the function logs:
```bash
supabase functions logs ai-chat
```

## Next Steps

Consider implementing:

1. **Rate Limiting**: Add rate limiting to prevent abuse
2. **User Authentication**: Verify user identity in the function
3. **Response Caching**: Cache common responses to reduce API calls
4. **Usage Tracking**: Track API usage for billing/monitoring
5. **Error Handling**: More sophisticated error handling and retry logic
