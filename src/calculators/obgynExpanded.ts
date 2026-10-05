/**
 * Obstetrics & Gynecology Expanded Clinical Calculation Engines
 * Reputable References: ACOG Practice Bulletins, SMFM, ASCCP 2019, FIGO, NICHD 3-Tier, WHO.
 */

// ==========================================
// 1. ANTENATAL, GROWTH & FETAL SURVEILLANCE
// ==========================================

export function evaluateFundalHeight(fundalHeightCm: number, gestationalAgeWeeks: number): {
  isConcordant: boolean;
  discrepancyCm: number;
  status: 'Concordant' | 'Small for Gestational Age / Oligohydramnios' | 'Large for Gestational Age / Polyhydramnios';
  recommendation: string;
} {
  // McDonald's rule applies reliably between 20 and 34 weeks
  const discrepancyCm = fundalHeightCm - gestationalAgeWeeks;
  const isConcordant = Math.abs(discrepancyCm) <= 2;

  let status: 'Concordant' | 'Small for Gestational Age / Oligohydramnios' | 'Large for Gestational Age / Polyhydramnios' = 'Concordant';
  let recommendation = 'Fundal height is concordant with gestational age (±2 cm). Continue standard routine prenatal visits.';

  if (discrepancyCm < -2) {
    status = 'Small for Gestational Age / Oligohydramnios';
    recommendation = `Fundal height is ${Math.abs(discrepancyCm)} cm smaller than gestational age. Indication for formal obstetric ultrasound to evaluate for fetal growth restriction (FGR) and amniotic fluid volume (AFI/SDP).`;
  } else if (discrepancyCm > 2) {
    status = 'Large for Gestational Age / Polyhydramnios';
    recommendation = `Fundal height is ${discrepancyCm} cm larger than gestational age. Order ultrasound to rule out fetal macrosomia, polyhydramnios, multiple gestation, or uterine leiomyomata.`;
  }

  return { isConcordant, discrepancyCm, status, recommendation };
}

export function calculateBiophysicalProfile(input: {
  nonStressTestReactive: boolean; // 2 episodes of FHR acceleration >=15 bpm lasting >=15 sec in 20-40 min
  fetalBreathingPresent: boolean; // >=1 episode of rhythmic breathing lasting >=30 sec in 30 min
  grossBodyMovementsPresent: boolean; // >=3 discrete body/limb movements in 30 min
  fetalTonePresent: boolean; // >=1 episode of active extension with return to flexion of limb/trunk or opening/closing of hand
  amnioticFluidVolumeNormal: boolean; // >=1 pocket of fluid measuring >=2 cm in vertical axis without cord
}): {
  score: number;
  fetalStatus: 'Normal (Low risk of chronic asphyxia)' | 'Equivocal (Possible fetal compromise)' | 'Abnormal (High risk of fetal asphyxia)';
  actionPlan: string;
} {
  let score = 0;
  if (input.nonStressTestReactive) score += 2;
  if (input.fetalBreathingPresent) score += 2;
  if (input.grossBodyMovementsPresent) score += 2;
  if (input.fetalTonePresent) score += 2;
  if (input.amnioticFluidVolumeNormal) score += 2;

  if (score >= 8) {
    return {
      score,
      fetalStatus: 'Normal (Low risk of chronic asphyxia)',
      actionPlan: input.amnioticFluidVolumeNormal
        ? 'BPP 8–10/10 with normal fluid: Non-compromised fetus. Fetal mortality within 1 week is <1 per 1,000. Repeat testing per clinical protocol.'
        : 'BPP 8/10 with oligohydramnios: Suspect chronic placental insufficiency. If gestational age ≥36–37 weeks, delivery is recommended.',
    };
  } else if (score === 6) {
    return {
      score,
      fetalStatus: 'Equivocal (Possible fetal compromise)',
      actionPlan: 'BPP 6/10: Suspect possible fetal asphyxia. If gestational age ≥37 weeks, proceed with delivery. If <37 weeks, repeat BPP within 12–24 hours.',
    };
  } else {
    return {
      score,
      fetalStatus: 'Abnormal (High risk of fetal asphyxia)',
      actionPlan: 'BPP ≤ 4/10: Strongly indicates acute fetal asphyxia. Urgent delivery is generally indicated regardless of gestational age after maternal stabilization.',
    };
  }
}

