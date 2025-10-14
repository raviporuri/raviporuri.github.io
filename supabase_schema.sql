-- Gated Chat System Schema for Ravi Poruri Website
-- Execute this script in your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- visitors: one per unique person
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  purpose TEXT NOT NULL,
  email TEXT,
  company TEXT,
  location TEXT,
  timezone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- chat_sessions: one per gated conversation
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  session_metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- messages: full transcript with rich metadata
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system','developer')),
  content TEXT NOT NULL,
  model TEXT,
  token_count INTEGER,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_visitors_role_created ON visitors(role, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_purpose ON visitors USING GIN (to_tsvector('english', purpose));
CREATE INDEX IF NOT EXISTS idx_chat_sessions_visitor ON chat_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, created_at);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON visitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Enable if you want to add authentication later
-- ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- For now, create a policy that allows all operations (since this is for your personal site)
-- You can make this more restrictive later if needed
-- CREATE POLICY "Allow all operations" ON visitors FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON chat_sessions FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON messages FOR ALL USING (true);

-- View for analytics: visitor summary with session counts
CREATE OR REPLACE VIEW visitor_analytics AS
SELECT
  v.id,
  v.name,
  v.role,
  v.purpose,
  v.company,
  v.created_at as first_visit,
  COUNT(cs.id) as session_count,
  COUNT(m.id) as total_messages,
  MAX(cs.updated_at) as last_activity,
  CASE
    WHEN v.role IN ('recruiter', 'executive_recruiter') THEN 'high'
    WHEN v.role IN ('hiring_manager', 'company_executive') THEN 'medium'
    ELSE 'low'
  END as priority_level
FROM visitors v
LEFT JOIN chat_sessions cs ON v.id = cs.visitor_id
LEFT JOIN messages m ON cs.id = m.session_id AND m.role = 'user'
GROUP BY v.id, v.name, v.role, v.purpose, v.company, v.created_at;

-- View for session details with conversation summary
CREATE OR REPLACE VIEW session_details AS
SELECT
  cs.id as session_id,
  v.name as visitor_name,
  v.role as visitor_role,
  v.purpose as visitor_purpose,
  cs.source,
  cs.status,
  cs.created_at as session_start,
  cs.updated_at as last_activity,
  COUNT(CASE WHEN m.role = 'user' THEN 1 END) as user_messages,
  COUNT(CASE WHEN m.role = 'assistant' THEN 1 END) as ai_responses,
  STRING_AGG(
    CASE WHEN m.role = 'user'
    THEN SUBSTRING(m.content, 1, 100) || '...'
    END,
    ' | '
    ORDER BY m.created_at
  ) as conversation_preview
FROM chat_sessions cs
JOIN visitors v ON cs.visitor_id = v.id
LEFT JOIN messages m ON cs.id = m.session_id
GROUP BY cs.id, v.name, v.role, v.purpose, cs.source, cs.status, cs.created_at, cs.updated_at;

-- Insert sample data for testing (optional)
-- INSERT INTO visitors (name, role, purpose) VALUES
-- ('Sarah Johnson', 'executive_recruiter', 'Evaluating for CTO role at Series B startup'),
-- ('Mike Chen', 'hiring_manager', 'Principal Data Engineer position'),
-- ('Lisa Rodriguez', 'company_executive', 'Exploring AI advisory opportunities');