/**
 * MEDABACUS Clinical Calculator Wiki - Internal Medicine Suite
 * High-yield scores, formulas & scales across Cardiology, Pulmonology,
 * Nephrology, Gastroenterology/Hepatology, Neurology, Endocrine, Hematology, & Rheumatology.
 */

// ==========================================
// 1. CARDIOLOGY & VASCULAR
// ==========================================

export interface AscvdInput {
  age: number; // 20-79
  isFemale: boolean;
  isAfricanAmerican: boolean;
  totalCholesterol: number; // mg/dL (130-320)
  hdlCholesterol: number; // mg/dL (20-100)
  systolicBp: number; // mmHg (90-200)
  onHypertensionMeds: boolean;
  isSmoker: boolean;
  hasDiabetes: boolean;
}

export interface AscvdResult {
  tenYearRiskPercent: number;
  riskTier: 'Low (<5%)' | 'Borderline (5-7.4%)' | 'Intermediate (7.5-19.9%)' | 'High (≥20%)';
  statinRecommendation: string;
  guideline: string;
}

/**
 * ACC/AHA 2018 Pooled Cohort Equations for 10-year ASCVD Risk
 */
export function calculateAscvdRisk(input: AscvdInput): AscvdResult {
  const {
    age,
    isFemale,
    isAfricanAmerican,
    totalCholesterol,
    hdlCholesterol,
    systolicBp,
    onHypertensionMeds,
    isSmoker,
    hasDiabetes,
  } = input;

  const lnAge = Math.log(Math.max(20, Math.min(79, age)));
  const lnTC = Math.log(Math.max(130, Math.min(320, totalCholesterol)));
  const lnHdl = Math.log(Math.max(20, Math.min(100, hdlCholesterol)));
  const lnSbp = Math.log(Math.max(90, Math.min(200, systolicBp)));

  let indSum = 0;
  let s0_10 = 0;
  let meanInd = 0;

  if (isFemale && !isAfricanAmerican) {
    // White / Other Female
    s0_10 = 0.9665;
    meanInd = -29.18;
    indSum =
      -29.799 * lnAge +
      4.884 * Math.pow(lnAge, 2) +
      13.54 * lnTC -
      3.114 * lnAge * lnTC -
      13.578 * lnHdl +
      3.149 * lnAge * lnHdl +
      (onHypertensionMeds ? 2.019 * lnSbp : 1.957 * lnSbp) +
      (isSmoker ? 7.574 - 1.665 * lnAge : 0) +
      (hasDiabetes ? 0.661 : 0);
  } else if (isFemale && isAfricanAmerican) {
    // African American Female
    s0_10 = 0.9533;
    meanInd = 86.61;
    indSum =
      17.114 * lnAge +
      0.94 * lnTC -
      18.92 * lnHdl +
      4.475 * lnAge * lnHdl +
      (onHypertensionMeds ? 29.291 * lnSbp - 6.432 * lnAge * lnSbp : 27.82 * lnSbp - 6.087 * lnAge * lnSbp) +
      (isSmoker ? 0.691 : 0) +
      (hasDiabetes ? 0.874 : 0);
  } else if (!isFemale && !isAfricanAmerican) {
    // White / Other Male
    s0_10 = 0.9144;
    meanInd = 61.18;
    indSum =
      12.344 * lnAge +
      11.853 * lnTC -
      2.664 * lnAge * lnTC -
      7.99 * lnHdl +
      1.769 * lnAge * lnHdl +
      (onHypertensionMeds ? 1.797 * lnSbp : 1.764 * lnSbp) +
      (isSmoker ? 7.837 - 1.795 * lnAge : 0) +
      (hasDiabetes ? 0.658 : 0);
  } else {
    // African American Male
    s0_10 = 0.8954;
    meanInd = 19.54;
    indSum =
      2.469 * lnAge +
      0.302 * lnTC -
      0.307 * lnHdl +
      (onHypertensionMeds ? 1.916 * lnSbp : 1.809 * lnSbp) +
      (isSmoker ? 0.549 : 0) +
      (hasDiabetes ? 0.645 : 0);
  }

  const rawRisk = 1 - Math.pow(s0_10, Math.exp(indSum - meanInd));
  const riskPercent = Math.max(0.1, Math.min(99.9, parseFloat((rawRisk * 100).toFixed(1))));

  let riskTier: AscvdResult['riskTier'] = 'Low (<5%)';
  let statinRecommendation = 'Lifestyle optimization; statin generally not indicated unless LDL-C ≥ 190 mg/dL.';

  if (riskPercent >= 20) {
    riskTier = 'High (≥20%)';
    statinRecommendation = 'Initiate high-intensity statin therapy (atorvastatin 40-80 mg or rosuvastatin 20-40 mg) targeting ≥50% LDL-C reduction.';
  } else if (riskPercent >= 7.5) {
    riskTier = 'Intermediate (7.5-19.9%)';
    statinRecommendation = 'Moderate-intensity statin recommended. If risk decision is uncertain, consider Coronary Artery Calcium (CAC) scoring.';
  } else if (riskPercent >= 5.0) {
    riskTier = 'Borderline (5-7.4%)';
    statinRecommendation = 'If risk-enhancing factors present (family hx, metabolic syndrome, CKD, hsCRP ≥ 2), consider moderate-intensity statin.';
  }

  return {
    tenYearRiskPercent: riskPercent,
    riskTier,
    statinRecommendation,
    guideline: '2018 AHA/ACC/AACVPR/AAPA/ABC/ACPM/ADA/AGS/APhA/ASPC/NLA/PCNA Cholesterol Guideline',
  };
}

