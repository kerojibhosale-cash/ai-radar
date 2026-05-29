'use client';

import { useState, useCallback } from 'react';
import { Bot, Copy, Check, ExternalLink, Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  platform: string;
  category: string;
  tools: string[];
  steps: string[];
  timeToSetup: string;
  difficulty: string;
}

const TEMPLATES: Template[] = [
  {
    id: '1',
    title: 'AI Email Digest Bot',
    description: 'Automatically summarize your daily emails and send a morning briefing to Telegram/Slack.',
    platform: 'n8n',
    category: 'Productivity',
    tools: ['Gmail API', 'OpenAI GPT-4', 'Telegram Bot'],
    steps: ['Trigger: Every day at 7:00 AM', 'Fetch: Get last 24h emails from Gmail', 'AI: Categorize + summarize with GPT-4', 'Format: Create markdown digest', 'Send: Post to Telegram channel'],
    timeToSetup: '30 min',
    difficulty: 'Easy',
  },
  {
    id: '2',
    title: 'Social Media Auto-Poster',
    description: 'Turn any blog post or YouTube video into Twitter threads, LinkedIn posts, and Instagram captions automatically.',
    platform: 'Make',
    category: 'Marketing',
    tools: ['RSS Feed', 'Claude AI', 'Twitter API', 'LinkedIn API'],
    steps: ['Trigger: New blog post published (RSS)', 'AI: Extract key points with Claude', 'Generate: Twitter thread + LinkedIn post', 'Schedule: Post at optimal times', 'Track: Log performance in Airtable'],
    timeToSetup: '45 min',
    difficulty: 'Medium',
  },
  {
    id: '3',
    title: 'AI Lead Qualifier',
    description: 'Automatically qualify inbound leads from your website, score them with AI, and route to CRM.',
    platform: 'n8n',
    category: 'Sales',
    tools: ['Typeform', 'OpenAI', 'HubSpot CRM', 'Slack'],
    steps: ['Trigger: Form submission received', 'AI: Score lead quality 1-10', 'Route: High score → CRM + Slack alert', 'Auto-reply: Send personalized email', 'Track: Update deal stage'],
    timeToSetup: '1 hour',
    difficulty: 'Medium',
  },
  {
    id: '4',
    title: 'AI Content Repurposer',
    description: 'One piece of content → 10 different formats across all platforms, fully automated.',
    platform: 'Make',
    category: 'Content',
    tools: ['YouTube API', 'Whisper', 'GPT-4', 'Buffer'],
    steps: ['Input: YouTube video URL', 'Transcribe: Use Whisper API', 'AI: Generate 10 content variations', 'Create: Blog post, tweets, LinkedIn, etc.', 'Schedule: Auto-post to all platforms'],
    timeToSetup: '2 hours',
    difficulty: 'Hard',
  },
  {
    id: '5',
    title: 'AI Customer Support Agent',
    description: 'Deploy an intelligent support agent that handles 80% of tickets automatically.',
    platform: 'n8n',
    category: 'Support',
    tools: ['Zendesk', 'OpenAI', 'Notion', 'Slack'],
    steps: ['Trigger: New support ticket created', 'AI: Match against knowledge base', 'Generate: Personalized response draft', 'Auto-send: If confidence > 90%', 'Escalate: Route to human if needed'],
    timeToSetup: '3 hours',
    difficulty: 'Hard',
  },
  {
    id: '6',
    title: 'Daily AI Market Report',
    description: 'Automatically generate and send a morning report on AI industry news, stock prices, and trends.',
    platform: 'n8n',
    category: 'Research',
    tools: ['NewsAPI', 'Yahoo Finance', 'GPT-4', 'Email'],
    steps: ['Trigger: Every weekday at 6:00 AM', 'Fetch: Top AI news headlines', 'Fetch: Relevant stock prices', 'AI: Summarize + add insights', 'Send: Email report to subscribers'],
    timeToSetup: '1 hour',
    difficulty: 'Easy',
  },
];

const PLATFORM_COLORS: Record<string, string> = {
  'n8n': 'bg-red-500/15 text-red-400 border-red-500/20',
  'Make': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
};

const DIFF_COLORS: Record<string, string> = {
  'Easy': 'bg-green-500/15 text-green-400 border-green-500/20',
  'Medium': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'Hard': 'bg-red-500/15 text-red-400 border-red-500/20',
};

export default function AutomationTemplates() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = useCallback(async (id: string, title: string) => {
    try {
      await navigator.clipboard.writeText(`AI Automation Template: ${title}`);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, []);

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-display font-bold text-white">AI Automation Templates</h2>
        <p className="text-white/40 text-sm mt-0.5">Ready-to-use automation workflows for n8n, Make, and more</p>
      </header>

      <div className="space-y-3" role="list" aria-label="Automation templates">
        {TEMPLATES.map(template => {
          const isExpanded = expanded === template.id;
          return (
            <article key={template.id} role="listitem" className="glass rounded-2xl overflow-hidden card-hover">
              <button
                onClick={() => setExpanded(isExpanded ? null : template.id)}
                aria-expanded={isExpanded}
                className="w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${PLATFORM_COLORS[template.platform] || 'badge-cyan'}`}>
                        {template.platform}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${DIFF_COLORS[template.difficulty]}`}>
                        {template.difficulty}
                      </span>
                      <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{template.category}</span>
                      <span className="text-[10px] text-white/30">~{template.timeToSetup}</span>
                    </div>
                    <h3 className="text-white font-semibold text-sm">{template.title}</h3>
                    <p className="text-white/50 text-xs mt-1 leading-relaxed">{template.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); handleCopy(template.id, template.title); }}
                      aria-label={copied === template.id ? 'Copied' : 'Copy template name'}
                      className={`p-1.5 rounded-lg text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 ${copied === template.id ? 'text-green-400 bg-green-400/10' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}
                    >
                      {copied === template.id ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                    {isExpanded ? <ChevronUp size={15} className="text-white/30" aria-hidden="true" /> : <ChevronDown size={15} className="text-white/30" aria-hidden="true" />}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-white/[0.05] p-4 space-y-4 animate-fade-in">
                  <div>
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-2">Workflow Steps</p>
                    <div className="space-y-2" role="list">
                      {template.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3" role="listitem">
                          <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                            <span className="text-cyan-400 text-[10px] font-bold">{i + 1}</span>
                          </div>
                          <p className="text-white/60 text-xs mt-0.5">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-2">Tools Required</p>
                    <div className="flex flex-wrap gap-2">
                      {template.tools.map(tool => (
                        <span key={tool} className="badge-cyan text-[11px] px-2.5 py-1 rounded-full font-medium">{tool}</span>
                      ))}
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2.5 rounded-xl transition-all text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400">
                    <Zap size={14} aria-hidden="true" /> Use This Template
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
