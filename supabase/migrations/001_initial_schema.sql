-- Approxense — Initial Schema
-- Run this in Supabase SQL Editor

-- =====================
-- Tables
-- =====================

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(20) NOT NULL CHECK (category IN ('distance','scale','space','time','human')),
  question_text TEXT NOT NULL,
  answer NUMERIC NOT NULL,
  unit VARCHAR(50) NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'tr',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE question_stats (
  question_id UUID PRIMARY KEY REFERENCES questions(id) ON DELETE CASCADE,
  answer_count INTEGER NOT NULL DEFAULT 0,
  answers NUMERIC[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','countdown','playing','finished')),
  max_players INTEGER NOT NULL DEFAULT 10,
  countdown_started_at TIMESTAMPTZ,
  game_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('single','multiplayer')),
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  question_ids UUID[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  player_id VARCHAR(100) NOT NULL,
  guessed_value NUMERIC,
  log_score NUMERIC(5,2),
  percentile_score NUMERIC(5,2),
  w_value NUMERIC(4,3),
  final_score NUMERIC(5,2),
  time_remaining INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id VARCHAR(100) NOT NULL,
  display_name VARCHAR(50),
  is_ready BOOLEAN NOT NULL DEFAULT false,
  is_connected BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, player_id)
);

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  session_id VARCHAR(100),
  room_id UUID,
  question_id UUID,
  category VARCHAR(20),
  guessed_value NUMERIC,
  actual_value NUMERIC,
  log_score NUMERIC(5,2),
  time_remaining INTEGER,
  mode VARCHAR(20),
  player_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- Indexes
-- =====================

CREATE INDEX idx_questions_category_active ON questions(category, active);
CREATE INDEX idx_answers_session_id ON answers(session_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_room_players_room_id ON room_players(room_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type, created_at);

-- =====================
-- Row Level Security
-- =====================

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- questions: public read (active only)
CREATE POLICY "questions_public_read" ON questions
  FOR SELECT USING (active = true);

-- question_stats: public read
CREATE POLICY "question_stats_public_read" ON question_stats
  FOR SELECT USING (true);

-- rooms: public read
CREATE POLICY "rooms_public_read" ON rooms
  FOR SELECT USING (true);

-- game_sessions: public read
CREATE POLICY "game_sessions_public_read" ON game_sessions
  FOR SELECT USING (true);

-- room_players: public read
CREATE POLICY "room_players_public_read" ON room_players
  FOR SELECT USING (true);

-- Note: INSERT/UPDATE/DELETE for all tables is done via service_role key (server-side only)
-- analytics_events: insert only (no read needed from client)
CREATE POLICY "analytics_insert" ON analytics_events
  FOR INSERT WITH CHECK (true);
