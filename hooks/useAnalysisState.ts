import { useState, useRef } from 'react';
import { AnalysisResult, HistoryItem } from '../types/analysis';
import { useAnalysisHistory } from './useAnalysisHistory';

export function useAnalysisState() {
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

  return {
    activeState,
    selectedImage,
    selectedFileType,
    selectedFileName,
    analysisResult,
    errorMsg,
    history,
    clearHistory,
    workspaceRef,
    scrollToWorkspace,
    handleImageSelected,
    startAnalysis,
    handleSelectHistoryItem,
    resetWorkspace
  };
}
