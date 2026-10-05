/**
 * Internal Medicine Expanded Clinical Calculation Engines
 * Reputable References: AHA/ACC, ESC, KDIGO, ATS/IDSA, CHEST, AASLD, Sepsis-3, WHO.
 */

// ==========================================
// 1. CARDIOLOGY SUITE
// ==========================================

export interface TimiNstemiInput {
  age65Plus: boolean;
  threeCadRiskFactors: boolean; // HTN, DM, Dyslipidemia, Smoking, Family Hx
  knownCadGt50: boolean;
  aspirinPast7Days: boolean;
  severeAnginaPast24h: boolean; // >=2 episodes in 24h
  stSegmentDeviation: boolean; // ST deviation >= 0.5mm
  elevatedCardiacMarkers: boolean;
}

export interface TimiResult {
  score: number;
  riskTier: 'Low' | 'Intermediate' | 'High';
  fourteenDayMacePercent: number; // 14-day risk of all-cause mortality, new/recurrent MI, or urgent revascularization
  recommendation: string;
}

export function calculateTimiNstemi(input: TimiNstemiInput): TimiResult {
  let score = 0;
  if (input.age65Plus) score += 1;
  if (input.threeCadRiskFactors) score += 1;
  if (input.knownCadGt50) score += 1;
  if (input.aspirinPast7Days) score += 1;
  if (input.severeAnginaPast24h) score += 1;
  if (input.stSegmentDeviation) score += 1;
  if (input.elevatedCardiacMarkers) score += 1;

  const maceMap: Record<number, number> = {
    0: 4.7,
    1: 4.7,
    2: 8.3,
    3: 13.2,
    4: 19.9,
    5: 26.2,
    6: 40.9,
    7: 40.9,
  };

  const fourteenDayMacePercent = maceMap[score] ?? 40.9;
  let riskTier: 'Low' | 'Intermediate' | 'High' = 'Low';
  let recommendation = '';

  if (score <= 2) {
    riskTier = 'Low';
    recommendation = 'Low risk (4.7–8.3% 14-day MACE). Early conservative strategy or selective invasive angiography reasonable.';
  } else if (score <= 4) {
    riskTier = 'Intermediate';
    recommendation = 'Intermediate risk (13.2–19.9% 14-day MACE). Benefit demonstrated with early invasive strategy (cardiac catheterization within 24–48 hours).';
  } else {
    riskTier = 'High';
    recommendation = 'High risk (26.2–40.9% 14-day MACE). Urgent early invasive catheterization (<24h) and dual antiplatelet therapy recommended.';
  }

  return { score, riskTier, fourteenDayMacePercent, recommendation };
}

export interface HeartScoreInput {
  history: 0 | 1 | 2; // 0: slightly, 1: moderately, 2: highly suspicious
  ecg: 0 | 1 | 2; // 0: normal, 1: non-specific repolarization, 2: significant ST depression
  age: number; // <45: 0, 45-64: 1, >=65: 2
  riskFactors: 0 | 1 | 2; // 0: no risk factors, 1: 1-2 risk factors, 2: >=3 risk factors or known atherosclerotic disease
  troponin: 0 | 1 | 2; // 0: <= normal limit, 1: 1-2x normal, 2: >2x normal
}

export interface HeartScoreResult {
  score: number;
  riskCategory: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  sixWeekMacePercent: number;
  management: string;
}

export function calculateHeartScore(input: HeartScoreInput): HeartScoreResult {
  let agePoints: 0 | 1 | 2 = 0;
  if (input.age >= 65) agePoints = 2;
  else if (input.age >= 45) agePoints = 1;

  const score = input.history + input.ecg + agePoints + input.riskFactors + input.troponin;

  if (score <= 3) {
    return {
      score,
      riskCategory: 'Low Risk',
      sixWeekMacePercent: 1.7,
      management: '0.9%–1.7% 6-week risk of MACE. Candidate for early discharge with outpatient follow-up without inpatient admission.',
    };
  } else if (score <= 6) {
    return {
      score,
      riskCategory: 'Moderate Risk',
      sixWeekMacePercent: 16.6,
      management: '12%–16.6% 6-week risk of MACE. Inpatient admission or observation unit for serial troponins and provocative/anatomic testing.',
    };
  } else {
    return {
      score,
      riskCategory: 'High Risk',
      sixWeekMacePercent: 50.1,
      management: '50%–65% 6-week risk of MACE. Urgent invasive cardiology consultation, aggressive medical therapy, and coronary angiography.',
    };
  }
}

