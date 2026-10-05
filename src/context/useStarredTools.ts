import { createContext, useContext } from 'react';

export const STARRED_STORAGE_KEY = 'medabacus_starred_tools';
export const LEGACY_STARRED_STORAGE_KEY = 'ogcal_starred_tools';
export const DEFAULT_STARRED_TOOLS: string[] = ['dating', 'ckd_crcl', 'parkland_burn', 'holliday_segar'];

export interface StarredToolsContextValue {
  starredIds: string[];
  isStarred: (id: string) => boolean;
  toggleStar: (id: string) => void;
  setStarred: (id: string, starred: boolean) => void;
}

export const StarredToolsContext = createContext<StarredToolsContextValue | null>(null);

export function useStarredTools(): StarredToolsContextValue {
  const ctx = useContext(StarredToolsContext);
  if (!ctx) {
    throw new Error('useStarredTools must be used within a StarredToolsProvider');
  }
  return ctx;
}
