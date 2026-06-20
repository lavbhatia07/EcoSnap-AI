'use client';

import React from 'react';
import { Sparkles, CheckCircle2, ShieldAlert, Lightbulb } from 'lucide-react';

interface AIInsightsProps {
  whyItMatters: string;
  betterAlternative: string;
  ecoTip: string;
}

export default function AIInsights({ whyItMatters, betterAlternative, ecoTip }: AIInsightsProps) {
  return (
    <div className="space-y-4">
      {/* Environmental Context */}
      <div className="p-6 rounded-3xl bg-zinc-900/20 border border-white/5 hover:border-white/10 transition-all flex gap-4 items-start">
        <div className="p-2.5 rounded-xl bg-zinc-950 text-amber-400 border border-white/5 mt-0.5 flex-shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">
            Environmental Context
          </h4>
          <p className="text-zinc-300 text-sm leading-relaxed">
            {whyItMatters}
          </p>
        </div>
      </div>

      {/* Greener Alternative Argument */}
      <div className="p-6 rounded-3xl bg-zinc-900/20 border border-white/5 hover:border-white/10 transition-all flex gap-4 items-start">
        <div className="p-2.5 rounded-xl bg-zinc-950 text-emerald-400 border border-white/5 mt-0.5 flex-shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">
            Greener Alternative Argument
          </h4>
          <p className="text-zinc-300 text-sm leading-relaxed">
            {betterAlternative}
          </p>
        </div>
      </div>

      {/* Eco-Action Tip */}
      <div className="p-6 rounded-3xl bg-emerald-950/10 border border-emerald-900/30 hover:border-emerald-800/40 transition-all flex gap-4 items-start">
        <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-900/30 mt-0.5 flex-shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-emerald-400 font-bold text-sm uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Eco-Action Tip
          </h4>
          <p className="text-zinc-300 text-sm leading-relaxed">
            {ecoTip}
          </p>
        </div>
      </div>
    </div>
  );
}