export function calculateKillipClass(findings: {
  hasRales: boolean;
  hasThirdHeartSound: boolean; // S3 gallop
  hasPulmonaryEdema: boolean;
  hasCardiogenicShock: boolean; // SBP < 90 with oliguria, cyanosis
}): { killipClass: 'I' | 'II' | 'III' | 'IV'; mortalityPercent: number; description: string } {
  if (findings.hasCardiogenicShock) {
    return { killipClass: 'IV', mortalityPercent: 81, description: 'Cardiogenic shock with SBP < 90 mmHg and peripheral vasoconstriction/hypoperfusion.' };
  }
  if (findings.hasPulmonaryEdema) {
    return { killipClass: 'III', mortalityPercent: 38, description: 'Frank severe pulmonary edema (diffuse bilateral crackles throughout lung fields).' };
  }
  if (findings.hasRales || findings.hasThirdHeartSound) {
    return { killipClass: 'II', mortalityPercent: 17, description: 'Mild-to-moderate heart failure: basilar rales (<50% lung fields) and/or S3 gallop.' };
  }
  return { killipClass: 'I', mortalityPercent: 6, description: 'No signs of congestive heart failure or pulmonary congestion on physical exam.' };
}

export function calculateQtc(qtMs: number, heartRateBpm: number): {
  bazettMs: number;
  fridericiaMs: number;
  isProlongedMale: boolean;
  isProlongedFemale: boolean;
  interpretation: string;
} {
  const rrSeconds = 60 / Math.max(1, heartRateBpm);
  const bazettMs = Math.round(qtMs / Math.sqrt(rrSeconds));
  const fridericiaMs = Math.round(qtMs / Math.cbrt(rrSeconds));

  const isProlongedMale = fridericiaMs > 450;
  const isProlongedFemale = fridericiaMs > 460;
  const isSevere = fridericiaMs > 500;

  let interpretation = 'Normal QTc interval.';
  if (isSevere) {
    interpretation = 'Markedly prolonged QTc (>500 ms). High risk for Torsades de Pointes; discontinue QT-prolonging drugs & correct electrolytes.';
  } else if (isProlongedMale || isProlongedFemale) {
    interpretation = 'Borderline / prolonged QTc. Monitor electrolytes (K+ > 4.0, Mg2+ > 2.0) and avoid concomitant QT-prolonging medications.';
  }

  return { bazettMs, fridericiaMs, isProlongedMale, isProlongedFemale, interpretation };
}

// ==========================================
// 2. CRITICAL CARE & PULMONOLOGY SUITE
// ==========================================

export interface SofaInput {
  pao2Fio2Ratio: number; // PaO2 in mmHg / FiO2 (e.g. 100/0.4 = 250)
  onMechanicalVentilation: boolean;
  platelets: number; // x10^3/uL
  bilirubinMgDl: number;
  meanArterialPressure: number; // MAP mmHg
  vasopressor: 'none' | 'dopamine_low_dobutamine' | 'dopamine_med_norepi_low' | 'dopamine_high_norepi_high';
  gcsScore: number; // 3-15
  creatinineMgDl: number;
  urineOutputMlDay?: number;
}

