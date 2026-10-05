/**
 * General Surgery & Trauma Expanded Clinical Calculation Engines
 * Reputable References: ATLS (ACS-COT), WSES, ASA, CHEST, Tokyo Guidelines TG18, ASPS.
 */

// ==========================================
// 1. TRAUMA & ACUTE RESUSCITATION
// ==========================================

export interface RtsInput {
  gcs: number; // 3-15
  sbp: number; // mmHg
  rr: number; // breaths/min
}

export function calculateRevisedTraumaScore(input: RtsInput): {
  codedGcs: number;
  codedSbp: number;
  codedRr: number;
  triageRts: number;
  survivalProbabilityPercent: number;
  traumaCenterIndication: boolean;
} {
  // Coded GCS: 13-15=4, 9-12=3, 6-8=2, 4-5=1, 3=0
  let codedGcs = 0;
  if (input.gcs >= 13) codedGcs = 4;
  else if (input.gcs >= 9) codedGcs = 3;
  else if (input.gcs >= 6) codedGcs = 2;
  else if (input.gcs >= 4) codedGcs = 1;

  // Coded SBP: >89=4, 76-89=3, 50-75=2, 1-49=1, 0=0
  let codedSbp = 0;
  if (input.sbp > 89) codedSbp = 4;
  else if (input.sbp >= 76) codedSbp = 3;
  else if (input.sbp >= 50) codedSbp = 2;
  else if (input.sbp >= 1) codedSbp = 1;

  // Coded RR: 10-29=4, >29=3, 6-9=2, 1-5=1, 0=0
  let codedRr = 0;
  if (input.rr >= 10 && input.rr <= 29) codedRr = 4;
  else if (input.rr > 29) codedRr = 3;
  else if (input.rr >= 6) codedRr = 2;
  else if (input.rr >= 1) codedRr = 1;

  // Triage RTS = 0.9368(GCS_c) + 0.7326(SBP_c) + 0.2908(RR_c)
  const triageRts = Number((0.9368 * codedGcs + 0.7326 * codedSbp + 0.2908 * codedRr).toFixed(3));

  // Champion et al. Major trauma index: RTS < 7.84 indicates transfer to designated Level 1 trauma center
  const traumaCenterIndication = triageRts < 7.841;

  // Logistic survival approximation
  const b = -3.5718 + 0.9368 * codedGcs + 0.7326 * codedSbp + 0.2908 * codedRr;
  const survivalProbabilityPercent = Number(((1 / (1 + Math.exp(-b))) * 100).toFixed(1));

  return { codedGcs, codedSbp, codedRr, triageRts, survivalProbabilityPercent, traumaCenterIndication };
}

export function calculateAbcScoreForMtp(input: {
  penetratingMechanism: boolean;
  sbpLte90: boolean;
  heartRateGte120: boolean;
  positiveFastExam: boolean;
}): {
  score: number;
  activateMtp: boolean;
  recommendation: string;
} {
  let score = 0;
  if (input.penetratingMechanism) score += 1;
  if (input.sbpLte90) score += 1;
  if (input.heartRateGte120) score += 1;
  if (input.positiveFastExam) score += 1;

  const activateMtp = score >= 2;
  const recommendation = activateMtp
    ? `ABC Score ${score}/4 (≥2): High sensitivity (>85%) for Massive Transfusion Protocol (MTP). Activate MTP immediately: 1:1:1 pRBC, FFP, and platelets; administer TXA (1g over 10m within 3h of injury).`
    : `ABC Score ${score}/4 (<2): Massive transfusion unlikely to be needed at this time. Continue standard resuscitation and reassess if hemodynamics deteriorate.`;

  return { score, activateMtp, recommendation };
}

export function calculateShockIndex(heartRateBpm: number, sbpMmHg: number, dbpMmHg?: number): {
  shockIndex: number;
  modifiedShockIndex?: number;
  isShockPresent: boolean;
  interpretation: string;
} {
  const shockIndex = sbpMmHg > 0 ? Number((heartRateBpm / sbpMmHg).toFixed(2)) : 0;
  let modifiedShockIndex: number | undefined;

  if (dbpMmHg !== undefined) {
    const map = (2 * dbpMmHg + sbpMmHg) / 3;
    if (map > 0) modifiedShockIndex = Number((heartRateBpm / map).toFixed(2));
  }

  const isShockPresent = shockIndex >= 0.9;
  let interpretation = 'Shock Index < 0.7: Normal hemodynamic compensation.';
  if (shockIndex >= 1.4) {
    interpretation = 'Severe shock (SI ≥ 1.4). High risk of imminent cardiovascular collapse and massive transfusion requirement.';
  } else if (shockIndex >= 0.9) {
    interpretation = 'Elevated Shock Index (0.9–1.3). Warning sign of occult hypoperfusion / compensated hemorrhagic shock.';
  } else if (shockIndex >= 0.7) {
    interpretation = 'Borderline Shock Index (0.7–0.89). Monitor vitals closely for trend.';
  }

  return { shockIndex, modifiedShockIndex, isShockPresent, interpretation };
}

