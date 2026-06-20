import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResultsDashboard from '../components/ResultsDashboard';
import CarbonCard from '../components/CarbonCard';
import LoadingScanner from '../components/LoadingScanner';
import AnalysisHistory from '../components/AnalysisHistory';
import { AnalysisResult, HistoryItem } from '../types/analysis';

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

describe('Component Level Tests', () => {
  describe('CarbonCard', () => {
    test('renders High Impact details for value > 8.0', () => {
      render(<CarbonCard value={12.5} unit="per kg" />);
      expect(screen.getByText('High Impact')).toBeInTheDocument();
      expect(screen.getByText('12.5')).toBeInTheDocument();
    });

    test('renders Moderate Impact details for value between 3.0 and 8.0', () => {
      render(<CarbonCard value={5.5} unit="per item" />);
      expect(screen.getByText('Moderate Impact')).toBeInTheDocument();
      expect(screen.getByText('5.5')).toBeInTheDocument();
    });

    test('renders Excellent details for value <= 3.0', () => {
      render(<CarbonCard value={1.2} unit="per use" />);
      expect(screen.getByText('Excellent')).toBeInTheDocument();
      expect(screen.getByText('1.2')).toBeInTheDocument();
    });
  });

  describe('LoadingScanner', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('renders scanning animation and placeholder image, and cycles messages', () => {
      render(<LoadingScanner imageUrl="data:image/jpeg;base64,dummy" />);
      expect(screen.getByAltText('Scanning product')).toBeInTheDocument();
      expect(screen.getByText('Powering sustainability engine')).toBeInTheDocument();
      expect(screen.getByText('AI Vision Analyzing...')).toBeInTheDocument();

      // Fast-forward 1500ms to test interval message change
      act(() => {
        jest.advanceTimersByTime(1500);
      });
      expect(screen.getByText('Calculating Carbon Impact...')).toBeInTheDocument();
    });
  });

  describe('ResultsDashboard', () => {
    const mockOnReset = jest.fn();

    test('renders all carbon calculation components and AI text', () => {
      render(
        <ResultsDashboard
          result={mockResult}
          imageUrl="data:image/jpeg;base64,dummy"
          onReset={mockOnReset}
        />
      );

      // Identified item name
      expect(screen.getByText('Polyester Jacket')).toBeInTheDocument();
      
      // Environmental context paragraph
      expect(screen.getByText('Jacket production impact details')).toBeInTheDocument();
      
      // Greener alternative argument
      expect(screen.getByText('Why recycled nylon is better explanation')).toBeInTheDocument();
      
      // Eco tip
      expect(screen.getByText('Action tip: thrift first')).toBeInTheDocument();

      // Reset button click triggers onReset
      const btn = screen.getByRole('button', { name: /Scan Another Item/i });
      fireEvent.click(btn);
      expect(mockOnReset).toHaveBeenCalled();
    });

    test('renders progress bars with role progressbar and ARIA attributes', () => {
      render(<ResultsDashboard result={mockResult} onReset={mockOnReset} />);
      const progressbars = screen.getAllByRole('progressbar');
      expect(progressbars.length).toBe(2);
      expect(progressbars[0]).toHaveAttribute('aria-label', 'Polyester Jacket footprint');
      expect(progressbars[0]).toHaveAttribute('aria-valuenow', '18');
      expect(progressbars[1]).toHaveAttribute('aria-label', 'Recycled Nylon Jacket footprint');
      expect(progressbars[1]).toHaveAttribute('aria-valuenow', '8.5');
    });

    test('handles focus fallback when dashboardRef is null', () => {
      const useRefSpy = jest.spyOn(React, 'useRef').mockReturnValue({ current: null });
      
      render(<ResultsDashboard result={mockResult} onReset={mockOnReset} />);
      // Should mount without crashing
      expect(screen.getByText('Sustainability Diagnostics')).toBeInTheDocument();
      
      useRefSpy.mockRestore();
    });

    test('covers zero savings condition branch', () => {
      const zeroSavingsResult = {
        ...mockResult,
        savings: 0,
        carbonValue: 3.0,
        alternativeCarbonValue: 3.0
      };

      render(<ResultsDashboard result={zeroSavingsResult} onReset={mockOnReset} />);
      // The savings callout box should not be present
      expect(screen.queryByText('Greener Choice Alternative')).not.toBeInTheDocument();
    });
  });

  describe('AnalysisHistory', () => {
    const mockOnSelectItem = jest.fn();
    const mockOnClearHistory = jest.fn();

    const mockHistory: HistoryItem[] = [
      {
        id: 'hist-1',
        timestamp: Date.now(),
        imageUrl: 'data:image/png;base64,dummy1',
        result: mockResult // High Impact
      },
      {
        id: 'hist-2',
        timestamp: Date.now() - 5000,
        imageUrl: 'data:image/png;base64,dummy2',
        result: {
          ...mockResult,
          id: 'res-2',
          itemName: 'Cow Milk',
          carbonValue: 3.2, // Moderate Impact
          alternativeCarbonValue: 0.9,
          savings: 2.3
        }
      },
      {
        id: 'hist-3',
        timestamp: Date.now() - 10000,
        imageUrl: 'data:image/png;base64,dummy3',
        result: {
          ...mockResult,
          id: 'res-3',
          itemName: 'Plums',
          carbonValue: 0.5, // Excellent
          alternativeCarbonValue: 0.5,
          savings: 0.0 // No savings
        }
      }
    ];

    beforeEach(() => {
      mockOnSelectItem.mockClear();
      mockOnClearHistory.mockClear();
    });

    test('renders scan item list and invokes actions on click', () => {
      render(
        <AnalysisHistory
          history={mockHistory}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
        />
      );

      expect(screen.getByText('Recent Scans')).toBeInTheDocument();
      expect(screen.getByText('Polyester Jacket')).toBeInTheDocument();
      expect(screen.getByText('Cow Milk')).toBeInTheDocument();
      expect(screen.getByText('Plums')).toBeInTheDocument();

      // Click select
      const itemCard = screen.getByRole('button', { name: /Historical scan: Polyester Jacket/i });
      fireEvent.click(itemCard);
      expect(mockOnSelectItem).toHaveBeenCalledWith(mockHistory[0]);
    });

    test('triggers onSelectItem on KeyDown Enter/Space', () => {
      render(
        <AnalysisHistory
          history={mockHistory}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
        />
      );

      const itemCard = screen.getByRole('button', { name: /Historical scan: Polyester Jacket/i });
      
      // Trigger random KeyDown (should not call)
      fireEvent.keyDown(itemCard, { key: 'ArrowDown' });
      expect(mockOnSelectItem).not.toHaveBeenCalled();

      // Trigger Enter
      fireEvent.keyDown(itemCard, { key: 'Enter' });
      expect(mockOnSelectItem).toHaveBeenCalledWith(mockHistory[0]);

      mockOnSelectItem.mockClear();

      // Trigger Space
      fireEvent.keyDown(itemCard, { key: ' ' });
      expect(mockOnSelectItem).toHaveBeenCalledWith(mockHistory[0]);
    });

    test('renders nothing if history is empty', () => {
      const { container } = render(
        <AnalysisHistory
          history={[]}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    test('calls onClearHistory when Clear Log is clicked and confirmed', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      render(
        <AnalysisHistory
          history={mockHistory}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
        />
      );

      const clearBtn = screen.getByRole('button', { name: /Clear scan history/i });
      fireEvent.click(clearBtn);
      
      expect(confirmSpy).toHaveBeenCalled();
      expect(mockOnClearHistory).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    test('does not call onClearHistory when Clear Log is clicked and rejected', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      render(
        <AnalysisHistory
          history={mockHistory}
          onSelectItem={mockOnSelectItem}
          onClearHistory={mockOnClearHistory}
        />
      );

      const clearBtn = screen.getByRole('button', { name: /Clear scan history/i });
      fireEvent.click(clearBtn);
      
      expect(confirmSpy).toHaveBeenCalled();
      expect(mockOnClearHistory).not.toHaveBeenCalled();
      confirmSpy.mockRestore();
    });
  });
});
