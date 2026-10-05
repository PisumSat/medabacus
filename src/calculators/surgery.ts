/**
 * GENERAL SURGERY CLINICAL CALCULATIONS & SURGICAL DECISION SUITE
 * 
 * Evidence-based algorithms:
 * - Parkland Burn Resuscitation Formula & Wallace Rule of Nines (American Burn Association / ABA)
 * - Alvarado (MANTRELS) Score & Appendicitis Inflammatory Response (AIR) Score
 * - Revised Cardiac Risk Index (RCRI / Lee Index) for Preoperative Risk (AHA/ACC Guidelines)
 * - Caprini Score for Venous Thromboembolism Prophylaxis (CHEST & ASPS 2016 Guidelines)
 * - Surgical Apgar Score (SAS) (Gawande et al., J Am Coll Surg 2007)
 * - Glasgow-Imrie Criteria for Acute Pancreatitis (British Society of Gastroenterology)
 */

// ==========================================
// 1. Parkland Burn Resuscitation Formula & Rule of Nines
// ==========================================

export interface RuleOfNinesInput {
  headAndNeckPercent: number;    // Up to 9%
  anteriorTorsoPercent: number;  // Up to 18% (Chest 9%, Abdomen 9%)
  posteriorTorsoPercent: number; // Up to 18% (Upper back 9%, Lower back 9%)
  rightArmPercent: number;       // Up to 9%
  leftArmPercent: number;        // Up to 9%
  rightLegPercent: number;       // Up to 18% (Anterior 9%, Posterior 9%)
  leftLegPercent: number;        // Up to 18% (Anterior 9%, Posterior 9%)
  perineumPercent: number;       // Up to 1%
}

export function calculateRuleOfNinesTbsa(input: RuleOfNinesInput): number {
  const sum =
    input.headAndNeckPercent +
    input.anteriorTorsoPercent +
    input.posteriorTorsoPercent +
    input.rightArmPercent +
    input.leftArmPercent +
    input.rightLegPercent +
    input.leftLegPercent +
    input.perineumPercent;
  return Math.min(100, Math.round(sum * 10) / 10);
}

export interface ParklandBurnInput {
  weightKg: number;
  tbsaPercent: number;
  hoursElapsedSinceBurn?: number; // Parkland timing starts at moment of injury, NOT hospital arrival
  fluidMultiplierMlPerKgPerPercent?: number; // Standard is 4 mL/kg/%TBSA; ABA consensus suggests 2-4 mL
  isPediatric?: boolean;
  ageYears?: number;
}

export interface ParklandBurnResult {
  total24HourFluidMl: number;
  first8HoursTotalMl: number;
  remaining16HoursTotalMl: number;
  first8HoursRateMlPerHour: number;
  remaining16HoursRateMlPerHour: number;
  adjustedFirstPeriodRateMlPerHour?: number;
  hoursRemainingInFirst8h?: number;
  pediatricConcurrentMaintenanceMlPerHour?: number;
  totalFirstPeriodCombinedRateMlPerHour?: number;
  totalSecondPeriodCombinedRateMlPerHour?: number;
  targetUrineOutputMlPerHour: string;
  clinicalGuideline: string;
  citation: string;
}

export function getPediatricRuleOfNinesNorms(ageYears: number): {
  headPercent: number;
  torsoAntPercent: number;
  torsoPostPercent: number;
  eachArmPercent: number;
  eachLegPercent: number;
  perineumPercent: number;
} {
  // Lund-Browder age-based chart:
  // Infant (<1 yr): Head 18%, each leg 13.5%
  // 1-9 yrs: Head decreases by 1% per year, each leg increases by 0.5% per year
  // >= 10 yrs: Adult proportions (Head 9%, each leg 18%)
  const clampedAge = Math.max(0, Math.min(10, ageYears));
  const headPercent = Math.round((18 - clampedAge * 0.9) * 10) / 10;
  const eachLegPercent = Math.round((13.5 + clampedAge * 0.45) * 10) / 10;

  return {
    headPercent,
    torsoAntPercent: 18,
    torsoPostPercent: 18,
    eachArmPercent: 9,
    eachLegPercent,
    perineumPercent: 1,
  };
}