export function evaluateGdmOgttCarpenterCoustan(input: {
  fastingMgDl: number; // threshold >= 95
  oneHourMgDl: number; // threshold >= 180
  twoHourMgDl: number; // threshold >= 155
  threeHourMgDl: number; // threshold >= 140
}): {
  abnormalCount: number;
  hasGdm: boolean;
  interpretation: string;
} {
  let abnormalCount = 0;
  if (input.fastingMgDl >= 95) abnormalCount += 1;
  if (input.oneHourMgDl >= 180) abnormalCount += 1;
  if (input.twoHourMgDl >= 155) abnormalCount += 1;
  if (input.threeHourMgDl >= 140) abnormalCount += 1;

  const hasGdm = abnormalCount >= 2;
  const interpretation = hasGdm
    ? `Diagnosed with Gestational Diabetes Mellitus (GDM) (Carpenter-Coustan: ${abnormalCount}/4 abnormal values). Initiate dietary counseling, glucose self-monitoring (fasting <95, 1h postprandial <140 or 2h <120), and fetal surveillance.`
    : abnormalCount === 1
      ? '1 abnormal value (impaired glucose tolerance). Increased risk of macrosomia. Nutritional therapy recommended; consider repeating OGTT at 32 weeks.'
      : 'Normal 3-hour OGTT. GDM ruled out.';

  return { abnormalCount, hasGdm, interpretation };
}

// ==========================================
// 2. HIGH-RISK PREGNANCY & HYPERTENSIVE DISORDERS
// ==========================================

export function evaluateHellpSyndrome(input: {
  plateletsPerMicroLiter: number;
  astOrAltU_L: number;
  ldhU_L: number;
  totalBilirubinMgDl?: number;
}): {
  hasHellp: boolean;
  mississippiClass?: 'Class 1 HELLP (Severe)' | 'Class 2 HELLP (Moderate)' | 'Class 3 HELLP (Mild)';
  clinicalManagement: string;
} {
  const hemolysis = input.ldhU_L >= 600 || (input.totalBilirubinMgDl !== undefined && input.totalBilirubinMgDl >= 1.2);
  const elevatedLiver = input.astOrAltU_L >= 70;
  const lowPlatelets = input.plateletsPerMicroLiter < 100000;

  const hasHellp = hemolysis && elevatedLiver && lowPlatelets;

  if (!hasHellp) {
    return {
      hasHellp: false,
      clinicalManagement: 'Does not meet full diagnostic criteria for HELLP syndrome (requires hemolysis + elevated liver transaminases + thrombocytopenia <100k). Re-evaluate for partial HELLP or preeclampsia with severe features.',
    };
  }

  let mississippiClass: 'Class 1 HELLP (Severe)' | 'Class 2 HELLP (Moderate)' | 'Class 3 HELLP (Mild)' = 'Class 2 HELLP (Moderate)';
  if (input.plateletsPerMicroLiter < 50000) {
    mississippiClass = 'Class 1 HELLP (Severe)';
  } else if (input.plateletsPerMicroLiter <= 100000) {
    mississippiClass = 'Class 2 HELLP (Moderate)';
  } else {
    mississippiClass = 'Class 3 HELLP (Mild)';
  }

  return {
    hasHellp: true,
    mississippiClass,
    clinicalManagement: `${mississippiClass}: Obstetric emergency. Initiate IV Magnesium Sulfate seizure prophylaxis immediately, maintain SBP < 160 and DBP < 110 with IV Labetalol or Hydralazine, and prepare for urgent delivery after maternal stabilization.`,
  };
}

