/**
 * INTERNAL MEDICINE CLINICAL CALCULATIONS & DECISION SCORING SUITE
 * 
 * Evidence-based algorithms:
 * - CKD-EPI 2021 Race-Free eGFR (Inker et al., NEJM 2021; KDIGO 2024 Guidelines)
 * - Cockcroft-Gault CrCl with IBW and Adjusted Body Weight (FDA Renal Dosing Standard)
 * - CHA2DS2-VASc & HAS-BLED (AHA/ACC/HRS 2023 & ESC 2024 Atrial Fibrillation Guidelines)
 * - Wells PE Score & PERC Rule (Kline et al., CHEST; Konstantinides et al., ESC Guidelines)
 * - Wells DVT Score (Wells et al., NEJM / Lancet)
 * - CURB-65 Pneumonia Severity Score (Lim et al., Thorax; ATS/IDSA Guidelines)
 * - MELD-Na 2016 (UNOS Organ Sharing Standard; Kim et al., NEJM 2016)
 * - Child-Pugh Score for Cirrhosis (Child & Turcotte; Pugh et al., Br J Surg)
 * - Corrected Sodium (Katz & Hillier formulas), Serum Osmolality & Albumin-Corrected Anion Gap
 */

// ==========================================
// 1. CKD-EPI 2021 & Cockcroft-Gault CrCl
// ==========================================

export interface CkdEpiInput {
  age: number;
  sex: 'female' | 'male';
  scrMgDl: number;
}

export interface CkdEpiResult {
  egfr: number;
  stage: string;
  stageDescription: string;
  recommendation: string;
  citation: string;
}

export function calculateCkdEpi2021(input: CkdEpiInput): CkdEpiResult {
  const { age, sex, scrMgDl } = input;
  const isFemale = sex === 'female';
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const genderMult = isFemale ? 1.012 : 1.0;

  const minRatio = Math.min(scrMgDl / kappa, 1.0);
  const maxRatio = Math.max(scrMgDl / kappa, 1.0);

  // CKD-EPI 2021 Race-Free formula:
  // eGFR = 142 * (min(Scr/kappa, 1)^alpha) * (max(Scr/kappa, 1)^-1.200) * (0.9938^Age) * (1.012 if female)
  const egfrRaw =
    142 *
    Math.pow(minRatio, alpha) *
    Math.pow(maxRatio, -1.2) *
    Math.pow(0.9938, age) *
    genderMult;

  const egfr = Math.round(egfrRaw * 10) / 10;

  let stage = 'G1';
  let stageDescription = 'Normal or high kidney function';
  let recommendation = 'eGFR >= 90 mL/min/1.73m². In absence of kidney damage markers, kidney function is normal.';

  if (egfr < 15) {
    stage = 'G5';
    stageDescription = 'Kidney failure (ESRD)';
    recommendation = 'Urgent nephrology referral, prepare for renal replacement therapy (dialysis or kidney transplantation). Avoid nephrotoxic agents.';
  } else if (egfr < 30) {
    stage = 'G4';
    stageDescription = 'Severely decreased';
    recommendation = 'Nephrology referral, manage complications (anemia, MBD, metabolic acidosis), review and adjust all renal drug dosages.';
  } else if (egfr < 45) {
    stage = 'G3b';
    stageDescription = 'Moderately to severely decreased';
    recommendation = 'Close monitoring (q3-6mo), renal dosing adjustments required, SGLT2i/RASi consideration per KDIGO.';
  } else if (egfr < 60) {
    stage = 'G3a';
    stageDescription = 'Mildly to moderately decreased';
    recommendation = 'Diagnostic evaluation for persistent CKD, optimize blood pressure (<120 mmHg systolic per KDIGO 2024), screen for proteinuria.';
  } else if (egfr < 90) {
    stage = 'G2';
    stageDescription = 'Mildly decreased';
    recommendation = 'Normal for elderly; evaluate for albuminuria/hematuria to define CKD. Monitor cardiovascular risk factors.';
  }

  return {
    egfr,
    stage,
    stageDescription,
    recommendation,
    citation: 'Inker LA, et al. New Creatinine- and Cystatin C-Based Equations to Estimate GFR without Race. N Engl J Med 2021;385:1737-1749. Endorsed by KDIGO 2024.',
  };
}

export interface CockcroftGaultInput {
  age: number;
  sex: 'female' | 'male';
  weightKg: number;
  heightCm?: number;
  scrMgDl: number;
}

export interface CockcroftGaultResult {
  crClActual: number;
  crClIbw?: number;
  crClAdjusted?: number;
  ibwKg?: number;
  isObese?: boolean;
  recommendedCrCl: number;
  recommendationExplanation: string;
}

