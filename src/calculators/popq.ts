export interface PopqGridInput {
  aa: number; // -3 to +3 cm
  ba: number; // -3 to +tvl cm
  c: number;  // -tvl to +tvl cm
  gh: number; // positive cm (e.g. 2 to 6)
  pb: number; // positive cm (e.g. 2 to 5)
  tvl: number; // positive cm (e.g. 7 to 11)
  ap: number; // -3 to +3 cm
  bp: number; // -3 to +tvl cm
  d?: number; // posterior fornix (optional if hysterectomy)
  hasHysterectomy?: boolean;
}

export interface PopqResult {
  stage: 'Stage 0' | 'Stage I' | 'Stage II' | 'Stage III' | 'Stage IV';
  stageDescription: string;
  leadingEdge: {
    point: string;
    valueCm: number;
    compartment: 'Anterior (Cystocele)' | 'Apical (Uterine / Vaginal Vault)' | 'Posterior (Rectocele)';
  };
  grid3x3: {
    row1: [number, number, number | string];
    row2: [number, number, number];
    row3: [number, number, number | string];
  };
  clinicalRecommendation: string;
  noteSnippet: string;
}

export function calculatePopqStage(input: PopqGridInput): PopqResult {
  const tvl = Math.max(1, input.tvl);
  const aa = input.aa;
  const ba = input.ba;
  const c = input.c;
  const ap = input.ap;
  const bp = input.bp;
  const d = input.hasHysterectomy ? undefined : input.d;

  // Find the leading edge (most positive point among prolapse measures)
  const prolapsePoints: { name: string; val: number; comp: 'Anterior (Cystocele)' | 'Apical (Uterine / Vaginal Vault)' | 'Posterior (Rectocele)' }[] = [
    { name: 'Aa', val: aa, comp: 'Anterior (Cystocele)' },
    { name: 'Ba', val: ba, comp: 'Anterior (Cystocele)' },
    { name: 'C', val: c, comp: 'Apical (Uterine / Vaginal Vault)' },
    { name: 'Ap', val: ap, comp: 'Posterior (Rectocele)' },
    { name: 'Bp', val: bp, comp: 'Posterior (Rectocele)' },
  ];

  if (d !== undefined) {
    prolapsePoints.push({ name: 'D', val: d, comp: 'Apical (Uterine / Vaginal Vault)' });
  }

  let leadingPoint = prolapsePoints[0];
  for (const pt of prolapsePoints) {
    if (pt.val > leadingPoint.val) {
      leadingPoint = pt;
    }
  }

  const maxVal = leadingPoint.val;
  let stage: PopqResult['stage'];
  let stageDescription = '';

  // ICS Staging Criteria
  // Stage 0: Aa = -3, Ba = -3, Ap = -3, Bp = -3, and C or D <= -(tvl - 2)
  const isStage0 =
    aa === -3 &&
    ba === -3 &&
    ap === -3 &&
    bp === -3 &&
    c <= -(tvl - 2) &&
    (d === undefined || d <= -(tvl - 2));

  if (isStage0) {
    stage = 'Stage 0';
    stageDescription = 'No prolapse demonstrated. All points are at normal anatomical positions.';
  } else if (maxVal < -1) {
    // Stage I: Criteria for Stage 0 not met, but most distal point is > 1 cm above the hymen
    stage = 'Stage I';
    stageDescription = 'Most distal portion of prolapse is > 1 cm above the hymen (leading point < -1 cm). Mild prolapse.';
  } else if (maxVal >= -1 && maxVal <= 1) {
    // Stage II: Most distal portion is between 1 cm above and 1 cm below the hymen
    stage = 'Stage II';
    stageDescription = 'Most distal portion of prolapse is within 1 cm of the hymen (-1 cm to +1 cm). Moderate prolapse.';
  } else if (maxVal > 1 && maxVal < tvl - 2) {
    // Stage III: Most distal portion is > 1 cm beyond hymen, but <= (tvl - 2) cm
    stage = 'Stage III';
    stageDescription = `Most distal portion of prolapse is > 1 cm beyond the hymen, but does not exceed (tvl - 2 cm = ${tvl - 2} cm). Severe prolapse.`;
  } else {
    // Stage IV: Complete eversion / procidentia (>= tvl - 2 cm)
    stage = 'Stage IV';
    stageDescription = `Complete eversion of lower genital tract (leading edge >= tvl - 2 cm). Procidentia.`;
  }

  let clinicalRecommendation = '';
  if (stage === 'Stage 0' || stage === 'Stage I') {
    clinicalRecommendation = 'Expectant management / watchful waiting. Pelvic floor physical therapy (Kegel exercises) and lifestyle modifications (weight loss, constipation management).';
  } else if (stage === 'Stage II') {
    clinicalRecommendation = 'Symptomatic management. Trial of vaginal pessary (ring or Gellhorn) vs pelvic floor muscle training. Surgical options if conservative therapy fails or patient prefers.';
  } else {
    clinicalRecommendation = 'Significant prolapse. Discuss non-surgical (pessary fitting) vs definitive surgical reconstruction (e.g. sacrocolpopexy, uterosacral ligament suspension, colpocleisis if not sexually active).';
  }

  const grid3x3: PopqResult['grid3x3'] = {
    row1: [aa, ba, input.hasHysterectomy ? 'N/A' : c],
    row2: [input.gh, input.pb, tvl],
    row3: [ap, bp, input.hasHysterectomy ? 'N/A' : (d ?? 'N/A')],
  };

  const noteSnippet = `POP-Q EXAMINATION (ICS Classification): ${stage}
3x3 Grid (cm):
[ Aa: ${aa >= 0 ? '+' : ''}${aa} | Ba: ${ba >= 0 ? '+' : ''}${ba} | C: ${c >= 0 ? '+' : ''}${c} ]
[ gh: ${input.gh} | pb: ${input.pb} | tvl: ${tvl} ]
[ Ap: ${ap >= 0 ? '+' : ''}${ap} | Bp: ${bp >= 0 ? '+' : ''}${bp} | D: ${d !== undefined ? (d >= 0 ? '+' : '') + d : 'N/A'} ]
- Leading Edge: Point ${leadingPoint.name} (${leadingPoint.val >= 0 ? '+' : ''}${leadingPoint.val} cm) in the ${leadingPoint.comp}
- Plan: ${clinicalRecommendation}`;

  return {
    stage,
    stageDescription,
    leadingEdge: {
      point: leadingPoint.name,
      valueCm: leadingPoint.val,
      compartment: leadingPoint.comp,
    },
    grid3x3,
    clinicalRecommendation,
    noteSnippet,
  };
}
