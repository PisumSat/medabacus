export interface HemorrhageRiskInput {
  multipleGestation: boolean;
  priorCesareanOrUterineSurgery: boolean;
  grandMultiparity: boolean; // > 4 prior deliveries
  largeFibroids: boolean;
  chorioamnionitis: boolean;
  prolongedOxytocin: boolean;
  bmiOver40: boolean;
  priorPphHistory: boolean;
  placentaPreviaOrAccreta: boolean;
  hematocritLow: boolean; // Hct < 30% or Hb < 10 g/dL
  plateletsLow: boolean; // < 100,000
  activeBleedingAdmission: boolean;
  knownCoagulopathy: boolean;
}

export interface QblInput {
  totalWetWeightGrams: number;
  totalDryWeightGrams: number;
  suctionVolumeMl: number;
  amnioticFluidAndIrrigationMl: number;
  deliveryType: 'vaginal' | 'cesarean';
}

export interface HemorrhageResult {
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  riskFactors: string[];
  preparednessActions: string[];
  qblResult?: {
    netBloodLossMl: number;
    pphStage: 'Normal' | 'Stage 1 (500 - 1000 mL)' | 'Stage 2 (1000 - 1500 mL)' | 'Stage 3 (> 1500 mL / Critical)';
    stageGuidance: string;
    uterotonicsRecommended: string[];
  };
  noteSnippet: string;
}

export const UTEROTONICS_GUIDE = [
  {
    drug: 'Oxytocin (Pitocin)',
    dose: '10-40 units in 500-1000 mL saline IV continuous infusion, or 10 units IM',
    route: 'IV or IM (NEVER rapid IV bolus)',
    contraindications: 'Hypersensitivity',
    adverseEffects: 'Hypotension (with rapid push), hyponatremia/water intoxication with prolonged high-volume infusion',
  },
  {
    drug: 'Methylergonovine (Methergine)',
    dose: '0.2 mg IM q2-4 hours (max 5 doses)',
    route: 'IM only (avoid IV due to severe vasoconstriction)',
    contraindications: 'HYPERTENSION, Preeclampsia, Gestational HTN, Coronary artery disease, Raynaud phenomenon',
    adverseEffects: 'Severe acute hypertension, vasoconstriction, nausea/vomiting',
  },
  {
    drug: '15-methyl PGF2a (Carboprost / Hemabate)',
    dose: '250 mcg (0.25 mg) IM or intramyometrially q15-90 min (max 8 doses / 2 mg)',
    route: 'IM or Intramyometrial',
    contraindications: 'ASTHMA, Active pulmonary, renal, hepatic, or cardiac disease',
    adverseEffects: 'Bronchospasm, severe diarrhea, vomiting, fever, flushing',
  },
  {
    drug: 'Misoprostol (Cytotec / PGE1)',
    dose: '600-800 mcg sublingually, bucally, or 800-1000 mcg rectally (single dose)',
    route: 'Sublingual, buccal, or rectal',
    contraindications: 'Known allergy to prostaglandins (Safe in asthma and HTN)',
    adverseEffects: 'Shivering, pyrexia (transient high fever), nausea',
  },
  {
    drug: 'Tranexamic Acid (TXA)',
    dose: '1 g (100 mg/mL) IV infused over 10 minutes within 3 hours of delivery; repeat 1 g at 30 min if bleeding continues',
    route: 'IV infusion over 10 min',
    contraindications: 'Active thromboembolic disease, subarachnoid hemorrhage',
    adverseEffects: 'Nausea, hypotension if infused too rapidly (WOMAN trial protocol)',
  },
];

