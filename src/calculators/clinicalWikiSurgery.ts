/**
 * MEDABACUS Clinical Calculator Wiki - Surgery & Acute Trauma Suite
 * High-yield scores, formulas & classifications across Trauma, Ortho/C-Spine,
 * GI Surgery, Biliary/Pancreatic, and Surgical Infection.
 */

// ==========================================
// 1. TRAUMA & C-SPINE CLEARANCE
// ==========================================

/**
 * Canadian C-Spine Rule (Stiell et al.)
 */
export interface CanadianCSpineInput {
  // High-Risk Factors (Mandates Radiography)
  ageAtLeast65: boolean;
  dangerousMechanism: boolean; // Fall >=1m/5 stairs, axial load to head, high-speed MVC (>100 km/h), rollover, ejection, motorized recreational, bicycle collision
  paresthesiasInExtremities: boolean;
  // Low-Risk Factors (Allows Assessment of Range of Motion)
  simpleRearEndMvc: boolean;
  sittingPositionInED: boolean;
  ambulatoryAtAnyTime: boolean;
  delayedOnsetNeckPain: boolean;
  absenceOfMidlineCSpineTenderness: boolean;
  // Functional Assessment
  ableToRotateNeck45DegreesLeftAndRight: boolean;
}

export function evaluateCanadianCSpine(input: CanadianCSpineInput): {
  radiographyMandated: boolean;
  cSpineClearedClinically: boolean;
  rationale: string;
  guideline: string;
} {
  // 1. Any high-risk factor?
  if (input.ageAtLeast65 || input.dangerousMechanism || input.paresthesiasInExtremities) {
    return {
      radiographyMandated: true,
      cSpineClearedClinically: false,
      rationale: 'High-risk factor present (Age ≥ 65, dangerous trauma mechanism, or extremity paresthesias). Imaging (CT cervical spine) is MANDATORY.',
      guideline: 'Canadian C-Spine Rule (Stiell IG et al., JAMA 2001)',
    };
  }

  // 2. Any low-risk factor?
  const hasLowRiskFactor =
    input.simpleRearEndMvc ||
    input.sittingPositionInED ||
    input.ambulatoryAtAnyTime ||
    input.delayedOnsetNeckPain ||
    input.absenceOfMidlineCSpineTenderness;

  if (!hasLowRiskFactor) {
    return {
      radiographyMandated: true,
      cSpineClearedClinically: false,
      rationale: 'No safe low-risk criteria met to allow range of motion assessment. CT cervical spine imaging required.',
      guideline: 'Canadian C-Spine Rule (Stiell IG et al., JAMA 2001)',
    };
  }

  // 3. Can actively rotate 45 degrees left and right?
  if (input.ableToRotateNeck45DegreesLeftAndRight) {
    return {
      radiographyMandated: false,
      cSpineClearedClinically: true,
      rationale: 'Low-risk factor present and patient safely rotates neck 45° bilaterally. C-spine can be clinically CLEARED without radiographic imaging.',
      guideline: 'Canadian C-Spine Rule (Stiell IG et al., JAMA 2001)',
    };
  }

  return {
    radiographyMandated: true,
    cSpineClearedClinically: false,
    rationale: 'Patient unable to actively rotate neck 45° left and right. CT cervical spine imaging required.',
    guideline: 'Canadian C-Spine Rule (Stiell IG et al., JAMA 2001)',
  };
}

/**
 * NEXUS Criteria for C-Spine Clearance
 */
export interface NexusCriteriaInput {
  focalNeurologicDeficit: boolean;
  midlineCSpineTenderness: boolean;
  alteredMentalStatus: boolean;
  intoxicationEvidence: boolean;
  distractingPainfulInjury: boolean;
}

