# LifeDash

A modern, mobile-first life tracking app built with React and Supabase.

## Features

- **Stats Tracking**: Log numbers, durations, amounts, and text notes
- **Amount Totals**: Automatically sum up amount-type stats with the same unit and display as totals
- **Amount Formatting**: Choose between US (K, M, B) and Indian (K, L, Cr) number formatting
- **Habit Tracking**: Create habits with custom schedules and track daily completion
- **Todo Management**: Apple Reminders-style todo system with drag-and-drop functionality
- **Focus Timer**: Pomodoro-style timer with automatic logging
- **Analytics**: Visualize your data with charts and insights
- **Quick Log**: Fast entry for multiple stats at once
- **AI Assistant**: Personal AI coach with access to your data for insights and guidance
- **Dark Mode**: Automatic theme switching

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp env.example .env.local
   ```
   - Add your Supabase URL and anon key
   - For AI assistant feature, see [AI Chat Setup](#ai-chat-setup) below
4. Set up your Supabase database with the required tables (see Database Schema below)
5. Run the migrations in your Supabase SQL editor:
   - Copy and run the SQL from `migration_add_amount_type.sql` to add the 'amount' type
   - Copy and run the SQL from `migration_add_user_preferences.sql` to add user preferences
   - Copy and run the SQL from `migration_add_todos.sql` to add the todos table
6. Run the development server: `npm run dev`

## Mobile Development

This app is configured with Capacitor for native mobile development on both Android and iOS.

### Android Development

#### Prerequisites

1. Install Android Studio from [https://developer.android.com/studio](https://developer.android.com/studio)
2. Install the Android SDK
3. Set up an Android Virtual Device (AVD) or connect a physical Android device

#### Building for Android

1. Build the web app: `npm run cap:build`
2. Open in Android Studio: `npm run cap:open`
3. Run on device/emulator: `npm run cap:run`

#### Android Commands

- `npm run cap:build` - Build web app and sync with Android
- `npm run cap:sync` - Sync web assets with Android project
- `npm run cap:open` - Open Android project in Android Studio
- `npm run cap:run` - Run app on connected device/emulator

### iOS Development

#### Prerequisites

1. **macOS**: iOS development requires macOS
2. **Xcode**: Install the latest version from the Mac App Store
3. **CocoaPods**: Install via Homebrew: `brew install cocoapods`

#### Building for iOS

1. Build the web app: `npm run cap:build:ios`
2. Open in Xcode: `npm run cap:open:ios`
3. Run on simulator/device: `npm run cap:run:ios`

#### iOS Commands

- `npm run cap:build:ios` - Build web app and sync with iOS
- `npm run cap:sync:ios` - Sync web assets with iOS project
- `npm run cap:open:ios` - Open iOS project in Xcode
- `npm run cap:run:ios` - Run app on simulator/device

### Development Scripts

For convenience, you can use the provided development scripts:

```bash
# Android
./scripts/android-dev.sh build
./scripts/android-dev.sh open
./scripts/android-dev.sh run
./scripts/android-dev.sh full

# iOS
./scripts/build-ios.sh
```

### Development Workflow

1. Make changes to your React app
2. Build and sync: `npm run cap:build` (Android) or `npm run cap:build:ios` (iOS)
3. Test on device/emulator/simulator

For detailed iOS setup instructions, see [IOS_SETUP.md](./IOS_SETUP.md).

## Database Schema

The app uses the following Supabase tables:

### stats
```sql
-- Create the enum type for stat types
CREATE TYPE stat_type AS ENUM ('number', 'duration', 'text', 'amount');

CREATE TABLE stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type stat_type NOT NULL,
  unit TEXT,
  color TEXT,
  goal_value NUMERIC,
  icon TEXT,
  pinned BOOLEAN DEFAULT false,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### entries
```sql
CREATE TABLE entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stat_id UUID REFERENCES stats(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  value NUMERIC,
  note TEXT,
  source TEXT,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stat_id, day)
);
```

### habits
```sql
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### habit_checkins
```sql
CREATE TABLE habit_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  done BOOLEAN DEFAULT false,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, habit_id, day)
);
```

### user_preferences
```sql
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  amount_format VARCHAR(10) DEFAULT 'US' CHECK (amount_format IN ('US', 'IN')),
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### todos
```sql
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  due_date DATE,
  priority INTEGER DEFAULT 0 CHECK (priority IN (0, 1, 2)), -- 0=normal, 1=high, 2=urgent
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)
Enable RLS on all tables and add policies:
```sql
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Example policy for stats table
CREATE POLICY "Users can view own stats" ON stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stats" ON stats
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for user_preferences table
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);
```

## AI Chat Setup

The app includes an AI assistant powered by OpenAI's GPT-4 that can:

- **Analyze your data**: Get insights about your habits, stats, and productivity trends
- **Provide recommendations**: Receive personalized suggestions for improvement
- **Answer questions**: Ask about your progress, goals, and routines
- **Quick interactions**: Use pre-defined quick messages for common queries

### How it works

The AI assistant has access to your:
- Stats and their recent values
- Habits and completion rates
- Todo items and their status
- User preferences and settings

It uses this data to provide personalized insights and recommendations to help you on your life tracking journey.

### Setup

The AI chat feature is now handled by Supabase Edge Functions for better security and performance.

#### Quick Setup (Recommended)

1. Install Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref YOUR_PROJECT_ID`
4. Set your OpenAI API key: `export OPENAI_API_KEY=your-key-here`
5. Run the deployment script: `./scripts/deploy-ai-chat.sh`

#### Manual Setup

For detailed setup instructions, see [SUPABASE_AI_SETUP.md](./SUPABASE_AI_SETUP.md)

### Security Features

- **API Key Protection**: OpenAI API key is stored securely in Supabase
- **User Authentication**: All requests are authenticated
- **Rate Limiting**: 10 requests per minute per user
- **Input Validation**: Message length and content validation
- **Timeout Protection**: 30-second timeout prevents hanging requests

### Privacy

Your data is sent to OpenAI for processing but is not stored by OpenAI. The conversation history is only kept in your browser session and is not persisted.

## License

MIT
