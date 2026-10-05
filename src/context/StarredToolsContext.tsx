import React, { useState, useEffect, useCallback } from 'react';
import {
  StarredToolsContext,
  STARRED_STORAGE_KEY,
  LEGACY_STARRED_STORAGE_KEY,
  DEFAULT_STARRED_TOOLS,
} from './useStarredTools';

export const StarredToolsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [starredIds, setStarredIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STARRED_STORAGE_KEY) || localStorage.getItem(LEGACY_STARRED_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // ignore localStorage parse errors
    }
    return DEFAULT_STARRED_TOOLS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STARRED_STORAGE_KEY, JSON.stringify(starredIds));
    } catch {
      // ignore storage quota or private browsing errors
    }
  }, [starredIds]);

  const isStarred = useCallback(
    (id: string) => starredIds.includes(id),
    [starredIds]
  );

  const toggleStar = useCallback((id: string) => {
    setStarredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const setStarred = useCallback((id: string, starred: boolean) => {
    setStarredIds((prev) => {
      if (starred && !prev.includes(id)) return [...prev, id];
      if (!starred && prev.includes(id)) return prev.filter((item) => item !== id);
      return prev;
    });
  }, []);

  return (
    <StarredToolsContext.Provider value={{ starredIds, isStarred, toggleStar, setStarred }}>
      {children}
    </StarredToolsContext.Provider>
  );
};