export function evaluateNexusCriteria(input: NexusCriteriaInput): {
  clearedWithoutImaging: boolean;
  positiveCriteriaCount: number;
  clinicalRecommendation: string;
  guideline: string;
} {
  let count = 0;
  if (input.focalNeurologicDeficit) count++;
  if (input.midlineCSpineTenderness) count++;
  if (input.alteredMentalStatus) count++;
  if (input.intoxicationEvidence) count++;
  if (input.distractingPainfulInjury) count++;

  if (count === 0) {
    return {
      clearedWithoutImaging: true,
      positiveCriteriaCount: 0,
      clinicalRecommendation: 'All 5 NEXUS low-risk criteria met. Cervical spine injury ruled out with 99.6% negative predictive value. Collar may be removed without imaging.',
      guideline: 'NEXUS Low-Risk Criteria (Hoffman JR et al., NEJM 2000)',
    };
  }

  return {
    clearedWithoutImaging: false,
    positiveCriteriaCount: count,
    clinicalRecommendation: `${count} NEXUS high-risk criteria present. Cannot clear clinically; obtain thin-slice CT cervical spine.`,
    guideline: 'NEXUS Low-Risk Criteria (Hoffman JR et al., NEJM 2000)',
  };
}

// ==========================================
// 2. ACUTE ABDOMEN & SURGICAL INFECTION
// ==========================================

/**
 * RIPASA Score for Acute Appendicitis (Asia-Validated)
 * Highest exam and ward rotation yield in Southeast Asia / Thailand.
 */
export interface RipasaInput {
  isFemale: boolean;
  ageYears: number;
  rightIliacFossaPain: boolean;
  painMigrationToRif: boolean;
  anorexia: boolean;
  nauseaAndVomiting: boolean;
  durationSymptomsLessThan48h: boolean;
  rifTenderness: boolean;
  rifGuarding: boolean;
  reboundTenderness: boolean;
  rovsingSignPositive: boolean;
  feverAtLeast37_5C: boolean;
  elevatedWbc: boolean; // WBC > 11,000 /uL
  negativeUrinalysis: boolean; // no RBCs, WBCs, bacteria
  foreignNricNationalId: boolean; // Asian population specificity factor
}

export function calculateRipasaScore(input: RipasaInput): {
  score: number;
  probability: 'High Probability (≥7.5)' | 'Intermediate (5.0-7.0)' | 'Low Probability (<5.0)';
  recommendation: string;
  guideline: string;
} {
  let score = 0;

  // Demographics
  score += input.isFemale ? 0.5 : 1.0;
  score += input.ageYears < 40 ? 1.0 : 0.5;
  if (input.foreignNricNationalId) score += 1.0;

  // Symptoms
  if (input.rightIliacFossaPain) score += 0.5;
  if (input.painMigrationToRif) score += 0.5;
  if (input.anorexia) score += 1.0;
  if (input.nauseaAndVomiting) score += 1.0;
  if (input.durationSymptomsLessThan48h) score += 1.0;

  // Signs
  if (input.rifTenderness) score += 1.0;
  if (input.rifGuarding) score += 2.0;
  if (input.reboundTenderness) score += 1.0;
  if (input.rovsingSignPositive) score += 2.0;
  if (input.feverAtLeast37_5C) score += 1.0;

  // Labs
  if (input.elevatedWbc) score += 1.0;
  if (input.negativeUrinalysis) score += 1.0;

  let probability: 'High Probability (≥7.5)' | 'Intermediate (5.0-7.0)' | 'Low Probability (<5.0)' = 'Low Probability (<5.0)';
  let recommendation = 'Unlikely appendicitis (sensitivity 98% at <5.0). Investigate other acute pelvic or gastrointestinal etiologies.';

  if (score >= 7.5) {
    probability = 'High Probability (≥7.5)';
    recommendation = 'High probability of acute appendicitis (sensitivity 98%, diagnostic accuracy 91.8%). Prompt surgical consultation and diagnostic laparoscopy / appendectomy.';
  } else if (score >= 5.0) {
    probability = 'Intermediate (5.0-7.0)';
    recommendation = 'Intermediate probability. Urgent graded compression ultrasound or contrast-enhanced CT abdomen/pelvis recommended, with close serial abdominal examinations.';
  }

  return {
    score,
    probability,
    recommendation,
    guideline: 'RIPASA Score for Acute Appendicitis in Asian Populations (Chong CF et al., Singapore Med J 2010)',
  };
}

/**
 * LRINEC Score for Necrotizing Soft Tissue Infections (Fasciitis)
 */
export interface LrinecInput {
  crpMgL: number; // >= 150 mg/L -> 4
  wbcCount: number; // >= 25 -> 2, 15-25 -> 1
  hemoglobinGdl: number; // < 11 -> 2, 11-12.5 -> 1
  serumSodiumMeqL: number; // < 135 -> 2
  serumCreatinineMgDl: number; // > 1.6 -> 2
  glucoseMgDl: number; // > 180 -> 1
}

