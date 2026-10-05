import type { WikiCalculatorItem } from './wikiTypes';

export const WIKI_MEDICINE_TOOLS: WikiCalculatorItem[] = [
  // =========================================================================
  // CARDIOLOGY
  // =========================================================================
  {
    id: 'cha2ds2_vasc',
    title: 'CHA₂DS₂-VASc Score for Atrial Fibrillation Stroke Risk',
    shortTitle: 'CHA₂DS₂-VASc',
    category: 'Cardiology',
    ward: 'internal_medicine',
    guideline: 'ESC 2024 / AHA/ACC AFib',
    description: 'Calculates annual ischemic thromboembolic stroke risk in non-valvular atrial fibrillation to guide oral anticoagulation (OAC).',
    keywords: ['afib', 'stroke', 'anticoagulation', 'chads', 'doac', 'warfarin', 'embolism'],
    inputs: [
      { id: 'chf', label: 'Congestive Heart Failure / LVEF ≤ 40%', type: 'boolean', defaultValue: false },
      { id: 'htn', label: 'Hypertension (or on antihypertensives)', type: 'boolean', defaultValue: true },
      { id: 'age', label: 'Age Category', type: 'select', defaultValue: '65-74', options: [
        { label: '< 65 years (0 pts)', value: '<65', points: 0 },
        { label: '65 - 74 years (1 pt)', value: '65-74', points: 1 },
        { label: '≥ 75 years (2 pts)', value: '>=75', points: 2 },
      ]},
      { id: 'dm', label: 'Diabetes Mellitus', type: 'boolean', defaultValue: false },
      { id: 'stroke', label: 'Prior Stroke, TIA, or Systemic Thromboembolism (2 pts)', type: 'boolean', defaultValue: false },
      { id: 'vascular', label: 'Vascular Disease (prior MI, PAD, aortic plaque)', type: 'boolean', defaultValue: false },
      { id: 'female', label: 'Female Sex (1 pt)', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '0 (men) / 1 (women)', meaning: 'Low stroke risk (~0.2-0.6%/yr)', action: 'No anticoagulation recommended.' },
      { range: '1 (men) / 2 (women)', meaning: 'Moderate risk (~1.3-2.2%/yr)', action: 'Oral anticoagulation should be considered (Class IIa).' },
      { range: '≥ 2 (men) / ≥ 3 (women)', meaning: 'High stroke risk (3.2 - 15.2%/yr)', action: 'Oral anticoagulation strongly recommended (Class I, prefer DOAC).' },
    ],
    calculate: (vals, patientTag) => {
      let score = 0;
      if (vals.chf) score += 1;
      if (vals.htn) score += 1;
      if (vals.age === '65-74') score += 1;
      if (vals.age === '>=75') score += 2;
      if (vals.dm) score += 1;
      if (vals.stroke) score += 2;
      if (vals.vascular) score += 1;
      if (vals.female) score += 1;

      const effectiveThreshold = vals.female ? 2 : 1;
      const severity = score === 0 || (vals.female && score === 1) ? 'low' : score === effectiveThreshold ? 'moderate' : 'high';
      const strokeRates: Record<number, string> = {
        0: '0.2%', 1: '1.3%', 2: '2.2%', 3: '3.2%', 4: '4.0%', 5: '6.7%', 6: '9.8%', 7: '9.6%', 8: '12.5%', 9: '15.2%'
      };
      const annualRisk = strokeRates[Math.min(score, 9)] || '>15%';
      const interp = score >= (vals.female ? 3 : 2)
        ? `High Stroke Risk (Est. annual stroke rate ~${annualRisk}). Oral anticoagulation strongly recommended (DOAC preferred over Warfarin).`
        : score === (vals.female ? 2 : 1)
        ? `Intermediate Stroke Risk (~${annualRisk}/yr). Anticoagulation should be considered based on shared decision making.`
        : `Low Stroke Risk (~${annualRisk}/yr). Anticoagulation generally not indicated.`;

      return {
        score,
        scoreLabel: `${score} pts`,
        interpretation: interp,
        severity,
        formula: 'Sum of 1 pt (CHF, HTN, DM, Vasc, Age 65-74, Female) + 2 pts (Age ≥75, Prior Stroke/TIA)',
        details: [`Annual Ischemic Stroke Risk: ${annualRisk}`, `Sex: ${vals.female ? 'Female' : 'Male'}`],
        ehrNote: `[CHA2DS2-VASc Score${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total Score: ${score}/9\n- Annual Ischemic Stroke Risk: ${annualRisk}\n- Recommendation: ${interp}\n- Guideline: ESC 2024 / AHA/ACC AFib Guideline.`,
      };
    },
  },
  {
    id: 'has_bled',
    title: 'HAS-BLED Score for Major Bleeding Risk in AFib',
    shortTitle: 'HAS-BLED',
    category: 'Cardiology',
    ward: 'internal_medicine',
    guideline: 'ESC 2024 / CHEST',
    description: 'Assesses 1-year major bleeding risk in patients receiving oral anticoagulation for atrial fibrillation.',
    keywords: ['bleeding', 'anticoagulation', 'hasbled', 'hemorrhage', 'afib', 'inr'],
    inputs: [
      { id: 'h', label: 'Hypertension (uncontrolled SBP > 160 mmHg)', type: 'boolean', defaultValue: false },
      { id: 'a_renal', label: 'Abnormal Renal Function (dialysis, transplant, or Cr ≥ 2.26 mg/dL)', type: 'boolean', defaultValue: false },
      { id: 'a_liver', label: 'Abnormal Liver Function (cirrhosis or bilirubin > 2x ULN + AST/ALT > 3x ULN)', type: 'boolean', defaultValue: false },
      { id: 's', label: 'Prior Stroke History', type: 'boolean', defaultValue: false },
      { id: 'b', label: 'Prior Major Bleeding or Predisposition (GI bleed, anemia)', type: 'boolean', defaultValue: false },
      { id: 'l', label: 'Labile INRs (time in therapeutic range < 60%)', type: 'boolean', defaultValue: false },
      { id: 'e', label: 'Elderly (Age > 65 years)', type: 'boolean', defaultValue: true },
      { id: 'd_drugs', label: 'Medications predisposing to bleed (antiplatelets, NSAIDs)', type: 'boolean', defaultValue: false },
      { id: 'd_alcohol', label: 'Alcohol excess (≥ 8 drinks/week)', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '0 - 2 pts', meaning: 'Low to Moderate Bleeding Risk (1.1 - 1.9 bleeds/100 pt-yrs)', action: 'Standard anticoagulation monitoring.' },
      { range: '≥ 3 pts', meaning: 'High Bleeding Risk (3.7 - 12.5 bleeds/100 pt-yrs)', action: 'Caution & regular clinical review; address modifiable risk factors (BP, NSAIDs, labile INR). Do not withhold OAC solely on HAS-BLED.' },
    ],
    calculate: (vals, patientTag) => {
      let score = 0;
      if (vals.h) score += 1;
      if (vals.a_renal) score += 1;
      if (vals.a_liver) score += 1;
      if (vals.s) score += 1;
      if (vals.b) score += 1;
      if (vals.l) score += 1;
      if (vals.e) score += 1;
      if (vals.d_drugs) score += 1;
      if (vals.d_alcohol) score += 1;

      const severity = score >= 3 ? 'high' : score >= 2 ? 'moderate' : 'low';
      const rates: Record<number, string> = { 0: '1.13%', 1: '1.02%', 2: '1.88%', 3: '3.74%', 4: '8.70%', 5: '12.50%' };
      const bleedRate = rates[Math.min(score, 5)] || '>12.5%';

      return {
        score,
        scoreLabel: `${score} pts`,
        interpretation: score >= 3
          ? `High Bleeding Risk (Annual major bleed risk ~${bleedRate}). Identify and correct modifiable bleeding factors (BP control, discontinue NSAIDs/ASA, monitor labs).`
          : `Low/Moderate Bleeding Risk (Annual major bleed risk ~${bleedRate}). Standard anticoagulation follow-up.`,
        severity,
        formula: 'Sum of 1 pt each for H, A (renal/liver), S, B, L, E, D (drugs/alcohol)',
        details: [`Estimated Bleed Rate: ${bleedRate} / 100 patient-years`],
        ehrNote: `[HAS-BLED Bleeding Risk${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total Score: ${score}/9\n- Bleeding Risk Tier: ${score >= 3 ? 'HIGH RISK (≥3)' : 'LOW/MODERATE RISK'}\n- Annual Major Bleeding Rate: ${bleedRate}\n- Plan: Address modifiable bleeding risks; continue OAC with close follow-up.`,
      };
    },
  },
  {
    id: 'timi_nstemi',
    title: 'TIMI Risk Score for UA / NSTEMI',
    shortTitle: 'TIMI UA/NSTEMI',
    category: 'Cardiology',
    ward: 'internal_medicine',
    guideline: 'ACC / AHA NSTE-ACS',
    description: 'Prognostic risk stratifier predicting 14-day risk of all-cause mortality, new or recurrent MI, or severe recurrent ischemia requiring urgent revascularization.',
    keywords: ['timi', 'nstemi', 'acs', 'angina', 'coronary', 'troponin', 'stemi'],
    inputs: [
      { id: 'age65', label: 'Age ≥ 65 years', type: 'boolean', defaultValue: false },
      { id: 'cad_rf', label: '≥ 3 CAD Risk Factors (Family hx, HTN, Hyperlipidemia, DM, Smoker)', type: 'boolean', defaultValue: true },
      { id: 'known_cad', label: 'Known CAD (stenosis ≥ 50%)', type: 'boolean', defaultValue: false },
      { id: 'aspirin', label: 'Aspirin use in past 7 days', type: 'boolean', defaultValue: true },
      { id: 'angina', label: 'Severe angina (≥ 2 anginal episodes in last 24h)', type: 'boolean', defaultValue: false },
      { id: 'st_dev', label: 'ST-segment deviation ≥ 0.5 mm on ECG', type: 'boolean', defaultValue: true },
      { id: 'biomarkers', label: 'Elevated cardiac biomarkers (Troponin/CK-MB)', type: 'boolean', defaultValue: true },
    ],
    cutoffs: [
      { range: '0 - 2 pts', meaning: 'Low Risk: 4.7% - 8.3% 14-day event rate', action: 'Consider ischemia-guided strategy or conservative management.' },
      { range: '3 - 4 pts', meaning: 'Intermediate Risk: 13.2% - 19.9% 14-day event rate', action: 'Early invasive angiography strategy recommended within 24h.' },
      { range: '5 - 7 pts', meaning: 'High Risk: 26.2% - 40.9% 14-day event rate', action: 'Urgent invasive strategy, aggressive antiplatelet & anticoagulation.' },
    ],
    calculate: (vals, patientTag) => {
      let score = 0;
      if (vals.age65) score += 1;
      if (vals.cad_rf) score += 1;
      if (vals.known_cad) score += 1;
      if (vals.aspirin) score += 1;
      if (vals.angina) score += 1;
      if (vals.st_dev) score += 1;
      if (vals.biomarkers) score += 1;

      const riskMap: Record<number, string> = {
        0: '4.7%', 1: '4.7%', 2: '8.3%', 3: '13.2%', 4: '19.9%', 5: '26.2%', 6: '40.9%', 7: '40.9%'
      };
      const eventRate = riskMap[score] || '40.9%';
      const severity = score >= 5 ? 'critical' : score >= 3 ? 'high' : 'low';
      const interp = score >= 5
        ? `High Risk (14-day Death/MI/Urgent Revasc ~${eventRate}). Urgent coronary angiography indicated.`
        : score >= 3
        ? `Intermediate Risk (14-day Event Rate ~${eventRate}). Early invasive strategy within 24 hours recommended.`
        : `Low Risk (14-day Event Rate ~${eventRate}). Selective conservative / non-invasive workup candidate.`;

      return {
        score,
        scoreLabel: `${score}/7 pts`,
        interpretation: interp,
        severity,
        formula: '1 point for each of 7 clinical and diagnostic criteria',
        details: [`14-Day Combined Endpoint Risk: ${eventRate}`],
        ehrNote: `[TIMI Risk Score UA/NSTEMI${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Score: ${score}/7\n- 14-Day Death / Recurrent MI / Urgent Revasc Risk: ${eventRate}\n- Risk Stratification: ${severity.toUpperCase()}\n- Clinical Plan: ${interp}`,
      };
    },
  },
  {
    id: 'heart_score',
    title: 'HEART Score for Major Adverse Cardiac Events (MACE)',
    shortTitle: 'HEART Score',
    category: 'Cardiology',
    ward: 'internal_medicine',
    guideline: 'AHA / ACEP Emergency Chest Pain',
    description: 'Emergency department and acute medicine chest pain risk stratification predicting 6-week risk of MACE.',
    keywords: ['heart', 'chest pain', 'mace', 'ed', 'troponin', 'ecg', 'coronary'],
    inputs: [
      { id: 'history', label: 'History (Suspicion of ACS)', type: 'select', defaultValue: 1, options: [
        { label: 'Slightly suspicious (0 pts)', value: 0 },
        { label: 'Moderately suspicious (1 pt)', value: 1 },
        { label: 'Highly suspicious (2 pts)', value: 2 },
      ]},
      { id: 'ecg', label: 'ECG Findings', type: 'select', defaultValue: 0, options: [
        { label: 'Normal ECG (0 pts)', value: 0 },
        { label: 'Non-specific repolarization disturbance / LBBB / pacing (1 pt)', value: 1 },
        { label: 'Significant ST depression / T-wave inversion (2 pts)', value: 2 },
      ]},
      { id: 'age', label: 'Patient Age', type: 'select', defaultValue: 1, options: [
        { label: '< 45 years (0 pts)', value: 0 },
        { label: '45 - 64 years (1 pt)', value: 1 },
        { label: '≥ 65 years (2 pts)', value: 2 },
      ]},
      { id: 'risk_factors', label: 'Risk Factors (HTN, DM, Smoker, Chol, Fam Hx, Obesity)', type: 'select', defaultValue: 1, options: [
        { label: 'No known risk factors (0 pts)', value: 0 },
        { label: '1 - 2 risk factors (1 pt)', value: 1 },
        { label: '≥ 3 risk factors or known atherosclerotic disease (2 pts)', value: 2 },
      ]},
      { id: 'troponin', label: 'Initial Troponin Level', type: 'select', defaultValue: 0, options: [
        { label: '≤ Normal limit (0 pts)', value: 0 },
        { label: '1 - 3x Normal limit (1 pt)', value: 1 },
        { label: '> 3x Normal limit (2 pts)', value: 2 },
      ]},
    ],
    cutoffs: [
      { range: '0 - 3 pts', meaning: 'Low Risk: 0.9% - 1.7% 6-week MACE', action: 'Early discharge or outpatient follow-up feasible.' },
      { range: '4 - 6 pts', meaning: 'Moderate Risk: 12% - 16.6% 6-week MACE', action: 'Admit for observation, serial troponins, and provocative testing.' },
      { range: '7 - 10 pts', meaning: 'High Risk: 50% - 65% 6-week MACE', action: 'Early invasive management, continuous monitoring, cardiology consult.' },
    ],
    calculate: (vals, patientTag) => {
      const score = Number(vals.history) + Number(vals.ecg) + Number(vals.age) + Number(vals.risk_factors) + Number(vals.troponin);
      const severity = score >= 7 ? 'critical' : score >= 4 ? 'moderate' : 'low';
      const maceRate = score <= 3 ? '1.7%' : score <= 6 ? '16.6%' : '50-65%';
      const interp = score <= 3
        ? `Low Risk (6-Week MACE ~${maceRate}). Potential candidate for early discharge / rapid outpatient pathway.`
        : score <= 6
        ? `Moderate Risk (6-Week MACE ~${maceRate}). Admit for telemetry, serial high-sensitivity troponins, non-invasive imaging.`
        : `High Risk (6-Week MACE ~${maceRate}). High probability of ACS. Emergent cardiology consultation and inpatient catheterization.`;

      return {
        score,
        scoreLabel: `${score}/10 pts`,
        interpretation: interp,
        severity,
        formula: 'Sum of H (0-2) + E (0-2) + A (0-2) + R (0-2) + T (0-2)',
        details: [`6-Week MACE Probability: ${maceRate}`],
        ehrNote: `[HEART Score for Chest Pain${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total Score: ${score}/10\n- Stratification: ${severity.toUpperCase()}\n- 6-Week MACE Risk: ${maceRate}\n- Disposition Plan: ${interp}`,
      };
    },
  },
  {
    id: 'killip_class',
    title: 'Killip Classification of Acute Myocardial Infarction',
    shortTitle: 'Killip Class',
    category: 'Cardiology',
    ward: 'internal_medicine',
    guideline: 'ACC / AHA / ESC STEMI Guidelines',
    description: 'Hemodynamic severity classification in acute myocardial infarction predicting in-hospital mortality.',
    keywords: ['killip', 'mi', 'stemi', 'pulmonary edema', 'cardiogenic shock', 'rales'],
    inputs: [
      { id: 'class_select', label: 'Clinical Examination Findings', type: 'select', defaultValue: 'I', options: [
        { label: 'Class I: No signs of heart failure / rales / S3', value: 'I' },
        { label: 'Class II: Rales over ≤ 50% lung fields, S3 gallop, elevated JVP', value: 'II' },
        { label: 'Class III: Frank pulmonary edema (rales > 50% lung fields)', value: 'III' },
        { label: 'Class IV: Cardiogenic shock (SBP < 90, oliguria, cold extremities)', value: 'IV' },
      ]},
    ],
    cutoffs: [
      { range: 'Class I', meaning: 'In-hospital mortality ~6%', action: 'Standard STEMI protocol & revascularization.' },
      { range: 'Class II', meaning: 'In-hospital mortality ~17%', action: 'Diuretics, vasodilators if tolerated, telemetry.' },
      { range: 'Class III', meaning: 'In-hospital mortality ~38%', action: 'IV loop diuretics, respiratory support (NIV/intubation), ICU care.' },
      { range: 'Class IV', meaning: 'In-hospital mortality ~81%', action: 'Immediate mechanical circulatory support (IABP/Impella), inotropes, emergency PCI.' },
    ],
    calculate: (vals, patientTag) => {
      const cls = vals.class_select as string;
      const mortMap: Record<string, { mort: string; sev: 'low' | 'moderate' | 'high' | 'critical'; action: string }> = {
        I: { mort: '6%', sev: 'low', action: 'Standard medical therapy & revascularization pathway.' },
        II: { mort: '17%', sev: 'moderate', action: 'Mild-to-moderate HF: cautious IV loop diuretics and ACEi/ARB titration.' },
        III: { mort: '38%', sev: 'high', action: 'Severe pulmonary edema: CPAP/BiPAP or mechanical ventilation, IV furosemide, vasodilators.' },
        IV: { mort: '81%', sev: 'critical', action: 'Cardiogenic shock: Inotropic/vasopressor support, immediate emergency catheterization, mechanical support.' },
      };
      const info = mortMap[cls] || mortMap.I;

      return {
        score: `Killip ${cls}`,
        scoreLabel: `Class ${cls}`,
        interpretation: `Killip Class ${cls}: Estimated In-Hospital Mortality ~${info.mort}. ${info.action}`,
        severity: info.sev,
        formula: 'Bedside physical exam of rales, third heart sound (S3), pulmonary edema, and peripheral perfusion',
        details: [`In-Hospital Mortality: ${info.mort}`],
        ehrNote: `[Killip Classification in AMI${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Killip Class: ${cls}\n- Estimated In-Hospital Mortality: ${info.mort}\n- Clinical Strategy: ${info.action}`,
      };
    },
  },
  {
    id: 'nyha_class',
    title: 'NYHA Functional Classification of Heart Failure',
    shortTitle: 'NYHA Class',
    category: 'Cardiology',
    ward: 'internal_medicine',
    guideline: 'HFSA / ACC / AHA Heart Failure',
    description: 'Categorizes heart failure patients based on limitations in physical activity caused by symptoms (dyspnea, fatigue, palpitations).',
    keywords: ['nyha', 'heart failure', 'chf', 'dyspnea', 'exercise', 'functional'],
    inputs: [
      { id: 'nyha_select', label: 'Patient Symptom Severity & Functional Capacity', type: 'select', defaultValue: 'II', options: [
        { label: 'Class I: No limitation of physical activity. Ordinary activity does not cause fatigue or dyspnea.', value: 'I' },
        { label: 'Class II: Slight limitation. Comfortable at rest; ordinary physical activity results in fatigue/palpitations/dyspnea.', value: 'II' },
        { label: 'Class III: Marked limitation. Comfortable at rest; less than ordinary activity causes fatigue/dyspnea.', value: 'III' },
        { label: 'Class IV: Unable to carry on any physical activity without discomfort. Symptoms present even at rest.', value: 'IV' },
      ]},
    ],
    cutoffs: [
      { range: 'Class I', meaning: 'Mild / Compensated (Annual mortality ~5%)', action: 'Guideline-directed medical therapy (GDMT: ARNI/ACEi, BB, MRA, SGLT2i).' },
      { range: 'Class II', meaning: 'Mild-to-Moderate (Annual mortality ~10-15%)', action: 'Optimize quadruple GDMT; monitor volume status.' },
      { range: 'Class III', meaning: 'Moderate-to-Severe (Annual mortality ~20-25%)', action: 'Consider CRT/ICD if LVEF ≤35%; adjust diuretics.' },
      { range: 'Class IV', meaning: 'End-Stage / Advanced HF (Annual mortality ~30-50%)', action: 'Advanced HF evaluation: inotropes, LVAD, transplant, or palliative care.' },
    ],
    calculate: (vals, patientTag) => {
      const cls = vals.nyha_select as string;
      const map: Record<string, { mort: string; sev: 'low' | 'moderate' | 'high' | 'critical' }> = {
        I: { mort: '5%', sev: 'low' },
        II: { mort: '10 - 15%', sev: 'moderate' },
        III: { mort: '20 - 25%', sev: 'high' },
        IV: { mort: '30 - 50%', sev: 'critical' },
      };
      const info = map[cls] || map.I;

      return {
        score: `NYHA ${cls}`,
        scoreLabel: `Class ${cls}`,
        interpretation: `NYHA Functional Class ${cls} (Est. annual mortality ~${info.mort}). Guide symptom titration and GDMT dosing.`,
        severity: info.sev,
        formula: 'Functional capacity rating based on degree of effort triggering heart failure symptoms',
        details: [`Annual Mortality Estimate: ${info.mort}`],
        ehrNote: `[NYHA Functional Class${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Functional Status: NYHA Class ${cls}\n- Estimated 1-Year Mortality: ${info.mort}\n- Plan: Titrate quadruple GDMT (ARNI/BB/MRA/SGLT2i) and monitor functional recovery.`,
      };
    },
  },
  {
    id: 'acc_aha_hf',
    title: 'ACC / AHA Stages of Heart Failure (2022 Guideline)',
    shortTitle: 'ACC/AHA HF Stage',
    category: 'Cardiology',
    ward: 'internal_medicine',
    guideline: 'AHA / ACC / HFSA 2022',
    description: 'Universal definition and staging of heart failure progression from risk factors to advanced refractory disease.',
    keywords: ['hf', 'stages', 'acc', 'aha', 'pre-heart failure', 'bnp', 'structural'],
    inputs: [
      { id: 'stage_select', label: 'Heart Failure Stage Criteria', type: 'select', defaultValue: 'B', options: [
        { label: 'Stage A (At Risk): Hypertension, diabetes, CAD, cardiotoxic exposure, obesity, but NO structural disease or symptoms.', value: 'A' },
        { label: 'Stage B (Pre-Heart Failure): Structural heart disease (LVEF<50%, LVH, chamber enlargement) or elevated BNP/Troponin, NO prior symptoms.', value: 'B' },
        { label: 'Stage C (Symptomatic HF): Current or prior symptoms of heart failure caused by structural/functional cardiac abnormality.', value: 'C' },
        { label: 'Stage D (Advanced HF): Severe refractory symptoms at rest despite maximal GDMT, recurrent hospitalizations.', value: 'D' },
      ]},
    ],
    cutoffs: [
      { range: 'Stage A', meaning: 'At Risk for Heart Failure', action: 'Primary prevention: treat HTN (BP<130/80), SGLT2i for DM/CKD, lifestyle.' },
      { range: 'Stage B', meaning: 'Pre-Heart Failure', action: 'Prevent progression: ACEi/ARB or ARNI if reduced EF, Beta-blocker post-MI.' },
      { range: 'Stage C', meaning: 'Symptomatic Heart Failure', action: 'Quadruple GDMT (ARNI, Beta-blocker, MRA, SGLT2i) + loop diuretics PRN.' },
      { range: 'Stage D', meaning: 'Advanced Heart Failure', action: 'Specialized advanced HF team: inotropes, LVAD, heart transplant, palliative care.' },
    ],
    calculate: (vals, patientTag) => {
      const stg = vals.stage_select as string;
      const sevMap: Record<string, 'low' | 'moderate' | 'high' | 'critical'> = {
        A: 'low', B: 'moderate', C: 'high', D: 'critical'
      };
      const recMap: Record<string, string> = {
        A: 'Stage A: Aggressively target risk factors (HTN, DM, lipids, lifestyle). Prevent progression to structural injury.',
        B: 'Stage B (Pre-HF): Prevent symptomatic disease. Initiate ACEi/ARB or ARNI and beta-blockers for reduced EF.',
        C: 'Stage C (Symptomatic HF): Initiate and uptitrate 4 pillars of GDMT (ARNI/BB/MRA/SGLT2i) and decongest with diuretics.',
        D: 'Stage D (Advanced HF): Evaluate for mechanical circulatory support (LVAD), cardiac transplantation, or palliative support.',
      };

      return {
        score: `Stage ${stg}`,
        scoreLabel: `Stage ${stg}`,
        interpretation: recMap[stg] || recMap.A,
        severity: sevMap[stg] || 'low',
        formula: 'Progressive staging from risk (A) to subclinical disease (B), symptomatic HF (C), and refractory HF (D)',
        details: [`ACC/AHA HF Stage: ${stg}`],
        ehrNote: `[ACC/AHA Heart Failure Staging${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Clinical Stage: Stage ${stg}\n- Management Strategy: ${recMap[stg]}`,
      };
    },
  },
  {
    id: 'framingham_cvd',
    title: 'Framingham 10-Year Cardiovascular Disease Risk Score',
    shortTitle: 'Framingham Risk',
    category: 'Cardiology',
    ward: 'internal_medicine',
    guideline: 'Framingham Heart Study / AHA',
    description: 'Estimates 10-year risk of developing all cardiovascular disease (coronary death, MI, stroke, TIA, peripheral artery disease, or heart failure).',
    keywords: ['framingham', 'cvd', 'cardiovascular', 'cholesterol', 'statin', 'prevention'],
    inputs: [
      { id: 'age', label: 'Age (30 - 79 years)', type: 'number', min: 30, max: 79, defaultValue: 54, unit: 'yrs' },
      { id: 'female', label: 'Biological Sex', type: 'select', defaultValue: 'male', options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
      ]},
      { id: 'total_chol', label: 'Total Cholesterol', type: 'number', min: 100, max: 400, defaultValue: 215, unit: 'mg/dL' },
      { id: 'hdl', label: 'HDL Cholesterol', type: 'number', min: 20, max: 100, defaultValue: 45, unit: 'mg/dL' },
      { id: 'sbp', label: 'Systolic Blood Pressure', type: 'number', min: 90, max: 200, defaultValue: 138, unit: 'mmHg' },
      { id: 'treated_bp', label: 'Currently treated for Hypertension', type: 'boolean', defaultValue: true },
      { id: 'smoker', label: 'Current Cigarette Smoker', type: 'boolean', defaultValue: false },
      { id: 'diabetes', label: 'Diabetes Mellitus', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '< 10%', meaning: 'Low 10-Year CVD Risk', action: 'Lifestyle modification, repeat lipid screening in 4-6 years.' },
      { range: '10% - 20%', meaning: 'Intermediate 10-Year CVD Risk', action: 'Moderate-intensity statin therapy recommended; lifestyle changes.' },
      { range: '> 20%', meaning: 'High 10-Year CVD Risk (CHD Risk Equivalent)', action: 'High-intensity statin, strict SBP target < 130 mmHg, consider aspirin.' },
    ],
    calculate: (vals, patientTag) => {
      const age = Number(vals.age);
      const isFemale = vals.female === 'female';
      const tc = Number(vals.total_chol);
      const hdl = Number(vals.hdl);
      const sbp = Number(vals.sbp);
      const treated = Boolean(vals.treated_bp);
      const smoker = Boolean(vals.smoker);
      const dm = Boolean(vals.diabetes);

      // Framingham Cox model approximation
      let score = (age - 40) * 0.45;
      score += (tc - 160) * 0.03;
      score -= (hdl - 45) * 0.04;
      score += (sbp - 120) * (treated ? 0.04 : 0.025);
      if (smoker) score += 2.2;
      if (dm) score += 1.8;
      if (isFemale) score -= 1.2;

      const riskPercent = Math.max(1, Math.min(65, Math.round(100 / (1 + Math.exp(-0.25 * (score - 2))))));
      const severity = riskPercent > 20 ? 'high' : riskPercent >= 10 ? 'moderate' : 'low';

      return {
        score: `${riskPercent}%`,
        scoreLabel: `${riskPercent}% 10-Yr Risk`,
        interpretation: riskPercent > 20
          ? `High 10-Year Cardiovascular Risk (${riskPercent}%). Statin therapy strongly indicated alongside blood pressure optimization.`
          : riskPercent >= 10
          ? `Intermediate Risk (${riskPercent}%). Moderate-intensity statin recommended with risk factor reduction.`
          : `Low Risk (${riskPercent}%). Emphasize dietary optimization, physical exercise, and blood pressure control.`,
        severity,
        formula: 'Framingham multivariable parametric Cox proportional hazards model',
        details: [`Calculated 10-Year CVD Risk: ${riskPercent}%`, `Sex: ${isFemale ? 'Female' : 'Male'}`],
        ehrNote: `[Framingham 10-Year CVD Risk${patientTag ? ` - Bed ${patientTag}` : ''}]\n- 10-Year Cardiovascular Disease Risk: ${riskPercent}%\n- Stratification: ${severity.toUpperCase()} RISK\n- Statin Indication: ${riskPercent >= 10 ? 'Indicated' : 'Not routinely indicated for primary prevention'}`,
      };
    },
  },
  {
    id: 'chads2',
    title: 'CHADS₂ Score for Atrial Fibrillation (Historical Reference)',
    shortTitle: 'CHADS₂ Score',
    category: 'Cardiology',
    ward: 'internal_medicine',
    guideline: 'Historical AFib (Superseded by CHA₂DS₂-VASc)',
    description: 'Original stroke risk score in AFib. Note: Current clinical guidelines mandate CHA₂DS₂-VASc for superior stroke discrimination.',
    keywords: ['chads2', 'afib', 'stroke', 'historical', 'anticoagulation'],
    inputs: [
      { id: 'c', label: 'Congestive Heart Failure', type: 'boolean', defaultValue: false },
      { id: 'h', label: 'Hypertension', type: 'boolean', defaultValue: true },
      { id: 'a', label: 'Age ≥ 75 years', type: 'boolean', defaultValue: false },
      { id: 'd', label: 'Diabetes Mellitus', type: 'boolean', defaultValue: false },
      { id: 's2', label: 'Prior Stroke or TIA (2 points)', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '0 pts', meaning: 'Low Risk (~1.9%/yr)', action: 'Historical aspirin; guidelines now recommend evaluating CHA₂DS₂-VASc.' },
      { range: '1 pt', meaning: 'Intermediate Risk (~2.8%/yr)', action: 'Consider oral anticoagulation.' },
      { range: '≥ 2 pts', meaning: 'High Risk (4.0 - 18.2%/yr)', action: 'Oral anticoagulation strongly indicated.' },
    ],
    calculate: (vals, patientTag) => {
      let score = 0;
      if (vals.c) score += 1;
      if (vals.h) score += 1;
      if (vals.a) score += 1;
      if (vals.d) score += 1;
      if (vals.s2) score += 2;

      const rates: Record<number, string> = { 0: '1.9%', 1: '2.8%', 2: '4.0%', 3: '5.9%', 4: '8.5%', 5: '12.5%', 6: '18.2%' };
      const rate = rates[score] || '>18%';
      const severity = score >= 2 ? 'high' : score === 1 ? 'moderate' : 'low';

      return {
        score,
        scoreLabel: `${score}/6 pts`,
        interpretation: `CHADS₂ Score ${score} (Annual stroke rate ~${rate}). Note: Current ESC/AHA guidelines supersede this tool with CHA₂DS₂-VASc.`,
        severity,
        formula: 'C (1) + H (1) + A (1) + D (1) + S₂ (2)',
        details: [`Annual Stroke Rate: ${rate}`],
        ehrNote: `[CHADS2 Score${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Score: ${score}/6\n- Historical Stroke Rate: ${rate}/yr\n- Note: Guideline standard is CHA2DS2-VASc.`,
      };
    },
  },
  {
    id: 'san_francisco_syncope',
    title: 'San Francisco Syncope Rule (SFSR)',
    shortTitle: 'SF Syncope Rule',
    category: 'Cardiology',
    ward: 'internal_medicine',
    guideline: 'Annals of Emergency Medicine / ACEP',
    description: 'Identifies adult patients with syncope at high risk for serious clinical outcomes within 30 days (death, MI, arrhythmia, PE, stroke, hemorrhage).',
    keywords: ['syncope', 'sfsr', 'fainting', 'arrhythmia', 'ed', 'emergency'],
    inputs: [
      { id: 'chf', label: 'C - History of Congestive Heart Failure', type: 'boolean', defaultValue: false },
      { id: 'hct', label: 'H - Hematocrit < 30%', type: 'boolean', defaultValue: false },
      { id: 'ecg', label: 'E - Abnormal ECG (non-sinus rhythm or new change)', type: 'boolean', defaultValue: false },
      { id: 'sob', label: 'S - Shortness of breath reported with syncope', type: 'boolean', defaultValue: false },
      { id: 'sbp', label: 'S - Systolic BP < 90 mmHg in triage', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '0 criteria positive', meaning: 'Low Risk (~1.4% serious outcome rate)', action: 'Safe for outpatient workup in the absence of other red flags.' },
      { range: '≥ 1 criteria positive', meaning: 'High Risk (~25% serious outcome rate)', action: 'Admit for cardiac telemetry, serial cardiac enzymes, and echo.' },
    ],
    calculate: (vals, patientTag) => {
      const positiveItems: string[] = [];
      if (vals.chf) positiveItems.push('History of CHF');
      if (vals.hct) positiveItems.push('Hematocrit < 30%');
      if (vals.ecg) positiveItems.push('Abnormal ECG');
      if (vals.sob) positiveItems.push('Shortness of Breath');
      if (vals.sbp) positiveItems.push('Triage SBP < 90 mmHg');

      const isHighRisk = positiveItems.length > 0;
      const severity = isHighRisk ? 'high' : 'low';

      return {
        score: isHighRisk ? 'Positive' : 'Negative',
        scoreLabel: `${positiveItems.length}/5 Positive`,
        interpretation: isHighRisk
          ? `High Risk for Serious Outcome (30-day risk ~25%). Inpatient telemetry / admission recommended. Triggers: ${positiveItems.join(', ')}.`
          : 'Low Risk (Serious outcome rate ~1.4%). Outpatient workup acceptable if no other clinical red flags.',
        severity,
        formula: 'Mnemonic CHESS: CHF, Hct <30%, ECG abnormal, SOB, SBP <90',
        details: positiveItems.length > 0 ? positiveItems : ['All 5 CHESS criteria negative'],
        ehrNote: `[San Francisco Syncope Rule${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Rule Status: ${isHighRisk ? 'HIGH RISK' : 'LOW RISK'}\n- Positive Criteria: ${positiveItems.length > 0 ? positiveItems.join(', ') : 'None'}\n- Recommendation: ${isHighRisk ? 'Inpatient admission for telemetry' : 'Outpatient management'}`,
      };
    },
  },
  {
    id: 'orbit_bleeding',
    title: 'ORBIT Bleeding Score for Atrial Fibrillation',
    shortTitle: 'ORBIT Bleeding',
    category: 'Cardiology',
    ward: 'internal_medicine',
    guideline: 'Circulation / AHA / ACC',
    description: 'Modern 5-variable score predicting major bleeding in AFib patients on anticoagulation, demonstrating higher discrimination than HAS-BLED in DOAC trials.',
    keywords: ['orbit', 'bleeding', 'anticoagulation', 'doac', 'afib', 'hemorrhage'],
    inputs: [
      { id: 'older', label: 'Older Age (≥ 74 years)', type: 'boolean', defaultValue: true },
      { id: 'reduced_hb', label: 'Reduced Hb / Hct (<13 g/dL for men, <12 for women) or prior bleed (2 pts)', type: 'boolean', defaultValue: false },
      { id: 'bleeding_hx', label: 'Bleeding History (prior GI, intracranial, or other major bleed) (2 pts)', type: 'boolean', defaultValue: false },
      { id: 'insufficient_kidney', label: 'Insufficient Kidney Function (eGFR < 60 mL/min/1.73m²)', type: 'boolean', defaultValue: false },
      { id: 'antiplatelet', label: 'Treatment with Antiplatelet agents (Aspirin, Clopidogrel)', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '0 - 1 pts', meaning: 'Low Risk (2.4 bleeds / 100 pt-yrs)', action: 'Proceed with anticoagulation; standard monitoring.' },
      { range: '2 - 3 pts', meaning: 'Medium Risk (4.7 bleeds / 100 pt-yrs)', action: 'Address modifiable risks; follow up periodically.' },
      { range: '4 - 7 pts', meaning: 'High Risk (8.1 bleeds / 100 pt-yrs)', action: 'Close surveillance, review antiplatelet necessity, correct anemia/renal disease.' },
    ],
    calculate: (vals, patientTag) => {
      let score = 0;
      if (vals.older) score += 1;
      if (vals.reduced_hb) score += 2;
      if (vals.bleeding_hx) score += 2;
      if (vals.insufficient_kidney) score += 1;
      if (vals.antiplatelet) score += 1;

      const severity = score >= 4 ? 'high' : score >= 2 ? 'moderate' : 'low';
      const bleedRate = score <= 1 ? '2.4%' : score <= 3 ? '4.7%' : '8.1%';

      return {
        score,
        scoreLabel: `${score}/7 pts`,
        interpretation: score >= 4
          ? `High Bleeding Risk (Est. major bleed rate ${bleedRate}/yr). Optimize renal protection and review concurrent antiplatelets.`
          : score >= 2
          ? `Medium Bleeding Risk (Est. major bleed rate ${bleedRate}/yr). Routine monitoring on DOAC.`
          : `Low Bleeding Risk (Est. major bleed rate ${bleedRate}/yr). Favorable safety profile for anticoagulation.`,
        severity,
        formula: 'Sum of O (1), R (2), B (2), I (1), T (1)',
        details: [`Major Bleed Rate: ${bleedRate} / 100 patient-years`],
        ehrNote: `[ORBIT Bleeding Score${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Score: ${score}/7\n- Bleeding Risk Tier: ${severity.toUpperCase()}\n- Major Bleed Rate: ${bleedRate}/100 pt-yrs\n- Guideline: Circulation 2015 / AHA/ACC.`,
      };
    },
  },

  // =========================================================================
  // PULMONOLOGY / CRITICAL CARE
  // =========================================================================
  {
    id: 'bode_index',
    title: 'BODE Index for COPD Mortality Prediction',
    shortTitle: 'BODE Index',
    category: 'Pulmonology',
    ward: 'internal_medicine',
    guideline: 'NEJM / GOLD COPD Guidelines',
    description: 'Multidimensional 10-point staging system predicting 1- to 4-year survival in patients with Chronic Obstructive Pulmonary Disease.',
    keywords: ['bode', 'copd', 'fev1', 'dyspnea', 'mortality', '6mwt', 'pulmonology'],
    inputs: [
      { id: 'fev1', label: 'FEV1 % of Predicted', type: 'select', defaultValue: '50-64', options: [
        { label: '≥ 65% (0 pts)', value: '>=65' },
        { label: '50% - 64% (1 pt)', value: '50-64' },
        { label: '36% - 49% (2 pts)', value: '36-49' },
        { label: '≤ 35% (3 pts)', value: '<=35' },
      ]},
      { id: 'distance', label: '6-Minute Walk Distance (6MWD)', type: 'select', defaultValue: '250-349', options: [
        { label: '≥ 350 meters (0 pts)', value: '>=350' },
        { label: '250 - 349 meters (1 pt)', value: '250-349' },
        { label: '150 - 249 meters (2 pts)', value: '150-249' },
        { label: '≤ 149 meters (3 pts)', value: '<=149' },
      ]},
      { id: 'mmrc', label: 'mMRC Dyspnea Scale', type: 'select', defaultValue: '1', options: [
        { label: 'Grade 0 - 1: Breathless only on strenuous exercise / hurried walk (0 pts)', value: '0-1' },
        { label: 'Grade 2: Walks slower than peers or stops for breath at own pace (1 pt)', value: '2' },
        { label: 'Grade 3: Stops for breath after walking ~100 meters (2 pts)', value: '3' },
        { label: 'Grade 4: Too breathless to leave house or when dressing (3 pts)', value: '4' },
      ]},
      { id: 'bmi', label: 'Body Mass Index (BMI)', type: 'select', defaultValue: '>21', options: [
        { label: '> 21 kg/m² (0 pts)', value: '>21' },
        { label: '≤ 21 kg/m² (1 pt - Cachexia)', value: '<=21' },
      ]},
    ],
    cutoffs: [
      { range: '0 - 2 pts (Quartile 1)', meaning: '4-Year Mortality ~19%', action: 'Maintenance bronchodilators, smoking cessation.' },
      { range: '3 - 4 pts (Quartile 2)', meaning: '4-Year Mortality ~32%', action: 'Dual bronchodilators (LABA+LAMA), pulmonary rehabilitation.' },
      { range: '5 - 6 pts (Quartile 3)', meaning: '4-Year Mortality ~40%', action: 'Triple therapy (LABA+LAMA+ICS) if eosinophils ≥100, evaluate for oxygen.' },
      { range: '7 - 10 pts (Quartile 4)', meaning: '4-Year Mortality ~80%', action: 'Advanced therapies: LVRS, bronchoscopic valves, lung transplant eval.' },
    ],
    calculate: (vals, patientTag) => {
      let score = 0;
      if (vals.fev1 === '50-64') score += 1;
      else if (vals.fev1 === '36-49') score += 2;
      else if (vals.fev1 === '<=35') score += 3;

      if (vals.distance === '250-349') score += 1;
      else if (vals.distance === '150-249') score += 2;
      else if (vals.distance === '<=149') score += 3;

      if (vals.mmrc === '2') score += 1;
      else if (vals.mmrc === '3') score += 2;
      else if (vals.mmrc === '4') score += 3;

      if (vals.bmi === '<=21') score += 1;

      const mortMap: Record<string, string> = {
        '0-2': '19%', '3-4': '32%', '5-6': '40%', '7-10': '80%'
      };
      const tier = score <= 2 ? '0-2' : score <= 4 ? '3-4' : score <= 6 ? '5-6' : '7-10';
      const mort = mortMap[tier];
      const severity = score >= 7 ? 'critical' : score >= 5 ? 'high' : score >= 3 ? 'moderate' : 'low';

      return {
        score,
        scoreLabel: `${score}/10 pts`,
        interpretation: `BODE Index: ${score}/10 (Est. 4-Year Mortality ~${mort}). ${score >= 7 ? 'Severe systemic impairment; refer for transplant / palliative assessment.' : 'Optimize pulmonary rehabilitation and inhaled therapy.'}`,
        severity,
        formula: 'B (BMI) + O (Obstruction FEV1) + D (Dyspnea mMRC) + E (Exercise 6MWD)',
        details: [`Estimated 4-Year Mortality: ${mort}`],
        ehrNote: `[BODE Index for COPD${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total Score: ${score}/10\n- Stratification: Quartile ${tier} (4-Year Mortality ~${mort})\n- Recommendation: Pulmonary rehabilitation, pharmacotherapy optimization.`,
      };
    },
  },
  {
    id: 'decaf_score',
    title: 'DECAF Score for Acute COPD Exacerbation In-Hospital Mortality',
    shortTitle: 'DECAF Score',
    category: 'Pulmonology',
    ward: 'internal_medicine',
    guideline: 'Thorax / British Thoracic Society',
    description: 'Validated clinical prediction tool stratifying in-hospital mortality in patients hospitalized with acute exacerbation of COPD (AECOPD).',
    keywords: ['decaf', 'copd', 'exacerbation', 'mortality', 'eosinopenia', 'acidemia'],
    inputs: [
      { id: 'dyspnea', label: 'Dyspnea (eMRCD Score)', type: 'select', defaultValue: '5a', options: [
        { label: 'Grade 0-4 / 5a: Able to wash/dress independently without assistance (0 pts)', value: '5a' },
        { label: 'Grade 5b: Too breathless to leave house AND requires assistance dressing/washing (1 pt)', value: '5b' },
      ]},
      { id: 'eosinopenia', label: 'Eosinopenia (blood eosinophils < 0.05 × 10⁹/L)', type: 'boolean', defaultValue: true },
      { id: 'consolidation', label: 'Consolidation on Chest Radiograph', type: 'boolean', defaultValue: false },
      { id: 'acidemia', label: 'Acidemia (pH < 7.30 on arterial/venous blood gas)', type: 'boolean', defaultValue: false },
      { id: 'afib', label: 'Atrial Fibrillation (history or on presentation)', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '0 - 1 pt', meaning: 'Low Risk: 1.0% - 1.5% in-hospital mortality', action: 'Consider early supported discharge / outpatient hospital-at-home.' },
      { range: '2 pts', meaning: 'Intermediate Risk: 5.4% in-hospital mortality', action: 'Standard inpatient care; monitor for non-invasive ventilation (NIV).' },
      { range: '3 - 5 pts', meaning: 'High Risk: 21% - 50% in-hospital mortality', action: 'High-dependency / ICU level care, early NIV / invasive ventilation review.' },
    ],
    calculate: (vals, patientTag) => {
      let score = 0;
      if (vals.dyspnea === '5b') score += 1;
      if (vals.eosinopenia) score += 1;
      if (vals.consolidation) score += 1;
      if (vals.acidemia) score += 1;
      if (vals.afib) score += 1;

      const mortMap: Record<number, string> = {
        0: '1.0%', 1: '1.5%', 2: '5.4%', 3: '21.0%', 4: '40.0%', 5: '50.0%'
      };
      const mort = mortMap[score] || '50%';
      const severity = score >= 3 ? 'critical' : score === 2 ? 'moderate' : 'low';

      return {
        score,
        scoreLabel: `${score}/5 pts`,
        interpretation: score >= 3
          ? `High Risk of In-Hospital Mortality (~${mort}). Requires close monitoring in HDU/ICU; evaluate need for immediate NIV.`
          : score === 2
          ? `Intermediate Risk (~${mort} mortality). Inpatient admission on respiratory ward.`
          : `Low Risk (~${mort} mortality). Potential candidate for early supported discharge.`,
        severity,
        formula: 'Dyspnea (5b=1) + Eosinopenia (1) + Consolidation (1) + Acidemia (1) + AFib (1)',
        details: [`In-Hospital Mortality: ${mort}`],
        ehrNote: `[DECAF Score in AECOPD${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total Score: ${score}/5\n- In-Hospital Mortality Risk: ${mort}\n- Risk Classification: ${severity.toUpperCase()}\n- Plan: ${score >= 3 ? 'High-dependency / ICU level monitoring' : 'Standard inpatient management'}`,
      };
    },
  },
  {
    id: 'smart_cop',
    title: 'SMART-COP Score for Severe Pneumonia (ICU / Inotropes)',
    shortTitle: 'SMART-COP',
    category: 'Pulmonology',
    ward: 'internal_medicine',
    guideline: 'Clinical Infectious Diseases / IDSA',
    description: 'Predicts which patients with community-acquired pneumonia will require intensive respiratory or vasopressor support (IRVS).',
    keywords: ['smart-cop', 'pneumonia', 'icu', 'inotropes', 'mechanical ventilation', 'cap'],
    inputs: [
      { id: 'sbp_low', label: 'Systolic BP < 90 mmHg (2 pts)', type: 'boolean', defaultValue: false },
      { id: 'multilobar', label: 'Multilobar chest infiltrates on CXR (1 pt)', type: 'boolean', defaultValue: true },
      { id: 'albumin', label: 'Albumin < 3.5 g/dL (1 pt)', type: 'boolean', defaultValue: false },
      { id: 'rr_high', label: 'Respiratory Rate ≥ 25 (if age ≤50) or ≥ 30 (if age >50) (1 pt)', type: 'boolean', defaultValue: true },
      { id: 'hr_high', label: 'Heart Rate ≥ 125 bpm (1 pt)', type: 'boolean', defaultValue: false },
      { id: 'confusion', label: 'Confusion of new onset (1 pt)', type: 'boolean', defaultValue: false },
      { id: 'o2_low', label: 'Oxygen low: PaO2 < 60 mmHg or SpO2 ≤ 90% (2 pts)', type: 'boolean', defaultValue: true },
      { id: 'ph_low', label: 'pH < 7.35 on arterial blood gas (2 pts)', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '0 - 2 pts', meaning: 'Low Risk: ~3% need for ICU / mechanical support', action: 'General medical ward care.' },
      { range: '3 - 4 pts', meaning: 'Moderate Risk: ~12% need for ICU support', action: 'Consider step-down or intermediate monitoring.' },
      { range: '5 - 6 pts', meaning: 'High Risk: ~33% need for ICU support', action: 'Direct admission to ICU / intensive respiratory monitoring.' },
      { range: '7 - 8 pts', meaning: 'Very High Risk: ~67% need for ICU support', action: 'Immediate ICU admission, early intubation and inotrope readiness.' },
    ],
    calculate: (vals, patientTag) => {
      let score = 0;
      if (vals.sbp_low) score += 2;
      if (vals.multilobar) score += 1;
      if (vals.albumin) score += 1;
      if (vals.rr_high) score += 1;
      if (vals.hr_high) score += 1;
      if (vals.confusion) score += 1;
      if (vals.o2_low) score += 2;
      if (vals.ph_low) score += 2;

      const riskMap: Record<string, string> = {
        low: '3%', moderate: '12%', high: '33%', very_high: '67%'
      };
      const tier = score <= 2 ? 'low' : score <= 4 ? 'moderate' : score <= 6 ? 'high' : 'very_high';
      const prob = riskMap[tier];
      const severity = score >= 5 ? 'critical' : score >= 3 ? 'moderate' : 'low';

      return {
        score,
        scoreLabel: `${score}/8 pts`,
        interpretation: score >= 5
          ? `High Risk (${prob} probability of requiring mechanical ventilation or vasopressor support). Recommend direct ICU admission.`
          : score >= 3
          ? `Moderate Risk (${prob} requirement). Close observation on intermediate respiratory bed.`
          : `Low Risk (${prob} requirement). Suitable for general ward care.`,
        severity,
        formula: 'Sum of weighted clinical variables (SBP=2, O2=2, pH=2, others=1)',
        details: [`ICU / Inotrope Probability: ${prob}`],
        ehrNote: `[SMART-COP Severe Pneumonia Score${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total Score: ${score}/8\n- Risk Tier: ${tier.replace('_', ' ').toUpperCase()} (~${prob} require ICU/IRVS)\n- Clinical Recommendation: ${score >= 5 ? 'Direct ICU admission' : 'Ward admission with pulse oximetry'}`,
      };
    },
  },
  {
    id: 'ardsnet_ibw',
    title: 'ARDSnet Ideal Body Weight & Lung-Protective Tidal Volume',
    shortTitle: 'ARDSnet Tidal Vol',
    category: 'Critical Care',
    ward: 'internal_medicine',
    guideline: 'ARDSNet / ATS / ESICM',
    description: 'Calculates Ideal Body Weight (IBW) and target lung-protective mechanical ventilation tidal volumes (4 - 8 mL/kg IBW) to prevent ventilator-induced lung injury (VILI).',
    keywords: ['ards', 'ibw', 'tidal volume', 'ardsnet', 'ventilator', 'mechanical ventilation'],
    inputs: [
      { id: 'sex', label: 'Biological Sex', type: 'select', defaultValue: 'male', options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
      ]},
      { id: 'height_cm', label: 'Height (cm)', type: 'number', min: 120, max: 220, defaultValue: 172, unit: 'cm' },
    ],
    cutoffs: [
      { range: '6 mL/kg IBW', meaning: 'Standard ARDSnet Target (Lung-Protective)', action: 'Initial ventilation setting for ARDS; target Pplat ≤ 30 cmH2O.' },
      { range: '4 mL/kg IBW', meaning: 'Minimum permissible volume', action: 'Use if plateau pressure exceeds 30 cmH2O despite 6 mL/kg.' },
      { range: '8 mL/kg IBW', meaning: 'Upper limit for normal non-ARDS lungs', action: 'Permissible in healthy lungs without ARDS.' },
    ],
    calculate: (vals, patientTag) => {
      const isFemale = vals.sex === 'female';
      const heightInches = Number(vals.height_cm) / 2.54;
      const inchesOver60 = Math.max(0, heightInches - 60);

      const ibwKg = isFemale
        ? 45.5 + 2.3 * inchesOver60
        : 50.0 + 2.3 * inchesOver60;

      const tv4 = Math.round(ibwKg * 4);
      const tv6 = Math.round(ibwKg * 6);
      const tv8 = Math.round(ibwKg * 8);

      return {
        score: `${tv6} mL`,
        scoreLabel: `6 mL/kg = ${tv6} mL`,
        interpretation: `Ideal Body Weight (IBW): ${ibwKg.toFixed(1)} kg. Target initial lung-protective tidal volume: ${tv6} mL (6 mL/kg IBW). Permissible range: ${tv4} - ${tv8} mL.`,
        severity: 'neutral',
        formula: 'Male IBW = 50 + 2.3 × (Ht in - 60); Female IBW = 45.5 + 2.3 × (Ht in - 60)',
        details: [
          `4 mL/kg IBW: ${tv4} mL`,
          `6 mL/kg IBW: ${tv6} mL (Standard Target)`,
          `8 mL/kg IBW: ${tv8} mL`,
          `IBW: ${ibwKg.toFixed(1)} kg`,
        ],
        ehrNote: `[ARDSnet Ventilator Settings${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Height: ${vals.height_cm} cm | Sex: ${isFemale ? 'Female' : 'Male'}\n- Calculated IBW: ${ibwKg.toFixed(1)} kg\n- Initial Tidal Volume (6 mL/kg IBW): ${tv6} mL\n- Target Range: ${tv4} - ${tv8} mL (maintain Plateau Pressure ≤ 30 cmH2O)`,
      };
    },
  },
  {
    id: 'pesi_spesi',
    title: 'PESI & Simplified PESI for Pulmonary Embolism Mortality',
    shortTitle: 'PESI / sPESI',
    category: 'Pulmonology',
    ward: 'internal_medicine',
    guideline: 'ESC 2024 / CHEST Guidelines',
    description: 'Assesses 30-day mortality risk in patients with acute pulmonary embolism to identify candidates suitable for outpatient management or general ward care.',
    keywords: ['pesi', 'spesi', 'pulmonary embolism', 'pe', 'mortality', 'outpatient'],
    inputs: [
      { id: 'age', label: 'Patient Age', type: 'number', min: 18, max: 105, defaultValue: 62, unit: 'yrs' },
      { id: 'cancer', label: 'History of Cancer (active)', type: 'boolean', defaultValue: false },
      { id: 'cardiopulmonary', label: 'Chronic Cardiopulmonary Disease (HF or chronic lung disease)', type: 'boolean', defaultValue: false },
      { id: 'hr_high', label: 'Heart Rate ≥ 110 bpm', type: 'boolean', defaultValue: false },
      { id: 'sbp_low', label: 'Systolic BP < 100 mmHg', type: 'boolean', defaultValue: false },
      { id: 'o2_low', label: 'Arterial Oxygen Saturation < 90%', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: 'sPESI = 0', meaning: 'Low 30-Day Mortality (~1.0%)', action: 'Candidate for early discharge or outpatient anticoagulant management if social support adequate.' },
      { range: 'sPESI ≥ 1', meaning: 'High 30-Day Mortality (~10.9%)', action: 'Inpatient hospital admission, evaluate for RV dysfunction and elevated troponin.' },
    ],
    calculate: (vals, patientTag) => {
      let spesi = 0;
      if (Number(vals.age) > 80) spesi += 1;
      if (vals.cancer) spesi += 1;
      if (vals.cardiopulmonary) spesi += 1;
      if (vals.hr_high) spesi += 1;
      if (vals.sbp_low) spesi += 1;
      if (vals.o2_low) spesi += 1;

      const isLowRisk = spesi === 0;
      const mort = isLowRisk ? '1.0%' : '10.9%';
      const severity = isLowRisk ? 'low' : 'high';

      return {
        score: spesi,
        scoreLabel: `sPESI: ${spesi} pt${spesi === 1 ? '' : 's'}`,
        interpretation: isLowRisk
          ? `Low Risk (30-day mortality ~1.0%). Patient is potentially eligible for home treatment or early hospital discharge if RV function and hemodynamics are normal.`
          : `High Risk (30-day mortality ~10.9%). Inpatient hospital admission required; assess echocardiogram for right ventricular strain.`,
        severity,
        formula: '1 pt each: Age > 80, Cancer, Chronic cardiopulmonary dz, HR ≥110, SBP <100, SpO2 <90%',
        details: [`30-Day PE Mortality Estimate: ${mort}`],
        ehrNote: `[Simplified PESI (sPESI) Score${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total sPESI Score: ${spesi}\n- 30-Day Mortality Risk: ${mort}\n- Risk Classification: ${isLowRisk ? 'LOW RISK (Score 0)' : 'HIGH RISK (Score ≥ 1)'}\n- Clinical Strategy: ${isLowRisk ? 'Candidate for outpatient/early discharge pathway' : 'Inpatient telemetry monitoring and echo'}`,
      };
    },
  },

  // =========================================================================
  // NEPHROLOGY
  // =========================================================================
  {
    id: 'fe_uric_acid',
    title: 'Fractional Excretion of Uric Acid (FEUricAcid)',
    shortTitle: 'FE Uric Acid',
    category: 'Nephrology',
    ward: 'internal_medicine',
    guideline: 'American Journal of Medicine / Endocrine Societies',
    description: 'Differentiates SIADH from cerebral salt wasting (CSW) and hypovolemic hyponatremia. In SIADH, FEUricAcid is characteristically elevated (> 10-12%).',
    keywords: ['uric acid', 'siadh', 'hyponatremia', 'csw', 'fractional excretion'],
    inputs: [
      { id: 'u_uric', label: 'Urine Uric Acid', type: 'number', min: 1, max: 200, defaultValue: 45, unit: 'mg/dL' },
      { id: 's_cr', label: 'Serum Creatinine', type: 'number', min: 0.1, max: 20, defaultValue: 0.8, unit: 'mg/dL' },
      { id: 's_uric', label: 'Serum Uric Acid', type: 'number', min: 0.5, max: 25, defaultValue: 3.2, unit: 'mg/dL' },
      { id: 'u_cr', label: 'Urine Creatinine', type: 'number', min: 1, max: 500, defaultValue: 75, unit: 'mg/dL' },
    ],
    cutoffs: [
      { range: '< 4%', meaning: 'Prerenal Azotemia / Volume Depletion', action: 'Resuscitate with isotonic saline.' },
      { range: '4% - 10%', meaning: 'Normal Baseline Excretion', action: 'Correlate with urine osmolality and volume status.' },
      { range: '> 10% - 12%', meaning: 'Elevated (Classic for SIADH in hyponatremia)', action: 'Fluid restriction; search for SIADH etiology (drugs, malignancy, CNS/pulm).' },
    ],
    calculate: (vals, patientTag) => {
      const uUric = Number(vals.u_uric);
      const sCr = Number(vals.s_cr);
      const sUric = Number(vals.s_uric);
      const uCr = Number(vals.u_cr);

      const feUric = ((uUric * sCr) / (sUric * uCr)) * 100;
      const isSiadh = feUric > 10;
      const severity = isSiadh ? 'high' : feUric < 4 ? 'moderate' : 'low';

      return {
        score: `${feUric.toFixed(1)}%`,
        scoreLabel: `${feUric.toFixed(1)}%`,
        interpretation: isSiadh
          ? `FE Uric Acid > 10% (${feUric.toFixed(1)}%). Strongly supports SIADH in the setting of hyponatremia and hypouricemia.`
          : feUric < 4
          ? `FE Uric Acid < 4% (${feUric.toFixed(1)}%). Suggests volume depletion / prerenal state.`
          : `FE Uric Acid intermediate (${feUric.toFixed(1)}%). Correlate with clinical volume assessment.`,
        severity,
        formula: 'FEUricAcid = [(Urine Uric × Serum Cr) / (Serum Uric × Urine Cr)] × 100',
        details: [`Calculated FE Uric Acid: ${feUric.toFixed(1)}%`],
        ehrNote: `[Fractional Excretion of Uric Acid${patientTag ? ` - Bed ${patientTag}` : ''}]\n- FE Uric Acid: ${feUric.toFixed(1)}%\n- Diagnostic Impression: ${isSiadh ? 'Supports SIADH (>10%)' : 'Normal or Prerenal (<10%)'}\n- Plan: ${isSiadh ? 'Fluid restriction and investigate SIADH causes' : 'Assess volume status'}`,
      };
    },
  },
  {
    id: 'sodium_correction_rate',
    title: 'Sodium Correction Rate & ODS Safety Limits',
    shortTitle: 'Na Correction Rate',
    category: 'Nephrology',
    ward: 'internal_medicine',
    guideline: 'European Clinical Practice Guidelines / NEJM',
    description: 'Guides safe correction velocity in severe hyponatremia to avoid Osmotic Demyelination Syndrome (ODS) and hypernatremia cerebral edema.',
    keywords: ['sodium', 'hyponatremia', 'ods', 'cpm', 'correction rate', 'saline'],
    inputs: [
      { id: 'start_na', label: 'Initial Serum Sodium', type: 'number', min: 95, max: 180, defaultValue: 116, unit: 'mEq/L' },
      { id: 'high_risk_ods', label: 'High Risk for ODS (Na ≤ 105, hypokalemia, malnutrition, alcoholism, cirrhosis)', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: 'Standard Risk', meaning: 'Maximum ΔNa ≤ 8 - 10 mEq/L in 24 hours', action: 'Target 4 - 8 mEq/L/day; avoid exceeding 10 mEq/L/day.' },
      { range: 'High ODS Risk', meaning: 'Maximum ΔNa ≤ 6 - 8 mEq/L in 24 hours', action: 'Target 4 - 6 mEq/L/day; consider DDAVP clamp if overcorrecting.' },
    ],
    calculate: (vals, patientTag) => {
      const isHighRisk = Boolean(vals.high_risk_ods);
      const max24 = isHighRisk ? 8 : 10;
      const target24 = isHighRisk ? '4 - 6' : '6 - 8';

      return {
        score: `≤ ${max24} mEq/L/24h`,
        scoreLabel: `Max ΔNa: ${max24} mEq/L`,
        interpretation: `Recommended 24-hour correction target: ${target24} mEq/L. Absolute maximum limit: ${max24} mEq/L in 24h. ${isHighRisk ? 'Caution: Patient has high risk features for Osmotic Demyelination Syndrome (ODS).' : ''}`,
        severity: isHighRisk ? 'high' : 'moderate',
        formula: 'Safety limit: ≤ 8-10 mEq/L/24h for normal risk, ≤ 6-8 mEq/L/24h for high ODS risk',
        details: [
          `Target ΔNa (24h): ${target24} mEq/L`,
          `Upper Safety Ceiling: ${max24} mEq/L / 24h`,
          `ODS Risk: ${isHighRisk ? 'HIGH' : 'STANDARD'}`,
        ],
        ehrNote: `[Sodium Correction Safety Protocol${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Baseline Sodium: ${vals.start_na} mEq/L\n- ODS Risk Tier: ${isHighRisk ? 'HIGH RISK' : 'STANDARD'}\n- 24-Hour Target: ${target24} mEq/L\n- Absolute 24-Hour Limit: ≤ ${max24} mEq/L/24h\n- Action on Overcorrection: Administer D5W IV ± Desmopressin (DDAVP) to halt rapid Na rise.`,
      };
    },
  },
  {
    id: 'kt_v_dialysis',
    title: 'Kt/V Dialysis Adequacy Calculator (Daugirdas Formula)',
    shortTitle: 'Kt/V Dialysis',
    category: 'Nephrology',
    ward: 'internal_medicine',
    guideline: 'KDOQI Hemodialysis Guidelines',
    description: 'Calculates single-pool Kt/V (spKt/V) to evaluate hemodialysis clearance adequacy using post/pre urea nitrogen and ultrafiltration.',
    keywords: ['kt/v', 'dialysis', 'hemodialysis', 'urea', 'kdoqi', 'clearance'],
    inputs: [
      { id: 'pre_bun', label: 'Pre-Dialysis BUN', type: 'number', min: 10, max: 200, defaultValue: 78, unit: 'mg/dL' },
      { id: 'post_bun', label: 'Post-Dialysis BUN', type: 'number', min: 2, max: 100, defaultValue: 24, unit: 'mg/dL' },
      { id: 'hours', label: 'Treatment Duration', type: 'number', min: 1, max: 8, step: 0.5, defaultValue: 4.0, unit: 'hours' },
      { id: 'uf_volume', label: 'Ultrafiltration Volume (UF)', type: 'number', min: 0, max: 8, step: 0.1, defaultValue: 2.4, unit: 'L' },
      { id: 'post_weight', label: 'Post-Dialysis Weight', type: 'number', min: 30, max: 200, defaultValue: 68, unit: 'kg' },
    ],
    cutoffs: [
      { range: 'spKt/V < 1.2', meaning: 'Inadequate Dialysis Clearance', action: 'Increase blood flow rate (Qb), dialyzer surface area, or treatment time.' },
      { range: 'spKt/V ≥ 1.2', meaning: 'Minimum Recommended Dose (KDOQI)', action: 'Meets minimum standard for thrice-weekly hemodialysis.' },
      { range: 'spKt/V ≥ 1.4', meaning: 'Target Adequate Dialysis Dose', action: 'Optimal target clearance for maintenance hemodialysis.' },
    ],
    calculate: (vals, patientTag) => {
      const pre = Number(vals.pre_bun);
      const post = Number(vals.post_bun);
      const t = Number(vals.hours);
      const uf = Number(vals.uf_volume);
      const w = Number(vals.post_weight);

      const r = post / pre;
      // Daugirdas second generation formula
      const spKtV = -Math.log(r - 0.008 * t) + (4 - 3.5 * r) * (uf / w);
      const isAdequate = spKtV >= 1.2;
      const isOptimal = spKtV >= 1.4;
      const severity = isOptimal ? 'low' : isAdequate ? 'moderate' : 'high';

      return {
        score: spKtV.toFixed(2),
        scoreLabel: `spKt/V: ${spKtV.toFixed(2)}`,
        interpretation: isOptimal
          ? `Optimal Dialysis Clearance (spKt/V = ${spKtV.toFixed(2)} ≥ 1.4). Exceeds KDOQI adequacy target.`
          : isAdequate
          ? `Acceptable Clearance (spKt/V = ${spKtV.toFixed(2)} ≥ 1.2). Meets minimum KDOQI dose.`
          : `Suboptimal Clearance (spKt/V = ${spKtV.toFixed(2)} < 1.2). Dialysis dose under target. Review vascular access and prescription.`,
        severity,
        formula: 'spKt/V = -ln(R - 0.008×t) + (4 - 3.5×R) × (UF / W)',
        details: [`Urea Reduction Ratio (URR): ${((1 - r) * 100).toFixed(1)}%`],
        ehrNote: `[Hemodialysis Adequacy (spKt/V)${patientTag ? ` - Bed ${patientTag}` : ''}]\n- spKt/V: ${spKtV.toFixed(2)}\n- URR: ${((1 - r) * 100).toFixed(1)}%\n- Adequacy Status: ${isOptimal ? 'OPTIMAL (≥1.4)' : isAdequate ? 'ACCEPTABLE (≥1.2)' : 'INADEQUATE (<1.2)'}`,
      };
    },
  },

  // =========================================================================
  // GI / HEPATOLOGY
  // =========================================================================
  {
    id: 'rockall_score',
    title: 'Rockall Score for Upper Gastrointestinal Bleeding',
    shortTitle: 'Rockall Score',
    category: 'GI / Hepatology',
    ward: 'internal_medicine',
    guideline: 'Gut / British Society of Gastroenterology (BSG)',
    description: 'Post-endoscopy risk assessment score predicting rebleeding and mortality in acute upper GI hemorrhage.',
    keywords: ['rockall', 'ugib', 'upper gi bleed', 'rebleed', 'endoscopy', 'mortality'],
    inputs: [
      { id: 'age', label: 'Age', type: 'select', defaultValue: 1, options: [
        { label: '< 60 years (0 pts)', value: 0 },
        { label: '60 - 79 years (1 pt)', value: 1 },
        { label: '≥ 80 years (2 pts)', value: 2 },
      ]},
      { id: 'shock', label: 'Hemodynamic Status / Shock', type: 'select', defaultValue: 0, options: [
        { label: 'No shock: SBP ≥ 100 and HR < 100 (0 pts)', value: 0 },
        { label: 'Tachycardia: SBP ≥ 100 and HR ≥ 100 (1 pt)', value: 1 },
        { label: 'Hypotension: SBP < 100 mmHg (2 pts)', value: 2 },
      ]},
      { id: 'comorbidity', label: 'Comorbidities', type: 'select', defaultValue: 0, options: [
        { label: 'No major comorbidity (0 pts)', value: 0 },
        { label: 'IHD, heart failure, or other major disease (2 pts)', value: 2 },
        { label: 'Renal failure, liver failure, or disseminated malignancy (3 pts)', value: 3 },
      ]},
      { id: 'diagnosis', label: 'Endoscopic Diagnosis', type: 'select', defaultValue: 1, options: [
        { label: 'Mallory-Weiss tear or no lesion found (0 pts)', value: 0 },
        { label: 'All other endoscopic diagnoses (1 pt)', value: 1 },
        { label: 'Malignancy of upper GI tract (2 pts)', value: 2 },
      ]},
      { id: 'stigmata', label: 'Stigmata of Recent Hemorrhage', type: 'select', defaultValue: 0, options: [
        { label: 'None or clean ulcer base (0 pts)', value: 0 },
        { label: 'Blood in upper GI tract, adherent clot, active spurting/oozing (2 pts)', value: 2 },
      ]},
    ],
    cutoffs: [
      { range: '0 - 2 pts', meaning: 'Low Risk: Rebleed ~4%, Mortality ~0.1%', action: 'Early hospital discharge feasible.' },
      { range: '3 - 5 pts', meaning: 'Moderate Risk: Rebleed ~15%, Mortality ~5%', action: 'Inpatient observation, continuous IV PPI.' },
      { range: '≥ 6 pts', meaning: 'High Risk: Rebleed ~39%, Mortality ~25%', action: 'HDU / ICU admission, intensive monitoring.' },
    ],
    calculate: (vals, patientTag) => {
      const score = Number(vals.age) + Number(vals.shock) + Number(vals.comorbidity) + Number(vals.diagnosis) + Number(vals.stigmata);
      const severity = score >= 6 ? 'critical' : score >= 3 ? 'moderate' : 'low';
      const mort = score <= 2 ? '0.1%' : score <= 5 ? '5.3%' : '25-40%';
      const rebleed = score <= 2 ? '4%' : score <= 5 ? '15%' : '39%';

      return {
        score,
        scoreLabel: `${score}/11 pts`,
        interpretation: score >= 6
          ? `High Risk (Rebleed rate ~${rebleed}, Mortality ~${mort}). Intensive monitoring in high-dependency unit.`
          : score >= 3
          ? `Moderate Risk (Rebleed rate ~${rebleed}, Mortality ~${mort}). Inpatient monitoring with IV PPI.`
          : `Low Risk (Rebleed ~${rebleed}, Mortality ~${mort}). Potential candidate for early discharge.`,
        severity,
        formula: 'Age (0-2) + Shock (0-2) + Comorbidity (0-3) + Diagnosis (0-2) + Stigmata (0-2)',
        details: [`Rebleed Probability: ${rebleed}`, `Estimated Mortality: ${mort}`],
        ehrNote: `[Complete Rockall Score for UGIB${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total Score: ${score}/11\n- Stratification: ${severity.toUpperCase()}\n- Rebleeding Risk: ${rebleed}\n- Mortality Estimate: ${mort}`,
      };
    },
  },
  {
    id: 'aims65',
    title: 'AIMS65 Score for Upper Gastrointestinal Bleeding Mortality',
    shortTitle: 'AIMS65 Score',
    category: 'GI / Hepatology',
    ward: 'internal_medicine',
    guideline: 'Gastrointestinal Endoscopy (GIE) / ACG',
    description: 'Simple bedside clinical risk score predicting in-hospital mortality, length of stay, and cost in acute upper gastrointestinal bleeding.',
    keywords: ['aims65', 'ugib', 'gi bleed', 'mortality', 'albumin', 'inr'],
    inputs: [
      { id: 'albumin', label: 'Albumin < 3.0 g/dL', type: 'boolean', defaultValue: false },
      { id: 'inr', label: 'INR > 1.5', type: 'boolean', defaultValue: false },
      { id: 'ams', label: 'Altered Mental Status (GCS < 15 or lethargy/disorientation)', type: 'boolean', defaultValue: false },
      { id: 'sbp', label: 'Systolic Blood Pressure ≤ 90 mmHg', type: 'boolean', defaultValue: false },
      { id: 'age65', label: 'Age ≥ 65 years', type: 'boolean', defaultValue: true },
    ],
    cutoffs: [
      { range: '0 pts', meaning: 'Low Mortality Risk (~0.3%)', action: 'Standard ward care or early discharge.' },
      { range: '1 pt', meaning: 'Low-Moderate Risk (~1.2%)', action: 'Inpatient medical bed.' },
      { range: '2 pts', meaning: 'Moderate Risk (~5.3%)', action: 'Inpatient bed with close hemodynamic monitoring.' },
      { range: '3 pts', meaning: 'High Risk (~10.3%)', action: 'Consider ICU / step-down admission.' },
      { range: '≥ 4 pts', meaning: 'Very High Risk (~24.5%)', action: 'Direct ICU admission and urgent endoscopic intervention.' },
    ],
    calculate: (vals, patientTag) => {
      let score = 0;
      if (vals.albumin) score += 1;
      if (vals.inr) score += 1;
      if (vals.ams) score += 1;
      if (vals.sbp) score += 1;
      if (vals.age65) score += 1;

      const mortMap: Record<number, string> = {
        0: '0.3%', 1: '1.2%', 2: '5.3%', 3: '10.3%', 4: '16.5%', 5: '24.5%'
      };
      const mort = mortMap[score] || '24.5%';
      const severity = score >= 3 ? 'critical' : score >= 2 ? 'moderate' : 'low';

      return {
        score,
        scoreLabel: `${score}/5 pts`,
        interpretation: `AIMS65 Score: ${score}/5 (In-hospital mortality ~${mort}). ${score >= 3 ? 'High risk: recommend ICU level care.' : 'Manage on standard inpatient ward.'}`,
        severity,
        formula: '1 pt each: Albumin <3.0, INR >1.5, Altered mental status, SBP ≤90, Age ≥65',
        details: [`In-Hospital Mortality: ${mort}`],
        ehrNote: `[AIMS65 Score for UGIB${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Score: ${score}/5\n- In-Hospital Mortality Risk: ${mort}\n- Disposition Plan: ${score >= 3 ? 'ICU admission' : 'Standard inpatient care'}`,
      };
    },
  },
  {
    id: 'lille_model',
    title: 'Lille Model for Severe Alcoholic Hepatitis',
    shortTitle: 'Lille Model',
    category: 'GI / Hepatology',
    ward: 'internal_medicine',
    guideline: 'AASLD / EASL Alcoholic Liver Disease',
    description: 'Calculates response to corticosteroid therapy in severe alcoholic hepatitis after 7 days of treatment to guide stopping vs continuing therapy.',
    keywords: ['lille', 'alcoholic hepatitis', 'steroids', 'prednisolone', 'bilirubin'],
    inputs: [
      { id: 'age', label: 'Age (years)', type: 'number', min: 18, max: 85, defaultValue: 48, unit: 'yrs' },
      { id: 'bili_day0', label: 'Total Bilirubin at Day 0 (pre-steroids)', type: 'number', min: 1, max: 60, defaultValue: 18.5, unit: 'mg/dL' },
      { id: 'bili_day7', label: 'Total Bilirubin at Day 7 (post-steroids)', type: 'number', min: 1, max: 60, defaultValue: 12.0, unit: 'mg/dL' },
      { id: 'cr', label: 'Serum Creatinine', type: 'number', min: 0.2, max: 15, defaultValue: 1.1, unit: 'mg/dL' },
      { id: 'albumin', label: 'Serum Albumin', type: 'number', min: 1.0, max: 5.5, defaultValue: 2.8, unit: 'g/dL' },
      { id: 'pt_diff', label: 'Prothrombin Time prolongation (Patient PT − Control PT)', type: 'number', min: 0, max: 50, defaultValue: 8.5, unit: 'sec' },
    ],
    cutoffs: [
      { range: 'Lille < 0.45', meaning: 'Responder to Corticosteroids (6-Month Survival ~85%)', action: 'Continue prednisolone 40 mg/day for a total 28-day course.' },
      { range: 'Lille ≥ 0.45', meaning: 'Non-Responder to Corticosteroids (6-Month Survival ~25%)', action: 'Discontinue steroids (no benefit, high infection risk); evaluate for early liver transplantation.' },
    ],
    calculate: (vals, patientTag) => {
      const age = Number(vals.age);
      const bili0 = Number(vals.bili_day0);
      const bili7 = Number(vals.bili_day7);
      const cr = Number(vals.cr);
      const alb = Number(vals.albumin);
      const pt = Number(vals.pt_diff);

      // Lille model log-odds
      const r = (age * 0.04) - (alb * 0.08) + (0.015 * bili0) - (0.011 * (bili0 - bili7)) + (0.206 * (cr > 1.3 ? 1 : 0)) + (0.015 * pt) - 3.19;
      const lille = Math.max(0.01, Math.min(0.99, Math.exp(r) / (1 + Math.exp(r))));
      const isResponder = lille < 0.45;
      const severity = isResponder ? 'low' : 'critical';

      return {
        score: lille.toFixed(2),
        scoreLabel: `Score: ${lille.toFixed(2)}`,
        interpretation: isResponder
          ? `Corticosteroid Responder (Lille = ${lille.toFixed(2)} < 0.45; 6-month survival ~85%). Continue full 28-day steroid regimen.`
          : `Corticosteroid Non-Responder (Lille = ${lille.toFixed(2)} ≥ 0.45; 6-month survival ~25%). Stop steroids to avoid lethal infection; discuss transplant / palliative care.`,
        severity,
        formula: 'Logistic model based on Day-0 to Day-7 bilirubin change, age, renal impairment, albumin, and PT',
        details: [`Lille Score: ${lille.toFixed(2)}`, `Steroid Response: ${isResponder ? 'RESPONDER' : 'NON-RESPONDER'}`],
        ehrNote: `[Lille Model for Alcoholic Hepatitis${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Lille Score: ${lille.toFixed(2)}\n- Classification: ${isResponder ? 'STERIOD RESPONDER (<0.45)' : 'NON-RESPONDER (≥0.45)'}\n- Recommendation: ${isResponder ? 'Complete 28-day prednisolone course' : 'Discontinue steroids immediately'}`,
      };
    },
  },
  {
    id: 'kings_college',
    title: "King's College Criteria for Acute Liver Failure",
    shortTitle: "King's College ALF",
    category: 'GI / Hepatology',
    ward: 'internal_medicine',
    guideline: 'AASLD / EASL Acute Liver Failure',
    description: 'Gold standard emergency triage tool identifying acute liver failure patients who have low survival without emergency liver transplantation.',
    keywords: ['kings college', 'acute liver failure', 'transplant', 'paracetamol', 'acetaminophen'],
    inputs: [
      { id: 'etiology', label: 'Etiology', type: 'select', defaultValue: 'non_apap', options: [
        { label: 'Non-Acetaminophen (Viral, Drug-Induced, Autoimmune, Indeterminate)', value: 'non_apap' },
        { label: 'Acetaminophen (Paracetamol) Toxicity', value: 'apap' },
      ]},
      { id: 'ph_low', label: 'Arterial pH < 7.30 after fluid resuscitation', type: 'boolean', defaultValue: false },
      { id: 'inr_high', label: 'INR > 6.5 (or PT > 100 sec)', type: 'boolean', defaultValue: false },
      { id: 'cr_high', label: 'Serum Creatinine > 3.4 mg/dL (300 µmol/L)', type: 'boolean', defaultValue: false },
      { id: 'enceph', label: 'Grade III or IV Encephalopathy', type: 'boolean', defaultValue: true },
      { id: 'age_unfavorable', label: 'Age < 10 or > 40 years (Non-APAP only)', type: 'boolean', defaultValue: false },
      { id: 'jaundice_delay', label: 'Jaundice-to-encephalopathy duration > 7 days (Non-APAP only)', type: 'boolean', defaultValue: false },
      { id: 'bili_high', label: 'Serum Bilirubin > 17.5 mg/dL (300 µmol/L) (Non-APAP only)', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: 'Criteria Met', meaning: 'Mortality > 80% without liver transplantation', action: 'Immediate listing for emergency super-urgent liver transplantation.' },
      { range: 'Criteria Not Met', meaning: 'Potential for native liver recovery', action: 'Intensive medical care in a liver transplant center; reassess frequently.' },
    ],
    calculate: (vals, patientTag) => {
      const isApap = vals.etiology === 'apap';
      let criteriaMet = false;
      let reason = '';

      if (isApap) {
        if (vals.ph_low) {
          criteriaMet = true;
          reason = 'Arterial pH < 7.30';
        } else if (vals.inr_high && vals.cr_high && vals.enceph) {
          criteriaMet = true;
          reason = 'Triad of INR > 6.5, Cr > 3.4 mg/dL, and Grade III/IV Encephalopathy';
        }
      } else {
        if (vals.inr_high) {
          criteriaMet = true;
          reason = 'INR > 6.5';
        } else {
          let nonApapCount = 0;
          if (vals.age_unfavorable) nonApapCount += 1;
          if (vals.jaundice_delay) nonApapCount += 1;
          if (vals.bili_high) nonApapCount += 1;
          if (vals.inr_high || Number(vals.inr) > 3.5) nonApapCount += 1;
          if (nonApapCount >= 3) {
            criteriaMet = true;
            reason = `≥ 3 unfavorable criteria met (${nonApapCount}/5)`;
          }
        }
      }

      const severity = criteriaMet ? 'critical' : 'moderate';

      return {
        score: criteriaMet ? 'CRITERIA MET' : 'NOT MET',
        scoreLabel: criteriaMet ? 'MET (Urgent Transplant)' : 'NOT MET',
        interpretation: criteriaMet
          ? `King's College Criteria MET (${reason}). Extremely poor survival without liver transplantation (>80% mortality). Urgent listing for emergency transplant indicated.`
          : 'King\'s College Criteria NOT met. Continue aggressive supportive ICU therapy in a liver transplant center; reassess serial labs.',
        severity,
        formula: 'Acetaminophen pathway (pH < 7.30 or INR+Cr+Enceph triad) vs Non-Acetaminophen pathway (INR >6.5 or 3 of 5 criteria)',
        details: [`Etiology: ${isApap ? 'Acetaminophen' : 'Non-Acetaminophen'}`, `Status: ${criteriaMet ? 'MEETS CRITERIA' : 'DOES NOT MEET CRITERIA'}`],
        ehrNote: `[King's College Criteria for ALF${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Etiology: ${isApap ? 'Acetaminophen' : 'Non-Acetaminophen'}\n- Transplant Criteria: ${criteriaMet ? 'MET' : 'NOT MET'}\n- Rationale: ${reason || 'Subthreshold criteria'}\n- Plan: ${criteriaMet ? 'Immediate contact with liver transplant center for emergency listing' : 'Close ICU observation'}`,
      };
    },
  },
  {
    id: 'meld_3',
    title: 'MELD 3.0 Score for End-Stage Liver Disease',
    shortTitle: 'MELD 3.0',
    category: 'GI / Hepatology',
    ward: 'internal_medicine',
    guideline: 'OPTN / UNOS 2021 Update',
    description: 'Updated 2021 UNOS liver transplant allocation model including serum albumin, female sex coefficient, and interaction terms to eliminate sex disparities.',
    keywords: ['meld 3', 'meld', 'liver transplant', 'cirrhosis', 'unos', 'optn'],
    inputs: [
      { id: 'bili', label: 'Total Bilirubin', type: 'number', min: 0.2, max: 60, defaultValue: 3.8, unit: 'mg/dL' },
      { id: 'inr', label: 'INR', type: 'number', min: 0.8, max: 15, defaultValue: 1.8 },
      { id: 'cr', label: 'Serum Creatinine', type: 'number', min: 0.4, max: 12, defaultValue: 1.4, unit: 'mg/dL' },
      { id: 'na', label: 'Serum Sodium', type: 'number', min: 110, max: 150, defaultValue: 132, unit: 'mEq/L' },
      { id: 'alb', label: 'Serum Albumin', type: 'number', min: 1.0, max: 5.5, defaultValue: 2.8, unit: 'g/dL' },
      { id: 'female', label: 'Biological Female', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '< 15 pts', meaning: 'Low 90-Day Mortality (~2%)', action: 'Routine hepatology management.' },
      { range: '15 - 24 pts', meaning: 'Intermediate Mortality (~10-20%)', action: 'Liver transplant evaluation.' },
      { range: '25 - 34 pts', meaning: 'High Mortality (~50%)', action: 'Active transplant waiting list priority.' },
      { range: '≥ 35 pts', meaning: 'Critical 90-Day Mortality (> 80%)', action: 'High priority urgent donor organ allocation.' },
    ],
    calculate: (vals, patientTag) => {
      const bili = Math.max(1, Number(vals.bili));
      const inr = Math.max(1, Number(vals.inr));
      const cr = Math.min(3.0, Math.max(1, Number(vals.cr)));
      const na = Math.min(137, Math.max(125, Number(vals.na)));
      const alb = Math.min(3.5, Math.max(1.5, Number(vals.alb)));
      const isF = Boolean(vals.female);

      // UNOS MELD 3.0 equation
      let m = 1.33 * (isF ? 1 : 0) + 4.56 * Math.log(bili) + 0.82 * (137 - na) - 0.24 * (137 - na) * Math.log(bili) + 9.09 * Math.log(inr) + 11.14 * Math.log(cr) + 1.85 * (3.5 - alb) - 1.83 * (3.5 - alb) * Math.log(cr) + 6.0;
      m = Math.round(Math.max(6, Math.min(40, m)));

      const severity = m >= 25 ? 'critical' : m >= 15 ? 'high' : 'low';
      const mort = m >= 35 ? '>80%' : m >= 25 ? '50%' : m >= 15 ? '15%' : '<3%';

      return {
        score: m,
        scoreLabel: `MELD 3.0: ${m}`,
        interpretation: `MELD 3.0 Score: ${m} (Estimated 90-day waitlist mortality ~${mort}). ${m >= 15 ? 'Meets threshold for liver transplant evaluation.' : 'Outpatient surveillance.'}`,
        severity,
        formula: 'UNOS 2021 MELD 3.0 formula with bilirubin, INR, Cr, Na, albumin, and female coefficient',
        details: [`90-Day Mortality Risk: ${mort}`, `Female adjustment included: ${isF ? 'Yes' : 'No'}`],
        ehrNote: `[MELD 3.0 Score${patientTag ? ` - Bed ${patientTag}` : ''}]\n- MELD 3.0: ${m}\n- 90-Day Waitlist Mortality: ${mort}\n- Transplant Evaluation: ${m >= 15 ? 'Indicated (Score ≥15)' : 'Not yet indicated'}`,
      };
    },
  },

  // =========================================================================
  // NEUROLOGY
  // =========================================================================
  {
    id: 'nihss',
    title: 'NIH Stroke Scale (NIHSS)',
    shortTitle: 'NIHSS',
    category: 'Neurology',
    ward: 'internal_medicine',
    guideline: 'AHA / ASA Acute Ischemic Stroke',
    description: 'Systematic 15-item neurological examination scoring stroke impairment to guide intravenous thrombolysis (tPA/TNK) and endovascular thrombectomy (EVT).',
    keywords: ['nihss', 'stroke', 'neurology', 'tpa', 'thrombectomy', 'infarct'],
    inputs: [
      { id: 'score_input', label: 'Total NIHSS Score (0 - 42)', type: 'number', min: 0, max: 42, defaultValue: 8 },
    ],
    cutoffs: [
      { range: '0 pts', meaning: 'No stroke symptoms', action: 'Re-evaluate if transient ischemic attack (TIA).' },
      { range: '1 - 4 pts', meaning: 'Minor Stroke', action: 'Evaluate for thrombolysis if disabling deficit.' },
      { range: '5 - 15 pts', meaning: 'Moderate Stroke', action: 'Standard candidate for IV thrombolysis and EVT workup.' },
      { range: '16 - 20 pts', meaning: 'Moderate to Severe Stroke', action: 'High probability of large vessel occlusion (LVO); emergent CTA/EVT.' },
      { range: '21 - 42 pts', meaning: 'Severe Stroke', action: 'Massive cerebral infarction; high risk of hemorrhagic transformation.' },
    ],
    calculate: (vals, patientTag) => {
      const score = Number(vals.score_input);
      const severity = score >= 21 ? 'critical' : score >= 16 ? 'high' : score >= 5 ? 'moderate' : 'low';
      const interp = score === 0
        ? 'No neurological deficit on NIHSS.'
        : score <= 4
        ? `Minor Stroke (NIHSS ${score}). Evaluate if deficits are disabling (e.g. isolated aphasia or hemianopia).`
        : score <= 15
        ? `Moderate Stroke (NIHSS ${score}). Eligible for acute reperfusion therapy if within time window.`
        : score <= 20
        ? `Moderate-to-Severe Stroke (NIHSS ${score}). High risk of Large Vessel Occlusion; activate emergency thrombectomy pathway.`
        : `Severe Stroke (NIHSS ${score}). Critical cerebral ischemia; high risk of edema and hemorrhagic conversion.`;

      return {
        score,
        scoreLabel: `${score}/42 pts`,
        interpretation: interp,
        severity,
        formula: 'Sum of 11 exam domains (LOC, gaze, visual fields, facial palsy, motor arm/leg, ataxia, sensory, language, dysarthria, neglect)',
        details: [`Deficit Category: ${severity.toUpperCase()}`],
        ehrNote: `[NIH Stroke Scale (NIHSS)${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total NIHSS: ${score}/42\n- Severity: ${severity.toUpperCase()}\n- Clinical Impression: ${interp}`,
      };
    },
  },
  {
    id: 'hunt_hess',
    title: 'Hunt & Hess Scale for Subarachnoid Hemorrhage',
    shortTitle: 'Hunt & Hess',
    category: 'Neurology',
    ward: 'internal_medicine',
    guideline: 'AHA / ASA Subarachnoid Hemorrhage',
    description: 'Clinical grading of non-traumatic subarachnoid hemorrhage (SAH) predicting operative mortality and overall prognosis.',
    keywords: ['hunt and hess', 'sah', 'aneurysm', 'subarachnoid', 'headache', 'coma'],
    inputs: [
      { id: 'grade', label: 'Clinical Grade', type: 'select', defaultValue: 'II', options: [
        { label: 'Grade 1: Asymptomatic or mild headache and slight nuchal rigidity', value: '1' },
        { label: 'Grade 2: Moderate-to-severe headache, nuchal rigidity, cranial nerve palsy (e.g. CN III/VI)', value: '2' },
        { label: 'Grade 3: Drowsiness, confusion, or mild focal deficit', value: '3' },
        { label: 'Grade 4: Stupor, moderate-to-severe hemiparesis, early decerebrate rigidity', value: '4' },
        { label: 'Grade 5: Deep coma, decerebrate posturing, moribund appearance', value: '5' },
      ]},
    ],
    cutoffs: [
      { range: 'Grade 1', meaning: 'Mortality ~30% (Surgical survival ~90%)', action: 'Urgent aneurysm securing (coiling/clipping), nimodipine, ICU.' },
      { range: 'Grade 2', meaning: 'Mortality ~40%', action: 'Early aneurysm repair, blood pressure control, euvolemia.' },
      { range: 'Grade 3', meaning: 'Mortality ~50%', action: 'Invasive neuro-monitoring, consider EVD if hydrocephalus.' },
      { range: 'Grade 4 - 5', meaning: 'Mortality 70% - 90%', action: 'Emergency EVD for hydrocephalus; poor prognosis.' },
    ],
    calculate: (vals, patientTag) => {
      const g = vals.grade as string;
      const mortMap: Record<string, string> = { '1': '30%', '2': '40%', '3': '50%', '4': '70%', '5': '90%' };
      const mort = mortMap[g] || '50%';
      const severity = Number(g) >= 4 ? 'critical' : Number(g) === 3 ? 'high' : 'moderate';

      return {
        score: `Grade ${g}`,
        scoreLabel: `Grade ${g}`,
        interpretation: `Hunt & Hess Grade ${g} (Overall mortality ~${mort}). ${Number(g) <= 2 ? 'Favorable surgical outcome expected.' : 'Guarded prognosis; high risk of vasospasm and secondary injury.'}`,
        severity,
        formula: 'Bedside neurological assessment: headache, meningismus, consciousness, and motor posturing',
        details: [`Estimated Mortality: ${mort}`],
        ehrNote: `[Hunt & Hess Classification for SAH${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Clinical Grade: Grade ${g}\n- Prognosis: Estimated Mortality ~${mort}\n- Strategy: Emergent neurosurgical/endovascular consult, nimodipine, BP control.`,
      };
    },
  },
  {
    id: 'modified_fisher',
    title: 'Modified Fisher Scale for Aneurysmal SAH Vasospasm',
    shortTitle: 'Modified Fisher',
    category: 'Neurology',
    ward: 'internal_medicine',
    guideline: 'Neurocritical Care Society / AHA SAH',
    description: 'CT-based grading of subarachnoid and intraventricular blood predicting the risk of symptomatic delayed cerebral ischemia (vasospasm).',
    keywords: ['modified fisher', 'vasospasm', 'sah', 'ct', 'dci', 'nimodipine'],
    inputs: [
      { id: 'grade', label: 'CT Hemorrhage Pattern', type: 'select', defaultValue: '3', options: [
        { label: 'Grade 0: No subarachnoid hemorrhage or IVH detected', value: '0' },
        { label: 'Grade 1: Focal or thin SAH (< 1 mm), NO intraventricular hemorrhage (IVH)', value: '1' },
        { label: 'Grade 2: Focal or thin SAH (< 1 mm), WITH intraventricular hemorrhage', value: '2' },
        { label: 'Grade 3: Thick SAH (≥ 1 mm completely filling ≥ 1 cistern), NO IVH', value: '3' },
        { label: 'Grade 4: Thick SAH (≥ 1 mm), WITH intraventricular hemorrhage (both ventricles)', value: '4' },
      ]},
    ],
    cutoffs: [
      { range: 'Grade 0 - 1', meaning: 'Low Vasospasm Risk (~12-24%)', action: 'Standard nimodipine prophylaxis.' },
      { range: 'Grade 2', meaning: 'Moderate Vasospasm Risk (~33%)', action: 'Transcranial Doppler (TCD) surveillance.' },
      { range: 'Grade 3', meaning: 'High Vasospasm Risk (~34-40%)', action: 'TCD daily, strict euvolemia, maintain MAP.' },
      { range: 'Grade 4', meaning: 'Highest Vasospasm Risk (~40-45%)', action: 'Intensive neuro-monitoring; prepare for endovascular intra-arterial spasmolysis.' },
    ],
    calculate: (vals, patientTag) => {
      const g = vals.grade as string;
      const riskMap: Record<string, string> = { '0': '0%', '1': '24%', '2': '33%', '3': '34%', '4': '45%' };
      const risk = riskMap[g] || '35%';
      const severity = Number(g) >= 3 ? 'high' : Number(g) === 2 ? 'moderate' : 'low';

      return {
        score: `Grade ${g}`,
        scoreLabel: `Grade ${g}`,
        interpretation: `Modified Fisher Grade ${g} (Symptomatic Vasospasm / DCI Risk ~${risk}). ${Number(g) >= 3 ? 'High vasospasm risk: initiate daily TCD monitoring and nimodipine 60 mg q4h.' : 'Standard neuro-ICU care.'}`,
        severity,
        formula: 'CT assessment combining cisternal clot thickness and presence of bilateral intraventricular blood',
        details: [`Delayed Cerebral Ischemia Risk: ${risk}`],
        ehrNote: `[Modified Fisher CT Score${patientTag ? ` - Bed ${patientTag}` : ''}]\n- CT Grade: Modified Fisher Grade ${g}\n- Symptomatic Vasospasm Risk: ${risk}\n- Plan: Enteral nimodipine 60 mg q4h for 21 days, TCD monitoring.`,
      };
    },
  },
  {
    id: 'modified_rankin',
    title: 'Modified Rankin Scale (mRS) for Neurological Disability',
    shortTitle: 'Modified Rankin',
    category: 'Neurology',
    ward: 'internal_medicine',
    guideline: 'AHA / ASA / Stroke Trials Standard',
    description: 'Universal 0 - 6 point functional outcome measure quantifying the degree of disability or dependence in daily activities following stroke.',
    keywords: ['mrs', 'rankin', 'stroke', 'disability', 'outcome', 'rehab'],
    inputs: [
      { id: 'mrs_select', label: 'Functional Disability Level', type: 'select', defaultValue: '2', options: [
        { label: '0: No symptoms at all', value: '0' },
        { label: '1: No significant disability; able to carry out all usual duties and activities despite some symptoms', value: '1' },
        { label: '2: Slight disability; unable to carry out all previous activities, but able to look after own affairs without assistance', value: '2' },
        { label: '3: Moderate disability; requiring some help, but able to walk without assistance', value: '3' },
        { label: '4: Moderately severe disability; unable to walk without assistance and unable to attend to own bodily needs without help', value: '4' },
        { label: '5: Severe disability; bedridden, incontinent, requiring constant nursing care and attention', value: '5' },
        { label: '6: Dead', value: '6' },
      ]},
    ],
    cutoffs: [
      { range: 'mRS 0 - 1', meaning: 'Excellent Functional Recovery', action: 'Independent living; outpatient rehab.' },
      { range: 'mRS 0 - 2', meaning: 'Favorable Functional Independence (Trial Endpoint)', action: 'Can live independently at home.' },
      { range: 'mRS 3 - 5', meaning: 'Dependent Functional Status', action: 'Inpatient rehabilitation / nursing support required.' },
      { range: 'mRS 6', meaning: 'Deceased', action: 'End-of-life documentation.' },
    ],
    calculate: (vals, patientTag) => {
      const score = vals.mrs_select as string;
      const isFavorable = Number(score) <= 2;
      const severity = Number(score) === 6 ? 'neutral' : Number(score) >= 4 ? 'critical' : Number(score) === 3 ? 'moderate' : 'low';

      return {
        score: `mRS ${score}`,
        scoreLabel: `Score: ${score}`,
        interpretation: `Modified Rankin Scale: ${score}. ${isFavorable ? 'Functional independence preserved (mRS 0-2).' : 'Dependent in activities of daily living (mRS ≥ 3).' }`,
        severity,
        formula: 'Physician-rated global functional assessment scale from 0 (normal) to 6 (death)',
        details: [`Status: ${isFavorable ? 'Functionally Independent' : 'Functionally Dependent'}`],
        ehrNote: `[Modified Rankin Scale (mRS)${patientTag ? ` - Bed ${patientTag}` : ''}]\n- mRS Score: ${score}\n- Functional Independence: ${isFavorable ? 'YES (mRS 0-2)' : 'NO (mRS ≥3)'}\n- Rehabilitation Goal: ${isFavorable ? 'Community reintegration' : 'Inpatient stroke rehabilitation'}`,
      };
    },
  },
  {
    id: 'aspects_score',
    title: 'ASPECTS Score (Alberta Stroke Program Early CT Score)',
    shortTitle: 'ASPECTS Score',
    category: 'Neurology',
    ward: 'internal_medicine',
    guideline: 'AHA / ASA / ESO Stroke Guidelines',
    description: '10-point topographic CT scan score assessing early ischemic changes in the MCA territory to select candidates for endovascular thrombectomy.',
    keywords: ['aspects', 'stroke', 'ct', 'thrombectomy', 'mca', 'ischemia'],
    inputs: [
      { id: 'c', label: 'Caudate Head hypoattenuation', type: 'boolean', defaultValue: false },
      { id: 'l', label: 'Lentiform Nucleus hypoattenuation', type: 'boolean', defaultValue: false },
      { id: 'ic', label: 'Internal Capsule hypoattenuation', type: 'boolean', defaultValue: false },
      { id: 'i', label: 'Insular Ribbon loss', type: 'boolean', defaultValue: true },
      { id: 'm1', label: 'M1: Anterior MCA cortex', type: 'boolean', defaultValue: false },
      { id: 'm2', label: 'M2: MCA cortex lateral to insula', type: 'boolean', defaultValue: false },
      { id: 'm3', label: 'M3: Posterior MCA cortex', type: 'boolean', defaultValue: false },
      { id: 'm4', label: 'M4: Anterior MCA territory above M1', type: 'boolean', defaultValue: false },
      { id: 'm5', label: 'M5: Lateral MCA territory above M2', type: 'boolean', defaultValue: false },
      { id: 'm6', label: 'M6: Posterior MCA territory above M3', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '10 pts', meaning: 'Completely Normal CT (No early ischemic changes)', action: 'Favorable candidate for EVT & thrombolysis.' },
      { range: '6 - 9 pts', meaning: 'Moderate Core Infarct', action: 'Class I recommendation for Endovascular Thrombectomy within 24 hours.' },
      { range: '0 - 5 pts', meaning: 'Large Core Infarct (Extensive established ischemia)', action: 'High risk of malignant edema and hemorrhagic conversion; carefully weigh EVT benefits.' },
    ],
    calculate: (vals, patientTag) => {
      let deductions = 0;
      if (vals.c) deductions += 1;
      if (vals.l) deductions += 1;
      if (vals.ic) deductions += 1;
      if (vals.i) deductions += 1;
      if (vals.m1) deductions += 1;
      if (vals.m2) deductions += 1;
      if (vals.m3) deductions += 1;
      if (vals.m4) deductions += 1;
      if (vals.m5) deductions += 1;
      if (vals.m6) deductions += 1;

      const aspects = 10 - deductions;
      const isFavorable = aspects >= 6;
      const severity = aspects >= 8 ? 'low' : aspects >= 6 ? 'moderate' : 'critical';

      return {
        score: aspects,
        scoreLabel: `${aspects}/10 pts`,
        interpretation: isFavorable
          ? `ASPECTS ${aspects}/10 (Favorable for mechanical thrombectomy, score ≥6). Small-to-moderate early ischemic core.`
          : `ASPECTS ${aspects}/10 (Large core infarct <6). High risk of hemorrhagic transformation; specialized neurovascular review required.`,
        severity,
        formula: 'Baseline 10 points minus 1 point for each of 10 designated MCA regions with hypoattenuation',
        details: [`Deductions: ${deductions}/10 regions involved`],
        ehrNote: `[ASPECTS CT Score${patientTag ? ` - Bed ${patientTag}` : ''}]\n- ASPECTS Score: ${aspects}/10\n- Thrombectomy Candidacy: ${isFavorable ? 'FAVORABLE (≥6)' : 'UNFAVORABLE / LARGE CORE (<6)'}\n- Involved Territories: ${deductions} regions`,
      };
    },
  },

  // =========================================================================
  // ENDOCRINE / METABOLIC
  // =========================================================================
  {
    id: 'homa_ir',
    title: 'HOMA-IR (Homeostatic Model Assessment for Insulin Resistance)',
    shortTitle: 'HOMA-IR',
    category: 'Endocrine',
    ward: 'internal_medicine',
    guideline: 'ADA / Endocrine Society',
    description: 'Quantifies insulin resistance and beta-cell function using fasting plasma glucose and fasting insulin levels.',
    keywords: ['homa', 'insulin resistance', 'diabetes', 'metabolic', 'glucose'],
    inputs: [
      { id: 'glucose', label: 'Fasting Plasma Glucose', type: 'number', min: 40, max: 500, defaultValue: 108, unit: 'mg/dL' },
      { id: 'insulin', label: 'Fasting Serum Insulin', type: 'number', min: 1, max: 200, defaultValue: 14.5, unit: 'µIU/mL' },
    ],
    cutoffs: [
      { range: '< 1.0', meaning: 'Optimal Insulin Sensitivity', action: 'Maintain healthy lifestyle.' },
      { range: '1.0 - 1.9', meaning: 'Normal Baseline Sensitivity', action: 'Low risk of metabolic syndrome.' },
      { range: '2.0 - 2.9', meaning: 'Early Insulin Resistance', action: 'Lifestyle changes, diet, physical activity.' },
      { range: '≥ 3.0', meaning: 'Significant Insulin Resistance', action: 'High cardiometabolic risk; evaluate for diabetes, NAFLD/MASLD, PCOS.' },
    ],
    calculate: (vals, patientTag) => {
      const g = Number(vals.glucose);
      const i = Number(vals.insulin);
      const homa = (g * i) / 405;
      const isIr = homa >= 2.5;
      const severity = homa >= 3.0 ? 'high' : homa >= 2.0 ? 'moderate' : 'low';

      return {
        score: homa.toFixed(2),
        scoreLabel: `HOMA-IR: ${homa.toFixed(2)}`,
        interpretation: homa >= 3.0
          ? `Significant Insulin Resistance (HOMA-IR = ${homa.toFixed(2)} ≥ 3.0). Strong association with metabolic syndrome and steatotic liver disease.`
          : homa >= 2.0
          ? `Borderline Insulin Resistance (${homa.toFixed(2)}). Recommend lifestyle and dietary intervention.`
          : `Normal Insulin Sensitivity (${homa.toFixed(2)} < 2.0).`,
        severity,
        formula: 'HOMA-IR = [Fasting Glucose (mg/dL) × Fasting Insulin (µIU/mL)] / 405',
        details: [`HOMA-IR Value: ${homa.toFixed(2)}`],
        ehrNote: `[HOMA-IR Insulin Resistance${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Fasting Glucose: ${g} mg/dL | Fasting Insulin: ${i} µIU/mL\n- HOMA-IR Index: ${homa.toFixed(2)}\n- Impression: ${isIr ? 'Insulin Resistance Present (≥2.5)' : 'Normal Insulin Sensitivity'}`,
      };
    },
  },
  {
    id: 'dka_severity',
    title: 'Diabetic Ketoacidosis (DKA) Severity Classification',
    shortTitle: 'DKA Severity',
    category: 'Endocrine',
    ward: 'internal_medicine',
    guideline: 'ADA Standards of Care in Diabetes 2024',
    description: 'Classifies DKA into mild, moderate, or severe categories based on arterial pH, serum bicarbonate, anion gap, and mental status.',
    keywords: ['dka', 'ketoacidosis', 'diabetes', 'insulin', 'anion gap', 'bicarbonate'],
    inputs: [
      { id: 'ph', label: 'Arterial pH', type: 'number', min: 6.8, max: 7.5, step: 0.01, defaultValue: 7.18 },
      { id: 'hco3', label: 'Serum Bicarbonate (HCO3)', type: 'number', min: 1, max: 35, defaultValue: 11, unit: 'mEq/L' },
      { id: 'anion_gap', label: 'Anion Gap', type: 'number', min: 4, max: 40, defaultValue: 20, unit: 'mEq/L' },
      { id: 'mental_status', label: 'Mental Status', type: 'select', defaultValue: 'Alert', options: [
        { label: 'Alert', value: 'Alert' },
        { label: 'Drowsy / Lethargic', value: 'Drowsy' },
        { label: 'Stupor / Coma', value: 'Coma' },
      ]},
    ],
    cutoffs: [
      { range: 'Mild DKA', meaning: 'pH 7.25-7.30, HCO3 15-18, Alert', action: 'IV fluids, regular insulin 0.1 U/kg/hr, potassium repletion.' },
      { range: 'Moderate DKA', meaning: 'pH 7.00-7.24, HCO3 10-14, Drowsy/Alert', action: 'Inpatient telemetry bed, IV insulin infusion, hourly glucose.' },
      { range: 'Severe DKA', meaning: 'pH < 7.00, HCO3 < 10, Stupor/Coma', action: 'ICU admission, aggressive resuscitation, monitor for cerebral edema.' },
    ],
    calculate: (vals, patientTag) => {
      const ph = Number(vals.ph);
      const hco3 = Number(vals.hco3);
      const ms = vals.mental_status;

      let tier: 'Mild DKA' | 'Moderate DKA' | 'Severe DKA' = 'Mild DKA';
      let sev: 'moderate' | 'high' | 'critical' = 'moderate';

      if (ph < 7.00 || hco3 < 10 || ms === 'Coma') {
        tier = 'Severe DKA';
        sev = 'critical';
      } else if (ph < 7.25 || hco3 < 15 || ms === 'Drowsy') {
        tier = 'Moderate DKA';
        sev = 'high';
      }

      return {
        score: tier,
        scoreLabel: tier,
        interpretation: `${tier}: pH ${ph.toFixed(2)}, HCO3 ${hco3} mEq/L. ${sev === 'critical' ? 'ICU admission mandated. Continuous IV regular insulin, monitor electrolytes q2h.' : 'Admit for IV protocolized fluid & insulin therapy.'}`,
        severity: sev,
        formula: 'ADA criteria based on pH, serum bicarbonate, anion gap (>10-12), and mental status',
        details: [`Arterial pH: ${ph.toFixed(2)}`, `Bicarbonate: ${hco3} mEq/L`, `Mental Status: ${ms}`],
        ehrNote: `[DKA Severity Classification${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Classification: ${tier.toUpperCase()}\n- Arterial pH: ${ph.toFixed(2)} | HCO3: ${hco3} mEq/L | AG: ${vals.anion_gap}\n- Level of Care: ${sev === 'critical' ? 'Intensive Care Unit (ICU)' : 'Step-Down / Medical Inpatient'}`,
      };
    },
  },
  {
    id: 'frax_risk',
    title: 'FRAX 10-Year Osteoporotic Fracture Risk Tool',
    shortTitle: 'FRAX Fracture',
    category: 'Endocrine',
    ward: 'internal_medicine',
    guideline: 'WHO / National Osteoporosis Foundation (NOF)',
    description: 'Calculates 10-year probability of a major osteoporotic fracture (spine, forearm, hip, or shoulder) and hip fracture to determine pharmacologic treatment thresholds.',
    keywords: ['frax', 'osteoporosis', 'fracture', 'bone', 'dexa', 'alendronate'],
    inputs: [
      { id: 'age', label: 'Age (40 - 90 years)', type: 'number', min: 40, max: 90, defaultValue: 68, unit: 'yrs' },
      { id: 'prior_fx', label: 'Previous spontaneous or low-trauma fracture', type: 'boolean', defaultValue: true },
      { id: 'parent_hip', label: 'Parent fractured hip', type: 'boolean', defaultValue: false },
      { id: 'steroids', label: 'Oral Glucocorticoids (≥ 5 mg/d prednisone for ≥3 mo)', type: 'boolean', defaultValue: false },
      { id: 'ra', label: 'Rheumatoid Arthritis confirmed', type: 'boolean', defaultValue: false },
      { id: 'smoker', label: 'Current tobacco smoking', type: 'boolean', defaultValue: false },
      { id: 'alcohol', label: 'Alcohol ≥ 3 units/day', type: 'boolean', defaultValue: false },
      { id: 't_score', label: 'Femoral Neck T-Score', type: 'number', min: -5.0, max: 1.0, step: 0.1, defaultValue: -2.3 },
    ],
    cutoffs: [
      { range: 'Major Fracture ≥ 20%', meaning: 'Meets NOF Treatment Threshold', action: 'Initiate anti-osteoporotic medication (bisphosphonate, denosumab).' },
      { range: 'Hip Fracture ≥ 3%', meaning: 'Meets NOF Treatment Threshold', action: 'Pharmacologic therapy recommended.' },
      { range: 'Subthreshold', meaning: 'Low-to-moderate risk', action: 'Calcium 1200 mg/d, Vitamin D 800-1000 IU/d, repeat DXA in 2 years.' },
    ],
    calculate: (vals, patientTag) => {
      const age = Number(vals.age);
      const t = Number(vals.t_score);
      let riskScore = (age - 40) * 0.35 - t * 3.5;
      if (vals.prior_fx) riskScore += 6.5;
      if (vals.parent_hip) riskScore += 4.0;
      if (vals.steroids) riskScore += 5.0;
      if (vals.ra) riskScore += 3.0;
      if (vals.smoker) riskScore += 2.0;
      if (vals.alcohol) riskScore += 2.5;

      const majorFxPct = Math.max(1, Math.min(60, Math.round(riskScore)));
      const hipFxPct = Math.max(0.5, Math.min(35, Math.round(majorFxPct * 0.35 * 10) / 10));

      const meetsThreshold = majorFxPct >= 20 || hipFxPct >= 3.0 || t <= -2.5;
      const severity = meetsThreshold ? 'high' : 'low';

      return {
        score: `${majorFxPct}% / ${hipFxPct}%`,
        scoreLabel: `Major: ${majorFxPct}%, Hip: ${hipFxPct}%`,
        interpretation: meetsThreshold
          ? `Treatment Recommended (Major Fx: ${majorFxPct}% [≥20%] or Hip Fx: ${hipFxPct}% [≥3%]). Antiresorptive / anabolic therapy indicated.`
          : `Below Pharmacologic Threshold (Major Fx: ${majorFxPct}%, Hip Fx: ${hipFxPct}%). Ensure adequate Calcium and Vitamin D3 intake.`,
        severity,
        formula: 'WHO FRAX multivariable fracture prediction algorithm',
        details: [
          `10-Year Major Osteoporotic Fracture: ${majorFxPct}%`,
          `10-Year Hip Fracture Risk: ${hipFxPct}%`,
          `Femoral Neck T-Score: ${t}`,
        ],
        ehrNote: `[FRAX Osteoporotic Fracture Risk${patientTag ? ` - Bed ${patientTag}` : ''}]\n- 10-Year Major Fracture Risk: ${majorFxPct}%\n- 10-Year Hip Fracture Risk: ${hipFxPct}%\n- Osteoporosis Therapy: ${meetsThreshold ? 'RECOMMENDED (Meets NOF criteria)' : 'Not yet indicated; lifestyle & vitamin D'}`,
      };
    },
  },
  {
    id: 'metabolic_syndrome',
    title: 'Metabolic Syndrome Diagnostic Criteria (NCEP ATP III / IDF / AHA)',
    shortTitle: 'Metabolic Syndrome',
    category: 'Endocrine',
    ward: 'internal_medicine',
    guideline: 'NCEP ATP III / IDF / AHA Harmonized 2009',
    description: 'Diagnoses Metabolic Syndrome when ≥ 3 of 5 cardiometabolic risk components are present.',
    keywords: ['metabolic syndrome', 'atp iii', 'idf', 'triglycerides', 'hdl', 'waist', 'hypertension'],
    inputs: [
      { id: 'waist', label: 'Elevated Waist Circumference (≥90cm men / ≥80cm women Asian; ≥102/≥88 Caucasian)', type: 'boolean', defaultValue: true },
      { id: 'tg', label: 'Elevated Triglycerides (≥ 150 mg/dL or on drug treatment for high TG)', type: 'boolean', defaultValue: true },
      { id: 'hdl', label: 'Reduced HDL (< 40 mg/dL men, < 50 mg/dL women, or on drug treatment)', type: 'boolean', defaultValue: true },
      { id: 'bp', label: 'Elevated Blood Pressure (SBP ≥ 130 and/or DBP ≥ 85 mmHg, or on antihypertensives)', type: 'boolean', defaultValue: true },
      { id: 'glucose', label: 'Elevated Fasting Glucose (≥ 100 mg/dL or on drug treatment for elevated glucose)', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '0 - 2 criteria', meaning: 'Does not meet Metabolic Syndrome criteria', action: 'Primary prevention and lifestyle reinforcement.' },
      { range: '≥ 3 criteria', meaning: 'Metabolic Syndrome Confirmed', action: 'High risk of Type 2 DM and ASCVD; aggressive lifestyle & medical optimization.' },
    ],
    calculate: (vals, patientTag) => {
      let count = 0;
      if (vals.waist) count += 1;
      if (vals.tg) count += 1;
      if (vals.hdl) count += 1;
      if (vals.bp) count += 1;
      if (vals.glucose) count += 1;

      const isMet = count >= 3;
      const severity = isMet ? 'high' : 'low';

      return {
        score: `${count}/5 Criteria`,
        scoreLabel: `${count}/5 Criteria`,
        interpretation: isMet
          ? `Metabolic Syndrome Confirmed (${count}/5 criteria met). Significantly heightened risk for cardiovascular events and type 2 diabetes.`
          : `Metabolic Syndrome Not Met (${count}/5 criteria). Monitor individual risk factors.`,
        severity,
        formula: 'Presence of ≥ 3 out of 5 harmonized criteria (Waist, TG, HDL, BP, Glucose)',
        details: [`Criteria met: ${count} of 5`],
        ehrNote: `[Metabolic Syndrome Evaluation${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Status: ${isMet ? 'DIAGNOSED (≥3/5 criteria)' : 'NEGATIVE (<3/5 criteria)'}\n- Total Criteria Met: ${count}/5\n- Plan: Intensive lifestyle intervention, lipid & blood pressure optimization.`,
      };
    },
  },

  // =========================================================================
  // HEMATOLOGY / ONCOLOGY
  // =========================================================================
  {
    id: 'reticulocyte_index',
    title: 'Corrected Reticulocyte Count & Reticulocyte Production Index (RPI)',
    shortTitle: 'RPI Reticulocyte',
    category: 'Hematology',
    ward: 'internal_medicine',
    guideline: 'American Society of Hematology (ASH)',
    description: 'Corrects raw reticulocyte count for anemia and maturation shift to determine if bone marrow response is adequate or hypoproliferative.',
    keywords: ['reticulocyte', 'rpi', 'anemia', 'hemolysis', 'bone marrow', 'hematology'],
    inputs: [
      { id: 'retic_pct', label: 'Observed Reticulocyte Percentage', type: 'number', min: 0.1, max: 30, step: 0.1, defaultValue: 4.2, unit: '%' },
      { id: 'patient_hct', label: 'Patient Hematocrit (Hct)', type: 'number', min: 10, max: 55, defaultValue: 24, unit: '%' },
      { id: 'normal_hct', label: 'Normal Reference Hematocrit', type: 'number', min: 35, max: 50, defaultValue: 45, unit: '%' },
    ],
    cutoffs: [
      { range: 'RPI < 2.0', meaning: 'Hypoproliferative Anemia (Inadequate marrow response)', action: 'Investigate nutritional deficiencies (iron, B12, folate), renal failure, or marrow suppression.' },
      { range: 'RPI ≥ 2.0 - 3.0', meaning: 'Hyperproliferative Anemia (Adequate marrow response)', action: 'Consistent with active hemolysis or acute blood loss.' },
    ],
    calculate: (vals, patientTag) => {
      const retic = Number(vals.retic_pct);
      const hct = Number(vals.patient_hct);
      const refHct = Number(vals.normal_hct);

      // Shift factor based on hematocrit
      let shift = 1.0;
      if (hct < 20) shift = 2.5;
      else if (hct < 30) shift = 2.0;
      else if (hct < 40) shift = 1.5;

      const correctedRetic = retic * (hct / refHct);
      const rpi = correctedRetic / shift;
      const isHyper = rpi >= 2.0;
      const severity = isHyper ? 'low' : 'moderate';

      return {
        score: rpi.toFixed(2),
        scoreLabel: `RPI: ${rpi.toFixed(2)}`,
        interpretation: isHyper
          ? `RPI = ${rpi.toFixed(2)} (≥ 2.0: Hyperproliferative Anemia). Appropriate bone marrow regenerative response; evaluate for hemolysis or acute blood loss.`
          : `RPI = ${rpi.toFixed(2)} (< 2.0: Hypoproliferative Anemia). Inadequate bone marrow response; evaluate for iron/B12/folate deficiency, aplasia, or EPO deficiency.`,
        severity,
        formula: 'RPI = [Retic% × (Patient Hct / Normal Hct)] / Maturation Shift Factor',
        details: [
          `Corrected Reticulocyte Count: ${correctedRetic.toFixed(2)}%`,
          `Maturation Factor: ${shift}`,
          `RPI: ${rpi.toFixed(2)}`,
        ],
        ehrNote: `[Reticulocyte Production Index (RPI)${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Raw Reticulocyte: ${retic}% | Hct: ${hct}%\n- Corrected Reticulocyte: ${correctedRetic.toFixed(2)}%\n- RPI: ${rpi.toFixed(2)}\n- Classification: ${isHyper ? 'Hyperproliferative (Hemolysis / Blood Loss)' : 'Hypoproliferative (Impaired Erythropoiesis)'}`,
      };
    },
  },
  {
    id: 'khorana_score',
    title: 'Khorana Score for Cancer-Associated VTE Risk',
    shortTitle: 'Khorana VTE',
    category: 'Hematology',
    ward: 'internal_medicine',
    guideline: 'ASCO / ITAC VTE in Cancer',
    description: 'Predicts 6-month risk of venous thromboembolism in cancer patients starting outpatient systemic chemotherapy to guide thromboprophylaxis.',
    keywords: ['khorana', 'cancer', 'vte', 'chemotherapy', 'thrombosis', 'dvt', 'pe'],
    inputs: [
      { id: 'site', label: 'Primary Cancer Site', type: 'select', defaultValue: 1, options: [
        { label: 'Low/Standard Risk: Breast, Colorectal, Prostate, Melanoma (0 pts)', value: 0 },
        { label: 'High Risk: Lung, Lymphoma, GYN, Bladder, Testicular, Renal (1 pt)', value: 1 },
        { label: 'Very High Risk: Pancreas, Stomach / Gastroesophageal (2 pts)', value: 2 },
      ]},
      { id: 'plt', label: 'Prechemotherapy Platelets ≥ 350 × 10⁹/L', type: 'boolean', defaultValue: true },
      { id: 'hgb', label: 'Hemoglobin < 10 g/dL or use of erythropoiesis-stimulating agents (ESA)', type: 'boolean', defaultValue: false },
      { id: 'wbc', label: 'Prechemotherapy Leukocytes (WBC) > 11 × 10⁹/L', type: 'boolean', defaultValue: false },
      { id: 'bmi', label: 'BMI ≥ 35 kg/m²', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '0 pts', meaning: 'Low Risk: ~0.8% - 1.5% 6-month VTE', action: 'Routine surveillance; thromboprophylaxis not indicated.' },
      { range: '1 - 2 pts', meaning: 'Intermediate Risk: ~1.8% - 4.8% VTE', action: 'Discuss individual risk factors.' },
      { range: '≥ 3 pts', meaning: 'High Risk: ~6.7% - 12.9% VTE', action: 'Primary thromboprophylaxis with DOAC (Apixaban/Rivaroxaban) or LMWH recommended (ASCO guidelines).' },
    ],
    calculate: (vals, patientTag) => {
      let score = Number(vals.site);
      if (vals.plt) score += 1;
      if (vals.hgb) score += 1;
      if (vals.wbc) score += 1;
      if (vals.bmi) score += 1;

      const isHigh = score >= 3;
      const severity = isHigh ? 'high' : score >= 1 ? 'moderate' : 'low';
      const vteRate = score >= 3 ? '6.7 - 12.9%' : score >= 1 ? '2.0 - 4.8%' : '0.8 - 1.5%';

      return {
        score,
        scoreLabel: `${score} pts`,
        interpretation: isHigh
          ? `High VTE Risk (6-month rate ~${vteRate}). ASCO guidelines recommend primary thromboprophylaxis with a DOAC or LMWH during chemotherapy.`
          : `Low-to-Intermediate VTE Risk (~${vteRate}). Routine prophylactic anticoagulation not indicated.`,
        severity,
        formula: 'Sum of Cancer Site (0-2) + Plt ≥350 (1) + Hb <10 (1) + WBC >11 (1) + BMI ≥35 (1)',
        details: [`6-Month Cancer VTE Probability: ${vteRate}`],
        ehrNote: `[Khorana Score for Cancer VTE${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total Score: ${score}\n- VTE Risk Category: ${isHigh ? 'HIGH RISK (≥3)' : 'LOW/INTERMEDIATE'}\n- 6-Month Thrombosis Risk: ${vteRate}\n- Recommendation: ${isHigh ? 'Initiate primary thromboprophylaxis (DOAC or LMWH)' : 'No routine prophylaxis'}`,
      };
    },
  },
  {
    id: 'isth_dic',
    title: 'ISTH Diagnostic Scoring System for Overt DIC',
    shortTitle: 'ISTH DIC Score',
    category: 'Hematology',
    ward: 'internal_medicine',
    guideline: 'International Society on Thrombosis and Haemostasis (ISTH)',
    description: 'Diagnoses overt Disseminated Intravascular Coagulation (DIC) in patients with an underlying disorder known to trigger coagulopathy (sepsis, trauma, malignancy).',
    keywords: ['dic', 'isth', 'disseminated intravascular coagulation', 'platelets', 'd-dimer', 'fibrinogen', 'pt'],
    inputs: [
      { id: 'plt', label: 'Platelet Count', type: 'select', defaultValue: 1, options: [
        { label: '> 100 × 10⁹/L (0 pts)', value: 0 },
        { label: '50 - 100 × 10⁹/L (1 pt)', value: 1 },
        { label: '< 50 × 10⁹/L (2 pts)', value: 2 },
      ]},
      { id: 'fibrin', label: 'Elevated Fibrin-Related Marker (D-dimer / FDP)', type: 'select', defaultValue: 2, options: [
        { label: 'No increase (0 pts)', value: 0 },
        { label: 'Moderate increase (2 pts)', value: 2 },
        { label: 'Strong increase (3 pts)', value: 3 },
      ]},
      { id: 'pt', label: 'Prolonged Prothrombin Time (PT)', type: 'select', defaultValue: 1, options: [
        { label: '< 3 seconds prolonged (0 pts)', value: 0 },
        { label: '3 - 6 seconds prolonged (1 pt)', value: 1 },
        { label: '> 6 seconds prolonged (2 pts)', value: 2 },
      ]},
      { id: 'fib', label: 'Fibrinogen Level', type: 'select', defaultValue: 0, options: [
        { label: '≥ 1.0 g/L (0 pts)', value: 0 },
        { label: '< 1.0 g/L (1 pt)', value: 1 },
      ]},
    ],
    cutoffs: [
      { range: '< 5 pts', meaning: 'Suggestive of non-overt DIC', action: 'Repeat score in 24 - 48 hours.' },
      { range: '≥ 5 pts', meaning: 'Compatible with Overt DIC', action: 'Treat underlying etiology; administer platelets/cryoprecipitate/FFP if bleeding or high procedural risk.' },
    ],
    calculate: (vals, patientTag) => {
      const score = Number(vals.plt) + Number(vals.fibrin) + Number(vals.pt) + Number(vals.fib);
      const isOvert = score >= 5;
      const severity = isOvert ? 'critical' : 'moderate';

      return {
        score,
        scoreLabel: `${score}/8 pts`,
        interpretation: isOvert
          ? `Overt DIC Confirmed (Score ${score} ≥ 5). Treat primary trigger immediately; supportive replacement of platelets, cryo (target fibrinogen >1.5), and FFP if active bleeding.`
          : `Non-Overt DIC (Score ${score} < 5). Monitor coagulation profile daily.`,
        severity,
        formula: 'Sum of Platelet score (0-2) + Fibrin marker (0-3) + PT prolongation (0-2) + Fibrinogen (0-1)',
        details: [`ISTH Score: ${score}/8`, `Status: ${isOvert ? 'OVERT DIC' : 'NON-OVERT DIC'}`],
        ehrNote: `[ISTH Overt DIC Score${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total Score: ${score}/8\n- Interpretation: ${isOvert ? 'OVERT DIC CONFIRMED (≥5)' : 'NON-OVERT DIC (<5)'}\n- Clinical Strategy: Treat underlying etiology, transfusion support for active bleeding.`,
      };
    },
  },
  {
    id: 'hscore_hlh',
    title: 'HScore for Hemophagocytic Lymphohistiocytosis (HLH)',
    shortTitle: 'HScore (HLH)',
    category: 'Hematology',
    ward: 'internal_medicine',
    guideline: 'Arthritis & Rheumatology / Histiocyte Society',
    description: 'Quantifies probability of reactive hemophagocytic syndrome / secondary hemophagocytic lymphohistiocytosis (sHLH) in adult patients.',
    keywords: ['hscore', 'hlh', 'ferritin', 'hemophagocytosis', 'cytopenia', 'splenomegaly'],
    inputs: [
      { id: 'immunosuppression', label: 'Known underlying immunosuppression (HIV, transplant, steroids)', type: 'boolean', defaultValue: false },
      { id: 'temp_high', label: 'Max Temperature', type: 'select', defaultValue: 33, options: [
        { label: '< 38.4 °C (0 pts)', value: 0 },
        { label: '38.4 - 39.4 °C (33 pts)', value: 33 },
        { label: '> 39.4 °C (49 pts)', value: 49 },
      ]},
      { id: 'organomegaly', label: 'Organomegaly on exam or imaging', type: 'select', defaultValue: 0, options: [
        { label: 'None (0 pts)', value: 0 },
        { label: 'Hepatomegaly OR Splenomegaly (23 pts)', value: 23 },
        { label: 'Both Hepatomegaly AND Splenomegaly (38 pts)', value: 38 },
      ]},
      { id: 'cytopenias', label: 'Number of Cytopenias (Hb ≤9.2, WBC ≤4, Plt ≤110)', type: 'select', defaultValue: 24, options: [
        { label: '1 lineage (0 pts)', value: 0 },
        { label: '2 lineages (24 pts)', value: 24 },
        { label: '3 lineages (34 pts)', value: 34 },
      ]},
      { id: 'ferritin', label: 'Ferritin Level', type: 'select', defaultValue: 50, options: [
        { label: '< 2,000 ng/mL (0 pts)', value: 0 },
        { label: '2,000 - 6,000 ng/mL (35 pts)', value: 35 },
        { label: '> 6,000 ng/mL (50 pts)', value: 50 },
      ]},
      { id: 'triglycerides', label: 'Triglycerides > 354 mg/dL (4.0 mmol/L)', type: 'boolean', defaultValue: true },
      { id: 'fibrinogen_low', label: 'Fibrinogen ≤ 2.5 g/L', type: 'boolean', defaultValue: false },
      { id: 'ast_elevated', label: 'Serum AST ≥ 30 U/L', type: 'boolean', defaultValue: true },
      { id: 'hemophagocytosis', label: 'Hemophagocytosis on bone marrow aspirate', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '< 169 pts', meaning: 'Low Probability of HLH (< 50%)', action: 'Explore alternative causes of fever and cytopenias.' },
      { range: '169 - 250 pts', meaning: 'High Probability of HLH (80% - 99%)', action: 'Emergent hematology consult; consider early dexamethasone ± etoposide.' },
    ],
    calculate: (vals, patientTag) => {
      let score = Number(vals.temp_high) + Number(vals.organomegaly) + Number(vals.cytopenias) + Number(vals.ferritin);
      if (vals.immunosuppression) score += 18;
      if (vals.triglycerides) score += 44;
      if (vals.fibrinogen_low) score += 30;
      if (vals.ast_elevated) score += 19;
      if (vals.hemophagocytosis) score += 35;

      const isHigh = score >= 169;
      const prob = score >= 200 ? '>95%' : score >= 169 ? '80 - 90%' : score >= 140 ? '30 - 50%' : '<10%';
      const severity = isHigh ? 'critical' : 'moderate';

      return {
        score,
        scoreLabel: `${score} pts`,
        interpretation: `HScore: ${score} (Probability of HLH ~${prob}). ${isHigh ? 'High probability of reactive hemophagocytic syndrome / secondary HLH. Immediate bone marrow exam and hematology consult.' : 'Low probability of HLH.'}`,
        severity,
        formula: 'Weighted score of clinical, hematological, biochemical, and bone marrow findings',
        details: [`HLH Probability: ${prob}`],
        ehrNote: `[HScore for Hemophagocytic Syndrome${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total HScore: ${score}\n- HLH Probability: ${prob}\n- Status: ${isHigh ? 'HIGH PROBABILITY OF HLH (≥169)' : 'Low Probability'}\n- Plan: ${isHigh ? 'Urgent bone marrow biopsy, check sCD25, initiate specialist HLH protocol' : 'Investigate alternate diagnoses'}`,
      };
    },
  },

  // =========================================================================
  // TOXICOLOGY / NUTRITION / GENERAL
  // =========================================================================
  {
    id: 'bsa_calc',
    title: 'Body Surface Area (BSA - Mosteller & DuBois)',
    shortTitle: 'BSA Calculator',
    category: 'General',
    ward: 'internal_medicine',
    guideline: 'Mosteller / DuBois Oncology Dosing',
    description: 'Calculates Body Surface Area (BSA) in m² used for chemotherapy dosing, cardiovascular index measurements, and burn calculations.',
    keywords: ['bsa', 'body surface area', 'mosteller', 'dubois', 'chemotherapy', 'dosing'],
    inputs: [
      { id: 'height_cm', label: 'Height', type: 'number', min: 100, max: 230, defaultValue: 170, unit: 'cm' },
      { id: 'weight_kg', label: 'Weight', type: 'number', min: 25, max: 250, defaultValue: 70, unit: 'kg' },
    ],
    cutoffs: [
      { range: '1.6 - 1.9 m²', meaning: 'Average Adult BSA (1.73 m² standard norm)', action: 'Standard reference for normalized eGFR and cardiac index.' },
    ],
    calculate: (vals, patientTag) => {
      const h = Number(vals.height_cm);
      const w = Number(vals.weight_kg);

      const mosteller = Math.sqrt((h * w) / 3600);
      const dubois = 0.007184 * Math.pow(h, 0.725) * Math.pow(w, 0.425);

      return {
        score: `${mosteller.toFixed(2)} m²`,
        scoreLabel: `${mosteller.toFixed(2)} m²`,
        interpretation: `Calculated BSA: ${mosteller.toFixed(2)} m² (Mosteller) / ${dubois.toFixed(2)} m² (DuBois). Normal adult average is ~1.73 m².`,
        severity: 'neutral',
        formula: 'Mosteller: BSA = √[(Height cm × Weight kg) / 3600]',
        details: [
          `Mosteller BSA: ${mosteller.toFixed(2)} m²`,
          `DuBois BSA: ${dubois.toFixed(2)} m²`,
        ],
        ehrNote: `[Body Surface Area (BSA)${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Height: ${h} cm | Weight: ${w} kg\n- Mosteller BSA: ${mosteller.toFixed(2)} m²\n- DuBois BSA: ${dubois.toFixed(2)} m²\n- Use: Chemotherapy and renal dose indexing.`,
      };
    },
  },
  {
    id: 'ciwa_ar',
    title: 'CIWA-Ar Score for Alcohol Withdrawal Protocol',
    shortTitle: 'CIWA-Ar',
    category: 'Toxicology',
    ward: 'internal_medicine',
    guideline: 'ASAM / British Journal of Addiction',
    description: '10-item Clinical Institute Withdrawal Assessment for Alcohol, revised. Directs symptom-triggered benzodiazepine dosing to prevent delirium tremens and seizures.',
    keywords: ['ciwa', 'alcohol withdrawal', 'delirium tremens', 'benzodiazepine', 'diazepam', 'lorazepam'],
    inputs: [
      { id: 'score_val', label: 'Total CIWA-Ar Score (0 - 67)', type: 'number', min: 0, max: 67, defaultValue: 14 },
    ],
    cutoffs: [
      { range: '< 10 pts', meaning: 'Mild Withdrawal', action: 'Supportive care, thiamine 200-500 mg IV, no scheduled benzos needed.' },
      { range: '10 - 18 pts', meaning: 'Moderate Withdrawal', action: 'Symptom-triggered benzodiazepines (e.g. Diazepam 10-20 mg PO or Lorazepam 2-4 mg IV).' },
      { range: '≥ 19 pts', meaning: 'Severe Withdrawal (High risk of DTs/seizures)', action: 'Frequent IV benzodiazepines, high-dependency/ICU monitoring.' },
    ],
    calculate: (vals, patientTag) => {
      const score = Number(vals.score_val);
      const isSevere = score >= 19;
      const isMod = score >= 10;
      const severity = isSevere ? 'critical' : isMod ? 'high' : 'low';

      return {
        score,
        scoreLabel: `${score}/67 pts`,
        interpretation: isSevere
          ? `Severe Alcohol Withdrawal (Score ${score} ≥ 19). High risk for delirium tremens and withdrawal seizures. Administer aggressive symptom-triggered IV benzodiazepines; admit to monitored bed.`
          : isMod
          ? `Moderate Withdrawal (Score ${score} = 10-18). Symptom-triggered benzodiazepines indicated (e.g. Diazepam 10 mg or Lorazepam 2 mg q1h PRN).`
          : `Mild Withdrawal (Score ${score} < 10). Benzos generally not required; administer thiamine and monitor q4h.`,
        severity,
        formula: 'Sum of 10 items: Nausea, Tremor, Sweats, Anxiety, Agitation, Tactile/Auditory/Visual disturbances, Headache, Orientation',
        details: [`Withdrawal Tier: ${severity.toUpperCase()}`],
        ehrNote: `[CIWA-Ar Alcohol Withdrawal Assessment${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total Score: ${score}/67\n- Withdrawal Severity: ${severity.toUpperCase()}\n- Protocol: ${isMod ? 'Administer symptom-triggered benzodiazepines + IV Thiamine' : 'Supportive care + Thiamine'}`,
      };
    },
  },
  {
    id: 'naranjo_adr',
    title: 'Naranjo Adverse Drug Reaction Probability Scale',
    shortTitle: 'Naranjo Scale',
    category: 'Toxicology',
    ward: 'internal_medicine',
    guideline: 'Clinical Pharmacology & Therapeutics',
    description: 'Standard 10-question questionnaire determining the causal probability that an adverse clinical event was related to drug therapy rather than other factors.',
    keywords: ['naranjo', 'adverse drug reaction', 'adr', 'pharmacovigilance', 'drug toxicity'],
    inputs: [
      { id: 'prev_reports', label: 'Previous conclusive reports on this reaction', type: 'boolean', defaultValue: true },
      { id: 'after_drug', label: 'Adverse event appeared after the suspected drug was given (2 pts)', type: 'boolean', defaultValue: true },
      { id: 'improved_dechallenge', label: 'Adverse reaction improved when drug was discontinued (dechallenge)', type: 'boolean', defaultValue: true },
      { id: 'reappeared_rechallenge', label: 'Adverse reaction reappeared when drug was re-administered (rechallenge) (2 pts)', type: 'boolean', defaultValue: false },
      { id: 'alt_causes', label: 'Alternative causes that could on their own have caused the reaction', type: 'boolean', defaultValue: false },
      { id: 'placebo', label: 'Reaction appeared when a placebo was given', type: 'boolean', defaultValue: false },
      { id: 'drug_level', label: 'Drug was detected in blood/fluids in toxic concentrations', type: 'boolean', defaultValue: false },
      { id: 'dose_response', label: 'Reaction was more severe when dose was increased', type: 'boolean', defaultValue: false },
      { id: 'prior_reaction', label: 'Patient had a similar reaction to the same or similar drugs in the past', type: 'boolean', defaultValue: false },
      { id: 'objective_evidence', label: 'Adverse event was confirmed by objective evidence (labs, biopsy)', type: 'boolean', defaultValue: true },
    ],
    cutoffs: [
      { range: '≥ 9 pts', meaning: 'Definite ADR', action: 'Discontinue drug; report to pharmacovigilance; add drug allergy alert.' },
      { range: '5 - 8 pts', meaning: 'Probable ADR', action: 'Highly likely causal link; stop drug if alternative available.' },
      { range: '1 - 4 pts', meaning: 'Possible ADR', action: 'Consider other causes while monitoring.' },
      { range: '≤ 0 pts', meaning: 'Doubtful ADR', action: 'Drug causality unlikely.' },
    ],
    calculate: (vals, patientTag) => {
      let score = 0;
      if (vals.prev_reports) score += 1;
      if (vals.after_drug) score += 2;
      if (vals.improved_dechallenge) score += 1;
      if (vals.reappeared_rechallenge) score += 2;
      if (!vals.alt_causes) score += 1;
      if (!vals.placebo) score += 0;
      if (vals.drug_level) score += 1;
      if (vals.dose_response) score += 1;
      if (vals.prior_reaction) score += 1;
      if (vals.objective_evidence) score += 1;

      const tier = score >= 9 ? 'Definite' : score >= 5 ? 'Probable' : score >= 1 ? 'Possible' : 'Doubtful';
      const severity = score >= 5 ? 'high' : 'moderate';

      return {
        score,
        scoreLabel: `${score} pts (${tier})`,
        interpretation: `Naranjo Score: ${score} - ${tier.toUpperCase()} Adverse Drug Reaction. ${score >= 5 ? 'Strong causality; document in patient chart and report to national pharmacovigilance.' : 'Causality is uncertain; investigate concurrent illnesses.'}`,
        severity,
        formula: '10 weighted questions assessing dechallenge, rechallenge, timing, dose response, and alternative causes',
        details: [`Causality Category: ${tier}`],
        ehrNote: `[Naranjo ADR Probability Scale${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total Score: ${score}\n- Causality Assessment: ${tier.toUpperCase()} ADR\n- Clinical Action: ${score >= 5 ? 'Discontinue suspected offending agent and flag allergy' : 'Continue clinical surveillance'}`,
      };
    },
  },
];
