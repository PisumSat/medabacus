/**
 * MEDABACUS Clinical Calculator Wiki - Pediatrics & Neonatology Suite
 * High-yield scores, formulas & algorithms across Neonatology, Growth,
 * Pediatric Emergency, Febrile Infants, and Pediatric Cardiology.
 */

// ==========================================
// 1. NEONATOLOGY & JAUNDICE
// ==========================================

/**
 * Kramer's Cephalocaudal Dermal Jaundice Rule
 */
export function evaluateKramersRule(zone: 1 | 2 | 3 | 4 | 5): {
  zone: string;
  anatomicalDistribution: string;
  approximateTotalSerumBilirubinMgDl: string;
  clinicalNote: string;
  guideline: string;
} {
  switch (zone) {
    case 1:
      return {
        zone: 'Zone 1: Head & Neck',
        anatomicalDistribution: 'Head, face, and sclera only',
        approximateTotalSerumBilirubinMgDl: '4 - 8 mg/dL',
        clinicalNote: 'Early mild dermal icterus. Confirm with transcutaneous bilirubin (TcB).',
        guideline: "Kramer's Rule for Dermal Jaundice Progression (Lancet 1969)",
      };
    case 2:
      return {
        zone: 'Zone 2: Upper Trunk',
        anatomicalDistribution: 'Chest down to the umbilicus',
        approximateTotalSerumBilirubinMgDl: '5 - 12 mg/dL',
        clinicalNote: 'Dermal progression. Check TcB/TSB and plotting on AAP hour-specific nomogram.',
        guideline: "Kramer's Rule for Dermal Jaundice Progression (Lancet 1969)",
      };
    case 3:
      return {
        zone: 'Zone 3: Lower Trunk & Thighs',
        anatomicalDistribution: 'Umbilicus to knees',
        approximateTotalSerumBilirubinMgDl: '8 - 16 mg/dL',
        clinicalNote: 'Moderate jaundice. Serum TSB mandatory; evaluate for hemolysis (DAT/Coombs, retics).',
        guideline: "Kramer's Rule for Dermal Jaundice Progression (Lancet 1969)",
      };
    case 4:
      return {
        zone: 'Zone 4: Arms & Lower Legs',
        anatomicalDistribution: 'Knees to ankles, shoulders to wrists',
        approximateTotalSerumBilirubinMgDl: '11 - 18 mg/dL',
        clinicalNote: 'Severe dermal progression. Immediate serum TSB and initiation of intensive phototherapy pending lab results.',
        guideline: "Kramer's Rule for Dermal Jaundice Progression (Lancet 1969)",
      };
    case 5:
      return {
        zone: 'Zone 5: Palms & Soles',
        anatomicalDistribution: 'Involvement of palms of hands and soles of feet',
        approximateTotalSerumBilirubinMgDl: '> 15 - 20+ mg/dL',
        clinicalNote: 'CRITICAL neonatal hyperbilirubinemia. High risk of acute bilirubin encephalopathy (kernicterus). Stat TSB, emergency double-volume exchange transfusion setup, and continuous intensive multi-bank phototherapy.',
        guideline: "Kramer's Rule for Dermal Jaundice Progression (Lancet 1969)",
      };
  }
}

/**
 * Bhutani / AAP 2022 Neonatal Hyperbilirubinemia Evaluation
 */