export function calculateCockcroftGault(input: CockcroftGaultInput): CockcroftGaultResult {
  const { age, sex, weightKg, heightCm, scrMgDl } = input;
  const isFemale = sex === 'female';
  const sexFactor = isFemale ? 0.85 : 1.0;

  // Actual weight Cockcroft-Gault
  const crClActual = Math.round((((140 - age) * weightKg) / (72 * scrMgDl)) * sexFactor * 10) / 10;

  let ibwKg: number | undefined;
  let crClIbw: number | undefined;
  let crClAdjusted: number | undefined;
  let isObese = false;
  let recommendedCrCl = crClActual;
  let recommendationExplanation = 'Using actual total body weight.';

  if (heightCm && heightCm > 120) {
    const heightInches = heightCm / 2.54;
    const baseIbw = isFemale ? 45.5 : 50.0;
    ibwKg = Math.round((baseIbw + 2.3 * Math.max(0, heightInches - 60)) * 10) / 10;

    crClIbw = Math.round((((140 - age) * ibwKg) / (72 * scrMgDl)) * sexFactor * 10) / 10;

    // If actual weight > 120% of IBW, patient is overweight/obese
    if (weightKg > 1.2 * ibwKg) {
      isObese = true;
      const abwKg = ibwKg + 0.4 * (weightKg - ibwKg);
      crClAdjusted = Math.round((((140 - age) * abwKg) / (72 * scrMgDl)) * sexFactor * 10) / 10;
      recommendedCrCl = crClAdjusted;
      recommendationExplanation = 'Actual weight is >120% of IBW. Using Adjusted Body Weight (ABW = IBW + 0.4 × [TBW - IBW]) to prevent CrCl overestimation.';
    } else if (weightKg < ibwKg) {
      // If underweight, use actual weight to avoid overestimating clearance
      recommendedCrCl = crClActual;
      recommendationExplanation = 'Patient is underweight (TBW < IBW). Actual weight used to avoid overestimating clearance.';
    } else {
      recommendedCrCl = crClIbw;
      recommendationExplanation = 'Using Ideal Body Weight (IBW).';
    }
  }

  return {
    crClActual,
    crClIbw,
    crClAdjusted,
    ibwKg,
    isObese,
    recommendedCrCl,
    recommendationExplanation,
  };
}

// ==========================================
// 2. CHA2DS2-VASc & HAS-BLED (Anticoagulation)
// ==========================================

export interface Cha2ds2VascInput {
  congestiveHeartFailure: boolean; // C = 1
  hypertension: boolean;           // H = 1
  ageYears: number;                // A2 = 2 if >= 75, 1 if 65-74
  diabetes: boolean;               // D = 1
  priorStrokeTiaThromboembolism: boolean; // S2 = 2
  vascularDisease: boolean;        // V = 1 (prior MI, PAD, aortic plaque)
  sex: 'female' | 'male';          // Sc = 1 if female
}

export interface Cha2ds2VascResult {
  score: number;
  annualStrokeRiskPercent: number;
  guidelineRecommendation: string;
  recommendationLevel: 'none' | 'consider' | 'recommended';
  citation: string;
}

export function calculateCha2ds2Vasc(input: Cha2ds2VascInput): Cha2ds2VascResult {
  let score = 0;
  if (input.congestiveHeartFailure) score += 1;
  if (input.hypertension) score += 1;
  if (input.ageYears >= 75) {
    score += 2;
  } else if (input.ageYears >= 65) {
    score += 1;
  }
  if (input.diabetes) score += 1;
  if (input.priorStrokeTiaThromboembolism) score += 2;
  if (input.vascularDisease) score += 1;
  if (input.sex === 'female') score += 1;

  // Annual adjusted stroke rate (% per year, Lip et al. Chest 2010; AHA/ACC/HRS 2023)
  const strokeRates: Record<number, number> = {
    0: 0.2,
    1: 0.6,
    2: 2.2,
    3: 3.2,
    4: 4.8,
    5: 7.2,
    6: 9.7,
    7: 11.2,
    8: 12.5,
    9: 15.2,
  };

  const annualStrokeRiskPercent = strokeRates[Math.min(score, 9)] ?? 15.2;

  // AHA/ACC/HRS & ESC guidelines threshold
  // In males, non-sex score >= 2 -> recommend, 1 -> consider
  // In females, non-sex score >= 2 (total >= 3) -> recommend, 1 (total 2) -> consider
  const nonSexScore = input.sex === 'female' ? score - 1 : score;

  let guidelineRecommendation = '';
  let recommendationLevel: 'none' | 'consider' | 'recommended' = 'none';

  if (nonSexScore >= 2) {
    recommendationLevel = 'recommended';
    guidelineRecommendation = 'Oral anticoagulation (DOAC strongly preferred over Warfarin) is recommended (Class I). DOAC choices include Apixaban, Rivaroxaban, Dabigatran, or Edoxaban unless mechanical heart valve or moderate-to-severe mitral stenosis.';
  } else if (nonSexScore === 1) {
    recommendationLevel = 'consider';
    guidelineRecommendation = 'Oral anticoagulation should be considered (Class IIa). Weigh individual ischemic stroke risk against bleeding risk (HAS-BLED) and patient values.';
  } else {
    recommendationLevel = 'none';
    guidelineRecommendation = 'Low risk. No antithrombotic therapy recommended (Class III Harm for aspirin/antiplatelet monotherapy). Re-evaluate risk periodically.';
  }

  return {
    score,
    annualStrokeRiskPercent,
    guidelineRecommendation,
    recommendationLevel,
    citation: '2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation. Circulation 2024;149:e1-e156; ESC 2024 AF Guidelines.',
  };
}