/**
 * GRACE Score for Acute Coronary Syndrome In-Hospital & 6-Month Mortality
 */
export interface GraceInput {
  age: number;
  heartRate: number;
  systolicBp: number;
  creatinine: number; // mg/dL
  killipClass: 1 | 2 | 3 | 4;
  cardiacArrestAtAdmission: boolean;
  stSegmentDeviation: boolean;
  elevatedCardiacEnzymes: boolean;
}

export interface GraceResult {
  score: number;
  inHospitalMortalityTier: 'Low (<1%)' | 'Intermediate (1-3%)' | 'High (>3%)';
  mortalityRiskPercent: string;
  recommendedInvasiveStrategy: string;
  guideline: string;
}

export function calculateGraceScore(input: GraceInput): GraceResult {
  let score = 0;

  // Age points
  if (input.age <= 39) score += 0;
  else if (input.age <= 49) score += 18;
  else if (input.age <= 59) score += 36;
  else if (input.age <= 69) score += 55;
  else if (input.age <= 79) score += 73;
  else if (input.age <= 89) score += 91;
  else score += 100;

  // Heart rate points
  if (input.heartRate < 70) score += 0;
  else if (input.heartRate <= 89) score += 7;
  else if (input.heartRate <= 109) score += 13;
  else if (input.heartRate <= 149) score += 23;
  else if (input.heartRate <= 199) score += 36;
  else score += 46;

  // SBP points (inverse)
  if (input.systolicBp < 80) score += 63;
  else if (input.systolicBp <= 99) score += 58;
  else if (input.systolicBp <= 119) score += 47;
  else if (input.systolicBp <= 139) score += 37;
  else if (input.systolicBp <= 159) score += 26;
  else if (input.systolicBp <= 199) score += 11;
  else score += 0;

  // Creatinine points
  if (input.creatinine < 0.4) score += 2;
  else if (input.creatinine <= 0.79) score += 5;
  else if (input.creatinine <= 1.19) score += 8;
  else if (input.creatinine <= 1.59) score += 11;
  else if (input.creatinine <= 1.99) score += 14;
  else if (input.creatinine <= 3.99) score += 23;
  else score += 31;

  // Killip class points
  if (input.killipClass === 1) score += 0;
  else if (input.killipClass === 2) score += 21;
  else if (input.killipClass === 3) score += 43;
  else if (input.killipClass === 4) score += 64;

  if (input.cardiacArrestAtAdmission) score += 43;
  if (input.stSegmentDeviation) score += 30;
  if (input.elevatedCardiacEnzymes) score += 15;

  let inHospitalMortalityTier: GraceResult['inHospitalMortalityTier'] = 'Low (<1%)';
  let mortalityRiskPercent = '< 1%';
  let recommendedInvasiveStrategy = 'Elective non-invasive ischemia testing or delayed angiography';

  if (score > 140) {
    inHospitalMortalityTier = 'High (>3%)';
    mortalityRiskPercent = '> 3% (up to >8% in highest deciles)';
    recommendedInvasiveStrategy = 'Early invasive strategy: Coronary angiography within 24 hours';
  } else if (score >= 109) {
    inHospitalMortalityTier = 'Intermediate (1-3%)';
    mortalityRiskPercent = '1 - 3%';
    recommendedInvasiveStrategy = 'Invasive strategy within 72 hours of admission';
  }

  return {
    score,
    inHospitalMortalityTier,
    mortalityRiskPercent,
    recommendedInvasiveStrategy,
    guideline: 'ESC Guidelines for the management of acute coronary syndromes (2023)',
  };
}

/**
 * Modified Duke Criteria for Infective Endocarditis (2023 Update)
 */
export interface DukeCriteriaInput {
  // Major
  typicalMicroorganismTwoBottles: boolean;
  persistentlyPositiveBloodCultures: boolean;
  singlePositiveCoxiellaBurnetii: boolean;
  echoOscillatingIntracardiacMassOrAbscess: boolean;
  newPartialDehiscenceOfProstheticValve: boolean;
  newValvularRegurgitation: boolean;
  // Minor
  predispositionHeartConditionOrIvDrugUse: boolean;
  feverAtLeast38C: boolean;
  vascularPhenomenaMajorEmboliSepticInfarcts: boolean;
  immunologicPhenomenaGlomerulonephritisOslerRothRF: boolean;
  microbiologicEvidenceNotMeetingMajor: boolean;
}