export function calculateParklandBurn(input: ParklandBurnInput): ParklandBurnResult {
  const {
    weightKg,
    tbsaPercent,
    hoursElapsedSinceBurn = 0,
    fluidMultiplierMlPerKgPerPercent = input.isPediatric ? 3 : 4,
    isPediatric = false,
  } = input;

  // Parkland Formula: Multiplier (mL/kg/%TBSA) * weight (kg) * % TBSA (2nd & 3rd degree burns only)
  const total24HourFluidMl = Math.round(fluidMultiplierMlPerKgPerPercent * weightKg * tbsaPercent);
  const first8HoursTotalMl = Math.round(total24HourFluidMl / 2);
  const remaining16HoursTotalMl = total24HourFluidMl - first8HoursTotalMl;

  const first8HoursRateMlPerHour = Math.round(first8HoursTotalMl / 8);
  const remaining16HoursRateMlPerHour = Math.round(remaining16HoursTotalMl / 16);

  let adjustedFirstPeriodRateMlPerHour: number | undefined;
  let hoursRemainingInFirst8h: number | undefined;

  if (hoursElapsedSinceBurn > 0 && hoursElapsedSinceBurn < 8) {
    hoursRemainingInFirst8h = Math.round((8 - hoursElapsedSinceBurn) * 10) / 10;
    // Deliver the full first 8-hour quota over the remaining hours of the first 8-hour window
    adjustedFirstPeriodRateMlPerHour = Math.round(first8HoursTotalMl / hoursRemainingInFirst8h);
  }

  // Target urine output: Adults: 0.5 - 1.0 mL/kg/h (30-50 mL/h); Pediatrics (<30 kg): 1.0 - 1.5 mL/kg/h
  let targetUrineOutputMlPerHour = '';
  let pediatricConcurrentMaintenanceMlPerHour: number | undefined;
  let totalFirstPeriodCombinedRateMlPerHour: number | undefined;
  let totalSecondPeriodCombinedRateMlPerHour: number | undefined;

  if (isPediatric || weightKg < 30) {
    const minUrine = Math.round(1.0 * weightKg * 10) / 10;
    const maxUrine = Math.round(1.5 * weightKg * 10) / 10;
    targetUrineOutputMlPerHour = `${minUrine} - ${maxUrine} mL/hr (1.0 - 1.5 mL/kg/hr)`;

    // Calculate Holliday-Segar hourly maintenance
    let hourlyMaint = 0;
    if (weightKg <= 10) hourlyMaint = weightKg * 4;
    else if (weightKg <= 20) hourlyMaint = 40 + (weightKg - 10) * 2;
    else hourlyMaint = 60 + (weightKg - 20) * 1;
    pediatricConcurrentMaintenanceMlPerHour = Math.round(hourlyMaint * 10) / 10;

    const baseFirstRate = adjustedFirstPeriodRateMlPerHour ?? first8HoursRateMlPerHour;
    totalFirstPeriodCombinedRateMlPerHour = Math.round(baseFirstRate + pediatricConcurrentMaintenanceMlPerHour);
    totalSecondPeriodCombinedRateMlPerHour = Math.round(remaining16HoursRateMlPerHour + pediatricConcurrentMaintenanceMlPerHour);
  } else {
    const minUrine = Math.round(0.5 * weightKg);
    const maxUrine = Math.round(1.0 * weightKg);
    targetUrineOutputMlPerHour = `${minUrine} - ${maxUrine} mL/hr (30 - 50 mL/hr minimum)`;
  }

  let clinicalGuideline =
    'Administer warmed Lactated Ringer’s (LR). The first 50% must be infused within 8 hours from time of injury (not arrival), and remaining 50% over the next 16 hours.';
  
  if (isPediatric || weightKg < 30) {
    clinicalGuideline +=
      ' PEDIATRIC ABA PROTOCOL: Children < 30 kg MUST receive maintenance dextrose fluid (D5 in 0.45% Normal Saline or D5LR) CONCURRENTLY with resuscitation fluids to prevent acute hypoglycemia and hyponatremia. Target urine output is 1.0-1.5 mL/kg/hr.';
  }

  if (hoursElapsedSinceBurn >= 8) {
    clinicalGuideline += ' NOTE: Patient presented >= 8 hours post-injury. Evaluate current clinical perfusion, vitals, and lactate; titrate infusion rates to urine output rather than rigid Parkland back-calculation.';
  }

  return {
    total24HourFluidMl,
    first8HoursTotalMl,
    remaining16HoursTotalMl,
    first8HoursRateMlPerHour,
    remaining16HoursRateMlPerHour,
    adjustedFirstPeriodRateMlPerHour,
    hoursRemainingInFirst8h,
    pediatricConcurrentMaintenanceMlPerHour,
    totalFirstPeriodCombinedRateMlPerHour,
    totalSecondPeriodCombinedRateMlPerHour,
    targetUrineOutputMlPerHour,
    clinicalGuideline,
    citation: 'Baxter CR. Clin Plast Surg 1974;1:693-703. American Burn Association (ABA) Burn Resuscitation Guidelines 2023.',
  };
}

// ==========================================
// 2. Alvarado & AIR Score (Appendicitis)
// ==========================================

export interface AlvaradoInput {
  migratoryRightIliacFossaPain: boolean; // M = 1
  anorexia: boolean;                     // A = 1
  nauseaOrVomiting: boolean;             // N = 1
  tendernessRightLowerQuadrant: boolean; // T = 2 (Key clinical sign)
  reboundTenderness: boolean;            // R = 1
  elevatedTemperatureOver37_3C: boolean; // E = 1 (>= 37.3°C / 99.1°F)
  leukocytosisWbcOver10: boolean;        // L = 2 (WBC > 10,000 /uL)
  shiftToTheLeftNeutrophilsOver75: boolean; // S = 1 (> 75% neutrophils)
}

export interface AlvaradoResult {
  score: number;
  riskCategory: 'Low Risk' | 'Intermediate / Compatible' | 'High Risk / Probable' | 'Very High / Definite';
  appendicitisProbability: string;
  recommendation: string;
  citation: string;
}

