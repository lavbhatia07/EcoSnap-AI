'use client';

import React, { useState, useEffect } from 'react';

interface LoadingScannerProps {
  imageUrl: string;
}

const MESSAGES = [
  'AI Vision Analyzing...',
  'Calculating Carbon Impact...',
  'Generating Sustainability Advice...',
  'Finalizing Eco-Score Dashboard...'
];

export default function LoadingScanner({ imageUrl }: LoadingScannerProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="relative w-full max-w-md mx-auto aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 flex flex-col items-center justify-center"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Background Image Preview */}
      {imageUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageUrl}
          alt="Scanning product"
          className="absolute inset-0 w-full h-full object-cover opacity-40 select-none blur-[1px]"
        />
      )}

      {/* Laser Scanning Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-[scan_2.5s_ease-in-out_infinite]" />
      </div>

      {/* Futuristic Circular Scanner UI */}
      <div className="relative z-20 flex flex-col items-center p-6 bg-zinc-900/70 backdrop-blur-md rounded-2xl border border-white/10 max-w-[85%] text-center">
        {/* Radar-like pulsing circle */}
        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/20 opacity-75 animate-ping" />
          <div className="relative rounded-full h-12 w-12 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg 
              className="w-6 h-6 text-zinc-950 animate-spin" 
              fill="none" 
              viewBox="0 0 24 24"
              style={{ animationDuration: '3s' }}
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </div>

        <p className="text-white font-medium text-lg tracking-tight h-7 transition-all duration-300">
          {MESSAGES[currentMessageIndex]}
        </p>
        <p className="text-zinc-400 text-xs mt-1">
          Powering sustainability engine
        </p>
      </div>

      {/* Styled inline animation block if Tailwind doesn't have scan configured */}
      <style jsx global>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
