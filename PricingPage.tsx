'use client';

import { useState } from 'react';
import { PLANS, type Plan } from '@/lib/monetization';
import { Check, Zap, Crown, Building2, ArrowRight } from 'lucide-react';

interface PricingCardProps {
  plan: Plan;
  currentPlan?: Plan;
  onSelect: (plan: Plan) => void;
  loading?: boolean;
}

const planIcons = {
  free: Zap,
  pro: Crown,
  enterprise: Building2,
};

const planColors = {
  free: 'border-white/10 hover:border-white/20',
  pro: 'border-cyan-500/40 bg-cyan-500/5',
  enterprise: 'border-amber-500/40 bg-amber-500/5',
};

export function PricingCard({ plan, currentPlan, onSelect, loading }: PricingCardProps) {
  const config = PLANS[plan];
  const Icon = planIcons[plan];
  const isCurrent = currentPlan === plan;
  const isUpgrade = currentPlan === 'free' && plan !== 'free';
  const popular = plan === 'pro';

  return (
    <article
      className={`glass rounded-2xl p-6 relative overflow-hidden transition-all duration-300 ${planColors[plan]} ${isCurrent ? 'ring-2 ring-green-500/50' : ''}`}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
          POPULAR
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          plan === 'pro' ? 'bg-cyan-500/20' : plan === 'enterprise' ? 'bg-amber-500/20' : 'bg-white/10'
        }`}>
          <Icon size={20} className={
            plan === 'pro' ? 'text-cyan-400' : plan === 'enterprise' ? 'text-amber-400' : 'text-white/60'
          } />
        </div>
        <div>
          <h3 className="text-white font-display font-bold text-lg">{config.name}</h3>
          {isCurrent && (
            <span className="text-green-400 text-xs font-medium">Current plan</span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-display font-bold text-white">${config.price}</span>
          {config.price > 0 && <span className="text-white/40 text-sm">/month</span>}
        </div>
      </div>

      <ul className="space-y-3 mb-6" role="list">
        {config.features.map(feature => (
          <li key={feature} className="flex items-start gap-2 text-white/70 text-sm">
            <Check size={16} className="text-green-400 shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan)}
        disabled={isCurrent || loading}
        className={`w-full py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
          isCurrent
            ? 'bg-white/5 text-white/40 cursor-not-allowed'
            : plan === 'pro'
            ? 'bg-cyan-500 hover:bg-cyan-400 text-black'
            : plan === 'enterprise'
            ? 'bg-amber-500 hover:bg-amber-400 text-black'
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
      >
        {loading ? 'Processing...' : isCurrent ? 'Current Plan' : isUpgrade ? 'Upgrade' : 'Get Started'}
        {!isCurrent && !loading && <ArrowRight size={14} className="inline ml-1" />}
      </button>
    </article>
  );
}

interface PricingPageProps {
  currentPlan?: Plan;
  onSelectPlan: (plan: Plan) => void;
  loading?: boolean;
}

export default function PricingPage({ currentPlan = 'free', onSelectPlan, loading }: PricingPageProps) {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="space-y-8">
      <header className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-white mb-3">Choose Your Plan</h1>
        <p className="text-white/50 text-lg">Unlock premium AI intelligence features</p>
      </header>

      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm ${!annual ? 'text-white' : 'text-white/50'}`}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          aria-pressed={annual}
          className="w-12 h-6 bg-white/10 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${annual ? 'right-0.5 bg-cyan-500' : 'left-0.5 bg-white/50'}`} />
        </button>
        <span className={`text-sm ${annual ? 'text-white' : 'text-white/50'}`}>
          Annual <span className="text-green-400 text-xs font-bold">Save 20%</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {(Object.keys(PLANS) as Plan[]).map(plan => (
          <PricingCard
            key={plan}
            plan={plan}
            currentPlan={currentPlan}
            onSelect={onSelectPlan}
            loading={loading}
          />
        ))}
      </div>

      <div className="glass rounded-xl p-6 max-w-3xl mx-auto">
        <h3 className="text-white font-semibold mb-4">Need a custom solution?</h3>
        <p className="text-white/60 text-sm mb-4">
          Enterprise plans start at $149/month and include dedicated support, custom integrations, and volume discounts.
        </p>
        <button className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-2 transition-colors">
          Contact Sales <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
