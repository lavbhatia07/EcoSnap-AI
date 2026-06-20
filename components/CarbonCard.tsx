'use client';

import React from 'react';
import { Leaf, AlertTriangle, Flame } from 'lucide-react';
import { CARBON_THRESHOLD_EXCELLENT, CARBON_THRESHOLD_MODERATE } from '../constants';

interface CarbonCardProps {
  value: number;
  unit: string;
}

export default function CarbonCard({ value, unit }: CarbonCardProps) {
  // Score range classifications
  const getScoreDetails = (val: number) => {
    if (val <= CARBON_THRESHOLD_EXCELLENT) {
      return {
        label: 'Excellent',
        description: 'Low environmental impact. Highly sustainable choice.',
        colorClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
        badgeColor: 'bg-emerald-500',
        icon: <Leaf className="w-5 h-5 text-emerald-400" />
      };
    } else if (val <= CARBON_THRESHOLD_MODERATE) {
      return {
        label: 'Moderate Impact',
        description: 'Average footprint. Opportunities exist to reduce emissions.',
        colorClass: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
        badgeColor: 'bg-amber-500',
        icon: <AlertTriangle className="w-5 h-5 text-amber-400" />
      };
    } else {
      return {
        label: 'High Impact',
        description: 'Significant environmental footprint. Consider switching to alternatives.',
        colorClass: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
        badgeColor: 'bg-rose-500',
        icon: <Flame className="w-5 h-5 text-rose-400" />
      };
    }
  };

  const details = getScoreDetails(value);

  return (
    <div 
      className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 shadow-xl flex flex-col justify-between space-y-4"
      aria-label={`Carbon emissions card, value is ${value} kilograms of CO2 equivalent ${unit}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
            Carbon Footprint
          </h3>
          <p className="text-zinc-500 text-xs mt-0.5">
            Measured in CO₂ equivalent ({unit})
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${details.colorClass}`}>
          {details.icon}
          {details.label}
        </div>
      </div>

      <div className="py-2">
        <span className="text-5xl font-extrabold tracking-tighter text-white" aria-hidden="true">
          {value.toFixed(1)}
        </span>
        <span className="text-zinc-400 text-lg font-medium ml-2">
          kg CO₂e
        </span>
      </div>

      <div className="border-t border-white/5 pt-4">
        <p className="text-zinc-300 text-sm font-normal leading-relaxed">
          {details.description}
        </p>
      </div>
    </div>
  );
}
