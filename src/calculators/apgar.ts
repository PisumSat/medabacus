export interface ApgarTimePoint {
  appearance: number; // 0, 1, 2
  pulse: number; // 0, 1, 2
  grimace: number; // 0, 1, 2
  activity: number; // 0, 1, 2
  respiration: number; // 0, 1, 2
}

export interface ApgarResult {
  score1Min: number;
  score5Min?: number;
  score10Min?: number;
  status1Min: 'Normal' | 'Moderate Depression' | 'Severe Depression';
  status5Min?: 'Normal' | 'Moderate Depression' | 'Severe Depression';
  clinicalGuidance: string;
  nrpIntervention: string;
  noteSnippet: string;
}

export const APGAR_OPTIONS = {
  appearance: [
    { score: 0, label: 'Pale or blue all over' },
    { score: 1, label: 'Pink body, blue extremities (Acrocyanosis)' },
    { score: 2, label: 'Completely pink' },
  ],
  pulse: [
    { score: 0, label: 'Absent (0 bpm)' },
    { score: 1, label: '< 100 bpm' },
    { score: 2, label: '>= 100 bpm' },
  ],
  grimace: [
    { score: 0, label: 'No response / Flaccid' },
    { score: 1, label: 'Grimace or weak cry with stimulation' },
    { score: 2, label: 'Vigorous cry, cough, sneeze, active withdrawal' },
  ],
  activity: [
    { score: 0, label: 'Limp, no tone' },
    { score: 1, label: 'Some flexion of arms and legs' },
    { score: 2, label: 'Active motion, well-flexed extremities' },
  ],
  respiration: [
    { score: 0, label: 'Absent (Apnea)' },
    { score: 1, label: 'Slow, irregular, gasping, or weak cry' },
    { score: 2, label: 'Good strong cry, regular breathing' },
  ],
};

function scoreToCategory(score: number): 'Normal' | 'Moderate Depression' | 'Severe Depression' {
  if (score >= 7) return 'Normal';
  if (score >= 4) return 'Moderate Depression';
  return 'Severe Depression';
}

export function calculateApgar(
  oneMin: ApgarTimePoint,
  fiveMin?: ApgarTimePoint,
  tenMin?: ApgarTimePoint
): ApgarResult {
  const score1Min = oneMin.appearance + oneMin.pulse + oneMin.grimace + oneMin.activity + oneMin.respiration;
  const status1Min = scoreToCategory(score1Min);

  let score5Min: number | undefined;
  let status5Min: ApgarResult['status5Min'];
  if (fiveMin) {
    score5Min = fiveMin.appearance + fiveMin.pulse + fiveMin.grimace + fiveMin.activity + fiveMin.respiration;
    status5Min = scoreToCategory(score5Min);
  }

  let score10Min: number | undefined;
  if (tenMin) {
    score10Min = tenMin.appearance + tenMin.pulse + tenMin.grimace + tenMin.activity + tenMin.respiration;
  }

  let clinicalGuidance = '';
  let nrpIntervention = '';

  const active5Min = score5Min !== undefined ? score5Min : score1Min;

  if (active5Min >= 7) {
    clinicalGuidance = 'Normal physiological transition. Routine post-birth care, dry, stimulate, skin-to-skin contact with mother.';
    nrpIntervention = 'Routine neonatal care. No active resuscitation needed.';
  } else if (active5Min >= 4) {
    clinicalGuidance =
      'Moderate neonatal depression. Open airway, clear secretions, dry and stimulate. If heart rate <100 bpm or persistent apnea/gasping, initiate positive-pressure ventilation (PPV).';
    nrpIntervention = 'NRP Protocol: Provide supplemental oxygen / CPAP or PPV with bag-mask at 40-60 breaths/min. Monitor preductal SpO2.';
  } else {
    clinicalGuidance =
      'Severe neonatal depression. High risk of perinatal acidemia. Immediate resuscitation required. Check paired umbilical cord arterial and venous blood gases.';
    nrpIntervention =
      'NRP Code: Immediate PPV with 21% O2 (>=35w) or 21-30% O2 (<35w). If HR < 60 bpm despite 30s effective PPV, begin chest compressions (3:1 ratio) and prepare 100% O2 and emergency IV epinephrine.';
  }

  let noteSnippet = `NEONATAL APGAR SCORE:
- 1-minute: ${score1Min}/10 (${status1Min})`;
  if (score5Min !== undefined) {
    noteSnippet += `\n- 5-minute: ${score5Min}/10 (${status5Min})`;
  }
  if (score10Min !== undefined) {
    noteSnippet += `\n- 10-minute: ${score10Min}/10 (${scoreToCategory(score10Min)})`;
  }
  noteSnippet += `\nAction: ${nrpIntervention}`;

  return {
    score1Min,
    score5Min,
    score10Min,
    status1Min,
    status5Min,
    clinicalGuidance,
    nrpIntervention,
    noteSnippet,
  };
}