export function calculateLrinecScore(input: LrinecInput): {
  score: number;
  riskTier: 'High Risk (≥8)' | 'Intermediate Risk (6-7)' | 'Low Risk (<6)';
  surgicalRecommendation: string;
  guideline: string;
} {
  let score = 0;

  if (input.crpMgL >= 150) score += 4;

  if (input.wbcCount >= 25) score += 2;
  else if (input.wbcCount >= 15) score += 1;

  if (input.hemoglobinGdl < 11.0) score += 2;
  else if (input.hemoglobinGdl <= 12.5) score += 1;

  if (input.serumSodiumMeqL < 135) score += 2;
  if (input.serumCreatinineMgDl > 1.6) score += 2;
  if (input.glucoseMgDl > 180) score += 1;

  let riskTier: 'High Risk (≥8)' | 'Intermediate Risk (6-7)' | 'Low Risk (<6)' = 'Low Risk (<6)';
  let surgicalRecommendation = 'Low risk of necrotizing fasciitis (<10%), but do NOT let a low score delay surgical exploration if clinical bullae, dishwater discharge, gas on X-ray, or pain out of proportion are present.';

  if (score >= 8) {
    riskTier = 'High Risk (≥8)';
    surgicalRecommendation = 'High risk of necrotizing soft tissue infection (>75% probability). IMMEDIATE SURGICAL CONSULTATION for operative debridement and broad-spectrum IV antibiotics (vancomycin + piperacillin-tazobactam + clindamycin).';
  } else if (score >= 6) {
    riskTier = 'Intermediate Risk (6-7)';
    surgicalRecommendation = 'Intermediate risk (50-75% probability). Urgent surgical evaluation, close bedside re-evaluation within 2-4 hours, and STAT bedside fascial exploration if deteriorating.';
  }

  return {
    score,
    riskTier,
    surgicalRecommendation,
    guideline: 'LRINEC (Laboratory Risk Indicator for Necrotizing Fasciitis) Score (Wong CH et al., Crit Care Med 2004)',
  };
}

/**
 * Forrest Classification for Endoscopic Bleeding Peptic Ulcer
 */
export function getForrestClassification(stage: 'Ia' | 'Ib' | 'IIa' | 'IIb' | 'IIc' | 'III'): {
  stage: string;
  description: string;
  rebleedRiskPercent: string;
  endoscopicTherapyMandated: boolean;
  postEndoscopyGuidance: string;
  guideline: string;
} {
  switch (stage) {
    case 'Ia':
      return {
        stage: 'Forrest Ia: Spurting hemorrhage',
        description: 'Active arterial spurting from peptic ulcer vessel',
        rebleedRiskPercent: '90%',
        endoscopicTherapyMandated: true,
        postEndoscopyGuidance: 'Dual endoscopic therapy (hemoclip + epinephrine, or thermal coagulation + hemoclip) + high-dose IV PPI infusion (80 mg bolus, 8 mg/hr x 72h). Inpatient ICU.',
        guideline: 'ESGE / ACG Upper GI Bleeding Guidelines (2021)',
      };
    case 'Ib':
      return {
        stage: 'Forrest Ib: Oozing hemorrhage',
        description: 'Active continuous oozing blood from ulcer base',
        rebleedRiskPercent: '60-80%',
        endoscopicTherapyMandated: true,
        postEndoscopyGuidance: 'Dual endoscopic hemostatic therapy + high-dose continuous IV PPI infusion x 72h.',
        guideline: 'ESGE / ACG Upper GI Bleeding Guidelines (2021)',
      };
    case 'IIa':
      return {
        stage: 'Forrest IIa: Non-bleeding visible vessel',
        description: 'Raised, pigmented protuberance in ulcer crater',
        rebleedRiskPercent: '40-50%',
        endoscopicTherapyMandated: true,
        postEndoscopyGuidance: 'Endoscopic therapy (mechanical hemoclips or thermal contact) + continuous IV PPI.',
        guideline: 'ESGE / ACG Upper GI Bleeding Guidelines (2021)',
      };
    case 'IIb':
      return {
        stage: 'Forrest IIb: Adherent clot',
        description: 'Tenacious clot overlying base of ulcer',
        rebleedRiskPercent: '20-30%',
        endoscopicTherapyMandated: true,
        postEndoscopyGuidance: 'Careful irrigation/targeted endoscopic clot removal and underlying visible vessel treatment if feasible, followed by IV PPI.',
        guideline: 'ESGE / ACG Upper GI Bleeding Guidelines (2021)',
      };
    case 'IIc':
      return {
        stage: 'Forrest IIc: Flat pigmented spot',
        description: 'Flat black/brown spot in clean ulcer base',
        rebleedRiskPercent: '<10%',
        endoscopicTherapyMandated: false,
        postEndoscopyGuidance: 'Endoscopic hemostatic therapy is NOT indicated. Initiate oral high-dose PPI; early oral feeding and floor transfer.',
        guideline: 'ESGE / ACG Upper GI Bleeding Guidelines (2021)',
      };
    case 'III':
      return {
        stage: 'Forrest III: Clean-based ulcer',
        description: 'Pearly white or gray base without vascular stigmata',
        rebleedRiskPercent: '<5%',
        endoscopicTherapyMandated: false,
        postEndoscopyGuidance: 'Endoscopic therapy is NOT indicated. Oral daily PPI, early discharge safe.',
        guideline: 'ESGE / ACG Upper GI Bleeding Guidelines (2021)',
      };
  }
}

