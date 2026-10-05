import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ShiftPatient, ShiftPatientScore } from '../types/shift';
import type { HospitalWardId } from '../types/wards';

export const SHIFT_CENSUS_STORAGE_KEY = 'medabacus_shift_census';
export const LEGACY_SHIFT_CENSUS_STORAGE_KEY = 'ogcal_shift_census';

const INITIAL_SAMPLE_PATIENTS: ShiftPatient[] = [
  {
    id: 'pt_sample_1',
    bedTag: 'Bed 4A',
    age: 62,
    gender: 'M',
    admittingDiagnosis: 'Decompensated Cirrhosis & Ascites',
    ward: 'internal_medicine',
    activeScores: [
      {
        toolId: 'liver_meld_child',
        toolTitle: 'MELD-Na 2016 & Child-Pugh',
        scoreBadge: 'MELD-Na: 24 (52% 90d Mort)',
        summaryText: 'Class C Cirrhosis (11 pts). Cr 2.1, Bili 3.8, INR 1.9, Na 131.',
        updatedAt: Date.now() - 3600000,
      },
    ],
    clinicalNotes: 'NPO post-midnight for paracentesis. Albumin 25% protocol if >5L removed.',
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'pt_sample_2',
    bedTag: 'ICU Bed 2',
    age: 38,
    gender: 'M',
    admittingDiagnosis: 'Severe Flame Burn (35% TBSA)',
    ward: 'surgery',
    activeScores: [
      {
        toolId: 'parkland_burn',
        toolTitle: 'Parkland Burn & Rule of Nines',
        scoreBadge: 'LR: 9,800 mL / 24h',
        summaryText: 'First 8h: 4,900 mL (612 mL/hr). Titrating to UOP >= 0.5 mL/kg/h.',
        updatedAt: Date.now() - 1800000,
      },
    ],
    clinicalNotes: 'Intubated for inhalation injury. Right radial arterial line in place.',
    timer: {
      id: 'timer_burn',
      label: 'Parkland 8h Resuscitation Target',
      startedAt: Date.now() - 7200000,
      durationMinutes: 480,
      totalDurationMs: 480 * 60 * 1000,
    },
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 1800000,
  },
  {
    id: 'pt_sample_3',
    bedTag: 'L&D Rm 3',
    age: 29,
    gender: 'F',
    admittingDiagnosis: '39w0d G1P0 Induction of Labor',
    ward: 'obgyn',
    activeScores: [
      {
        toolId: 'bishop',
        toolTitle: 'Bishop Score & Ripening',
        scoreBadge: 'Bishop: 4 (Unfavorable)',
        summaryText: 'Dil 1cm, Eff 40%, St -2, Med cons, Mid pos. Cervidil / Cook balloon indicated.',
        updatedAt: Date.now() - 900000,
      },
    ],
    clinicalNotes: 'FHR Category I baseline 140. Category-safe ripening initiated.',
    createdAt: Date.now() - 5400000,
    updatedAt: Date.now() - 900000,
  },
];

export interface ShiftCensusContextValue {
  patients: ShiftPatient[];
  activePatientId: string | null;
  activePatient: ShiftPatient | null;
  setActivePatientId: (id: string | null) => void;
  addPatient: (patient: Omit<ShiftPatient, 'id' | 'createdAt' | 'updatedAt' | 'activeScores'>) => string;
  updatePatient: (id: string, updates: Partial<ShiftPatient>) => void;
  removePatient: (id: string) => void;
  attachScoreToPatient: (bedTagOrId: string, score: Omit<ShiftPatientScore, 'updatedAt'>) => boolean;
  startPatientTimer: (patientId: string, label: string, durationMinutes: number) => void;
  stopPatientTimer: (patientId: string) => void;
  generateSbarHandoff: () => string;
  clearCensus: () => void;
  resetToSampleData: () => void;
}

export const ShiftCensusContext = createContext<ShiftCensusContextValue | null>(null);

