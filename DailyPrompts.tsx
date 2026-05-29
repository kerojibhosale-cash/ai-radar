'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, type AIPrompt } from '@/lib/supabase';
import { FALLBACK_DATA } from '@/lib/api';
import { MessageSquare, Copy, Check, Bookmark, ThumbsUp, Sparkles, AlertTriangle } from 'lucide-react';

const PLATFORM_COLORS: Record<string, string> = {
  'ChatGPT': 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  'Claude': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'Gemini': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  'Midjourney': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'Bolt': 'bg-green-500/15 text-green-400 border-green-500/20',
  'n8n': 'bg-red-500/15 text-red-400 border-red-500/20',
};

const PLATFORMS = ['All', 'ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'Bolt', 'n8n'] as const;

interface DailyPromptsProps {
  favorites: string[];
  onFavorite: (id: string, type: string) => void;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading prompts">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="glass rounded-xl p-4 animate-pulse">
          <div className="h-4 bg-white/10 rounded w-1/2 mb-3" />
          <div className="h-3 bg-white/5 rounded w-full mb-2" />
          <div className="h-3 bg-white/5 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

export default function DailyPrompts({ favorites, onFavorite }: DailyPromptsProps) {
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const { data, error: dbError } = await supabase.from('ai_prompts').select('*').order('created_at', { ascending: false });
        if (dbError) throw dbError;
        setPrompts(data && data.length > 0 ? data : FALLBACK_DATA.prompts as AIPrompt[]);
      } catch (err) {
        console.error('Prompts fetch failed:', err);
        setPrompts(FALLBACK_DATA.prompts as AIPrompt[]);
      } finally {
        setLoading(false);
      }
    };
    fetchPrompts();
  }, []);

  const handleCopy = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, []);

  const filtered = useMemo(() =>
    activePlatform === 'All' ? prompts : prompts.filter(p => p.platform === activePlatform),
    [prompts, activePlatform]
  );

  const dailyPrompts = useMemo(() => filtered.filter(p => p.is_daily), [filtered]);
  const otherPrompts = useMemo(() => filtered.filter(p => !p.is_daily), [filtered]);

  const PromptCard = useCallback(({ prompt }: { prompt: AIPrompt }) => {
    const isExpanded = expanded === prompt.id;
    const platformStyle = PLATFORM_COLORS[prompt.platform] || 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20';

    return (
      <article className={`glass rounded-xl overflow-hidden card-hover ${prompt.is_daily ? 'gradient-border' : ''}`}>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {prompt.is_daily && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                    <Sparkles size={9} aria-hidden="true" /> DAILY PICK
                  </span>
                )}
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${platformStyle}`}>
                  {prompt.platform}
                </span>
                <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{prompt.category}</span>
              </div>
              <h3 className="text-white font-semibold text-sm">{prompt.title}</h3>
            </div>
            <button
              onClick={() => onFavorite(prompt.id, 'prompt')}
              aria-label={favorites.includes(prompt.id) ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={favorites.includes(prompt.id)}
              className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${favorites.includes(prompt.id) ? 'text-amber-400 bg-amber-400/10' : 'text-white/20 hover:text-white/50 hover:bg-white/5'}`}
            >
              <Bookmark size={13} fill={favorites.includes(prompt.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          <button
            onClick={() => setExpanded(isExpanded ? null : prompt.id)}
            aria-expanded={isExpanded}
            className="w-full text-left bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 transition-colors hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <p className={`text-white/50 text-xs leading-relaxed font-mono ${isExpanded ? '' : 'line-clamp-3'}`}>
              {prompt.prompt_text}
            </p>
            {!isExpanded && prompt.prompt_text.length > 200 && (
              <span className="text-cyan-400 text-xs mt-1.5 inline-block">Show more...</span>
            )}
          </button>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-white/25 text-xs">
                <ThumbsUp size={11} aria-hidden="true" /> {prompt.upvotes}
              </span>
              {prompt.use_case && <span className="text-white/25 text-xs">{prompt.use_case}</span>}
            </div>
            <button
              onClick={() => handleCopy(prompt.id, prompt.prompt_text)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                copiedId === prompt.id ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/25'
              }`}
            >
              {copiedId === prompt.id ? <><Check size={12} aria-hidden="true" /> Copied!</> : <><Copy size={12} aria-hidden="true" /> Copy Prompt</>}
            </button>
          </div>
        </div>
      </article>
    );
  }, [favorites, onFavorite, copiedId, expanded, handleCopy]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-display font-bold text-white">Daily AI Prompts</h2>
        <p className="text-white/40 text-sm mt-0.5">Curated power prompts for every AI platform</p>
      </header>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Filter by platform">
        {PLATFORMS.map(platform => (
          <button
            key={platform}
            onClick={() => setActivePlatform(platform)}
            role="tab"
            aria-selected={activePlatform === platform}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              activePlatform === platform ? 'bg-cyan-500 text-black' : 'bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10'
            }`}
          >
            {platform}
          </button>
        ))}
      </div>

      {dailyPrompts.length > 0 && (
        <section aria-labelledby="daily-prompts-heading">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-amber-400" aria-hidden="true" />
            <h3 id="daily-prompts-heading" className="text-white/70 text-sm font-semibold">Today's Power Prompts</h3>
          </div>
          <div className="space-y-3" role="list">{dailyPrompts.map(prompt => <PromptCard key={prompt.id} prompt={prompt} />)}</div>
        </section>
      )}

      {otherPrompts.length > 0 && (
        <section aria-labelledby="all-prompts-heading">
          {dailyPrompts.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={14} className="text-white/40" aria-hidden="true" />
              <h3 id="all-prompts-heading" className="text-white/50 text-sm font-semibold">All Prompts</h3>
            </div>
          )}
          <div className="space-y-3" role="list">{otherPrompts.map(prompt => <PromptCard key={prompt.id} prompt={prompt} />)}</div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-white/30 glass rounded-2xl">
          <MessageSquare size={32} className="mx-auto mb-3 opacity-50" aria-hidden="true" />
          <p>No prompts for this platform yet</p>
        </div>
      )}
    </div>
  );
}