export interface HasBledInput {
  hypertensionSbpOver160: boolean; // H = 1
  abnormalRenalFunction: boolean;  // A = 1
  abnormalLiverFunction: boolean;  // A = 1
  priorStroke: boolean;            // S = 1
  bleedingHistoryOrPredisposition: boolean; // B = 1
  labileInrs: boolean;             // L = 1 (TTR < 60%)
  elderlyAgeOver65: boolean;       // E = 1
  drugsAntiplateletsNsaids: boolean; // D = 1
  alcoholExcess: boolean;          // D = 1
}

export interface HasBledResult {
  score: number;
  riskCategory: 'Low' | 'Moderate' | 'High';
  annualBleedRiskPercent: number;
  clinicalAction: string;
  citation: string;
}

export function calculateHasBled(input: HasBledInput): HasBledResult {
  let score = 0;
  if (input.hypertensionSbpOver160) score += 1;
  if (input.abnormalRenalFunction) score += 1;
  if (input.abnormalLiverFunction) score += 1;
  if (input.priorStroke) score += 1;
  if (input.bleedingHistoryOrPredisposition) score += 1;
  if (input.labileInrs) score += 1;
  if (input.elderlyAgeOver65) score += 1;
  if (input.drugsAntiplateletsNsaids) score += 1;
  if (input.alcoholExcess) score += 1;

  const bleedRates: Record<number, number> = {
    0: 1.13,
    1: 1.02,
    2: 1.88,
    3: 3.74,
    4: 8.70,
    5: 12.50,
  };

  const annualBleedRiskPercent = bleedRates[Math.min(score, 5)] ?? 12.5;
  const riskCategory: 'Low' | 'Moderate' | 'High' = score >= 3 ? 'High' : score === 2 ? 'Moderate' : 'Low';

  const clinicalAction = score >= 3
    ? 'High bleeding risk (HAS-BLED >= 3). Caution and regular clinical review. High score is NOT an absolute contraindication to oral anticoagulation, but mandates addressing reversible bleeding risks (BP control, stopping unnecessary NSAIDs/antiplatelets, alcohol cessation, frequent INR checks if on warfarin, or switching to DOAC).'
    : 'Low to moderate bleeding risk. Address any modifiable risk factors and schedule routine follow-up.';

  return {
    score,
    riskCategory,
    annualBleedRiskPercent,
    clinicalAction,
    citation: 'Pisters R, et al. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation. Chest 2010;138(5):1093-1100.',
  };
}

// ==========================================
// 3. Wells PE Score & PERC Rule & Wells DVT
// ==========================================

export interface WellsPeInput {
  dvtClinicalSigns: boolean;         // +3.0
  peLikelyOrNumberOne: boolean;      // +3.0
  heartRateOver100: boolean;          // +1.5
  immobilizationOrSurgery4w: boolean; // +1.5
  priorDvtPe: boolean;               // +1.5
  hemoptysis: boolean;               // +1.0
  activeMalignancy: boolean;         // +1.0
}

export interface WellsPeResult {
  score: number;
  twoTierCategory: 'PE Unlikely' | 'PE Likely';
  threeTierCategory: 'Low' | 'Moderate' | 'High';
  diagnosticStrategy: string;
  citation: string;
}

export function calculateWellsPe(input: WellsPeInput): WellsPeResult {
  let score = 0;
  if (input.dvtClinicalSigns) score += 3.0;
  if (input.peLikelyOrNumberOne) score += 3.0;
  if (input.heartRateOver100) score += 1.5;
  if (input.immobilizationOrSurgery4w) score += 1.5;
  if (input.priorDvtPe) score += 1.5;
  if (input.hemoptysis) score += 1.0;
  if (input.activeMalignancy) score += 1.0;

  const scoreRounded = Math.round(score * 10) / 10;
  const twoTierCategory = scoreRounded > 4.0 ? 'PE Likely' : 'PE Unlikely';
  
  let threeTierCategory: 'Low' | 'Moderate' | 'High' = 'Low';
  if (scoreRounded >= 7.0) threeTierCategory = 'High';
  else if (scoreRounded >= 2.0) threeTierCategory = 'Moderate';

  let diagnosticStrategy = '';
  if (twoTierCategory === 'PE Likely') {
    diagnosticStrategy = 'Score > 4.0 (PE Likely, ~28-40% prevalence). Proceed directly to diagnostic imaging: Computed Tomography Pulmonary Angiography (CTPA) or V/Q scan if renal impairment/contrast allergy. D-dimer is not recommended as a rule-out.';
  } else {
    diagnosticStrategy = 'Score <= 4.0 (PE Unlikely, ~8-12% prevalence). Order high-sensitivity D-dimer testing (or age-adjusted D-dimer: Age × 10 ug/L if age > 50). If D-dimer is negative, PE is safely ruled out without imaging. If positive, order CTPA.';
  }

  return {
    score: scoreRounded,
    twoTierCategory,
    threeTierCategory,
    diagnosticStrategy,
    citation: 'Wells PS, et al. Derivation of a simple clinical model to categorize patients probability of pulmonary embolism. Thromb Haemost 2000;83:416-420. CHEST / ESC 2019.',
  };
}

