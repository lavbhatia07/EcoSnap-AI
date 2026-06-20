'use client';

import React from 'react';
import { History, Trash2, ArrowRight, Leaf } from 'lucide-react';
import { HistoryItem } from '../types/analysis';

interface AnalysisHistoryProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export default function AnalysisHistory({ history, onSelectItem, onClearHistory }: AnalysisHistoryProps) {
  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && confirm('Are you sure you want to clear your carbon analysis history?')) {
      onClearHistory();
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (history.length === 0) {
    return null; // Don't render history if there are no past items
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pt-6 border-t border-white/5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-400" />
          Recent Scans
        </h3>
        <button
          onClick={handleClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 text-xs font-semibold border border-white/5 hover:border-rose-950/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
          title="Clear scan history"
          aria-label="Clear scan history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Log
        </button>
      </div>

      {/* Grid of history cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {history.map((item) => {
          const isExcellent = item.result.carbonValue <= 3.0;
          const isHigh = item.result.carbonValue > 8.0;
          const badgeColor = isExcellent 
            ? 'text-emerald-400 bg-emerald-950/20' 
            : isHigh 
            ? 'text-rose-400 bg-rose-950/20' 
            : 'text-amber-400 bg-amber-950/20';

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectItem(item);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Historical scan: ${item.result.itemName}. Carbon footprint ${item.result.carbonValue.toFixed(1)} kg. Click to load results.`}
              className="group relative overflow-hidden rounded-2xl bg-zinc-900/30 hover:bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer flex flex-col justify-between p-4 h-48 shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {/* background thumbnail watermark */}
              {item.imageUrl && (
                <div className="absolute inset-0 w-full h-full opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none select-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-full h-full object-cover blur-[2px]"
                  />
                </div>
              )}

              {/* Top part: Category badge & Date */}
              <div className="relative z-10 flex justify-between items-start">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/5 ${badgeColor}`}>
                  {item.result.category}
                </span>
                <span className="text-zinc-500 text-[10px]">
                  {formatDate(item.timestamp)}
                </span>
              </div>

              {/* Middle part: Title & emissions */}
              <div className="relative z-10 my-3">
                <h4 className="text-white font-bold text-base tracking-tight truncate group-hover:text-emerald-400 transition-colors">
                  {item.result.itemName}
                </h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-extrabold text-zinc-100">
                    {item.result.carbonValue.toFixed(1)}
                  </span>
                  <span className="text-zinc-400 text-xs">kg CO₂e</span>
                </div>
              </div>

              {/* Bottom part: savings or alternative tip */}
              <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-2.5 mt-auto">
                {item.result.savings > 0 ? (
                  <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5" />
                    Save {item.result.savings.toFixed(1)} kg
                  </span>
                ) : (
                  <span className="text-zinc-500 text-xs">No savings</span>
                )}
                <span className="text-zinc-400 group-hover:text-emerald-400 transition-colors flex items-center gap-1 text-[10px] font-semibold">
                  View
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
