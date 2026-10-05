/**
 * MEDABACUS Clinical Calculator Wiki - OB/GYN Suite
 * High-yield scores, formulas & classifications across Antenatal Doppler,
 * Maternal High-Risk, Gyn-Onc (ROMA), ASCCP, PALM-COEIN, and Contraception.
 */

// ==========================================
// 1. GYN-ONCOLOGY & ADNEXAL EVALUATION
// ==========================================

/**
 * ROMA Score (Risk of Ovarian Malignancy Algorithm)
 * Moore RG et al., combining serum HE4 (pmol/L) and CA-125 (U/mL).
 */
export function calculateRomaScore(
  ca125Uml: number,
  he4PmolL: number,
  isPostmenopausal: boolean
): {
  predictiveIndex: number;
  romaPercentage: number;
  riskCategory: 'High Risk of Epithelial Ovarian Cancer' | 'Low Risk of Epithelial Ovarian Cancer';
  referralRecommendation: string;
  guideline: string;
} {
  const lnCA125 = Math.log(Math.max(1, ca125Uml));
  const lnHE4 = Math.log(Math.max(1, he4PmolL));

  let pi = 0;
  let cutoff = 0;

  if (isPostmenopausal) {
    // Postmenopausal: PI = -8.09 + 1.04*ln(HE4) + 0.732*ln(CA125)
    pi = -8.09 + 1.04 * lnHE4 + 0.732 * lnCA125;
    cutoff = 29.9; // %
  } else {
    // Premenopausal: PI = -12.0 + 2.38*ln(HE4) + 0.0626*ln(CA125)
    pi = -12.0 + 2.38 * lnHE4 + 0.0626 * lnCA125;
    cutoff = 11.4; // %
  }

  const expPI = Math.exp(pi);
  const romaPercentage = parseFloat(((expPI / (1 + expPI)) * 100).toFixed(1));
  const isHighRisk = romaPercentage >= cutoff;

  let riskCategory: 'High Risk of Epithelial Ovarian Cancer' | 'Low Risk of Epithelial Ovarian Cancer' = 'Low Risk of Epithelial Ovarian Cancer';
  let referralRecommendation = 'Low risk of malignancy. Management by general gynecologist is appropriate.';

  if (isHighRisk) {
    riskCategory = 'High Risk of Epithelial Ovarian Cancer';
    referralRecommendation = `High risk of ovarian cancer (ROMA ${romaPercentage}% ≥ cutoff ${cutoff}%). Expedited referral to a Gynecologic Oncologist for surgical staging and debulking.`;
  }

  return {
    predictiveIndex: parseFloat(pi.toFixed(3)),
    romaPercentage,
    riskCategory,
    referralRecommendation,
    guideline: 'ACOG / SGO Committee Opinion: Role of the Obstetrician-Gynecologist in the Detection and Evaluation of Ovarian Cancer',
  };
}

/**
 * Amsel Criteria for Bacterial Vaginosis (BV)
 */
export interface AmselInput {
  homogeneousThinWhiteGrayDischarge: boolean;
  vaginalPhGreaterThan4_5: boolean;
  positiveWhiffTestFishyOdor10PercentKOH: boolean;
  clueCellsPresentAtLeast20PercentWetMount: boolean;
}

export function evaluateAmselCriteria(input: AmselInput): {
  criteriaMetCount: number;
  bvConfirmed: boolean;
  firstLineTherapy: string;
  guideline: string;
} {
  let count = 0;
  if (input.homogeneousThinWhiteGrayDischarge) count++;
  if (input.vaginalPhGreaterThan4_5) count++;
  if (input.positiveWhiffTestFishyOdor10PercentKOH) count++;
  if (input.clueCellsPresentAtLeast20PercentWetMount) count++;

  const bvConfirmed = count >= 3;

  let firstLineTherapy = 'Does not meet 3 of 4 Amsel criteria. Consider trichomoniasis, candida, or physiologic discharge.';
  if (bvConfirmed) {
    firstLineTherapy = 'Bacterial Vaginosis confirmed (≥3/4 Amsel criteria). Preferred regimen: Metronidazole 500 mg orally BID x 7 days OR Metronidazole gel 0.75% one applicator intravaginally daily x 5 days.';
  }

  return {
    criteriaMetCount: count,
    bvConfirmed,
    firstLineTherapy,
    guideline: 'CDC Sexually Transmitted Infections Treatment Guidelines (2021)',
  };
}