export function evaluateDukeCriteria(input: DukeCriteriaInput): {
  majorCount: number;
  minorCount: number;
  classification: 'Definite Infective Endocarditis' | 'Possible Infective Endocarditis' | 'Rejected Infective Endocarditis';
  clinicalRecommendation: string;
  guideline: string;
} {
  let majorCount = 0;
  if (
    input.typicalMicroorganismTwoBottles ||
    input.persistentlyPositiveBloodCultures ||
    input.singlePositiveCoxiellaBurnetii
  ) {
    majorCount += 1;
  }
  if (
    input.echoOscillatingIntracardiacMassOrAbscess ||
    input.newPartialDehiscenceOfProstheticValve ||
    input.newValvularRegurgitation
  ) {
    majorCount += 1;
  }

  let minorCount = 0;
  if (input.predispositionHeartConditionOrIvDrugUse) minorCount++;
  if (input.feverAtLeast38C) minorCount++;
  if (input.vascularPhenomenaMajorEmboliSepticInfarcts) minorCount++;
  if (input.immunologicPhenomenaGlomerulonephritisOslerRothRF) minorCount++;
  if (input.microbiologicEvidenceNotMeetingMajor) minorCount++;

  let classification: 'Definite Infective Endocarditis' | 'Possible Infective Endocarditis' | 'Rejected Infective Endocarditis' = 'Rejected Infective Endocarditis';
  let clinicalRecommendation = 'Firm alternative diagnosis established or symptoms resolve within ≤ 4 days of antibiotics.';

  if (majorCount >= 2 || (majorCount === 1 && minorCount >= 3) || minorCount >= 5) {
    classification = 'Definite Infective Endocarditis';
    clinicalRecommendation = 'Fulfills Definite IE criteria. Obtain transesophageal echocardiography (TEE), consult ID & Cardiothoracic Surgery, and initiate targeted IV bactericidal therapy for 4-6 weeks.';
  } else if ((majorCount === 1 && minorCount >= 1) || minorCount >= 3) {
    classification = 'Possible Infective Endocarditis';
    clinicalRecommendation = 'Possible IE. Repeat blood cultures, obtain urgent TEE, monitor closely for embolic or immunologic complications.';
  }

  return {
    majorCount,
    minorCount,
    classification,
    clinicalRecommendation,
    guideline: '2023 Duke-ISCVID Criteria for Infective Endocarditis (Fowler et al., Clin Infect Dis 2023)',
  };
}

// ==========================================
// 2. PULMONOLOGY & CRITICAL CARE
// ==========================================

/**
 * Revised Geneva Score for Pulmonary Embolism Probability
 */
export interface GenevaScoreInput {
  ageOver65: boolean;
  previousDvtOrPe: boolean;
  surgeryOrFracturePastMonth: boolean;
  activeMalignancy: boolean;
  unilateralLowerLimbPain: boolean;
  hemoptysis: boolean;
  heartRate: number; // bpm
  painOnDeepPalpationAndUnilateralEdema: boolean;
}

export function calculateGenevaScore(input: GenevaScoreInput): {
  score: number;
  probabilityCategory: 'Low Probability' | 'Intermediate Probability' | 'High Probability';
  pePrevalencePercent: string;
  recommendedPathway: string;
  guideline: string;
} {
  let score = 0;
  if (input.ageOver65) score += 1;
  if (input.previousDvtOrPe) score += 3;
  if (input.surgeryOrFracturePastMonth) score += 2;
  if (input.activeMalignancy) score += 2;
  if (input.unilateralLowerLimbPain) score += 3;
  if (input.hemoptysis) score += 2;
  if (input.painOnDeepPalpationAndUnilateralEdema) score += 4;

  if (input.heartRate >= 95) score += 5;
  else if (input.heartRate >= 75) score += 3;

  let probabilityCategory: 'Low Probability' | 'Intermediate Probability' | 'High Probability' = 'Low Probability';
  let pePrevalencePercent = '~8%';
  let recommendedPathway = 'Consider PERC rule or high-sensitivity D-dimer. If negative, rule out PE without CTPA.';

  if (score >= 11) {
    probabilityCategory = 'High Probability';
    pePrevalencePercent = '~65%';
    recommendedPathway = 'High probability: Proceed directly to diagnostic CTPA and initiate empiric anticoagulation unless contraindicated.';
  } else if (score >= 4) {
    probabilityCategory = 'Intermediate Probability';
    pePrevalencePercent = '~28%';
    recommendedPathway = 'Obtain high-sensitivity D-dimer. If elevated, proceed to CTPA imaging.';
  }

  return {
    score,
    probabilityCategory,
    pePrevalencePercent,
    recommendedPathway,
    guideline: 'ESC / European Respiratory Society Guidelines for Acute Pulmonary Embolism (2019/2024)',
  };
}

/**
 * GOLD COPD 2024/2025 Grouping & Staging
 */