export function evaluateBhutaniNomogram(
  postnatalAgeHours: number,
  tsbMgDl: number,
  gestationalAgeWeeks: number,
  neurotoxicityRiskFactors: boolean // Isoimmune hemolytic disease, G6PD deficiency, asphyxia, sepsis, albumin < 3.0 g/dL
): {
  phototherapyIndicated: boolean;
  exchangeTransfusionIndicated: boolean;
  phototherapyThresholdMgDl: number;
  exchangeTransfusionThresholdMgDl: number;
  recommendation: string;
  guideline: string;
} {
  // Approximate AAP 2022 Hour-Specific Phototherapy Thresholds for GA >= 38wks
  let ptBase = 12.0;
  let exBase = 18.0;

  if (postnatalAgeHours <= 24) {
    ptBase = 8.0;
    exBase = 14.0;
  } else if (postnatalAgeHours <= 48) {
    ptBase = 12.5;
    exBase = 18.0;
  } else if (postnatalAgeHours <= 72) {
    ptBase = 15.0;
    exBase = 20.0;
  } else {
    ptBase = 17.5;
    exBase = 22.5;
  }

  // Risk adjustments (AAP 2022)
  if (gestationalAgeWeeks < 38) {
    ptBase -= (38 - Math.max(35, gestationalAgeWeeks)) * 1.5;
    exBase -= (38 - Math.max(35, gestationalAgeWeeks)) * 1.5;
  }
  if (neurotoxicityRiskFactors) {
    ptBase -= 2.0;
    exBase -= 2.5;
  }

  const phototherapyThreshold = parseFloat(ptBase.toFixed(1));
  const exchangeThreshold = parseFloat(exBase.toFixed(1));

  const phototherapyIndicated = tsbMgDl >= phototherapyThreshold;
  const exchangeTransfusionIndicated = tsbMgDl >= exchangeThreshold;

  let recommendation = 'TSB is below phototherapy threshold. Reassess per AAP schedule.';
  if (exchangeTransfusionIndicated) {
    recommendation = `CRITICAL: TSB (${tsbMgDl} mg/dL) exceeds exchange transfusion threshold (${exchangeThreshold} mg/dL). Admit to NICU immediately for double-volume exchange transfusion and maximum intensive phototherapy.`;
  } else if (phototherapyIndicated) {
    recommendation = `TSB (${tsbMgDl} mg/dL) exceeds phototherapy threshold (${phototherapyThreshold} mg/dL). Initiate intensive LED phototherapy (irradiance ≥ 30 µW/cm²/nm) and recheck TSB in 4-6 hours.`;
  }

  return {
    phototherapyIndicated,
    exchangeTransfusionIndicated,
    phototherapyThresholdMgDl: phototherapyThreshold,
    exchangeTransfusionThresholdMgDl: exchangeThreshold,
    recommendation,
    guideline: 'AAP Clinical Practice Guideline: Management of Hyperbilirubinemia in the Newborn Infant 35 or More Weeks of Gestation (Pediatrics 2022)',
  };
}

/**
 * Downes Score for Neonatal Respiratory Distress
 */
export interface DownesScoreInput {
  respiratoryRate: 0 | 1 | 2; // 0: <60; 1: 60-80; 2: >80 or apnea
  cyanosis: 0 | 1 | 2; // 0: None; 1: In room air, relieved with O2; 2: In room air, persists with O2
  retractions: 0 | 1 | 2; // 0: None; 1: Mild; 2: Moderate/Severe
  grunting: 0 | 1 | 2; // 0: None; 1: Audible with stethoscope; 2: Audible with naked ear
  airEntry: 0 | 1 | 2; // 0: Normal; 1: Decreased; 2: Barely audible
}

export function calculateDownesScore(input: DownesScoreInput): {
  score: number;
  severity: 'Mild Respiratory Distress (Score 1-3)' | 'Moderate Distress (Score 4-6)' | 'Impending Respiratory Failure (Score ≥ 7)';
  respiratorySupport: string;
  guideline: string;
} {
  const score = input.respiratoryRate + input.cyanosis + input.retractions + input.grunting + input.airEntry;

  let severity: 'Mild Respiratory Distress (Score 1-3)' | 'Moderate Distress (Score 4-6)' | 'Impending Respiratory Failure (Score ≥ 7)' = 'Mild Respiratory Distress (Score 1-3)';
  let respiratorySupport = 'Supplemental oxygen via nasal cannula or incubator, close pulse oximetry monitoring.';

  if (score >= 7) {
    severity = 'Impending Respiratory Failure (Score ≥ 7)';
    respiratorySupport = 'Impending respiratory failure. Immediate neonatal endotracheal intubation, mechanical ventilation, and NICU admission.';
  } else if (score >= 4) {
    severity = 'Moderate Distress (Score 4-6)';
    respiratorySupport = 'Moderate respiratory distress. Initiate nasal CPAP (5-6 cmH2O) and obtain arterial/capillary blood gas and chest radiograph.';
  }

  return {
    score,
    severity,
    respiratorySupport,
    guideline: 'Downes JJ et al. Respiratory distress syndrome. Clin Pediatr 1970',
  };
}

