'use client';

import { DollarSign, Clock, ArrowRight, Zap, CheckCircle } from 'lucide-react';

interface Hustle {
  title: string;
  description: string;
  revenue: string;
  difficulty: 'Easy' | 'Medium';
  time: string;
  steps: string[];
  color: string;
  accent: string;
}

const HUSTLES: Hustle[] = [
  {
    title: 'AI Prompt Seller',
    description: 'Create and sell premium AI prompt packs on Gumroad, Etsy, or Promptbase.',
    revenue: '$500–5K/mo',
    difficulty: 'Easy',
    time: '2–5 hrs/week',
    steps: ['Pick 3 AI tools you know well', 'Create 50+ tested prompts in a niche', 'Package on Gumroad for $9–49', 'Market on Twitter & TikTok'],
    color: 'from-green-500/10',
    accent: 'text-green-400',
  },
  {
    title: 'AI Content Agency',
    description: 'Offer AI-powered blog posts, social media content, and copywriting to SMBs.',
    revenue: '$2K–20K/mo',
    difficulty: 'Medium',
    time: '15–30 hrs/week',
    steps: ['Use Claude/ChatGPT + Jasper', 'Charge $500–2000/month retainer', 'Start with LinkedIn outreach', 'Scale with 5+ clients'],
    color: 'from-cyan-500/10',
    accent: 'text-cyan-400',
  },
  {
    title: 'AI Automation Consultant',
    description: 'Help businesses automate workflows with n8n, Make, and AI agents.',
    revenue: '$5K–50K/mo',
    difficulty: 'Medium',
    time: '20–40 hrs/week',
    steps: ['Master n8n + Make + Zapier', 'Build 5 automation case studies', 'Charge $150–500/hour', 'Offer monthly maintenance'],
    color: 'from-teal-500/10',
    accent: 'text-teal-400',
  },
  {
    title: 'AI YouTube Channel',
    description: 'Create tutorials and reviews of AI tools. Monetize with ads, sponsorships, and affiliates.',
    revenue: '$1K–30K/mo',
    difficulty: 'Easy',
    time: '10–20 hrs/week',
    steps: ['Pick AI niche (tools/coding/business)', 'Post 3 videos/week with AI help', 'Monetize: AdSense + sponsorships', 'Grow email list for products'],
    color: 'from-amber-500/10',
    accent: 'text-amber-400',
  },
  {
    title: 'AI SaaS Builder',
    description: 'Build micro-SaaS tools using Bolt.new and sell them for $29–99/month subscriptions.',
    revenue: '$2K–100K/mo',
    difficulty: 'Medium',
    time: '30–50 hrs total (then passive)',
    steps: ['Find pain point in a niche', 'Build MVP with Bolt.new in 24hrs', 'Launch on Product Hunt', 'Grow to $1K MRR in 90 days'],
    color: 'from-blue-500/10',
    accent: 'text-blue-400',
  },
  {
    title: 'AI Art & Design Services',
    description: 'Sell AI-generated art, logos, book covers, and custom designs on Fiverr/Upwork.',
    revenue: '$500–8K/mo',
    difficulty: 'Easy',
    time: '10–15 hrs/week',
    steps: ['Master Midjourney + DALL-E 3', 'Create portfolio of 20 examples', 'List on Fiverr starting at $20', 'Upsell packages up to $500'],
    color: 'from-rose-500/10',
    accent: 'text-rose-400',
  },
];

export default function SideHustles() {
  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-display font-bold text-white">Top AI Side Hustles</h2>
        <p className="text-white/40 text-sm mt-0.5">Proven ways to make money with AI in 2025</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label="AI side hustles">
        {HUSTLES.map((hustle, idx) => (
          <article
            key={hustle.title}
            role="listitem"
            className={`glass rounded-2xl p-5 card-hover relative overflow-hidden focus-within:ring-2 focus-within:ring-cyan-500`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${hustle.color} to-transparent pointer-events-none`} aria-hidden="true" />
            <div className="relative">
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white/25 text-xs" aria-hidden="true">#{idx + 1}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      hustle.difficulty === 'Easy'
                        ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}>
                      {hustle.difficulty}
                    </span>
                  </div>
                  <h3 className="text-white font-display font-bold text-base">{hustle.title}</h3>
                </div>
                <div className="text-right shrink-0">
                  <p className={`${hustle.accent} font-display font-bold text-sm`}>{hustle.revenue}</p>
                  <p className="text-white/30 text-[10px]">potential</p>
                </div>
              </div>

              <p className="text-white/50 text-sm leading-relaxed mb-4">{hustle.description}</p>

              <div className="flex items-center gap-3 mb-4 text-xs text-white/40 flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock size={11} className={hustle.accent} aria-hidden="true" /> {hustle.time}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign size={11} className="text-green-400" aria-hidden="true" /> {hustle.revenue}
                </span>
              </div>

              <div className="space-y-1.5 mb-4" role="list" aria-label="Steps">
                {hustle.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                    <span className={`${hustle.accent} font-bold shrink-0 mt-0.5`} aria-hidden="true">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full flex items-center justify-center gap-2 ${hustle.accent} bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-current`}>
                <Zap size={13} aria-hidden="true" /> Start This Hustle <ArrowRight size={13} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
