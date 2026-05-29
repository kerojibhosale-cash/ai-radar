'use client';

import {
  Newspaper, Wrench, Lightbulb, TrendingUp, Search,
  MessageSquare, LayoutDashboard, Zap, Star, Bot,
  Briefcase, CreditCard, Award, Crown
} from 'lucide-react';
import { memo } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'news', label: 'Live AI News', icon: Newspaper, badge: 'NEW' },
  { id: 'tools', label: 'Free AI Tools', icon: Wrench },
  { id: 'ideas', label: 'Business Ideas', icon: Lightbulb },
  { id: 'trends', label: 'Trend Analyzer', icon: TrendingUp },
  { id: 'search', label: 'Tool Search', icon: Search },
  { id: 'prompts', label: 'Daily Prompts', icon: MessageSquare },
] as const;

const EXTRAS = [
  { id: 'hustles', label: 'AI Side Hustles', icon: Briefcase },
  { id: 'automation', label: 'AI Automation', icon: Bot },
  { id: 'tool-of-day', label: 'Tool of the Day', icon: Star },
] as const;

const PREMIUM = [
  { id: 'pricing', label: 'Upgrade to Pro', icon: Crown, highlight: true },
  { id: 'badges', label: 'Your Badges', icon: Award },
] as const;

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  mobileOpen: boolean;
}

const Sidebar = function Sidebar({ activeSection, onSectionChange, mobileOpen }: SidebarProps) {
  const NavItem = memo(function NavItem({
    item,
    isActive,
    onClick,
    variant = 'primary',
    highlight = false,
  }: {
    item: typeof NAV_ITEMS[number] | typeof EXTRAS[number] | typeof PREMIUM[number];
    isActive: boolean;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    highlight?: boolean;
  }) {
    const Icon = item.icon;
    return (
      <button
        onClick={onClick}
        className={`
          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
          transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-inset
          ${highlight && !isActive
            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
            : isActive
            ? variant === 'secondary'
              ? 'bg-teal-500/10 text-teal-400'
              : 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500'
            : 'text-white/50 hover:text-white/80 hover:bg-white/5'
          }
        `}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon size={16} className={isActive ? (variant === 'secondary' ? 'text-teal-400' : highlight ? 'text-cyan-400' : 'text-cyan-400') : 'text-white/40 group-hover:text-white/60'} aria-hidden="true" />
        <span className="flex-1 text-left">{item.label}</span>
        {'badge' in item && item.badge && (
          <span className="text-[9px] font-bold bg-cyan-500 text-black px-1.5 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </button>
    );
  });

  return (
    <>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30 top-14" onClick={() => onSectionChange(activeSection)} aria-hidden="true" />
      )}

      <aside
        className={`
          fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-56 z-30
          bg-[hsl(220,20%,6%)] border-r border-white/[0.06]
          transition-transform duration-300 flex flex-col
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Sidebar navigation"
      >
        <nav className="flex-1 overflow-y-auto py-4 no-scrollbar" aria-label="Primary">
          <div className="px-3 mb-6">
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest mb-2 px-2" id="nav-primary-label">
              Intelligence
            </p>
            <div className="space-y-0.5" role="group" aria-labelledby="nav-primary-label">
              {NAV_ITEMS.map(item => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={activeSection === item.id}
                  onClick={() => onSectionChange(item.id)}
                />
              ))}
            </div>
          </div>

          <div className="px-3 mb-6">
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest mb-2 px-2" id="nav-secondary-label">
              Explore
            </p>
            <div className="space-y-0.5" role="group" aria-labelledby="nav-secondary-label">
              {EXTRAS.map(item => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={activeSection === item.id}
                  onClick={() => onSectionChange(item.id)}
                  variant="secondary"
                />
              ))}
            </div>
          </div>

          <div className="px-3 mt-auto">
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest mb-2 px-2">
              Account
            </p>
            <div className="space-y-0.5">
              {PREMIUM.map(item => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={activeSection === item.id}
                  onClick={() => onSectionChange(item.id)}
                  highlight={'highlight' in item ? item.highlight : false}
                />
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/[0.06]">
          <div className="glass rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Zap size={12} className="text-cyan-400" aria-hidden="true" />
              <span className="text-white/60 text-[11px] font-medium">AI Powered</span>
            </div>
            <p className="text-white/30 text-[10px]">Auto-updates hourly</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