export function calculateSofaScore(input: SofaInput): {
  totalScore: number;
  mortalityEstimate: string;
  organScores: { resp: number; coag: number; liver: number; cv: number; cns: number; renal: number };
} {
  let resp = 0;
  if (input.pao2Fio2Ratio < 100 && input.onMechanicalVentilation) resp = 4;
  else if (input.pao2Fio2Ratio < 200 && input.onMechanicalVentilation) resp = 3;
  else if (input.pao2Fio2Ratio < 300) resp = 2;
  else if (input.pao2Fio2Ratio < 400) resp = 1;

  let coag = 0;
  if (input.platelets < 20) coag = 4;
  else if (input.platelets < 50) coag = 3;
  else if (input.platelets < 100) coag = 2;
  else if (input.platelets < 150) coag = 1;

  let liver = 0;
  if (input.bilirubinMgDl >= 12.0) liver = 4;
  else if (input.bilirubinMgDl >= 6.0) liver = 3;
  else if (input.bilirubinMgDl >= 2.0) liver = 2;
  else if (input.bilirubinMgDl >= 1.2) liver = 1;

  let cv = 0;
  if (input.vasopressor === 'dopamine_high_norepi_high') cv = 4;
  else if (input.vasopressor === 'dopamine_med_norepi_low') cv = 3;
  else if (input.vasopressor === 'dopamine_low_dobutamine') cv = 2;
  else if (input.meanArterialPressure < 70) cv = 1;

  let cns = 0;
  if (input.gcsScore < 6) cns = 4;
  else if (input.gcsScore <= 9) cns = 3;
  else if (input.gcsScore <= 12) cns = 2;
  else if (input.gcsScore <= 14) cns = 1;

  let renal = 0;
  if (input.creatinineMgDl >= 5.0 || (input.urineOutputMlDay !== undefined && input.urineOutputMlDay < 200)) renal = 4;
  else if (input.creatinineMgDl >= 3.5 || (input.urineOutputMlDay !== undefined && input.urineOutputMlDay < 500)) renal = 3;
  else if (input.creatinineMgDl >= 2.0) renal = 2;
  else if (input.creatinineMgDl >= 1.2) renal = 1;

  const totalScore = resp + coag + liver + cv + cns + renal;
  let mortalityEstimate = '<10% in-hospital mortality';
  if (totalScore >= 15) mortalityEstimate = '>80% in-hospital mortality';
  else if (totalScore >= 12) mortalityEstimate = '40–50% in-hospital mortality';
  else if (totalScore >= 9) mortalityEstimate = '15–33% in-hospital mortality';
  else if (totalScore >= 6) mortalityEstimate = '<15% in-hospital mortality';

  return {
    totalScore,
    mortalityEstimate,
    organScores: { resp, coag, liver, cv, cns, renal },
  };
}

export function calculateQsofa(input: { rrGte22: boolean; sbpLte100: boolean; alteredMentalStatus: boolean }): {
  score: number;
  isPositive: boolean;
  recommendation: string;
} {
  let score = 0;
  if (input.rrGte22) score += 1;
  if (input.sbpLte100) score += 1;
  if (input.alteredMentalStatus) score += 1;

  const isPositive = score >= 2;
  const recommendation = isPositive
    ? 'qSOFA ≥ 2: High risk for poor outcomes / prolonged ICU stay. Screen for organ dysfunction (full SOFA), obtain lactate, blood cultures, and initiate Sepsis Hour-1 bundle.'
    : 'qSOFA < 2: Low immediate risk on bedside screen, but continue clinical monitoring if infection is suspected.';

  return { score, isPositive, recommendation };
}

export function evaluateLightsCriteria(input: {
  pleuralProtein: number;
  serumProtein: number;
  pleuralLdh: number;
  serumLdh: number;
  serumLdhUpperLimitNormal: number;
}): {
  isExudate: boolean;
  criteriaMet: string[];
  classification: 'Exudative Effusion' | 'Transudative Effusion';
  workup: string;
} {
  const ratioProtein = input.serumProtein > 0 ? input.pleuralProtein / input.serumProtein : 0;
  const ratioLdh = input.serumLdh > 0 ? input.pleuralLdh / input.serumLdh : 0;
  const ldhTwoThirdsUln = (2 / 3) * input.serumLdhUpperLimitNormal;
  const ldhExceedsTwoThirds = input.pleuralLdh > ldhTwoThirdsUln;

  const criteriaMet: string[] = [];
  if (ratioProtein > 0.5) criteriaMet.push(`Pleural/Serum Protein > 0.5 (${ratioProtein.toFixed(2)})`);
  if (ratioLdh > 0.6) criteriaMet.push(`Pleural/Serum LDH > 0.6 (${ratioLdh.toFixed(2)})`);
  if (ldhExceedsTwoThirds) criteriaMet.push(`Pleural LDH > 2/3 ULN (${input.pleuralLdh} > ${ldhTwoThirdsUln.toFixed(1)})`);

  const isExudate = criteriaMet.length > 0;
  const classification = isExudate ? 'Exudative Effusion' : 'Transudative Effusion';
  const workup = isExudate
    ? 'Exudative: Investigate local causes (pneumonia/parapneumonic, malignancy, pulmonary embolism, tuberculosis, connective tissue disease).'
    : 'Transudative: Suggests systemic hydrostatic/oncotic imbalance (congestive heart failure, cirrhosis with hepatic hydrothorax, nephrotic syndrome).';

  return { isExudate, criteriaMet, classification, workup };
}