export interface PercRuleInput {
  ageUnder50: boolean;
  heartRateUnder100: boolean;
  spo2Over94Percent: boolean;
  noUnilateralLegSwelling: boolean;
  noHemoptysis: boolean;
  noRecentSurgeryTrauma4w: boolean;
  noPriorDvtPe: boolean;
  noOralHormoneUse: boolean;
}

export interface PercRuleResult {
  criteriaCountMet: number;
  isPercNegative: boolean;
  recommendation: string;
  citation: string;
}

export function evaluatePercRule(input: PercRuleInput): PercRuleResult {
  const criteria = [
    input.ageUnder50,
    input.heartRateUnder100,
    input.spo2Over94Percent,
    input.noUnilateralLegSwelling,
    input.noHemoptysis,
    input.noRecentSurgeryTrauma4w,
    input.noPriorDvtPe,
    input.noOralHormoneUse,
  ];

  const criteriaCountMet = criteria.filter(Boolean).length;
  const isPercNegative = criteriaCountMet === 8;

  let recommendation = '';
  if (isPercNegative) {
    recommendation = 'All 8 PERC criteria met. In a patient with low clinical gestalt/probability (<15%), PE is ruled out. No D-dimer or CTPA imaging is required (<1.8% risk of VTE without testing).';
  } else {
    recommendation = `PERC Rule POSITIVE (${8 - criteriaCountMet} criteria failed). PERC cannot rule out PE. Proceed with standard diagnostic pathway: Wells Score and D-dimer testing.`;
  }

  return {
    criteriaCountMet,
    isPercNegative,
    recommendation,
    citation: 'Kline JA, et al. Prospective multicenter evaluation of the pulmonary embolism rule-out criteria. J Thromb Haemost 2008;6(5):772-780.',
  };
}

export interface WellsDvtInput {
  activeCancer: boolean;                         // +1
  paralysisParesisOrPlaster: boolean;            // +1
  bedriddenOver3DaysOrMajorSurgery12w: boolean;  // +1
  localizedTendernessAlongDeepVeins: boolean;    // +1
  entireLegSwollen: boolean;                     // +1
  calfSwellingOver3cmComparedToOther: boolean;   // +1
  pittingEdemaGreaterInSymptomaticLeg: boolean;  // +1
  collateralSuperficialVeinsNonVaricose: boolean;// +1
  alternativeDiagnosisAtLeastAsLikely: boolean; // -2
}

export interface WellsDvtResult {
  score: number;
  category: 'DVT Unlikely' | 'DVT Likely';
  dvtProbabilityPercent: string;
  management: string;
  citation: string;
}

export function calculateWellsDvt(input: WellsDvtInput): WellsDvtResult {
  let score = 0;
  if (input.activeCancer) score += 1;
  if (input.paralysisParesisOrPlaster) score += 1;
  if (input.bedriddenOver3DaysOrMajorSurgery12w) score += 1;
  if (input.localizedTendernessAlongDeepVeins) score += 1;
  if (input.entireLegSwollen) score += 1;
  if (input.calfSwellingOver3cmComparedToOther) score += 1;
  if (input.pittingEdemaGreaterInSymptomaticLeg) score += 1;
  if (input.collateralSuperficialVeinsNonVaricose) score += 1;
  if (input.alternativeDiagnosisAtLeastAsLikely) score -= 2;

  const category = score >= 2 ? 'DVT Likely' : 'DVT Unlikely';
  const dvtProbabilityPercent = score >= 2 ? '28% (High probability)' : '5% (Low probability)';

  let management = '';
  if (category === 'DVT Likely') {
    management = 'Score >= 2: Compression Duplex Ultrasound of proximal deep veins indicated. If ultrasound is unavailable or delayed, consider starting interim anticoagulation if bleeding risk is acceptable.';
  } else {
    management = 'Score <= 1: High-sensitivity D-dimer indicated. If D-dimer is normal (<500 ng/mL), DVT is ruled out. If elevated, proceed to duplex venous ultrasound.';
  }

  return {
    score,
    category,
    dvtProbabilityPercent,
    management,
    citation: 'Wells PS, et al. Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis. N Engl J Med 2003;349:1227-1235.',
  };
}

// ==========================================
// 4. CURB-65 Pneumonia Severity Score
// ==========================================

export interface Curb65Input {
  confusion: boolean;            // C: new mental confusion / AMT <= 8
  ureaOver7MmolLOrBunOver19: boolean; // U: BUN > 19 mg/dL (7 mmol/L)
  respiratoryRate30OrMore: boolean;   // R: RR >= 30 breaths/min
  lowBloodPressure: boolean;     // B: SBP < 90 or DBP <= 60 mmHg
  age65OrMore: boolean;          // 65: Age >= 65 years
}