// ==========================================
// 2. PEDIATRIC EMERGENCY & VITAL WARNINGS
// ==========================================

/**
 * PEWS (Pediatric Early Warning Score)
 */
export interface PewsInput {
  // Behavior
  behavior: 0 | 1 | 2 | 3; // 0: Playing/appropriate; 1: Sleeping; 2: Irritable; 3: Lethargic/confused or reduced response to pain
  // Cardiovascular
  cardiovascular: 0 | 1 | 2 | 3; // 0: Pink or cap refill 1-2s; 1: Pale or cap refill 3s; 2: Grey/cyanotic or cap refill 4s or tachy >20 above norm; 3: Grey/mottled or cap refill >=5s or tachy >30 above norm or bradycardia
  // Respiratory
  respiratory: 0 | 1 | 2 | 3; // 0: Normal RR, no retractions; 1: >10 above norm, using accessory muscles or 30%+ FiO2; 2: >20 above norm, marked retractions or 40%+ FiO2; 3: >=5 below or >30 above norm, sternal recession, grunting or >=50% FiO2
  persistentVomitingPostOp?: boolean;
}

export function calculatePews(input: PewsInput): {
  score: number;
  riskTier: 'Low Risk (Score 0-2)' | 'Medium Risk (Score 3-4)' | 'High Risk (Score ≥ 5)';
  escalationAction: string;
  guideline: string;
} {
  let score = input.behavior + input.cardiovascular + input.respiratory;
  if (input.persistentVomitingPostOp) score += 2;

  let riskTier: 'Low Risk (Score 0-2)' | 'Medium Risk (Score 3-4)' | 'High Risk (Score ≥ 5)' = 'Low Risk (Score 0-2)';
  let escalationAction = 'Routine nursing observations every 4 hours.';

  if (score >= 5) {
    riskTier = 'High Risk (Score ≥ 5)';
    escalationAction = 'URGENT: STAT Medical Emergency Team / Pediatric Rapid Response activation. Senior pediatric resident and attending to bed within 10 minutes. Prepare for PICU transfer.';
  } else if (score >= 3) {
    riskTier = 'Medium Risk (Score 3-4)';
    escalationAction = 'Notify charge nurse and pediatric house officer. Increase vital signs monitoring to hourly. Review fluid balance and respiratory support.';
  }

  return {
    score,
    riskTier,
    escalationAction,
    guideline: 'The Bedside Pediatric Early Warning System (PEWS) (Parshuram CS et al., Crit Care 2011)',
  };
}

// ==========================================
// 3. PEDIATRIC CARDIOLOGY & RHEUMATIC FEVER
// ==========================================

/**
 * Modified Jones Criteria for Acute Rheumatic Fever (AHA 2015 Revision)
 */
export interface JonesCriteriaInput {
  isLowRiskPopulation: boolean; // Low-risk: ARF incidence <=2/100k school children; Moderate/High: endemic areas (e.g., Thailand, developing nations)
  evidenceOfPrecedingStrepInfection: boolean; // Positive throat culture, rapid strep antigen (RADT), or elevated/rising ASO titer
  // Major Criteria
  carditisClinicalOrSubclinicalEcho: boolean;
  polyarthritis: boolean; // (In mod/high risk, monoarthritis or polyarthralgia counts as major)
  choreaSydenham: boolean;
  erythemaMarginatum: boolean;
  subcutaneousNodules: boolean;
  // Minor Criteria
  arthralgia: boolean; // (Only if arthritis not used as major)
  feverAtLeast38_5C: boolean; // (>= 38.0C in moderate/high risk)
  elevatedEsrOrCrp: boolean; // ESR >= 60 mm/h or CRP >= 3.0 mg/dL in low-risk; ESR >= 30 in mod/high
  prolongedPrIntervalOnEcg: boolean; // (Unless carditis is major criterion)
}

