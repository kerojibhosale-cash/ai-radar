'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, type TrendKeyword } from '@/lib/supabase';
import { FALLBACK_DATA } from '@/lib/api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Flame, Zap, Activity, Loader2 } from 'lucide-react';

const CHART_DATA = [
  { date: 'Mon', 'AI Agents': 65, 'Vibe Coding': 40, 'RAG Pipeline': 30 },
  { date: 'Tue', 'AI Agents': 72, 'Vibe Coding': 55, 'RAG Pipeline': 35 },
  { date: 'Wed', 'AI Agents': 80, 'Vibe Coding': 70, 'RAG Pipeline': 42 },
  { date: 'Thu', 'AI Agents': 88, 'Vibe Coding': 82, 'RAG Pipeline': 48 },
  { date: 'Fri', 'AI Agents': 85, 'Vibe Coding': 90, 'RAG Pipeline': 55 },
  { date: 'Sat', 'AI Agents': 92, 'Vibe Coding': 88, 'RAG Pipeline': 60 },
  { date: 'Sun', 'AI Agents': 98, 'Vibe Coding': 95, 'RAG Pipeline': 67 },
];

interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-xl p-3 border border-white/10 text-xs" role="tooltip">
        <p className="text-white/60 mb-2">{label}</p>
        {payload.map((entry) => (
          <p key={entry.dataKey} style={{ color: entry.color }} className="font-medium">
            {entry.dataKey}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading trends">
      <div className="glass rounded-2xl p-5 animate-pulse h-64" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="glass rounded-xl p-3 animate-pulse h-16" />
        ))}
      </div>
    </div>
  );
}

export default function TrendAnalyzer() {
  const [trends, setTrends] = useState<TrendKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'chart' | 'list'>('chart');

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const { data, error: dbError } = await supabase.from('trend_keywords').select('*').order('score', { ascending: false }).limit(20);
        if (dbError) throw dbError;
        setTrends(data && data.length > 0 ? data : FALLBACK_DATA.trends as TrendKeyword[]);
      } catch (err) {
        console.error('Trends fetch failed:', err);
        setTrends(FALLBACK_DATA.trends as TrendKeyword[]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, []);

  const viral = useMemo(() => trends.filter(t => t.is_viral), [trends]);
  const barData = useMemo(() => trends.slice(0, 10).map(t => ({ keyword: t.keyword, score: t.score, change: t.change_percent })), [trends]);

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
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-display font-bold text-white">Trend Analyzer</h2>
          <p className="text-white/40 text-sm mt-0.5">AI keyword velocity & niche momentum</p>
        </div>
        <div className="flex items-center gap-1" role="group" aria-label="View options">
          {(['chart', 'list'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                view === v ? 'bg-cyan-500 text-black' : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      {viral.length > 0 && (
        <section aria-label="Viral keywords">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={14} className="text-red-400" aria-hidden="true" />
            <span className="text-white/60 text-sm font-semibold">Viral Right Now</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {viral.map(t => (
              <div key={t.id} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-glow" aria-hidden="true" />
                <span className="text-white/80 text-sm font-medium">{t.keyword}</span>
                <span className="text-green-400 text-xs font-bold">+{t.change_percent.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {view === 'chart' && (
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={14} className="text-cyan-400" aria-hidden="true" />
              <h3 className="text-white/80 font-semibold text-sm">Top Trending Keywords - 7 Days</h3>
            </div>
            <div className="w-full h-[220px]" role="img" aria-label="Trending keywords chart showing growth over 7 days">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="colorAgents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorVibe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="AI Agents" stroke="#06b6d4" strokeWidth={2} fill="url(#colorAgents)" />
                  <Area type="monotone" dataKey="Vibe Coding" stroke="#14b8a6" strokeWidth={2} fill="url(#colorVibe)" />
                  <Area type="monotone" dataKey="RAG Pipeline" stroke="#f59e0b" strokeWidth={2} fill="url(#colorRag)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-2 justify-center flex-wrap">
              {[{ label: 'AI Agents', color: '#06b6d4' }, { label: 'Vibe Coding', color: '#14b8a6' }, { label: 'RAG Pipeline', color: '#f59e0b' }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-white/40">
                  <div className="w-3 h-0.5 rounded" style={{ backgroundColor: l.color }} aria-hidden="true" />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-teal-400" aria-hidden="true" />
              <h3 className="text-white/80 font-semibold text-sm">Trending Score - Top 10</h3>
            </div>
            <div className="w-full h-[200px]" role="img" aria-label="Bar chart showing trending scores">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="keyword" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" fill="#06b6d4" radius={[0, 4, 4, 0]} maxBarSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {view === 'list' && (
        <div className="space-y-2" role="list" aria-label="Trending keywords list">
          {trends.map((trend, idx) => (
            <div key={trend.id} role="listitem" className="glass rounded-xl px-4 py-3 flex items-center gap-4 card-hover">
              <span className="text-white/25 text-sm font-bold w-6 text-center" aria-hidden="true">#{idx + 1}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white/90 text-sm font-medium">{trend.keyword}</span>
                  {trend.is_viral && <Flame size={12} className="text-red-400" aria-label="Viral" />}
                </div>
                <span className="text-[10px] text-white/30">{trend.category}</span>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <Zap size={11} className="text-cyan-400" aria-hidden="true" />
                  <span className="text-cyan-400 text-sm font-bold">{trend.score}</span>
                </div>
                <span className={`text-xs font-semibold ${trend.change_percent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  +{trend.change_percent.toFixed(1)}%
                </span>
              </div>
              <div className="w-20 sm:w-24 h-1.5 bg-white/10 rounded-full overflow-hidden" role="progressbar" aria-valuenow={trend.score} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full" style={{ width: `${trend.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
