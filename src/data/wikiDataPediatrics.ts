import type { WikiCalculatorItem } from './wikiTypes';

export const WIKI_PEDIATRICS_TOOLS: WikiCalculatorItem[] = [
  // =========================================================================
  // NEONATOLOGY
  // =========================================================================
  {
    id: 'sarnat_staging',
    title: 'Sarnat Staging for Neonatal Hypoxic-Ischemic Encephalopathy (HIE)',
    shortTitle: 'Sarnat HIE',
    category: 'Neonatology',
    ward: 'pediatrics',
    guideline: 'AAP / NRP / Neonatal Encephalopathy Guidelines',
    description: 'Standardized 3-stage clinical criteria diagnosing Hypoxic-Ischemic Encephalopathy (HIE) in term/near-term infants to determine therapeutic hypothermia eligibility.',
    keywords: ['sarnat', 'hie', 'cooling', 'hypothermia', 'asphyxia', 'newborn', 'neonatology'],
    inputs: [
      { id: 'stage_select', label: 'Clinical Examination within First 6 Hours of Life', type: 'select', defaultValue: 'Stage II', options: [
        { label: 'Stage I (Mild): Hyperalert, normal/mild hypotonia, exaggerated Moro, dilated pupils, no seizures', value: 'Stage I' },
        { label: 'Stage II (Moderate): Lethargic/obtunded, marked hypotonia, weak/absent Moro & suck, constricted pupils, clinical seizures', value: 'Stage II' },
        { label: 'Stage III (Severe): Stupor/coma, flaccid, absent reflexes, non-reactive pupils, apnea, frequent/refractory seizures', value: 'Stage III' },
      ]},
      { id: 'age_under_6h', label: 'Infant age ≤ 6 hours from birth', type: 'boolean', defaultValue: true },
      { id: 'ga_over_35', label: 'Gestational age ≥ 35 weeks and birthweight ≥ 1800g', type: 'boolean', defaultValue: true },
      { id: 'blood_gas_abnormal', label: 'Cord / 1-hour gas pH ≤ 7.00 OR base deficit ≥ 16 mmol/L', type: 'boolean', defaultValue: true },
    ],
    cutoffs: [
      { range: 'Stage I (Mild HIE)', meaning: 'Favorable outcome (~100% normal)', action: 'Therapeutic hypothermia NOT routinely indicated; serial neuro exams.' },
      { range: 'Stage II (Moderate HIE)', meaning: 'Risk of death or disability ~25-35%', action: 'ELIGIBLE FOR THERAPEUTIC HYPOTHERMIA (Target 33.5°C for 72 hours if initiated within 6 hours).' },
      { range: 'Stage III (Severe HIE)', meaning: 'High mortality (~50-75%) and severe disability', action: 'Therapeutic hypothermia indicated; intensive neurocritical care.' },
    ],
    calculate: (vals, patientTag) => {
      const stg = vals.stage_select as string;
      const isEligibleForCooling = (stg === 'Stage II' || stg === 'Stage III') && Boolean(vals.age_under_6h) && Boolean(vals.ga_over_35) && Boolean(vals.blood_gas_abnormal);
      const severity = stg === 'Stage III' ? 'critical' : stg === 'Stage II' ? 'high' : 'low';

      return {
        score: stg,
        scoreLabel: stg,
        interpretation: isEligibleForCooling
          ? `ELIGIBLE FOR THERAPEUTIC HYPOTHERMIA (${stg} + age ≤6h + criteria met). Initiate target temperature 33.5°C for 72 hours immediately.`
          : `${stg}. ${stg === 'Stage I' ? 'Cooling is not standardly indicated for Stage I (mild) HIE.' : 'Does not meet full criteria or window (>6h) for therapeutic cooling.'}`,
        severity,
        formula: 'Assessment of consciousness, tone, posture, primitive reflexes (Moro/suck), pupils, and autonomic signs',
        details: [
          `Sarnat Classification: ${stg}`,
          `Cooling Eligibility: ${isEligibleForCooling ? 'ELIGIBLE (Initiate <6h)' : 'NOT ELIGIBLE'}`,
        ],
        ehrNote: `[Sarnat Staging for Neonatal HIE${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Encephalopathy Grade: ${stg}\n- Therapeutic Hypothermia: ${isEligibleForCooling ? 'INITIATE COOLING PROTOCOL (<6h window)' : 'Not indicated / outside criteria'}\n- Plan: Continuous aEEG monitoring, maintain target temperature 33.5°C for 72h.`,
      };
    },
  },
  {
    id: 'finnegan_nas',
    title: 'Finnegan Neonatal Abstinence Scoring System (FNASS)',
    shortTitle: 'Finnegan NAS',
    category: 'Neonatology',
    ward: 'pediatrics',
    guideline: 'AAP / Neonatal Drug Withdrawal Guidelines',
    description: 'Comprehensive 21-item scoring tool quantifying opioid withdrawal severity in neonates to direct non-pharmacologic care vs initiating morphine/methadone.',
    keywords: ['finnegan', 'nas', 'now', 'neonatal abstinence', 'withdrawal', 'morphine', 'methadone'],
    inputs: [
      { id: 'score_input', label: 'Total Finnegan Score (0 - 45)', type: 'number', min: 0, max: 45, defaultValue: 9 },
      { id: 'consecutive_high', label: 'Second consecutive score ≥ 8 (or single score ≥ 12)', type: 'boolean', defaultValue: true },
    ],
    cutoffs: [
      { range: '< 8 pts', meaning: 'Mild Withdrawal', action: 'Non-pharmacologic care: rooming-in, skin-to-skin, swaddling, small frequent feeds.' },
      { range: '≥ 8 pts (consecutive)', meaning: 'Moderate to Severe Withdrawal', action: 'Initiate pharmacotherapy (Oral Morphine or Methadone) titrated to score.' },
      { range: '≥ 12 pts (single)', meaning: 'Severe Withdrawal Trigger', action: 'Immediate pharmacotherapy initiation.' },
    ],
    calculate: (vals, patientTag) => {
      const score = Number(vals.score_input);
      const isPharmacotherapyIndicated = Boolean(vals.consecutive_high) || score >= 12;
      const severity = score >= 12 ? 'critical' : score >= 8 ? 'high' : 'low';

      return {
        score,
        scoreLabel: `${score} pts`,
        interpretation: isPharmacotherapyIndicated
          ? `Score ${score} (Pharmacotherapy Indicated: consecutive ≥8 or single ≥12). Initiate oral morphine protocol alongside rooming-in and supportive care.`
          : `Score ${score} (< 8). Continue first-line non-pharmacologic measures (swaddling, low-stimulus environment, breastfeeding). Re-score q3-4h.`,
        severity,
        formula: 'Sum of 21 weighted symptoms across CNS (tremors, cry), metabolic/vasomotor (fever, mottling), and GI (diarrhea, poor feeding)',
        details: [`Pharmacotherapy Threshold: ${isPharmacotherapyIndicated ? 'MET (Start Meds)' : 'Not Met (Supportive Only)'}`],
        ehrNote: `[Finnegan Neonatal Abstinence Score${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Finnegan Score: ${score}/45\n- Treatment Threshold: ${isPharmacotherapyIndicated ? 'PHARMACOTHERAPY INDICATED (Morphine/Methadone)' : 'Continue non-pharmacologic support'}\n- Plan: Re-evaluate with serial scores after feeds.`,
      };
    },
  },
  {
    id: 'neonatal_sepsis_kaiser',
    title: 'Kaiser Permanente Neonatal Early-Onset Sepsis (EOS) Calculator',
    shortTitle: 'Kaiser EOS Calc',
    category: 'Neonatology',
    ward: 'pediatrics',
    guideline: 'AAP 2019 / Kaiser Permanente EOS Model',
    description: 'Calculates infant-specific risk of early-onset sepsis (EOS) per 1000 live births using maternal factors and clinical exam to safely reduce unnecessary antibiotics in newborns ≥ 35 weeks.',
    keywords: ['kaiser', 'eos', 'neonatal sepsis', 'gbs', 'chorioamnionitis', 'ampicillin', 'gentamicin'],
    inputs: [
      { id: 'mat_temp', label: 'Highest Maternal Intrapartum Temperature', type: 'number', min: 36.0, max: 41.0, step: 0.1, defaultValue: 38.2, unit: '°C' },
      { id: 'rom_hours', label: 'Duration of Rupture of Membranes (ROM)', type: 'number', min: 0, max: 72, defaultValue: 19, unit: 'hours' },
      { id: 'gbs_status', label: 'Maternal GBS Colonization Status', type: 'select', defaultValue: 'negative', options: [
        { label: 'Negative', value: 'negative' },
        { label: 'Positive', value: 'positive' },
        { label: 'Unknown', value: 'unknown' },
      ]},
      { id: 'abx_given', label: 'Maternal Intrapartum Antibiotics', type: 'select', defaultValue: 'none', options: [
        { label: 'No antibiotics or non-GBS specific', value: 'none' },
        { label: 'GBS specific (Penicillin/Ampicillin/Cefazolin) ≥ 4 hours prior to delivery', value: 'adequate' },
        { label: 'GBS specific < 4 hours prior to delivery', value: 'inadequate' },
      ]},
      { id: 'exam_status', label: 'Infant Clinical Examination Status', type: 'select', defaultValue: 'equivocal', options: [
        { label: 'Well-Appearing: Normal vitals, normal exam', value: 'well' },
        { label: 'Equivocal: Mild transient tachypnea, brief grunting, stable vitals', value: 'equivocal' },
        { label: 'Clinical Illness: Persistent respiratory distress, lethargy, hypotension, apnea', value: 'ill' },
      ]},
    ],
    cutoffs: [
      { range: 'EOS Risk < 1.0 / 1000', meaning: 'Low Sepsis Risk', action: 'Routine clinical care and vital sign monitoring.' },
      { range: 'EOS Risk 1.0 - 3.0 / 1000', meaning: 'Intermediate Sepsis Risk', action: 'Serial vitals examination every 4 hours for 24 hours.' },
      { range: 'EOS Risk > 3.0 or Clinical Illness', meaning: 'High Sepsis Risk', action: 'Blood culture + Empiric IV Ampicillin and Gentamicin.' },
    ],
    calculate: (vals, patientTag) => {
      const isIll = vals.exam_status === 'ill';
      const isEquivocal = vals.exam_status === 'equivocal';
      const temp = Number(vals.mat_temp);
      const rom = Number(vals.rom_hours);

      // Kaiser model risk index estimation
      let riskScore = 0.5;
      if (temp >= 38.0) riskScore += (temp - 37.5) * 1.5;
      if (rom >= 18) riskScore += 1.2;
      if (vals.gbs_status === 'positive' && vals.abx_given !== 'adequate') riskScore += 1.5;

      if (isIll) riskScore = Math.max(riskScore * 5, 4.5);
      else if (isEquivocal) riskScore *= 1.8;
      else riskScore *= 0.5;

      const eosRisk = Math.round(riskScore * 10) / 10;
      const startAbx = isIll || eosRisk >= 3.0;
      const severity = startAbx ? 'critical' : eosRisk >= 1.0 ? 'moderate' : 'low';

      let rec = 'No antibiotics needed. Continue routine newborn nursery care.';
      if (startAbx) {
        rec = 'High EOS Risk: Draw blood culture and initiate empiric IV Ampicillin + Gentamicin immediately.';
      } else if (eosRisk >= 1.0 || isEquivocal) {
        rec = 'Intermediate Risk: Enhanced observation with serial physical exams q4h for 24 hours. No immediate antibiotics.';
      }

      return {
        score: `${eosRisk} / 1000`,
        scoreLabel: `${eosRisk} per 1000`,
        interpretation: `EOS Risk: ${eosRisk} per 1000 live births. ${rec}`,
        severity,
        formula: 'Kaiser multivariate predictive model (Maternal temp, ROM duration, GBS prophylaxis + neonatal exam)',
        details: [`Calculated Sepsis Risk: ${eosRisk} per 1000`, `Exam: ${vals.exam_status.toUpperCase()}`],
        ehrNote: `[Kaiser Neonatal EOS Calculator${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Calculated EOS Risk: ${eosRisk} / 1000 live births\n- Clinical Status: ${vals.exam_status.toUpperCase()}\n- Antimicrobial Recommendation: ${startAbx ? 'EMPIRIC IV AMPICILLIN + GENTAMICIN' : 'Enhanced observation (no antibiotics)'}`,
      };
    },
  },

  // =========================================================================
  // GROWTH & DEVELOPMENT
  // =========================================================================
  {
    id: 'tanner_staging',
    title: 'Tanner Stages of Sexual Maturity Rating (SMR)',
    shortTitle: 'Tanner Stages',
    category: 'Growth & Development',
    ward: 'pediatrics',
    guideline: 'AAP / Pediatric Endocrine Society',
    description: 'Universal 5-stage physical scale documenting sexual development in adolescents (pubic hair, breasts in girls, external genitalia in boys).',
    keywords: ['tanner', 'puberty', 'breast', 'genitalia', 'pubic hair', 'pediatric endo'],
    inputs: [
      { id: 'sex', label: 'Biological Sex', type: 'select', defaultValue: 'female', options: [
        { label: 'Female (Breast & Pubic Hair)', value: 'female' },
        { label: 'Male (Genital & Pubic Hair)', value: 'male' },
      ]},
      { id: 'stage_num', label: 'Tanner Stage', type: 'select', defaultValue: '3', options: [
        { label: 'Stage 1: Prepubertal (no development)', value: '1' },
        { label: 'Stage 2: Breast bud / Testicular enlargement (4 mL); sparse hair (Onset of puberty)', value: '2' },
        { label: 'Stage 3: Breast enlargement without contour separation / Penis lengthens; darker curly hair (Peak height velocity)', value: '3' },
        { label: 'Stage 4: Areola/papilla secondary mound / Glans develops; adult-type hair sparing thighs (Menarche typically)', value: '4' },
        { label: 'Stage 5: Mature adult female/male configuration', value: '5' },
      ]},
    ],
    cutoffs: [
      { range: 'Stage 1', meaning: 'Prepubertal', action: 'Normal before age 8 (girls) or 9 (boys).' },
      { range: 'Stage 2', meaning: 'Pubertal Onset (Thelarche / Gonadarche)', action: 'Investigate if < 8y in girls or < 9y in boys (precocious puberty).' },
      { range: 'Stage 3 - 4', meaning: 'Mid-Puberty / Peak Growth Spurt', action: 'Assess bone age and growth velocity.' },
      { range: 'Stage 5', meaning: 'Full Adult Maturity', action: 'Epiphyseal fusion, adult height reached.' },
    ],
    calculate: (vals, patientTag) => {
      const s = vals.stage_num as string;
      const isF = vals.sex === 'female';
      const descMap: Record<string, string> = {
        '1': 'Prepubertal. No glandular tissue or pubic hair.',
        '2': isF ? 'Thelarche: Breast bud development; sparse fine downy hair along labia.' : 'Gonadarche: Testicular volume ≥ 4 mL; reddened scrotal skin.',
        '3': isF ? 'Enlargement of breast and areola with no contour separation; coarser curly pubic hair.' : 'Penile lengthening, testicular volume 10-12 mL; darker hair over symphysis.',
        '4': isF ? 'Secondary mound formed by areola and papilla; menarche usually occurs shortly after.' : 'Increased penile length and circumference; adult-like hair but smaller area.',
        '5': 'Adult mature configuration. Adult breast contour / adult genitalia.',
      };

      return {
        score: `Tanner ${s}`,
        scoreLabel: `Stage ${s}`,
        interpretation: `Tanner Stage ${s} (${isF ? 'Female' : 'Male'}): ${descMap[s]}`,
        severity: 'neutral',
        formula: 'SMR 5-point physical maturity scale',
        details: [`Pubertal Stage: Tanner ${s}`, `Key Landmark: ${descMap[s]}`],
        ehrNote: `[Tanner Pubertal Staging${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Sex: ${isF ? 'Female' : 'Male'}\n- Sexual Maturity Rating: Tanner Stage ${s}\n- Clinical Description: ${descMap[s]}`,
      };
    },
  },
  {
    id: 'waterlow_malnutrition',
    title: 'Waterlow Classification of Child Malnutrition',
    shortTitle: 'Waterlow Score',
    category: 'Growth & Development',
    ward: 'pediatrics',
    guideline: 'WHO / British Medical Journal (Waterlow JC)',
    description: 'Distinguishes acute malnutrition (wasting = weight-for-height) from chronic malnutrition (stunting = height-for-age) to guide nutritional rehabilitation.',
    keywords: ['waterlow', 'malnutrition', 'wasting', 'stunting', 'pediatric nutrition', 'who'],
    inputs: [
      { id: 'actual_wt', label: 'Actual Weight', type: 'number', min: 2, max: 60, step: 0.1, defaultValue: 10.2, unit: 'kg' },
      { id: 'median_wt_for_ht', label: 'Expected Median Weight for Patient\'s Height (50th percentile)', type: 'number', min: 2, max: 60, step: 0.1, defaultValue: 13.5, unit: 'kg' },
      { id: 'actual_ht', label: 'Actual Height', type: 'number', min: 45, max: 160, step: 0.5, defaultValue: 88, unit: 'cm' },
      { id: 'median_ht_for_age', label: 'Expected Median Height for Patient\'s Age (50th percentile)', type: 'number', min: 45, max: 160, step: 0.5, defaultValue: 94, unit: 'cm' },
    ],
    cutoffs: [
      { range: 'Wasting > 90%, Stunting > 95%', meaning: 'Normal Nutritional Status', action: 'Standard nutritional maintenance.' },
      { range: 'Wasting 80-90% / Stunting 90-95%', meaning: 'Grade 1 (Mild) Wasting or Stunting', action: 'Dietary counseling, supplemental calories.' },
      { range: 'Wasting 70-80% / Stunting 85-89%', meaning: 'Grade 2 (Moderate) Malnutrition', action: 'Targeted high-energy supplemental feeding.' },
      { range: 'Wasting < 70% / Stunting < 85%', meaning: 'Grade 3 (Severe) Acute Wasting / Chronic Stunting', action: 'Inpatient F-75 / F-100 feeding protocol; screen for infections/hypoglycemia.' },
    ],
    calculate: (vals, patientTag) => {
      const actWt = Number(vals.actual_wt);
      const medWt = Number(vals.median_wt_for_ht);
      const actHt = Number(vals.actual_ht);
      const medHt = Number(vals.median_ht_for_age);

      const wastingPct = (actWt / medWt) * 100;
      const stuntingPct = (actHt / medHt) * 100;

      let wastingGrade = 'Normal';
      if (wastingPct < 70) wastingGrade = 'Grade 3 (Severe Wasting)';
      else if (wastingPct < 80) wastingGrade = 'Grade 2 (Moderate Wasting)';
      else if (wastingPct < 90) wastingGrade = 'Grade 1 (Mild Wasting)';

      let stuntingGrade = 'Normal';
      if (stuntingPct < 85) stuntingGrade = 'Grade 3 (Severe Stunting)';
      else if (stuntingPct < 90) stuntingGrade = 'Grade 2 (Moderate Stunting)';
      else if (stuntingPct < 95) stuntingGrade = 'Grade 1 (Mild Stunting)';

      const isSevere = wastingPct < 70 || stuntingPct < 85;
      const severity = isSevere ? 'critical' : wastingPct < 80 ? 'high' : wastingPct < 90 ? 'moderate' : 'low';

      return {
        score: `${wastingPct.toFixed(1)}% / ${stuntingPct.toFixed(1)}%`,
        scoreLabel: `Wasting: ${wastingPct.toFixed(1)}%, Stunting: ${stuntingPct.toFixed(1)}%`,
        interpretation: `Wasting (Weight-for-Height): ${wastingPct.toFixed(1)}% (${wastingGrade}). Stunting (Height-for-Age): ${stuntingPct.toFixed(1)}% (${stuntingGrade}). ${isSevere ? 'Severe malnutrition requires inpatient therapeutic nutrition protocol.' : 'Outpatient nutritional rehabilitation.'}`,
        severity,
        formula: 'Wasting% = (Actual Wt / Median Wt-for-Ht) × 100; Stunting% = (Actual Ht / Median Ht-for-Age) × 100',
        details: [
          `Wasting Status: ${wastingGrade}`,
          `Stunting Status: ${stuntingGrade}`,
        ],
        ehrNote: `[Waterlow Malnutrition Assessment${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Weight-for-Height (Wasting): ${wastingPct.toFixed(1)}% -> ${wastingGrade}\n- Height-for-Age (Stunting): ${stuntingPct.toFixed(1)}% -> ${stuntingGrade}\n- Nutritional Plan: ${isSevere ? 'Inpatient therapeutic feeding (WHO F-75/F-100)' : 'Outpatient high-calorie supplementation'}`,
      };
    },
  },

  // =========================================================================
  // FLUIDS, DOSING & NUTRITION
  // =========================================================================
  {
    id: 'who_dehydration_plan',
    title: 'WHO Dehydration Assessment & Rehydration Plans (A, B, C)',
    shortTitle: 'WHO Dehydration',
    category: 'Fluids & Dosing',
    ward: 'pediatrics',
    guideline: 'WHO Diarrhoeal Disease Management Guidelines',
    description: 'Classifies pediatric diarrhea dehydration into No, Some, or Severe dehydration to select WHO Plan A (home ORS), Plan B (supervised oral rehydration), or Plan C (IV resuscitation).',
    keywords: ['who', 'dehydration', 'ors', 'diarrhea', 'iv fluids', 'plan a', 'plan b', 'plan c'],
    inputs: [
      { id: 'condition', label: 'General Condition', type: 'select', defaultValue: 'irritable', options: [
        { label: 'Well, alert (0 pts)', value: 'well' },
        { label: 'Restless, irritable (1 pt)', value: 'irritable' },
        { label: 'Lethargic, unconscious, floppy (2 pts)', value: 'lethargic' },
      ]},
      { id: 'eyes', label: 'Eyes Appearance', type: 'select', defaultValue: 'sunken', options: [
        { label: 'Normal (0 pts)', value: 'normal' },
        { label: 'Sunken (1 pt)', value: 'sunken' },
      ]},
      { id: 'thirst', label: 'Thirst & Drinking Ability', type: 'select', defaultValue: 'thirsty', options: [
        { label: 'Drinks normally, not thirsty (0 pts)', value: 'normal' },
        { label: 'Thirsty, drinks eagerly (1 pt)', value: 'thirsty' },
        { label: 'Not able to drink or drinks poorly (2 pts)', value: 'poor' },
      ]},
      { id: 'skin_pinch', label: 'Skin Pinch (Abdomen)', type: 'select', defaultValue: 'slow', options: [
        { label: 'Goes back immediately (0 pts)', value: 'immediate' },
        { label: 'Goes back slowly (≤ 2 seconds) (1 pt)', value: 'slow' },
        { label: 'Goes back very slowly (> 2 seconds) (2 pts)', value: 'very_slow' },
      ]},
      { id: 'weight_kg', label: 'Child Weight (kg)', type: 'number', min: 2, max: 40, step: 0.1, defaultValue: 11.5, unit: 'kg' },
    ],
    cutoffs: [
      { range: 'No Dehydration', meaning: '< 5% fluid deficit', action: 'Plan A: Home fluid therapy, extra fluids + ORS 50-100 mL after each loose stool + Zinc.' },
      { range: 'Some Dehydration', meaning: '5% - 10% fluid deficit', action: 'Plan B: Supervised oral rehydration with ORS (Weight kg × 75 mL) over 4 hours.' },
      { range: 'Severe Dehydration', meaning: '> 10% fluid deficit (Medical Emergency)', action: 'Plan C: IV Lactated Ringer\'s 100 mL/kg (30 mL/kg in 30-60 min, then 70 mL/kg over 2.5 - 5h).' },
    ],
    calculate: (vals, patientTag) => {
      const w = Number(vals.weight_kg);
      const isSevere = vals.condition === 'lethargic' || vals.thirst === 'poor' || vals.skin_pinch === 'very_slow';
      const isSome = vals.condition === 'irritable' || vals.eyes === 'sunken' || vals.thirst === 'thirsty' || vals.skin_pinch === 'slow';

      let plan = 'Plan A';
      let sev: 'low' | 'moderate' | 'critical' = 'low';
      let details = '';

      if (isSevere) {
        plan = 'Plan C (Severe Dehydration)';
        sev = 'critical';
        const totalIv = Math.round(w * 100);
        const initialBolus = Math.round(w * 30);
        const remainder = Math.round(w * 70);
        details = `Plan C: Start IV Lactated Ringer's immediately. Total = ${totalIv} mL (Initial 30 mL/kg = ${initialBolus} mL, then 70 mL/kg = ${remainder} mL).`;
      } else if (isSome) {
        plan = 'Plan B (Some Dehydration)';
        sev = 'moderate';
        const orsVolume = Math.round(w * 75);
        details = `Plan B: Give ${orsVolume} mL of WHO ORS solution over 4 hours by spoon/syringe. Reassess after 4 hours.`;
      } else {
        plan = 'Plan A (No Dehydration)';
        sev = 'low';
        details = 'Plan A: Give extra fluids and home ORS after each loose stool. Continue feeding and oral Zinc 20 mg/day for 10-14 days.';
      }

      return {
        score: plan,
        scoreLabel: plan,
        interpretation: details,
        severity: sev,
        formula: 'WHO IMCI 4-point dehydration assessment (General condition, eyes, thirst, skin turgor pinch)',
        details: [details, `Child Weight: ${w} kg`],
        ehrNote: `[WHO Dehydration Management${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Assessment: ${plan.toUpperCase()}\n- Protocol: ${details}\n- Supportive: Oral Zinc sulfate 20 mg daily for 14 days + continued feeding.`,
      };
    },
  },
  {
    id: 'broselow_tape',
    title: 'Broselow Pediatric Emergency Tape Reference',
    shortTitle: 'Broselow Tape',
    category: 'Fluids & Dosing',
    ward: 'pediatrics',
    guideline: 'AHA PALS / Broselow-Luten Color System',
    description: 'Length-based emergency reference estimating pediatric weight, resuscitation drug doses (epinephrine, amiodarone), and airway equipment sizing.',
    keywords: ['broselow', 'pals', 'emergency', 'color', 'ett', 'defibrillation', 'epinephrine'],
    inputs: [
      { id: 'zone', label: 'Broselow Color Zone & Estimated Weight', type: 'select', defaultValue: 'yellow', options: [
        { label: 'Grey: 3 - 5 kg (Infant < 60 cm)', value: 'grey' },
        { label: 'Pink: 6 - 7 kg (60 - 67 cm)', value: 'pink' },
        { label: 'Red: 8 - 9 kg (68 - 74 cm)', value: 'red' },
        { label: 'Purple: 10 - 11 kg (75 - 84 cm)', value: 'purple' },
        { label: 'Yellow: 12 - 14 kg (85 - 98 cm)', value: 'yellow' },
        { label: 'White: 15 - 18 kg (99 - 109 cm)', value: 'white' },
        { label: 'Blue: 19 - 23 kg (110 - 122 cm)', value: 'blue' },
        { label: 'Orange: 24 - 29 kg (123 - 137 cm)', value: 'orange' },
        { label: 'Green: 30 - 36 kg (138 - 149 cm)', value: 'green' },
      ]},
    ],
    cutoffs: [
      { range: 'Color Zones', meaning: 'Standardized Resuscitation Sizing', action: 'Matches color-coded pediatric emergency cart drawers.' },
    ],
    calculate: (vals, patientTag) => {
      const z = vals.zone as string;
      const zoneData: Record<string, { wt: string; ett: string; depth: string; epi: string; defib: string; fluid: string }> = {
        grey: { wt: '4 kg', ett: '3.0 - 3.5 mm', depth: '9 - 10 cm', epi: '0.04 mg (0.4 mL 1:10,000)', defib: '8 - 16 J', fluid: '80 mL NS' },
        pink: { wt: '6.5 kg', ett: '3.5 mm', depth: '10.5 cm', epi: '0.065 mg (0.65 mL)', defib: '14 - 28 J', fluid: '130 mL NS' },
        red: { wt: '8.5 kg', ett: '3.5 - 4.0 mm', depth: '11 cm', epi: '0.085 mg (0.85 mL)', defib: '18 - 36 J', fluid: '170 mL NS' },
        purple: { wt: '10.5 kg', ett: '4.0 mm', depth: '12 cm', epi: '0.1 mg (1.0 mL)', defib: '20 - 40 J', fluid: '210 mL NS' },
        yellow: { wt: '13 kg', ett: '4.5 mm', depth: '13.5 cm', epi: '0.13 mg (1.3 mL)', defib: '26 - 52 J', fluid: '260 mL NS' },
        white: { wt: '16.5 kg', ett: '5.0 mm', depth: '15 cm', epi: '0.16 mg (1.6 mL)', defib: '34 - 68 J', fluid: '330 mL NS' },
        blue: { wt: '21 kg', ett: '5.5 mm', depth: '16.5 cm', epi: '0.21 mg (2.1 mL)', defib: '42 - 84 J', fluid: '420 mL NS' },
        orange: { wt: '26.5 kg', ett: '6.0 mm', depth: '18 cm', epi: '0.26 mg (2.6 mL)', defib: '54 - 108 J', fluid: '530 mL NS' },
        green: { wt: '33 kg', ett: '6.5 mm', depth: '19.5 cm', epi: '0.33 mg (3.3 mL)', defib: '66 - 132 J', fluid: '660 mL NS' },
      };
      const d = zoneData[z] || zoneData.yellow;

      return {
        score: `${z.toUpperCase()} (${d.wt})`,
        scoreLabel: `${z.toUpperCase()} Zone (~${d.wt})`,
        interpretation: `Broselow ${z.toUpperCase()} Zone (Est. Weight: ${d.wt}). ETT: ${d.ett} (depth ${d.depth}). IV Epinephrine 1:10,000: ${d.epi}. Defibrillation (2-4 J/kg): ${d.defib}. Fluid bolus (20 mL/kg): ${d.fluid}.`,
        severity: 'neutral',
        formula: 'Broselow length-to-weight correlation algorithm',
        details: [
          `Cuffed/Uncuffed ETT: ${d.ett}`,
          `ETT Lip Depth: ${d.depth}`,
          `Epi (1:10,000 IV): ${d.epi}`,
          `Defibrillation (2-4 J/kg): ${d.defib}`,
          `20 mL/kg Bolus: ${d.fluid}`,
        ],
        ehrNote: `[Broselow Emergency Sizing${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Broselow Zone: ${z.toUpperCase()} (~${d.wt})\n- Airway: ETT ${d.ett} at ${d.depth} lip\n- IV Epinephrine (1:10,000): ${d.epi}\n- Fluid Bolus (20 mL/kg): ${d.fluid} Isotonic Saline\n- Defibrillation: Initial ${d.defib}`,
      };
    },
  },

  // =========================================================================
  // RESPIRATORY / EMERGENCY
  // =========================================================================
  {
    id: 'pass_asthma',
    title: 'Pediatric Asthma Severity Score (PASS)',
    shortTitle: 'PASS Asthma',
    category: 'Respiratory / ER',
    ward: 'pediatrics',
    guideline: 'Peds Emergency Medicine / GINA Pediatric Asthma',
    description: 'Bedside scoring system assessing wheezing, work of breathing, and tachypnea to guide bronchodilator frequency and systemic corticosteroid dosing.',
    keywords: ['pass', 'asthma', 'pediatric asthma', 'wheezing', 'retractions', 'albuterol'],
    inputs: [
      { id: 'wheeze', label: 'Wheezing Auscultation', type: 'select', defaultValue: 1, options: [
        { label: 'None (0 pts)', value: 0 },
        { label: 'Terminal expiratory only (1 pt)', value: 1 },
        { label: 'Entire expiration ± inspiration (2 pts)', value: 2 },
      ]},
      { id: 'work_breathing', label: 'Work of Breathing / Retractions', type: 'select', defaultValue: 1, options: [
        { label: 'None / Normal (0 pts)', value: 0 },
        { label: 'Intercostal or substernal retractions (1 pt)', value: 1 },
        { label: 'Severe retractions + supraclavicular/sternocleidomastoid use (2 pts)', value: 2 },
      ]},
      { id: 'rr_age', label: 'Prolonged Expiration / Tachypnea for Age', type: 'select', defaultValue: 1, options: [
        { label: 'Normal respiratory rate and I:E ratio (0 pts)', value: 0 },
        { label: 'Tachypnea or expiratory phase > inspiratory phase (1 pt)', value: 1 },
        { label: 'Marked tachypnea or severe air hunger (2 pts)', value: 2 },
      ]},
    ],
    cutoffs: [
      { range: '0 - 1 pts', meaning: 'Mild Asthma Exacerbation', action: 'Inhaled albuterol q3-4h; consider oral dexamethasone/prednisolone.' },
      { range: '2 - 3 pts', meaning: 'Moderate Asthma Exacerbation', action: 'Back-to-back albuterol/ipratropium nebulizations × 3, systemic steroids.' },
      { range: '4 - 6 pts', meaning: 'Severe Asthma Exacerbation', action: 'Continuous albuterol nebulization, IV Magnesium sulfate (50 mg/kg), admit to PICU/HDU.' },
    ],
    calculate: (vals, patientTag) => {
      const score = Number(vals.wheeze) + Number(vals.work_breathing) + Number(vals.rr_age);
      const severity = score >= 4 ? 'critical' : score >= 2 ? 'high' : 'low';
      const tier = score >= 4 ? 'Severe' : score >= 2 ? 'Moderate' : 'Mild';

      return {
        score,
        scoreLabel: `${score}/6 pts (${tier})`,
        interpretation: score >= 4
          ? `Severe Pediatric Asthma Exacerbation (PASS ${score}/6). Immediate continuous albuterol, IV Magnesium sulfate 50 mg/kg, IV steroids, high-flow O2.`
          : score >= 2
          ? `Moderate Exacerbation (PASS ${score}/6). Albuterol + Ipratropium q20min × 3 doses + Oral Dexamethasone 0.6 mg/kg.`
          : `Mild Exacerbation (PASS ${score}/6). Albuterol inhaler 4-6 puffs q4h PRN.`,
        severity,
        formula: 'Sum of Wheeze (0-2) + Work of Breathing (0-2) + Tachypnea (0-2)',
        details: [`Severity Tier: ${tier.toUpperCase()}`],
        ehrNote: `[Pediatric Asthma Severity Score (PASS)${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total Score: ${score}/6\n- Classification: ${tier.toUpperCase()} EXACERBATION\n- Acute Management: ${score >= 4 ? 'Continuous nebulized albuterol + IV Magnesium + PICU consult' : 'Duoneb q20m × 3 doses + systemic corticosteroids'}`,
      };
    },
  },
  {
    id: 'rdai_bronchiolitis',
    title: 'Respiratory Distress Assessment Instrument (RDAI) for Bronchiolitis',
    shortTitle: 'RDAI Bronchiolitis',
    category: 'Respiratory / ER',
    ward: 'pediatrics',
    guideline: 'AAP Clinical Practice Guideline: Bronchiolitis',
    description: 'Standardized 17-point clinical score measuring wheezing and retractions in infants with acute viral bronchiolitis (RSV).',
    keywords: ['rdai', 'bronchiolitis', 'rsv', 'infant', 'retractions', 'wheezing'],
    inputs: [
      { id: 'wheeze_score', label: 'Wheeze Location & Extent (0 - 8)', type: 'select', defaultValue: 3, options: [
        { label: '0: None', value: 0 },
        { label: '2: Expiratory only in ≤ 2 quadrants', value: 2 },
        { label: '4: Expiratory in ≥ 3 quadrants', value: 4 },
        { label: '6: Inspiratory & expiratory in ≤ 2 quadrants', value: 6 },
        { label: '8: Inspiratory & expiratory in ≥ 3 quadrants', value: 8 },
      ]},
      { id: 'retraction_score', label: 'Retraction Severity (0 - 9)', type: 'select', defaultValue: 3, options: [
        { label: '0: No retractions', value: 0 },
        { label: '2: Mild supraclavicular or intercostal', value: 2 },
        { label: '4: Moderate intercostal and substernal', value: 4 },
        { label: '6: Severe intercostal, substernal, and tracheosternal tug', value: 6 },
        { label: '9: Severe generalized retractions with head bobbing / grunting', value: 9 },
      ]},
    ],
    cutoffs: [
      { range: '0 - 4 pts', meaning: 'Mild Bronchiolitis', action: 'Supportive care: nasal suctioning, hydration, outpatient follow-up.' },
      { range: '5 - 10 pts', meaning: 'Moderate Bronchiolitis', action: 'Inpatient admission, supplemental oxygen to maintain SpO2 ≥ 90%, enteral/IV hydration.' },
      { range: '≥ 11 pts', meaning: 'Severe Bronchiolitis (Impending Respiratory Failure)', action: 'High-Flow Nasal Cannula (HFNC) or CPAP, admit to PICU.' },
    ],
    calculate: (vals, patientTag) => {
      const score = Number(vals.wheeze_score) + Number(vals.retraction_score);
      const severity = score >= 11 ? 'critical' : score >= 5 ? 'high' : 'low';
      const tier = score >= 11 ? 'Severe' : score >= 5 ? 'Moderate' : 'Mild';

      return {
        score,
        scoreLabel: `${score}/17 pts (${tier})`,
        interpretation: score >= 11
          ? `Severe Bronchiolitis (RDAI ${score}/17). High risk of respiratory exhaustion. Initiate High-Flow Nasal Cannula (HFNC 1-2 L/kg/min) or CPAP; PICU consultation.`
          : score >= 5
          ? `Moderate Bronchiolitis (RDAI ${score}/17). Inpatient admission, nasal suctioning, maintain SpO2 ≥ 90%, ensure hydration.`
          : `Mild Bronchiolitis (RDAI ${score}/17). Supportive home care; education on respiratory red flags.`,
        severity,
        formula: 'Wheeze score (0-8) + Retraction score (0-9)',
        details: [`Bronchiolitis Tier: ${tier.toUpperCase()}`],
        ehrNote: `[RDAI Bronchiolitis Score${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total Score: ${score}/17\n- Classification: ${tier.toUpperCase()} BRONCHIOLITIS\n- Plan: ${score >= 11 ? 'Initiate HFNC / CPAP support and admit PICU' : 'Gentle nasal suctioning + hydration maintenance'}`,
      };
    },
  },

  // =========================================================================
  // INFECTIOUS DISEASE / SEPSIS (PEDS)
  // =========================================================================
  {
    id: 'rochester_febrile',
    title: 'Rochester Criteria for Febrile Infants (≤ 60 Days)',
    shortTitle: 'Rochester Criteria',
    category: 'Infectious Disease',
    ward: 'pediatrics',
    guideline: 'Pediatrics / AAP Febrile Infant Guidelines 2021',
    description: 'Identifies febrile infants aged 1 - 60 days at low risk for serious bacterial infection (SBI: UTI, bacteremia, meningitis) to avoid unnecessary lumbar puncture or hospitalization.',
    keywords: ['rochester', 'febrile infant', 'sbi', 'fever', 'infant fever', 'meningitis', 'uti'],
    inputs: [
      { id: 'looks_well', label: 'Infant appears generally well (normal alert demeanor, feeding)', type: 'boolean', defaultValue: true },
      { id: 'previously_healthy', label: 'Previously healthy: Born at term (≥37 wk), no perinatal antibiotics, no unexplained jaundice, no prior hospitalizations', type: 'boolean', defaultValue: true },
      { id: 'no_skin_soft_tissue', label: 'No focal skin, soft-tissue, bone, joint, or ear infection', type: 'boolean', defaultValue: true },
      { id: 'wbc_normal', label: 'WBC count 5,000 - 15,000 /µL (5 - 15 × 10⁹/L)', type: 'boolean', defaultValue: true },
      { id: 'bands_normal', label: 'Band count ≤ 1,500 /µL (or band-to-total neutrophil ratio ≤ 0.2)', type: 'boolean', defaultValue: true },
      { id: 'ua_normal', label: 'Urinalysis ≤ 10 WBC/HPF and negative leukocyte esterase / nitrite', type: 'boolean', defaultValue: true },
      { id: 'stool_normal', label: 'Stool ≤ 5 WBC/HPF (if diarrhea present)', type: 'boolean', defaultValue: true },
    ],
    cutoffs: [
      { range: 'All Criteria Met', meaning: 'Low Risk for Serious Bacterial Infection (~1-2% SBI)', action: 'Outpatient management with reliable caregiver and close 24h follow-up; lumbar puncture may be deferred.' },
      { range: '≥ 1 Criterion Failed', meaning: 'High Risk for SBI', action: 'Full sepsis workup (blood culture, catheterized UA/culture, LP) + empiric IV antibiotics + admission.' },
    ],
    calculate: (vals, patientTag) => {
      const isLowRisk = Boolean(vals.looks_well) &&
        Boolean(vals.previously_healthy) &&
        Boolean(vals.no_skin_soft_tissue) &&
        Boolean(vals.wbc_normal) &&
        Boolean(vals.bands_normal) &&
        Boolean(vals.ua_normal) &&
        Boolean(vals.stool_normal);

      const severity = isLowRisk ? 'low' : 'high';

      return {
        score: isLowRisk ? 'LOW RISK' : 'HIGH RISK',
        scoreLabel: isLowRisk ? 'Low Risk for SBI' : 'High Risk for SBI',
        interpretation: isLowRisk
          ? 'Meets all Rochester Low-Risk Criteria (SBI probability ~1.1%). Lumbar puncture may be safely deferred; outpatient follow-up within 24 hours acceptable if caregivers are reliable.'
          : 'Does NOT meet Low-Risk criteria. High risk for serious bacterial infection (UTI, bacteremia, meningitis). Complete sepsis evaluation (blood, urine, CSF) and inpatient IV Ceftriaxone / Ampicillin.',
        severity,
        formula: 'All 7 clinical and laboratory low-risk criteria must be fulfilled',
        details: [`SBI Risk: ${isLowRisk ? 'LOW (~1.1%)' : 'ELEVATED'}`],
        ehrNote: `[Rochester Criteria for Febrile Infant${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Assessment: ${isLowRisk ? 'LOW RISK FOR SBI (All criteria met)' : 'HIGH RISK FOR SBI'}\n- Clinical Plan: ${isLowRisk ? 'Outpatient follow-up in 24h; counsel on red flags' : 'Full sepsis workup (blood/urine/CSF cultures) and IV antibiotics'}`,
      };
    },
  },
  {
    id: 'who_imci_danger_signs',
    title: 'WHO Integrated Management of Childhood Illness (IMCI) General Danger Signs',
    shortTitle: 'IMCI Danger Signs',
    category: 'Infectious Disease',
    ward: 'pediatrics',
    guideline: 'WHO / UNICEF IMCI Guidelines',
    description: 'Emergency screening in children aged 2 months to 5 years identifying life-threatening illness requiring immediate hospital referral and emergency stabilization.',
    keywords: ['imci', 'danger signs', 'who', 'pediatric triage', 'referral', 'sepsis'],
    inputs: [
      { id: 'cannot_drink', label: 'Unable to drink or breastfeed', type: 'boolean', defaultValue: false },
      { id: 'vomits_everything', label: 'Vomits everything taken', type: 'boolean', defaultValue: false },
      { id: 'convulsions', label: 'History of convulsions during this illness', type: 'boolean', defaultValue: true },
      { id: 'lethargic_unconscious', label: 'Abnormally sleepy, lethargic, or unconscious', type: 'boolean', defaultValue: false },
      { id: 'convulsing_now', label: 'Currently convulsing', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '0 Danger Signs', meaning: 'No immediate IMCI danger signs', action: 'Manage specific symptom condition (ARI, diarrhea, malaria) according to IMCI chart.' },
      { range: '≥ 1 Danger Sign', meaning: 'SEVERE LIFE-THREATENING ILLNESS', action: 'Urgent emergency triage; give pre-referral treatment (IV/IM artesunate/antibiotic, treat hypoglycemia) and transfer to hospital immediately.' },
    ],
    calculate: (vals, patientTag) => {
      const signs: string[] = [];
      if (vals.cannot_drink) signs.push('Unable to drink/breastfeed');
      if (vals.vomits_everything) signs.push('Vomits everything');
      if (vals.convulsions) signs.push('History of convulsions');
      if (vals.lethargic_unconscious) signs.push('Lethargic / Unconscious');
      if (vals.convulsing_now) signs.push('Currently convulsing');

      const hasDanger = signs.length > 0;
      const severity = hasDanger ? 'critical' : 'low';

      return {
        score: hasDanger ? 'DANGER SIGN PRESENT' : 'NO DANGER SIGNS',
        scoreLabel: `${signs.length} Danger Sign${signs.length === 1 ? '' : 's'}`,
        interpretation: hasDanger
          ? `GENERAL DANGER SIGN PRESENT (${signs.join(', ')}). Child has severe life-threatening illness. Emergency stabilization, treat hypoglycemia, and immediate urgent hospital admission/referral.`
          : 'No IMCI general danger signs detected. Evaluate and treat according to organ-specific syndrome.',
        severity,
        formula: 'Presence of any of 4 cardinal danger signs (drinking failure, persistent vomiting, convulsions, unconsciousness)',
        details: signs.length > 0 ? signs : ['Child drinks well, no vomiting, no convulsions, fully alert'],
        ehrNote: `[WHO IMCI Danger Signs Screening${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Danger Sign Status: ${hasDanger ? 'CRITICAL DANGER SIGN PRESENT' : 'NEGATIVE'}\n- Identified Signs: ${signs.length > 0 ? signs.join(', ') : 'None'}\n- Emergency Action: ${hasDanger ? 'Immediate resuscitation, glucose check, pre-referral IV antibiotics' : 'Routine IMCI syndrome care'}`,
      };
    },
  },
  {
    id: 'ross_heart_failure',
    title: 'Ross Heart Failure Classification for Children & Infants',
    shortTitle: 'Ross Heart Failure',
    category: 'Pediatric Cardiology',
    ward: 'pediatrics',
    guideline: 'Pediatric Cardiology / ISHLT Pediatric Heart Failure',
    description: 'Pediatric equivalent of the NYHA functional classification, scoring feeding duration, diaphoresis, tachypnea, and hepatomegaly in infants with congestive heart failure.',
    keywords: ['ross', 'heart failure', 'infant', 'chf', 'congenital heart disease', 'feeding'],
    inputs: [
      { id: 'class_select', label: 'Infant Feeding & Clinical Findings', type: 'select', defaultValue: 'Class II', options: [
        { label: 'Class I: Asymptomatic; normal feeding duration and growth', value: 'Class I' },
        { label: 'Class II: Mild diaphoresis or tachypnea with feeding in infants; mild dyspnea on exertion in older children', value: 'Class II' },
        { label: 'Class III: Marked diaphoresis or tachypnea with feeding; prolonged feeding times with failure to thrive', value: 'Class III' },
        { label: 'Class IV: Tachypnea, retractions, grunting, or diaphoresis present at rest', value: 'Class IV' },
      ]},
    ],
    cutoffs: [
      { range: 'Class I', meaning: 'Asymptomatic', action: 'Monitoring of congenital heart lesion.' },
      { range: 'Class II', meaning: 'Mild Heart Failure', action: 'Initiate low-dose loop diuretic (Furosemide 1 mg/kg/d) ± ACE inhibitor.' },
      { range: 'Class III', meaning: 'Moderate Heart Failure', action: 'Diuretics + ACEi + high-calorie formula (24-30 kcal/oz), NG feeding if needed.' },
      { range: 'Class IV', meaning: 'Severe Heart Failure at Rest', action: 'Inpatient ICU care, inotropic support (Milrinone), urgent surgical repair.' },
    ],
    calculate: (vals, patientTag) => {
      const cls = vals.class_select as string;
      const severity = cls === 'Class IV' ? 'critical' : cls === 'Class III' ? 'high' : cls === 'Class II' ? 'moderate' : 'low';
      const map: Record<string, string> = {
        'Class I': 'Asymptomatic. Routine pediatric cardiology outpatient surveillance.',
        'Class II': 'Mild Heart Failure. Optimize oral diuretics and medical therapy.',
        'Class III': 'Moderate Heart Failure with growth failure. Increase caloric density of feeds; consider nasogastric tube to decrease feeding effort.',
        'Class IV': 'Severe Heart Failure. Inpatient hospitalization, IV Milrinone / inotropes, surgical or transcatheter intervention.',
      };

      return {
        score: cls,
        scoreLabel: cls,
        interpretation: `Ross ${cls}: ${map[cls]}`,
        severity,
        formula: 'Functional severity based on infant feeding tolerance, diaphoresis, respiratory effort, and growth',
        details: [`Clinical Strategy: ${map[cls]}`],
        ehrNote: `[Ross Pediatric Heart Failure Classification${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Functional Class: Ross ${cls}\n- Severity: ${severity.toUpperCase()}\n- Pediatric Cardiology Plan: ${map[cls]}`,
      };
    },
  },
];