export interface Curb65Result {
  score: number;
  mortality30DayPercent: number;
  riskGroup: 'Low' | 'Intermediate' | 'Severe';
  careSiteRecommendation: string;
  antibioticGuideline: string;
  citation: string;
}

export function calculateCurb65(input: Curb65Input): Curb65Result {
  let score = 0;
  if (input.confusion) score += 1;
  if (input.ureaOver7MmolLOrBunOver19) score += 1;
  if (input.respiratoryRate30OrMore) score += 1;
  if (input.lowBloodPressure) score += 1;
  if (input.age65OrMore) score += 1;

  const mortalityMap: Record<number, number> = {
    0: 0.6,
    1: 2.7,
    2: 6.8,
    3: 14.0,
    4: 27.8,
    5: 27.8,
  };

  const mortality30DayPercent = mortalityMap[score] ?? 27.8;

  let riskGroup: 'Low' | 'Intermediate' | 'Severe' = 'Low';
  let careSiteRecommendation = '';
  let antibioticGuideline = '';

  if (score <= 1) {
    riskGroup = 'Low';
    careSiteRecommendation = 'Score 0-1: Low mortality (~1.5%). Suitable for outpatient management if clinically stable and social situation allows.';
    antibioticGuideline = 'Amoxicillin 1g TID PO, or Doxycycline 100mg BID, or Macrolide (if low local resistance) per ATS/IDSA guidelines.';
  } else if (score === 2) {
    riskGroup = 'Intermediate';
    careSiteRecommendation = 'Score 2: Moderate mortality (~6.8%). Inpatient ward admission or supervised outpatient observation recommended.';
    antibioticGuideline = 'Inpatient medical ward: Beta-lactam (Ceftriaxone 1-2g IV q24h or Ampicillin-Sulbactam) + Macrolide (Azithromycin 500mg IV/PO), or respiratory fluoroquinolone.';
  } else {
    riskGroup = 'Severe';
    careSiteRecommendation = `Score ${score}: Severe pneumonia with high mortality (${mortality30DayPercent}%). Inpatient hospital admission required; urgent ICU assessment recommended for score >= 3.`;
    antibioticGuideline = 'Urgent IV broad-spectrum dual coverage (Ceftriaxone/Cefotaxime + Azithromycin or Levofloxacin). Screen for MRSA / Pseudomonas risk factors.';
  }

  return {
    score,
    mortality30DayPercent,
    riskGroup,
    careSiteRecommendation,
    antibioticGuideline,
    citation: 'Lim WS, et al. Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study. Thorax 2003;58:377-382. ATS/IDSA CAP Guidelines.',
  };
}

// ==========================================
// 5. MELD-Na 2016 & Child-Pugh Score
// ==========================================

export interface MeldNaInput {
  bilirubinMgDl: number;
  inr: number;
  creatinineMgDl: number;
  sodiumMeqL: number;
  dialysisTwiceInPastWeek: boolean;
}

export interface MeldNaResult {
  meldInitial: number;
  meldNa: number;
  estimated90DayMortalityPercent: number;
  clinicalInterpretation: string;
  citation: string;
}

export function calculateMeldNa2016(input: MeldNaInput): MeldNaResult {
  const { bilirubinMgDl, inr, sodiumMeqL, dialysisTwiceInPastWeek } = input;

  // UNOS 2016 boundaries:
  // Creatinine capped at 4.0 mg/dL max, 1.0 min. If dialysis >= 2x in past 7 days, Cr is set to 4.0.
  const cr = dialysisTwiceInPastWeek ? 4.0 : Math.max(1.0, Math.min(4.0, input.creatinineMgDl));
  const bili = Math.max(1.0, bilirubinMgDl);
  const inrVal = Math.max(1.0, inr);

  // MELD(i) = 9.57 * ln(Cr) + 3.78 * ln(Bili) + 11.2 * ln(INR) + 6.43
  const rawMeldI = 9.57 * Math.log(cr) + 3.78 * Math.log(bili) + 11.2 * Math.log(inrVal) + 6.43;
  const meldInitial = Math.round(rawMeldI);

  let meldNa = meldInitial;

  if (meldInitial > 11) {
    // Serum sodium is bounded between 125 and 137 mEq/L
    const boundedNa = Math.max(125, Math.min(137, sodiumMeqL));
    // MELD-Na = MELD(i) + 1.32 * (137 - Na) - [0.033 * MELD(i) * (137 - Na)]
    const rawMeldNa =
      rawMeldI + 1.32 * (137 - boundedNa) - 0.033 * rawMeldI * (137 - boundedNa);
    meldNa = Math.round(rawMeldNa);
  }

  // Capped at 40 max, 6 min by UNOS
  meldNa = Math.max(6, Math.min(40, meldNa));

  let estimated90DayMortalityPercent = 1.9;
  if (meldNa >= 40) estimated90DayMortalityPercent = 71.3;
  else if (meldNa >= 30) estimated90DayMortalityPercent = 52.6;
  else if (meldNa >= 20) estimated90DayMortalityPercent = 19.6;
  else if (meldNa >= 15) estimated90DayMortalityPercent = 6.0;
  else if (meldNa >= 10) estimated90DayMortalityPercent = 2.5;

  let clinicalInterpretation = '';
  if (meldNa >= 25) {
    clinicalInterpretation = 'Critically high 90-day liver failure mortality. Urgent liver transplant evaluation and intensive inpatient hepatology care indicated.';
  } else if (meldNa >= 15) {
    clinicalInterpretation = 'Transplant benefit threshold (MELD >= 15). Qualifies for active liver transplantation waitlist registration. Monitor for complications of portal hypertension.';
  } else {
    clinicalInterpretation = 'Low short-term mortality risk (<6%). Routine cirrhosis outpatient surveillance for HCC and varices; optimize etiology management.';
  }

  return {
    meldInitial,
    meldNa,
    estimated90DayMortalityPercent,
    clinicalInterpretation,
    citation: 'Kim WR, et al. Hyponatremia and Mortality among Patients on the Liver-Transplant Waiting List. N Engl J Med 2008;359:1018-1026. UNOS 2016 standard.',
  };
}

