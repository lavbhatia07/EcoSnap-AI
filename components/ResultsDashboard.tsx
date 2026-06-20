'use client';

import React, { useEffect, useRef } from 'react';
import { AnalysisResult } from '../types/analysis';
import CarbonCard from './CarbonCard';
import FootprintComparison from './FootprintComparison';
import AIInsights from './AIInsights';
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
    savings,
    whyItMatters,
    betterAlternative,
    ecoTip,
    unit
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
          <FootprintComparison
            itemName={itemName}
            carbonValue={carbonValue}
            alternative={alternative}
            alternativeCarbonValue={alternativeCarbonValue}
            savings={savings}
            maxVal={maxVal}
            currentBarWidth={currentBarWidth}
            alternativeBarWidth={alternativeBarWidth}
            savingsPercent={savingsPercent}
          />

          {/* AI Insights & Details */}
          <AIInsights
            whyItMatters={whyItMatters}
            betterAlternative={betterAlternative}
            ecoTip={ecoTip}
          />

        </div>

      </div>
    </div>
  );
}
