-- ============================================
-- SUPABASE SETUP - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. INFLUENCERS TABLE (Main data)
CREATE TABLE influencers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  image_url TEXT,
  summary TEXT,
  social_handles JSONB,
  niche TEXT,
  trust_score FLOAT DEFAULT 50.0,
  drama_count INT DEFAULT 0,
  good_action_count INT DEFAULT 0,
  neutral_count INT DEFAULT 0,
  avg_sentiment FLOAT DEFAULT 0.0,
  language TEXT DEFAULT 'fr',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_influencers_trust_score ON influencers(trust_score DESC);
CREATE INDEX idx_influencers_name ON influencers(name);
CREATE INDEX idx_influencers_niche ON influencers(niche);

-- 2. MENTIONS TABLE (AI analysis data)
CREATE TABLE mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  source_url TEXT,
  text_excerpt TEXT NOT NULL,
  sentiment_score FLOAT,
  label TEXT, -- drama, good_action, neutral
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mentions_influencer ON mentions(influencer_id);
CREATE INDEX idx_mentions_label ON mentions(label);

-- 3. COMMUNITY SIGNALS (User ratings/reports)
CREATE TABLE community_signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- RATING, DRAMA_REPORT, POSITIVE_ACTION, COMMENT
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  tags JSONB,
  is_verified BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, influencer_id, type)
);

CREATE INDEX idx_community_signals_influencer ON community_signals(influencer_id);
CREATE INDEX idx_community_signals_user ON community_signals(user_id);
CREATE INDEX idx_community_signals_type ON community_signals(type);

-- 4. COMMUNITY TRUST SCORES (Aggregated)
CREATE TABLE community_trust_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID UNIQUE REFERENCES influencers(id) ON DELETE CASCADE,
  avg_rating FLOAT DEFAULT 0.0,
  total_ratings INT DEFAULT 0,
  total_drama_reports INT DEFAULT 0,
  total_positive_reports INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  community_score FLOAT DEFAULT 50.0,
  combined_score FLOAT DEFAULT 50.0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_community_trust_scores_combined ON community_trust_scores(combined_score DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_trust_scores ENABLE ROW LEVEL SECURITY;

-- Influencers: Public read
CREATE POLICY "Anyone can view influencers"
  ON influencers FOR SELECT
  USING (true);

-- Mentions: Public read
CREATE POLICY "Anyone can view mentions"
  ON mentions FOR SELECT
  USING (true);

-- Community Signals: Public read, authenticated write
CREATE POLICY "Anyone can view signals"
  ON community_signals FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create signals"
  ON community_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signals"
  ON community_signals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own signals"
  ON community_signals FOR DELETE
  USING (auth.uid() = user_id);

-- Community Trust Scores: Public read
CREATE POLICY "Anyone can view community scores"
  ON community_trust_scores FOR SELECT
  USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update community trust score
CREATE OR REPLACE FUNCTION update_community_trust_score(p_influencer_id UUID)
RETURNS void AS $$
DECLARE
  v_avg_rating FLOAT;
  v_total_ratings INT;
  v_total_drama INT;
  v_total_positive INT;
  v_total_comments INT;
  v_community_score FLOAT;
  v_ai_score FLOAT;
  v_combined_score FLOAT;
BEGIN
  -- Get ratings
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*) FILTER (WHERE type = 'RATING'),
    COUNT(*) FILTER (WHERE type = 'DRAMA_REPORT'),
    COUNT(*) FILTER (WHERE type = 'POSITIVE_ACTION'),
    COUNT(*) FILTER (WHERE type = 'COMMENT')
  INTO v_avg_rating, v_total_ratings, v_total_drama, v_total_positive, v_total_comments
  FROM community_signals
  WHERE influencer_id = p_influencer_id AND is_hidden = false;
  
  -- Calculate community score (0-100)
  v_community_score := 50 + ((v_avg_rating - 2.5) * 8) - (v_total_drama * 2) + (v_total_positive * 3);
  v_community_score := GREATEST(0, LEAST(100, v_community_score));
  
  -- Get AI score
  SELECT trust_score INTO v_ai_score FROM influencers WHERE id = p_influencer_id;
  
  -- Calculate combined score (60% AI + 40% Community)
  v_combined_score := (v_ai_score * 0.6) + (v_community_score * 0.4);
  
  -- Upsert community trust score
  INSERT INTO community_trust_scores (
    influencer_id, avg_rating, total_ratings, total_drama_reports,
    total_positive_reports, total_comments, community_score, combined_score
  ) VALUES (
    p_influencer_id, v_avg_rating, v_total_ratings, v_total_drama,
    v_total_positive, v_total_comments, v_community_score, v_combined_score
  )
  ON CONFLICT (influencer_id) DO UPDATE SET
    avg_rating = v_avg_rating,
    total_ratings = v_total_ratings,
    total_drama_reports = v_total_drama,
    total_positive_reports = v_total_positive,
    total_comments = v_total_comments,
    community_score = v_community_score,
    combined_score = v_combined_score,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update community score when signal is added/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_community_score()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_community_trust_score(OLD.influencer_id);
    RETURN OLD;
  ELSE
    PERFORM update_community_trust_score(NEW.influencer_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER community_signal_changed
  AFTER INSERT OR UPDATE OR DELETE ON community_signals
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_community_score();

-- ============================================
-- ENABLE ANONYMOUS AUTH
-- ============================================
-- Go to Authentication > Providers in Supabase Dashboard
-- Enable "Anonymous Sign-In"

-- ============================================
-- DONE!
-- ============================================
-- Your database is ready!
-- Next: Run the data migration script