export interface ChildPughInput {
  bilirubinMgDl: number;
  albuminGDl: number;
  inr: number;
  ascites: 'none' | 'slight_controlled' | 'moderate_refractory';
  encephalopathy: 'none' | 'grade_1_2' | 'grade_3_4';
}

export interface ChildPughResult {
  score: number;
  childClass: 'A' | 'B' | 'C';
  oneYearSurvivalPercent: number;
  twoYearSurvivalPercent: number;
  surgicalRisk: string;
  citation: string;
}

export function calculateChildPugh(input: ChildPughInput): ChildPughResult {
  let score = 0;

  // Bilirubin
  if (input.bilirubinMgDl < 2.0) score += 1;
  else if (input.bilirubinMgDl <= 3.0) score += 2;
  else score += 3;

  // Albumin
  if (input.albuminGDl > 3.5) score += 1;
  else if (input.albuminGDl >= 2.8) score += 2;
  else score += 3;

  // INR
  if (input.inr < 1.7) score += 1;
  else if (input.inr <= 2.2) score += 2;
  else score += 3;

  // Ascites
  if (input.ascites === 'none') score += 1;
  else if (input.ascites === 'slight_controlled') score += 2;
  else score += 3;

  // Encephalopathy
  if (input.encephalopathy === 'none') score += 1;
  else if (input.encephalopathy === 'grade_1_2') score += 2;
  else score += 3;

  let childClass: 'A' | 'B' | 'C' = 'A';
  let oneYearSurvivalPercent = 100;
  let twoYearSurvivalPercent = 85;
  let surgicalRisk = 'Low perioperative mortality (~10%). Well tolerated.';

  if (score >= 10) {
    childClass = 'C';
    oneYearSurvivalPercent = 45;
    twoYearSurvivalPercent = 35;
    surgicalRisk = 'Extremely high perioperative mortality (>70-80%). Elective surgery contraindicated; liver transplant evaluation warranted.';
  } else if (score >= 7) {
    childClass = 'B';
    oneYearSurvivalPercent = 80;
    twoYearSurvivalPercent = 60;
    surgicalRisk = 'Substantial perioperative mortality (~30-35%). Careful optimization, avoid major hepatic resection.';
  }

  return {
    score,
    childClass,
    oneYearSurvivalPercent,
    twoYearSurvivalPercent,
    surgicalRisk,
    citation: 'Pugh RN, et al. Transection of the oesophagus for bleeding oesophageal varices. Br J Surg 1973;60(8):646-649.',
  };
}

// ==========================================
// 6. Electrolytes & Acid-Base Suite
// ==========================================

export interface ElectrolyteInput {
  measuredNaMeqL: number;
  glucoseMgDl: number;
  bunMgDl: number;
  measuredK?: number;
  clMeqL?: number;
  hco3MeqL?: number;
  measuredAlbuminGDl?: number;
  measuredOsmolality?: number;
}

export interface ElectrolyteResult {
  correctedNaKatz: number;
  correctedNaHillier: number;
  calculatedOsmolality: number;
  osmolarGap?: number;
  anionGap?: number;
  albuminCorrectedAnionGap?: number;
  deltaDeltaRatio?: number;
  deltaInterpretation?: string;
  acidBaseCommentary?: string;
}