export function calculateAlvaradoScore(input: AlvaradoInput): AlvaradoResult {
  let score = 0;
  if (input.migratoryRightIliacFossaPain) score += 1;
  if (input.anorexia) score += 1;
  if (input.nauseaOrVomiting) score += 1;
  if (input.tendernessRightLowerQuadrant) score += 2;
  if (input.reboundTenderness) score += 1;
  if (input.elevatedTemperatureOver37_3C) score += 1;
  if (input.leukocytosisWbcOver10) score += 2;
  if (input.shiftToTheLeftNeutrophilsOver75) score += 1;

  let riskCategory: AlvaradoResult['riskCategory'] = 'Low Risk';
  let appendicitisProbability = '< 5%';
  let recommendation = '';

  if (score >= 9) {
    riskCategory = 'Very High / Definite';
    appendicitisProbability = '> 90%';
    recommendation = 'Definite acute appendicitis. Urgent surgical consultation for laparoscopic appendectomy. Imaging may not be necessary in adult males unless atypical features.';
  } else if (score >= 7) {
    riskCategory = 'High Risk / Probable';
    appendicitisProbability = '75 - 85%';
    recommendation = 'Probable acute appendicitis. Urgent surgical consult. Contrast-enhanced CT abdomen/pelvis (adults) or ultrasound (pediatrics/pregnancy/young females) recommended prior to OR.';
  } else if (score >= 5) {
    riskCategory = 'Intermediate / Compatible';
    appendicitisProbability = '30 - 50%';
    recommendation = 'Equivocal presentation. Inpatient surgical observation or contrast CT / ultrasound imaging indicated. Re-evaluate score in 4-6 hours; do not discharge prematurely.';
  } else {
    riskCategory = 'Low Risk';
    appendicitisProbability = '< 5%';
    recommendation = 'Acute appendicitis unlikely. Safe for outpatient evaluation with strict return precautions if symptoms worsen or migrate.';
  }

  return {
    score,
    riskCategory,
    appendicitisProbability,
    recommendation,
    citation: 'Alvarado A. A practical score for the early diagnosis of acute appendicitis. Ann Emerg Med 1986;15(5):557-564. WSES Jerusalem Guidelines 2020.',
  };
}

export interface AirScoreInput {
  vomiting: boolean;                             // +1
  painInRiq: boolean;                            // +1
  reboundTendernessDefense: 'none' | 'light' | 'medium' | 'strong'; // 0, 1, 2, 3
  bodyTempOver38_5C: boolean;                    // +1
  wbcCount: 'normal' | '10_to_14_9' | '15_or_more'; // 0, 1, 2
  neutrophilsPercent: 'under_70' | '70_to_84' | '85_or_more'; // 0, 1, 2
  crpMgL: 'under_10' | '10_to_49' | '50_or_more'; // 0, 1, 2
}

export interface AirScoreResult {
  score: number;
  riskGroup: 'Low Risk' | 'Intermediate Risk' | 'High Risk';
  recommendation: string;
  citation: string;
}

export function calculateAirScore(input: AirScoreInput): AirScoreResult {
  let score = 0;
  if (input.vomiting) score += 1;
  if (input.painInRiq) score += 1;

  if (input.reboundTendernessDefense === 'light') score += 1;
  else if (input.reboundTendernessDefense === 'medium') score += 2;
  else if (input.reboundTendernessDefense === 'strong') score += 3;

  if (input.bodyTempOver38_5C) score += 1;

  if (input.wbcCount === '10_to_14_9') score += 1;
  else if (input.wbcCount === '15_or_more') score += 2;

  if (input.neutrophilsPercent === '70_to_84') score += 1;
  else if (input.neutrophilsPercent === '85_or_more') score += 2;

  if (input.crpMgL === '10_to_49') score += 1;
  else if (input.crpMgL === '50_or_more') score += 2;

  let riskGroup: AirScoreResult['riskGroup'] = 'Low Risk';
  let recommendation = '';

  if (score >= 9) {
    riskGroup = 'High Risk';
    recommendation = 'AIR score 9-12 (High probability of appendicitis). Surgical exploration / laparoscopy recommended without delaying for redundant imaging.';
  } else if (score >= 5) {
    riskGroup = 'Intermediate Risk';
    recommendation = 'AIR score 5-8 (Indeterminate probability). Diagnostic imaging (US/CT) or diagnostic laparoscopy recommended per WSES guidelines.';
  } else {
    riskGroup = 'Low Risk';
    recommendation = 'AIR score 0-4 (Low probability). Outpatient observation with safety-net return instructions.';
  }

  return {
    score,
    riskGroup,
    recommendation,
    citation: 'Andersson M, Andersson RE. The appendicitis inflammatory response score: a tool for resolving suspicion of appendicitis. World J Surg 2008;32(6):1018-1025.',
  };
}

// ==========================================
// 3. Revised Cardiac Risk Index (RCRI / Lee)
// ==========================================

export interface RcriInput {
  highRiskSurgery: boolean;        // Intraperitoneal, intrathoracic, or suprainguinal vascular surgery
  ischemicHeartDisease: boolean;   // Hx of MI, positive stress test, angina, nitrate use, pathological Q waves
  historyOfChf: boolean;           // Hx of heart failure, pulmonary edema, PND, bibasilar rales, S3 gallop
  cerebrovascularDisease: boolean; // Prior TIA or stroke
  preoperativeInsulin: boolean;    // Diabetes mellitus requiring preoperative insulin
  preoperativeCreatinineOver2: boolean; // Serum creatinine > 2.0 mg/dL (177 umol/L)
}

