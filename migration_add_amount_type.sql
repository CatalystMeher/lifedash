-- Migration: Add 'amount' type to stats table
-- Run this in your Supabase SQL editor

-- First, let's check what type of constraint is currently used
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'stats'::regclass AND contype = 'c';

-- If it's using an enum type, we need to alter the enum
-- Add 'amount' to the stat_type enum
ALTER TYPE stat_type ADD VALUE IF NOT EXISTS 'amount';

-- Verify the change
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'stat_type'::regtype ORDER BY enumsortorder;