export function calculateModifiedBauxScore(ageYears: number, tbsaPercent: number, inhalationInjury: boolean): {
  bauxScore: number;
  estimatedMortalityPercent: number;
  prognosis: string;
} {
  // Modified Baux = Age + %TBSA + (17 if inhalation injury)
  const bauxScore = ageYears + tbsaPercent + (inhalationInjury ? 17 : 0);

  // Logistic equation per Osler et al. J Am Coll Surg 2010
  // Logit = -8.8163 + 0.0775 * Baux
  const logit = -8.8163 + 0.0775 * bauxScore;
  const estimatedMortalityPercent = Number(Math.min(99.9, Math.max(0.1, (1 / (1 + Math.exp(-logit))) * 100)).toFixed(1));

  let prognosis = 'Low estimated burn mortality (<10%).';
  if (bauxScore >= 140) {
    prognosis = 'Extremely high mortality (>90%). Goal-of-care discussion and specialized burn ICU resuscitation indicated.';
  } else if (bauxScore >= 110) {
    prognosis = 'High mortality (50–90%). Aggressive fluid management, early escharotomy, and burn center critical care.';
  } else if (bauxScore >= 80) {
    prognosis = 'Moderate mortality (15–50%). Specialized burn center care warranted.';
  }

  return { bauxScore, estimatedMortalityPercent, prognosis };
}

// ==========================================
// 2. PREOPERATIVE RISK & ANESTHESIA
// ==========================================

export function evaluateAsaClass(asa: 1 | 2 | 3 | 4 | 5 | 6, isEmergency: boolean): {
  classification: string;
  description: string;
  perioperativeMortalityEst: string;
} {
  const map: Record<number, { title: string; desc: string; mort: string }> = {
    1: { title: 'ASA I', desc: 'A normal healthy patient (non-smoking, no alcohol, minimal/no systemic disease).', mort: '0.06%–0.1%' },
    2: { title: 'ASA II', desc: 'A patient with mild systemic disease without substantial functional limitations (e.g. well-controlled HTN/DM, smoking, mild obesity).', mort: '0.2%–0.4%' },
    3: { title: 'ASA III', desc: 'A patient with severe systemic disease with substantive functional limitations (e.g. poorly controlled DM/HTN, stable angina, COPD, morbid obesity, ESRD on dialysis).', mort: '1.2%–1.8%' },
    4: { title: 'ASA IV', desc: 'A patient with severe systemic disease that is a constant threat to life (e.g. recent MI/stroke <3mo, unstable angina, severe valve disease, sepsis).', mort: '7.8%–10%' },
    5: { title: 'ASA V', desc: 'A moribund patient not expected to survive without the operation (e.g. ruptured AAA, massive trauma, intracranial bleed with mass effect).', mort: '15%–35%' },
    6: { title: 'ASA VI', desc: 'A declared brain-dead patient whose organs are being removed for donor purposes.', mort: 'N/A' },
  };

  const info = map[asa];
  const fullTitle = isEmergency ? `${info.title}E (Emergency)` : info.title;

  return {
    classification: fullTitle,
    description: info.desc,
    perioperativeMortalityEst: info.mort,
  };
}

export function evaluateMallampati(classGrade: 1 | 2 | 3 | 4): {
  grade: string;
  structuresVisualized: string;
  intubationDifficulty: string;
} {
  const map = {
    1: {
      grade: 'Class I',
      structures: 'Soft palate, fauces, uvula, and anterior/posterior pillars visualized.',
      diff: 'Low risk of difficult direct laryngoscopy / intubation.',
    },
    2: {
      grade: 'Class II',
      structures: 'Soft palate, fauces, and majority of uvula visualized.',
      diff: 'Standard laryngoscopy expected.',
    },
    3: {
      grade: 'Class III',
      structures: 'Soft palate and base of uvula visualized.',
      diff: 'Moderate risk of difficult direct laryngoscopy. Video laryngoscopy advised.',
    },
    4: {
      grade: 'Class IV',
      structures: 'Only hard palate visualized (soft palate not visible).',
      diff: 'High risk of difficult intubation. Plan for advanced airway equipment (video laryngoscope, bougie, fiberoptic).',
    },
  };

  const item = map[classGrade];
  return {
    grade: item.grade,
    structuresVisualized: item.structures,
    intubationDifficulty: item.diff,
  };
}

export function calculateStopBang(input: {
  snoring: boolean;
  tiredFatiguedDaytime: boolean;
  observedApnea: boolean;
  highBloodPressure: boolean;
  bmiGt35: boolean;
  ageGt50: boolean;
  neckCircumferenceGt40cm: boolean; // >40cm (16in) female, >43cm (17in) male
  maleGender: boolean;
}): {
  score: number;
  osaRiskTier: 'Low Risk' | 'Intermediate Risk' | 'High Risk';
  preopAirwayConsiderations: string;
} {
  const score = Object.values(input).filter(Boolean).length;

  if (score >= 5 || (score >= 2 && (input.maleGender && input.bmiGt35))) {
    return {
      score,
      osaRiskTier: 'High Risk',
      preopAirwayConsiderations: 'High risk for Obstructive Sleep Apnea. Risk for difficult mask ventilation, postoperative airway obstruction, and opioid sensitivity. Minimize sedatives, consider regional anesthesia, provide continuous pulse oximetry / CPAP post-op.',
    };
  } else if (score >= 3) {
    return {
      score,
      osaRiskTier: 'Intermediate Risk',
      preopAirwayConsiderations: 'Intermediate risk of OSA. Monitor recovery in PACU carefully; have airway adjuncts available.',
    };
  } else {
    return {
      score,
      osaRiskTier: 'Low Risk',
      preopAirwayConsiderations: 'Low risk of Obstructive Sleep Apnea.',
    };
  }
}