export interface RcriResult {
  score: number;
  classCategory: 'Class I' | 'Class II' | 'Class III' | 'Class IV';
  maceRiskPercent: number;
  clinicalGuideline: string;
  citation: string;
}

export function calculateRcri(input: RcriInput): RcriResult {
  let score = 0;
  if (input.highRiskSurgery) score += 1;
  if (input.ischemicHeartDisease) score += 1;
  if (input.historyOfChf) score += 1;
  if (input.cerebrovascularDisease) score += 1;
  if (input.preoperativeInsulin) score += 1;
  if (input.preoperativeCreatinineOver2) score += 1;

  let classCategory: RcriResult['classCategory'] = 'Class I';
  let maceRiskPercent = 0.4;
  let clinicalGuideline = '';

  if (score >= 3) {
    classCategory = 'Class IV';
    maceRiskPercent = 11.0; // >= 11% major cardiac complications (MI, pulmonary edema, VF, cardiac arrest, complete heart block)
    clinicalGuideline =
      'High cardiac risk (MACE >= 11%). Cardiology consultation strongly advised. Evaluate functional capacity (METs < 4); obtain preoperative 12-lead ECG, baseline troponin, and consider pre-op echocardiogram or stress testing if it would alter management. Continue beta-blocker/statin if chronic.';
  } else if (score === 2) {
    classCategory = 'Class III';
    maceRiskPercent = 6.6;
    clinicalGuideline =
      'Moderate cardiac risk (MACE ~6.6%). Obtain baseline 12-lead ECG and cardiac biomarkers. Monitor intraoperative hemodynamics closely. Ensure tight perioperative glycemic and fluid control.';
  } else if (score === 1) {
    classCategory = 'Class II';
    maceRiskPercent = 0.9;
    clinicalGuideline =
      'Low cardiac risk (MACE ~0.9%). Preoperative ECG recommended if undergoing high-risk surgery or patient > 65yo. Routine clearance with standard perioperative monitoring.';
  } else {
    classCategory = 'Class I';
    maceRiskPercent = 0.4;
    clinicalGuideline =
      'Very low cardiac risk (MACE ~0.4%). Proceed to elective surgery without specialized preoperative cardiac testing.';
  }

  return {
    score,
    classCategory,
    maceRiskPercent,
    clinicalGuideline,
    citation: 'Lee TH, et al. Derivation and prospective validation of a simple index for prediction of cardiac risk of major noncardiac surgery. Circulation 1999;100(10):1043-1049. ACC/AHA Preoperative Cardiac Guidelines.',
  };
}

// ==========================================
// 4. Caprini VTE Prophylaxis Score (Surgery)
// ==========================================

export interface CapriniInput {
  ageYears: number; // 41-60: 1, 61-74: 2, >=75: 3
  minorSurgeryPlanned: boolean; // +1
  majorSurgeryOver45Min: boolean; // +2
  laparoscopicSurgeryOver45Min: boolean; // +2
  bmiOver25: boolean; // +1
  swollenLegsEdema: boolean; // +1
  varicoseVeins: boolean; // +1
  pregnancyOrPostpartum1m: boolean; // +1
  oralContraceptiveOrHrt: boolean; // +1
  sepsisPast1m: boolean; // +1
  seriousLungDiseasePast1m: boolean; // +1
  bedriddenConfinedToBed: boolean; // +2
  centralVenousAccess: boolean; // +2
  malignancyCurrentOrPast: boolean; // +2
  immobilizingPlasterCast: boolean; // +2
  priorDvtPeHistory: boolean; // +3
  familyHistoryOfVte: boolean; // +3
  factorVLeidenOrProthrombin20210A: boolean; // +3
  lupusAnticoagulantOrAntiphospholipid: boolean; // +3
  elevatedSerumHomocysteine: boolean; // +3
  electiveMajorArthroplasty: boolean; // +5
  hipPelvisOrLegFracturePast1m: boolean; // +5
  strokePast1m: boolean; // +5
  multipleTraumaPast1m: boolean; // +5
  acuteSpinalCordInjuryPast1m: boolean; // +5
}

export interface CapriniResult {
  score: number;
  riskCategory: 'Very Low' | 'Low' | 'Moderate' | 'High / Highest';
  dvtRiskWithoutProphylaxis: string;
  recommendedProphylaxis: string;
  citation: string;
}

