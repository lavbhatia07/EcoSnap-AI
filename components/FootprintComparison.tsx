'use client';

import React from 'react';
import { Award } from 'lucide-react';

interface FootprintComparisonProps {
  itemName: string;
  carbonValue: number;
  alternative: string;
  alternativeCarbonValue: number;
  savings: number;
  maxVal: number;
  currentBarWidth: number;
  alternativeBarWidth: number;
  savingsPercent: number;
}

export default function FootprintComparison({
  itemName,
  carbonValue,
  alternative,
  alternativeCarbonValue,
  savings,
  maxVal,
  currentBarWidth,
  alternativeBarWidth,
  savingsPercent
}: FootprintComparisonProps) {
  return (
    <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/5 shadow-xl space-y-6">
      <div>
        <h3 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          Footprint Comparison
        </h3>
        <p className="text-zinc-400 text-xs mt-1">
          Visualizing how alternative choices shrink your footprint
        </p>
      </div>

      <div className="space-y-4">
        {/* Current Item Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-zinc-400">{itemName} (Current)</span>
            <span className="text-zinc-300 font-semibold">{carbonValue.toFixed(2)} kg</span>
          </div>
          <div 
            role="progressbar"
            aria-label={`${itemName} footprint`}
            aria-valuenow={carbonValue}
            aria-valuemin={0}
            aria-valuemax={maxVal}
            className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5"
          >
            <div
              style={{ width: `${currentBarWidth}%` }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.15)] transition-all duration-1000"
            />
          </div>
        </div>

        {/* Alternative Item Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-emerald-400">{alternative} (Alternative)</span>
            <span className="text-emerald-400 font-semibold">{alternativeCarbonValue.toFixed(2)} kg</span>
          </div>
          <div 
            role="progressbar"
            aria-label={`${alternative} footprint`}
            aria-valuenow={alternativeCarbonValue}
            aria-valuemin={0}
            aria-valuemax={maxVal}
            className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5"
          >
            <div
              style={{ width: `${alternativeBarWidth}%` }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.2)] transition-all duration-1000"
            />
          </div>
        </div>
      </div>

      {/* Savings Callout */}
      {savings > 0 && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-400 border border-emerald-500/20">
            <span className="text-lg font-bold">-{savingsPercent}%</span>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold">
              Greener Choice Alternative
            </h4>
            <p className="text-zinc-300 text-xs mt-0.5">
              Switching to <span className="text-emerald-400 font-medium">{alternative}</span> saves approximately <span className="font-semibold text-white">{savings.toFixed(1)} kg CO₂e</span>!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
