export interface BishopInput {
  dilation: number; // 0, 1, 2, 3
  effacement: number; // 0, 1, 2, 3
  station: number; // 0, 1, 2, 3
  consistency: number; // 0, 1, 2
  position: number; // 0, 1, 2
}

export interface BishopResult {
  totalScore: number;
  maxScore: 13;
  simplifiedScore: number;
  maxSimplifiedScore: 9;
  classification: 'Favorable' | 'Intermediate' | 'Unfavorable';
  interpretation: string;
  recommendation: string;
  noteSnippet: string;
}

export const BISHOP_OPTIONS = {
  dilation: [
    { score: 0, label: 'Closed (0 cm)' },
    { score: 1, label: '1 - 2 cm' },
    { score: 2, label: '3 - 4 cm' },
    { score: 3, label: '>= 5 cm' },
  ],
  effacement: [
    { score: 0, label: '0 - 30%' },
    { score: 1, label: '40 - 50%' },
    { score: 2, label: '60 - 70%' },
    { score: 3, label: '>= 80%' },
  ],
  station: [
    { score: 0, label: '-3 (High)' },
    { score: 1, label: '-2' },
    { score: 2, label: '-1 to 0 (Engaged)' },
    { score: 3, label: '+1 to +3 (Low)' },
  ],
  consistency: [
    { score: 0, label: 'Firm' },
    { score: 1, label: 'Medium' },
    { score: 2, label: 'Soft' },
  ],
  position: [
    { score: 0, label: 'Posterior' },
    { score: 1, label: 'Mid-position' },
    { score: 2, label: 'Anterior' },
  ],
};

export function calculateBishopScore(input: BishopInput): BishopResult {
  const totalScore = input.dilation + input.effacement + input.station + input.consistency + input.position;
  const simplifiedScore = input.dilation + input.effacement + input.station;

  let classification: 'Favorable' | 'Intermediate' | 'Unfavorable';
  let interpretation = '';
  let recommendation = '';

  if (totalScore >= 8) {
    classification = 'Favorable';
    interpretation = `Score of ${totalScore}/13 indicates a ripe/favorable cervix with a high likelihood of successful vaginal delivery equivalent to spontaneous labor.`;
    recommendation = 'Direct induction with IV Oxytocin and/or artificial rupture of membranes (AROM) is appropriate. Cervical ripening agents are generally not required.';
  } else if (totalScore >= 6) {
    classification = 'Intermediate';
    interpretation = `Score of ${totalScore}/13 indicates an intermediate/equivocal cervical exam.`;
    recommendation = 'Assess parity and maternal-fetal status. Ripening with mechanical balloon catheter or prostaglandins can be considered before oxytocin.';
  } else {
    classification = 'Unfavorable';
    interpretation = `Score of ${totalScore}/13 indicates an unfavorable/unripe cervix with higher risk of prolonged induction and cesarean delivery without ripening.`;
    recommendation = 'Pre-induction cervical ripening recommended (Mechanical: Foley/Cook balloon catheter; Pharmacologic: Misoprostol PGE1 25 mcg orally/vaginally or Dinoprostone PGE2). Avoid oxytocin alone.';
  }

  const dilationLabel = BISHOP_OPTIONS.dilation.find((o) => o.score === input.dilation)?.label;
  const effacementLabel = BISHOP_OPTIONS.effacement.find((o) => o.score === input.effacement)?.label;
  const stationLabel = BISHOP_OPTIONS.station.find((o) => o.score === input.station)?.label;
  const consistencyLabel = BISHOP_OPTIONS.consistency.find((o) => o.score === input.consistency)?.label;
  const positionLabel = BISHOP_OPTIONS.position.find((o) => o.score === input.position)?.label;

  const noteSnippet = `BISHOP SCORE: ${totalScore}/13 (${classification})
- Dilation: ${dilationLabel} (pts: ${input.dilation})
- Effacement: ${effacementLabel} (pts: ${input.effacement})
- Station: ${stationLabel} (pts: ${input.station})
- Consistency: ${consistencyLabel} (pts: ${input.consistency})
- Position: ${positionLabel} (pts: ${input.position})
- Simplified Bishop Score: ${simplifiedScore}/9
Plan: ${recommendation}`;

  return {
    totalScore,
    maxScore: 13,
    simplifiedScore,
    maxSimplifiedScore: 9,
    classification,
    interpretation,
    recommendation,
    noteSnippet,
  };
}
