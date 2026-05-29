'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, type NewsItem } from '@/lib/supabase';
import { FALLBACK_DATA } from '@/lib/api';
import { ExternalLink, TrendingUp, Clock, Bookmark, Filter, RefreshCw, Flame, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const SOURCE_COLORS: Record<string, string> = {
  'OpenAI': 'badge-teal', 'Google AI': 'badge-cyan', 'Anthropic': 'badge-amber',
  'HuggingFace': 'badge-green', 'GitHub': 'badge-cyan', 'Reddit': 'badge-red',
  'Product Hunt': 'badge-amber', 'YouTube': 'badge-red', 'TechCrunch': 'badge-cyan',
  'Mistral AI': 'badge-teal', 'EU Commission': 'badge-green', 'Hacker News': 'badge-teal',
};

const CATEGORIES = ['All', 'Models', 'Open Source', 'Startups', 'Industry', 'Products', 'Policy', 'Community', 'Market'];

interface NewsFeedProps {
  favorites: string[];
  onFavorite: (id: string, type: string) => void;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading news" role="status">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="glass rounded-2xl p-5 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
          <div className="h-3 bg-white/5 rounded w-full mb-2" />
          <div className="h-3 bg-white/5 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-16 glass rounded-2xl">
      <AlertTriangle size={40} className="mx-auto mb-4 text-amber-400" />
      <p className="text-white/70 text-lg font-medium mb-2">Failed to load news</p>
      <p className="text-white/40 text-sm mb-4">Using cached data - check your connection</p>
      <button
        onClick={onRetry}
        className="bg-cyan-500 hover:bg-cyan-400 text-black font-medium px-4 py-2 rounded-xl transition-all"
      >
        Try Again
      </button>
    </div>
  );
}

export default function NewsFeed({ favorites, onFavorite }: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'trending' | 'latest'>('trending');

  const fetchNews = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    setError(false);

    try {
      const { data, error: dbError } = await supabase
        .from('news_items')
        .select('*')
        .order(sortBy === 'trending' ? 'trending_score' : 'published_at', { ascending: false })
        .limit(20);

      if (dbError) throw dbError;

      setNews(data && data.length > 0 ? data : FALLBACK_DATA.news as NewsItem[]);
    } catch (err) {
      console.error('News fetch failed:', err);
      setNews(FALLBACK_DATA.news as NewsItem[]);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sortBy]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const filtered = useMemo(() =>
    activeCategory === 'All' ? news : news.filter(n => n.category === activeCategory),
    [news, activeCategory]
  );

  const featured = useMemo(() => filtered.find(n => n.is_featured), [filtered]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Models': 'badge-cyan', 'Open Source': 'badge-teal', 'Startups': 'badge-green',
      'Industry': 'badge-amber', 'Products': 'badge-cyan', 'Policy': 'badge-red',
      'Community': 'badge-amber', 'Market': 'badge-teal', 'General': 'badge-cyan',
    };
    return colors[category] || 'badge-cyan';
  };

  if (loading) return <LoadingSkeleton />;
  if (error && news.length === 0) return <ErrorState onRetry={() => fetchNews()} />;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-white">Live AI News</h2>
          <p className="text-white/40 text-sm mt-0.5">Updated hourly from top AI sources</p>
        </div>
        <button
          onClick={() => fetchNews(true)}
          disabled={refreshing}
          aria-label="Refresh news feed"
          className={`flex items-center gap-2 text-sm text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 transition-all ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} aria-hidden="true" />
          <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </header>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 flex-1" role="tablist" aria-label="Filter by category">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                activeCategory === cat ? 'bg-cyan-500 text-black' : 'bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0" role="group" aria-label="Sort options">
          <button
            onClick={() => setSortBy('trending')}
            aria-label="Sort by trending score"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sortBy === 'trending' ? 'bg-amber-500/20 text-amber-400' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Flame size={12} aria-hidden="true" />
            Trending
          </button>
          <button
            onClick={() => setSortBy('latest')}
            aria-label="Sort by latest"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sortBy === 'latest' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <Clock size={12} aria-hidden="true" />
            Latest
          </button>
        </div>
      </div>

      {featured && (
        <article className="glass rounded-2xl p-5 gradient-border group hover:border-cyan-500/30 hover:shadow-[0_8px_32px_rgba(6,182,212,0.15)] transition-all">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-wide">
                  Featured
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getCategoryColor(featured.category)}`}>
                  {featured.category}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${SOURCE_COLORS[featured.source_name] || 'badge-cyan'}`}>
                  {featured.source_name}
                </span>
              </div>
              <h3 className="text-white font-semibold text-base group-hover:text-cyan-400 transition-colors leading-snug mb-2">
                <a
                  href={featured.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
                >
                  {featured.title}
                </a>
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">{featured.summary}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-white/30 flex-wrap">
                <span className="flex items-center gap-1">
                  <TrendingUp size={11} className="text-amber-400" aria-hidden="true" />
                  <span className="text-amber-400 font-semibold">{featured.trending_score}</span> score
                </span>
                <time dateTime={featured.published_at} className="flex items-center gap-1">
                  <Clock size={11} aria-hidden="true" />
                  {formatDistanceToNow(new Date(featured.published_at), { addSuffix: true })}
                </time>
              </div>
            </div>
            <a
              href={featured.source_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Read full article"
              className="p-2 rounded-lg text-white/20 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 shrink-0"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </article>
      )}

      <div className="space-y-3" role="list" aria-label="News articles">
        {filtered.filter(n => !n.is_featured || activeCategory !== 'All').map((item, idx) => (
          <article
            key={item.id}
            role="listitem"
            className="glass rounded-xl p-4 card-hover flex items-start gap-4 group"
          >
            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30 text-sm font-bold" aria-hidden="true">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${SOURCE_COLORS[item.source_name] || 'badge-cyan'}`}>
                  {item.source_name}
                </span>
              </div>
              <h3 className="text-white/90 font-medium text-sm leading-snug mb-1">
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
                >
                  {item.title}
                </a>
              </h3>
              <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{item.summary}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-white/25 flex-wrap">
                <span className="flex items-center gap-1">
                  <TrendingUp size={10} aria-hidden="true" />
                  <span className={item.trending_score >= 80 ? 'text-amber-400' : item.trending_score >= 60 ? 'text-cyan-400' : 'text-white/40'}>
                    {item.trending_score}
                  </span>
                </span>
                <time dateTime={item.published_at} className="flex items-center gap-1">
                  <Clock size={10} aria-hidden="true" />
                  {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                </time>
                {item.tags?.slice(0, 2).map(tag => (
                  <span key={tag} className="text-white/25">#{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onFavorite(item.id, 'news')}
                aria-label={favorites.includes(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                aria-pressed={favorites.includes(item.id)}
                className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                  favorites.includes(item.id)
                    ? 'text-amber-400 bg-amber-400/10'
                    : 'text-white/20 hover:text-white/50 hover:bg-white/5'
                }`}
              >
                <Bookmark size={13} fill={favorites.includes(item.id) ? 'currentColor' : 'none'} />
              </button>
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open article"
                className="p-1.5 rounded-lg text-white/20 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <ExternalLink size={13} />
              </a>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-white/30 glass rounded-2xl">
          <Filter size={32} className="mx-auto mb-3 opacity-50" aria-hidden="true" />
          <p>No news in this category yet</p>
        </div>
      )}
    </div>
  );
}
