/**
 * Pediatrics Expanded Clinical Calculation Engines
 * Reputable References: AAP, PALS/AHA, PECARN, Goldstein et al. (Pediatric Sepsis), WHO.
 */

// ==========================================
// 1. NEONATOLOGY & NICU
// ==========================================

export function calculateNewBallardScore(input: {
  // Neuromuscular (-1 to 4 or 5)
  posture: number;
  squareWindow: number;
  armRecoil: number;
  poplitealAngle: number;
  scarfSign: number;
  heelToEar: number;
  // Physical (-1 or 0 to 5)
  skin: number;
  lanugo: number;
  plantarSurface: number;
  breast: number;
  eyeEar: number;
  genitals: number;
}): {
  totalScore: number;
  gestationalAgeWeeks: number;
  classification: string;
} {
  const neuromuscularScore =
    input.posture + input.squareWindow + input.armRecoil + input.poplitealAngle + input.scarfSign + input.heelToEar;
  const physicalScore =
    input.skin + input.lanugo + input.plantarSurface + input.breast + input.eyeEar + input.genitals;
  const totalScore = neuromuscularScore + physicalScore;

  // Ballard formula: Gestational Age (weeks) = (2 * score + 120) / 5
  // Score -10 = 20w, -5 = 22w, 0 = 24w, 5 = 26w, 10 = 28w ... 50 = 44w
  const gestationalAgeWeeks = Number(((2 * totalScore + 120) / 5).toFixed(1));

  let classification = 'Term Infant (37–41 weeks)';
  if (gestationalAgeWeeks < 28) classification = 'Extremely Preterm (< 28 weeks)';
  else if (gestationalAgeWeeks < 32) classification = 'Very Preterm (28–31 weeks)';
  else if (gestationalAgeWeeks < 37) classification = 'Moderate to Late Preterm (32–36 weeks)';
  else if (gestationalAgeWeeks >= 42) classification = 'Post-term Infant (≥ 42 weeks)';

  return { totalScore, gestationalAgeWeeks, classification };
}

export function calculateSilvermanAndersenScore(input: {
  upperChestMovement: 0 | 1 | 2; // 0: synchronized, 1: lag on inspiration, 2: see-saw respiration
  lowerChestRetractions: 0 | 1 | 2; // 0: none, 1: just visible, 2: marked
  xiphoidRetractions: 0 | 1 | 2; // 0: none, 1: just visible, 2: marked
  naresDilation: 0 | 1 | 2; // 0: none, 1: minimal, 2: marked
  expiratoryGrunt: 0 | 1 | 2; // 0: none, 1: audible with stethoscope, 2: audible with naked ear
}): {
  score: number;
  respiratoryDistressTier: 'No Distress' | 'Mild Distress' | 'Moderate Distress' | 'Severe Respiratory Failure';
  action: string;
} {
  const score =
    input.upperChestMovement +
    input.lowerChestRetractions +
    input.xiphoidRetractions +
    input.naresDilation +
    input.expiratoryGrunt;

  if (score >= 7) {
    return {
      score,
      respiratoryDistressTier: 'Severe Respiratory Failure',
      action: 'Imminent respiratory exhaustion. Prepare immediate CPAP or endotracheal intubation and NICU transfer.',
    };
  } else if (score >= 4) {
    return {
      score,
      respiratoryDistressTier: 'Moderate Distress',
      action: 'Moderate respiratory distress. Supplemental oxygen / nasal CPAP, continuous SpO2 monitoring, and blood gas analysis.',
    };
  } else if (score >= 1) {
    return {
      score,
      respiratoryDistressTier: 'Mild Distress',
      action: 'Mild respiratory distress. Supportive care, suctioning, thermoregulation, and close observation.',
    };
  } else {
    return {
      score,
      respiratoryDistressTier: 'No Distress',
      action: 'Normal neonatal respiratory pattern.',
    };
  }
}

