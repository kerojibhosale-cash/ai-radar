'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Zap, Bell, Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import AuthModal from './AuthModal';

interface NavbarProps {
  user: { id: string; email: string } | null;
  onUserChange: (user: { id: string; email: string } | null) => void;
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

export default function Navbar({ user, onUserChange, onMobileMenuToggle, mobileMenuOpen }: NavbarProps) {
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      onUserChange(null);
      setShowUserMenu(false);
    } catch (err) {
      console.error('Sign out failed:', err);
    } finally {
      setSigningOut(false);
    }
  };

  const trendingItems = ['AI Agents +340%', 'Vibe Coding +890%', 'GPT-5 Announced', 'Claude 4 Released'];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 h-14 glass border-b border-white/[0.06]" role="navigation" aria-label="Main navigation">
        <div className="flex items-center justify-between h-full px-4 md:px-6 max-w-[1800px] mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <a href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg p-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                <Zap size={14} className="text-black" fill="black" aria-hidden="true" />
              </div>
              <span className="font-display font-bold text-white text-lg tracking-tight">
                AI <span className="text-cyan-400">Radar</span>
              </span>
            </a>

            <div className="hidden sm:flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-1 ml-2">
              <div className="live-dot w-1.5 h-1.5" aria-hidden="true" />
              <span className="text-green-400 text-xs font-medium">LIVE</span>
            </div>
          </div>

          <div className="hidden md:flex flex-1 mx-6 overflow-hidden" aria-live="polite" aria-label="Trending headlines">
            <div className="flex items-center gap-2 text-xs text-white/40 overflow-hidden max-w-full">
              <span className="text-cyan-400 font-medium whitespace-nowrap">TRENDING:</span>
              <div className="overflow-hidden flex-1">
                <div className="animate-ticker flex gap-8 whitespace-nowrap">
                  {[...trendingItems, ...trendingItems].map((item, i) => (
                    <span key={i} className="text-white/50">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="relative p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Notifications (3 unread)"
            >
              <Bell size={17} aria-hidden="true" />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-cyan-500 rounded-full text-[9px] font-bold text-black flex items-center justify-center">
                3
              </span>
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-black text-xs font-bold" aria-hidden="true">
                    {(user.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-white/80 text-sm max-w-[120px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={13} className="text-white/40" aria-hidden="true" />
                </button>
                {showUserMenu && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 glass-strong rounded-xl border border-white/10 py-2 animate-fade-in shadow-xl"
                    role="menu"
                  >
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-white text-sm font-medium truncate">{user.email}</p>
                      <p className="text-white/40 text-xs">Member</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm focus:outline-none focus:bg-white/10"
                      role="menuitem"
                    >
                      <LogOut size={14} aria-hidden="true" />
                      {signingOut ? 'Signing out...' : 'Sign out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm px-4 py-1.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black"
              >
                <User size={14} aria-hidden="true" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={(u) => { onUserChange(u); setShowAuth(false); }}
        />
      )}
    </>
  );
}
