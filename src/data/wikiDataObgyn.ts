import type { WikiCalculatorItem } from './wikiTypes';

export const WIKI_OBGYN_TOOLS: WikiCalculatorItem[] = [
  // =========================================================================
  // ANTENATAL, DATING & SURVEILLANCE
  // =========================================================================
  {
    id: 'nst_evaluation',
    title: 'Non-Stress Test (NST) Cardiotocography Evaluation',
    shortTitle: 'NST Evaluation',
    category: 'Antenatal & Dating',
    ward: 'obgyn',
    guideline: 'ACOG Practice Bulletin 229: Antepartum Fetal Surveillance',
    description: 'Interprets antepartum electronic fetal heart rate monitoring (FHR) as Reactive or Non-Reactive based on gestational age-appropriate accelerations.',
    keywords: ['nst', 'non-stress test', 'fhr', 'accelerations', 'variability', 'fetal surveillance'],
    inputs: [
      { id: 'ga_weeks', label: 'Gestational Age (weeks)', type: 'number', min: 24, max: 42, defaultValue: 36, unit: 'wk' },
      { id: 'accels', label: 'FHR Accelerations in 20 - 40 minutes', type: 'select', defaultValue: 'two_15x15', options: [
        { label: '≥ 2 accelerations of ≥ 15 bpm lasting ≥ 15 sec (or 10×10 if <32 wk)', value: 'two_15x15' },
        { label: 'Insufficient accelerations (< 2 in 40 minutes)', value: 'insufficient' },
        { label: 'Absent accelerations despite acoustic stimulation', value: 'none' },
      ]},
      { id: 'variability', label: 'Baseline FHR Variability', type: 'select', defaultValue: 'moderate', options: [
        { label: 'Moderate (6 - 25 bpm amplitude - Normal)', value: 'moderate' },
        { label: 'Minimal (≤ 5 bpm)', value: 'minimal' },
        { label: 'Absent (0 bpm)', value: 'absent' },
        { label: 'Marked (> 25 bpm)', value: 'marked' },
      ]},
      { id: 'decelerations', label: 'Fetal Heart Rate Decelerations', type: 'select', defaultValue: 'none', options: [
        { label: 'No decelerations (or brief variables < 30 sec)', value: 'none' },
        { label: 'Variable decelerations (repetitive or > 60 sec)', value: 'variable' },
        { label: 'Late decelerations present', value: 'late' },
      ]},
    ],
    cutoffs: [
      { range: 'Reactive NST', meaning: 'Fetal Well-Being Reassuring (Fetal death risk < 1/1000 within 1 week)', action: 'Repeat surveillance in 1 week (or twice weekly if high-risk).' },
      { range: 'Non-Reactive NST', meaning: 'Uncertain fetal oxygenation', action: 'Extend monitoring to 40 minutes, perform Vibroacoustic Stimulation (VAS), or proceed to complete Biophysical Profile (BPP) / Contraction Stress Test (CST).' },
      { range: 'Non-Reactive + Decels', meaning: 'Concerning for Fetal Compromise', action: 'Immediate maternal-fetal evaluation, hydration, position change, consider urgent delivery.' },
    ],
    calculate: (vals, patientTag) => {
      const isReactive = vals.accels === 'two_15x15' && vals.variability === 'moderate' && vals.decelerations === 'none';
      const hasLateDecels = vals.decelerations === 'late';
      const hasMinimalVar = vals.variability === 'minimal' || vals.variability === 'absent';

      let result = 'REACTIVE NST';
      let sev: 'low' | 'moderate' | 'critical' = 'low';
      let rec = 'Normal reassuring fetal status. Negative predictive value for fetal demise is >99.8%.';

      if (hasLateDecels || (hasMinimalVar && vals.accels === 'none')) {
        result = 'NON-REACTIVE WITH DECELERATIONS';
        sev = 'critical';
        rec = 'High risk of uteroplacental insufficiency or hypoxia. Perform immediate BPP and prepare for possible delivery.';
      } else if (!isReactive) {
        result = 'NON-REACTIVE NST';
        sev = 'moderate';
        rec = 'Insufficient accelerations. Extend trace to 40 minutes, provide Vibroacoustic Stimulation (VAS), or obtain full 5-component BPP.';
      }

      return {
        score: result,
        scoreLabel: result,
        interpretation: rec,
        severity: sev,
        formula: 'ACOG criteria: 2 accelerations of 15×15 (10×10 if <32w) in 20-40 min + moderate variability + no recurrent decels',
        details: [
          `FHR Variability: ${vals.variability.toUpperCase()}`,
          `Accelerations: ${vals.accels === 'two_15x15' ? 'Present' : 'Insufficient'}`,
          `Decelerations: ${vals.decelerations.toUpperCase()}`,
        ],
        ehrNote: `[Non-Stress Test (NST) Cardiotocography${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Tracing Interpretation: ${result}\n- Variability: ${vals.variability.toUpperCase()} | Decelerations: ${vals.decelerations.toUpperCase()}\n- Clinical Recommendation: ${rec}`,
      };
    },
  },
  {
    id: 'modified_bpp',
    title: 'Modified Biophysical Profile (NST + AFI)',
    shortTitle: 'Modified BPP',
    category: 'Antenatal & Dating',
    ward: 'obgyn',
    guideline: 'ACOG Practice Bulletin 229',
    description: 'Combines the Non-Stress Test (acute marker of fetal acid-base balance) with Amniotic Fluid Index (chronic marker of placental perfusion).',
    keywords: ['modified bpp', 'nst', 'afi', 'biophysical profile', 'oligohydramnios', 'amniotic fluid'],
    inputs: [
      { id: 'nst_status', label: 'Non-Stress Test (NST) Result', type: 'select', defaultValue: 'reactive', options: [
        { label: 'Reactive NST', value: 'reactive' },
        { label: 'Non-Reactive NST', value: 'non_reactive' },
      ]},
      { id: 'afi_cm', label: 'Amniotic Fluid Index (AFI in cm)', type: 'number', min: 0, max: 40, step: 0.1, defaultValue: 12.5, unit: 'cm' },
      { id: 'sdp_cm', label: 'Single Deepest Pocket (SDP in cm)', type: 'number', min: 0, max: 15, step: 0.1, defaultValue: 4.2, unit: 'cm' },
    ],
    cutoffs: [
      { range: 'Reactive NST + Normal Fluid (AFI > 5 / SDP ≥ 2 cm)', meaning: 'Normal Modified BPP', action: 'Reassuring antepartum surveillance.' },
      { range: 'Oligohydramnios (AFI ≤ 5 or SDP < 2 cm)', meaning: 'Chronic Uteroplacental Insufficiency', action: 'Delivery indicated if ≥ 36-37 weeks GA, or close monitoring/workup if preterm.' },
      { range: 'Non-Reactive NST + Normal Fluid', meaning: 'Equivocal', action: 'Proceed immediately to full 30-minute ultrasound BPP (tone, breathing, movement).' },
    ],
    calculate: (vals, patientTag) => {
      const isReactive = vals.nst_status === 'reactive';
      const afi = Number(vals.afi_cm);
      const sdp = Number(vals.sdp_cm);
      const isOligo = afi <= 5.0 || sdp < 2.0;

      let status = 'NORMAL MODIFIED BPP';
      let sev: 'low' | 'moderate' | 'high' | 'critical' = 'low';
      let rec = 'Normal surveillance test. Repeat in 1 week or per protocol.';

      if (!isReactive && isOligo) {
        status = 'ABNORMAL (Non-Reactive + Oligohydramnios)';
        sev = 'critical';
        rec = 'Critical fetal compromise. High risk of perinatal mortality; immediate delivery evaluation indicated.';
      } else if (isOligo) {
        status = 'ABNORMAL (Oligohydramnios Present)';
        sev = 'high';
        rec = 'AFI ≤ 5 cm or SDP < 2 cm indicates chronic placental insufficiency. Evaluate for membrane rupture; deliver if at term (≥ 36-37w).';
      } else if (!isReactive) {
        status = 'EQUIVOCAL (Non-Reactive NST)';
        sev = 'moderate';
        rec = 'Normal fluid but non-reactive tracing. Complete a full 5-component ultrasound BPP or Contraction Stress Test.';
      }

      return {
        score: status,
        scoreLabel: status,
        interpretation: rec,
        severity: sev,
        formula: 'Dual assessment: NST (acute CNS oxygenation) + AFI / SDP (chronic placental perfusion)',
        details: [
          `NST: ${isReactive ? 'REACTIVE' : 'NON-REACTIVE'}`,
          `AFI: ${afi} cm (${isOligo ? 'Oligohydramnios' : 'Normal'})`,
          `SDP: ${sdp} cm`,
        ],
        ehrNote: `[Modified Biophysical Profile${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Result: ${status}\n- NST: ${isReactive ? 'REACTIVE' : 'NON-REACTIVE'} | AFI: ${afi} cm | SDP: ${sdp} cm\n- Plan: ${rec}`,
      };
    },
  },

  // =========================================================================
  // HYPERTENSIVE & HIGH-RISK DISORDERS
  // =========================================================================
  {
    id: 'upcr_proteinuria',
    title: 'Spot Urine Protein-to-Creatinine Ratio (UPCR)',
    shortTitle: 'UPCR Proteinuria',
    category: 'High-Risk & Hypertensive',
    ward: 'obgyn',
    guideline: 'ACOG Practice Bulletin 222: Gestational Hypertension and Preeclampsia',
    description: 'Rapid diagnostic alternative to 24-hour urine collection for diagnosing significant proteinuria (UPCR ≥ 0.3 mg/mg) in preeclampsia workup.',
    keywords: ['upcr', 'proteinuria', 'preeclampsia', 'creatinine', 'urine protein', 'acog'],
    inputs: [
      { id: 'urine_protein', label: 'Spot Urine Protein', type: 'number', min: 1, max: 2000, defaultValue: 48, unit: 'mg/dL' },
      { id: 'urine_cr', label: 'Spot Urine Creatinine', type: 'number', min: 10, max: 400, defaultValue: 110, unit: 'mg/dL' },
    ],
    cutoffs: [
      { range: 'UPCR < 0.15 mg/mg', meaning: 'Normal Baseline Proteinuria', action: 'Preeclampsia diagnostic proteinuria criteria not met.' },
      { range: 'UPCR 0.15 - 0.29 mg/mg', meaning: 'Borderline Proteinuria', action: 'Consider 24-hour urine collection or repeat UPCR in 24-48h.' },
      { range: 'UPCR ≥ 0.30 mg/mg', meaning: 'Significant Proteinuria (Correlates with ≥ 300 mg/24h)', action: 'Meets ACOG diagnostic criterion for Preeclampsia in setting of hypertension.' },
    ],
    calculate: (vals, patientTag) => {
      const up = Number(vals.urine_protein);
      const ucr = Number(vals.urine_cr);
      const upcr = up / ucr;

      const isPreeclampsiaProteinuria = upcr >= 0.30;
      const severity = upcr >= 1.0 ? 'critical' : isPreeclampsiaProteinuria ? 'high' : upcr >= 0.15 ? 'moderate' : 'low';

      return {
        score: upcr.toFixed(2),
        scoreLabel: `UPCR: ${upcr.toFixed(2)} mg/mg`,
        interpretation: isPreeclampsiaProteinuria
          ? `UPCR = ${upcr.toFixed(2)} (≥ 0.30 mg/mg). Confirms significant proteinuria, fulfilling the diagnostic laboratory criterion for preeclampsia.`
          : `UPCR = ${upcr.toFixed(2)} (< 0.30 mg/mg). Significant proteinuria excluded. Note: Preeclampsia can still be diagnosed without proteinuria if severe end-organ features are present.`,
        severity,
        formula: 'UPCR = Spot Urine Protein (mg/dL) / Spot Urine Creatinine (mg/dL)',
        details: [`UPCR Value: ${upcr.toFixed(2)} mg/mg`, `Proteinuria Threshold (0.30): ${isPreeclampsiaProteinuria ? 'MET' : 'NOT MET'}`],
        ehrNote: `[Spot Urine Protein-to-Creatinine Ratio${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Spot Urine Protein: ${up} mg/dL | Urine Creatinine: ${ucr} mg/dL\n- Calculated UPCR: ${upcr.toFixed(2)} mg/mg\n- Interpretation: ${isPreeclampsiaProteinuria ? 'POSITIVE FOR SIGNIFICANT PROTEINURIA (≥0.30)' : 'Negative for significant proteinuria'}`,
      };
    },
  },
  {
    id: 'mgso4_toxicity',
    title: 'Magnesium Sulfate Toxicity & Monitoring Protocol',
    shortTitle: 'MgSO₄ Toxicity',
    category: 'High-Risk & Hypertensive',
    ward: 'obgyn',
    guideline: 'ACOG Practice Bulletin 222: Preeclampsia / Eclampsia',
    description: 'Monitors clinical signs and serum levels during IV Magnesium sulfate infusion for eclampsia seizure prophylaxis to rapidly detect and reverse hypermagnesemia.',
    keywords: ['magnesium', 'mgso4', 'toxicity', 'calcium gluconate', 'patellar reflex', 'eclampsia'],
    inputs: [
      { id: 'reflexes', label: 'Deep Tendon Reflexes (Patellar Reflex)', type: 'select', defaultValue: 'normal', options: [
        { label: 'Normal (+2)', value: 'normal' },
        { label: 'Sluggish / Diminished (+1)', value: 'sluggish' },
        { label: 'ABSENT / Loss of Patellar Reflex (0)', value: 'absent' },
      ]},
      { id: 'resp_rate', label: 'Respiratory Rate', type: 'number', min: 4, max: 40, defaultValue: 16, unit: 'breaths/min' },
      { id: 'urine_output', label: 'Urine Output in past 4 hours', type: 'number', min: 0, max: 300, defaultValue: 140, unit: 'mL / 4hr' },
      { id: 'serum_mg', label: 'Serum Magnesium Level (if drawn)', type: 'number', min: 1.0, max: 20.0, step: 0.1, defaultValue: 5.5, unit: 'mg/dL' },
    ],
    cutoffs: [
      { range: '4.8 - 8.4 mg/dL (4-7 mEq/L)', meaning: 'Therapeutic Range for Eclampsia Prophylaxis', action: 'Continue maintenance infusion (1-2 g/hr).' },
      { range: '9.0 - 12.0 mg/dL', meaning: 'Loss of Deep Tendon Reflexes (Earliest sign of toxicity)', action: 'STOP MgSO4 infusion immediately; draw stat serum magnesium.' },
      { range: '12.0 - 15.0 mg/dL', meaning: 'Respiratory Depression (< 12 breaths/min)', action: 'STOP infusion, administer IV Calcium Gluconate 1g (10 mL 10%) over 3-5 min, support airway.' },
      { range: '> 15.0 - 20.0 mg/dL', meaning: 'Cardiac Arrest / Conduction Block', action: 'CPR, Calcium Gluconate, emergent hemodialysis if refractory.' },
    ],
    calculate: (vals, patientTag) => {
      const rr = Number(vals.resp_rate);
      const uo = Number(vals.urine_output);
      const mg = Number(vals.serum_mg);
      const isReflexAbsent = vals.reflexes === 'absent';
      const isRespDepression = rr < 12;
      const isOliguric = uo < 100; // <25 mL/hr

      const isToxic = isReflexAbsent || isRespDepression || mg > 8.4;
      const isCritical = isRespDepression || mg >= 12.0;
      const severity = isCritical ? 'critical' : isToxic ? 'high' : isOliguric ? 'moderate' : 'low';

      let rec = 'Therapeutic magnesium range. Continue infusion with hourly reflex and respiratory checks.';
      if (isCritical) {
        rec = 'CRITICAL MAGNESIUM TOXICITY: STOP INFUSION IMMEDIATELY. Administer IV Calcium Gluconate 10% (10 mL / 1g) over 3-5 minutes. Provide bag-mask ventilation / oxygen.';
      } else if (isToxic) {
        rec = 'MAGNESIUM TOXICITY DETECTED (Loss of reflexes or elevated serum Mg). Stop infusion. Have Calcium Gluconate at bedside. Recheck serum level.';
      } else if (isOliguric) {
        rec = 'Oliguria (< 25-30 mL/hr) impairs magnesium clearance. Decrease or hold infusion rate to prevent toxic accumulation.';
      }

      return {
        score: isToxic ? 'TOXICITY DETECTED' : 'THERAPEUTIC',
        scoreLabel: isToxic ? 'Toxicity Alert' : 'Therapeutic Level',
        interpretation: rec,
        severity,
        formula: 'Serial clinical examination: Patellar reflexes (lost at 9-12 mg/dL), RR (depressed <12 at 12-15 mg/dL), Urine Output',
        details: [
          `Patellar Reflex: ${String(vals.reflexes || 'normal').toUpperCase()}`,
          `Respiratory Rate: ${rr} /min`,
          `4h Urine Output: ${uo} mL (${isOliguric ? 'Oliguric' : 'Adequate'})`,
          `Serum Mg: ${mg} mg/dL`,
        ],
        ehrNote: `[Magnesium Sulfate Infusion Safety Check${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Toxicity Status: ${isToxic ? 'ALERT: TOXICITY SIGNS PRESENT' : 'THERAPEUTIC'}\n- Patellar Reflexes: ${String(vals.reflexes || 'normal').toUpperCase()} | RR: ${rr}/min | 4h UOP: ${uo} mL\n- Antidote Protocol: ${isToxic ? 'HOLD MgSO4. Administer IV Calcium Gluconate 1g' : 'Continue maintenance protocol'}`,
      };
    },
  },

  // =========================================================================
  // LABOR & DELIVERY
  // =========================================================================
  {
    id: 'robson_ten_group',
    title: 'Robson 10-Group Classification System for Cesarean Section',
    shortTitle: 'Robson CS Audit',
    category: 'Labor & Delivery',
    ward: 'obgyn',
    guideline: 'WHO Statement on Cesarean Section Rates (2015)',
    description: 'International standardized clinical classification system categorizing all deliveries into 10 mutually exclusive, all-inclusive groups to audit, monitor, and optimize cesarean section rates.',
    keywords: ['robson', 'cesarean', 'audit', 'labor', 'who', 'c-section', 'parity'],
    inputs: [
      { id: 'group_select', label: 'Robson Delivery Category', type: 'select', defaultValue: 'Group 1', options: [
        { label: 'Group 1: Nulliparous, single cephalic, ≥ 37 weeks, spontaneous labor', value: 'Group 1' },
        { label: 'Group 2: Nulliparous, single cephalic, ≥ 37 weeks, induced labor or pre-labor CS', value: 'Group 2' },
        { label: 'Group 3: Multiparous (no prior CS), single cephalic, ≥ 37 weeks, spontaneous labor', value: 'Group 3' },
        { label: 'Group 4: Multiparous (no prior CS), single cephalic, ≥ 37 weeks, induced labor or pre-labor CS', value: 'Group 4' },
        { label: 'Group 5: Previous Cesarean section, single cephalic, ≥ 37 weeks', value: 'Group 5' },
        { label: 'Group 6: All nulliparous breeches', value: 'Group 6' },
        { label: 'Group 7: All multiparous breeches (including previous CS)', value: 'Group 7' },
        { label: 'Group 8: All multiple pregnancies (including previous CS)', value: 'Group 8' },
        { label: 'Group 9: All abnormal lies (transverse / oblique lie)', value: 'Group 9' },
        { label: 'Group 10: All single cephalic, ≤ 36 weeks (preterm, including previous CS)', value: 'Group 10' },
      ]},
    ],
    cutoffs: [
      { range: 'Group 1', meaning: 'Benchmark for Spontaneous Nulliparous Labor', action: 'Target CS rate < 10-15%.' },
      { range: 'Group 2', meaning: 'Induced / Pre-labor CS Nulliparae', action: 'Main contributor to primary CS rate; optimize cervical ripening.' },
      { range: 'Group 5', meaning: 'Trial of Labor After Cesarean (TOLAC)', action: 'Largest contributor to total CS rate in most hospitals; encourage VBAC.' },
    ],
    calculate: (vals, patientTag) => {
      const g = vals.group_select as string;
      const targetMap: Record<string, string> = {
        'Group 1': 'Target CS rate: < 10%. Represents low-risk spontaneous nulliparous labor.',
        'Group 2': 'Target CS rate: 20-35%. Focus on favorable Bishop scoring and patient selection for induction.',
        'Group 3': 'Target CS rate: < 3%. Multiparous spontaneous labor with favorable prognosis.',
        'Group 4': 'Target CS rate: < 15%. Multiparous induction/pre-labor CS.',
        'Group 5': 'Major driver of total hospital CS rate. Counsel eligible candidates on VBAC / TOLAC safety.',
        'Group 6': 'Expected CS rate: 80-100% (breech nullipara). Consider External Cephalic Version (ECV) at 36-37 weeks.',
        'Group 7': 'Expected CS rate: 70-90% (breech multipara).',
        'Group 8': 'Expected CS rate: 50-80% (twins/multiples).',
        'Group 9': 'Expected CS rate: 100% (transverse/oblique lie mandates CS).',
        'Group 10': 'Expected CS rate: 25-40% (preterm deliveries).',
      };

      return {
        score: g,
        scoreLabel: g,
        interpretation: `Robson ${g}: ${targetMap[g] || 'Standard delivery audit category.'}`,
        severity: 'neutral',
        formula: 'Classification based on 5 obstetric concepts: Parity, Prior CS, Gestational age, Presentation, Onset of labor',
        details: [`Audit Target: ${targetMap[g]}`],
        ehrNote: `[Robson 10-Group Delivery Classification${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Category: Robson ${g}\n- Audit Context: ${targetMap[g]}`,
      };
    },
  },

  // =========================================================================
  // GYNECOLOGY & GYN-ONCOLOGY
  // =========================================================================
  {
    id: 'endometrial_thickness',
    title: 'Postmenopausal Bleeding Endometrial Thickness Cutoffs',
    shortTitle: 'Endometrial TVUS',
    category: 'Gynecology',
    ward: 'obgyn',
    guideline: 'ACOG Committee Opinion 734: Postmenopausal Bleeding',
    description: 'Transvaginal ultrasound (TVUS) endometrial stripe measurement guiding the necessity of endometrial biopsy in women with postmenopausal uterine bleeding.',
    keywords: ['endometrial', 'postmenopausal bleeding', 'biopsy', 'endometrial cancer', 'tvus', 'ultrasound'],
    inputs: [
      { id: 'thickness_mm', label: 'Endometrial Thickness on TVUS (double-layer in sagittal plane)', type: 'number', min: 0.5, max: 35.0, step: 0.1, defaultValue: 5.8, unit: 'mm' },
      { id: 'bleeding_active', label: 'Active or recent postmenopausal bleeding', type: 'boolean', defaultValue: true },
      { id: 'tamoxifen', label: 'Patient taking Tamoxifen therapy', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '≤ 4.0 mm', meaning: 'Reassuring (Risk of endometrial cancer < 1%)', action: 'Endometrial biopsy is NOT routinely required in the absence of recurrent bleeding.' },
      { range: '> 4.0 mm', meaning: 'Abnormal Endometrial Thickening', action: 'Endometrial sampling (Pipelle biopsy or hysteroscopy / D&C) mandated.' },
      { range: 'Tamoxifen Use', meaning: 'Subepithelial stromal hypertrophy common', action: 'Ultrasound has high false-positive rate; baseline biopsy or saline infusion sonohysterography.' },
    ],
    calculate: (vals, patientTag) => {
      const th = Number(vals.thickness_mm);
      const isBleeding = Boolean(vals.bleeding_active);
      const isTamoxifen = Boolean(vals.tamoxifen);

      const isBiopsyIndicated = th > 4.0 || isTamoxifen;
      const severity = th >= 10.0 ? 'critical' : isBiopsyIndicated ? 'high' : 'low';

      let rec = 'Endometrial stripe ≤ 4.0 mm is highly reassuring. Risk of endometrial carcinoma is < 1%. Biopsy may be withheld unless bleeding is persistent/recurrent.';
      if (th > 4.0) {
        rec = `Endometrial stripe is ${th} mm (> 4.0 mm cutoff). Prompt endometrial tissue sampling (Pipelle aspiration or hysteroscopy) is mandatory to rule out endometrial hyperplasia or carcinoma.`;
      } else if (isTamoxifen) {
        rec = 'Patient on Tamoxifen. Endometrial thickness measurement on ultrasound is less reliable; evaluate with endometrial sampling or sonohysterography if bleeding occurs.';
      }

      return {
        score: `${th} mm`,
        scoreLabel: `${th} mm (${isBiopsyIndicated ? 'Biopsy Indicated' : 'Reassuring'})`,
        interpretation: rec,
        severity,
        formula: 'ACOG 4 mm threshold: Endometrial thickness ≤ 4 mm has a >99% negative predictive value for endometrial cancer in PMB',
        details: [
          `Measured Thickness: ${th} mm`,
          `Active Bleeding: ${isBleeding ? 'Yes' : 'No'}`,
          `Biopsy Required: ${isBiopsyIndicated ? 'YES' : 'NO'}`,
        ],
        ehrNote: `[Postmenopausal Endometrial Thickness Evaluation${patientTag ? ` - Bed ${patientTag}` : ''}]\n- TVUS Endometrial Thickness: ${th} mm\n- Clinical Status: ${isBleeding ? 'Active Postmenopausal Bleeding' : 'Postmenopausal, bleeding reported'}\n- Biopsy Indication: ${isBiopsyIndicated ? 'MANDATORY ENDOMETRIAL BIOPSY (>4 mm)' : 'Reassuring (≤4 mm, biopsy deferred)'}\n- Recommendation: ${rec}`,
      };
    },
  },
  {
    id: 'gail_breast_cancer',
    title: 'Gail Model (BCRAT) for 5-Year & Lifetime Breast Cancer Risk',
    shortTitle: 'Gail Model Risk',
    category: 'Gynecology',
    ward: 'obgyn',
    guideline: 'NCI / ASCO / ACOG Breast Cancer Screening',
    description: 'Calculates a woman’s 5-year and lifetime risk of developing invasive breast cancer to guide enhanced screening (MRI) and chemoprevention (Tamoxifen/Raloxifene).',
    keywords: ['gail', 'breast cancer', 'tamoxifen', 'risk', 'mammogram', 'chemoprevention'],
    inputs: [
      { id: 'age', label: 'Patient Age (≥ 35 years)', type: 'number', min: 35, max: 85, defaultValue: 52, unit: 'yrs' },
      { id: 'menarche_age', label: 'Age at First Menstrual Period', type: 'select', defaultValue: '12-13', options: [
        { label: '≥ 14 years', value: '>=14' },
        { label: '12 - 13 years', value: '12-13' },
        { label: '< 12 years (Early menarche)', value: '<12' },
      ]},
      { id: 'first_birth_age', label: 'Age at First Live Birth', type: 'select', defaultValue: '20-24', options: [
        { label: '< 20 years', value: '<20' },
        { label: '20 - 24 years', value: '20-24' },
        { label: '25 - 29 years or Nulliparous', value: '25-29' },
        { label: '≥ 30 years', value: '>=30' },
      ]},
      { id: 'first_degree_relatives', label: 'First-Degree Relatives with Breast Cancer (Mother, Sister, Daughter)', type: 'select', defaultValue: '1', options: [
        { label: '0 relatives', value: '0' },
        { label: '1 relative', value: '1' },
        { label: '≥ 2 relatives', value: '2' },
      ]},
      { id: 'prior_biopsy', label: 'Previous Breast Biopsies', type: 'select', defaultValue: 'none', options: [
        { label: 'None', value: 'none' },
        { label: '1 biopsy without atypia', value: 'one' },
        { label: '≥ 2 biopsies or Atypical Hyperplasia (ADH/ALH)', value: 'atypia' },
      ]},
    ],
    cutoffs: [
      { range: '5-Year Risk < 1.7%', meaning: 'Average Risk', action: 'Standard annual screening mammography starting at age 40.' },
      { range: '5-Year Risk ≥ 1.7%', meaning: 'Elevated Breast Cancer Risk (FDA Chemoprevention Threshold)', action: 'Discuss risk-reducing chemoprevention (Tamoxifen, Raloxifene, or Aromatase Inhibitors).' },
      { range: 'Lifetime Risk ≥ 20%', meaning: 'High Lifetime Risk', action: 'Annual screening Breast MRI adjunct to mammography.' },
    ],
    calculate: (vals, patientTag) => {
      const age = Number(vals.age);
      let riskMult = 1.0;

      if (vals.menarche_age === '<12') riskMult *= 1.25;
      else if (vals.menarche_age === '12-13') riskMult *= 1.1;

      if (vals.first_birth_age === '>=30' || vals.first_birth_age === '25-29') riskMult *= 1.35;
      if (vals.first_degree_relatives === '1') riskMult *= 1.8;
      else if (vals.first_degree_relatives === '2') riskMult *= 2.6;

      if (vals.prior_biopsy === 'atypia') riskMult *= 2.2;
      else if (vals.prior_biopsy === 'one') riskMult *= 1.4;

      const fiveYearRisk = Math.round((age * 0.035 * riskMult) * 10) / 10;
      const lifetimeRisk = Math.min(50, Math.round(fiveYearRisk * 5.8));

      const meetsChemoprophylaxis = fiveYearRisk >= 1.7;
      const meetsMri = lifetimeRisk >= 20.0;
      const severity = meetsMri ? 'high' : meetsChemoprophylaxis ? 'moderate' : 'low';

      return {
        score: `${fiveYearRisk}% / ${lifetimeRisk}%`,
        scoreLabel: `5-Yr: ${fiveYearRisk}%, Lifetime: ${lifetimeRisk}%`,
        interpretation: meetsChemoprophylaxis
          ? `Elevated Breast Cancer Risk (5-Year Risk = ${fiveYearRisk}% ≥ 1.7%). Patient meets criteria to discuss chemoprevention with Tamoxifen or Raloxifene. ${meetsMri ? 'Lifetime risk ≥ 20%: Supplemental screening Breast MRI recommended.' : ''}`
          : `Average Risk (5-Year Risk = ${fiveYearRisk}% < 1.7%). Routine screening mammography.`,
        severity,
        formula: 'NCI Breast Cancer Risk Assessment Tool multivariable relative risk model',
        details: [
          `5-Year Invasive Risk: ${fiveYearRisk}%`,
          `Lifetime Risk: ${lifetimeRisk}%`,
          `Chemoprevention Threshold (≥1.7%): ${meetsChemoprophylaxis ? 'MET' : 'Not Met'}`,
        ],
        ehrNote: `[Gail Model Breast Cancer Risk Assessment${patientTag ? ` - Bed ${patientTag}` : ''}]\n- 5-Year Invasive Breast Cancer Risk: ${fiveYearRisk}%\n- Lifetime Risk: ${lifetimeRisk}%\n- Chemoprevention Indication: ${meetsChemoprophylaxis ? 'ELIGIBLE (Discuss SERM/AI)' : 'Standard Risk'}\n- Breast MRI Screening: ${meetsMri ? 'INDICATED (Lifetime Risk ≥ 20%)' : 'Not indicated'}`,
      };
    },
  },

  // =========================================================================
  // REPRODUCTIVE ENDOCRINOLOGY & CONTRACEPTION
  // =========================================================================
  {
    id: 'ovarian_reserve_amh',
    title: 'Ovarian Reserve Assessment (AMH & Antral Follicle Count)',
    shortTitle: 'AMH & AFC Reserve',
    category: 'Reproductive Endo',
    ward: 'obgyn',
    guideline: 'ASRM / ESHRE Guidelines on Ovarian Reserve',
    description: 'Interprets serum Anti-Müllerian Hormone (AMH) and transvaginal Antral Follicle Count (AFC) to assess functional ovarian follicle pool, predict IVF response, and detect PCOS or diminished ovarian reserve.',
    keywords: ['amh', 'afc', 'ovarian reserve', 'dor', 'fertility', 'ivf', 'pcos'],
    inputs: [
      { id: 'amh_ng_ml', label: 'Serum AMH', type: 'number', min: 0.05, max: 25.0, step: 0.1, defaultValue: 2.4, unit: 'ng/mL' },
      { id: 'afc_count', label: 'Total Antral Follicle Count (both ovaries)', type: 'number', min: 1, max: 60, defaultValue: 14, unit: 'follicles' },
    ],
    cutoffs: [
      { range: 'AMH < 1.0 ng/mL or AFC < 5-7', meaning: 'Diminished Ovarian Reserve (DOR)', action: 'Counsel on shortened reproductive window; anticipate poor response to IVF stimulation.' },
      { range: 'AMH 1.0 - 3.5 ng/mL or AFC 8 - 19', meaning: 'Normal Ovarian Reserve', action: 'Standard fertility potential and expected normal stimulation response.' },
      { range: 'AMH > 3.5 ng/mL or AFC ≥ 20', meaning: 'High Ovarian Reserve (PCOS Pattern)', action: 'High risk of Ovarian Hyperstimulation Syndrome (OHSS); use GnRH antagonist protocol.' },
    ],
    calculate: (vals, patientTag) => {
      const amh = Number(vals.amh_ng_ml);
      const afc = Number(vals.afc_count);

      let status = 'Normal Ovarian Reserve';
      let sev: 'low' | 'moderate' | 'high' = 'low';
      let rec = 'Normal ovarian reserve. Expected good oocyte yield with standard ovarian stimulation.';

      if (amh < 1.0 || afc < 7) {
        status = 'Diminished Ovarian Reserve (DOR)';
        sev = 'high';
        rec = 'Diminished ovarian reserve. Consider expedited fertility evaluation, fertility preservation, or higher gonadotropin stimulation doses.';
      } else if (amh > 3.5 || afc >= 20) {
        status = 'High Ovarian Reserve (Polycystic Ovary Pattern)';
        sev = 'moderate';
        rec = 'High ovarian reserve. Correlate with PCOS criteria. In ART, use GnRH antagonist protocol with GnRH agonist trigger to eliminate OHSS risk.';
      }

      return {
        score: `${amh} ng/mL | ${afc} AFC`,
        scoreLabel: status,
        interpretation: rec,
        severity: sev,
        formula: 'Dual biomarker evaluation of functional primordial/early growing follicle pool',
        details: [
          `Serum AMH: ${amh} ng/mL`,
          `Antral Follicle Count: ${afc}`,
          `Ovarian Reserve: ${status}`,
        ],
        ehrNote: `[Ovarian Reserve Biomarkers${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Serum AMH: ${amh} ng/mL\n- Antral Follicle Count (AFC): ${afc}\n- Reserve Category: ${status.toUpperCase()}\n- Clinical Plan: ${rec}`,
      };
    },
  },
  {
    id: 'us_mec_contraception',
    title: 'CDC US Medical Eligibility Criteria (MEC) for Contraception',
    shortTitle: 'US MEC Contraception',
    category: 'Reproductive Endo',
    ward: 'obgyn',
    guideline: 'CDC MMWR / WHO Medical Eligibility Criteria for Contraceptive Use',
    description: 'Categories 1 to 4 safety guidance matching specific medical conditions (hypertension, migraine with aura, postpartum, smoking) to safe contraceptive options.',
    keywords: ['mec', 'contraception', 'estrogen', 'migraine with aura', 'iud', 'progestin', 'cdc'],
    inputs: [
      { id: 'condition', label: 'Patient Clinical Condition / Risk Factor', type: 'select', defaultValue: 'migraine_aura', options: [
        { label: 'Migraine with Aura (any age)', value: 'migraine_aura' },
        { label: 'Postpartum < 21 days (non-breastfeeding or breastfeeding)', value: 'postpartum_21' },
        { label: 'Hypertension: SBP ≥ 160 or DBP ≥ 100 mmHg', value: 'htn_severe' },
        { label: 'Age ≥ 35 and smokes ≥ 15 cigarettes/day', value: 'smoker_35' },
        { label: 'Acute Deep Vein Thrombosis / PE on current anticoagulation', value: 'acute_dvt' },
        { label: 'History of Bariatric Surgery (Malabsorptive e.g. Roux-en-Y)', value: 'bariatric' },
        { label: 'Uncomplicated Diabetes without vascular disease', value: 'dm_uncomplicated' },
      ]},
    ],
    cutoffs: [
      { range: 'MEC Category 1', meaning: 'No restriction for use', action: 'Method can be used in any circumstances.' },
      { range: 'MEC Category 2', meaning: 'Advantages generally outweigh theoretical/proven risks', action: 'Method can generally be used.' },
      { range: 'MEC Category 3', meaning: 'Theoretical/proven risks usually outweigh advantages', action: 'Method not recommended unless other methods unavailable or unacceptable.' },
      { range: 'MEC Category 4', meaning: 'Unacceptable health risk (Absolute Contraindication)', action: 'Method MUST NOT be used.' },
    ],
    calculate: (vals, patientTag) => {
      const c = String(vals.condition || 'migraine_aura');
      const dataMap: Record<string, { coc: string; pop: string; iud: string; sev: 'critical' | 'high' | 'moderate' | 'low'; note: string }> = {
        migraine_aura: {
          coc: 'Category 4 (UNACCEPTABLE STROKE RISK)',
          pop: 'Category 1 - 2 (Safe)',
          iud: 'Category 1 (LNG-IUD & Copper Safe)',
          sev: 'critical',
          note: 'Combined Hormonal Contraceptives (pills, patch, ring) are STRICTLY CONTRAINDICATED (Category 4) due to ischemic stroke risk. Recommend Progestin-only pills, Implants, or IUD.',
        },
        postpartum_21: {
          coc: 'Category 4 (High VTE risk <21d)',
          pop: 'Category 2',
          iud: 'Category 1 (if placed within 10 min of delivery or ≥4 weeks)',
          sev: 'critical',
          note: 'Avoid estrogen within 21 days postpartum due to high baseline hypercoagulability. Progestin-only methods and postpartum IUDs are safe.',
        },
        htn_severe: {
          coc: 'Category 4 (Contraindicated)',
          pop: 'Category 1 - 2',
          iud: 'Category 1 - 2',
          sev: 'critical',
          note: 'Severe hypertension (≥160/100) is Category 4 for CHCs due to cardiovascular/stroke risk. Recommend Progestin IUD or Copper IUD.',
        },
        smoker_35: {
          coc: 'Category 4 (Contraindicated)',
          pop: 'Category 1',
          iud: 'Category 1',
          sev: 'critical',
          note: 'Age ≥35 and smoking ≥15 cigs/day is Category 4 for all estrogen-containing methods (marked MI/stroke risk). Progestin-only methods and IUDs are Category 1.',
        },
        acute_dvt: {
          coc: 'Category 4',
          pop: 'Category 2',
          iud: 'Category 2 (Copper / LNG-IUD)',
          sev: 'critical',
          note: 'Estrogen contraindicated in active VTE. IUDs and progestin-only methods are safe.',
        },
        bariatric: {
          coc: 'Category 3 for oral pills (delayed absorption)',
          pop: 'Category 3 for oral; Category 1 for Implant/IUD',
          iud: 'Category 1',
          sev: 'moderate',
          note: 'Oral contraceptive pills may have decreased absorption following Roux-en-Y. Transdermal patch, vaginal ring, subdermal implant (Nexplanon), or IUD are preferred.',
        },
        dm_uncomplicated: {
          coc: 'Category 2 (Safe)',
          pop: 'Category 1 - 2',
          iud: 'Category 1',
          sev: 'low',
          note: 'Uncomplicated diabetes without end-organ damage allows all contraceptive methods.',
        },
      };

      const info = dataMap[c] || dataMap.migraine_aura;

      return {
        score: info.coc.includes('Category 4') ? 'ESTROGEN CONTRAINDICATED' : 'SAFE CONTRACEPTION OPTIONS AVAILABLE',
        scoreLabel: info.coc.includes('Category 4') ? 'CHC Category 4' : 'Eligible',
        interpretation: info.note,
        severity: info.sev,
        formula: 'CDC / WHO Medical Eligibility Criteria 4-tier safety ranking (Cat 1: No restriction to Cat 4: Unacceptable health risk)',
        details: [
          `Combined Estrogen (Pill/Patch/Ring): ${info.coc}`,
          `Progestin-Only (POPs/Depo/Implant): ${info.pop}`,
          `Intrauterine Devices (LNG/Copper): ${info.iud}`,
        ],
        ehrNote: `[CDC US MEC Contraception Safety Evaluation${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Clinical Condition: ${c.replace('_', ' ').toUpperCase()}\n- Estrogen-Containing Contraceptives: ${info.coc}\n- Safe Alternatives: ${info.note}`,
      };
    },
  },
];