export function evaluateBerlinArds(input: {
  timingWithin7Days: boolean;
  bilateralOpacitiesOnImaging: boolean;
  edemaNotFullyExplainedByHf: boolean;
  pao2Fio2Ratio: number;
  peepCmH2o: number; // >= 5 required
}): {
  isArds: boolean;
  severity: 'None' | 'Mild ARDS' | 'Moderate ARDS' | 'Severe ARDS';
  mortality: string;
  recommendation: string;
} {
  if (!input.timingWithin7Days || !input.bilateralOpacitiesOnImaging || !input.edemaNotFullyExplainedByHf || input.peepCmH2o < 5) {
    return {
      isArds: false,
      severity: 'None',
      mortality: 'N/A',
      recommendation: 'Does not meet complete Berlin 2012 criteria for ARDS (requires timing ≤7d, bilateral infiltrates, non-cardiogenic etiology, and PEEP ≥5 cmH2O).',
    };
  }

  if (input.pao2Fio2Ratio <= 100) {
    return {
      isArds: true,
      severity: 'Severe ARDS',
      mortality: '45% hospital mortality',
      recommendation: 'Severe ARDS (PaO2/FiO2 ≤ 100). Lung-protective ventilation 4–6 mL/kg PBW, prone positioning (≥16h/day), consider neuromuscular blockade and ECMO evaluation.',
    };
  } else if (input.pao2Fio2Ratio <= 200) {
    return {
      isArds: true,
      severity: 'Moderate ARDS',
      mortality: '32% hospital mortality',
      recommendation: 'Moderate ARDS (PaO2/FiO2 101–200). 6 mL/kg PBW ventilation, plateau pressure <30 cmH2O, high PEEP strategy, consider prone positioning.',
    };
  } else if (input.pao2Fio2Ratio <= 300) {
    return {
      isArds: true,
      severity: 'Mild ARDS',
      mortality: '27% hospital mortality',
      recommendation: 'Mild ARDS (PaO2/FiO2 201–300). Low tidal volume ventilation 6 mL/kg PBW, conservative fluid management.',
    };
  }

  return {
    isArds: false,
    severity: 'None',
    mortality: 'N/A',
    recommendation: 'PaO2/FiO2 > 300 mmHg does not qualify as ARDS.',
  };
}

export function calculateAaGradient(input: {
  ageYears: number;
  pao2MmHg: number;
  paco2MmHg: number;
  fio2Percent: number; // e.g. 21 for room air
  barometricPressure?: number; // default 760 mmHg sea level
}): {
  calculatedPao2Alveolar: number;
  aaGradientMmHg: number;
  expectedGradientForAge: number;
  isElevated: boolean;
  interpretation: string;
} {
  const patm = input.barometricPressure ?? 760;
  const pWater = 47;
  const fio2 = input.fio2Percent / 100;
  const respiratoryQuotient = 0.8;

  const calculatedPao2Alveolar = Math.round(fio2 * (patm - pWater) - input.paco2MmHg / respiratoryQuotient);
  const aaGradientMmHg = Math.max(0, Math.round(calculatedPao2Alveolar - input.pao2MmHg));
  const expectedGradientForAge = Math.round(input.ageYears / 4 + 4);
  const isElevated = aaGradientMmHg > expectedGradientForAge;

  const interpretation = isElevated
    ? `A-a gradient is elevated (${aaGradientMmHg} mmHg vs expected ≤ ${expectedGradientForAge} mmHg). Suggests V/Q mismatch, right-to-left shunt, or diffusion impairment (e.g. PE, pneumonia, ARDS, pulmonary edema).`
    : `A-a gradient is normal (${aaGradientMmHg} mmHg). Hypoxemia is primarily caused by hypoventilation (CNS depression/narcotics, neuromuscular) or low inspired FiO2.`;

  return { calculatedPao2Alveolar, aaGradientMmHg, expectedGradientForAge, isElevated, interpretation };
}