export function calculateHemorrhage(
  riskInput: HemorrhageRiskInput,
  qblInput?: QblInput
): HemorrhageResult {
  const highRiskFactors: string[] = [];
  const mediumRiskFactors: string[] = [];

  if (riskInput.placentaPreviaOrAccreta) highRiskFactors.push('Placenta Previa / Low-Lying / Placenta Accreta Spectrum');
  if (riskInput.activeBleedingAdmission) highRiskFactors.push('Active Bleeding on Admission');
  if (riskInput.knownCoagulopathy) highRiskFactors.push('Known Coagulopathy or Anticoagulation Therapy');
  if (riskInput.hematocritLow) highRiskFactors.push('Severe Anemia (Hct < 30% / Hb < 10 g/dL)');
  if (riskInput.plateletsLow) highRiskFactors.push('Thrombocytopenia (Platelets < 100,000 / uL)');

  if (riskInput.priorCesareanOrUterineSurgery) mediumRiskFactors.push('Prior Cesarean Delivery or Uterine Surgery (myomectomy)');
  if (riskInput.multipleGestation) mediumRiskFactors.push('Multiple Gestation');
  if (riskInput.grandMultiparity) mediumRiskFactors.push('Grand Multiparity (> 4 prior births)');
  if (riskInput.priorPphHistory) mediumRiskFactors.push('History of Postpartum Hemorrhage');
  if (riskInput.largeFibroids) mediumRiskFactors.push('Large Uterine Fibroids (> 4 cm)');
  if (riskInput.chorioamnionitis) mediumRiskFactors.push('Chorioamnionitis / Intra-amniotic Infection');
  if (riskInput.prolongedOxytocin) mediumRiskFactors.push('Prolonged Oxytocin Use (> 24 hours)');
  if (riskInput.bmiOver40) mediumRiskFactors.push('Morbid Obesity (BMI > 40 kg/m2)');

  let riskLevel: HemorrhageResult['riskLevel'];
  const riskFactors: string[] = [];
  const preparednessActions: string[] = [];

  if (highRiskFactors.length > 0) {
    riskLevel = 'High Risk';
    riskFactors.push(...highRiskFactors, ...mediumRiskFactors);
    preparednessActions.push(
      'Type and Crossmatch 2-4 units PRBCs immediately.',
      'Notify Blood Bank, In-house Obstetrician, Anesthesia, and Surgical Support.',
      'Ensure two large-bore IV access lines (16G or 18G) in place.',
      'Verify Rapid Infuser and Massive Transfusion Protocol (MTP) readiness in L&D.',
      'Consider planned cesarean in main OR with interventional radiology / gynecologic oncology available if PAS suspected.'
    );
  } else if (mediumRiskFactors.length > 0) {
    riskLevel = 'Medium Risk';
    riskFactors.push(...mediumRiskFactors);
    preparednessActions.push(
      'Type and Screen active on admission.',
      'Ensure at least one 18G or two functioning peripheral IV lines.',
      'Confirm second-line uterotonics (TXA, Methergine/Carboprost) readily available in unit Pyxis.',
      'Alert primary team of elevated hemorrhage risk.'
    );
  } else {
    riskLevel = 'Low Risk';
    riskFactors.push('Singleton pregnancy, unscarred uterus, <= 4 births, no bleeding history.');
    preparednessActions.push(
      'Type and Hold / Type and Screen per routine institutional policy.',
      'Standard 18G/20G peripheral IV access.',
      'Routine active management of third stage of labor (Oxytocin 10-20 units after delivery).'
    );
  }

  let qblResult: HemorrhageResult['qblResult'];

  if (qblInput) {
    const netWeightGrams = Math.max(0, qblInput.totalWetWeightGrams - qblInput.totalDryWeightGrams);
    const suctionBloodLoss = Math.max(0, qblInput.suctionVolumeMl - qblInput.amnioticFluidAndIrrigationMl);
    const netBloodLossMl = Math.round(netWeightGrams + suctionBloodLoss);

    let pphStage: NonNullable<HemorrhageResult['qblResult']>['pphStage'];
    let stageGuidance = '';
    const uterotonicsRecommended: string[] = [];

    if (netBloodLossMl > 1500) {
      pphStage = 'Stage 3 (> 1500 mL / Critical)';
      stageGuidance =
        'CRITICAL HEMORRHAGE (Stage 3): Activate Massive Transfusion Protocol (MTP, 1:1:1 PRBC : FFP : Platelets). Second dose of TXA 1g IV if >30 min from first dose. Move to OR immediately for intrauterine balloon tamponade (Bakri), B-Lynch compression sutures, pelvic artery embolization, or emergency hysterectomy. Correct hypothermia, acidosis, and hypocalcemia (Calcium chloride 1g IV).';
      uterotonicsRecommended.push('Oxytocin IV', 'TXA 1g IV', 'Methergine (if no HTN)', 'Carboprost (if no asthma)', 'Misoprostol 800-1000 mcg');
    } else if (netBloodLossMl >= 1000) {
      pphStage = 'Stage 2 (1000 - 1500 mL)';
      stageGuidance =
        'OBSTETRIC HEMORRHAGE (Stage 2): Administer TXA 1g IV over 10 min (WOMAN trial). Administer second-line uterotonic (Methergine 0.2mg IM if non-hypertensive, or Carboprost 250mcg IM if non-asthmatic). Order 2 units PRBCs to bedside. Place Foley catheter to empty bladder. Prepare intrauterine balloon / surgical intervention.';
      uterotonicsRecommended.push('Tranexamic Acid 1g IV', 'Methergine 0.2mg IM (or Carboprost 250mcg IM)', 'Misoprostol 800mcg PR/SL');
    } else if (netBloodLossMl >= 500 && qblInput.deliveryType === 'vaginal') {
      pphStage = 'Stage 1 (500 - 1000 mL)';
      stageGuidance =
        'ELEVATED BLOOD LOSS (Stage 1): Perform vigorous bimanual uterine massage. Increase Oxytocin infusion rate. Empty bladder with Foley. Inspect cervix and vagina for lacerations; inspect placenta for missing cotyledons. Check vital signs q5min.';
      uterotonicsRecommended.push('Oxytocin 20-40 units in 1L IV', 'Consider Methergine 0.2mg IM or Carboprost');
    } else {
      pphStage = 'Normal';
      stageGuidance = 'Blood loss within expected range for delivery modality. Continue active surveillance.';
    }

    qblResult = {
      netBloodLossMl,
      pphStage,
      stageGuidance,
      uterotonicsRecommended,
    };
  }

  let noteSnippet = `CMQCC OBSTETRIC HEMORRHAGE ASSESSMENT: ${riskLevel}
- Risk Factors: ${riskFactors.join(', ')}
- Preparedness: ${preparednessActions[0]}`;
  if (qblResult) {
    noteSnippet += `\nQUANTITATIVE BLOOD LOSS (QBL): ${qblResult.netBloodLossMl} mL (${qblResult.pphStage})
- Plan: ${qblResult.stageGuidance}`;
  }

  return {
    riskLevel,
    riskFactors,
    preparednessActions,
    qblResult,
    noteSnippet,
  };
}