export function calculateCapriniVte(input: CapriniInput): CapriniResult {
  let score = 0;

  // Age
  if (input.ageYears >= 75) score += 3;
  else if (input.ageYears >= 61) score += 2;
  else if (input.ageYears >= 41) score += 1;

  // 1 point items
  if (input.minorSurgeryPlanned) score += 1;
  if (input.bmiOver25) score += 1;
  if (input.swollenLegsEdema) score += 1;
  if (input.varicoseVeins) score += 1;
  if (input.pregnancyOrPostpartum1m) score += 1;
  if (input.oralContraceptiveOrHrt) score += 1;
  if (input.sepsisPast1m) score += 1;
  if (input.seriousLungDiseasePast1m) score += 1;

  // 2 point items
  if (input.majorSurgeryOver45Min) score += 2;
  if (input.laparoscopicSurgeryOver45Min) score += 2;
  if (input.bedriddenConfinedToBed) score += 2;
  if (input.centralVenousAccess) score += 2;
  if (input.malignancyCurrentOrPast) score += 2;
  if (input.immobilizingPlasterCast) score += 2;

  // 3 point items
  if (input.priorDvtPeHistory) score += 3;
  if (input.familyHistoryOfVte) score += 3;
  if (input.factorVLeidenOrProthrombin20210A) score += 3;
  if (input.lupusAnticoagulantOrAntiphospholipid) score += 3;
  if (input.elevatedSerumHomocysteine) score += 3;

  // 5 point items
  if (input.electiveMajorArthroplasty) score += 5;
  if (input.hipPelvisOrLegFracturePast1m) score += 5;
  if (input.strokePast1m) score += 5;
  if (input.multipleTraumaPast1m) score += 5;
  if (input.acuteSpinalCordInjuryPast1m) score += 5;

  let riskCategory: CapriniResult['riskCategory'] = 'Very Low';
  let dvtRiskWithoutProphylaxis = '< 0.5%';
  let recommendedProphylaxis = '';

  if (score >= 5) {
    riskCategory = 'High / Highest';
    dvtRiskWithoutProphylaxis = '4.0 - 11.0%';
    recommendedProphylaxis =
      'Pharmacologic thromboprophylaxis (LMWH e.g. Enoxaparin 40mg SC daily or UFH 5000 units SC BID/TID) PLUS mechanical prophylaxis (Intermittent Pneumatic Compression / IPC). Extend post-discharge prophylaxis for 28-35 days in major abdominal/pelvic cancer surgery or total joint arthroplasty.';
  } else if (score >= 3) {
    riskCategory = 'Moderate';
    dvtRiskWithoutProphylaxis = '2.0 - 4.0%';
    recommendedProphylaxis =
      'Pharmacologic prophylaxis (LMWH or UFH) or mechanical prophylaxis with pneumatic compression devices (IPC) until full ambulation.';
  } else if (score >= 1) {
    riskCategory = 'Low';
    dvtRiskWithoutProphylaxis = '1.0 - 1.5%';
    recommendedProphylaxis =
      'Mechanical prophylaxis: Intermittent Pneumatic Compression (IPC) or graduated compression stockings preferred. Early ambulation.';
  } else {
    riskCategory = 'Very Low';
    dvtRiskWithoutProphylaxis = '< 0.5%';
    recommendedProphylaxis = 'Early and frequent ambulation alone. No pharmacologic prophylaxis indicated.';
  }

  return {
    score,
    riskCategory,
    dvtRiskWithoutProphylaxis,
    recommendedProphylaxis,
    citation: 'Caprini JA. Thrombosis risk assessment as a guide to quality patient care. Dis Mon 2005;51:70-78. CHEST 2012 / ASPS 2016 Guidelines.',
  };
}

// ==========================================
// 5. Surgical Apgar Score (SAS)
// ==========================================

export interface SurgicalApgarInput {
  estimatedBloodLossMl: number;
  lowestMeanArterialPressureMmHg: number;
  lowestHeartRateBpm: number;
}

export interface SurgicalApgarResult {
  eblPoints: number;
  mapPoints: number;
  hrPoints: number;
  totalScore: number;
  riskCategory: 'High Risk' | 'Medium Risk' | 'Low Risk';
  majorComplicationRatePercent: number;
  mortalityRatePercent: number;
  clinicalInterpretation: string;
  citation: string;
}