export function calculateGoldCopd(
  fev1PercentPredicted: number,
  exacerbationsPastYear: number,
  hospitalizationsForCopd: number,
  mMRCDyspneaGrade: 0 | 1 | 2 | 3 | 4,
  catScore: number
): {
  spirometricStage: 'GOLD 1 (Mild ≥80%)' | 'GOLD 2 (Moderate 50-79%)' | 'GOLD 3 (Severe 30-49%)' | 'GOLD 4 (Very Severe <30%)';
  goldGroup: 'Group A (Low risk, low symptoms)' | 'Group B (Low risk, high symptoms)' | 'Group E (High exacerbation risk)';
  initialPharmacotherapy: string;
  guideline: string;
} {
  let spirometricStage: 'GOLD 1 (Mild ≥80%)' | 'GOLD 2 (Moderate 50-79%)' | 'GOLD 3 (Severe 30-49%)' | 'GOLD 4 (Very Severe <30%)' = 'GOLD 1 (Mild ≥80%)';
  if (fev1PercentPredicted < 30) spirometricStage = 'GOLD 4 (Very Severe <30%)';
  else if (fev1PercentPredicted < 50) spirometricStage = 'GOLD 3 (Severe 30-49%)';
  else if (fev1PercentPredicted < 80) spirometricStage = 'GOLD 2 (Moderate 50-79%)';

  const isHighExacerbator = exacerbationsPastYear >= 2 || hospitalizationsForCopd >= 1;
  const isHighSymptom = mMRCDyspneaGrade >= 2 || catScore >= 10;

  let goldGroup: 'Group A (Low risk, low symptoms)' | 'Group B (Low risk, high symptoms)' | 'Group E (High exacerbation risk)' = 'Group A (Low risk, low symptoms)';
  let initialPharmacotherapy = 'A bronchodilator (short-acting or long-acting LABA or LAMA)';

  if (isHighExacerbator) {
    goldGroup = 'Group E (High exacerbation risk)';
    initialPharmacotherapy = 'LABA + LAMA combination. Consider adding ICS (triple therapy) if blood eosinophils ≥ 300 cells/µL.';
  } else if (isHighSymptom) {
    goldGroup = 'Group B (Low risk, high symptoms)';
    initialPharmacotherapy = 'Dual bronchodilator: LABA + LAMA combination (e.g., tiotropium/olodaterol or umeclidinium/vilanterol).';
  }

  return {
    spirometricStage,
    goldGroup,
    initialPharmacotherapy,
    guideline: 'Global Initiative for Chronic Obstructive Lung Disease (GOLD 2024/2025 Report)',
  };
}

/**
 * APACHE II ICU Mortality Prediction System
 */
export interface Apache2Input {
  age: number;
  temperatureC: number;
  meanArterialPressure: number; // mmHg
  heartRate: number; // bpm
  respiratoryRate: number; // bpm
  pao2: number; // mmHg
  fio2: number; // 0.21 - 1.0
  arterialPh: number;
  serumSodium: number; // mEq/L
  serumPotassium: number; // mEq/L
  serumCreatinine: number; // mg/dL
  acuteRenalFailure: boolean;
  hematocrit: number; // %
  wbcCount: number; // x10^3/µL
  gcsScore: number; // 3-15
  severeOrganInsufficiency: 'None' | 'Nonoperative/Emergency Postop' | 'Elective Postop';
}

