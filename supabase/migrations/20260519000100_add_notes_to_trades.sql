-- Migration: Add notes column to trades table
-- Description: Adds a nullable notes column to support trading journal logs and comments

ALTER TABLE trades ADD COLUMN IF NOT EXISTS notes TEXT;