export function calculateSurgicalApgarScore(input: SurgicalApgarInput): SurgicalApgarResult {
  const { estimatedBloodLossMl, lowestMeanArterialPressureMmHg, lowestHeartRateBpm } = input;

  // EBL Points (0 to 3)
  let eblPoints = 0;
  if (estimatedBloodLossMl <= 100) eblPoints = 3;
  else if (estimatedBloodLossMl <= 600) eblPoints = 2;
  else if (estimatedBloodLossMl <= 1000) eblPoints = 1;
  else eblPoints = 0;

  // Lowest MAP Points (0 to 3)
  let mapPoints = 0;
  if (lowestMeanArterialPressureMmHg >= 70) mapPoints = 3;
  else if (lowestMeanArterialPressureMmHg >= 55) mapPoints = 2;
  else if (lowestMeanArterialPressureMmHg >= 40) mapPoints = 1;
  else mapPoints = 0;

  // Lowest Heart Rate Points (0 to 4)
  // Gawande criteria: <=55: 4, 56-65: 3, 66-75: 2, 76-85: 1, >85: 0
  let hrPoints = 0;
  if (lowestHeartRateBpm <= 55) hrPoints = 4;
  else if (lowestHeartRateBpm <= 65) hrPoints = 3;
  else if (lowestHeartRateBpm <= 75) hrPoints = 2;
  else if (lowestHeartRateBpm <= 85) hrPoints = 1;
  else hrPoints = 0;

  const totalScore = eblPoints + mapPoints + hrPoints;

  let riskCategory: SurgicalApgarResult['riskCategory'] = 'Low Risk';
  let majorComplicationRatePercent = 5.0;
  let mortalityRatePercent = 0.5;
  let clinicalInterpretation = '';

  if (totalScore <= 4) {
    riskCategory = 'High Risk';
    majorComplicationRatePercent = totalScore <= 2 ? 32.9 : 17.5;
    mortalityRatePercent = totalScore <= 2 ? 11.2 : 4.5;
    clinicalInterpretation =
      'High risk of major postoperative morbidity and mortality within 30 days (16-fold increase over low-risk patients). Consider intensive post-anesthesia monitoring (ICU / PACU extended stay), serial lactate/hgb checks, and proactive resuscitation.';
  } else if (totalScore <= 6) {
    riskCategory = 'Medium Risk';
    majorComplicationRatePercent = 10.8;
    mortalityRatePercent = 1.6;
    clinicalInterpretation =
      'Moderate surgical risk. Postoperative step-down or close surgical ward telemetry recommended with scheduled vitals checks.';
  } else {
    riskCategory = 'Low Risk';
    majorComplicationRatePercent = 4.8;
    mortalityRatePercent = 0.2;
    clinicalInterpretation =
      'Low complication risk. Standard routine postoperative ward recovery protocol.';
  }

  return {
    eblPoints,
    mapPoints,
    hrPoints,
    totalScore,
    riskCategory,
    majorComplicationRatePercent,
    mortalityRatePercent,
    clinicalInterpretation,
    citation: 'Gawande AA, et al. An Apgar score for surgery. J Am Coll Surg 2007;204(2):201-208.',
  };
}

// ==========================================
// 6. Glasgow-Imrie Criteria (Pancreatitis)
// ==========================================

export interface GlasgowPancreatitisInput {
  ageOver55Years: boolean;                  // P - PaO2 < 60 mmHg (8 kPa)
  pao2Under60MmHg: boolean;                 // A - Age > 55 yr
  wbcOver15x10_9L: boolean;                 // N - Neutrophils / WBC > 15 x 10^9/L
  calciumUnder2MmolLOr8MgDl: boolean;       // C - Calcium < 2.0 mmol/L (8.0 mg/dL)
  ureaOver16MmolLOrBunOver45: boolean;      // R - Renal / Urea > 16 mmol/L (BUN > 45 mg/dL)
  ldhOver600UnitsL: boolean;                // E - Enzymes / LDH > 600 units/L
  albuminUnder32GLOr3_2GDl: boolean;        // A - Albumin < 32 g/L (3.2 g/dL)
  glucoseOver10MmolLOr180MgDl: boolean;     // S - Sugar / Glucose > 10 mmol/L (180 mg/dL)
}

export interface GlasgowPancreatitisResult {
  score: number;
  severity: 'Mild Pancreatitis' | 'Severe Acute Pancreatitis';
  predictedMortalityPercent: string;
  recommendation: string;
  citation: string;
}

export function calculateGlasgowPancreatitis(input: GlasgowPancreatitisInput): GlasgowPancreatitisResult {
  let score = 0;
  if (input.pao2Under60MmHg) score += 1;
  if (input.ageOver55Years) score += 1;
  if (input.wbcOver15x10_9L) score += 1;
  if (input.calciumUnder2MmolLOr8MgDl) score += 1;
  if (input.ureaOver16MmolLOrBunOver45) score += 1;
  if (input.ldhOver600UnitsL) score += 1;
  if (input.albuminUnder32GLOr3_2GDl) score += 1;
  if (input.glucoseOver10MmolLOr180MgDl) score += 1;

  const isSevere = score >= 3;
  const severity = isSevere ? 'Severe Acute Pancreatitis' : 'Mild Pancreatitis';
  const predictedMortalityPercent = isSevere ? '15 - 30% (High complication rate)' : '< 2%';

  const recommendation = isSevere
    ? 'Score >= 3 indicates severe acute pancreatitis within the first 48 hours. Urgent HDU/ICU consultation, aggressive goal-directed crystalloid hydration (LR 200-250 mL/h titrated to urine output/BUN), early enteral nutrition within 24-72h, and contrast CT at 72-96h to evaluate for pancreatic necrosis.'
    : 'Score 0-2 predicts mild pancreatitis. Inpatient ward hydration, pain control, early oral feeding as tolerated, and gallbladder etiology ultrasound.';

  return {
    score,
    severity,
    predictedMortalityPercent,
    recommendation,
    citation: 'Blamey SL, et al. Prognostic factors in acute pancreatitis. Gut 1984;25(12):1340-1346. British Society of Gastroenterology (BSG) Guidelines.',
  };
}

// ==========================================
// 7. Goldman Cardiac & ACS NSQIP Surgical Risk
// ==========================================