export function calculateApache2Score(input: Apache2Input): {
  score: number;
  predictedMortalityPercent: number;
  riskInterpretation: string;
  guideline: string;
} {
  let pts = 0;

  // Age
  if (input.age >= 75) pts += 6;
  else if (input.age >= 65) pts += 5;
  else if (input.age >= 55) pts += 3;
  else if (input.age >= 45) pts += 2;

  // Temperature
  const t = input.temperatureC;
  if (t >= 41 || t <= 29.9) pts += 4;
  else if (t >= 39 || (t >= 30 && t <= 31.9)) pts += 3;
  else if (t <= 33.9) pts += 2;
  else if (t >= 38.5 || (t >= 34 && t <= 35.9)) pts += 1;

  // MAP
  const map = input.meanArterialPressure;
  if (map >= 160 || map <= 49) pts += 4;
  else if (map >= 130 || (map >= 50 && map <= 69)) pts += 2;
  else if (map >= 110) pts += 1;

  // HR
  const hr = input.heartRate;
  if (hr >= 180 || hr <= 39) pts += 4;
  else if (hr >= 140 || (hr >= 40 && hr <= 54)) pts += 3;
  else if (hr >= 110 || (hr >= 55 && hr <= 69)) pts += 2;

  // RR
  const rr = input.respiratoryRate;
  if (rr >= 50 || rr <= 5) pts += 4;
  else if (rr >= 35) pts += 3;
  else if (rr <= 9) pts += 2;
  else if (rr >= 25) pts += 1;

  // Oxygenation
  if (input.fio2 >= 0.5) {
    // A-a gradient calculation: PAO2 ~ 713 * FiO2 - PaCO2/0.8
    // Simplified APACHE II A-a gradient score
    const approxAa = 713 * input.fio2 - input.pao2 - 50;
    if (approxAa >= 500) pts += 4;
    else if (approxAa >= 350) pts += 3;
    else if (approxAa >= 200) pts += 2;
  } else {
    if (input.pao2 < 55) pts += 4;
    else if (input.pao2 <= 60) pts += 3;
    else if (input.pao2 <= 70) pts += 1;
  }

  // Arterial pH
  const ph = input.arterialPh;
  if (ph >= 7.7 || ph < 7.15) pts += 4;
  else if (ph >= 7.6 || (ph >= 7.15 && ph <= 7.24)) pts += 3;
  else if (ph <= 7.32) pts += 2;
  else if (ph >= 7.5) pts += 1;

  // Na
  const na = input.serumSodium;
  if (na >= 180 || na <= 110) pts += 4;
  else if (na >= 160 || (na >= 111 && na <= 119)) pts += 3;
  else if (na >= 155 || (na >= 120 && na <= 129)) pts += 2;
  else if (na >= 150) pts += 1;

  // K
  const k = input.serumPotassium;
  if (k >= 7.0 || k < 2.5) pts += 4;
  else if (k >= 6.0) pts += 3;
  else if (k <= 2.9) pts += 2;
  else if (k >= 5.5 || (k >= 3.0 && k <= 3.4)) pts += 1;

  // Creatinine
  const cr = input.serumCreatinine;
  let crPts = 0;
  if (cr >= 3.5) crPts = 4;
  else if (cr >= 2.0) crPts = 3;
  else if (cr >= 1.5 || cr < 0.6) crPts = 2;
  if (input.acuteRenalFailure) crPts *= 2;
  pts += crPts;

  // Hct
  const hct = input.hematocrit;
  if (hct >= 60 || hct < 20) pts += 4;
  else if (hct >= 50 || (hct >= 20 && hct <= 29.9)) pts += 2;
  else if (hct >= 46) pts += 1;

  // WBC
  const wbc = input.wbcCount;
  if (wbc >= 40 || wbc < 1) pts += 4;
  else if (wbc >= 20 || (wbc >= 1 && wbc <= 2.9)) pts += 2;
  else if (wbc >= 15) pts += 1;

  // Glasgow Coma Scale component (15 - GCS)
  pts += Math.max(0, 15 - input.gcsScore);

  // Chronic health status
  if (input.severeOrganInsufficiency === 'Nonoperative/Emergency Postop') pts += 5;
  else if (input.severeOrganInsufficiency === 'Elective Postop') pts += 2;

  // Logistic regression conversion for APACHE II non-operative ICU admission
  // logit = -3.517 + (APACHE II * 0.146)
  const logit = -3.517 + pts * 0.146;
  const mortProb = 1 / (1 + Math.exp(-logit));
  const predictedMortalityPercent = parseFloat((mortProb * 100).toFixed(1));

  let riskInterpretation = 'Low predicted in-hospital ICU mortality risk.';
  if (pts > 25) riskInterpretation = 'Severe critical illness: >50% predicted in-hospital mortality.';
  else if (pts >= 15) riskInterpretation = 'Moderate-to-high critical illness severity: 20-40% predicted mortality.';

  return {
    score: pts,
    predictedMortalityPercent,
    riskInterpretation,
    guideline: 'Knaus WA et al. APACHE II: A severity of disease classification system. Crit Care Med 1985.',
  };
}

// ==========================================
// 3. NEPHROLOGY & ACID-BASE
// ==========================================

export function calculateKdigoAki(
  baselineCreatinine: number,
  currentCreatinine: number,
  urineOutputMlPerKgPerHour: number,
  urineOutputHours: number
): {
  stage: 'No AKI' | 'Stage 1 AKI' | 'Stage 2 AKI' | 'Stage 3 AKI';
  criteriaMet: string;
  guideline: string;
} {
  const crRatio = currentCreatinine / Math.max(0.1, baselineCreatinine);
  const crDelta = currentCreatinine - baselineCreatinine;

  let crStage = 0;
  if (crRatio >= 3.0 || currentCreatinine >= 4.0) crStage = 3;
  else if (crRatio >= 2.0) crStage = 2;
  else if (crRatio >= 1.5 || crDelta >= 0.3) crStage = 1;

  let uoStage = 0;
  if (urineOutputMlPerKgPerHour < 0.3 && urineOutputHours >= 24) uoStage = 3;
  else if (urineOutputMlPerKgPerHour < 0.5 && urineOutputHours >= 12) uoStage = 2;
  else if (urineOutputMlPerKgPerHour < 0.5 && urineOutputHours >= 6) uoStage = 1;

  const maxStage = Math.max(crStage, uoStage);

  if (maxStage === 3) {
    return {
      stage: 'Stage 3 AKI',
      criteriaMet: 'Serum Cr ≥ 3.0x baseline, Cr ≥ 4.0 mg/dL, or UOP < 0.3 mL/kg/h for ≥24h / anuria for ≥12h',
      guideline: 'KDIGO Clinical Practice Guideline for Acute Kidney Injury (2012)',
    };
  }
  if (maxStage === 2) {
    return {
      stage: 'Stage 2 AKI',
      criteriaMet: 'Serum Cr 2.0–2.9x baseline or UOP < 0.5 mL/kg/h for ≥12 hours',
      guideline: 'KDIGO Clinical Practice Guideline for Acute Kidney Injury (2012)',
    };
  }
  if (maxStage === 1) {
    return {
      stage: 'Stage 1 AKI',
      criteriaMet: 'Serum Cr 1.5–1.9x baseline, absolute Cr increase ≥ 0.3 mg/dL, or UOP < 0.5 mL/kg/h for 6–12 hours',
      guideline: 'KDIGO Clinical Practice Guideline for Acute Kidney Injury (2012)',
    };
  }

  return {
    stage: 'No AKI',
    criteriaMet: 'Creatinine and urine output do not meet KDIGO AKI thresholds',
    guideline: 'KDIGO Clinical Practice Guideline for Acute Kidney Injury (2012)',
  };
}

