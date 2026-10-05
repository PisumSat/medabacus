import type { ReactNode } from 'react';

export type HospitalWardId = 'all' | 'internal_medicine' | 'surgery' | 'obgyn' | 'pediatrics';

export interface WardDefinition {
  id: HospitalWardId;
  name: string;
  shortName: string;
  badge: string;
  description: string;
  gradient: string;
  lightBg: string;
  darkBg: string;
  borderColor: string;
  icon: ReactNode;
  standards: string[];
}

export interface WardNavigationItem {
  id: HospitalWardId;
  label: string;
  count: number;
  icon: ReactNode;
}