export interface GoldmanNsqipInput {
  // Goldman Original Cardiac Risk Index
  s3GallopOrJvd: boolean;                                     // +11
  myocardialInfarctionPast6m: boolean;                        // +10
  nonSinusRhythmOrPacs: boolean;                              // +7
  prematureVentricularContractionsOver5PerMin: boolean;       // +7
  ageOver70: boolean;                                         // +5
  emergencyOperation: boolean;                                 // +4
  intrathoracicIntraperitonealOrAortic: boolean;              // +3
  significantAorticStenosis: boolean;                         // +3
  poorGeneralMedicalCondition: boolean;                       // +3

  // ACS NSQIP Universal Surgical Predictors
  asaClass: 1 | 2 | 3 | 4 | 5;
  functionalStatus: 'independent' | 'partially_dependent' | 'totally_dependent';
  systemicSepsis: 'none' | 'sirs' | 'sepsis' | 'septic_shock';
  dyspnea: 'none' | 'exertion' | 'rest';
  preopAcuteRenalFailure: boolean;
  chronicSteroidUse: boolean;
  ascitesWithin30Days: boolean;
  disseminatedCancer: boolean;
  bleedingDisorder: boolean;
  diabetesMellitus: boolean;
  hypertensionRequiringMedication: boolean;
  severeCopd: boolean;
}

export interface GoldmanNsqipResult {
  goldmanScore: number;
  goldmanClass: 'Class I' | 'Class II' | 'Class III' | 'Class IV';
  goldmanCardiacMortalityPercent: number;
  goldmanSevereCardiacComplicationsPercent: number;
  goldmanRecommendation: string;

  nsqipMorbidityRiskTier: 'Low' | 'Moderate' | 'High' | 'Very High';
  nsqipOverallMorbidityPercent: number;
  nsqipSeriousComplicationsPercent: number;
  nsqipMortality30DayPercent: number;
  nsqipSurgicalSiteInfectionPercent: number;
  perioperativeOptimizationGuidelines: string[];
  citation: string;
}

