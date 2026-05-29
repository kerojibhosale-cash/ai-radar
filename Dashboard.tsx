'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { FALLBACK_DATA } from '@/lib/api';
import type { NewsItem, AITool, TrendKeyword, BusinessIdea } from '@/lib/supabase';
import { TrendingUp, Newspaper, Wrench, Lightbulb, Crown, Flame, Zap, ExternalLink, ArrowRight, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <div className="glass rounded-2xl p-5 animate-pulse h-32" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="glass rounded-xl p-4 animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass rounded-2xl p-5 animate-pulse h-64" />
        <div className="glass rounded-2xl p-5 animate-pulse h-64" />
      </div>
    </div>
  );
}

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={11} className={i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-white/15'} />
  ));
};

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [tools, setTools] = useState<AITool[]>([]);
  const [trends, setTrends] = useState<TrendKeyword[]>([]);
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [newsRes, toolsRes, trendsRes, ideasRes] = await Promise.all([
          supabase.from('news_items').select('*').order('trending_score', { ascending: false }).limit(5),
          supabase.from('ai_tools').select('*').order('upvotes', { ascending: false }).limit(4),
          supabase.from('trend_keywords').select('*').order('score', { ascending: false }).limit(8),
          supabase.from('business_ideas').select('*').order('opportunity_score', { ascending: false }).limit(3),
        ]);
        setNews(newsRes.data?.length ? newsRes.data : FALLBACK_DATA.news as NewsItem[]);
        setTools(toolsRes.data?.length ? toolsRes.data : FALLBACK_DATA.tools as AITool[]);
        setTrends(trendsRes.data?.length ? trendsRes.data : FALLBACK_DATA.trends as TrendKeyword[]);
        setIdeas(ideasRes.data?.length ? ideasRes.data : FALLBACK_DATA.ideas as BusinessIdea[]);
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
        setNews(FALLBACK_DATA.news as NewsItem[]);
        setTools(FALLBACK_DATA.tools as AITool[]);
        setTrends(FALLBACK_DATA.trends as TrendKeyword[]);
        setIdeas(FALLBACK_DATA.ideas as BusinessIdea[]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const stats = useMemo(() => [
    { label: 'AI News Today', value: news.length, sub: '+12 since yesterday', icon: Newspaper, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Free Tools', value: tools.length, sub: 'Updated daily', icon: Wrench, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { label: 'Trending Topics', value: trends.length, sub: `${trends.filter(t => t.is_viral).length} viral`, icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Business Ideas', value: ideas.length, sub: 'Fresh today', icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ], [news.length, tools.length, trends, ideas.length]);

  const toolOfDay = useMemo(() => tools.find(t => t.is_tool_of_day) || tools[0] || null, [tools]);
  const avgIdeaScore = useMemo(() => ideas.length > 0 ? Math.round(ideas.reduce((a, b) => a + b.opportunity_score, 0) / ideas.length) : 0, [ideas]);
  const viralTrends = useMemo(() => trends.filter(t => t.is_viral), [trends]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <article className="glass rounded-2xl p-5 relative overflow-hidden gradient-border">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5 pointer-events-none" aria-hidden="true" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="live-dot w-2 h-2" aria-label="Live indicator" />
              <span className="text-green-400 text-xs font-medium">Monitoring AI in real time</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-1">AI Intelligence Dashboard</h1>
            <p className="text-white/50 text-sm max-w-lg">Track the latest AI news, tools, trends, and business opportunities. Everything AI — in one place, updated hourly.</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-white/30 text-xs mb-1">Trend Index</p>
            <div className="flex items-center gap-2 justify-end">
              <TrendingUp size={16} className="text-green-400" aria-hidden="true" />
              <span className="text-2xl font-display font-bold text-white">98.4</span>
            </div>
            <p className="text-green-400 text-xs">+12.3% this week</p>
          </div>
        </div>
      </article>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" role="list" aria-label="Dashboard statistics">
        {stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <article key={label} role="listitem" className="glass rounded-xl p-4 card-hover">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`} aria-hidden="true">
                <Icon size={16} className={color} />
              </div>
            </div>
            <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
            <p className="text-white/70 text-xs font-medium mt-0.5">{label}</p>
            <p className="text-white/30 text-[10px] mt-1">{sub}</p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 glass rounded-2xl p-5" aria-labelledby="news-heading">
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Newspaper size={15} className="text-cyan-400" aria-hidden="true" />
              <h2 id="news-heading" className="text-white font-display font-semibold text-sm">Latest AI News</h2>
            </div>
            <button onClick={() => onNavigate('news')} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded">
              View all <ArrowRight size={12} aria-hidden="true" />
            </button>
          </header>
          <div className="space-y-3" role="list">
            {news.slice(0, 5).map((item, idx) => (
              <a
                key={item.id}
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                role="listitem"
                className="flex items-start gap-3 group hover:bg-white/[0.03] rounded-xl p-2 -m-2 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <span className="text-white/25 text-xs w-4 mt-0.5 shrink-0">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium group-hover:text-cyan-400 transition-colors line-clamp-1">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-white/30 text-[10px]">{item.source_name}</span>
                    <span className="text-white/15 text-[10px]">•</span>
                    <span className="flex items-center gap-1 text-[10px]">
                      <TrendingUp size={9} className="text-amber-400" aria-hidden="true" />
                      <span className="text-amber-400/70">{item.trending_score}</span>
                    </span>
                    <span className="text-white/15 text-[10px]">•</span>
                    <time dateTime={item.published_at} className="text-white/25 text-[10px]">
                      {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                    </time>
                  </div>
                </div>
                <ExternalLink size={12} className="text-white/15 group-hover:text-cyan-400/50 shrink-0 mt-1" aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          {toolOfDay && (
            <article className="glass rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" aria-hidden="true" />
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-3">
                  <Crown size={13} className="text-amber-400" aria-hidden="true" />
                  <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">Tool of the Day</span>
                </div>
                <h3 className="text-white font-display font-bold text-base mb-1">{toolOfDay.name}</h3>
                <p className="text-white/50 text-xs leading-relaxed line-clamp-3 mb-3">{toolOfDay.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1" aria-label={`Rating: ${toolOfDay.rating} out of 5`}>{renderStars(toolOfDay.rating)}</div>
                  <a
                    href={toolOfDay.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors focus:outline-none focus:underline"
                  >
                    Try it <ExternalLink size={11} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>
          )}

          <section className="glass rounded-2xl p-4" aria-labelledby="trends-heading">
            <header className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame size={13} className="text-teal-400" aria-hidden="true" />
                <h2 id="trends-heading" className="text-white/70 text-xs font-semibold">Hot Keywords</h2>
              </div>
              <button onClick={() => onNavigate('trends')} className="text-[10px] text-teal-400 hover:text-teal-300 flex items-center gap-0.5 transition-colors focus:outline-none focus:ring-1 focus:ring-teal-500 rounded">
                View <ArrowRight size={10} aria-hidden="true" />
              </button>
            </header>
            <div className="space-y-2">
              {trends.slice(0, 6).map(t => (
                <div key={t.id} className="flex items-center gap-2">
                  {t.is_viral && <Flame size={11} className="text-red-400 shrink-0" aria-label="Viral" />}
                  <span className="text-white/70 text-xs flex-1 truncate">{t.keyword}</span>
                  <span className="text-green-400 text-[10px] font-semibold shrink-0">+{t.change_percent.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'Top Business Ideas', desc: 'AI opportunities with highest scores', icon: Lightbulb, color: 'text-amber-400', bg: 'from-amber-500/10', section: 'ideas', data: ideas.slice(0, 2).map(i => i.title) },
          { title: 'Hot Free Tools', desc: 'Best free AI tools right now', icon: Wrench, color: 'text-teal-400', bg: 'from-teal-500/10', section: 'tools', data: tools.slice(0, 3).map(t => t.name) },
          { title: 'AI Opportunities', desc: 'Fastest growing niches today', icon: Zap, color: 'text-cyan-400', bg: 'from-cyan-500/10', section: 'trends', data: viralTrends.slice(0, 3).map(t => t.keyword) },
        ].map(card => (
          <article key={card.title} className={`glass rounded-2xl p-4 relative overflow-hidden card-hover`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} to-transparent pointer-events-none`} aria-hidden="true" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <card.icon size={14} className={card.color} aria-hidden="true" />
                <h3 className="text-white font-semibold text-sm">{card.title}</h3>
              </div>
              <p className="text-white/40 text-xs mb-3">{card.desc}</p>
              <div className="space-y-1.5 mb-3">
                {card.data.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-white/20 text-[10px] w-3">{i + 1}.</span>
                    <span className="text-white/60 text-xs truncate">{item}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => onNavigate(card.section)} className={`text-xs ${card.color} hover:opacity-80 flex items-center gap-1 transition-opacity focus:outline-none focus:ring-1 focus:ring-current rounded`}>
                Explore all <ArrowRight size={11} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
