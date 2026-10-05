export interface RmiInput {
  ca125Units: number; // Serum CA-125 in U/mL
  isPostmenopausal: boolean;
  hasMultilocularCyst: boolean;
  hasSolidAreas: boolean;
  hasBilateralLesions: boolean;
  hasAscites: boolean;
  hasIntraAbdominalMetastases: boolean;
}

export interface RmiResult {
  rmiScore: number;
  riskCategory: 'High Risk (> 200)' | 'Low / Moderate Risk (<= 200)';
  ultrasoundScoreU: number;
  menopausalScoreM: number;
  featureCount: number;
  sensitivitySpecificity: string;
  recommendation: string;
  noteSnippet: string;
}

export const ORADS_LEVELS = [
  {
    level: 'O-RADS 1',
    category: 'Normal Ovary',
    malignancyRisk: '< 1%',
    management: 'No follow-up needed in premenopausal women (follicle or corpus luteum <= 3 cm).',
  },
  {
    level: 'O-RADS 2',
    category: 'Almost Certainly Benign',
    malignancyRisk: '< 1%',
    management: 'Conservative management; ultrasound follow-up in 8-12 weeks if hemorrhagic cyst, or 1 year if dermoid/endometrioma.',
  },
  {
    level: 'O-RADS 3',
    category: 'Low Risk of Malignancy',
    malignancyRisk: '1% to < 10%',
    management: 'Management by general gynecologist or ultrasound specialist. Consider pelvic MRI or surgical excision.',
  },
  {
    level: 'O-RADS 4',
    category: 'Intermediate Risk',
    malignancyRisk: '10% to < 50%',
    management: 'Referral to Gynecologic Oncologist or pelvic MRI for characterization. High index of suspicion.',
  },
  {
    level: 'O-RADS 5',
    category: 'High Risk of Malignancy',
    malignancyRisk: '>= 50%',
    management: 'Urgent referral to Gynecologic Oncology for staging and comprehensive surgical management.',
  },
];

export function calculateRmi(input: RmiInput): RmiResult {
  let featureCount = 0;
  if (input.hasMultilocularCyst) featureCount++;
  if (input.hasSolidAreas) featureCount++;
  if (input.hasBilateralLesions) featureCount++;
  if (input.hasAscites) featureCount++;
  if (input.hasIntraAbdominalMetastases) featureCount++;

  let u = 0;
  if (featureCount === 0) u = 0;
  else if (featureCount === 1) u = 1;
  else u = 3;

  const m = input.isPostmenopausal ? 3 : 1;
  const rmiScore = Math.round(u * m * input.ca125Units);

  const isHighRisk = rmiScore > 200;
  const riskCategory: RmiResult['riskCategory'] = isHighRisk ? 'High Risk (> 200)' : 'Low / Moderate Risk (<= 200)';

  let recommendation = '';
  if (isHighRisk) {
    recommendation =
      'RCOG / NICE Guidelines: RMI score > 200 carries a high risk of ovarian malignancy (sensitivity ~85%, specificity ~97%). Prompt referral to a multidisciplinary Gynecologic Oncology team for CT staging and primary cytoreductive surgery.';
  } else {
    recommendation =
      'RMI score <= 200. Lower risk of malignancy. Conservative follow-up or primary surgical intervention by a general obstetrician/gynecologist (e.g. laparoscopic cystectomy / salpingo-oophorectomy) is appropriate.';
  }

  const sensitivitySpecificity = 'At cutoff 200: Sensitivity 85.4%, Specificity 96.9%';

  const noteSnippet = `OVARIAN MASS EVALUATION (RMI I & O-RADS):
- Serum CA-125: ${input.ca125Units} U/mL
- Menopausal Status: ${input.isPostmenopausal ? 'Postmenopausal (M=3)' : 'Premenopausal (M=1)'}
- US Features (${featureCount}/5): ${[
    input.hasMultilocularCyst ? 'Multilocular' : null,
    input.hasSolidAreas ? 'Solid areas' : null,
    input.hasBilateralLesions ? 'Bilateral' : null,
    input.hasAscites ? 'Ascites' : null,
    input.hasIntraAbdominalMetastases ? 'Metastases' : null,
  ]
    .filter(Boolean)
    .join(', ') || 'None (U=0)'} -> U = ${u}
- RMI Score: ${rmiScore} (${riskCategory})
Plan: ${recommendation}`;

  return {
    rmiScore,
    riskCategory,
    ultrasoundScoreU: u,
    menopausalScoreM: m,
    featureCount,
    sensitivitySpecificity,
    recommendation,
    noteSnippet,
  };
}
