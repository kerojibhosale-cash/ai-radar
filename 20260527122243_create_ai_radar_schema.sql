/*
  # AI Radar - Full Schema

  1. New Tables
    - `profiles` - user profiles linked to auth.users
    - `news_items` - AI news articles with metadata
    - `ai_tools` - AI tools directory with ratings, categories
    - `business_ideas` - AI business opportunity ideas
    - `ai_prompts` - curated daily prompts for various AI platforms
    - `trend_keywords` - trending AI keywords with scores
    - `user_favorites` - user bookmarked tools/prompts/ideas

  2. Security
    - RLS enabled on all tables
    - Profiles: users can read/update their own
    - News/Tools/Prompts/Ideas/Trends: readable by all authenticated users
    - Favorites: users manage their own
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- News items table
CREATE TABLE IF NOT EXISTS news_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  source_name text NOT NULL DEFAULT '',
  source_url text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  published_at timestamptz DEFAULT now(),
  trending_score integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News items are publicly readable"
  ON news_items FOR SELECT
  TO authenticated
  USING (true);

-- AI tools table
CREATE TABLE IF NOT EXISTS ai_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  website_url text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  pricing text NOT NULL DEFAULT 'Free',
  rating numeric(3,1) DEFAULT 0,
  use_cases text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_tool_of_day boolean DEFAULT false,
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI tools are publicly readable"
  ON ai_tools FOR SELECT
  TO authenticated
  USING (true);

-- Business ideas table
CREATE TABLE IF NOT EXISTS business_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  problem text NOT NULL DEFAULT '',
  solution text NOT NULL DEFAULT '',
  target_audience text NOT NULL DEFAULT '',
  monetization text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'Medium',
  opportunity_score integer DEFAULT 0,
  how_to_build text DEFAULT '',
  category text NOT NULL DEFAULT 'SaaS',
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE business_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business ideas are publicly readable"
  ON business_ideas FOR SELECT
  TO authenticated
  USING (true);

-- AI prompts table
CREATE TABLE IF NOT EXISTS ai_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  prompt_text text NOT NULL,
  platform text NOT NULL DEFAULT 'ChatGPT',
  category text NOT NULL DEFAULT 'General',
  use_case text DEFAULT '',
  tags text[] DEFAULT '{}',
  upvotes integer DEFAULT 0,
  is_daily boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prompts are publicly readable"
  ON ai_prompts FOR SELECT
  TO authenticated
  USING (true);

-- Trend keywords table
CREATE TABLE IF NOT EXISTS trend_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  score integer DEFAULT 0,
  change_percent numeric(6,2) DEFAULT 0,
  category text DEFAULT 'General',
  is_viral boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trend_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trends are publicly readable"
  ON trend_keywords FOR SELECT
  TO authenticated
  USING (true);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_trending_score ON news_items(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_tools_category ON ai_tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_rating ON ai_tools(rating DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_platform ON ai_prompts(platform);
CREATE INDEX IF NOT EXISTS idx_trends_score ON trend_keywords(score DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_favorites(user_id);
