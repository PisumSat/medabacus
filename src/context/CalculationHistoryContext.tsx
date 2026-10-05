import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { HistoryEntry } from '../types/shift';

export const CALC_HISTORY_STORAGE_KEY = 'medabacus_calc_history';
export const LEGACY_CALC_HISTORY_STORAGE_KEY = 'ogcal_calc_history';
const MAX_HISTORY_ENTRIES = 120;

export interface CalculationHistoryContextValue {
  history: HistoryEntry[];
  addHistoryEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  removeHistoryEntry: (id: string) => void;
  clearAllHistory: () => void;
  exportHistoryCsv: () => string;
}

export const CalculationHistoryContext = createContext<CalculationHistoryContextValue | null>(null);

export const CalculationHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem(CALC_HISTORY_STORAGE_KEY) || localStorage.getItem(LEGACY_CALC_HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore parse error
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CALC_HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // storage quota or private window
    }
  }, [history]);

  const addHistoryEntry = useCallback((entryData: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entryData,
      id: `calc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      // Prevent consecutive exact duplicates within 3 seconds
      if (prev.length > 0) {
        const latest = prev[0];
        if (
          latest.toolId === newEntry.toolId &&
          latest.summaryScore === newEntry.summaryScore &&
          Date.now() - latest.timestamp < 3000
        ) {
          return prev;
        }
      }
      return [newEntry, ...prev.slice(0, MAX_HISTORY_ENTRIES - 1)];
    });
  }, []);

  const removeHistoryEntry = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAllHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const exportHistoryCsv = useCallback(() => {
    if (history.length === 0) return '';
    const headers = ['Timestamp', 'Date & Time', 'Bed / Patient Tag', 'Ward', 'Calculator / Tool', 'Result Score', 'Clinical Note Snippet'];
    const rows = history.map((h) => [
      h.timestamp,
      `"${new Date(h.timestamp).toLocaleString()}"`,
      `"${(h.patientTag || 'None').replace(/"/g, '""')}"`,
      `"${h.ward}"`,
      `"${h.toolTitle.replace(/"/g, '""')}"`,
      `"${h.summaryScore.replace(/"/g, '""')}"`,
      `"${(h.clinicalNoteSnippet || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }, [history]);

  return (
    <CalculationHistoryContext.Provider
      value={{
        history,
        addHistoryEntry,
        removeHistoryEntry,
        clearAllHistory,
        exportHistoryCsv,
      }}
    >
      {children}
    </CalculationHistoryContext.Provider>
  );
};

export function useCalculationHistory(): CalculationHistoryContextValue {
  const ctx = useContext(CalculationHistoryContext);
  if (!ctx) {
    throw new Error('useCalculationHistory must be used within a CalculationHistoryProvider');
  }
  return ctx;
}