// ==========================================
// 4. GI / HEPATOLOGY
// ==========================================

/**
 * Glasgow-Blatchford Bleeding Score (GBS) for Upper GI Bleed
 */
export interface GlasgowBlatchfordInput {
  bunMgDl: number;
  hemoglobinGdl: number;
  isFemale: boolean;
  systolicBp: number;
  heartRate: number;
  hasMelena: boolean;
  hasSyncope: boolean;
  hasHepaticDisease: boolean;
  hasHeartFailure: boolean;
}

export function calculateGlasgowBlatchford(input: GlasgowBlatchfordInput): {
  score: number;
  riskCategory: 'Very Low Risk (Score 0-1)' | 'High Risk (Score ≥ 2)';
  disposition: string;
  guideline: string;
} {
  let score = 0;

  // BUN
  if (input.bunMgDl >= 70) score += 6;
  else if (input.bunMgDl >= 28) score += 4;
  else if (input.bunMgDl >= 22.4) score += 3;
  else if (input.bunMgDl >= 18.2) score += 2;

  // Hemoglobin
  if (input.isFemale) {
    if (input.hemoglobinGdl < 10) score += 6;
    else if (input.hemoglobinGdl < 12) score += 1;
  } else {
    if (input.hemoglobinGdl < 10) score += 6;
    else if (input.hemoglobinGdl < 12) score += 3;
    else if (input.hemoglobinGdl < 13) score += 1;
  }

  // SBP
  if (input.systolicBp < 90) score += 3;
  else if (input.systolicBp < 100) score += 2;
  else if (input.systolicBp < 110) score += 1;

  if (input.heartRate >= 100) score += 1;
  if (input.hasMelena) score += 1;
  if (input.hasSyncope) score += 2;
  if (input.hasHepaticDisease) score += 2;
  if (input.hasHeartFailure) score += 2;

  let riskCategory: 'Very Low Risk (Score 0-1)' | 'High Risk (Score ≥ 2)' = 'High Risk (Score ≥ 2)';
  let disposition = 'Inpatient admission required. Initiate IV PPI infusion, blood typing/crossmatch, and urgent inpatient endoscopy within 24h.';

  if (score <= 1) {
    riskCategory = 'Very Low Risk (Score 0-1)';
    disposition = 'Very low risk of rebleeding or intervention. Safe for outpatient management or early discharge per ACG/BSG guidelines.';
  }

  return {
    score,
    riskCategory,
    disposition,
    guideline: 'ACG Clinical Guideline: Upper Gastrointestinal Bleeding (2021)',
  };
}

/**
 * SAAG (Serum-Ascites Albumin Gradient)
 */
export function calculateSaag(
  serumAlbuminGdl: number,
  asciticAlbuminGdl: number,
  asciticTotalProteinGdl: number
): {
  saag: number;
  portalHypertension: boolean;
  differentialDiagnosis: string;
  guideline: string;
} {
  const saag = parseFloat((serumAlbuminGdl - asciticAlbuminGdl).toFixed(2));
  const isHighSaag = saag >= 1.1;

  let differentialDiagnosis = '';
  if (isHighSaag) {
    if (asciticTotalProteinGdl < 2.5) {
      differentialDiagnosis = 'High SAAG (≥1.1), Low Protein (<2.5): Cirrhosis, late Budd-Chiari, massive liver metastases.';
    } else {
      differentialDiagnosis = 'High SAAG (≥1.1), High Protein (≥2.5): Congestive heart failure, constrictive pericarditis, early Budd-Chiari, sinusoidal obstruction syndrome.';
    }
  } else {
    if (asciticTotalProteinGdl < 2.5) {
      differentialDiagnosis = 'Low SAAG (<1.1), Low Protein (<2.5): Nephrotic syndrome, severe protein-losing enteropathy, malnutrition.';
    } else {
      differentialDiagnosis = 'Low SAAG (<1.1), High Protein (≥2.5): Peritoneal carcinomatosis, peritoneal tuberculosis, pancreatic ascites, biliary leak.';
    }
  }

  return {
    saag,
    portalHypertension: isHighSaag,
    differentialDiagnosis,
    guideline: 'AASLD Practice Guidance: Management of Adult Patients with Ascites Due to Cirrhosis (2021)',
  };
}