// ==========================================
// 2. MATERNAL-FETAL MEDICINE & HIGH-RISK
// ==========================================

/**
 * Swansea Criteria for Acute Fatty Liver of Pregnancy (AFLP)
 */
export interface SwanseaInput {
  vomiting: boolean;
  abdominalPain: boolean;
  polydipsiaPolyuria: boolean;
  encephalopathy: boolean;
  elevatedBilirubinOver14UmolL: boolean; // > 0.8 mg/dL
  hypoglycemiaUnder4MmolL: boolean; // < 72 mg/dL
  elevatedUricAcidOver340UmolL: boolean; // > 5.7 mg/dL
  leukocytosisOver11: boolean; // WBC > 11 x 10^9/L
  ascitesOrBrightLiverOnUltrasound: boolean;
  elevatedTransaminasesAstOrAltOver42: boolean;
  elevatedAmmoniaOver47UmolL: boolean;
  renalImpairmentCreatinineOver150UmolL: boolean; // > 1.7 mg/dL
  coagulopathyPtOver14OrApttOver34: boolean;
  microvesicularSteatosisOnLiverBiopsy: boolean;
}

export function evaluateSwanseaCriteria(input: SwanseaInput): {
  criteriaCount: number;
  aflpConfirmed: boolean;
  emergencyObstetricPlan: string;
  guideline: string;
} {
  let count = 0;
  if (input.vomiting) count++;
  if (input.abdominalPain) count++;
  if (input.polydipsiaPolyuria) count++;
  if (input.encephalopathy) count++;
  if (input.elevatedBilirubinOver14UmolL) count++;
  if (input.hypoglycemiaUnder4MmolL) count++;
  if (input.elevatedUricAcidOver340UmolL) count++;
  if (input.leukocytosisOver11) count++;
  if (input.ascitesOrBrightLiverOnUltrasound) count++;
  if (input.elevatedTransaminasesAstOrAltOver42) count++;
  if (input.elevatedAmmoniaOver47UmolL) count++;
  if (input.renalImpairmentCreatinineOver150UmolL) count++;
  if (input.coagulopathyPtOver14OrApttOver34) count++;
  if (input.microvesicularSteatosisOnLiverBiopsy) count++;

  const aflpConfirmed = count >= 6;

  let emergencyObstetricPlan = 'Does not meet Swansea criteria (requires ≥ 6/14). Differentiate from HELLP syndrome, viral hepatitis, or cholestasis of pregnancy.';
  if (aflpConfirmed) {
    emergencyObstetricPlan = `Meets Swansea Criteria for Acute Fatty Liver of Pregnancy (${count}/14). OBSTETRIC EMERGENCY: Immediate maternal stabilization (correct hypoglycemia with 10% dextrose, correct coagulopathy with FFP/cryo) followed by EXPEDITED DELIVERY regardless of gestational age. Admit to ICU.`;
  }

  return {
    criteriaCount: count,
    aflpConfirmed,
    emergencyObstetricPlan,
    guideline: 'Ch’ng CL et al. Prospective study of liver dysfunction in pregnancy (Swansea Criteria) (Gut 2002)',
  };
}

/**
 * Umbilical Artery Doppler S/D Ratio & Pulsatility Index
 */
