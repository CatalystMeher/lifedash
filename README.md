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
5. Run the migrations in your Supabase SQL editor:
   - Copy and run the SQL from `migration_add_amount_type.sql` to add the 'amount' type
   - Copy and run the SQL from `migration_add_user_preferences.sql` to add user preferences
   - Copy and run the SQL from `migration_add_todos.sql` to add the todos table
6. Run the development server: `npm run dev`

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

## License

MIT
