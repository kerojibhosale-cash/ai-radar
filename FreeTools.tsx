'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, type AITool } from '@/lib/supabase';
import { FALLBACK_DATA } from '@/lib/api';
import { Star, ExternalLink, Bookmark, ThumbsUp, Zap, Crown, AlertTriangle } from 'lucide-react';

const TOOL_CATEGORIES = ['All', 'Coding', 'Image Generation', 'Video Generation', 'Audio', 'Search', 'Assistant', 'Content', 'Productivity', 'Automation'];
const PRICING_COLORS: Record<string, string> = {
  'Free': 'badge-green', 'Free/Pro': 'badge-teal', 'Free/Add-on': 'badge-teal',
  'Free/Cloud': 'badge-teal', 'Paid': 'badge-amber', 'Waitlist': 'badge-red', 'ChatGPT Plus': 'badge-amber',
};

interface FreeToolsProps {
  favorites: string[];
  onFavorite: (id: string, type: string) => void;
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="status" aria-label="Loading tools">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="glass rounded-xl p-4 animate-pulse">
          <div className="h-5 bg-white/10 rounded w-1/2 mb-3" />
          <div className="h-3 bg-white/5 rounded w-full mb-2" />
          <div className="h-3 bg-white/5 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star key={i} size={11} className={i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-white/15'} aria-hidden="true" />
  ));
};

export default function FreeTools({ favorites, onFavorite }: FreeToolsProps) {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const { data, error: dbError } = await supabase.from('ai_tools').select('*').order('upvotes', { ascending: false });
        if (dbError) throw dbError;
        setTools(data && data.length > 0 ? data : FALLBACK_DATA.tools as AITool[]);
      } catch (err) {
        console.error('Tools fetch failed:', err);
        setTools(FALLBACK_DATA.tools as AITool[]);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  const filtered = useMemo(() =>
    activeCategory === 'All' ? tools : tools.filter(t => t.category === activeCategory),
    [tools, activeCategory]
  );

  const toolOfDay = useMemo(() => {
    const found = tools.find(t => t.is_tool_of_day);
    return found || (tools.length > 0 ? tools[0] : null);
  }, [tools]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-display font-bold text-white">Free AI Tools</h2>
        <p className="text-white/40 text-sm mt-0.5">Best AI tools — updated daily</p>
      </header>

      {toolOfDay && (
        <article className="glass rounded-2xl p-5 gradient-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Crown size={14} className="text-amber-400" aria-hidden="true" />
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Tool of the Day</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h3 className="text-white font-display font-bold text-lg">{toolOfDay.name}</h3>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PRICING_COLORS[toolOfDay.pricing] || 'badge-cyan'}`}>
                    {toolOfDay.pricing}
                  </span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-3">{toolOfDay.description}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-0.5" aria-label={`Rating: ${toolOfDay.rating} out of 5`}>{renderStars(toolOfDay.rating)}</div>
                  <span className="text-amber-400 text-sm font-bold">{toolOfDay.rating.toFixed(1)}</span>
                  <span className="text-white/30 text-xs">•</span>
                  <span className="flex items-center gap-1 text-white/40 text-xs">
                    <ThumbsUp size={12} className="text-green-400" aria-hidden="true" />
                    {toolOfDay.upvotes.toLocaleString()} upvotes
                  </span>
                </div>
              </div>
              <a
                href={toolOfDay.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                Try it <ExternalLink size={12} aria-hidden="true" />
              </a>
            </div>
          </div>
        </article>
      )}

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Filter by tool category">
        {TOOL_CATEGORIES.map(cat => (
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
        {filtered.map(tool => (
          <article
            key={tool.id}
            role="listitem"
            className={`glass rounded-xl p-4 card-hover group flex flex-col gap-3 focus-within:ring-2 focus-within:ring-cyan-500 ${tool.is_featured ? 'gradient-border' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-white font-semibold text-sm">{tool.name}</h3>
                  {tool.is_featured && <Zap size={11} className="text-cyan-400" fill="currentColor" aria-hidden="true" />}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{tool.category}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PRICING_COLORS[tool.pricing] || 'badge-cyan'}`}>
                    {tool.pricing}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onFavorite(tool.id, 'tool')}
                aria-label={favorites.includes(tool.id) ? 'Remove from favorites' : 'Add to favorites'}
                aria-pressed={favorites.includes(tool.id)}
                className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                  favorites.includes(tool.id) ? 'text-amber-400 bg-amber-400/10' : 'text-white/20 hover:text-white/50 hover:bg-white/5'
                }`}
              >
                <Bookmark size={13} fill={favorites.includes(tool.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            <p className="text-white/50 text-xs leading-relaxed flex-1 line-clamp-3">{tool.description}</p>

            {tool.use_cases?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {tool.use_cases.slice(0, 2).map(uc => (
                  <span key={uc} className="text-[10px] text-cyan-400/70 bg-cyan-400/8 px-2 py-0.5 rounded-full border border-cyan-400/15">
                    {uc}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5" aria-label={`Rating: ${tool.rating} out of 5`}>{renderStars(tool.rating)}</div>
                <span className="text-amber-400 text-xs font-semibold">{tool.rating.toFixed(1)}</span>
                <span className="text-white/25 text-xs">•</span>
                <span className="flex items-center gap-1 text-white/30 text-xs">
                  <ThumbsUp size={10} aria-hidden="true" />
                  {(tool.upvotes / 1000).toFixed(1)}k
                </span>
              </div>
              <a
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors focus:outline-none focus:underline"
              >
                Visit <ExternalLink size={11} aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-white/30 glass rounded-2xl">
          <AlertTriangle size={32} className="mx-auto mb-3 opacity-50" aria-hidden="true" />
          <p>No tools in this category yet</p>
        </div>
      )}
    </div>
  );
}