// ==========================================
// 3. NEPHROLOGY & ACID-BASE SUITE
// ==========================================

export function calculateFena(input: {
  urinarySodiumMeqL: number;
  serumSodiumMeqL: number;
  urinaryCreatinineMgDl: number;
  serumCreatinineMgDl: number;
}): {
  fenaPercent: number;
  etiology: 'Prerenal Azotemia' | 'Intrinsic Renal (ATN)' | 'Intermediate / Indeterminate';
  interpretation: string;
} {
  const numerator = input.urinarySodiumMeqL * input.serumCreatinineMgDl;
  const denominator = input.serumSodiumMeqL * input.urinaryCreatinineMgDl;
  const fenaPercent = denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(2)) : 0;

  if (fenaPercent < 1.0) {
    return {
      fenaPercent,
      etiology: 'Prerenal Azotemia',
      interpretation: 'FENa < 1%: Avid renal tubular sodium reabsorption. Consistent with prerenal hypoperfusion / dehydration (or acute glomerulonephritis / contrast nephropathy).',
    };
  } else if (fenaPercent > 2.0) {
    return {
      fenaPercent,
      etiology: 'Intrinsic Renal (ATN)',
      interpretation: 'FENa > 2%: Tubular injury with impaired sodium reabsorption. Consistent with acute tubular necrosis (ATN) or post-renal obstruction.',
    };
  } else {
    return {
      fenaPercent,
      etiology: 'Intermediate / Indeterminate',
      interpretation: 'FENa 1.0%–2.0%: Indeterminate zone. Correlate with clinical history, urine sediment, or consider FEUrea if patient is taking diuretics.',
    };
  }
}

export function calculateFeUrea(input: {
  urinaryUreaMgDl: number;
  bloodUreaNitrogenMgDl: number;
  urinaryCreatinineMgDl: number;
  serumCreatinineMgDl: number;
}): {
  feUreaPercent: number;
  isPrerenalWithDiuretics: boolean;
  interpretation: string;
} {
  const numerator = input.urinaryUreaMgDl * input.serumCreatinineMgDl;
  const denominator = input.bloodUreaNitrogenMgDl * input.urinaryCreatinineMgDl;
  const feUreaPercent = denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(1)) : 0;

  const isPrerenalWithDiuretics = feUreaPercent < 35.0;
  const interpretation = isPrerenalWithDiuretics
    ? 'FEUrea < 35%: Indicates prerenal azotemia, especially valuable when loop/thiazide diuretics invalidate FENa.'
    : 'FEUrea ≥ 35%: Favors acute tubular necrosis (intrinsic renal injury) rather than pure volume depletion.';

  return { feUreaPercent, isPrerenalWithDiuretics, interpretation };
}

export function calculateWintersFormula(bicarbonateMeqL: number): {
  expectedPaco2: number;
  paco2RangeMin: number;
  paco2RangeMax: number;
  interpretationForActualPaco2: (actualPaco2: number) => string;
} {
  const expectedPaco2 = Number((1.5 * bicarbonateMeqL + 8).toFixed(1));
  const paco2RangeMin = Number((expectedPaco2 - 2).toFixed(1));
  const paco2RangeMax = Number((expectedPaco2 + 2).toFixed(1));

  const interpretationForActualPaco2 = (actualPaco2: number) => {
    if (actualPaco2 < paco2RangeMin) {
      return `Actual PaCO2 (${actualPaco2}) < expected range (${paco2RangeMin}–${paco2RangeMax}): Concurrent primary respiratory alkalosis.`;
    } else if (actualPaco2 > paco2RangeMax) {
      return `Actual PaCO2 (${actualPaco2}) > expected range (${paco2RangeMin}–${paco2RangeMax}): Concurrent primary respiratory acidosis (hypoventilation/failure).`;
    }
    return `Actual PaCO2 (${actualPaco2}) within expected range (${paco2RangeMin}–${paco2RangeMax}): Appropriate respiratory compensation for metabolic acidosis.`;
  };

  return { expectedPaco2, paco2RangeMin, paco2RangeMax, interpretationForActualPaco2 };
}

