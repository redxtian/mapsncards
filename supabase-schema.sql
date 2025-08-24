-- Cards table schema for Supabase
-- Run this in your Supabase SQL Editor

-- Create cards table matching the CardItem type structure
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  summary TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'L1',
  leverage TEXT NOT NULL CHECK (leverage IN ('Informational', 'Relational', 'Resource', 'Urgency', 'Narrative', 'Authority')),
  intent TEXT NOT NULL CHECK (intent IN ('Extract', 'Increase')),
  modes JSONB NOT NULL DEFAULT '{"direct": [], "inception": []}',
  steps JSONB NOT NULL DEFAULT '[]',
  recovery TEXT NOT NULL,
  map_adaptations JSONB DEFAULT '[]',
  telemetry_keys JSONB DEFAULT '[]',
  version TEXT DEFAULT '2.0.0',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'beta', 'stable', 'deprecated')),
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cards_leverage ON cards(leverage);
CREATE INDEX IF NOT EXISTS idx_cards_intent ON cards(intent);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at);

-- Enable Row Level Security (RLS) - for future user-specific access
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on cards" ON cards
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cards_updated_at 
    BEFORE UPDATE ON cards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a sample card to test the setup (optional)
INSERT INTO cards (
  id,
  name,
  summary,
  tier,
  leverage,
  intent,
  modes,
  steps,
  recovery,
  map_adaptations,
  telemetry_keys,
  version,
  status,
  author
) VALUES (
  'sample_card_test',
  'Test Card',
  'This is a sample card to verify the database setup is working',
  'L1',
  'Informational',
  'Extract',
  '{"direct": ["This is a direct approach"], "inception": ["This is an inception approach"]}',
  '["Step 1: First action", "Step 2: Second action", "Step 3: Final action"]',
  'If this approach fails, try a different angle',
  '[{"map": "Adversarial", "tip": "Use neutral language"}]',
  '["test_key", "sample_data"]',
  '2.0.0',
  'beta',
  'system'
) ON CONFLICT (id) DO NOTHING;