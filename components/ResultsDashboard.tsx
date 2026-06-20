'use client';

import React, { useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, ShieldAlert, Award, Lightbulb } from 'lucide-react';
import { AnalysisResult } from '../types/analysis';
import CarbonCard from './CarbonCard';
import { calculateBarWidth, calculateSavingsPercent } from '../lib/utils';

interface ResultsDashboardProps {
  result: AnalysisResult;
  imageUrl?: string;
  onReset: () => void;
}

export default function ResultsDashboard({ result, imageUrl, onReset }: ResultsDashboardProps) {
  const {
    itemName,
    category,
    confidenceScore,
    carbonValue,
    alternative,
    alternativeCarbonValue,
    unit,
    savings,
    whyItMatters,
    betterAlternative,
    ecoTip
  } = result;

  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dashboardRef.current) {
      dashboardRef.current.focus();
    }
  }, []);

  const confidencePercentage = Math.round(confidenceScore * 100);

  // Calculate comparative bar widths
  const maxVal = Math.max(carbonValue, alternativeCarbonValue, 0.1);
  const currentBarWidth = calculateBarWidth(carbonValue, maxVal);
  const alternativeBarWidth = calculateBarWidth(alternativeCarbonValue, maxVal);
  const savingsPercent = calculateSavingsPercent(savings, carbonValue);

  return (
    <div 
      ref={dashboardRef}
      tabIndex={-1}
      className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 focus:outline-none"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-900/30">
            Analysis Complete
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-3">
            Sustainability Diagnostics
          </h2>
        </div>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-white text-zinc-950 font-semibold rounded-2xl hover:bg-zinc-200 active:bg-white transition-all text-sm shadow-lg hover:shadow-white/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          Scan Another Item
        </button>
      </div>
 
      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Image, Info & Carbon Score (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Image & Item Detail Card */}
          <div className="rounded-3xl bg-zinc-900/20 border border-white/5 overflow-hidden shadow-xl">
            {imageUrl && (
              <div className="aspect-[4/3] w-full relative overflow-hidden bg-zinc-950 border-b border-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={itemName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6 space-y-4">
              <div>
                <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider block">
                  Identified Item
                </span>
                <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
                  {itemName}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-white/5">
                  <span className="text-zinc-500 text-xs block">Category</span>
                  <span className="text-zinc-200 font-semibold text-sm mt-0.5 block">{category}</span>
                </div>
                <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-white/5">
                  <span className="text-zinc-500 text-xs block">Confidence</span>
                  <span className="text-emerald-400 font-semibold text-sm mt-0.5 block">{confidencePercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Carbon Score Card */}
          <CarbonCard value={carbonValue} unit={unit} />
        </div>

        {/* Right Column: Savings & AI Advice (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Savings Comparison Progress Bar */}
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

          {/* AI Insights & Details */}
          <div className="space-y-4">
            
            {/* whyItMatters */}
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

            {/* betterAlternative */}
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

            {/* ecoTip */}
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

        </div>

      </div>
    </div>
  );
}