export function calculateFreeWaterDeficit(input: {
  serumSodiumMeqL: number;
  weightKg: number;
  sex: 'male' | 'female';
  isElderly?: boolean;
}): {
  totalBodyWaterLiters: number;
  waterDeficitLiters: number;
  targetMaxDailyReductionMeqL: number;
  recommendation: string;
} {
  let tbwFraction = input.sex === 'male' ? 0.6 : 0.5;
  if (input.isElderly) tbwFraction -= 0.05;

  const totalBodyWaterLiters = Number((input.weightKg * tbwFraction).toFixed(1));
  const waterDeficitLiters = Number(Math.max(0, totalBodyWaterLiters * (input.serumSodiumMeqL / 140 - 1)).toFixed(2));
  const targetMaxDailyReductionMeqL = 8;

  const recommendation = `Free water deficit is ${waterDeficitLiters} L. Correct gradually (target reduction ≤ 8–10 mEq/L in 24h) to avoid cerebral edema. Add ongoing insensible and urinary free water losses.`;

  return { totalBodyWaterLiters, waterDeficitLiters, targetMaxDailyReductionMeqL, recommendation };
}

export function calculateCorrectedCalcium(totalCalciumMgDl: number, serumAlbuminGDl: number): {
  correctedCalciumMgDl: number;
  isHypocalcemic: boolean;
  isHypercalcemic: boolean;
  status: string;
} {
  const correctedCalciumMgDl = Number((totalCalciumMgDl + 0.8 * (4.0 - serumAlbuminGDl)).toFixed(2));
  const isHypocalcemic = correctedCalciumMgDl < 8.5;
  const isHypercalcemic = correctedCalciumMgDl > 10.2;

  let status = 'Normal corrected calcium (8.5–10.2 mg/dL)';
  if (isHypocalcemic) status = 'Hypocalcemia (Corrected Ca < 8.5 mg/dL)';
  else if (isHypercalcemic) status = 'Hypercalcemia (Corrected Ca > 10.2 mg/dL)';

  return { correctedCalciumMgDl, isHypocalcemic, isHypercalcemic, status };
}

// ==========================================
// 4. GASTROENTEROLOGY & HEPATOLOGY SUITE
// ==========================================

export function calculateBisapScore(input: {
  bunGt25: boolean;
  impairedMentalStatus: boolean;
  sirsCriteriaGte2: boolean;
  ageGt60: boolean;
  pleuralEffusionPresent: boolean;
}): {
  score: number;
  mortalityRisk: string;
  recommendation: string;
} {
  let score = 0;
  if (input.bunGt25) score += 1;
  if (input.impairedMentalStatus) score += 1;
  if (input.sirsCriteriaGte2) score += 1;
  if (input.ageGt60) score += 1;
  if (input.pleuralEffusionPresent) score += 1;

  let mortalityRisk = '<1% mortality';
  let recommendation = 'Low risk for severe pancreatitis. Inpatient floor care with supportive hydration.';
  if (score >= 4) {
    mortalityRisk = '18–27% mortality';
    recommendation = 'High risk: Prompt ICU admission, aggressive fluid titration, serial abdominal monitoring.';
  } else if (score === 3) {
    mortalityRisk = '5–8% mortality';
    recommendation = 'Intermediate-high risk: High dependency or step-down unit monitoring recommended.';
  } else if (score === 2) {
    mortalityRisk = '1.6% mortality';
    recommendation = 'Intermediate risk: Frequent vital checks and hydration tracking.';
  }

  return { score, mortalityRisk, recommendation };
}