export function calculateElectrolytes(input: ElectrolyteInput): ElectrolyteResult {
  const { measuredNaMeqL, glucoseMgDl, bunMgDl, clMeqL, hco3MeqL, measuredAlbuminGDl, measuredOsmolality } = input;

  const excessGlucose = Math.max(0, glucoseMgDl - 100);
  // Katz (1973): 1.6 mEq/L Na per 100 mg/dL glucose
  const correctedNaKatz = Math.round((measuredNaMeqL + 0.016 * excessGlucose) * 10) / 10;
  // Hillier (1999): 2.4 mEq/L Na per 100 mg/dL glucose
  const correctedNaHillier = Math.round((measuredNaMeqL + 0.024 * excessGlucose) * 10) / 10;

  // Calculated Osmolality (mOsm/kg) = 2 * Na + Glucose/18 + BUN/2.8
  const calculatedOsmolality = Math.round((2 * measuredNaMeqL + glucoseMgDl / 18 + bunMgDl / 2.8) * 10) / 10;

  let osmolarGap: number | undefined;
  if (measuredOsmolality !== undefined && measuredOsmolality > 0) {
    osmolarGap = Math.round((measuredOsmolality - calculatedOsmolality) * 10) / 10;
  }

  let anionGap: number | undefined;
  let albuminCorrectedAnionGap: number | undefined;
  let deltaDeltaRatio: number | undefined;
  let deltaInterpretation: string | undefined;
  let acidBaseCommentary: string | undefined;

  if (clMeqL !== undefined && hco3MeqL !== undefined) {
    // Standard Anion Gap = Na - (Cl + HCO3)
    const rawAg = measuredNaMeqL - (clMeqL + hco3MeqL);
    anionGap = Math.round(rawAg * 10) / 10;

    if (measuredAlbuminGDl !== undefined && measuredAlbuminGDl > 0) {
      // Albumin corrected AG: AG + 2.5 * (4.0 - Albumin)
      const corrAg = rawAg + 2.5 * (4.0 - measuredAlbuminGDl);
      albuminCorrectedAnionGap = Math.round(corrAg * 10) / 10;
    }

    const effectiveAg = albuminCorrectedAnionGap ?? anionGap;

    // Delta-Delta: (AG - 12) / (24 - HCO3)
    if (effectiveAg > 12 && hco3MeqL < 24) {
      const deltaAg = effectiveAg - 12;
      const deltaHco3 = 24 - hco3MeqL;
      if (deltaHco3 !== 0) {
        deltaDeltaRatio = Math.round((deltaAg / deltaHco3) * 100) / 100;
        if (deltaDeltaRatio < 0.8) {
          deltaInterpretation = 'Delta Ratio < 0.8: Mixed High Anion Gap Metabolic Acidosis (HAGMA) AND Normal Anion Gap Metabolic Acidosis (NAGMA).';
        } else if (deltaDeltaRatio <= 1.6) {
          deltaInterpretation = 'Delta Ratio 0.8 - 1.6: Pure High Anion Gap Metabolic Acidosis (HAGMA), typical for DKA, lactic acidosis, uremia, or toxic alcohols.';
        } else {
          deltaInterpretation = 'Delta Ratio > 1.6: High Anion Gap Metabolic Acidosis (HAGMA) AND concurrent Metabolic Alkalosis or preexisting respiratory acidosis compensation.';
        }
      }
    }

    if (effectiveAg > 12) {
      acidBaseCommentary = `High Anion Gap (${effectiveAg} mEq/L, normal 8-12). Consider GOLD MARK etiology (Glycols, Oxoproline, L-lactate, D-lactate, Methanol, Aspirin, Renal failure, Ketoacidosis).`;
    } else {
      acidBaseCommentary = `Normal Anion Gap (${effectiveAg} mEq/L). If metabolic acidosis is present, consider diarrhea, RTA, or normal saline infusion (NAGMA).`;
    }
  }

  return {
    correctedNaKatz,
    correctedNaHillier,
    calculatedOsmolality,
    osmolarGap,
    anionGap,
    albuminCorrectedAnionGap,
    deltaDeltaRatio,
    deltaInterpretation,
    acidBaseCommentary,
  };
}

// ==========================================
// 7. Pneumonia Severity Index (PSI / PORT)
// ==========================================

export interface PsiPortInput {
  ageYears: number;
  sex: 'female' | 'male';
  nursingHomeResident: boolean;        // +10
  neoplasticDisease: boolean;          // +30 (active or past year)
  liverDisease: boolean;               // +20 (cirrhosis or chronic hepatitis)
  congestiveHeartFailure: boolean;     // +10
  cerebrovascularDisease: boolean;     // +10 (prior stroke/TIA)
  renalDisease: boolean;               // +10 (CKD or baseline elevated Cr)
  alteredMentalStatus: boolean;        // +20 (disorientation, stupor, coma)
  respiratoryRate30OrMore: boolean;    // +20 (RR >= 30 bpm)
  systolicBpUnder90: boolean;          // +20 (SBP < 90 mmHg)
  temperatureUnder35OrOver40: boolean; // +15 (T < 35°C or >= 40°C)
  pulse125OrMore: boolean;             // +10 (HR >= 125 bpm)
  arterialPhUnder7_35: boolean;        // +30 (pH < 7.35)
  bun30OrMore: boolean;                // +20 (BUN >= 30 mg/dL / 10.7 mmol/L)
  sodiumUnder130: boolean;             // +20 (Na < 130 mEq/L)
  glucose250OrMore: boolean;           // +10 (Glucose >= 250 mg/dL / 13.9 mmol/L)
  hematocritUnder30: boolean;          // +10 (Hct < 30%)
  pao2Under60OrSpo2Under90: boolean;   // +10 (PaO2 < 60 mmHg or SpO2 < 90%)
  pleuralEffusion: boolean;            // +10 (Pleural effusion on imaging)
}

