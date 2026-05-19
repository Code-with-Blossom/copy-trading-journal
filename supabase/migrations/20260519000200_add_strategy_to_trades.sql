-- Migration: Add strategy column to trades table
-- Description: Adds a nullable strategy tag to support trade categorisation

ALTER TABLE trades ADD COLUMN IF NOT EXISTS strategy TEXT;
