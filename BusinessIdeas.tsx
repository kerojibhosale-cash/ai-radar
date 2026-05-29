'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, type BusinessIdea } from '@/lib/supabase';
import { FALLBACK_DATA } from '@/lib/api';
import { Lightbulb, Target, DollarSign, Users, Smartphone, Zap, Bookmark, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

const DIFFICULTY_CONFIG: Record<string, { color: string; bg: string }> = {
  'Easy': { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  'Medium': { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  'Hard': { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

interface BusinessIdeasProps {
  favorites: string[];
  onFavorite: (id: string, type: string) => void;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading business ideas">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass rounded-2xl p-5 animate-pulse">
          <div className="h-5 bg-white/10 rounded w-2/3 mb-3" />
          <div className="h-3 bg-white/5 rounded w-full mb-2" />
          <div className="h-3 bg-white/5 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

export default function BusinessIdeas({ favorites, onFavorite }: BusinessIdeasProps) {
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const { data, error: dbError } = await supabase.from('business_ideas').select('*').order('opportunity_score', { ascending: false });
        if (dbError) throw dbError;
        setIdeas(data && data.length > 0 ? data : FALLBACK_DATA.ideas as BusinessIdea[]);
      } catch (err) {
        console.error('Ideas fetch failed:', err);
        setIdeas(FALLBACK_DATA.ideas as BusinessIdea[]);
      } finally {
        setLoading(false);
      }
    };
    fetchIdeas();
  }, []);

  const avgScore = useMemo(() =>
    ideas.length > 0 ? Math.round(ideas.reduce((a, b) => a + b.opportunity_score, 0) / ideas.length) : 0,
  [ideas]);

  const getScoreColor = useCallback((score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  }, []);

  const getScoreBg = useCallback((score: number) => {
    if (score >= 85) return 'bg-green-500/10 border-green-500/20';
    if (score >= 70) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-red-500/10 border-red-500/20';
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-display font-bold text-white">AI Business Ideas Engine</h2>
        <p className="text-white/40 text-sm mt-0.5">AI-generated startup opportunities — fresh daily</p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Ideas Today', value: ideas.length, color: 'text-cyan-400' },
          { label: 'Avg Score', value: avgScore, color: 'text-green-400', suffix: '/100' },
          { label: 'Easy Builds', value: ideas.filter(i => i.difficulty === 'Easy').length, color: 'text-teal-400' },
        ].map(stat => (
          <div key={stat.label} className="glass rounded-xl p-3 text-center" role="status">
            <p className={`text-xl font-display font-bold ${stat.color}`}>{stat.value}{stat.suffix || ''}</p>
            <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4" role="list" aria-label="Business ideas">
        {ideas.map((idea, idx) => {
          const isExpanded = expanded === idea.id;
          const diffConfig = DIFFICULTY_CONFIG[idea.difficulty] || DIFFICULTY_CONFIG['Medium'];

          return (
            <article key={idea.id} role="listitem" className={`glass rounded-2xl overflow-hidden card-hover ${idea.is_featured ? 'gradient-border' : ''}`}>
              <button
                onClick={() => setExpanded(isExpanded ? null : idea.id)}
                aria-expanded={isExpanded}
                className="w-full p-5 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-center">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-1">
                      <span className="text-white/40 text-sm font-bold">#{idx + 1}</span>
                    </div>
                    <div className={`text-xs font-bold px-1.5 py-0.5 rounded-full border ${getScoreBg(idea.opportunity_score)} ${getScoreColor(idea.opportunity_score)}`}>
                      {idea.opportunity_score}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {idea.is_featured && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">HOT</span>
                      )}
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${diffConfig.bg} ${diffConfig.color}`}>
                        {idea.difficulty}
                      </span>
                      <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{idea.category}</span>
                    </div>
                    <h3 className="text-white font-display font-semibold text-base mb-1">{idea.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed line-clamp-2">{idea.problem}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); onFavorite(idea.id, 'idea'); }}
                      aria-label={favorites.includes(idea.id) ? 'Remove from favorites' : 'Add to favorites'}
                      aria-pressed={favorites.includes(idea.id)}
                      className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${favorites.includes(idea.id) ? 'text-amber-400 bg-amber-400/10' : 'text-white/20 hover:text-white/50'}`}
                    >
                      <Bookmark size={14} fill={favorites.includes(idea.id) ? 'currentColor' : 'none'} />
                    </button>
                    {isExpanded ? <ChevronUp size={16} className="text-white/30" aria-hidden="true" /> : <ChevronDown size={16} className="text-white/30" aria-hidden="true" />}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-white/[0.06] p-5 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={14} className="text-cyan-400" aria-hidden="true" />
                        <span className="text-white/70 text-xs font-semibold uppercase tracking-wide">AI Solution</span>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">{idea.solution}</p>
                    </div>
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={14} className="text-teal-400" aria-hidden="true" />
                        <span className="text-white/70 text-xs font-semibold uppercase tracking-wide">Target Audience</span>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">{idea.target_audience}</p>
                    </div>
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={14} className="text-green-400" aria-hidden="true" />
                        <span className="text-white/70 text-xs font-semibold uppercase tracking-wide">Monetization</span>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">{idea.monetization}</p>
                    </div>
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone size={14} className="text-amber-400" aria-hidden="true" />
                        <span className="text-white/70 text-xs font-semibold uppercase tracking-wide">How to Build</span>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">{idea.how_to_build}</p>
                    </div>
                  </div>

                  {idea.tags?.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {idea.tags.map(tag => (
                        <span key={tag} className="text-[11px] badge-cyan px-2.5 py-1 rounded-full font-medium">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`flex-1 min-w-[120px] rounded-xl p-3 text-center border ${getScoreBg(idea.opportunity_score)}`}>
                      <p className={`text-lg font-display font-bold ${getScoreColor(idea.opportunity_score)}`}>{idea.opportunity_score}/100</p>
                      <p className="text-white/40 text-xs">AI Opportunity Score</p>
                    </div>
                    <button className="flex-1 min-w-[120px] bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 px-4 rounded-xl transition-all text-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                      <Zap size={14} aria-hidden="true" /> Start Building
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
