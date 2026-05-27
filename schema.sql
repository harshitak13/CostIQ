-- SQL Schema for Cost IQ
-- Copy and run this script in your Supabase SQL Editor to create the required tables

-- 1. Create the 'audits' table to store parsed audit results
CREATE TABLE IF NOT EXISTS audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inputs JSONB NOT NULL,
  team_size INTEGER,
  use_case TEXT,
  recommendations JSONB NOT NULL,
  total_monthly_savings NUMERIC(10, 2) NOT NULL,
  total_annual_savings NUMERIC(10, 2) NOT NULL,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the 'leads' table for user submissions and email campaign targeting
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  company_name TEXT,
  role TEXT,
  team_size INTEGER,
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  total_monthly_savings NUMERIC(10, 2) NOT NULL,
  is_high_value BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) if desired, but since the app queries
-- the DB using the Supabase Service Role Key (which bypasses RLS),
-- these tables will be accessible from the backend server routes.
