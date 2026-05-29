'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toggleFavorite, fetchUserFavorites } from '@/lib/api';
import { getUserPlan, type Plan } from '@/lib/monetization';
import { recordDailyVisit, type UserProfile } from '@/lib/growth';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import NewsFeed from '@/components/NewsFeed';
import FreeTools from '@/components/FreeTools';
import BusinessIdeas from '@/components/BusinessIdeas';
import TrendAnalyzer from '@/components/TrendAnalyzer';
import ToolSearch from '@/components/ToolSearch';
import DailyPrompts from '@/components/DailyPrompts';
import SideHustles from '@/components/SideHustles';
import AutomationTemplates from '@/components/AutomationTemplates';
import PricingPage from '@/components/PricingPage';
import { GrowthWidget, BadgeList, NotificationCenter, ReferralWidget, NewsletterSignup } from '@/components/GrowthWidgets';

interface UserSession {
  id: string;
  email: string;
}

export default function Home() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan>('free');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
      } else {
        setUser(null);
        setUserProfile(null);
        setFavorites(new Set());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user data
  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      // Get profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) setUserProfile(profile);

      // Get plan
      const plan = await getUserPlan(user.id);
      setCurrentPlan(plan);

      // Get favorites
      const favs = await fetchUserFavorites(user.id);
      setFavorites(new Set(favs));

      // Record daily visit
      await recordDailyVisit(user.id);
    };

    loadUserData();
  }, [user]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFavorite = useCallback(async (itemId: string, itemType: string) => {
    if (!user || favoriteLoading === itemId) return;

    setFavoriteLoading(itemId);
    const isFav = favorites.has(itemId);

    try {
      const newState = await toggleFavorite(user.id, itemId, itemType, isFav);
      setFavorites(prev => {
        const next = new Set(prev);
        if (newState) next.add(itemId);
        else next.delete(itemId);
        return next;
      });
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    } finally {
      setFavoriteLoading(null);
    }
  }, [user, favorites, favoriteLoading]);

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePlanSelect = useCallback(async (plan: Plan) => {
    if (!user) return;
    setSubscriptionLoading(true);
    // In production, this would redirect to Stripe checkout
    // For now, just update the plan
    try {
      await supabase.from('user_profiles').update({ plan }).eq('id', user.id);
      setCurrentPlan(plan);
      handleSectionChange('dashboard');
    } finally {
      setSubscriptionLoading(false);
    }
  }, [user, handleSectionChange]);

  const sectionProps = useMemo(() => ({
    favorites: Array.from(favorites),
    onFavorite: handleFavorite,
  }), [favorites, handleFavorite]);

  const renderSection = useMemo(() => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onNavigate={handleSectionChange} />;
      case 'news':
        return <NewsFeed {...sectionProps} />;
      case 'tools':
      case 'tool-of-day':
        return <FreeTools {...sectionProps} />;
      case 'ideas':
        return <BusinessIdeas {...sectionProps} />;
      case 'trends':
        return <TrendAnalyzer />;
      case 'search':
        return <ToolSearch />;
      case 'prompts':
        return <DailyPrompts {...sectionProps} />;
      case 'hustles':
        return <SideHustles />;
      case 'automation':
        return <AutomationTemplates />;
      case 'pricing':
        return <PricingPage currentPlan={currentPlan} onSelectPlan={handlePlanSelect} loading={subscriptionLoading} />;
      case 'badges':
        return user ? <BadgeList userId={user.id} /> : null;
      default:
        return <Dashboard onNavigate={handleSectionChange} />;
    }
  }, [activeSection, sectionProps, handleSectionChange, currentPlan, handlePlanSelect, subscriptionLoading, user]);

  const navItems = [
    { id: 'dashboard' }, { id: 'news' }, { id: 'tools' }, { id: 'ideas' }, { id: 'trends' }, { id: 'search' }, { id: 'prompts' }, { id: 'hustles' }, { id: 'automation' }, { id: 'pricing' }, { id: 'badges' }
  ];

  return (
    <div className="min-h-screen grid-bg">
      <Navbar
        user={user}
        onUserChange={setUser}
        onMobileMenuToggle={() => setMobileMenuOpen(prev => !prev)}
        mobileMenuOpen={mobileMenuOpen}
      />

      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        mobileOpen={mobileMenuOpen}
      />

      <main id="main-content" className="lg:ml-56 pt-14 min-h-screen" role="main">
        <div className="flex">
          {/* Main content */}
          <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-slide-up">
            {renderSection}
          </div>

          {/* Right sidebar - growth widgets for logged in users */}
          {user && userProfile && activeSection !== 'pricing' && (
            <aside className="hidden xl:block w-72 shrink-0 pr-6 py-6 space-y-4" aria-label="User progress">
              <GrowthWidget userId={user.id} />

              {userProfile.referral_code && (
                <ReferralWidget userId={user.id} referralCode={userProfile.referral_code} />
              )}

              <NewsletterSignup />

              {/* Pro upsell for free users */}
              {currentPlan === 'free' && (
                <div className="glass rounded-xl p-4 border border-cyan-500/20 bg-cyan-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-cyan-400 text-sm font-bold">PRO</span>
                  </div>
                  <p className="text-white/60 text-xs mb-3">Unlock premium features, advanced trends, and no ads.</p>
                  <button
                    onClick={() => handleSectionChange('pricing')}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-medium py-2 rounded-lg transition-colors"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              )}
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