/**
 * Tokyo Guidelines (TG18) for Acute Cholangitis Severity
 */
export interface TokyoCholangitisInput {
  // Organ Dysfunction Criteria (Grade III - Severe)
  hypotensionRequiringInotropes: boolean;
  neurologicalDisturbance: boolean;
  respiratoryPaO2FiO2Under300: boolean;
  renalOliguriaOrCrOver2: boolean;
  hepaticInrOver1_5: boolean;
  thrombocytopeniaUnder100k: boolean;
  // Grade II Criteria
  wbcOver12kOrUnder4k: boolean;
  highFeverAtLeast39C: boolean;
  ageAtLeast75: boolean;
  hyperbilirubinemiaTotalBilirubinAtLeast5: boolean;
  hypoalbuminemiaUnder2_8: boolean;
}

export function evaluateTokyoCholangitis(input: TokyoCholangitisInput): {
  grade: 'Grade III (Severe Acute Cholangitis)' | 'Grade II (Moderate Acute Cholangitis)' | 'Grade I (Mild Acute Cholangitis)';
  biliaryDrainageTiming: string;
  guideline: string;
} {
  if (
    input.hypotensionRequiringInotropes ||
    input.neurologicalDisturbance ||
    input.respiratoryPaO2FiO2Under300 ||
    input.renalOliguriaOrCrOver2 ||
    input.hepaticInrOver1_5 ||
    input.thrombocytopeniaUnder100k
  ) {
    return {
      grade: 'Grade III (Severe Acute Cholangitis)',
      biliaryDrainageTiming: 'EMERGENT Biliary Drainage (ERCP with sphincterotomy / stent or PTBD) within 12 hours. ICU admission and hemodynamic support.',
      guideline: 'Tokyo Guidelines 2018 (TG18) for Acute Cholangitis',
    };
  }

  let grade2Count = 0;
  if (input.wbcOver12kOrUnder4k) grade2Count++;
  if (input.highFeverAtLeast39C) grade2Count++;
  if (input.ageAtLeast75) grade2Count++;
  if (input.hyperbilirubinemiaTotalBilirubinAtLeast5) grade2Count++;
  if (input.hypoalbuminemiaUnder2_8) grade2Count++;

  if (grade2Count >= 2) {
    return {
      grade: 'Grade II (Moderate Acute Cholangitis)',
      biliaryDrainageTiming: 'EARLY Biliary Drainage (ERCP / endoscopic or percutaneous decompression) within 24-48 hours. IV broad-spectrum antibiotics.',
      guideline: 'Tokyo Guidelines 2018 (TG18) for Acute Cholangitis',
    };
  }

  return {
    grade: 'Grade I (Mild Acute Cholangitis)',
    biliaryDrainageTiming: 'Initial medical management with broad-spectrum IV antibiotics. Consider elective biliary decompression if no response after 24-48h.',
    guideline: 'Tokyo Guidelines 2018 (TG18) for Acute Cholangitis',
  };
}
