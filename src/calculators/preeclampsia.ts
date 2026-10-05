export interface PreeclampsiaInput {
  gaWeeks: number;
  gaDays: number;
  sbp: number; // Systolic BP
  dbp: number; // Diastolic BP
  proteinuria: boolean; // >= 300mg/24h or UPCR >= 0.3
  plateletsLow: boolean; // < 100,000 /uL
  creatinineElevated: boolean; // > 1.1 mg/dL or doubling
  liverTransaminasesElevated: boolean; // AST/ALT >= 2x ULN or severe RUQ pain
  pulmonaryEdema: boolean;
  neurologicalSymptoms: boolean; // Persistent severe headache, scotomata, visual changes
}

export interface PreeclampsiaResult {
  diagnosis: 'Normotensive' | 'Gestational Hypertension' | 'Preeclampsia without Severe Features' | 'Preeclampsia with Severe Features' | 'Hypertensive Urgency / Severe Range BP';
  hasSevereFeatures: boolean;
  severeFeatureDetails: string[];
  magnesiumIndicated: boolean;
  antihypertensiveIndicated: boolean;
  deliveryRecommendation: string;
  urgentActions: string[];
  noteSnippet: string;
}

export function evaluatePreeclampsia(input: PreeclampsiaInput): PreeclampsiaResult {
  const isHypertensive = input.sbp >= 140 || input.dbp >= 90;
  const isSevereBp = input.sbp >= 160 || input.dbp >= 110;

  const severeFeatures: string[] = [];
  if (isSevereBp) severeFeatures.push(`Severe-range Blood Pressure (SBP >=160 or DBP >=110): ${input.sbp}/${input.dbp} mmHg`);
  if (input.plateletsLow) severeFeatures.push('Thrombocytopenia (Platelets < 100,000 / uL)');
  if (input.creatinineElevated) severeFeatures.push('Renal Insufficiency (Creatinine > 1.1 mg/dL or 2x baseline)');
  if (input.liverTransaminasesElevated) severeFeatures.push('Impaired Liver Function (AST/ALT >= 2x normal or severe RUQ pain)');
  if (input.pulmonaryEdema) severeFeatures.push('Pulmonary Edema');
  if (input.neurologicalSymptoms) severeFeatures.push('Cerebral/Visual Disturbances (Persistent severe headache, scotomata, vision loss)');

  const hasSevereFeatures = severeFeatures.length > 0;
  let diagnosis: PreeclampsiaResult['diagnosis'];

  if (isHypertensive) {
    if (hasSevereFeatures) {
      diagnosis = 'Preeclampsia with Severe Features';
    } else if (input.proteinuria) {
      diagnosis = 'Preeclampsia without Severe Features';
    } else {
      diagnosis = 'Gestational Hypertension';
    }
  } else {
    diagnosis = 'Normotensive';
  }

  const urgentActions: string[] = [];
  let deliveryRecommendation = '';
  const magnesiumIndicated = hasSevereFeatures;
  const antihypertensiveIndicated = isSevereBp;

  if (antihypertensiveIndicated) {
    urgentActions.push('Urgent Antihypertensive Therapy: Administer IV Labetalol (20mg -> 40mg -> 80mg every 10-20 min), IV Hydralazine (5-10mg every 20-30 min), or Oral Nifedipine IR 10mg within 30-60 minutes to prevent maternal stroke.');
  }

  if (magnesiumIndicated) {
    urgentActions.push('Seizure Prophylaxis: Magnesium Sulfate 4-6g IV loading dose over 20-30 minutes, followed by 1-2g/hr IV continuous infusion. Monitor DTRs, respiratory rate, and urine output.');
  }

  if (diagnosis === 'Preeclampsia with Severe Features') {
    if (input.gaWeeks >= 34) {
      deliveryRecommendation = `Delivery indicated after maternal stabilization (Gestational Age ${input.gaWeeks}+${input.gaDays} >= 34+0 weeks). Continue Magnesium Sulfate intrapartum and for 24 hours postpartum.`;
    } else {
      deliveryRecommendation = `Gestational Age ${input.gaWeeks}+${input.gaDays} (<34+0 weeks): If maternal and fetal status are stable, admit to tertiary center for expectant management. Administer antenatal corticosteroids (Betamethasone 12mg IM q24h x 2) for fetal lung maturity. Deliver immediately if eclampsia, pulmonary edema, DIC, uncontrollable severe BP, or non-reassuring fetal status occurs.`;
    }
  } else if (diagnosis === 'Preeclampsia without Severe Features' || diagnosis === 'Gestational Hypertension') {
    if (input.gaWeeks >= 37) {
      deliveryRecommendation = `Delivery recommended at 37+0 weeks (ACOG Practice Bulletin 222). Induce labor if spontaneous labor has not begun.`;
    } else {
      deliveryRecommendation = `Expectant management until 37+0 weeks with twice-weekly BP checks, weekly CBC/CMP/platelets, and weekly fetal NST/BPP and growth scans every 3-4 weeks. Patient education on severe symptoms.`;
    }
  } else {
    deliveryRecommendation = 'Routine antenatal surveillance. Educate on warning signs of preeclampsia (headache, epigastric pain, visual changes).';
  }

  const noteSnippet = `PREECLAMPSIA EVALUATION (ACOG PB 222):
- GA: ${input.gaWeeks}+${input.gaDays} wks | BP: ${input.sbp}/${input.dbp} mmHg
- Diagnosis: ${diagnosis}
- Proteinuria: ${input.proteinuria ? 'Positive (>=300mg or UPCR >=0.3)' : 'Negative'}
- Severe Features: ${hasSevereFeatures ? severeFeatures.join('; ') : 'None'}
- MgSO4 Indicated: ${magnesiumIndicated ? 'YES (4-6g IV load, then 1-2g/hr)' : 'No'}
- Urgent Antihypertensives: ${antihypertensiveIndicated ? 'YES (Target <160/110)' : 'No'}
- Plan: ${deliveryRecommendation}`;

  return {
    diagnosis,
    hasSevereFeatures,
    severeFeatureDetails: severeFeatures,
    magnesiumIndicated,
    antihypertensiveIndicated,
    deliveryRecommendation,
    urgentActions,
    noteSnippet,
  };
}