// ==========================================
// 3. LABOR & DELIVERY SUITE
// ==========================================

export function evaluateNichdFhrCategory(input: {
  baselineBpm: number; // normal 110-160
  variability: 'absent' | 'minimal' | 'moderate' | 'marked';
  lateDecelerations: 'none' | 'intermittent' | 'recurrent';
  variableDecelerations: 'none' | 'intermittent' | 'recurrent';
  prolongedDecelerations: boolean; // >=2 min and <10 min
  sinusoidalPattern: boolean;
}): {
  category: 'Category I (Normal)' | 'Category II (Indeterminate)' | 'Category III (Abnormal)';
  clinicalAction: string;
} {
  // Category III:
  // Absent baseline FHR variability AND any of: recurrent late decels, recurrent variable decels, or bradycardia (<110); OR sinusoidal pattern
  const isBradycardia = input.baselineBpm < 110;
  const isAbsentVar = input.variability === 'absent';
  const hasRecurrentLateOrVar = input.lateDecelerations === 'recurrent' || input.variableDecelerations === 'recurrent';

  if (input.sinusoidalPattern || (isAbsentVar && (hasRecurrentLateOrVar || isBradycardia))) {
    return {
      category: 'Category III (Abnormal)',
      clinicalAction: 'Category III FHR: Predictive of abnormal fetal acid-base status. Requires prompt intrapartum resuscitation (maternal repositioning, oxygen, IV fluid bolus, stop oxytocin/uterotonics, tocolysis for tachysystole). If unimproved, expeditious operative delivery is mandatory.',
    };
  }

  // Category I:
  // Baseline 110-160, Moderate variability, No late/variable decels
  const isNormalBaseline = input.baselineBpm >= 110 && input.baselineBpm <= 160;
  const isModerateVar = input.variability === 'moderate';
  const noLateDecel = input.lateDecelerations === 'none';
  const noVarDecel = input.variableDecelerations === 'none';

  if (isNormalBaseline && isModerateVar && noLateDecel && noVarDecel && !input.prolongedDecelerations) {
    return {
      category: 'Category I (Normal)',
      clinicalAction: 'Category I FHR: Strongly predictive of normal fetal acid-base status at the time of observation. Continue routine intrapartum monitoring without specific intervention.',
    };
  }

  // Category II:
  // All tracings not categorized as Category I or III
  return {
    category: 'Category II (Indeterminate)',
    clinicalAction: 'Category II FHR: Not predictive of abnormal fetal acid-base status, but requires continued evaluation, surveillance, and intrauterine resuscitation maneuvers as indicated.',
  };
}

export function getHelperrMnemonic(): {
  step: string;
  action: string;
  technique: string;
}[] {
  return [
    { step: 'H - Help', action: 'Call for immediate assistance', technique: 'Mobilize experienced obstetrician, pediatric resuscitation team, anesthesia, and extra nursing.' },
    { step: 'E - Episiotomy', action: 'Evaluate for episiotomy', technique: 'Episiotomy does not release bony impaction, but may create additional room for internal rotational maneuvers.' },
    { step: 'L - Legs (McRoberts)', action: 'Hyperflex and abduct maternal hips', technique: 'Flattens sacral promontory and cephalad rotation of pubic symphysis. Successful in >40% of cases.' },
    { step: 'P - Pressure (Suprapubic)', action: 'Apply downward and lateral suprapubic pressure', technique: 'Direct pressure over fetal anterior shoulder to disimpact under pubic bone. NEVER apply fundal pressure!' },
    { step: 'E - Enter (Internal Rotation)', action: 'Rubin II / Woods screw maneuvers', technique: 'Apply pressure on posterior surface of anterior shoulder to rotate fetal chest toward fetal spine.' },
    { step: 'R - Remove posterior arm', action: 'Deliver posterior arm', technique: 'Follow posterior arm to elbow, flex forearm across chest, and grasp hand to sweep arm out of introitus.' },
    { step: 'R - Roll to hands and knees', action: 'Gaskin all-fours maneuver', technique: 'Roll patient onto hands and knees to increase pelvic pelvic conjugate diameter and facilitate delivery.' },
  ];
}