export function calculateCorrectedAge(chronologicalAgeWeeks: number, gestationalAgeAtBirthWeeks: number): {
  correctedAgeWeeks: number;
  weeksPremature: number;
  description: string;
} {
  const weeksPremature = Math.max(0, 40 - gestationalAgeAtBirthWeeks);
  const correctedAgeWeeks = Number((chronologicalAgeWeeks - weeksPremature).toFixed(1));

  const description =
    weeksPremature > 0
      ? `Born at ${gestationalAgeAtBirthWeeks} weeks (${weeksPremature} weeks premature). At ${chronologicalAgeWeeks} weeks chronologic age, developmental milestones and growth percentiles should be evaluated at ${correctedAgeWeeks} weeks corrected age until 24–36 months.`
      : 'Term infant (no correction needed).';

  return { correctedAgeWeeks, weeksPremature, description };
}

// ==========================================
// 2. GROWTH & DEVELOPMENT
// ==========================================

export function calculateMidParentalHeight(fatherHeightCm: number, motherHeightCm: number, childSex: 'boy' | 'girl'): {
  targetHeightCm: number;
  targetHeightRangeMinCm: number;
  targetHeightRangeMaxCm: number;
  summary: string;
} {
  let target = 0;
  if (childSex === 'boy') {
    // Boy = (Father + Mother + 13) / 2
    target = (fatherHeightCm + motherHeightCm + 13) / 2;
  } else {
    // Girl = (Father + Mother - 13) / 2
    target = (fatherHeightCm + motherHeightCm - 13) / 2;
  }

  const targetHeightCm = Number(target.toFixed(1));
  const targetHeightRangeMinCm = Number((target - 8.5).toFixed(1));
  const targetHeightRangeMaxCm = Number((target + 8.5).toFixed(1));

  const summary = `Mid-parental target height is ${targetHeightCm} cm (${(targetHeightCm / 2.54).toFixed(1)} in), with an expected genetic range (±8.5 cm) of ${targetHeightRangeMinCm}–${targetHeightRangeMaxCm} cm.`;

  return { targetHeightCm, targetHeightRangeMinCm, targetHeightRangeMaxCm, summary };
}

// ==========================================
// 3. EMERGENCY, RESPIRATORY & INFECTION
// ==========================================

export function calculateWestleyCroupScore(input: {
  stridor: 0 | 1 | 2; // 0: none, 1: when agitated, 2: at rest
  retractions: 0 | 1 | 2 | 3; // 0: none, 1: mild, 2: moderate, 3: severe
  airEntry: 0 | 1 | 2; // 0: normal, 1: decreased, 2: severely decreased
  cyanosis: 0 | 4 | 5; // 0: none, 4: when agitated, 5: at rest
  consciousness: 0 | 5; // 0: normal, 5: disoriented/depressed
}): {
  score: number;
  severity: 'Mild Croup' | 'Moderate Croup' | 'Severe Croup' | 'Impending Respiratory Failure';
  treatmentGuideline: string;
} {
  const score = input.stridor + input.retractions + input.airEntry + input.cyanosis + input.consciousness;

  if (score >= 12) {
    return {
      score,
      severity: 'Impending Respiratory Failure',
      treatmentGuideline: 'Westley ≥ 12: Nebulized racemic epinephrine (0.5 mL 2.25%) + IV/IM Dexamethasone (0.6 mg/kg) + humidified oxygen. Immediate airway standby / PICU admission.',
    };
  } else if (score >= 8) {
    return {
      score,
      severity: 'Severe Croup',
      treatmentGuideline: 'Westley 8–11: Nebulized racemic epinephrine + oral/IM Dexamethasone 0.6 mg/kg. Close monitoring in ED / inpatient admission.',
    };
  } else if (score >= 3) {
    return {
      score,
      severity: 'Moderate Croup',
      treatmentGuideline: 'Westley 3–7: Oral Dexamethasone (0.15–0.6 mg/kg). Consider nebulized epinephrine if stridor at rest persists. Observe 2–4 hours before discharge.',
    };
  } else {
    return {
      score,
      severity: 'Mild Croup',
      treatmentGuideline: 'Westley 0–2: Single dose oral Dexamethasone 0.15–0.6 mg/kg. Outpatient discharge with supportive care, cool mist/humidity, and red flag precautions.',
    };
  }
}

