/**
 * PEDIATRICS CLINICAL CALCULATIONS & RESUSCITATION DECISION SUITE
 * 
 * Evidence-based algorithms:
 * - Pediatric Glasgow Coma Scale (PGCS) with Infant & Child Developmental Adaptations
 * - Holliday-Segar Maintenance Fluid & Dehydration Deficit Calculation (AAP Guidelines)
 * - Pediatric Resuscitation & Airway (Khine Cuffed ETT Formula, Depth, Defibrillation, PALS/NRP)
 * - Weight-Based Pediatric Ward & Emergency Pharmacology (Acetaminophen, Ibuprofen, Amoxicillin, Epinephrine)
 * - Centor / McIsaac Pharyngitis Score (AAP / IDSA Guidelines)
 * - Pediatric Respiratory Assessment Measure (PRAM) for Acute Asthma Severity
 * - AAP 2017 Pediatric Blood Pressure Percentiles & Normal Age-Based Vital Signs
 */

// ==========================================
// 1. Pediatric Glasgow Coma Scale (PGCS)
// ==========================================

export interface PediatricGcsInput {
  isInfantUnder2Years: boolean;
  eyeOpening: 1 | 2 | 3 | 4;
  verbalResponse: 1 | 2 | 3 | 4 | 5;
  motorResponse: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface PediatricGcsResult {
  totalScore: number;
  eyeScore: number;
  verbalScore: number;
  motorScore: number;
  severity: 'Mild Brain Injury / Normal' | 'Moderate Brain Injury' | 'Severe Brain Injury (Coma)';
  airwayRecommendation: string;
  citation: string;
}

export function calculatePediatricGcs(input: PediatricGcsInput): PediatricGcsResult {
  const { eyeOpening, verbalResponse, motorResponse } = input;
  const totalScore = eyeOpening + verbalResponse + motorResponse;

  let severity: PediatricGcsResult['severity'] = 'Mild Brain Injury / Normal';
  let airwayRecommendation = '';

  if (totalScore <= 8) {
    severity = 'Severe Brain Injury (Coma)';
    airwayRecommendation =
      'GCS <= 8 is indicative of severe traumatic brain injury or coma. "GCS of 8, intubate" — secure definitive airway with cuffed endotracheal tube, avoid hypoxia (SpO2 >= 95%) and hypotension (maintain MAP for age), and obtain urgent emergent non-contrast head CT with neurosurgery consult.';
  } else if (totalScore <= 12) {
    severity = 'Moderate Brain Injury';
    airwayRecommendation =
      'GCS 9-12 indicates moderate impairment. Close neurological monitoring in PICU / high-dependency unit, serial GCS exams q1h, obtain urgent head CT per PECARN guidelines.';
  } else {
    severity = 'Mild Brain Injury / Normal';
    airwayRecommendation =
      'GCS 13-15 indicates mild impairment or normal baseline. Assess using PECARN head injury algorithm to evaluate need for neuroimaging versus observation.';
  }

  return {
    totalScore,
    eyeScore: eyeOpening,
    verbalScore: verbalResponse,
    motorScore: motorResponse,
    severity,
    airwayRecommendation,
    citation: 'Reilly PL, et al. Assessing the conscious level in infants and young children: a paediatric version of the Glasgow Coma Scale. Childs Nerv Syst 1988;4:30-33. PALS 2020.',
  };
}

// ==========================================
// 2. Holliday-Segar Fluids & Deficit
// ==========================================

export interface HollidaySegarInput {
  weightKg: number;
  percentDehydration?: number; // e.g. 0 (none), 3-5% (mild), 6-9% (moderate), >=10% (severe)
  precedingResuscitationBolusMl?: number; // e.g. 20 mL/kg NS boluses already given in ED
}

export interface HollidaySegarResult {
  dailyMaintenanceMl: number;
  hourlyMaintenanceMlPerHour: number;
  dehydrationDeficitMl?: number;
  remainingDeficitMl?: number;
  first24HourReplacementRateMlPerHour?: number;
  replacementFluidGuideline: string;
  citation: string;
}

export function calculateHollidaySegar(input: HollidaySegarInput): HollidaySegarResult {
  const { weightKg, percentDehydration = 0, precedingResuscitationBolusMl = 0 } = input;

  // 100 / 50 / 20 Rule (Daily):
  // First 10 kg: 100 mL/kg
  // Next 10 kg (11-20 kg): 50 mL/kg
  // > 20 kg: 20 mL/kg
  let dailyMaintenanceMl = 0;
  if (weightKg <= 10) {
    dailyMaintenanceMl = weightKg * 100;
  } else if (weightKg <= 20) {
    dailyMaintenanceMl = 1000 + (weightKg - 10) * 50;
  } else {
    dailyMaintenanceMl = 1500 + (weightKg - 20) * 20;
  }

  // 4 / 2 / 1 Rule (Hourly):
  let hourlyMaintenanceMlPerHour = 0;
  if (weightKg <= 10) {
    hourlyMaintenanceMlPerHour = weightKg * 4;
  } else if (weightKg <= 20) {
    hourlyMaintenanceMlPerHour = 40 + (weightKg - 10) * 2;
  } else {
    hourlyMaintenanceMlPerHour = 60 + (weightKg - 20) * 1;
  }

  let dehydrationDeficitMl: number | undefined;
  let remainingDeficitMl: number | undefined;
  let first24HourReplacementRateMlPerHour: number | undefined;

  if (percentDehydration > 0) {
    // Deficit (mL) = % dehydration * weight (kg) * 10 (since 1% dehydration = 10 mL/kg fluid deficit)
    dehydrationDeficitMl = Math.round(percentDehydration * weightKg * 10);
    remainingDeficitMl = Math.max(0, dehydrationDeficitMl - precedingResuscitationBolusMl);

    // In isonatremic dehydration, replace deficit over 24 hours: Maintenance (24h) + Remaining Deficit (24h)
    const total24hNeed = dailyMaintenanceMl + remainingDeficitMl;
    first24HourReplacementRateMlPerHour = Math.round((total24hNeed / 24) * 10) / 10;
  }

  const replacementFluidGuideline =
    'AAP 2018 Clinical Practice Guideline recommends isotonic IV fluids (such as D5 in 0.9% Normal Saline or D5 Plasmalyte / Ringer’s Lactate with 20 mEq/L KCl once urine output established) for maintenance in pediatric patients >= 28 days to prevent hospital-acquired hyponatremia.';

  return {
    dailyMaintenanceMl: Math.round(dailyMaintenanceMl),
    hourlyMaintenanceMlPerHour: Math.round(hourlyMaintenanceMlPerHour * 10) / 10,
    dehydrationDeficitMl,
    remainingDeficitMl,
    first24HourReplacementRateMlPerHour,
    replacementFluidGuideline,
    citation: 'Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy. Pediatrics 1957;19(5):823-832. AAP Clinical Practice Guideline on Isotonic IV Fluids, Pediatrics 2018.',
  };
}

// ==========================================
// 3. Pediatric Resuscitation & Airway
// ==========================================

export interface PediatricResuscitationInput {
  ageYears: number;
  ageMonths?: number;
  actualWeightKg?: number;
}

export interface PediatricResuscitationResult {
  estimatedWeightKg: number;
  cuffedEttSizeMm: number;
  uncuffedEttSizeMm: number;
  ettDepthAtLipsCm: number;
  suctionCatheterFr: number;
  chestTubeFr: string;
  laryngoscopeBlade: string;
  defibrillationInitialJoules: number;
  defibrillationSubsequentJoules: number;
  cardioversionJoules: number;
  epinephrineIvDoseMg: number;
  epinephrineIvVolumeMl: string; // 1:10,000 (0.1 mg/mL)
  normalVitalsSummary: string;
  citation: string;
}

export function calculatePediatricResuscitation(input: PediatricResuscitationInput): PediatricResuscitationResult {
  const { ageYears, ageMonths, actualWeightKg } = input;

  let estimatedWeightKg = actualWeightKg ?? 10;

  if (!actualWeightKg) {
    if (ageYears < 1 && ageMonths !== undefined) {
      // Infant < 1 yr: Weight = 0.5 * age_mo + 4
      estimatedWeightKg = Math.round((0.5 * ageMonths + 4) * 10) / 10;
    } else if (ageYears >= 1 && ageYears <= 5) {
      // 1-5 yrs: Weight = 2 * age_yr + 8
      estimatedWeightKg = Math.round((2 * ageYears + 8) * 10) / 10;
    } else if (ageYears >= 6 && ageYears <= 12) {
      // 6-12 yrs: Weight = 3 * age_yr + 7
      estimatedWeightKg = Math.round((3 * ageYears + 7) * 10) / 10;
    } else {
      // > 12 yrs
      estimatedWeightKg = Math.min(70, Math.round((3 * ageYears + 10) * 10) / 10);
    }
  }

  // Khine formula for cuffed ETT (PALS standard): (Age in years / 4) + 3.5
  // Uncuffed ETT: (Age in years / 4) + 4.0
  let cuffedEtt = Math.round(((ageYears / 4) + 3.5) * 2) / 2;
  let uncuffedEtt = Math.round(((ageYears / 4) + 4.0) * 2) / 2;

  // Infant limits
  if (ageYears < 1) {
    cuffedEtt = 3.0;
    uncuffedEtt = 3.5;
  }
  cuffedEtt = Math.min(8.0, Math.max(3.0, cuffedEtt));
  uncuffedEtt = Math.min(8.5, Math.max(3.5, uncuffedEtt));

  // ETT Depth at lips = ETT size * 3, or (Age / 2) + 12
  const ettDepthAtLipsCm = Math.round(cuffedEtt * 3 * 10) / 10;

  // Suction catheter (Fr) = 2 * ETT size
  const suctionCatheterFr = Math.round(cuffedEtt * 2);

  // Chest tube (Fr) = 3 to 4 * ETT size
  const chestTubeFr = `${Math.round(cuffedEtt * 3)} - ${Math.round(cuffedEtt * 4)} Fr`;

  // Laryngoscope
  let laryngoscopeBlade = 'Miller 0 (straight)';
  if (ageYears < 1) laryngoscopeBlade = 'Miller 1 (straight)';
  else if (ageYears <= 3) laryngoscopeBlade = 'Miller 1 or Mac 2';
  else if (ageYears <= 8) laryngoscopeBlade = 'Mac 2 or Miller 2';
  else laryngoscopeBlade = 'Mac 3 or Miller 3';

  // Defibrillation
  const defibrillationInitialJoules = Math.round(estimatedWeightKg * 2);
  const defibrillationSubsequentJoules = Math.round(estimatedWeightKg * 4);
  const cardioversionJoules = Math.round(estimatedWeightKg * 0.5 * 10) / 10;

  // Cardiac Arrest Epinephrine: 0.01 mg/kg IV/IO (using 0.1 mg/mL = 0.1 mL/kg)
  const epinephrineIvDoseMg = Math.round(estimatedWeightKg * 0.01 * 100) / 100;
  const epinephrineIvVolumeMl = `${(estimatedWeightKg * 0.1).toFixed(1)} mL (1:10,000 solution, max 1.0 mg / 10 mL)`;

  // Normal vitals summary
  let normalVitalsSummary = '';
  if (ageYears < 1) {
    normalVitalsSummary = 'HR: 100-160 bpm | RR: 30-60 /min | SBP min: 60-70 mmHg';
  } else if (ageYears <= 3) {
    normalVitalsSummary = 'HR: 90-150 bpm | RR: 24-40 /min | SBP min: 70 + (2 × age) = 74-76 mmHg';
  } else if (ageYears <= 5) {
    normalVitalsSummary = 'HR: 80-140 bpm | RR: 22-34 /min | SBP min: 70 + (2 × age) = 78-80 mmHg';
  } else if (ageYears <= 12) {
    normalVitalsSummary = 'HR: 70-120 bpm | RR: 18-30 /min | SBP min: 70 + (2 × age) = 82-94 mmHg';
  } else {
    normalVitalsSummary = 'HR: 60-100 bpm | RR: 12-20 /min | SBP min: >= 90 mmHg';
  }

  return {
    estimatedWeightKg,
    cuffedEttSizeMm: cuffedEtt,
    uncuffedEttSizeMm: uncuffedEtt,
    ettDepthAtLipsCm,
    suctionCatheterFr,
    chestTubeFr,
    laryngoscopeBlade,
    defibrillationInitialJoules,
    defibrillationSubsequentJoules,
    cardioversionJoules,
    epinephrineIvDoseMg,
    epinephrineIvVolumeMl,
    normalVitalsSummary,
    citation: 'Khine H, et al. Comparison of cuffed and uncuffed endotracheal tubes in young children during general anesthesia. Anesthesiology 1997;86:627-631. AHA PALS Guidelines 2020.',
  };
}

// ==========================================
// 4. Pediatric Weight-Based Drug Dosing
// ==========================================

export interface PediatricDrugDosingInput {
  weightKg: number;
  medication: 'acetaminophen' | 'ibuprofen' | 'amoxicillin_high_dose' | 'epinephrine_anaphylaxis' | 'dextrose_10';
}

export interface PediatricDrugDosingResult {
  drugName: string;
  standardDoseRange: string;
  calculatedDoseMg: string;
  liquidVolumeMl: string;
  maxDoseWarning: string;
  dosingFrequencyAndRoute: string;
  clinicalNotes: string;
}

export function calculatePediatricDrugDosing(input: PediatricDrugDosingInput): PediatricDrugDosingResult {
  const { weightKg, medication } = input;

  switch (medication) {
    case 'acetaminophen': {
      // 10-15 mg/kg/dose PO/PR q4-6h PRN (max 75 mg/kg/day or 1000 mg/dose, 4000 mg/day)
      const minDose = Math.min(1000, Math.round(weightKg * 10));
      const maxDose = Math.min(1000, Math.round(weightKg * 15));
      // Standard suspension in US/Global: 160 mg / 5 mL (32 mg/mL)
      const minMl = Math.round((minDose / 32) * 10) / 10;
      const maxMl = Math.round((maxDose / 32) * 10) / 10;

      return {
        drugName: 'Acetaminophen (Paracetamol)',
        standardDoseRange: '10 - 15 mg/kg/dose',
        calculatedDoseMg: `${minDose} - ${maxDose} mg`,
        liquidVolumeMl: `${minMl} - ${maxMl} mL (of 160 mg / 5 mL infant/children oral suspension)`,
        maxDoseWarning: 'Max single dose: 1,000 mg. Max daily dose: 75 mg/kg/day (not to exceed 4,000 mg/day).',
        dosingFrequencyAndRoute: 'Every 4 to 6 hours as needed for fever/pain (PO or PR). Do not exceed 5 doses in 24 hours.',
        clinicalNotes: 'First-line antipyretic/analgesic from birth onwards. Always verify suspension concentration with parents.',
      };
    }

    case 'ibuprofen': {
      // 5-10 mg/kg/dose PO q6-8h PRN (max 40 mg/kg/day or 400 mg/dose, 2400 mg/day)
      // Only for infants >= 6 months of age
      const minDose = Math.min(400, Math.round(weightKg * 5));
      const maxDose = Math.min(400, Math.round(weightKg * 10));
      // Standard children suspension: 100 mg / 5 mL (20 mg/mL)
      const minMl = Math.round((minDose / 20) * 10) / 10;
      const maxMl = Math.round((maxDose / 20) * 10) / 10;

      return {
        drugName: 'Ibuprofen',
        standardDoseRange: '5 - 10 mg/kg/dose',
        calculatedDoseMg: `${minDose} - ${maxDose} mg`,
        liquidVolumeMl: `${minMl} - ${maxMl} mL (of 100 mg / 5 mL children suspension)`,
        maxDoseWarning: 'Max single dose: 400 mg. Max daily dose: 40 mg/kg/day (not to exceed 2,400 mg/day). Contraindicated in infants < 6 months.',
        dosingFrequencyAndRoute: 'Every 6 to 8 hours with food/milk as needed for fever/pain (PO). Do not exceed 4 doses in 24 hours.',
        clinicalNotes: 'Indicated for children >= 6 months. Avoid if dehydrated or acute renal insufficiency to prevent NSAID nephrotoxicity.',
      };
    }

    case 'amoxicillin_high_dose': {
      // High-dose amoxicillin for AOM / Community-Acquired Pneumonia: 80-90 mg/kg/day divided BID (q12h)
      const totalDailyMin = Math.min(2000, Math.round(weightKg * 80));
      const totalDailyMax = Math.min(2000, Math.round(weightKg * 90));
      const singleDoseMin = Math.round(totalDailyMin / 2);
      const singleDoseMax = Math.round(totalDailyMax / 2);
      // Suspension 400 mg / 5 mL (80 mg/mL)
      const minMl = Math.round((singleDoseMin / 80) * 10) / 10;
      const maxMl = Math.round((singleDoseMax / 80) * 10) / 10;

      return {
        drugName: 'Amoxicillin (High-Dose AOM / CAP)',
        standardDoseRange: '80 - 90 mg/kg/day divided BID',
        calculatedDoseMg: `${singleDoseMin} - ${singleDoseMax} mg per dose (BID)`,
        liquidVolumeMl: `${minMl} - ${maxMl} mL BID (of 400 mg / 5 mL suspension)`,
        maxDoseWarning: 'Max dose: 1,000 mg per dose (2,000 mg per day).',
        dosingFrequencyAndRoute: 'Twice daily (q12h) for 5-10 days depending on age and clinical severity.',
        clinicalNotes: 'AAP first-line recommendation for Acute Otitis Media to overcome penicillin-intermediate Streptococcus pneumoniae.',
      };
    }

    case 'epinephrine_anaphylaxis': {
      // 0.01 mg/kg IM (1:1000 = 1 mg/mL) in anterolateral thigh
      // Prepubertal child max 0.3 mg (0.3 mL); Adolescent max 0.5 mg (0.5 mL)
      const doseMg = Math.min(0.5, Math.round(weightKg * 0.01 * 100) / 100);
      const volumeMl = doseMg.toFixed(2);

      return {
        drugName: 'Epinephrine 1:1,000 (Anaphylaxis)',
        standardDoseRange: '0.01 mg/kg IM (anterolateral thigh)',
        calculatedDoseMg: `${doseMg} mg`,
        liquidVolumeMl: `${volumeMl} mL of 1 mg/mL (1:1,000) solution`,
        maxDoseWarning: 'Max single dose: 0.3 mg in prepubertal children, 0.5 mg in older adolescents.',
        dosingFrequencyAndRoute: 'Intramuscular (IM) injection into mid-anterolateral thigh. May repeat every 5-15 minutes if symptoms persist.',
        clinicalNotes: 'Auto-injector equivalence: EpiPen Jr (0.15 mg) for 7.5 - 25 kg; EpiPen (0.3 mg) for >= 25 - 30 kg.',
      };
    }

    case 'dextrose_10': {
      // D10W bolus for pediatric hypoglycemia (blood glucose < 60 mg/dL): 2 - 5 mL/kg (0.2 - 0.5 g/kg)
      const minMl = Math.round(weightKg * 2);
      const maxMl = Math.round(weightKg * 5);
      const minGrams = (minMl * 0.1).toFixed(1);
      const maxGrams = (maxMl * 0.1).toFixed(1);

      return {
        drugName: 'Dextrose 10% (D10W) for Hypoglycemia',
        standardDoseRange: '2 - 5 mL/kg IV push',
        calculatedDoseMg: `${minGrams} - ${maxGrams} grams dextrose`,
        liquidVolumeMl: `${minMl} - ${maxMl} mL of D10W IV push`,
        maxDoseWarning: 'Recheck capillary blood glucose in 15-30 minutes after infusion. Follow with maintenance dextrose infusion.',
        dosingFrequencyAndRoute: 'IV push over 2-3 minutes. Do NOT administer D50W to neonates or young children due to hyperosmolality risk.',
        clinicalNotes: 'Rule of 50: (Concentration of Dextrose) × (mL/kg) = 50. For D10: 10 × 5 mL/kg = 50.',
      };
    }
  }
}

// ==========================================
// 5. Centor / McIsaac Strep Pharyngitis Score
// ==========================================

export interface McIsaacInput {
  ageYears: number;
  absenceOfCough: boolean;
  swollenTenderAnteriorCervicalNodes: boolean;
  temperatureOver38C: boolean; // > 38.0°C / 100.4°F
  tonsillarExudateOrSwelling: boolean;
}

export interface McIsaacResult {
  score: number;
  groupAStrepRiskPercent: string;
  management: string;
  citation: string;
}

export function calculateMcIsaacScore(input: McIsaacInput): McIsaacResult {
  let score = 0;
  if (input.absenceOfCough) score += 1;
  if (input.swollenTenderAnteriorCervicalNodes) score += 1;
  if (input.temperatureOver38C) score += 1;
  if (input.tonsillarExudateOrSwelling) score += 1;

  // McIsaac age modifier:
  // 3 - 14 years: +1
  // 15 - 44 years: 0
  // >= 45 years: -1
  if (input.ageYears >= 3 && input.ageYears <= 14) {
    score += 1;
  } else if (input.ageYears >= 45) {
    score -= 1;
  }

  score = Math.max(0, score);

  let groupAStrepRiskPercent = '1 - 3%';
  let management = '';

  if (score >= 4) {
    groupAStrepRiskPercent = '51 - 53%';
    management = 'High probability of Group A Streptococcus (GAS). Perform Rapid Antigen Detection Test (RADT) or throat culture; empiric antibiotic therapy (Penicillin V, Amoxicillin, or Cephalexin) is appropriate while awaiting results or if testing is positive.';
  } else if (score === 3) {
    groupAStrepRiskPercent = '28 - 35%';
    management = 'Moderate probability. Perform RADT or throat culture. Treat with antibiotics only if test is positive.';
  } else if (score === 2) {
    groupAStrepRiskPercent = '11 - 17%';
    management = 'Low-to-moderate probability. Perform throat swab / RADT. Antibiotics are not recommended unless microbiological confirmation.';
  } else {
    groupAStrepRiskPercent = '1 - 5%';
    management = 'Very low probability. GAS testing is not indicated; symptomatic care alone (analgesics, hydration).';
  }

  return {
    score,
    groupAStrepRiskPercent,
    management,
    citation: 'McIsaac WJ, et al. A clinical score to reduce unnecessary antibiotic use in patients with sore throat. CMAJ 1998;158(1):75-83. AAP Red Book 2024.',
  };
}

// ==========================================
// 6. Pediatric Respiratory Assessment Measure (PRAM)
// ==========================================

export interface PramInput {
  suprasternalRetractions: 0 | 2; // 0 = Absent, 2 = Present
  scaleneMuscleContraction: 0 | 2; // 0 = Absent, 2 = Present
  airEntry: 0 | 1 | 2 | 3; // 0 = Normal, 1 = Decreased at bases, 2 = Widespread decrease, 3 = Minimal/absent ("silent chest")
  wheezing: 0 | 1 | 2 | 3; // 0 = None, 1 = Expiratory only, 2 = Inspiratory & expiratory, 3 = Audible without stethoscope / silent
  o2SaturationPercent: 0 | 1 | 2; // 0 = >= 95%, 1 = 92-94%, 2 = < 92% on room air
}

export interface PramResult {
  totalScore: number;
  severity: 'Mild Asthma Exacerbation' | 'Moderate Asthma Exacerbation' | 'Severe Asthma Exacerbation';
  triageAndTreatment: string;
  citation: string;
}

export function calculatePramScore(input: PramInput): PramResult {
  const totalScore =
    input.suprasternalRetractions +
    input.scaleneMuscleContraction +
    input.airEntry +
    input.wheezing +
    input.o2SaturationPercent;

  let severity: PramResult['severity'] = 'Mild Asthma Exacerbation';
  let triageAndTreatment = '';

  if (totalScore >= 8) {
    severity = 'Severe Asthma Exacerbation';
    triageAndTreatment =
      'PRAM Score 8-12: High risk of respiratory failure / PICU admission. Immediate continuous nebulized Salbutamol (Albuterol) + Ipratropium bromide (3 doses q20min), systemic corticosteroids (Dexamethasone 0.6 mg/kg PO/IV or Methylprednisolone 1-2 mg/kg IV), high-flow humidified oxygen, and early IV Magnesium Sulfate (50 mg/kg IV over 20-30 min).';
  } else if (totalScore >= 4) {
    severity = 'Moderate Asthma Exacerbation';
    triageAndTreatment =
      'PRAM Score 4-7: Moderate distress. Inhaled Salbutamol 4-8 puffs MDI with spacer or nebulized q20min × 3, oral systemic corticosteroid (Dexamethasone 0.6 mg/kg or Prednisolone 1-2 mg/kg), and add Ipratropium bromide. Reassess at 60 minutes.';
  } else {
    severity = 'Mild Asthma Exacerbation';
    triageAndTreatment =
      'PRAM Score 0-3: Mild distress. Inhaled Salbutamol 2-4 puffs via MDI with spacer. Re-evaluate response. If resolved, discharge on as-needed SABA with asthma action plan.';
  }

  return {
    totalScore,
    severity,
    triageAndTreatment,
    citation: 'Chalut DS, et al. The Pediatric Respiratory Assessment Measure (PRAM): a valid clinical score for assessing acute asthma severity in children. J Pediatr 2000;137(6):762-768.',
  };
}

// ==========================================
// 7. AAP 2017 Pediatric Blood Pressure & Normal Vitals
// ==========================================

export interface PediatricBpInput {
  ageYears: number;
  sex: 'male' | 'female';
  heightPercentile: 5 | 10 | 25 | 50 | 75 | 90 | 95;
  systolicBpMmHg: number;
  diastolicBpMmHg: number;
}

export interface PediatricVitalRange {
  ageGroup: string;
  heartRateRangeBpm: string;
  respiratoryRateRange: string;
  systolicBpRangeMmHg: string;
  diastolicBpRangeMmHg: string;
  minimumAcceptableSbpPals: number;
}

export interface PediatricBpResult {
  sbpPercentileClassification: 'Normal' | 'Elevated' | 'Stage 1 HTN' | 'Stage 2 HTN';
  overallBpClassification: 'Normal Blood Pressure' | 'Elevated Blood Pressure' | 'Stage 1 Hypertension' | 'Stage 2 Hypertension';
  sbp50thPercentile: number;
  sbp90thPercentile: number;
  sbp95thPercentile: number;
  dbp50thPercentile: number;
  dbp90thPercentile: number;
  dbp95thPercentile: number;
  clinicalRecommendation: string;
  ageVitalSignNorms: PediatricVitalRange;
  citation: string;
}

// AAP 2017 Table lookup for 50th, 90th, 95th percentiles at 50th height percentile
// [age]: { male: [sbp50, sbp90, sbp95, dbp50, dbp90, dbp95], female: [...] }
const AAP_BP_TABLE: Record<number, { male: [number, number, number, number, number, number]; female: [number, number, number, number, number, number] }> = {
  1: { male: [85, 98, 102, 40, 52, 56], female: [86, 99, 103, 41, 54, 58] },
  2: { male: [88, 101, 105, 45, 57, 61], female: [88, 101, 105, 45, 58, 62] },
  3: { male: [91, 104, 108, 49, 61, 65], female: [90, 103, 107, 49, 62, 66] },
  4: { male: [93, 106, 110, 52, 64, 68], female: [92, 105, 109, 52, 65, 69] },
  5: { male: [95, 108, 112, 54, 66, 70], female: [94, 107, 111, 54, 67, 71] },
  6: { male: [96, 109, 113, 56, 68, 72], female: [95, 108, 112, 56, 69, 73] },
  7: { male: [98, 111, 115, 58, 70, 74], female: [97, 110, 114, 57, 70, 74] },
  8: { male: [99, 112, 116, 59, 71, 75], female: [99, 112, 116, 59, 72, 76] },
  9: { male: [100, 114, 118, 61, 73, 77], female: [101, 114, 118, 60, 73, 77] },
  10: { male: [102, 116, 120, 62, 74, 78], female: [103, 116, 120, 62, 75, 79] },
  11: { male: [104, 118, 122, 63, 75, 79], female: [105, 118, 122, 63, 76, 80] },
  12: { male: [106, 120, 124, 64, 76, 80], female: [107, 120, 124, 64, 77, 81] },
};

export function getAgeVitalSignNorms(ageYears: number): PediatricVitalRange {
  if (ageYears < 0.1) {
    return {
      ageGroup: 'Neonate (< 28 days)',
      heartRateRangeBpm: '100 - 180 bpm',
      respiratoryRateRange: '30 - 60 /min',
      systolicBpRangeMmHg: '60 - 90 mmHg',
      diastolicBpRangeMmHg: '20 - 60 mmHg',
      minimumAcceptableSbpPals: 60,
    };
  } else if (ageYears < 1) {
    return {
      ageGroup: 'Infant (1 - 12 months)',
      heartRateRangeBpm: '100 - 160 bpm',
      respiratoryRateRange: '30 - 50 /min',
      systolicBpRangeMmHg: '70 - 100 mmHg',
      diastolicBpRangeMmHg: '50 - 65 mmHg',
      minimumAcceptableSbpPals: 70,
    };
  } else if (ageYears <= 2) {
    return {
      ageGroup: 'Toddler (1 - 2 years)',
      heartRateRangeBpm: '90 - 150 bpm',
      respiratoryRateRange: '24 - 40 /min',
      systolicBpRangeMmHg: '80 - 105 mmHg',
      diastolicBpRangeMmHg: '55 - 70 mmHg',
      minimumAcceptableSbpPals: 70 + 2 * Math.floor(ageYears),
    };
  } else if (ageYears <= 5) {
    return {
      ageGroup: 'Preschool (3 - 5 years)',
      heartRateRangeBpm: '80 - 140 bpm',
      respiratoryRateRange: '22 - 34 /min',
      systolicBpRangeMmHg: '85 - 110 mmHg',
      diastolicBpRangeMmHg: '55 - 70 mmHg',
      minimumAcceptableSbpPals: 70 + 2 * Math.floor(ageYears),
    };
  } else if (ageYears <= 11) {
    return {
      ageGroup: 'School-Age (6 - 11 years)',
      heartRateRangeBpm: '70 - 120 bpm',
      respiratoryRateRange: '18 - 30 /min',
      systolicBpRangeMmHg: '90 - 120 mmHg',
      diastolicBpRangeMmHg: '60 - 80 mmHg',
      minimumAcceptableSbpPals: ageYears < 10 ? 70 + 2 * Math.floor(ageYears) : 90,
    };
  } else {
    return {
      ageGroup: 'Adolescent (>= 12 years)',
      heartRateRangeBpm: '60 - 100 bpm',
      respiratoryRateRange: '12 - 20 /min',
      systolicBpRangeMmHg: '100 - 130 mmHg',
      diastolicBpRangeMmHg: '65 - 85 mmHg',
      minimumAcceptableSbpPals: 90,
    };
  }
}

export function calculatePediatricBpAndVitals(input: PediatricBpInput): PediatricBpResult {
  const { ageYears, sex, heightPercentile, systolicBpMmHg, diastolicBpMmHg } = input;
  const ageClamped = Math.max(1, Math.min(17, Math.floor(ageYears)));

  // Height percentile adjustment factor relative to 50th percentile
  // (height shifts percentiles up or down by 1-3 mmHg)
  const heightDeltas: Record<number, number> = {
    5: -3,
    10: -2,
    25: -1,
    50: 0,
    75: 1,
    90: 2,
    95: 3,
  };
  const hDelta = heightDeltas[heightPercentile] ?? 0;

  let sbp50 = 100;
  let sbp90 = 115;
  let sbp95 = 120;
  let dbp50 = 60;
  let dbp90 = 74;
  let dbp95 = 78;

  if (ageClamped < 13) {
    const tableData = AAP_BP_TABLE[ageClamped] ?? AAP_BP_TABLE[12];
    const vals = sex === 'male' ? tableData.male : tableData.female;
    sbp50 = vals[0] + hDelta;
    sbp90 = vals[1] + hDelta;
    sbp95 = vals[2] + hDelta;
    dbp50 = vals[3] + Math.round(hDelta * 0.7);
    dbp90 = vals[4] + Math.round(hDelta * 0.7);
    dbp95 = vals[5] + Math.round(hDelta * 0.7);
  } else {
    // Adolescents >= 13 years: aligned with adult AHA/ACC 2017 thresholds
    sbp50 = 110;
    sbp90 = 120;
    sbp95 = 130;
    dbp50 = 70;
    dbp90 = 80;
    dbp95 = 80;
  }

  let sbpPercentileClassification: PediatricBpResult['sbpPercentileClassification'] = 'Normal';
  let overallBpClassification: PediatricBpResult['overallBpClassification'] = 'Normal Blood Pressure';
  let clinicalRecommendation = '';

  if (ageClamped < 13) {
    const stage2SbpThreshold = Math.min(sbp95 + 12, 140);
    const stage2DbpThreshold = Math.min(dbp95 + 12, 90);

    const isStage2 = systolicBpMmHg >= stage2SbpThreshold || diastolicBpMmHg >= stage2DbpThreshold;
    const isStage1 =
      (systolicBpMmHg >= sbp95 && systolicBpMmHg < stage2SbpThreshold) ||
      (diastolicBpMmHg >= dbp95 && diastolicBpMmHg < stage2DbpThreshold) ||
      (systolicBpMmHg >= 130 && systolicBpMmHg <= 139) ||
      (diastolicBpMmHg >= 80 && diastolicBpMmHg <= 89);
    const isElevated =
      (systolicBpMmHg >= sbp90 && systolicBpMmHg < sbp95) ||
      (diastolicBpMmHg >= dbp90 && diastolicBpMmHg < dbp95) ||
      (systolicBpMmHg >= 120 && systolicBpMmHg < sbp95);

    if (systolicBpMmHg >= stage2SbpThreshold) {
      sbpPercentileClassification = 'Stage 2 HTN';
    } else if (systolicBpMmHg >= sbp95 || (systolicBpMmHg >= 130 && systolicBpMmHg <= 139)) {
      sbpPercentileClassification = 'Stage 1 HTN';
    } else if (systolicBpMmHg >= sbp90 || (systolicBpMmHg >= 120 && systolicBpMmHg < sbp95)) {
      sbpPercentileClassification = 'Elevated';
    } else {
      sbpPercentileClassification = 'Normal';
    }

    if (isStage2) {
      overallBpClassification = 'Stage 2 Hypertension';
      clinicalRecommendation =
        'Stage 2 Hypertension (>= 95th percentile + 12 mmHg, or >= 140/90 mmHg). If patient is symptomatic (headache, emesis, visual disturbance, encephalopathy), immediately transfer to pediatric emergency department for urgent IV antihypertensive therapy. If asymptomatic, repeat in 1 week or refer directly to pediatric nephrology/cardiology; initiate diagnostic workup for secondary hypertension (renal ultrasound, echocardiogram, urinalysis, serum creatinine).';
    } else if (isStage1) {
      overallBpClassification = 'Stage 1 Hypertension';
      clinicalRecommendation =
        'Stage 1 Hypertension (>= 95th percentile to < 95th + 12 mmHg). Provide lifestyle counseling (DASH diet, 60 min/day physical activity, limit screen time). Recheck BP in 1-2 weeks. If persistent after 3 visits, initiate 24-hour Ambulatory Blood Pressure Monitoring (ABPM) and screen for target-organ damage.';
    } else if (isElevated) {
      overallBpClassification = 'Elevated Blood Pressure';
      clinicalRecommendation =
        'Elevated Blood Pressure (90th to < 95th percentile, or 120/<80 mmHg). Lifestyle intervention counseling. Repeat BP in 6 months; if still elevated after 12 months, consider ABPM.';
    } else {
      overallBpClassification = 'Normal Blood Pressure';
      clinicalRecommendation =
        'Blood pressure is normal (< 90th percentile). Recheck at routine annual health supervision / well-child exam.';
    }
  } else {
    // Adolescents >= 13 years
    if (systolicBpMmHg >= 140) {
      sbpPercentileClassification = 'Stage 2 HTN';
    } else if (systolicBpMmHg >= 130) {
      sbpPercentileClassification = 'Stage 1 HTN';
    } else if (systolicBpMmHg >= 120) {
      sbpPercentileClassification = 'Elevated';
    } else {
      sbpPercentileClassification = 'Normal';
    }

    if (systolicBpMmHg >= 140 || diastolicBpMmHg >= 90) {
      overallBpClassification = 'Stage 2 Hypertension';
      clinicalRecommendation =
        'Adolescent Stage 2 Hypertension (>= 140/90 mmHg). Urgent specialist referral; if symptomatic, evaluate immediately in ED. Prompt initiation of pharmacotherapy (ACEi/ARB, CCB, or thiazide) combined with lifestyle modification.';
    } else if (systolicBpMmHg >= 130 || diastolicBpMmHg >= 80) {
      overallBpClassification = 'Stage 1 Hypertension';
      clinicalRecommendation =
        'Adolescent Stage 1 Hypertension (130-139 / 80-89 mmHg). Initiate DASH diet and exercise. Repeat in 2-4 weeks; if unresolved, perform 24-hr ABPM and consider pharmacotherapy if persistent.';
    } else if (systolicBpMmHg >= 120 && diastolicBpMmHg < 80) {
      overallBpClassification = 'Elevated Blood Pressure';
      clinicalRecommendation =
        'Adolescent Elevated Blood Pressure (120-129 / < 80 mmHg). Lifestyle counseling; repeat assessment in 3-6 months.';
    } else {
      overallBpClassification = 'Normal Blood Pressure';
      clinicalRecommendation =
        'Normal adolescent blood pressure (< 120/< 80 mmHg). Routine annual re-evaluation.';
    }
  }

  const ageVitalSignNorms = getAgeVitalSignNorms(ageYears);

  return {
    sbpPercentileClassification,
    overallBpClassification,
    sbp50thPercentile: sbp50,
    sbp90thPercentile: sbp90,
    sbp95thPercentile: sbp95,
    dbp50thPercentile: dbp50,
    dbp90thPercentile: dbp90,
    dbp95thPercentile: dbp95,
    clinicalRecommendation,
    ageVitalSignNorms,
    citation: 'Flynn JT, et al. Clinical Practice Guideline for Screening and Management of High Blood Pressure in Children and Adolescents. Pediatrics 2017;140(3):e20171904. AAP 2017 Guidelines.',
  };
}

