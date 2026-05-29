'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, type AITool } from '@/lib/supabase';
import { FALLBACK_DATA } from '@/lib/api';
import { Search, Filter, X, ExternalLink, Star, SlidersHorizontal } from 'lucide-react';

const FILTER_OPTIONS = [
  { key: 'free', label: 'Free', filter: (t: AITool) => t.pricing.toLowerCase().includes('free') },
  { key: 'no-code', label: 'No-Code', filter: (t: AITool) => t.tags.some(tag => tag.toLowerCase().includes('no-code') || tag.toLowerCase().includes('no code')) },
  { key: 'api', label: 'API', filter: (t: AITool) => t.tags.some(tag => tag.toLowerCase().includes('api')) },
  { key: 'automation', label: 'Automation', filter: (t: AITool) => t.category === 'Automation' || t.tags.some(t => t.toLowerCase().includes('automation')) },
  { key: 'content', label: 'Content', filter: (t: AITool) => t.category === 'Content' },
  { key: 'coding', label: 'Coding', filter: (t: AITool) => t.category === 'Coding' },
  { key: 'business', label: 'Business', filter: (t: AITool) => t.tags.some(t => t.toLowerCase().includes('enterprise') || t.toLowerCase().includes('business')) },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading tools">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="glass rounded-xl p-4 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
          <div className="h-3 bg-white/5 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default function ToolSearch() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const { data, error: dbError } = await supabase.from('ai_tools').select('*').order('rating', { ascending: false });
        if (dbError) throw dbError;
        setTools(data && data.length > 0 ? data : FALLBACK_DATA.tools as AITool[]);
      } catch (err) {
        console.error('Tool search fetch failed:', err);
        setTools(FALLBACK_DATA.tools as AITool[]);
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  const toggleFilter = useCallback((key: string) => {
    setActiveFilters(prev => prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]);
  }, []);

  const filtered = useMemo(() => tools.filter(tool => {
    const matchesQuery = !query || tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.description.toLowerCase().includes(query.toLowerCase()) ||
      tool.category.toLowerCase().includes(query.toLowerCase()) ||
      tool.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
    const matchesFilters = activeFilters.length === 0 || activeFilters.every(key => {
      const filterOpt = FILTER_OPTIONS.find(f => f.key === key);
      return filterOpt ? filterOpt.filter(tool) : true;
    });
    return matchesQuery && matchesFilters;
  }), [tools, query, activeFilters]);

  const clearAll = () => { setQuery(''); setActiveFilters([]); };

  const renderStars = useCallback((rating: number) => (
    <div className="flex items-center gap-0.5" role="img" aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={10} className={i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-white/15'} />
      ))}
    </div>
  ), []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-display font-bold text-white">AI Tool Search</h2>
        <p className="text-white/40 text-sm mt-0.5">Find the perfect AI tool instantly</p>
      </header>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search any AI tool, category, or use case..."
          aria-label="Search AI tools"
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30 transition-colors text-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded px-2 py-1"
          >
            <SlidersHorizontal size={14} aria-hidden="true" />
            Filters
            {activeFilters.length > 0 && (
              <span className="bg-cyan-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>
          {activeFilters.length > 0 && (
            <button onClick={clearAll} className="text-xs text-white/30 hover:text-white/60 transition-colors focus:outline-none focus:underline">
              Clear all
            </button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 animate-fade-in" role="group" aria-label="Filter options">
            {FILTER_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                aria-pressed={activeFilters.includes(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  activeFilters.includes(key)
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10'
                }`}
              >
                <Filter size={11} aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-white/30 text-xs" role="status">
        {filtered.length} tool{filtered.length !== 1 ? 's' : ''} found{query && ` for "${query}"`}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30 glass rounded-2xl">
          <Search size={32} className="mx-auto mb-3 opacity-50" aria-hidden="true" />
          <p className="text-white/50 font-medium mb-1">No tools found</p>
          <p className="text-xs">Try a different search or clear filters</p>
        </div>
      ) : (
        <div className="space-y-3" role="list">
          {filtered.map(tool => (
            <article key={tool.id} role="listitem" className="glass rounded-xl p-4 card-hover flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-white/10 flex items-center justify-center">
                <span className="text-white/60 text-xs font-bold">{tool.name.slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-white font-semibold text-sm">{tool.name}</span>
                  <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{tool.category}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tool.pricing.includes('Free') ? 'badge-green' : 'badge-amber'}`}>
                    {tool.pricing}
                  </span>
                </div>
                <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-2">{tool.description}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {renderStars(tool.rating)}
                  <span className="text-amber-400 text-xs font-bold">{tool.rating.toFixed(1)}</span>
                  {tool.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] text-white/25">#{tag}</span>
                  ))}
                </div>
              </div>
              <a
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${tool.name} website`}
                className="flex-shrink-0 p-2 rounded-lg text-white/20 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <ExternalLink size={15} />
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