export function calculateFib4(input: {
  ageYears: number;
  astU_L: number;
  altU_L: number;
  platelets_10e3_uL: number;
}): {
  score: number;
  stage: 'Low Risk (F0-F1)' | 'Indeterminate (F2)' | 'High Risk Advanced Fibrosis (F3-F4)';
  interpretation: string;
} {
  const denominator = input.platelets_10e3_uL * Math.sqrt(Math.max(1, input.altU_L));
  const score = denominator > 0 ? Number(((input.ageYears * input.astU_L) / denominator).toFixed(2)) : 0;

  if (score < 1.3) {
    return {
      score,
      stage: 'Low Risk (F0-F1)',
      interpretation: 'FIB-4 < 1.3: High negative predictive value (NPV >90%) for advanced fibrosis. Routine primary care surveillance.',
    };
  } else if (score <= 2.67) {
    return {
      score,
      stage: 'Indeterminate (F2)',
      interpretation: 'FIB-4 1.3–2.67: Indeterminate risk. Recommend secondary non-invasive testing (e.g. transient elastography / FibroScan).',
    };
  } else {
    return {
      score,
      stage: 'High Risk Advanced Fibrosis (F3-F4)',
      interpretation: 'FIB-4 > 2.67: High positive predictive value for advanced fibrosis/cirrhosis. Hepatology referral recommended.',
    };
  }
}

// ==========================================
// 5. NEUROLOGY & STROKE SUITE
// ==========================================

export function calculateAbcd2Score(input: {
  age60Plus: boolean;
  sbpGte140OrDbpGte90: boolean;
  unilateralWeakness: boolean;
  speechImpairmentWithoutWeakness: boolean;
  durationMinutes: '<10' | '10-59' | '>=60';
  hasDiabetes: boolean;
}): {
  score: number;
  twoDayStrokeRiskPercent: number;
  riskTier: 'Low' | 'Moderate' | 'High';
  recommendation: string;
} {
  let score = 0;
  if (input.age60Plus) score += 1;
  if (input.sbpGte140OrDbpGte90) score += 1;
  if (input.unilateralWeakness) score += 2;
  else if (input.speechImpairmentWithoutWeakness) score += 1;

  if (input.durationMinutes === '>=60') score += 2;
  else if (input.durationMinutes === '10-59') score += 1;

  if (input.hasDiabetes) score += 1;

  if (score >= 6) {
    return {
      score,
      twoDayStrokeRiskPercent: 8.1,
      riskTier: 'High',
      recommendation: 'High risk (8.1% 48h stroke risk). Urgent hospital admission for vascular imaging (carotid Doppler/CTA/MRA), MRI brain, and dual antiplatelet therapy (DAPT).',
    };
  } else if (score >= 4) {
    return {
      score,
      twoDayStrokeRiskPercent: 4.1,
      riskTier: 'Moderate',
      recommendation: 'Moderate risk (4.1% 48h stroke risk). Hospitalization usually warranted for rapid etiology evaluation.',
    };
  } else {
    return {
      score,
      twoDayStrokeRiskPercent: 1.0,
      riskTier: 'Low',
      recommendation: 'Low risk (1.0% 48h stroke risk). Outpatient rapid-access TIA clinic evaluation within 24–48 hours.',
    };
  }
}

// ==========================================
// 6. INFECTIOUS DISEASE & TOXICOLOGY
// ==========================================

export function calculateSirs(input: {
  tempAbnormal: boolean; // >38C or <36C
  heartRateGt90: boolean;
  respRateGt20OrPaco2Lt32: boolean;
  wbcAbnormal: boolean; // >12k, <4k, or >10% immature bands
}): {
  score: number;
  hasSirs: boolean;
  summary: string;
} {
  let score = 0;
  if (input.tempAbnormal) score += 1;
  if (input.heartRateGt90) score += 1;
  if (input.respRateGt20OrPaco2Lt32) score += 1;
  if (input.wbcAbnormal) score += 1;

  const hasSirs = score >= 2;
  return {
    score,
    hasSirs,
    summary: hasSirs
      ? `SIRS criteria met (${score}/4). Evaluate for infectious source and signs of organ hypoperfusion/sepsis.`
      : `SIRS criteria not met (${score}/4).`,
  };
}