export const ShiftCensusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<ShiftPatient[]>(() => {
    try {
      const stored = localStorage.getItem(SHIFT_CENSUS_STORAGE_KEY) || localStorage.getItem(LEGACY_SHIFT_CENSUS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_SAMPLE_PATIENTS;
  });

  const [activePatientId, setActivePatientId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SHIFT_CENSUS_STORAGE_KEY, JSON.stringify(patients));
    } catch {
      // ignore
    }
  }, [patients]);

  const activePatient = useMemo(
    () => patients.find((p) => p.id === activePatientId) || null,
    [patients, activePatientId]
  );

  const addPatient = useCallback(
    (patientData: Omit<ShiftPatient, 'id' | 'createdAt' | 'updatedAt' | 'activeScores'>): string => {
      const newId = `pt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const newPt: ShiftPatient = {
        ...patientData,
        id: newId,
        activeScores: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setPatients((prev) => [newPt, ...prev]);
      return newId;
    },
    []
  );

  const updatePatient = useCallback((id: string, updates: Partial<ShiftPatient>) => {
    setPatients((prev) =>
      prev.map((pt) => {
        if (pt.id !== id) return pt;
        return {
          ...pt,
          ...updates,
          updatedAt: Date.now(),
        };
      })
    );
  }, []);

  const removePatient = useCallback((id: string) => {
    setPatients((prev) => prev.filter((pt) => pt.id !== id));
    setActivePatientId((curr) => (curr === id ? null : curr));
  }, []);

  const attachScoreToPatient = useCallback(
    (bedTagOrId: string, scoreData: Omit<ShiftPatientScore, 'updatedAt'>): boolean => {
      const targetQuery = bedTagOrId.trim().toLowerCase();
      let found = false;

      setPatients((prev) =>
        prev.map((pt) => {
          const matchId = pt.id.toLowerCase() === targetQuery;
          const matchTag = pt.bedTag.toLowerCase() === targetQuery;

          if (matchId || matchTag) {
            found = true;
            // Replace existing score for this tool or append
            const filteredScores = pt.activeScores.filter((s) => s.toolId !== scoreData.toolId);
            const newScore: ShiftPatientScore = {
              ...scoreData,
              updatedAt: Date.now(),
            };
            return {
              ...pt,
              activeScores: [newScore, ...filteredScores],
              updatedAt: Date.now(),
            };
          }
          return pt;
        })
      );

      return found;
    },
    []
  );

  const startPatientTimer = useCallback((patientId: string, label: string, durationMinutes: number) => {
    setPatients((prev) =>
      prev.map((pt) => {
        if (pt.id !== patientId) return pt;
        return {
          ...pt,
          timer: {
            id: `timer_${Date.now()}`,
            label,
            startedAt: Date.now(),
            durationMinutes,
            totalDurationMs: durationMinutes * 60 * 1000,
          },
          updatedAt: Date.now(),
        };
      })
    );
  }, []);

  const stopPatientTimer = useCallback((patientId: string) => {
    setPatients((prev) =>
      prev.map((pt) => {
        if (pt.id !== patientId) return pt;
        return {
          ...pt,
          timer: undefined,
          updatedAt: Date.now(),
        };
      })
    );
  }, []);

  const generateSbarHandoff = useCallback((): string => {
    const timestamp = new Date().toLocaleString();
    const divider = '==================================================';

    const header = [
      divider,
      `MEDABACUS WARD SHIFT HANDOFF (SBAR SIGN-OUT)`,
      `Generated: ${timestamp}`,
      `Total Census: ${patients.length} Patient(s)`,
      divider,
      '',
    ];

    if (patients.length === 0) {
      return [...header, 'Census is currently empty. No active beds logged.'].join('\n');
    }

    const patientSections = patients.map((pt, index) => {
      const wardLabelMap: Record<HospitalWardId, string> = {
        all: 'General Ward',
        internal_medicine: 'Internal Medicine',
        surgery: 'Surgery & Trauma',
        obgyn: 'Obstetrics & Gynecology',
        pediatrics: 'Pediatrics',
      };

      const lines = [
        `[${index + 1}] ${pt.bedTag.toUpperCase()} | ${wardLabelMap[pt.ward]}`,
        `S (Situation): ${pt.age ? `${pt.age}yo ` : ''}${pt.gender || ''} admitted for ${pt.admittingDiagnosis}`,
        `B (Background): ${pt.clinicalNotes ? pt.clinicalNotes : 'Stable course on floor.'}`,
      ];

      if (pt.activeScores.length > 0) {
        lines.push(`A (Calculated Assessment & Risk):`);
        pt.activeScores.forEach((s) => {
          lines.push(`   • ${s.toolTitle}: [${s.scoreBadge}] ${s.summaryText}`);
        });
      } else {
        lines.push(`A (Assessment): Pending serial risk scores.`);
      }

      if (pt.timer) {
        const elapsedMin = Math.round((Date.now() - pt.timer.startedAt) / 60000);
        const remainingMin = Math.max(0, pt.timer.durationMinutes - elapsedMin);
        lines.push(`R (Recommendation & Timed Protocol):`);
        lines.push(`   • ${pt.timer.label} (${remainingMin}m remaining of ${pt.timer.durationMinutes}m target).`);
      } else {
        lines.push(`R (Recommendation): Routine vitals & call if decompensation.`);
      }

      lines.push('--------------------------------------------------');
      return lines.join('\n');
    });

    return [...header, ...patientSections].join('\n');
  }, [patients]);

  const clearCensus = useCallback(() => {
    setPatients([]);
    setActivePatientId(null);
  }, []);

  const resetToSampleData = useCallback(() => {
    setPatients(INITIAL_SAMPLE_PATIENTS);
  }, []);

  return (
    <ShiftCensusContext.Provider
      value={{
        patients,
        activePatientId,
        activePatient,
        setActivePatientId,
        addPatient,
        updatePatient,
        removePatient,
        attachScoreToPatient,
        startPatientTimer,
        stopPatientTimer,
        generateSbarHandoff,
        clearCensus,
        resetToSampleData,
      }}
    >
      {children}
    </ShiftCensusContext.Provider>
  );
};

export function useShiftCensus(): ShiftCensusContextValue {
  const ctx = useContext(ShiftCensusContext);
  if (!ctx) {
    throw new Error('useShiftCensus must be used within a ShiftCensusProvider');
  }
  return ctx;
}