export function calculateGoldmanNsqip(input: GoldmanNsqipInput): GoldmanNsqipResult {
  // 1. Goldman Score Calculation
  let goldmanScore = 0;
  if (input.s3GallopOrJvd) goldmanScore += 11;
  if (input.myocardialInfarctionPast6m) goldmanScore += 10;
  if (input.nonSinusRhythmOrPacs) goldmanScore += 7;
  if (input.prematureVentricularContractionsOver5PerMin) goldmanScore += 7;
  if (input.ageOver70) goldmanScore += 5;
  if (input.emergencyOperation) goldmanScore += 4;
  if (input.intrathoracicIntraperitonealOrAortic) goldmanScore += 3;
  if (input.significantAorticStenosis) goldmanScore += 3;
  if (input.poorGeneralMedicalCondition) goldmanScore += 3;

  let goldmanClass: GoldmanNsqipResult['goldmanClass'] = 'Class I';
  let goldmanCardiacMortalityPercent = 0.2;
  let goldmanSevereCardiacComplicationsPercent = 0.7;
  let goldmanRecommendation = '';

  if (goldmanScore >= 26) {
    goldmanClass = 'Class IV';
    goldmanCardiacMortalityPercent = 56.0;
    goldmanSevereCardiacComplicationsPercent = 22.0;
    goldmanRecommendation =
      'Extreme cardiovascular mortality risk (56% cardiac death). Elective surgery strictly contraindicated. In urgent/emergent surgery, cardiologist and cardiac anesthesiologist consultation is mandatory; invasive hemodynamic lines (arterial line, central line) and ICU bed required.';
  } else if (goldmanScore >= 13) {
    goldmanClass = 'Class III';
    goldmanCardiacMortalityPercent = 2.0;
    goldmanSevereCardiacComplicationsPercent = 11.0;
    goldmanRecommendation =
      'Substantial cardiac risk (11% severe complications). Preoperative cardiac consultation, optimize CHF (diuresis, afterload reduction), preop echocardiogram, and continuous intraoperative/postoperative telemetry monitoring.';
  } else if (goldmanScore >= 6) {
    goldmanClass = 'Class II';
    goldmanCardiacMortalityPercent = 2.0;
    goldmanSevereCardiacComplicationsPercent = 5.0;
    goldmanRecommendation =
      'Moderate cardiac risk (5% severe complications). Medical optimization, maintain baseline beta-blockers/statins if prescribed, avoid perioperative tachycardia and hypotension.';
  } else {
    goldmanClass = 'Class I';
    goldmanCardiacMortalityPercent = 0.2;
    goldmanSevereCardiacComplicationsPercent = 0.7;
    goldmanRecommendation =
      'Minimal cardiac risk (<1% complications). Routine preoperative clearance with standard perioperative anesthesia monitoring.';
  }

  // 2. ACS NSQIP Universal Morbidity & Mortality Calculation
  let nsqipLogOdds = -2.8; // baseline major noncardiac surgery log-odds

  // ASA Class weighting
  if (input.asaClass === 2) nsqipLogOdds += 0.4;
  else if (input.asaClass === 3) nsqipLogOdds += 0.9;
  else if (input.asaClass === 4) nsqipLogOdds += 1.6;
  else if (input.asaClass === 5) nsqipLogOdds += 2.5;

  // Functional status
  if (input.functionalStatus === 'partially_dependent') nsqipLogOdds += 0.45;
  else if (input.functionalStatus === 'totally_dependent') nsqipLogOdds += 0.95;

  // Sepsis
  if (input.systemicSepsis === 'sirs') nsqipLogOdds += 0.4;
  else if (input.systemicSepsis === 'sepsis') nsqipLogOdds += 0.85;
  else if (input.systemicSepsis === 'septic_shock') nsqipLogOdds += 1.4;

  // Emergency operation
  if (input.emergencyOperation) nsqipLogOdds += 0.65;

  // Respiratory / Dyspnea
  if (input.dyspnea === 'exertion') nsqipLogOdds += 0.3;
  else if (input.dyspnea === 'rest') nsqipLogOdds += 0.7;
  if (input.severeCopd) nsqipLogOdds += 0.4;

  // Comorbidities
  if (input.preopAcuteRenalFailure) nsqipLogOdds += 0.8;
  if (input.ascitesWithin30Days) nsqipLogOdds += 0.6;
  if (input.disseminatedCancer) nsqipLogOdds += 0.55;
  if (input.chronicSteroidUse) nsqipLogOdds += 0.35;
  if (input.bleedingDisorder) nsqipLogOdds += 0.4;
  if (input.diabetesMellitus) nsqipLogOdds += 0.25;
  if (input.hypertensionRequiringMedication) nsqipLogOdds += 0.2;

  // Logistic transform for overall morbidity
  const morbidityProb = 1 / (1 + Math.exp(-nsqipLogOdds));
  const nsqipOverallMorbidityPercent = Math.min(95, Math.max(1.0, Math.round(morbidityProb * 100 * 10) / 10));
  const nsqipSeriousComplicationsPercent = Math.min(85, Math.max(0.5, Math.round(morbidityProb * 65 * 10) / 10));

  // Mortality risk
  const mortalityLogOdds = nsqipLogOdds - 1.8;
  const mortalityProb = 1 / (1 + Math.exp(-mortalityLogOdds));
  const nsqipMortality30DayPercent = Math.min(75, Math.max(0.1, Math.round(mortalityProb * 100 * 10) / 10));

  // SSI Risk
  let ssiRisk = 2.5;
  if (input.diabetesMellitus) ssiRisk += 1.8;
  if (input.chronicSteroidUse) ssiRisk += 2.0;
  if (input.emergencyOperation) ssiRisk += 1.5;
  if (input.asaClass >= 3) ssiRisk += 2.2;
  const nsqipSurgicalSiteInfectionPercent = Math.min(30, Math.round(ssiRisk * 10) / 10);

  // Risk Tier
  let nsqipMorbidityRiskTier: GoldmanNsqipResult['nsqipMorbidityRiskTier'] = 'Low';
  if (nsqipOverallMorbidityPercent >= 30) nsqipMorbidityRiskTier = 'Very High';
  else if (nsqipOverallMorbidityPercent >= 18) nsqipMorbidityRiskTier = 'High';
  else if (nsqipOverallMorbidityPercent >= 8) nsqipMorbidityRiskTier = 'Moderate';

  // Perioperative optimization checklist
  const perioperativeOptimizationGuidelines: string[] = [];
  if (input.diabetesMellitus) {
    perioperativeOptimizationGuidelines.push('Glycemic control: Target perioperative blood glucose 140-180 mg/dL; avoid hypoglycemia.');
  }
  if (input.chronicSteroidUse) {
    perioperativeOptimizationGuidelines.push('Stress-dose corticosteroids: Administer Hydrocortisone (e.g. 50-100mg IV at induction, then q8h) to prevent acute adrenal crisis.');
  }
  if (input.severeCopd || input.dyspnea !== 'none') {
    perioperativeOptimizationGuidelines.push('Pulmonary optimization: Incentive spirometry, bronchodilators, deep breathing exercises, and early post-op ambulation.');
  }
  if (input.preopAcuteRenalFailure) {
    perioperativeOptimizationGuidelines.push('Renal protection: Avoid NSAIDs/nephrotoxins; maintain strict euvolemia and monitor urine output.');
  }
  if (input.systemicSepsis !== 'none') {
    perioperativeOptimizationGuidelines.push('Sepsis resuscitation: Broad-spectrum IV antibiotics within 1 hour; 30 mL/kg crystalloid resuscitation.');
  }
  if (perioperativeOptimizationGuidelines.length === 0) {
    perioperativeOptimizationGuidelines.push('Standard surgical clearance: Preoperative fasting (NPO 2h clear liquids, 6h solid foods), prophylactic antibiotics within 60 min of incision, and VTE prophylaxis.');
  }

  return {
    goldmanScore,
    goldmanClass,
    goldmanCardiacMortalityPercent,
    goldmanSevereCardiacComplicationsPercent,
    goldmanRecommendation,
    nsqipMorbidityRiskTier,
    nsqipOverallMorbidityPercent,
    nsqipSeriousComplicationsPercent,
    nsqipMortality30DayPercent,
    nsqipSurgicalSiteInfectionPercent,
    perioperativeOptimizationGuidelines,
    citation: 'Goldman L, et al. N Engl J Med 1977;297(16):845-850; Bilimoria KY, et al. ACS NSQIP Universal Surgical Risk Calculator, J Am Coll Surg 2013;217(5):833-842.',
  };
}

