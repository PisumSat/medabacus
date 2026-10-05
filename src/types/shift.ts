import type { HospitalWardId } from './wards';

export interface ShiftPatientScore {
  toolId: string;
  toolTitle: string;
  scoreBadge: string;
  summaryText: string;
  updatedAt: number;
}

export interface ShiftTimer {
  id: string;
  label: string;
  startedAt: number;
  durationMinutes: number;
  totalDurationMs: number;
}

export interface ShiftPatient {
  id: string;
  bedTag: string; // e.g. "Bed 4A", "ICU 2", "L&D Rm 3"
  age?: number;
  gender?: 'M' | 'F' | 'Other';
  admittingDiagnosis: string;
  ward: HospitalWardId;
  activeScores: ShiftPatientScore[];
  clinicalNotes: string;
  timer?: ShiftTimer;
  createdAt: number;
  updatedAt: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  toolId: string;
  toolTitle: string;
  ward: HospitalWardId;
  patientTag?: string;
  summaryScore: string;
  inputs?: Record<string, any>;
  clinicalNoteSnippet: string;
}