export interface PsiPortResult {
  score: number;
  riskClass: 'Class I' | 'Class II' | 'Class III' | 'Class IV' | 'Class V';
  mortality30DayPercent: number;
  recommendedSetting: 'Outpatient' | 'Outpatient or Observation Unit' | 'Inpatient Medical Ward' | 'Inpatient ICU / High Dependency';
  managementGuideline: string;
  citation: string;
}

export function calculatePsiPort(input: PsiPortInput): PsiPortResult {
  const isFemale = input.sex === 'female';
  // Step 1: Base demographic score
  let score = isFemale ? Math.max(0, input.ageYears - 10) : input.ageYears;

  if (input.nursingHomeResident) score += 10;

  // Comorbidities
  if (input.neoplasticDisease) score += 30;
  if (input.liverDisease) score += 20;
  if (input.congestiveHeartFailure) score += 10;
  if (input.cerebrovascularDisease) score += 10;
  if (input.renalDisease) score += 10;

  // Physical examination
  if (input.alteredMentalStatus) score += 20;
  if (input.respiratoryRate30OrMore) score += 20;
  if (input.systolicBpUnder90) score += 20;
  if (input.temperatureUnder35OrOver40) score += 15;
  if (input.pulse125OrMore) score += 10;

  // Laboratory & Radiographic
  if (input.arterialPhUnder7_35) score += 30;
  if (input.bun30OrMore) score += 20;
  if (input.sodiumUnder130) score += 20;
  if (input.glucose250OrMore) score += 10;
  if (input.hematocritUnder30) score += 10;
  if (input.pao2Under60OrSpo2Under90) score += 10;
  if (input.pleuralEffusion) score += 10;

  // Step 2: Stratification into PSI Risk Classes
  const hasComorbidities =
    input.neoplasticDisease ||
    input.liverDisease ||
    input.congestiveHeartFailure ||
    input.cerebrovascularDisease ||
    input.renalDisease;

  const hasAbnormalExam =
    input.alteredMentalStatus ||
    input.respiratoryRate30OrMore ||
    input.systolicBpUnder90 ||
    input.temperatureUnder35OrOver40 ||
    input.pulse125OrMore;

  const hasLabRadiographic =
    input.arterialPhUnder7_35 ||
    input.bun30OrMore ||
    input.sodiumUnder130 ||
    input.glucose250OrMore ||
    input.hematocritUnder30 ||
    input.pao2Under60OrSpo2Under90 ||
    input.pleuralEffusion;

  let riskClass: PsiPortResult['riskClass'];
  let mortality30DayPercent: number;
  let recommendedSetting: PsiPortResult['recommendedSetting'];
  let managementGuideline = '';

  // Class I: Age <= 50 and NO comorbidities, NO abnormal physical exam, NO nursing home, and NO lab/radiographic abnormalities
  if (
    input.ageYears <= 50 &&
    !hasComorbidities &&
    !hasAbnormalExam &&
    !input.nursingHomeResident &&
    !hasLabRadiographic
  ) {
    riskClass = 'Class I';
    mortality30DayPercent = 0.1;
    recommendedSetting = 'Outpatient';
    managementGuideline =
      'PSI Class I (Mortality 0.1%): Extremely low mortality risk. Suitable for outpatient oral antimicrobial therapy if oral intake tolerated and social support available.';
  } else if (score <= 70) {
    riskClass = 'Class II';
    mortality30DayPercent = 0.6;
    recommendedSetting = 'Outpatient';
    managementGuideline =
      'PSI Class II (<= 70 points, Mortality 0.6%): Low mortality risk. Safe for outpatient management per ATS/IDSA guidelines.';
  } else if (score <= 90) {
    riskClass = 'Class III';
    mortality30DayPercent = 2.8;
    recommendedSetting = 'Outpatient or Observation Unit';
    managementGuideline =
      'PSI Class III (71-90 points, Mortality 2.8%): Low-to-intermediate risk. Consider a short-stay observation unit (24h) or inpatient ward admission if unable to maintain oral intake or borderline oxygenation.';
  } else if (score <= 130) {
    riskClass = 'Class IV';
    mortality30DayPercent = 8.2;
    recommendedSetting = 'Inpatient Medical Ward';
    managementGuideline =
      'PSI Class IV (91-130 points, Mortality 8.2%): Moderate-to-high risk. Inpatient medical ward admission required for parenteral antibiotic therapy and telemetry.';
  } else {
    riskClass = 'Class V';
    mortality30DayPercent = 29.2;
    recommendedSetting = 'Inpatient ICU / High Dependency';
    managementGuideline =
      'PSI Class V (> 130 points, Mortality 29.2%): Severe pneumonia with high mortality. Urgent ICU or high-dependency unit evaluation for invasive/non-invasive ventilatory support and vasopressors.';
  }

  return {
    score,
    riskClass,
    mortality30DayPercent,
    recommendedSetting,
    managementGuideline,
    citation: 'Fine MJ, et al. A prediction rule to identify low-risk patients with community-acquired pneumonia. N Engl J Med 1997;336(4):243-250. ATS/IDSA Community-Acquired Pneumonia Guidelines.',
  };
}