// ==========================================
// 4. GYNECOLOGY & REPRODUCTIVE ENDOCRINOLOGY
// ==========================================

export function evaluateRotterdamPcos(input: {
  oligoOrAnovulation: boolean; // irregular cycles, oligomenorrhea or amenorrhea
  clinicalOrBiochemicalHyperandrogenism: boolean; // hirsutism, acne, alopecia, elevated total/free testosterone
  polycysticOvariesOnUltrasound: boolean; // >=20 follicles (2-9mm) per ovary or ovarian volume >=10 mL
  otherEtiologiesExcluded: boolean; // thyroid, hyperprolactinemia, NCAH excluded
}): {
  meetsRotterdamCriteria: boolean;
  criteriaMetCount: number;
  recommendation: string;
} {
  const criteria = [
    input.oligoOrAnovulation,
    input.clinicalOrBiochemicalHyperandrogenism,
    input.polycysticOvariesOnUltrasound,
  ];
  const criteriaMetCount = criteria.filter(Boolean).length;
  const meetsRotterdamCriteria = input.otherEtiologiesExcluded && criteriaMetCount >= 2;

  let recommendation = '';
  if (meetsRotterdamCriteria) {
    recommendation = `Meets Rotterdam 2003 / International PCOS Consensus criteria (${criteriaMetCount}/3 cardinal features with secondary causes excluded). Screen for metabolic syndrome (fasting lipids, 75g 2h OGTT), assess endometrial hyperplasia risk, and discuss lifestyle / combined oral contraceptives / letrozole.`;
  } else if (!input.otherEtiologiesExcluded) {
    recommendation = 'Must exclude secondary mimics (TSH for thyroid disorder, Prolactin, and morning 17-OHP for Non-Classic Congenital Adrenal Hyperplasia) before establishing a PCOS diagnosis.';
  } else {
    recommendation = `Only ${criteriaMetCount}/3 Rotterdam criteria met. Diagnosis of PCOS not confirmed.`;
  }

  return { meetsRotterdamCriteria, criteriaMetCount, recommendation };
}

export function calculateFerrimanGallweyHirsutism(scores: {
  upperLip: 0 | 1 | 2 | 3 | 4;
  chin: 0 | 1 | 2 | 3 | 4;
  chest: 0 | 1 | 2 | 3 | 4;
  upperAbdomen: 0 | 1 | 2 | 3 | 4;
  lowerAbdomen: 0 | 1 | 2 | 3 | 4;
  upperArms: 0 | 1 | 2 | 3 | 4;
  thighs: 0 | 1 | 2 | 3 | 4;
  upperBack: 0 | 1 | 2 | 3 | 4;
  lowerBack: 0 | 1 | 2 | 3 | 4;
}): {
  score: number;
  isHirsutism: boolean;
  severity: 'Normal (No Hirsutism)' | 'Mild Hirsutism' | 'Moderate Hirsutism' | 'Severe Hirsutism';
} {
  const score = (Object.values(scores) as number[]).reduce((a, b) => a + b, 0);
  const isHirsutism = score >= 8;

  let severity: 'Normal (No Hirsutism)' | 'Mild Hirsutism' | 'Moderate Hirsutism' | 'Severe Hirsutism' = 'Normal (No Hirsutism)';
  if (score >= 25) severity = 'Severe Hirsutism';
  else if (score >= 15) severity = 'Moderate Hirsutism';
  else if (score >= 8) severity = 'Mild Hirsutism';

  return { score, isHirsutism, severity };
}
