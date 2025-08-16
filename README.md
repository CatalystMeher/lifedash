# LifeDash

A modern, mobile-first life tracking app built with React and Supabase.

## Features

- **Stats Tracking**: Log numbers, durations, booleans, and text notes
- **Habit Tracking**: Create habits with custom schedules and track daily completion
- **Focus Timer**: Pomodoro-style timer with automatic logging
- **Analytics**: Visualize your data with charts and insights
- **Quick Log**: Fast entry for multiple stats at once
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
3. Copy `env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp env.example .env.local
   ```
4. Set up your Supabase database with the required tables (see Database Schema below)
5. Run the development server: `npm run dev`

## Database Schema

The app uses the following Supabase tables:

### stats
```sql
CREATE TABLE stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('number', 'duration', 'text')),
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

### Row Level Security (RLS)
Enable RLS on all tables and add policies:
```sql
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_checkins ENABLE ROW LEVEL SECURITY;

-- Example policy for stats table
CREATE POLICY "Users can view own stats" ON stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stats" ON stats
  FOR DELETE USING (auth.uid() = user_id);
```

## License

MIT
