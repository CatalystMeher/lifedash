-- Migration: Add calendar_events table for full-featured calendar system
-- Run this in your Supabase SQL editor

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT false,
  color VARCHAR(7) DEFAULT '#3b82f6', -- Hex color code
  location TEXT,
  url TEXT,
  reminder_minutes INTEGER DEFAULT 15, -- Minutes before event to remind
  repeat_type VARCHAR(20) DEFAULT 'none', -- none, daily, weekly, monthly, yearly
  repeat_until DATE,
  todo_id UUID REFERENCES todos(id) ON DELETE SET NULL, -- Link to todo if created from todo
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view own calendar events" ON calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar events" ON calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events" ON calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events" ON calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_calendar_events_updated_at 
    BEFORE UPDATE ON calendar_events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_start_time ON calendar_events(user_id, start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date_range ON calendar_events(user_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_todo_id ON calendar_events(todo_id);

-- Add check constraint for valid time range
ALTER TABLE calendar_events ADD CONSTRAINT check_valid_time_range 
  CHECK (end_time > start_time);

-- Add check constraint for valid color format
ALTER TABLE calendar_events ADD CONSTRAINT check_valid_color 
  CHECK (color ~ '^#[0-9A-Fa-f]{6}$');
