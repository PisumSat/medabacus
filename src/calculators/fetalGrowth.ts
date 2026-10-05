export interface FetalBiometryInput {
  gaWeeks: number;
  gaDays: number;
  bpdMm?: number; // Biparietal diameter in mm
  hcMm?: number; // Head circumference in mm
  acMm: number; // Abdominal circumference in mm (required)
  flMm: number; // Femur length in mm (required)
}

export interface FetalGrowthResult {
  efwGrams: number;
  efwOunces: number;
  efwLbs: string;
  percentile: number;
  growthCategory: 'Severe FGR (<3%)' | 'SGA (3-9%)' | 'AGA (Normal)' | 'LGA (>90%)' | 'Macrosomia (>=4000g)';
  interpretation: string;
  recommendation: string;
  formulaUsed: string;
  noteSnippet: string;
}

export interface AmnioticFluidInput {
  measurementType: 'AFI' | 'SDP';
  valueCm: number; // Total AFI or Single Deepest Pocket
}

export interface AmnioticFluidResult {
  classification: 'Oligohydramnios' | 'Normal' | 'Polyhydramnios';
  severity?: 'Mild' | 'Moderate' | 'Severe';
  interpretation: string;
  smfmGuideline: string;
  noteSnippet: string;
}

// Normal 50th percentile weight in grams by gestational age week (Hadlock standard)
const HADLOCK_50TH_PERCENTILE: Record<number, number> = {
  24: 670,
  25: 790,
  26: 910,
  27: 1050,
  28: 1210,
  29: 1380,
  30: 1560,
  31: 1750,
  32: 1960,
  33: 2180,
  34: 2410,
  35: 2650,
  36: 2890,
  37: 3100,
  38: 3300,
  39: 3450,
  40: 3580,
  41: 3680,
  42: 3750,
};

