'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { type UserBadge as BadgeType, recordDailyVisit, getUserBadges, getUnreadCount, getNotifications, type Notification } from '@/lib/growth';
import { BADGES } from '@/lib/growth';
import { Trophy, Flame, Star, Gift, Users, Bell, Check, Crown, Zap, Calendar, Target, Sparkles, X, ExternalLink } from 'lucide-react';

interface GrowthWidgetProps {
  userId: string;
}

const iconMap: Record<string, any> = {
  trophy: Trophy,
  flame: Flame,
  fire: Flame,
  crown: Crown,
  star: Star,
  gift: Gift,
  users: Users,
  rocket: Zap,
  search: Target,
  wrench: Target,
  'message-square': Sparkles,
  sparkles: Sparkles,
  zap: Zap,
  gem: Star,
  'badge-check': Check,
};

export function GrowthWidget({ userId }: GrowthWidgetProps) {
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [newDayBonus, setNewDayBonus] = useState<{ streak: number; points: number } | null>(null);

  useEffect(() => {
    const init = async () => {
      // Record daily visit
      const visitResult = await recordDailyVisit(userId);
      if (visitResult.isNewDay) {
        setNewDayBonus({ streak: visitResult.streak, points: visitResult.pointsEarned });
        setTimeout(() => setNewDayBonus(null), 5000);
      }

      // Get profile data
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('streak_count, total_points')
        .eq('id', userId)
        .single();

      setStreak(profile?.streak_count || 0);
      setPoints(profile?.total_points || 0);

      // Get notification count
      const count = await getUnreadCount(userId);
      setNotificationCount(count);
    };
    init();
  }, [userId]);

  return (
    <div className="glass rounded-xl p-4 space-y-4">
      {/* Streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={18} className={streak > 0 ? 'text-amber-400' : 'text-white/30'} />
          <span className="text-white/70 text-sm">Streak</span>
        </div>
        <span className="text-white font-bold text-lg">{streak} days</span>
      </div>

      {/* Points */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-cyan-400" />
          <span className="text-white/70 text-sm">Points</span>
        </div>
        <span className="text-white font-bold text-lg">{points.toLocaleString()}</span>
      </div>

      {/* Notifications */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-white/50" />
          <span className="text-white/70 text-sm">Notifications</span>
        </div>
        <span className={`${notificationCount > 0 ? 'text-cyan-400' : 'text-white/30'} font-bold text-lg`}>
          {notificationCount}
        </span>
      </div>

      {/* New Day Bonus Popup */}
      {newDayBonus && (
        <div className="fixed bottom-4 right-4 z-50 glass-strong rounded-xl p-4 animate-slide-up max-w-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Flame size={20} className="text-amber-400" />
            </div>
            <div>
              <p className="text-white font-medium">Daily Bonus!</p>
              <p className="text-white/60 text-sm">+{newDayBonus.points} points • {newDayBonus.streak} day streak</p>
            </div>
            <button onClick={() => setNewDayBonus(null)} className="text-white/30 hover:text-white/60">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BadgeDisplay({ badge }: { badge: BadgeType }) {
  const Icon = iconMap[badge.badge_icon] || Trophy;
  return (
    <div className="flex items-center gap-3 glass rounded-xl p-3">
      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
        <Icon size={20} className="text-amber-400" />
      </div>
      <div>
        <p className="text-white font-medium text-sm">{badge.badge_name}</p>
        <p className="text-white/40 text-xs">{badge.badge_description}</p>
      </div>
    </div>
  );
}

export function BadgeList({ userId }: { userId: string }) {
  const [badges, setBadges] = useState<BadgeType[]>([]);

  useEffect(() => {
    getUserBadges(userId).then(setBadges);
  }, [userId]);

  if (badges.length === 0) {
    return (
      <div className="text-center py-8 text-white/40">
        <Trophy size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No badges earned yet</p>
        <p className="text-xs mt-1">Visit daily and share to earn badges!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {badges.map(badge => (
        <BadgeDisplay key={badge.id} badge={badge} />
      ))}
    </div>
  );
}

export function NotificationCenter({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getNotifications(userId).then(setNotifications);
  }, [userId]);

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  };

  const unread = notifications.filter(n => !n.is_read);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <Bell size={18} className="text-white/60" />
        {unread.length > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-cyan-500 text-black rounded-full flex items-center justify-center">
            {unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-xl border border-white/10 shadow-xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <h3 className="text-white font-medium text-sm">Notifications</h3>
            {unread.length > 0 && (
              <button onClick={markAllRead} className="text-xs text-cyan-400 hover:text-cyan-300">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-white/40 text-sm">No notifications</div>
            ) : (
              notifications.slice(0, 10).map(n => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`p-3 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${!n.is_read ? 'bg-cyan-500/5' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{n.title}</p>
                      <p className="text-white/50 text-xs mt-0.5">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ShareButtonProps {
  userId: string;
  itemType: 'news' | 'tool' | 'prompt' | 'idea';
  itemId: string;
  title: string;
}

export function ShareButton({ userId, itemType, itemId, title }: ShareButtonProps) {
  const [shared, setShared] = useState(false);

  const handleShare = async (platform: 'twitter' | 'linkedin' | 'copy') => {
    const url = `https://ai-radar.app/${itemType}/${itemId}`;
    const text = `Check out this ${itemType}: ${title} via AI Radar`;

    if (platform === 'copy') {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } else {
      const encodedText = encodeURIComponent(text);
      const encodedUrl = encodeURIComponent(url);
      const shareUrl = platform === 'twitter'
        ? `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        : `https://linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    }

    // Track share and award points
    await supabase.from('activity_log').insert({
      user_id: userId,
      action_type: 'share',
      item_type: itemType,
      item_id: itemId,
      metadata: { platform },
      points_earned: 5,
    });
  };

  return (
    <div className="relative group">
      <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors">
        <Gift size={16} />
      </button>
      <div className="absolute right-0 top-full mt-1 w-32 glass rounded-lg p-1 hidden group-hover:block z-10">
        <button
          onClick={() => handleShare('twitter')}
          className="w-full text-left px-3 py-1.5 text-xs text-white/70 hover:bg-white/5 rounded"
        >
          Twitter
        </button>
        <button
          onClick={() => handleShare('linkedin')}
          className="w-full text-left px-3 py-1.5 text-xs text-white/70 hover:bg-white/5 rounded"
        >
          LinkedIn
        </button>
        <button
          onClick={() => handleShare('copy')}
          className="w-full text-left px-3 py-1.5 text-xs text-white/70 hover:bg-white/5 rounded"
        >
          {shared ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}

export function ReferralWidget({ userId, referralCode }: { userId: string; referralCode: string }) {
  const [copied, setCopied] = useState(false);

  const referralUrl = `https://ai-radar.app?ref=${referralCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Gift size={18} className="text-cyan-400" />
        <h3 className="text-white font-medium">Invite Friends</h3>
      </div>
      <p className="text-white/50 text-sm mb-3">
        Earn 100 points for each friend who signs up!
      </p>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={referralUrl}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/70 text-xs"
        />
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-medium rounded-lg transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="text-white/30 text-xs mt-2">Your code: {referralCode}</p>
    </div>
  );
}

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const { supabase } = await import('@/lib/supabase');
    await supabase.from('email_subscribers').upsert({ email, is_verified: true });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center glass rounded-xl p-4">
        <Check size={24} className="mx-auto mb-2 text-green-400" />
        <p className="text-white/80 text-sm">You're subscribed!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-xl p-4">
      <h3 className="text-white font-medium mb-2">Daily AI Digest</h3>
      <p className="text-white/50 text-xs mb-3">Get the top AI news delivered to your inbox</p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-medium rounded-lg transition-colors"
        >
          Subscribe
        </button>
      </div>
    </form>
  );
}