export function evaluatePecarnHeadTrauma(input: {
  ageYears: number; // < 2 vs >= 2
  // High Risk (TBI > 4%)
  gcsLt15: boolean;
  alteredMentalStatus: boolean; // agitation, somnolence, slow response
  palpableSkullFractureOrBasilarSigns: boolean;
  // Intermediate Risk (TBI ~0.9%)
  occipitalOrParietalHematoma: boolean;
  locGt5Seconds: boolean;
  severeMechanism: boolean; // motor vehicle crash with ejection/rollover, fall >3ft (<2y) or >5ft (>=2y), pedestrian/bicycle struck
  vomitingOrSevereHeadache: boolean;
  actingAbnormalPerParents: boolean;
}): {
  riskCategory: 'High Risk (ciTBI > 4%)' | 'Intermediate Risk (ciTBI ~0.9%)' | 'Very Low Risk (ciTBI < 0.05%)';
  ctRecommendation: string;
} {
  const isHighRisk = input.gcsLt15 || input.alteredMentalStatus || input.palpableSkullFractureOrBasilarSigns;
  if (isHighRisk) {
    return {
      riskCategory: 'High Risk (ciTBI > 4%)',
      ctRecommendation: 'CT head is strongly recommended. High risk for clinically important traumatic brain injury (ciTBI > 4%). Emergent neurosurgical consult if positive.',
    };
  }

  const isIntermediate =
    input.occipitalOrParietalHematoma ||
    input.locGt5Seconds ||
    input.severeMechanism ||
    input.vomitingOrSevereHeadache ||
    input.actingAbnormalPerParents;

  if (isIntermediate) {
    return {
      riskCategory: 'Intermediate Risk (ciTBI ~0.9%)',
      ctRecommendation: 'CT vs Observation: Decision depends on clinical judgment, physician experience, worsening symptoms during 2–4h ED observation, and shared decision-making with parents.',
    };
  }

  return {
    riskCategory: 'Very Low Risk (ciTBI < 0.05%)',
    ctRecommendation: 'CT head is NOT recommended. Risk of ciTBI is extremely low (< 0.05%, NPV > 99.9%). Safe for home discharge with concussion return precautions.',
  };
}

export function evaluateKawasakiDisease(input: {
  feverDays: number; // >= 5 required for classic
  bilateralBulbarConjunctivalInjection: boolean; // non-purulent
  oralMucosalChanges: boolean; // strawberry tongue, cracked lips, pharyngeal erythema
  polymorphousRash: boolean;
  extremityChanges: boolean; // erythema/edema of hands/feet, periungual desquamation
  cervicalLymphadenopathy: boolean; // > 1.5 cm diameter, usually unilateral
}): {
  isClassicalKawasaki: boolean;
  criteriaMetCount: number;
  recommendation: string;
} {
  const principalFeatures = [
    input.bilateralBulbarConjunctivalInjection,
    input.oralMucosalChanges,
    input.polymorphousRash,
    input.extremityChanges,
    input.cervicalLymphadenopathy,
  ];
  const criteriaMetCount = principalFeatures.filter(Boolean).length;
  const isClassicalKawasaki = input.feverDays >= 5 && criteriaMetCount >= 4;

  let recommendation = '';
  if (isClassicalKawasaki) {
    recommendation = 'Meets American Heart Association (AHA) criteria for Classical Kawasaki Disease. Initiate prompt treatment within 10 days of fever: IVIG 2 g/kg single infusion + high-dose Aspirin (30–50 mg/kg/day) + urgent pediatric echocardiography for coronary artery aneurysms.';
  } else if (input.feverDays >= 5 && criteriaMetCount >= 2) {
    recommendation = 'Incomplete / Atypical Kawasaki Disease should be suspected. Check inflammatory markers (CRP ≥ 3 mg/dL, ESR ≥ 40 mm/h). If elevated, perform echocardiogram and supplemental lab testing (albumin, ALT, platelets, sterile pyuria).';
  } else {
    recommendation = 'Does not meet diagnostic criteria for Kawasaki Disease at this time. Monitor fever duration and clinical evolution.';
  }

  return { isClassicalKawasaki, criteriaMetCount, recommendation };
}
