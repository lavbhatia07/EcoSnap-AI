'use client';

import React, { useState, useRef } from 'react';
import { Leaf, Sparkles, AlertCircle, ArrowDown, ChevronRight, Recycle, Info } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import LoadingScanner from '../components/LoadingScanner';
import ResultsDashboard from '../components/ResultsDashboard';
import AnalysisHistory from '../components/AnalysisHistory';
import { AnalysisResult, HistoryItem } from '../types/analysis';
import { useAnalysisHistory } from '../hooks/useAnalysisHistory';

export default function Home() {
  const [activeState, setActiveState] = useState<'landing' | 'idle' | 'selected' | 'loading' | 'result' | 'error'>('landing');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<string>('image/jpeg');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { history, saveToHistory, clearHistory } = useAnalysisHistory();
  const workspaceRef = useRef<HTMLDivElement>(null);

  const scrollToWorkspace = () => {
    setActiveState('idle');
    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Accessibility focus management: focus the workspace container
      workspaceRef.current?.focus();
    }, 100);
  };

  const handleImageSelected = (base64Image: string, fileType: string, fileName: string) => {
    setSelectedImage(base64Image);
    setSelectedFileType(fileType);
    setSelectedFileName(fileName);
    setActiveState('selected');
  };

  const startAnalysis = async () => {
    if (!selectedImage) return;

    setActiveState('loading');
    setErrorMsg(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: selectedImage,
          mimeType: selectedFileType,
          fileName: selectedFileName
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image.');
      }

      setAnalysisResult(data);
      saveToHistory(data, selectedImage);
      setActiveState('result');
    } catch (e: unknown) {
      const err = e as Error;
      console.error('Error during analysis:', err);
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
      setActiveState('error');
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSelectedImage(item.imageUrl);
    setAnalysisResult(item.result);
    setActiveState('result');
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    workspaceRef.current?.focus();
  };

  const resetWorkspace = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setErrorMsg(null);
    setActiveState('idle');
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950 overflow-x-hidden">
      
      {/* Decorative Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none select-none" />
      <div className="absolute top-[20%] right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none select-none" />

      {/* Sleek Glassmorphic Navbar */}
      <header className="sticky top-0 z-50 w-full bg-zinc-950/60 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Leaf className="w-4 h-4 text-zinc-950" />
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">
            EcoSnap<span className="text-emerald-400">.AI</span>
          </span>
        </div>

        <nav aria-label="Main Navigation">
          <button
            onClick={scrollToWorkspace}
            className="text-xs font-semibold text-zinc-300 hover:text-white px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 hover:border-white/10 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            Scanner App
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-24 max-w-4xl mx-auto space-y-8 z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 text-xs font-semibold tracking-wide animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Sustainability Analysis
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-[1.1] max-w-3xl">
          Snap. Analyze. <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Reduce.</span>
        </h1>

        <p className="text-zinc-400 text-lg sm:text-xl font-normal max-w-2xl leading-relaxed">
          Upload a photo of food, clothing, electronics, or household items and discover its carbon footprint instantly using AI Vision.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 items-center">
          <button
            onClick={scrollToWorkspace}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold rounded-2xl transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20 active:scale-[0.98] text-base cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Try EcoSnap AI Now"
          >
            Try It Now
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => {
              const infoSec = document.getElementById('how-it-works');
              infoSec?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm font-semibold py-2 px-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            Learn how it works
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* How it works feature grid */}
      <section id="how-it-works" className="bg-zinc-900/20 border-y border-white/5 py-16 px-6 z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">How EcoSnap AI Works</h2>
            <p className="text-zinc-500 text-sm">Four seamless stages to carbon transparency</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-emerald-400 border border-white/5 font-bold">1</div>
              <h3 className="text-white font-bold text-sm">Capture Photo</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">Snap a picture of any item with your phone or drag it onto our desktop canvas.</p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-emerald-400 border border-white/5 font-bold">2</div>
              <h3 className="text-white font-bold text-sm">Vision Detect</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">AI Vision inspects the photo to identify the item, its category, and confidence level.</p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-emerald-400 border border-white/5 font-bold">3</div>
              <h3 className="text-white font-bold text-sm">Carbon Score</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">We cross-reference our database to calculate the item&apos;s lifetime carbon footprint.</p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-emerald-400 border border-white/5 font-bold">4</div>
              <h3 className="text-white font-bold text-sm">Smart Advice</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">GPT provides actionable environmental context, alternative guides, and carbon savings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace (Scanner Area) */}
      <section 
        ref={workspaceRef} 
        id="app-workspace" 
        tabIndex={-1}
        className="px-6 py-20 flex-grow z-10 flex flex-col items-center justify-start space-y-12 focus:outline-none"
      >
        <div className="text-center space-y-3 max-w-lg">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Sustainability Console
          </h2>
          <p className="text-zinc-400 text-sm">
            Scan your food, clothing, electronics, or household products to generate detailed greenhouse estimates.
          </p>
        </div>

        {/* State Machine Panels */}
        <div className="w-full flex justify-center">
          
          {/* Landing State Mockup / Prompt */}
          {activeState === 'landing' && (
            <div 
              onClick={scrollToWorkspace}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  scrollToWorkspace();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Scanner console, click to initialize scanner"
              className="w-full max-w-xl p-8 rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-all cursor-pointer text-center flex flex-col items-center py-16 space-y-6 group focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Recycle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-bold text-lg">System Ready</h3>
                <p className="text-zinc-500 text-sm max-w-sm">
                  Click below to open the workspace and begin uploading or capturing your product photos.
                </p>
              </div>
              <button className="px-6 py-3 bg-zinc-900 text-white border border-white/5 font-bold text-sm rounded-xl hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500">
                Initialize Scanner
              </button>
            </div>
          )}

          {/* Idle State: File Uploader */}
          {activeState === 'idle' && (
            <ImageUploader onImageSelected={handleImageSelected} />
          )}

          {/* Selected State: Preview & Confirm Scan */}
          {activeState === 'selected' && selectedImage && (
            <div className="w-full max-w-xl p-6 rounded-3xl bg-zinc-900/30 border border-white/5 flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/5 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt="Pre-analysis preview"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={resetWorkspace}
                  className="flex-1 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-2xl border border-white/5 transition-all text-sm cursor-pointer text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Clear Selection
                </button>
                <button
                  onClick={startAnalysis}
                  className="flex-[2] py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold rounded-2xl transition-all hover:scale-[1.01] shadow-lg shadow-emerald-500/10 cursor-pointer text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Analyze Carbon footprint
                </button>
              </div>
            </div>
          )}

          {/* Loading Scanner Animation */}
          {activeState === 'loading' && selectedImage && (
            <LoadingScanner imageUrl={selectedImage} />
          )}

          {/* Result Dashboard */}
          {activeState === 'result' && analysisResult && (
            <ResultsDashboard 
              result={analysisResult} 
              imageUrl={selectedImage || undefined} 
              onReset={resetWorkspace}
            />
          )}

          {/* Error State */}
          {activeState === 'error' && (
            <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-900/40 border border-rose-900/30 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-rose-950/30 text-rose-400 border border-rose-900/40 flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-bold text-lg">Diagnostics Failed</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {errorMsg || 'An error occurred during carbon footprint estimation. This could be due to API timeouts or an invalid image.'}
                </p>
              </div>
              <div className="flex gap-4 w-full">
                <button
                  onClick={resetWorkspace}
                  className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl border border-white/5 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  Cancel
                </button>
                <button
                  onClick={startAnalysis}
                  className="flex-[2] py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          )}

        </div>

        {/* History Component */}
        {activeState !== 'loading' && (
          <AnalysisHistory 
            history={history}
            onSelectItem={handleSelectHistoryItem} 
            onClearHistory={clearHistory}
          />
        )}

      </section>

      {/* FAQ / Info block */}
      <section className="bg-zinc-900/10 border-t border-white/5 py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="space-y-2 max-w-sm">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-400" />
              Sustainable Science
            </h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Our emissions modeling estimates product footprints based on lifecycle assessment averages (agricultural production, mining, smelting, fabrication, shipping logistics). AI Vision categorizes products to match localized databases, adjusting predictions using context metrics.
            </p>
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-white font-bold text-lg">Did you know?</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Small substitutions yield significant greenhouse containment. Changing cow milk to oat milk saves 2.3 kg CO₂e per liter. Shifting from fresh beef to plant proteins can lower your weekly food footprint by up to 80%. Every small choice scales up!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-zinc-950 py-8 px-6 text-center text-zinc-600 text-xs">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} EcoSnap AI. All rights reserved. Built for Sustainability.</p>
          <div className="flex gap-4">
            <span className="hover:text-zinc-400 transition-colors">Privacy Policy</span>
            <span className="hover:text-zinc-400 transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
