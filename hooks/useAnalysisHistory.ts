import { useState, useEffect, useCallback } from 'react';
import { HistoryItem, AnalysisResult } from '../types/analysis';

import { LOCAL_STORAGE_KEY, MAX_HISTORY_ITEMS } from '../constants';

export function useAnalysisHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryItem[];
        // Sort by timestamp descending
        const sorted = parsed.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(sorted);
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
    }
  }, []);

  const saveToHistory = useCallback((result: AnalysisResult, imageUrl: string | null) => {
    if (!imageUrl) return;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      let historyList: HistoryItem[] = [];

      if (stored) {
        historyList = JSON.parse(stored) as HistoryItem[];
      }

      const newItem: HistoryItem = {
        id: result.id,
        timestamp: Date.now(),
        imageUrl,
        result
      };

      // Push to front
      historyList.unshift(newItem);

      // Limit items
      if (historyList.length > MAX_HISTORY_ITEMS) {
        historyList = historyList.slice(0, MAX_HISTORY_ITEMS);
      }

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(historyList));
      setHistory(historyList);
    } catch (e) {
      console.error('Failed to save scan to localStorage history:', e);
    }
  }, []);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setHistory([]);
    } catch (e) {
      console.error('Failed to clear history from localStorage', e);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    saveToHistory,
    clearHistory,
    reloadHistory: loadHistory,
  };
}
