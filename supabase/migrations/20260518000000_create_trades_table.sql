-- Migration: Create trades table with RLS
-- Description: Creates the trades table linked to auth.users and sets up Row Level Security

CREATE TABLE IF NOT EXISTS trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pair TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
    entry NUMERIC NOT NULL,
    exit NUMERIC,
    amount NUMERIC NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Policy: Select
-- Users can only read their own trades
CREATE POLICY "Users can view their own trades" 
ON trades 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy: Insert
-- Users can only insert trades for themselves
CREATE POLICY "Users can insert their own trades" 
ON trades 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy: Update
-- Users can update their own trades (e.g., to set the exit price)
CREATE POLICY "Users can update their own trades" 
ON trades 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Delete
-- Users can delete their own trades
CREATE POLICY "Users can delete their own trades" 
ON trades 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