export function evaluateJonesCriteria(input: JonesCriteriaInput): {
  arfDiagnosisMet: boolean;
  majorCount: number;
  minorCount: number;
  clinicalInterpretation: string;
  guideline: string;
} {
  if (!input.evidenceOfPrecedingStrepInfection && !input.choreaSydenham) {
    return {
      arfDiagnosisMet: false,
      majorCount: 0,
      minorCount: 0,
      clinicalInterpretation: 'Diagnosis cannot be confirmed without documented evidence of preceding Group A Streptococcal infection (positive ASO, anti-DNase B, or throat swab), except in isolated Sydenham chorea.',
      guideline: '2015 Revision of the Jones Criteria for the Diagnosis of Acute Rheumatic Fever in the Era of Doppler Echocardiography (AHA)',
    };
  }

  let majorCount = 0;
  if (input.carditisClinicalOrSubclinicalEcho) majorCount++;
  if (input.polyarthritis) majorCount++;
  if (input.choreaSydenham) majorCount++;
  if (input.erythemaMarginatum) majorCount++;
  if (input.subcutaneousNodules) majorCount++;

  let minorCount = 0;
  if (input.arthralgia) minorCount++;
  if (input.feverAtLeast38_5C) minorCount++;
  if (input.elevatedEsrOrCrp) minorCount++;
  if (input.prolongedPrIntervalOnEcg) minorCount++;

  const arfDiagnosisMet = majorCount >= 2 || (majorCount >= 1 && minorCount >= 2);

  let clinicalInterpretation = 'Does not meet 2 Major or 1 Major + 2 Minor criteria for Acute Rheumatic Fever.';
  if (arfDiagnosisMet) {
    clinicalInterpretation = `Fulfills Modified Jones Criteria for Acute Rheumatic Fever (${majorCount} Major, ${minorCount} Minor). Initiate: (1) Benzathine Penicillin G 1.2M units IM once for GAS eradication, (2) Anti-inflammatory therapy (Aspirin 50-60 mg/kg/day or Corticosteroids if carditis), (3) Long-term secondary penicillin prophylaxis.`;
  }

  return {
    arfDiagnosisMet,
    majorCount,
    minorCount,
    clinicalInterpretation,
    guideline: '2015 Revision of the Jones Criteria for Acute Rheumatic Fever (Gewitz MH et al., Circulation 2015)',
  };
}

// ==========================================
// 4. GROWTH & MALNUTRITION
// ==========================================

/**
 * Mid-Upper Arm Circumference (MUAC) for Child Malnutrition (6-59 months)
 */
export function evaluateMuac(muacMm: number): {
  classification: 'Severe Acute Malnutrition (SAM)' | 'Moderate Acute Malnutrition (MAM)' | 'Normal Nutritional Status';
  recommendation: string;
  guideline: string;
} {
  if (muacMm < 115) {
    return {
      classification: 'Severe Acute Malnutrition (SAM)',
      recommendation: 'MUAC < 115 mm indicates Severe Acute Malnutrition with high mortality risk. Admit to therapeutic feeding program (Ready-to-Use Therapeutic Food - RUTF or F-75/F-100 inpatient formulas). Screen for hypoglycemia, hypothermia, and severe infection.',
      guideline: 'WHO Guidelines on the Management of Severe Acute Malnutrition in Infants and Children (2013/2023)',
    };
  }
  if (muacMm <= 125) {
    return {
      classification: 'Moderate Acute Malnutrition (MAM)',
      recommendation: 'MUAC 115-125 mm indicates Moderate Acute Malnutrition. Enroll in targeted supplementary feeding program and evaluate micronutrient deficiencies.',
      guideline: 'WHO Child Growth Standards and Malnutrition Screening',
    };
  }
  return {
    classification: 'Normal Nutritional Status',
    recommendation: 'MUAC > 125 mm indicates adequate muscle mass and fat stores.',
    guideline: 'WHO Child Growth Standards and Malnutrition Screening',
  };
}
