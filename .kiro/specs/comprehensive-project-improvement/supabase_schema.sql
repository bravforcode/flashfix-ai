-- Supabase Schema for FlashFix AI

-- AI Cache Table
CREATE TABLE IF NOT EXISTS ai_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  prompt_hash TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ttl INTEGER NOT NULL DEFAULT 86400 -- 24 hours in seconds
);

-- Learning History Table
CREATE TABLE IF NOT EXISTS learning_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  topic TEXT
);

-- Mastery Scores Table
CREATE TABLE IF NOT EXISTS mastery_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  topic_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activity_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, topic_id)
);

-- Token Usage Table (Req 13.2)
CREATE TABLE IF NOT EXISTS token_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastery_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for read (AI Cache)
CREATE POLICY "Allow public read ai_cache" ON ai_cache FOR SELECT USING (true);
CREATE POLICY "Allow public insert ai_cache" ON ai_cache FOR INSERT WITH CHECK (true);

-- User-specific policies
CREATE POLICY "Allow individual read learning_history" ON learning_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow individual insert learning_history" ON learning_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individual read mastery_scores" ON mastery_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow individual upsert mastery_scores" ON mastery_scores FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individual read token_usage" ON token_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow individual insert token_usage" ON token_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