export function evaluateUmbilicalDoppler(
  gaWeeks: number,
  systolicVelocity: number, // cm/s
  diastolicVelocity: number, // cm/s
  meanVelocity: number // cm/s
): {
  sdRatio: number;
  pulsatilityIndex: number;
  dopplerStatus: 'Normal Placental Impedance' | 'Elevated Placental Resistance' | 'Absent End-Diastolic Flow (AEDF)' | 'Reversed End-Diastolic Flow (REDF)';
  actionPlan: string;
  guideline: string;
} {
  if (diastolicVelocity < 0) {
    return {
      sdRatio: -1,
      pulsatilityIndex: parseFloat(((systolicVelocity - diastolicVelocity) / Math.max(1, meanVelocity)).toFixed(2)),
      dopplerStatus: 'Reversed End-Diastolic Flow (REDF)',
      actionPlan: 'CRITICAL PLACENTAL INSUFFICIENCY (REDF): Extremely high risk of fetal acidosis and intrauterine fetal demise. Admit for inpatient continuous FHR monitoring, administer antenatal corticosteroids, and delivery typically indicated at ≥ 30-32 weeks.',
      guideline: 'SMFM Consult Series #52: Evaluation and management of severe fetal growth restriction (AJOG 2020)',
    };
  }

  if (diastolicVelocity === 0) {
    return {
      sdRatio: Infinity,
      pulsatilityIndex: parseFloat((systolicVelocity / Math.max(1, meanVelocity)).toFixed(2)),
      dopplerStatus: 'Absent End-Diastolic Flow (AEDF)',
      actionPlan: 'SEVERE PLACENTAL INSUFFICIENCY (AEDF): Antenatal steroids for fetal lung maturity, daily BPP/NST, deliver at 33-34 weeks or earlier if non-reassuring testing.',
      guideline: 'SMFM Consult Series #52: Severe fetal growth restriction (AJOG 2020)',
    };
  }

  const sdRatio = parseFloat((systolicVelocity / diastolicVelocity).toFixed(2));
  const pi = parseFloat(((systolicVelocity - diastolicVelocity) / Math.max(1, meanVelocity)).toFixed(2));

  // 95th percentile threshold is approximately 3.0 after 30 weeks GA
  const isElevated = (gaWeeks >= 30 && sdRatio > 3.0) || (gaWeeks < 30 && sdRatio > 4.0);

  if (isElevated) {
    return {
      sdRatio,
      pulsatilityIndex: pi,
      dopplerStatus: 'Elevated Placental Resistance',
      actionPlan: 'Elevated resistance (S/D > 95th percentile). Increased risk of IUGR and oligohydramnios. Perform weekly umbilical artery Doppler and twice-weekly NST/AFI surveillance.',
      guideline: 'SMFM Consult Series #52: Fetal growth restriction (AJOG 2020)',
    };
  }

  return {
    sdRatio,
    pulsatilityIndex: pi,
    dopplerStatus: 'Normal Placental Impedance',
    actionPlan: 'Normal forward flow throughout diastole. Low placental resistance appropriate for gestational age.',
    guideline: 'SMFM Consult Series #52: Fetal growth restriction (AJOG 2020)',
  };
}

/**
 * FIGO PALM-COEIN Classification for Abnormal Uterine Bleeding (AUB)
 */
export function classifyPalmCoein(etiologies: {
  polyp: boolean;
  adenomyosis: boolean;
  leiomyoma: boolean;
  malignancyOrHyperplasia: boolean;
  coagulopathy: boolean;
  ovulatoryDysfunction: boolean;
  endometrial: boolean;
  iatrogenic: boolean;
  notOtherwiseSpecified: boolean;
}): {
  structuralCauses: string[];
  nonStructuralCauses: string[];
  figoCode: string;
  guideline: string;
} {
  const structural: string[] = [];
  const nonStructural: string[] = [];

  if (etiologies.polyp) structural.push('Polyp (AUB-P)');
  if (etiologies.adenomyosis) structural.push('Adenomyosis (AUB-A)');
  if (etiologies.leiomyoma) structural.push('Leiomyoma (AUB-L)');
  if (etiologies.malignancyOrHyperplasia) structural.push('Malignancy / Hyperplasia (AUB-M)');

  if (etiologies.coagulopathy) nonStructural.push('Coagulopathy (AUB-C)');
  if (etiologies.ovulatoryDysfunction) nonStructural.push('Ovulatory Dysfunction (AUB-O)');
  if (etiologies.endometrial) nonStructural.push('Endometrial (AUB-E)');
  if (etiologies.iatrogenic) nonStructural.push('Iatrogenic (AUB-I)');
  if (etiologies.notOtherwiseSpecified) nonStructural.push('Not Otherwise Classified (AUB-N)');

  const code = `AUB P${etiologies.polyp ? '1' : '0'}_A${etiologies.adenomyosis ? '1' : '0'}_L${etiologies.leiomyoma ? '1' : '0'}_M${etiologies.malignancyOrHyperplasia ? '1' : '0'} - C${etiologies.coagulopathy ? '1' : '0'}_O${etiologies.ovulatoryDysfunction ? '1' : '0'}_E${etiologies.endometrial ? '1' : '0'}_I${etiologies.iatrogenic ? '1' : '0'}_N${etiologies.notOtherwiseSpecified ? '1' : '0'}`;

  return {
    structuralCauses: structural,
    nonStructuralCauses: nonStructural,
    figoCode: code,
    guideline: 'FIGO System 1 and 2 for Abnormal Uterine Bleeding (Munro MG et al., Int J Gynaecol Obstet 2018)',
  };
}