function standardNormalCdf(x: number): number {
  // Approximation of Gaussian CDF
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

export function calculateEfw(input: FetalBiometryInput): FetalGrowthResult {
  const acCm = input.acMm / 10;
  const flCm = input.flMm / 10;
  let log10Efw: number;
  let formulaUsed = '';

  if (input.bpdMm && input.hcMm) {
    const bpdCm = input.bpdMm / 10;
    const hcCm = input.hcMm / 10;
    // Hadlock IV formula (BPD, HC, AC, FL):
    // Log10(EFW) = 1.3596 + 0.0064(HC) + 0.0424(AC) + 0.174(FL) + 0.00061(BPD*AC) - 0.00386(AC*FL)
    log10Efw =
      1.3596 +
      0.0064 * hcCm +
      0.0424 * acCm +
      0.174 * flCm +
      0.00061 * (bpdCm * acCm) -
      0.00386 * (acCm * flCm);
    formulaUsed = 'Hadlock 4 (BPD, HC, AC, FL)';
  } else {
    // Hadlock formula (AC & FL):
    // Log10(EFW) = 1.304 + 0.05281(AC) + 0.1938(FL) - 0.004(AC * FL)
    log10Efw = 1.304 + 0.05281 * acCm + 0.1938 * flCm - 0.004 * (acCm * flCm);
    formulaUsed = 'Hadlock 2 (AC, FL)';
  }

  const efwGrams = Math.round(Math.pow(10, log10Efw));
  const totalOz = efwGrams / 28.3495;
  const lbs = Math.floor(totalOz / 16);
  const remainingOz = Math.round(totalOz % 16);
  const efwLbs = `${lbs} lb ${remainingOz} oz`;

  // Calculate percentile relative to gestational age
  const gaFloat = input.gaWeeks + input.gaDays / 7;
  const clampedWeek = Math.min(42, Math.max(24, Math.round(gaFloat)));
  const medianWeight = HADLOCK_50TH_PERCENTILE[clampedWeek] || 2500;
  
  // Standard deviation in fetal weight is approximately 13% of median weight
  const sd = medianWeight * 0.13;
  const zScore = (efwGrams - medianWeight) / sd;
  const rawPercentile = Math.round(standardNormalCdf(zScore) * 100);
  const percentile = Math.min(99, Math.max(1, rawPercentile));

  let growthCategory: FetalGrowthResult['growthCategory'];
  let recommendation = '';

  if (efwGrams >= 4500 || (efwGrams >= 4000 && percentile >= 95)) {
    growthCategory = 'Macrosomia (>=4000g)';
    recommendation =
      efwGrams >= 5000 || (efwGrams >= 4500 && input.gaWeeks >= 38)
        ? 'ACOG Practice Bulletin 216: Counsel on elective cesarean delivery to reduce birth trauma and shoulder dystocia risk (threshold >=5000g in non-diabetic or >=4500g in diabetic mother).'
        : 'Monitor for prolonged second stage and shoulder dystocia. Prepare neonatal team.';
  } else if (percentile > 90) {
    growthCategory = 'LGA (>90%)';
    recommendation =
      'Large for Gestational Age (>90th percentile). Evaluate maternal glycemic control, screen for gestational diabetes if not done, and monitor clinical labor progression.';
  } else if (percentile < 3) {
    growthCategory = 'Severe FGR (<3%)';
    recommendation =
      'SMFM/ACOG FGR Guideline: EFW < 3rd percentile. Initiate weekly umbilical artery (UA) Doppler surveillance, biophysical profile (BPP) / non-stress test (NST) 1-2 times weekly, and serial ultrasound growth every 3-4 weeks. Preeclampsia workup indicated.';
  } else if (percentile < 10) {
    growthCategory = 'SGA (3-9%)';
    recommendation =
      'Small for Gestational Age (3rd - 9th percentile). Evaluate UA Doppler pulsatility index. If Dopplers remain normal and fluid is adequate, repeat growth scan in 3 weeks.';
  } else {
    growthCategory = 'AGA (Normal)';
    recommendation = 'Appropriate for Gestational Age (10th - 90th percentile). Routine antenatal care.';
  }

  const interpretation = `EFW: ${efwGrams} g (${efwLbs}), estimating at the ${percentile}th percentile for ${input.gaWeeks}+${input.gaDays} weeks (${growthCategory}).`;

  const noteSnippet = `FETAL BIOMETRY & EFW (${formulaUsed}):
- Gestational Age: ${input.gaWeeks}+${input.gaDays} weeks
- Measurements: AC ${input.acMm} mm, FL ${input.flMm} mm${input.bpdMm ? `, BPD ${input.bpdMm} mm, HC ${input.hcMm} mm` : ''}
- EFW: ${efwGrams} g (${efwLbs}) -> ${percentile}th percentile (${growthCategory})
Assessment & Plan: ${recommendation}`;

  return {
    efwGrams,
    efwOunces: Math.round(totalOz),
    efwLbs,
    percentile,
    growthCategory,
    interpretation,
    recommendation,
    formulaUsed,
    noteSnippet,
  };
}

export function evaluateAmnioticFluid(input: AmnioticFluidInput): AmnioticFluidResult {
  const smfmGuideline =
    'SMFM Consult Series #38: Single Deepest Pocket (SDP) is preferred over AFI for the diagnosis of oligohydramnios because AFI results in more frequent over-diagnosis, labor inductions, and cesarean deliveries without improving perinatal outcomes.';

  if (input.measurementType === 'AFI') {
    if (input.valueCm < 5.0) {
      return {
        classification: 'Oligohydramnios',
        interpretation: `AFI ${input.valueCm.toFixed(1)} cm (< 5.0 cm) defines Oligohydramnios.`,
        smfmGuideline,
        noteSnippet: `Amniotic Fluid Index (AFI): ${input.valueCm.toFixed(1)} cm -> Oligohydramnios (<5.0 cm). Indication for fetal surveillance (NST/BPP) and evaluation for membrane rupture or uteroplacental insufficiency.`,
      };
    }
    if (input.valueCm > 24.0) {
      const severity = input.valueCm >= 35.0 ? 'Severe' : input.valueCm >= 30.0 ? 'Moderate' : 'Mild';
      return {
        classification: 'Polyhydramnios',
        severity,
        interpretation: `AFI ${input.valueCm.toFixed(1)} cm (> 24.0 cm) defines Polyhydramnios (${severity}).`,
        smfmGuideline,
        noteSnippet: `Amniotic Fluid Index (AFI): ${input.valueCm.toFixed(1)} cm -> ${severity} Polyhydramnios (>24.0 cm). Evaluate for maternal diabetes, fetal structural/GI anomalies, and risk of malpresentation/cord prolapse upon membrane rupture.`,
      };
    }
    return {
      classification: 'Normal',
      interpretation: `AFI ${input.valueCm.toFixed(1)} cm is within normal limits (5.0 - 24.0 cm).`,
      smfmGuideline,
      noteSnippet: `Amniotic Fluid Index (AFI): ${input.valueCm.toFixed(1)} cm -> Normal amniotic fluid volume.`,
    };
  }

  // SDP / MVP
  if (input.valueCm < 2.0) {
    return {
      classification: 'Oligohydramnios',
      interpretation: `Single Deepest Pocket (SDP) ${input.valueCm.toFixed(1)} cm (< 2.0 cm) defines Oligohydramnios.`,
      smfmGuideline,
      noteSnippet: `Single Deepest Pocket (SDP): ${input.valueCm.toFixed(1)} cm -> Oligohydramnios (<2.0 cm). Comprehensive fetal surveillance indicated.`,
    };
  }
  if (input.valueCm > 8.0) {
    return {
      classification: 'Polyhydramnios',
      interpretation: `Single Deepest Pocket (SDP) ${input.valueCm.toFixed(1)} cm (> 8.0 cm) defines Polyhydramnios.`,
      smfmGuideline,
      noteSnippet: `Single Deepest Pocket (SDP): ${input.valueCm.toFixed(1)} cm -> Polyhydramnios (>8.0 cm). Workup for maternal diabetes and fetal anomalies recommended.`,
    };
  }
  return {
    classification: 'Normal',
    interpretation: `Single Deepest Pocket (SDP) ${input.valueCm.toFixed(1)} cm is normal (2.0 - 8.0 cm).`,
    smfmGuideline,
    noteSnippet: `Single Deepest Pocket (SDP): ${input.valueCm.toFixed(1)} cm -> Normal volume.`,
  };
}