/**
 * Maddrey's Discriminant Function (mDF) & Lille Model for Alcoholic Hepatitis
 */
export function calculateMaddreyDf(
  patientPtSeconds: number,
  controlPtSeconds: number,
  totalBilirubinMgDl: number
): {
  mdfScore: number;
  severeAlcoholicHepatitis: boolean;
  corticosteroidRecommendation: string;
  guideline: string;
} {
  // mDF = 4.6 * (PT - control PT) + Total Bilirubin
  const ptDiff = Math.max(0, patientPtSeconds - controlPtSeconds);
  const mdfScore = parseFloat((4.6 * ptDiff + totalBilirubinMgDl).toFixed(1));
  const severeAlcoholicHepatitis = mdfScore >= 32;

  let corticosteroidRecommendation = 'Mild to moderate alcoholic hepatitis (mDF < 32): 1-month mortality is low (~10%). Corticosteroids not indicated.';
  if (severeAlcoholicHepatitis) {
    corticosteroidRecommendation = 'Severe acute alcoholic hepatitis (mDF ≥ 32): High 1-month mortality (~30-50%). Candidate for Prednisolone 40 mg/day for 28 days unless active GI bleeding, uncontrolled sepsis, or HBV is present. Re-evaluate on Day 7 using the Lille Model.';
  }

  return {
    mdfScore,
    severeAlcoholicHepatitis,
    corticosteroidRecommendation,
    guideline: 'AASLD Guidelines for Alcoholic Liver Disease (2019)',
  };
}

// ==========================================
// 5. NEUROLOGY
// ==========================================

/**
 * ICH Score (Intracerebral Hemorrhage Mortality)
 */
export function calculateIchScore(
  gcsScore: number,
  volumeMl: number,
  intraventricularHemorrhage: boolean,
  infratentorialOrigin: boolean,
  ageAtLeast80: boolean
): {
  score: number;
  thirtyDayMortalityPercent: number;
  guideline: string;
} {
  let score = 0;
  if (gcsScore <= 4) score += 2;
  else if (gcsScore <= 12) score += 1;

  if (ageAtLeast80) score += 1;
  if (infratentorialOrigin) score += 1;
  if (volumeMl >= 30) score += 1;
  if (intraventricularHemorrhage) score += 1;

  const mortalityLookup = [0, 13, 26, 72, 97, 100, 100];
  const thirtyDayMortalityPercent = mortalityLookup[score] ?? 100;

  return {
    score,
    thirtyDayMortalityPercent,
    guideline: 'AHA/ASA Guideline for the Management of Patients With Spontaneous Intracerebral Hemorrhage (2022)',
  };
}

// ==========================================
// 6. ENDOCRINE & METABOLIC
// ==========================================

/**
 * Burch-Wartofsky Point Scale (BWPS) for Thyroid Storm
 */
export interface BurchWartofskyInput {
  temperatureC: number;
  cnsEffects: 'None' | 'Mild agitation' | 'Moderate delirium/psychosis' | 'Severe seizure/coma';
  giHepatic: 'None' | 'Diarrhea/nausea/vomiting' | 'Severe jaundice';
  heartRate: number;
  congestiveHeartFailure: 'None' | 'Mild (pedal edema)' | 'Moderate (bibasilar rales)' | 'Severe (pulmonary edema)';
  atrialFibrillation: boolean;
  precipitantHistory: boolean;
}

