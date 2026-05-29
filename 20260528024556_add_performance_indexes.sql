/*
  # Performance Optimization - Database Indexes

  1. New Indexes
    - Composite indexes for common query patterns
    - Partial indexes for filtered queries
    - GIN indexes for JSONB columns

  2. Notes
    - Run ANALYZE after migration
*/

-- Create indexes for activity_log (most queried table)
CREATE INDEX IF NOT EXISTS idx_activity_log_user_action_date 
  ON activity_log(user_id, action_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_log_action_timestamp 
  ON activity_log(action_type, created_at DESC);

-- Optimize news queries
CREATE INDEX IF NOT EXISTS idx_news_items_trending_featured 
  ON news_items(trending_score DESC, is_featured);

CREATE INDEX IF NOT EXISTS idx_news_items_category_score 
  ON news_items(category, trending_score DESC);

CREATE INDEX IF NOT EXISTS idx_news_items_published 
  ON news_items(published_at DESC);

-- Optimize tools queries
CREATE INDEX IF NOT EXISTS idx_ai_tools_category_upvotes 
  ON ai_tools(category, upvotes DESC);

CREATE INDEX IF NOT EXISTS idx_ai_tools_rating 
  ON ai_tools(rating DESC);

CREATE INDEX IF NOT EXISTS idx_ai_tools_tofday 
  ON ai_tools(is_tool_of_day DESC, upvotes DESC);

-- Optimize trend queries
CREATE INDEX IF NOT EXISTS idx_trend_keywords_score_viral 
  ON trend_keywords(score DESC, is_viral);

CREATE INDEX IF NOT EXISTS idx_trend_keywords_category 
  ON trend_keywords(category, score DESC);

-- Optimize business ideas queries
CREATE INDEX IF NOT EXISTS idx_business_ideas_score_featured 
  ON business_ideas(opportunity_score DESC, is_featured);

CREATE INDEX IF NOT EXISTS idx_business_ideas_difficulty 
  ON business_ideas(difficulty, opportunity_score DESC);

-- Optimize prompts queries
CREATE INDEX IF NOT EXISTS idx_ai_prompts_platform_daily 
  ON ai_prompts(platform, is_daily, upvotes DESC);

CREATE INDEX IF NOT EXISTS idx_ai_prompts_category 
  ON ai_prompts(category, created_at DESC);

-- Optimize user favorites queries
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_item 
  ON user_favorites(user_id, item_type, item_id);

CREATE INDEX IF NOT EXISTS idx_user_favorites_item 
  ON user_favorites(item_id, item_type);

-- Optimize notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_type_read 
  ON notifications(user_id, type, is_read, created_at DESC);

-- Optimize leaderboard queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_week_year 
  ON leaderboard(year_number, week_number, rank_position);

-- Optimize user profile queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_streak 
  ON user_profiles(streak_count DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_plan 
  ON user_profiles(plan, created_at DESC);

-- Optimize affiliate clicks
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_tool_created 
  ON affiliate_clicks(tool_id, created_at DESC);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_ai_tools_tags_gin 
  ON ai_tools USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_ai_tools_use_cases_gin 
  ON ai_tools USING GIN (use_cases);

CREATE INDEX IF NOT EXISTS idx_news_items_tags_gin 
  ON news_items USING GIN (tags);

-- Optimize AI generated content
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_type_published 
  ON ai_generated_content(content_type, created_at DESC);

-- Analyze tables after index creation
ANALYZE activity_log;
ANALYZE news_items;
ANALYZE ai_tools;
ANALYZE trend_keywords;
ANALYZE business_ideas;
ANALYZE ai_prompts;
ANALYZE user_favorites;
ANALYZE notifications;
ANALYZE leaderboard;
ANALYZE user_profiles;
ANALYZE affiliate_clicks;
ANALYZE ai_generated_content;