export function evaluateDengueWarningSigns(signs: {
  abdominalPain: boolean;
  persistentVomiting: boolean;
  fluidAccumulation: boolean;
  mucosalBleeding: boolean;
  lethargyOrRestlessness: boolean;
  hepatomegalyGt2cm: boolean;
  hematocritRiseWithRapidPlateletDrop: boolean;
}): {
  warningSignsPresent: number;
  classification: 'Dengue without Warning Signs' | 'Dengue with Warning Signs' | 'Severe Dengue';
  managementGuideline: string;
} {
  const count = Object.values(signs).filter(Boolean).length;
  if (count > 0) {
    return {
      warningSignsPresent: count,
      classification: 'Dengue with Warning Signs',
      managementGuideline: 'WHO 2009 Group B: Inpatient admission. Close vital sign monitoring, serial Hct/platelets, and cautious isotonic crystalloid fluid resuscitation (5-7 mL/kg/h).',
    };
  }
  return {
    warningSignsPresent: 0,
    classification: 'Dengue without Warning Signs',
    managementGuideline: 'WHO 2009 Group A: Home management with daily outpatient monitoring, oral hydration, fever control with acetaminophen (avoid NSAIDs).',
  };
}

export function calculateMentzerIndex(mcvFl: number, rbcCountMillion: number): {
  mentzerIndex: number;
  likelyDiagnosis: 'Beta-Thalassemia Trait' | 'Iron Deficiency Anemia' | 'Borderline';
  workupRecommendation: string;
} {
  const mentzerIndex = rbcCountMillion > 0 ? Number((mcvFl / rbcCountMillion).toFixed(1)) : 0;

  if (mentzerIndex < 13.0) {
    return {
      mentzerIndex,
      likelyDiagnosis: 'Beta-Thalassemia Trait',
      workupRecommendation: 'Mentzer Index < 13 suggests Thalassemia Trait. Order hemoglobin electrophoresis / HPLC and genetic testing.',
    };
  } else {
    return {
      mentzerIndex,
      likelyDiagnosis: 'Iron Deficiency Anemia',
      workupRecommendation: 'Mentzer Index ≥ 13 suggests Iron Deficiency Anemia. Order serum ferritin, iron saturation (TSAT), and evaluate for blood loss.',
    };
  }
}

export function calculateAbsoluteNeutrophilCount(wbcCountK: number, segsPercent: number, bandsPercent: number): {
  ancCellsPerMicroLiter: number;
  neutropeniaGrade: 'Normal' | 'Mild Neutropenia' | 'Moderate Neutropenia' | 'Severe Neutropenia';
  clinicalRisk: string;
} {
  const wbcTotal = wbcCountK * 1000;
  const ancCellsPerMicroLiter = Math.round((wbcTotal * (segsPercent + bandsPercent)) / 100);

  if (ancCellsPerMicroLiter >= 1500) {
    return { ancCellsPerMicroLiter, neutropeniaGrade: 'Normal', clinicalRisk: 'Normal neutrophil defense against bacterial/fungal infection.' };
  } else if (ancCellsPerMicroLiter >= 1000) {
    return { ancCellsPerMicroLiter, neutropeniaGrade: 'Mild Neutropenia', clinicalRisk: 'Mildly increased risk of opportunistic infection.' };
  } else if (ancCellsPerMicroLiter >= 500) {
    return { ancCellsPerMicroLiter, neutropeniaGrade: 'Moderate Neutropenia', clinicalRisk: 'Moderate infection risk. Caution with myelosuppressive agents.' };
  } else {
    return { ancCellsPerMicroLiter, neutropeniaGrade: 'Severe Neutropenia', clinicalRisk: 'Severe neutropenia (ANC < 500/uL). High risk of life-threatening neutropenic sepsis. Immediate broad-spectrum empiric IV antibiotics if febrile.' };
  }
}