export function calculateBurchWartofsky(input: BurchWartofskyInput): {
  score: number;
  stormProbability: 'Thyroid Storm Highly Likely (≥45)' | 'Impending Storm (25-44)' | 'Storm Unlikely (<25)';
  emergencyAction: string;
  guideline: string;
} {
  let score = 0;

  // Temp
  const t = input.temperatureC;
  if (t >= 40.0) score += 30;
  else if (t >= 39.4) score += 25;
  else if (t >= 38.9) score += 20;
  else if (t >= 38.3) score += 15;
  else if (t >= 37.8) score += 10;
  else if (t >= 37.2) score += 5;

  // CNS
  if (input.cnsEffects === 'Severe seizure/coma') score += 30;
  else if (input.cnsEffects === 'Moderate delirium/psychosis') score += 20;
  else if (input.cnsEffects === 'Mild agitation') score += 10;

  // GI/Hepatic
  if (input.giHepatic === 'Severe jaundice') score += 20;
  else if (input.giHepatic === 'Diarrhea/nausea/vomiting') score += 10;

  // HR
  if (input.heartRate >= 140) score += 25;
  else if (input.heartRate >= 130) score += 20;
  else if (input.heartRate >= 120) score += 15;
  else if (input.heartRate >= 110) score += 10;
  else if (input.heartRate >= 100) score += 5;

  // CHF
  if (input.congestiveHeartFailure === 'Severe (pulmonary edema)') score += 15;
  else if (input.congestiveHeartFailure === 'Moderate (bibasilar rales)') score += 10;
  else if (input.congestiveHeartFailure === 'Mild (pedal edema)') score += 5;

  if (input.atrialFibrillation) score += 10;
  if (input.precipitantHistory) score += 10;

  let stormProbability: 'Thyroid Storm Highly Likely (≥45)' | 'Impending Storm (25-44)' | 'Storm Unlikely (<25)' = 'Storm Unlikely (<25)';
  let emergencyAction = 'Thyroid storm is unlikely. Manage underlying hyperthyroidism or look for alternate source of systemic symptoms.';

  if (score >= 45) {
    stormProbability = 'Thyroid Storm Highly Likely (≥45)';
    emergencyAction = 'Medical emergency! Transfer to ICU. Multimodal regimen: (1) Beta-blocker (Propranolol 60-80 mg PO q4h or Esmolol IV), (2) Thionamide (Propylthiouracil 200mg q4h or Methimazole), (3) Hydrocortisone 100mg IV q8h, (4) Saturated solution of potassium iodide (SSKI) given ≥1h after thionamide.';
  } else if (score >= 25) {
    stormProbability = 'Impending Storm (25-44)';
    emergencyAction = 'Impending thyroid storm: Aggressive beta-blockade, antithyroid medications, and close ICU/step-down cardiac monitoring.';
  }

  return {
    score,
    stormProbability,
    emergencyAction,
    guideline: 'American Thyroid Association (ATA) Hyperthyroidism Guidelines (2016)',
  };
}

// ==========================================
// 7. HEMATOLOGY & ONCOLOGY
// ==========================================

/**
 * 4Ts Score for Heparin-Induced Thrombocytopenia (HIT)
 */
export interface FourTsInput {
  thrombocytopenia: 0 | 1 | 2; // 2: >50% fall and nadir >=20; 1: 30-50% fall or nadir 10-19; 0: <30% fall or nadir <10
  timing: 0 | 1 | 2; // 2: days 5-10; 1: >day 10 or <=1 day with prior heparin 30-100d; 0: <=4 days without prior heparin
  thrombosis: 0 | 1 | 2; // 2: proven new thrombosis/skin necrosis; 1: progressive/recurrent or suspect; 0: none
  otherCauses: 0 | 1 | 2; // 2: none apparent; 1: possible; 0: definite other cause present
}

export function calculateFourTsScore(input: FourTsInput): {
  score: number;
  probability: 'Low Probability (≤3)' | 'Intermediate Probability (4-5)' | 'High Probability (6-8)';
  clinicalAction: string;
  guideline: string;
} {
  const score = input.thrombocytopenia + input.timing + input.thrombosis + input.otherCauses;

  let probability: 'Low Probability (≤3)' | 'Intermediate Probability (4-5)' | 'High Probability (6-8)' = 'Low Probability (≤3)';
  let clinicalAction = 'HIT probability ≤ 5%. Safe to continue heparin if indicated; routine HIT antibody screening NOT recommended.';

  if (score >= 6) {
    probability = 'High Probability (6-8)';
    clinicalAction = 'HIT probability ~64%. Stop all heparin immediately (including flushes/dialysis). Order HIT anti-PF4/heparin PF4 ELISA & serotonin release assay (SRA). Initiate therapeutic-dose non-heparin anticoagulant (Argatroban, Bivalirudin, or Fondaparinux). Do NOT give platelet transfusions.';
  } else if (score >= 4) {
    probability = 'Intermediate Probability (4-5)';
    clinicalAction = 'HIT probability ~14%. Stop heparin and initiate non-heparin anticoagulation while awaiting HIT antibody laboratory confirmation.';
  }

  return {
    score,
    probability,
    clinicalAction,
    guideline: 'American Society of Hematology (ASH) HIT Guidelines (2018)',
  };
}

/**
 * Friedewald Equation for LDL-C
 */
export function calculateFriedewaldLdl(
  totalCholesterol: number,
  hdlCholesterol: number,
  triglycerides: number
): {
  ldlCholesterol: number | null;
  isValid: boolean;
  warning?: string;
  guideline: string;
} {
  if (triglycerides >= 400) {
    return {
      ldlCholesterol: null,
      isValid: false,
      warning: 'Friedewald formula is invalid when serum triglycerides ≥ 400 mg/dL due to altered chylomicron/VLDL ratios. Request direct LDL-C measurement.',
      guideline: 'AHA / NLA Lipid Consensus',
    };
  }

  // LDL = TC - HDL - (TG / 5)
  const ldl = parseFloat((totalCholesterol - hdlCholesterol - triglycerides / 5).toFixed(1));
  return {
    ldlCholesterol: Math.max(0, ldl),
    isValid: true,
    guideline: 'Friedewald WT, Levy RI, Fredrickson DS. Clin Chem 1972',
  };
}
