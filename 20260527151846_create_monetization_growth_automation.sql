/*
  # AI Radar - Monetization, Growth, and AI Automation Schema

  1. New Tables
    - `user_profiles` - Extended user data with subscription, streak, and badge info
    - `subscriptions` - Stripe subscription records
    - `sponsored_tools` - Paid sponsored AI tool placements
    - `affiliate_clicks` - Affiliate link tracking
    - `referrals` - User referral tracking
    - `user_streaks` - Daily login streaks
    - `user_badges` - Earned badges
    - `leaderboard` - User rankings
    - `notifications` - In-app notifications
    - `email_subscribers` - Newsletter subscriptions
    - `daily_digests` - Generated email digests
    - `ai_generated_content` - AI-summaries, predictions, recommendations
    - `ai_recommendations` - Personalized tool recommendations
    - `activity_log` - User activity tracking

  2. Plans
    - Free: Full access to news/tools/prompts, basic features
    - Pro ($19/mo): Advanced trends, premium prompts, no ads, priority features
    - Enterprise ($149/mo): API access, white-label, team features, priority support

  3. Security
    - RLS on all tables
    - User-owned data protection
*/

-- Drop profiles if exists and recreate with extended fields
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  plan text NOT NULL DEFAULT 'free',
  stripe_customer_id text DEFAULT '',
  stripe_subscription_id text DEFAULT '',
  referral_code text UNIQUE DEFAULT '',
  referred_by uuid REFERENCES auth.users(id),
  streak_count integer DEFAULT 0,
  last_visit_date date,
  total_points integer DEFAULT 0,
  api_calls_used integer DEFAULT 0,
  api_calls_limit integer DEFAULT 100,
  notifications_enabled boolean DEFAULT true,
  email_digest_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_customer_id text NOT NULL,
  plan text NOT NULL DEFAULT 'pro',
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Sponsored tools
CREATE TABLE sponsored_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL,
  sponsor_name text NOT NULL,
  sponsor_email text NOT NULL,
  amount_paid numeric(10,2) NOT NULL DEFAULT 0,
  placement_type text NOT NULL DEFAULT 'sidebar',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  clicks integer DEFAULT 0,
  impressions integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sponsored_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View active sponsored tools"
  ON sponsored_tools FOR SELECT TO authenticated
  USING (is_active = true AND end_date > now());

-- Affiliate clicks tracking
CREATE TABLE affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  affiliate_code text DEFAULT '',
  click_source text DEFAULT 'organic',
  ip_address text DEFAULT '',
  user_agent text DEFAULT '',
  converted boolean DEFAULT false,
  conversion_value numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own affiliate clicks"
  ON affiliate_clicks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Referrals
CREATE TABLE referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referee_email text NOT NULL,
  status text DEFAULT 'pending',
  reward_points integer DEFAULT 100,
  reward_claimed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  converted_at timestamptz
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = referrer_id);

-- User streaks (daily check-ins)
CREATE TABLE user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visit_date date NOT NULL,
  points_earned integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, visit_date)
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON user_streaks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON user_streaks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User badges
CREATE TABLE user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  badge_description text DEFAULT '',
  badge_icon text DEFAULT 'trophy',
  earned_at timestamptz DEFAULT now(),
  is_displayed boolean DEFAULT true,
  UNIQUE(user_id, badge_type)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Leaderboard
CREATE TABLE leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points integer DEFAULT 0,
  streak_best integer DEFAULT 0,
  referrals_count integer DEFAULT 0,
  tools_discovered integer DEFAULT 0,
  prompts_shared integer DEFAULT 0,
  rank_position integer DEFAULT 0,
  week_number integer DEFAULT EXTRACT(WEEK FROM now()),
  year_number integer DEFAULT EXTRACT(YEAR FROM now()),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_number, year_number)
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboard is publicly readable"
  ON leaderboard FOR SELECT TO authenticated
  USING (true);

-- Notifications
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  action_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Email subscribers
CREATE TABLE email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_verified boolean DEFAULT false,
  verification_token text DEFAULT '',
  unsubscribed boolean DEFAULT false,
  unsubscribed_at timestamptz,
  preferences jsonb DEFAULT '{"news": true, "tools": true, "prompts": true, "digest": true}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON email_subscribers FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR email = (SELECT email FROM user_profiles WHERE id = auth.uid()));

-- Daily digests (generated content)
CREATE TABLE daily_digests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  digest_date date NOT NULL UNIQUE,
  top_news jsonb DEFAULT '[]',
  top_tools jsonb DEFAULT '[]',
  top_trends jsonb DEFAULT '[]',
  ai_summary text DEFAULT '',
  generated_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  recipients_count integer DEFAULT 0
);

ALTER TABLE daily_digests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily digests are publicly readable"
  ON daily_digests FOR SELECT TO authenticated
  USING (true);

-- AI Generated Content (summaries, predictions, recommendations)
CREATE TABLE ai_generated_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  source_data jsonb DEFAULT '{}',
  relevance_score numeric(5,2) DEFAULT 0,
  is_published boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published AI content is readable"
  ON ai_generated_content FOR SELECT TO authenticated
  USING (is_published = true);

-- AI Recommendations (personalized)
CREATE TABLE ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  score numeric(5,2) DEFAULT 0,
  reason text DEFAULT '',
  is_dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON ai_recommendations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON ai_recommendations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Activity log
CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  item_type text DEFAULT '',
  item_id uuid,
  metadata jsonb DEFAULT '{}',
  points_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON activity_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_referral_code ON user_profiles(referral_code);
CREATE INDEX idx_user_profiles_plan ON user_profiles(plan);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_sponsored_tools_active ON sponsored_tools(is_active, end_date);
CREATE INDEX idx_affiliate_clicks_tool ON affiliate_clicks(tool_id);
CREATE INDEX idx_affiliate_clicks_user ON affiliate_clicks(user_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_user_streaks_user_date ON user_streaks(user_id, visit_date DESC);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank_position);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_activity_log_user ON activity_log(user_id, created_at DESC);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN 'RADAR-' || result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code on user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, referral_code, last_visit_date)
  VALUES (
    NEW.id,
    NEW.email,
    generate_referral_code(),
    CURRENT_DATE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger to update streak
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET 
    streak_count = (
      SELECT COUNT(DISTINCT visit_date) 
      FROM user_streaks 
      WHERE user_id = NEW.user_id 
      AND visit_date >= CURRENT_DATE - INTERVAL '30 days'
    ),
    last_visit_date = CURRENT_DATE,
    total_points = total_points + NEW.points_earned,
    updated_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_streak_update ON user_streaks;
CREATE TRIGGER on_streak_update
  AFTER INSERT ON user_streaks
  FOR EACH ROW EXECUTE FUNCTION update_user_streak();