// ==========================================
// 3. SURGICAL GI, VASCULAR & NURSING
// ==========================================

export function calculateAnkleBrachialIndex(
  rightAnkleSbp: number,
  leftAnkleSbp: number,
  highestBrachialSbp: number,
): {
  rightAbi: number;
  leftAbi: number;
  rightCategory: string;
  leftCategory: string;
  worstCategory: string;
} {
  const getCategory = (abi: number) => {
    if (abi > 1.4) return 'Non-compressible / Medial arterial calcification (consider toe-brachial index TBI)';
    if (abi >= 1.0) return 'Normal arterial perfusion (0.90–1.40)';
    if (abi >= 0.9) return 'Borderline PAD (0.90–0.99)';
    if (abi >= 0.7) return 'Mild Peripheral Artery Disease (0.70–0.89)';
    if (abi >= 0.4) return 'Moderate PAD / Claudication (0.40–0.69)';
    return 'Severe PAD / Critical Limb-Threatening Ischemia (<0.40, rest pain / tissue loss risk)';
  };

  const rightAbi = highestBrachialSbp > 0 ? Number((rightAnkleSbp / highestBrachialSbp).toFixed(2)) : 0;
  const leftAbi = highestBrachialSbp > 0 ? Number((leftAnkleSbp / highestBrachialSbp).toFixed(2)) : 0;

  const rightCategory = getCategory(rightAbi);
  const leftCategory = getCategory(leftAbi);
  const minAbi = Math.min(rightAbi, leftAbi);
  const worstCategory = getCategory(minAbi);

  return { rightAbi, leftAbi, rightCategory, leftCategory, worstCategory };
}

export function evaluateBradenScale(input: {
  sensoryPerception: 1 | 2 | 3 | 4;
  moisture: 1 | 2 | 3 | 4;
  activity: 1 | 2 | 3 | 4;
  mobility: 1 | 2 | 3 | 4;
  nutrition: 1 | 2 | 3 | 4;
  frictionShear: 1 | 2 | 3;
}): {
  score: number;
  riskLevel: 'Very High Risk' | 'High Risk' | 'Moderate Risk' | 'Mild Risk' | 'No Risk';
  nursingInterventions: string;
} {
  const score = input.sensoryPerception + input.moisture + input.activity + input.mobility + input.nutrition + input.frictionShear;

  if (score <= 9) {
    return {
      score,
      riskLevel: 'Very High Risk',
      nursingInterventions: 'Braden ≤ 9: Q2H repositioning schedule, specialized low-air-loss mattress, silicone foam heel offloading, strict moisture barrier protocol, dietary nutrition consult.',
    };
  } else if (score <= 12) {
    return {
      score,
      riskLevel: 'High Risk',
      nursingInterventions: 'Braden 10–12: Regular 2-hour turns, pressure redistribution surface, moisture management, protect bony prominences.',
    };
  } else if (score <= 14) {
    return {
      score,
      riskLevel: 'Moderate Risk',
      nursingInterventions: 'Braden 13–14: Position changes, heel elevation, keep skin dry and moisturized.',
    };
  } else if (score <= 18) {
    return {
      score,
      riskLevel: 'Mild Risk',
      nursingInterventions: 'Braden 15–18: Encourage mobility, maintain nutrition, reassess every shift.',
    };
  } else {
    return {
      score,
      riskLevel: 'No Risk',
      nursingInterventions: 'Braden 19–23: Standard hospital nursing care.',
    };
  }
}

export function calculateSurgical421Fluids(weightKg: number): {
  hourlyMaintenanceMlHr: number;
  dailyMaintenanceMlDay: number;
  breakdown: string;
} {
  let hourly = 0;
  if (weightKg <= 10) {
    hourly = weightKg * 4;
  } else if (weightKg <= 20) {
    hourly = 10 * 4 + (weightKg - 10) * 2;
  } else {
    hourly = 10 * 4 + 10 * 2 + (weightKg - 20) * 1;
  }

  const hourlyMaintenanceMlHr = Math.round(hourly);
  const dailyMaintenanceMlDay = hourlyMaintenanceMlHr * 24;
  const breakdown = `4 mL/kg/h for first 10kg + 2 mL/kg/h for next 10kg + 1 mL/kg/h for remaining weight = ${hourlyMaintenanceMlHr} mL/hr (${dailyMaintenanceMlDay} mL/24h).`;

  return { hourlyMaintenanceMlHr, dailyMaintenanceMlDay, breakdown };
}
