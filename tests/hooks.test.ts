import { renderHook, act } from '@testing-library/react';
import { useAnalysisHistory } from '../hooks/useAnalysisHistory';
import { AnalysisResult } from '../types/analysis';

const mockResult: AnalysisResult = {
  id: 'test-123',
  timestamp: 1672531199000,
  itemName: 'Polyester Jacket',
  category: 'Clothing',
  confidenceScore: 0.95,
  carbonValue: 18.0,
  alternative: 'Recycled Nylon Jacket',
  alternativeCarbonValue: 8.5,
  unit: 'per item',
  savings: 9.5,
  whyItMatters: 'Test context',
  betterAlternative: 'Test alternative',
  ecoTip: 'Test tip'
};

describe('useAnalysisHistory custom hook tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test('should initialize with empty history list', () => {
    const { result } = renderHook(() => useAnalysisHistory());
    expect(result.current.history).toEqual([]);
  });

  test('should save item to history and retrieve it', () => {
    const { result } = renderHook(() => useAnalysisHistory());

    act(() => {
      result.current.saveToHistory(mockResult, 'data:image/jpeg;base64,123');
    });

    expect(result.current.history.length).toBe(1);
    expect(result.current.history[0].id).toBe('test-123');
    expect(result.current.history[0].imageUrl).toBe('data:image/jpeg;base64,123');
    expect(result.current.history[0].result.itemName).toBe('Polyester Jacket');
  });

  test('should respect the maximum item limit (10 items)', () => {
    const { result } = renderHook(() => useAnalysisHistory());

    act(() => {
      for (let i = 0; i < 12; i++) {
        const itemResult = { ...mockResult, id: `test-${i}` };
        result.current.saveToHistory(itemResult, 'mock-url');
      }
    });

    expect(result.current.history.length).toBe(10);
    expect(result.current.history[0].id).toBe('test-11');
  });

  test('should clear history successfully', () => {
    const { result } = renderHook(() => useAnalysisHistory());

    act(() => {
      result.current.saveToHistory(mockResult, 'mock-url');
    });
    expect(result.current.history.length).toBe(1);

    act(() => {
      result.current.clearHistory();
    });
    expect(result.current.history).toEqual([]);
    expect(localStorage.getItem('ecosnap_history')).toBeNull();
  });

  test('should catch and log errors if JSON parsing fails', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('ecosnap_history', 'malformed { json');

    const { result } = renderHook(() => useAnalysisHistory());
    expect(result.current.history).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test('should handle save errors gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    const { result } = renderHook(() => useAnalysisHistory());
    act(() => {
      result.current.saveToHistory(mockResult, 'mock-url');
    });
    
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test('should handle clear errors gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Remove error');
    });

    const { result } = renderHook(() => useAnalysisHistory());
    act(() => {
      result.current.clearHistory();
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
  });



  test('should initialize with pre-existing history list sorted by timestamp descending', () => {
    const preExisting = [
      { id: 'old', timestamp: 1000, imageUrl: 'url-old', result: mockResult },
      { id: 'new', timestamp: 5000, imageUrl: 'url-new', result: mockResult }
    ];
    localStorage.setItem('ecosnap_history', JSON.stringify(preExisting));

    const { result } = renderHook(() => useAnalysisHistory());
    expect(result.current.history.length).toBe(2);
    expect(result.current.history[0].id).toBe('new');
    expect(result.current.history[1].id).toBe('old');
  });
});
