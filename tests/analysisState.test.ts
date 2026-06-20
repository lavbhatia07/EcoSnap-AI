import { renderHook, act } from '@testing-library/react';
import { useAnalysisState } from '../hooks/useAnalysisState';
import { AnalysisResult } from '../types/analysis';

const mockResult: AnalysisResult = {
  id: 'res-1',
  timestamp: 1672531199000,
  itemName: 'Polyester Jacket',
  category: 'Clothing',
  confidenceScore: 0.95,
  carbonValue: 18.0,
  alternative: 'Recycled Nylon Jacket',
  alternativeCarbonValue: 8.5,
  unit: 'per item',
  savings: 9.5,
  whyItMatters: 'Jacket production impact details',
  betterAlternative: 'Why recycled nylon is better explanation',
  ecoTip: 'Action tip: thrift first'
};

describe('useAnalysisState custom hook tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test('should initialize with default states', () => {
    const { result } = renderHook(() => useAnalysisState());
    expect(result.current.activeState).toBe('landing');
    expect(result.current.selectedImage).toBeNull();
    expect(result.current.analysisResult).toBeNull();
    expect(result.current.errorMsg).toBeNull();
  });

  test('should update state when image is selected', () => {
    const { result } = renderHook(() => useAnalysisState());

    act(() => {
      result.current.handleImageSelected('data:image/jpeg;base64,dummy', 'image/jpeg', 'test.jpg');
    });

    expect(result.current.selectedImage).toBe('data:image/jpeg;base64,dummy');
    expect(result.current.activeState).toBe('selected');
  });

  test('should scroll to workspace and transition to idle', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useAnalysisState());

    act(() => {
      result.current.scrollToWorkspace();
    });

    expect(result.current.activeState).toBe('idle');

    act(() => {
      jest.advanceTimersByTime(100);
    });

    jest.useRealTimers();
  });

  test('should handle reset correctly', () => {
    const { result } = renderHook(() => useAnalysisState());

    act(() => {
      result.current.handleImageSelected('data:image/jpeg;base64,dummy', 'image/jpeg', 'test.jpg');
    });

    act(() => {
      result.current.resetWorkspace();
    });

    expect(result.current.selectedImage).toBeNull();
    expect(result.current.activeState).toBe('idle');
  });

  test('should handle startAnalysis successfully', async () => {
    const originalFetch = window.fetch;
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResult
    } as Response);
    window.fetch = mockFetch;

    const { result } = renderHook(() => useAnalysisState());

    act(() => {
      result.current.handleImageSelected('data:image/jpeg;base64,dummy', 'image/jpeg', 'test.jpg');
    });

    await act(async () => {
      await result.current.startAnalysis();
    });

    expect(result.current.activeState).toBe('result');
    expect(result.current.analysisResult).toEqual(mockResult);

    window.fetch = originalFetch;
  });

  test('should handle startAnalysis network error', async () => {
    const originalFetch = window.fetch;
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'OpenAI timeout error' })
    } as Response);
    window.fetch = mockFetch;

    const { result } = renderHook(() => useAnalysisState());

    act(() => {
      result.current.handleImageSelected('data:image/jpeg;base64,dummy', 'image/jpeg', 'test.jpg');
    });

    await act(async () => {
      await result.current.startAnalysis();
    });

    expect(result.current.activeState).toBe('error');
    expect(result.current.errorMsg).toBe('OpenAI timeout error');

    window.fetch = originalFetch;
  });

  test('should handle select history item', () => {
    const { result } = renderHook(() => useAnalysisState());
    const mockHistoryItem = {
      id: 'hist-1',
      timestamp: Date.now(),
      imageUrl: 'data:image/png;base64,dummy',
      result: mockResult
    };

    act(() => {
      result.current.handleSelectHistoryItem(mockHistoryItem);
    });

    expect(result.current.selectedImage).toBe('data:image/png;base64,dummy');
    expect(result.current.analysisResult).toEqual(mockResult);
    expect(result.current.activeState).toBe('result');
  });
});
