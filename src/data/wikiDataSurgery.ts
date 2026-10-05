import type { WikiCalculatorItem } from './wikiTypes';

export const WIKI_SURGERY_TOOLS: WikiCalculatorItem[] = [
  // =========================================================================
  // TRAUMA & ACUTE SURGERY
  // =========================================================================
  {
    id: 'iss_score',
    title: 'Injury Severity Score (ISS) & Major Trauma Staging',
    shortTitle: 'ISS Trauma',
    category: 'Trauma / Acute',
    ward: 'surgery',
    guideline: 'ATLS / Association for the Advancement of Automotive Medicine (AAAM)',
    description: 'Anatomical scoring system summing the squares of the highest Abbreviated Injury Scale (AIS) scores in the 3 most severely injured body regions.',
    keywords: ['iss', 'ais', 'trauma', 'major trauma', 'injury severity', 'atls'],
    inputs: [
      { id: 'head_neck', label: 'Head & Neck AIS (0 - 6)', type: 'select', defaultValue: 3, options: [
        { label: '0: None', value: 0 },
        { label: '1: Minor', value: 1 },
        { label: '2: Moderate (concussion, simple fracture)', value: 2 },
        { label: '3: Serious (subdural hematoma < 100 mL, contusion)', value: 3 },
        { label: '4: Severe (subdural > 100 mL, open skull fx)', value: 4 },
        { label: '5: Critical (brainstem injury, extensive hematoma)', value: 5 },
        { label: '6: Fatal / Untreatable', value: 6 },
      ]},
      { id: 'face', label: 'Face AIS (0 - 6)', type: 'select', defaultValue: 0, options: [
        { label: '0: None', value: 0 },
        { label: '1: Minor', value: 1 },
        { label: '2: Moderate (mandible fx, Le Fort I)', value: 2 },
        { label: '3: Serious (Le Fort II/III)', value: 3 },
        { label: '4: Severe', value: 4 },
      ]},
      { id: 'chest', label: 'Chest AIS (0 - 6)', type: 'select', defaultValue: 3, options: [
        { label: '0: None', value: 0 },
        { label: '1: Minor', value: 1 },
        { label: '2: Moderate (2-3 rib fx, sternal fx)', value: 2 },
        { label: '3: Serious (flail chest, hemothorax > 1000 mL, pulmonary contusion)', value: 3 },
        { label: '4: Severe (aortic tear, bilateral hemothorax)', value: 4 },
        { label: '5: Critical (major airway disruption)', value: 5 },
      ]},
      { id: 'abdomen', label: 'Abdomen & Pelvis AIS (0 - 6)', type: 'select', defaultValue: 2, options: [
        { label: '0: None', value: 0 },
        { label: '1: Minor', value: 1 },
        { label: '2: Moderate (Grade II liver/spleen lac)', value: 2 },
        { label: '3: Serious (Grade III/IV liver/spleen, stable pelvic fx)', value: 3 },
        { label: '4: Severe (Grade V liver, unstable pelvic fx)', value: 4 },
        { label: '5: Critical (major vascular rupture)', value: 5 },
      ]},
      { id: 'extremity', label: 'Extremities & Pelvic Girdle AIS (0 - 6)', type: 'select', defaultValue: 2, options: [
        { label: '0: None', value: 0 },
        { label: '1: Minor', value: 1 },
        { label: '2: Moderate (simple tibia/femur fx)', value: 2 },
        { label: '3: Serious (open femur fx, traumatic amputation)', value: 3 },
        { label: '4: Severe (bilateral femur fx, mangled extremity)', value: 4 },
      ]},
      { id: 'external', label: 'External / Burns AIS (0 - 6)', type: 'select', defaultValue: 0, options: [
        { label: '0: None', value: 0 },
        { label: '1: Minor (abrasions)', value: 1 },
        { label: '2: Moderate (2nd/3rd degree burns 10-19%)', value: 2 },
        { label: '3: Serious (burns 20-29%)', value: 3 },
        { label: '4: Severe (burns 30-39%)', value: 4 },
        { label: '5: Critical (burns ≥ 40%)', value: 5 },
      ]},
    ],
    cutoffs: [
      { range: 'ISS < 9', meaning: 'Minor Injury', action: 'General surgical/trauma ward.' },
      { range: 'ISS 9 - 15', meaning: 'Moderate Injury', action: 'Admit for serial observation and imaging.' },
      { range: 'ISS 16 - 24', meaning: 'Severe Trauma (Major Trauma Trigger)', action: 'Level 1 Trauma Center transfer; activate trauma team.' },
      { range: 'ISS ≥ 25', meaning: 'Critical / Life-Threatening Polytrauma', action: 'Direct damage-control surgery / ICU resuscitation.' },
    ],
    calculate: (vals, patientTag) => {
      const scores = [
        Number(vals.head_neck),
        Number(vals.face),
        Number(vals.chest),
        Number(vals.abdomen),
        Number(vals.extremity),
        Number(vals.external),
      ];

      // If any region has an AIS of 6, ISS is automatically 75 (unsurvivable)
      let iss = 0;
      if (scores.some((s) => s === 6)) {
        iss = 75;
      } else {
        const sorted = [...scores].sort((a, b) => b - a);
        iss = Math.pow(sorted[0], 2) + Math.pow(sorted[1], 2) + Math.pow(sorted[2], 2);
      }

      const isMajorTrauma = iss >= 16;
      const severity = iss >= 25 ? 'critical' : iss >= 16 ? 'high' : iss >= 9 ? 'moderate' : 'low';
      const mort = iss >= 40 ? '>50%' : iss >= 25 ? '~30%' : iss >= 16 ? '~10%' : '<2%';

      return {
        score: iss,
        scoreLabel: `ISS: ${iss}/75`,
        interpretation: isMajorTrauma
          ? `Major Polytrauma Confirmed (ISS ${iss} ≥ 16; Est. mortality ~${mort}). Activate Trauma Center critical resuscitation and damage control pathways.`
          : `Non-Major Trauma (ISS ${iss} < 16). Manage according to individual injury protocols.`,
        severity,
        formula: 'Sum of the squares of the 3 highest AIS regional scores (AIS 6 automatically = 75)',
        details: [`Top 3 AIS Scores: ${[...scores].sort((a, b) => b - a).slice(0, 3).join(', ')}`, `Estimated Mortality: ${mort}`],
        ehrNote: `[Injury Severity Score (ISS)${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total ISS: ${iss}/75\n- Polytrauma Classification: ${isMajorTrauma ? 'MAJOR TRAUMA (ISS ≥ 16)' : 'NON-MAJOR TRAUMA'}\n- Estimated Mortality: ${mort}\n- Protocol: ${isMajorTrauma ? 'Activate Massive Transfusion & Trauma ICU' : 'Standard trauma admission'}`,
      };
    },
  },
  {
    id: 'fast_exam',
    title: 'Focused Assessment with Sonography in Trauma (FAST)',
    shortTitle: 'FAST Exam',
    category: 'Trauma / Acute',
    ward: 'surgery',
    guideline: 'ATLS 10th Edition / ACEP Ultrasound',
    description: 'Rapid point-of-care ultrasound protocol examining 4 anatomic acoustic windows for pathologic free peritoneal or pericardial fluid.',
    keywords: ['fast', 'ultrasound', 'trauma', 'hemoperitoneum', 'tamponade', 'atls'],
    inputs: [
      { id: 'perihepatic', label: 'Right Upper Quadrant (Morison’s pouch / Perihepatic)', type: 'boolean', defaultValue: true },
      { id: 'perisplenic', label: 'Left Upper Quadrant (Splenorenal recess / Perisplenic)', type: 'boolean', defaultValue: false },
      { id: 'pelvic', label: 'Pelvic / Suprapubic (Retrovesical / Pouch of Douglas)', type: 'boolean', defaultValue: false },
      { id: 'pericardial', label: 'Subxiphoid / Pericardial View (Pericardial effusion / Tamponade)', type: 'boolean', defaultValue: false },
      { id: 'unstable', label: 'Hemodynamically Unstable (SBP < 90 mmHg despite fluid)', type: 'boolean', defaultValue: true },
    ],
    cutoffs: [
      { range: 'Positive FAST + Unstable', meaning: 'Emergency Laparotomy Indicated', action: 'Immediate transfer to Operating Room without CT scan.' },
      { range: 'Positive FAST + Stable', meaning: 'Hemoperitoneum in stable patient', action: 'Contrast-enhanced CT abdomen/pelvis to grade solid organ injury.' },
      { range: 'Negative FAST', meaning: 'No gross free fluid visible', action: 'Serial exams or CT if high-energy mechanism.' },
    ],
    calculate: (vals, patientTag) => {
      const posWindows: string[] = [];
      if (vals.perihepatic) posWindows.push('Morison\'s Pouch (RUQ)');
      if (vals.perisplenic) posWindows.push('Splenorenal Recess (LUQ)');
      if (vals.pelvic) posWindows.push('Pelvic Space');
      if (vals.pericardial) posWindows.push('Pericardium');

      const isPositive = posWindows.length > 0;
      const isUnstable = Boolean(vals.unstable);
      const severity = isPositive && isUnstable ? 'critical' : isPositive ? 'high' : 'low';

      let action = 'No free fluid detected. If high clinical suspicion, proceed to CT or serial ultrasound.';
      if (isPositive && isUnstable) {
        action = 'POSITIVE FAST IN UNSTABLE PATIENT: Emergency Exploratory Laparotomy or Sternotomy mandated immediately. Do NOT delay for CT scan.';
      } else if (isPositive && !isUnstable) {
        action = 'POSITIVE FAST IN STABLE PATIENT: Proceed immediately to contrast-enhanced abdominal/pelvic CT for injury grading.';
      }

      return {
        score: isPositive ? 'POSITIVE' : 'NEGATIVE',
        scoreLabel: `${isPositive ? 'POSITIVE' : 'NEGATIVE'} (${posWindows.length} windows)`,
        interpretation: action,
        severity,
        formula: 'Point-of-care 4-window acoustic ultrasound evaluation (RUQ, LUQ, Pelvis, Subxiphoid)',
        details: [
          `Positive Windows: ${posWindows.length > 0 ? posWindows.join(', ') : 'None'}`,
          `Hemodynamic Stability: ${isUnstable ? 'UNSTABLE' : 'STABLE'}`,
        ],
        ehrNote: `[FAST Ultrasound Examination${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Exam Result: ${isPositive ? 'POSITIVE FOR FREE FLUID' : 'NEGATIVE'}\n- Involved Spaces: ${posWindows.length > 0 ? posWindows.join(', ') : 'No free fluid'}\n- Hemodynamics: ${isUnstable ? 'UNSTABLE (SBP <90)' : 'STABLE'}\n- Surgical Plan: ${action}`,
      };
    },
  },
  {
    id: 'denver_bcvi',
    title: 'Denver Criteria for Blunt Cerebrovascular Injury (BCVI)',
    shortTitle: 'Denver BCVI',
    category: 'Trauma / Acute',
    ward: 'surgery',
    guideline: 'EAST / Western Trauma Association (WTA)',
    description: 'Screening criteria determining which blunt trauma patients require screening CT Angiography (CTA) of the neck to diagnose carotid/vertebral artery dissection and prevent stroke.',
    keywords: ['bcvi', 'denver', 'carotid dissection', 'vertebral artery', 'cta neck', 'trauma'],
    inputs: [
      { id: 'focal_neuro', label: 'Unexplained focal neurological deficit, TIA, or stroke', type: 'boolean', defaultValue: false },
      { id: 'arterial_hemorrhage', label: 'Arterial hemorrhage from neck, nose, or mouth', type: 'boolean', defaultValue: false },
      { id: 'expanding_hematoma', label: 'Cervical bruit, thrill, or expanding neck hematoma', type: 'boolean', defaultValue: false },
      { id: 'lefort', label: 'Severe facial fracture (Le Fort II or III, complex mandible)', type: 'boolean', defaultValue: false },
      { id: 'skull_base', label: 'Basilar skull fracture involving carotid canal or petrous bone', type: 'boolean', defaultValue: true },
      { id: 'c_spine', label: 'Cervical spine fracture (subluxation, facet dislocation, C1-C3, or foramen transversarium)', type: 'boolean', defaultValue: false },
      { id: 'diffuse_axonal', label: 'Severe TBI with GCS < 6 / Diffuse Axonal Injury', type: 'boolean', defaultValue: false },
      { id: 'seatbelt', label: 'Near-hanging with anoxic injury or clothesline seatbelt sign on neck', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '≥ 1 Criterion Positive', meaning: 'Screening CTA Neck Indicated', action: 'Perform CTA Neck from aortic arch to circle of Willis.' },
      { range: 'All Criteria Negative', meaning: 'Low Risk of BCVI (< 1%)', action: 'CTA neck screening not routinely required.' },
    ],
    calculate: (vals, patientTag) => {
      const positiveCriteria: string[] = [];
      if (vals.focal_neuro) positiveCriteria.push('Unexplained focal neuro deficit');
      if (vals.arterial_hemorrhage) positiveCriteria.push('Arterial neck hemorrhage');
      if (vals.expanding_hematoma) positiveCriteria.push('Cervical hematoma/bruit');
      if (vals.lefort) positiveCriteria.push('Le Fort II/III fracture');
      if (vals.skull_base) positiveCriteria.push('Skull base fx involving carotid canal');
      if (vals.c_spine) positiveCriteria.push('C-spine fracture/subluxation');
      if (vals.diffuse_axonal) positiveCriteria.push('Severe TBI / GCS < 6');
      if (vals.seatbelt) positiveCriteria.push('Clothesline / seatbelt neck mark');

      const isScreeningIndicated = positiveCriteria.length > 0;
      const severity = isScreeningIndicated ? 'high' : 'low';

      return {
        score: isScreeningIndicated ? 'CTA INDICATED' : 'LOW RISK',
        scoreLabel: `${positiveCriteria.length} Positive Criteria`,
        interpretation: isScreeningIndicated
          ? `Denver Criteria POSITIVE (${positiveCriteria.length} risk factor${positiveCriteria.length === 1 ? '' : 's'}). Mandatory CT Angiography of head & neck indicated to rule out BCVI.`
          : 'Denver Criteria Negative. Routine CTA neck screening not indicated.',
        severity,
        formula: 'Signs/symptoms of vascular injury OR high-risk injury patterns (skull base, C-spine, Le Fort)',
        details: positiveCriteria.length > 0 ? positiveCriteria : ['All 8 Denver screening triggers negative'],
        ehrNote: `[Denver BCVI Screening Protocol${patientTag ? ` - Bed ${patientTag}` : ''}]\n- BCVI Screening: ${isScreeningIndicated ? 'MANDATORY CTA HEAD/NECK' : 'NOT INDICATED'}\n- Identified Triggers: ${positiveCriteria.length > 0 ? positiveCriteria.join(', ') : 'None'}\n- Plan: ${isScreeningIndicated ? 'Order CTA Head & Neck (arch to vertex)' : 'Clinical observation'}`,
      };
    },
  },
  {
    id: 'ottawa_rules',
    title: 'Ottawa Ankle and Knee Rules for Radiography',
    shortTitle: 'Ottawa Rules',
    category: 'Trauma / Acute',
    ward: 'surgery',
    guideline: 'Annals of Emergency Medicine / Canadian Association of Radiologists',
    description: 'Near-100% sensitive clinical decision rules determining the necessity of plain radiography following acute blunt ankle, foot, or knee injury.',
    keywords: ['ottawa', 'ankle rule', 'knee rule', 'x-ray', 'malleolus', 'patella', 'weight bearing'],
    inputs: [
      { id: 'joint_type', label: 'Injury Anatomical Site', type: 'select', defaultValue: 'ankle', options: [
        { label: 'Ankle / Midfoot Injury', value: 'ankle' },
        { label: 'Knee Injury', value: 'knee' },
      ]},
      // Ankle items
      { id: 'malleolar_pain', label: 'Bone tenderness at posterior edge / tip of lateral OR medial malleolus (6 cm)', type: 'boolean', defaultValue: true },
      { id: 'navicular_base5', label: 'Bone tenderness at base of 5th metatarsal OR navicular bone', type: 'boolean', defaultValue: false },
      { id: 'ankle_weight_bear', label: 'Inability to bear weight both immediately AND in ED (4 steps)', type: 'boolean', defaultValue: false },
      // Knee items
      { id: 'knee_age55', label: 'Age ≥ 55 years', type: 'boolean', defaultValue: false },
      { id: 'patella_tender', label: 'Isolated tenderness of patella (no other bone tenderness)', type: 'boolean', defaultValue: false },
      { id: 'fibula_tender', label: 'Tenderness at head of fibula', type: 'boolean', defaultValue: false },
      { id: 'knee_flexion', label: 'Inability to flex knee to 90 degrees', type: 'boolean', defaultValue: false },
      { id: 'knee_weight_bear', label: 'Inability to bear weight both immediately AND in ED (4 steps)', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: 'Rule Positive', meaning: 'Radiograph is indicated', action: 'Perform 3-view plain radiography of joint.' },
      { range: 'Rule Negative', meaning: 'Fracture reliably excluded (>98% sensitivity)', action: 'No X-ray required; supportive ace wrap / RICE therapy.' },
    ],
    calculate: (vals, patientTag) => {
      const isAnkle = vals.joint_type === 'ankle';
      let xRayNeeded = false;
      let reason = '';

      if (isAnkle) {
        if (vals.malleolar_pain || vals.ankle_weight_bear) {
          xRayNeeded = true;
          reason = 'Malleolar zone tenderness or inability to bear weight (4 steps)';
        } else if (vals.navicular_base5) {
          xRayNeeded = true;
          reason = 'Midfoot zone tenderness at 5th metatarsal base or navicular';
        }
      } else {
        if (vals.knee_age55 || vals.patella_tender || vals.fibula_tender || vals.knee_flexion || vals.knee_weight_bear) {
          xRayNeeded = true;
          reason = 'Knee tenderness, age ≥55, inability to flex to 90°, or weight-bearing failure';
        }
      }

      const severity = xRayNeeded ? 'moderate' : 'low';

      return {
        score: xRayNeeded ? 'X-RAY INDICATED' : 'NO X-RAY NEEDED',
        scoreLabel: xRayNeeded ? 'X-Ray Indicated' : 'No X-Ray Needed',
        interpretation: xRayNeeded
          ? `Ottawa Rule POSITIVE (${reason}). Plain radiographic series indicated.`
          : 'Ottawa Rule Negative. Clinically significant fracture excluded with >98% sensitivity. No X-ray necessary; mobilize with supportive splinting.',
        severity,
        formula: 'Validated clinical decision rule testing specific bony landmarks and functional weight bearing',
        details: [`Anatomic Region: ${isAnkle ? 'Ankle / Foot' : 'Knee'}`, `Radiograph Needed: ${xRayNeeded ? 'YES' : 'NO'}`],
        ehrNote: `[Ottawa Decision Rule${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Anatomical Site: ${isAnkle ? 'Ankle / Midfoot' : 'Knee'}\n- Radiography Indication: ${xRayNeeded ? 'INDICATED' : 'NOT INDICATED (Fracture Ruled Out)'}\n- Rationale: ${reason || 'Patient meets all negative criteria'}\n- Plan: ${xRayNeeded ? 'Order plain radiographs' : 'Conservative care (RICE protocol, follow-up PRN)'}`,
      };
    },
  },

  // =========================================================================
  // PREOPERATIVE RISK ASSESSMENT
  // =========================================================================
  {
    id: 'padua_score',
    title: 'Padua Prediction Score for VTE Risk in Medical/Surgical Inpatients',
    shortTitle: 'Padua VTE',
    category: 'Preoperative',
    ward: 'surgery',
    guideline: 'CHEST 2012 / ACCP Guidelines',
    description: 'Identifies hospitalized hospitalized patients at high risk of venous thromboembolism who benefit from pharmacologic thromboprophylaxis.',
    keywords: ['padua', 'vte', 'dvt', 'prophylaxis', 'lmwh', 'heparin', 'inpatient'],
    inputs: [
      { id: 'active_cancer', label: 'Active cancer (metastatic or chemotherapy/radiation in past 6 months) (3 pts)', type: 'boolean', defaultValue: false },
      { id: 'prev_vte', label: 'Previous documented VTE (excluding superficial vein thrombosis) (3 pts)', type: 'boolean', defaultValue: false },
      { id: 'reduced_mobility', label: 'Reduced mobility (bedrest with bathroom privileges ≥ 3 days) (3 pts)', type: 'boolean', defaultValue: true },
      { id: 'thrombophilia', label: 'Known thrombophilic condition (Factor V Leiden, Antiphospholipid, Protein C/S def) (3 pts)', type: 'boolean', defaultValue: false },
      { id: 'recent_trauma_surg', label: 'Recent (≤ 1 month) trauma and/or major surgery (2 pts)', type: 'boolean', defaultValue: true },
      { id: 'elderly', label: 'Elderly age (≥ 70 years) (1 pt)', type: 'boolean', defaultValue: false },
      { id: 'heart_resp_fail', label: 'Heart and/or respiratory failure (1 pt)', type: 'boolean', defaultValue: false },
      { id: 'acute_mi_stroke', label: 'Acute myocardial infarction and/or ischemic stroke (1 pt)', type: 'boolean', defaultValue: false },
      { id: 'acute_infection', label: 'Acute infection and/or rheumatologic disorder (1 pt)', type: 'boolean', defaultValue: true },
      { id: 'obesity', label: 'Obesity (BMI ≥ 30 kg/m²) (1 pt)', type: 'boolean', defaultValue: false },
      { id: 'hormonal_tx', label: 'Ongoing hormonal treatment (OCP, HRT, SERM) (1 pt)', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '< 4 pts', meaning: 'Low VTE Risk (VTE incidence ~0.3%)', action: 'Pharmacologic prophylaxis NOT recommended; early ambulation.' },
      { range: '≥ 4 pts', meaning: 'High VTE Risk (VTE incidence ~11.0%)', action: 'Pharmacologic thromboprophylaxis recommended (LMWH, LDUH, or Fondaparinux) unless high bleeding risk.' },
    ],
    calculate: (vals, patientTag) => {
      let score = 0;
      if (vals.active_cancer) score += 3;
      if (vals.prev_vte) score += 3;
      if (vals.reduced_mobility) score += 3;
      if (vals.thrombophilia) score += 3;
      if (vals.recent_trauma_surg) score += 2;
      if (vals.elderly) score += 1;
      if (vals.heart_resp_fail) score += 1;
      if (vals.acute_mi_stroke) score += 1;
      if (vals.acute_infection) score += 1;
      if (vals.obesity) score += 1;
      if (vals.hormonal_tx) score += 1;

      const isHighRisk = score >= 4;
      const severity = isHighRisk ? 'high' : 'low';
      const vteIncidence = isHighRisk ? '11.0%' : '0.3%';

      return {
        score,
        scoreLabel: `${score} pts`,
        interpretation: isHighRisk
          ? `High VTE Risk (Score ${score} ≥ 4; VTE risk without prophylaxis ~${vteIncidence}). Pharmacologic thromboprophylaxis (e.g. Enoxaparin 40 mg SC daily) strongly recommended.`
          : `Low VTE Risk (Score ${score} < 4; VTE risk ~${vteIncidence}). Pharmacologic thromboprophylaxis not indicated; mechanical prophylaxis and early ambulation.`,
        severity,
        formula: 'Sum of weighted clinical risk factors (3-pt, 2-pt, and 1-pt variables)',
        details: [`VTE Probability without Prophylaxis: ${vteIncidence}`],
        ehrNote: `[Padua VTE Prediction Score${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total Score: ${score}\n- VTE Risk Category: ${isHighRisk ? 'HIGH RISK (≥4)' : 'LOW RISK (<4)'}\n- Expected VTE Incidence: ${vteIncidence}\n- Recommendation: ${isHighRisk ? 'Initiate LMWH thromboprophylaxis' : 'Mechanical prophylaxis / early ambulation'}`,
      };
    },
  },
  {
    id: 'charlson_cci',
    title: 'Charlson Comorbidity Index (CCI) for 10-Year Mortality',
    shortTitle: 'Charlson (CCI)',
    category: 'Preoperative',
    ward: 'surgery',
    guideline: 'Journal of Chronic Diseases / Med Care Update',
    description: 'Comprehensive comorbidity scoring system predicting 10-year mortality for patients with a range of comorbid conditions, extensively used for surgical risk stratification.',
    keywords: ['charlson', 'cci', 'comorbidity', 'mortality', 'pre-op', 'surgical risk'],
    inputs: [
      { id: 'age', label: 'Patient Age', type: 'number', min: 18, max: 105, defaultValue: 66, unit: 'yrs' },
      { id: 'mi', label: 'Myocardial Infarction history (1 pt)', type: 'boolean', defaultValue: true },
      { id: 'chf', label: 'Congestive Heart Failure (1 pt)', type: 'boolean', defaultValue: false },
      { id: 'pvd', label: 'Peripheral Vascular Disease (1 pt)', type: 'boolean', defaultValue: false },
      { id: 'cva_tia', label: 'Cerebrovascular Disease (Stroke or TIA) (1 pt)', type: 'boolean', defaultValue: false },
      { id: 'dementia', label: 'Dementia (1 pt)', type: 'boolean', defaultValue: false },
      { id: 'copd', label: 'Chronic Pulmonary Disease (COPD/Asthma) (1 pt)', type: 'boolean', defaultValue: true },
      { id: 'ctd', label: 'Connective Tissue Disease (1 pt)', type: 'boolean', defaultValue: false },
      { id: 'pud', label: 'Peptic Ulcer Disease (1 pt)', type: 'boolean', defaultValue: false },
      { id: 'mild_liver', label: 'Mild Liver Disease (hepatitis, cirrhosis without portal HTN) (1 pt)', type: 'boolean', defaultValue: false },
      { id: 'uncomplicated_dm', label: 'Diabetes without end-organ damage (1 pt)', type: 'boolean', defaultValue: false },
      { id: 'complicated_dm', label: 'Diabetes with end-organ damage (nephro/retino/neuropathy) (2 pts)', type: 'boolean', defaultValue: true },
      { id: 'hemiplegia', label: 'Hemiplegia or Paraplegia (2 pts)', type: 'boolean', defaultValue: false },
      { id: 'renal_dz', label: 'Moderate-to-Severe Chronic Kidney Disease (Cr > 3 or dialysis) (2 pts)', type: 'boolean', defaultValue: false },
      { id: 'solid_tumor', label: 'Solid Tumor without metastasis (2 pts)', type: 'boolean', defaultValue: false },
      { id: 'leukemia_lymphoma', label: 'Leukemia or Lymphoma (2 pts)', type: 'boolean', defaultValue: false },
      { id: 'mod_severe_liver', label: 'Moderate-to-Severe Liver Disease (cirrhosis with ascites/varices) (3 pts)', type: 'boolean', defaultValue: false },
      { id: 'metastatic_cancer', label: 'Metastatic Solid Tumor (6 pts)', type: 'boolean', defaultValue: false },
      { id: 'aids', label: 'AIDS / HIV with defining illness (6 pts)', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: '0 pts', meaning: '10-Year Survival ~98%', action: 'Standard surgical clearance.' },
      { range: '1 - 2 pts', meaning: '10-Year Survival ~90%', action: 'Low-to-moderate comorbidity burden.' },
      { range: '3 - 4 pts', meaning: '10-Year Survival ~77%', action: 'Moderate comorbidity burden; pre-op optimization.' },
      { range: '≥ 5 pts', meaning: '10-Year Survival < 53%', action: 'High perioperative mortality risk; multidisciplinary perioperative team review.' },
    ],
    calculate: (vals, patientTag) => {
      const age = Number(vals.age);
      let score = 0;

      // Age points (1 pt per decade ≥ 50)
      if (age >= 80) score += 4;
      else if (age >= 70) score += 3;
      else if (age >= 60) score += 2;
      else if (age >= 50) score += 1;

      // 1-pt comorbidities
      if (vals.mi) score += 1;
      if (vals.chf) score += 1;
      if (vals.pvd) score += 1;
      if (vals.cva_tia) score += 1;
      if (vals.dementia) score += 1;
      if (vals.copd) score += 1;
      if (vals.ctd) score += 1;
      if (vals.pud) score += 1;
      if (vals.mild_liver && !vals.mod_severe_liver) score += 1;
      if (vals.uncomplicated_dm && !vals.complicated_dm) score += 1;

      // 2-pt comorbidities
      if (vals.complicated_dm) score += 2;
      if (vals.hemiplegia) score += 2;
      if (vals.renal_dz) score += 2;
      if (vals.solid_tumor && !vals.metastatic_cancer) score += 2;
      if (vals.leukemia_lymphoma) score += 2;

      // 3-pt comorbidities
      if (vals.mod_severe_liver) score += 3;

      // 6-pt comorbidities
      if (vals.metastatic_cancer) score += 6;
      if (vals.aids) score += 6;

      // Approximate 10-year survival probability
      const survivalPct = Math.round(100 * Math.pow(0.983, Math.exp(score * 0.9)));
      const severity = score >= 5 ? 'critical' : score >= 3 ? 'high' : score >= 1 ? 'moderate' : 'low';

      return {
        score,
        scoreLabel: `CCI: ${score} pts`,
        interpretation: `Charlson Comorbidity Index: ${score} (Estimated 10-Year Survival ~${Math.max(1, survivalPct)}%). ${score >= 5 ? 'High comorbidity burden; substantial perioperative risk.' : 'Acceptable chronic disease burden.'}`,
        severity,
        formula: 'Age-adjusted score of weighted chronic medical conditions',
        details: [`Estimated 10-Year Survival: ${Math.max(1, survivalPct)}%`],
        ehrNote: `[Charlson Comorbidity Index (CCI)${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Total Score: ${score}\n- 10-Year Survival Probability: ~${Math.max(1, survivalPct)}%\n- Risk Burden: ${severity.toUpperCase()}\n- Perioperative Plan: Pre-op medical optimization of cardiopulmonary risk factors.`,
      };
    },
  },
  {
    id: 'euroscore_ii',
    title: 'EuroSCORE II for Cardiac Surgery Mortality Risk',
    shortTitle: 'EuroSCORE II',
    category: 'Preoperative',
    ward: 'surgery',
    guideline: 'EACTS / ESC Guidelines on Cardiac Surgery',
    description: 'Calculates predicted in-hospital operative mortality for patients undergoing major adult cardiac surgery (CABG, valve replacement, aortic surgery).',
    keywords: ['euroscore', 'cardiac surgery', 'cabg', 'valve replacement', 'mortality', 'eacts'],
    inputs: [
      { id: 'age', label: 'Age (years)', type: 'number', min: 18, max: 95, defaultValue: 68, unit: 'yrs' },
      { id: 'female', label: 'Female Sex', type: 'boolean', defaultValue: false },
      { id: 'renal_impairment', label: 'Renal Impairment', type: 'select', defaultValue: 'normal', options: [
        { label: 'Normal (CrCl > 85 mL/min)', value: 'normal' },
        { label: 'Moderate (CrCl 50 - 85 mL/min)', value: 'moderate' },
        { label: 'Severe (CrCl < 50 mL/min)', value: 'severe' },
        { label: 'Dialysis dependent', value: 'dialysis' },
      ]},
      { id: 'extracardiac_arteriopathy', label: 'Extracardiac Arteriopathy (claudication, carotid stenosis > 50%)', type: 'boolean', defaultValue: false },
      { id: 'poor_mobility', label: 'Poor Mobility (severe impairment of movement)', type: 'boolean', defaultValue: false },
      { id: 'previous_cardiac_surg', label: 'Previous Cardiac Surgery (re-operation)', type: 'boolean', defaultValue: false },
      { id: 'chronic_lung_disease', label: 'Chronic Lung Disease (long-term bronchodilators/steroids)', type: 'boolean', defaultValue: false },
      { id: 'active_endocarditis', label: 'Active Infective Endocarditis on antibiotic therapy', type: 'boolean', defaultValue: false },
      { id: 'critical_preop_state', label: 'Critical Preoperative State (inotropes, IABP, ventricular tachycardia/arrest)', type: 'boolean', defaultValue: false },
      { id: 'lvef', label: 'Left Ventricular Ejection Fraction', type: 'select', defaultValue: 'good', options: [
        { label: 'Good (LVEF > 50%)', value: 'good' },
        { label: 'Moderate (LVEF 31 - 50%)', value: 'moderate' },
        { label: 'Poor (LVEF 21 - 30%)', value: 'poor' },
        { label: 'Very Poor (LVEF ≤ 20%)', value: 'very_poor' },
      ]},
      { id: 'urgency', label: 'Urgency of Procedure', type: 'select', defaultValue: 'elective', options: [
        { label: 'Elective (routine planned admission)', value: 'elective' },
        { label: 'Urgent (not electively scheduled, requires surgery during admission)', value: 'urgent' },
        { label: 'Emergency (before next working day)', value: 'emergency' },
        { label: 'Salvage (CPR en route to operating room)', value: 'salvage' },
      ]},
    ],
    cutoffs: [
      { range: '< 2%', meaning: 'Low Operative Mortality Risk', action: 'Standard cardiac surgical protocol.' },
      { range: '2% - 5%', meaning: 'Moderate Risk', action: 'Routine cardiac ICU recovery.' },
      { range: '> 5%', meaning: 'High Operative Mortality Risk', action: 'Multidisciplinary Heart Team review; consider transcatheter alternative (e.g. TAVI) if feasible.' },
    ],
    calculate: (vals, patientTag) => {
      const age = Number(vals.age);
      let beta = -4.789594;

      // Age contribution
      if (age > 60) beta += (age - 60) * 0.0285181;
      if (vals.female) beta += 0.21964;

      // Renal
      if (vals.renal_impairment === 'moderate') beta += 0.303553;
      else if (vals.renal_impairment === 'severe') beta += 0.859226;
      else if (vals.renal_impairment === 'dialysis') beta += 0.642153;

      if (vals.extracardiac_arteriopathy) beta += 0.536027;
      if (vals.poor_mobility) beta += 0.240718;
      if (vals.previous_cardiac_surg) beta += 1.118599;
      if (vals.chronic_lung_disease) beta += 0.188656;
      if (vals.active_endocarditis) beta += 0.619452;
      if (vals.critical_preop_state) beta += 1.086517;

      // LVEF
      if (vals.lvef === 'moderate') beta += 0.315065;
      else if (vals.lvef === 'poor') beta += 0.808409;
      else if (vals.lvef === 'very_poor') beta += 0.934692;

      // Urgency
      if (vals.urgency === 'urgent') beta += 0.317467;
      else if (vals.urgency === 'emergency') beta += 0.70391;
      else if (vals.urgency === 'salvage') beta += 1.362947;

      const riskPct = Math.round((Math.exp(beta) / (1 + Math.exp(beta))) * 1000) / 10;
      const severity = riskPct > 5.0 ? 'high' : riskPct >= 2.0 ? 'moderate' : 'low';

      return {
        score: `${riskPct.toFixed(1)}%`,
        scoreLabel: `Mortality: ${riskPct.toFixed(1)}%`,
        interpretation: `Predicted In-Hospital Operative Mortality: ${riskPct.toFixed(1)}%. ${riskPct > 5 ? 'High risk cardiac surgical candidate. Heart Team conference recommended to weigh surgical vs transcatheter/medical intervention.' : 'Acceptable operative risk profile.'}`,
        severity,
        formula: 'EACTS EuroSCORE II logistic regression model incorporating patient, cardiac, and procedural factors',
        details: [`Estimated Operative Mortality: ${riskPct.toFixed(1)}%`],
        ehrNote: `[EuroSCORE II Cardiac Surgery Risk${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Predicted Operative Mortality: ${riskPct.toFixed(1)}%\n- Risk Tier: ${severity.toUpperCase()}\n- Clinical Plan: ${riskPct > 5 ? 'Heart Team discussion (consider TAVR/PCI vs surgical CABG/valve)' : 'Proceed with planned cardiac surgery'}`,
      };
    },
  },

  // =========================================================================
  // GENERAL / GI SURGERY
  // =========================================================================
  {
    id: 'bosniak_renal',
    title: 'Bosniak Classification of Cystic Renal Masses (Version 2019)',
    shortTitle: 'Bosniak Cysts',
    category: 'General / GI Surgery',
    ward: 'surgery',
    guideline: 'Radiology / American Urological Association (AUA)',
    description: 'CT and MRI-based classification of complex cystic renal lesions predicting malignancy risk to direct observation vs surgical resection.',
    keywords: ['bosniak', 'renal cyst', 'kidney', 'urology', 'nephrectomy', 'ct'],
    inputs: [
      { id: 'class_select', label: 'Imaging Characteristics of Renal Cyst', type: 'select', defaultValue: 'II', options: [
        { label: 'Category I: Simple benign cyst (hairline-thin wall, water attenuation, no calcification/enhancement)', value: 'I' },
        { label: 'Category II: Minimally complex benign (few thin septa <1 mm, fine calcification, high-attenuation hyperdense <3 cm)', value: 'II' },
        { label: 'Category IIF: Moderately complex ("F" = Follow-up; multiple thin septa, minimal thickening, hyperdense ≥3 cm)', value: 'IIF' },
        { label: 'Category III: Indeterminate cystic mass (thick/irregular walls or septa >2 mm with measurable enhancement)', value: 'III' },
        { label: 'Category IV: Clearly malignant cystic mass (enhancing soft-tissue solid nodules along wall or septa)', value: 'IV' },
      ]},
    ],
    cutoffs: [
      { range: 'Category I / II', meaning: 'Benign (Malignancy risk ~0%)', action: 'No follow-up or treatment needed.' },
      { range: 'Category IIF', meaning: 'Minimally complex (Malignancy risk ~5%)', action: 'Surveillance CT/MRI at 6 and 12 months, then annually for 5 years.' },
      { range: 'Category III', meaning: 'Indeterminate (Malignancy risk ~50%)', action: 'Partial nephrectomy or thermal ablation vs active surveillance.' },
      { range: 'Category IV', meaning: 'Malignant Cystic Neoplasm (Malignancy risk ~90%)', action: 'Surgical excision (partial or radical nephrectomy).' },
    ],
    calculate: (vals, patientTag) => {
      const cls = vals.class_select as string;
      const riskMap: Record<string, { risk: string; sev: 'low' | 'moderate' | 'high' | 'critical'; action: string }> = {
        I: { risk: '~0%', sev: 'low', action: 'Benign simple cyst. No further imaging or intervention required.' },
        II: { risk: '~0%', sev: 'low', action: 'Benign minimally complex cyst. No follow-up needed.' },
        IIF: { risk: '~5%', sev: 'moderate', action: 'Low risk of malignancy. Recommend surveillance imaging at 6 and 12 months.' },
        III: { risk: '~50%', sev: 'high', action: 'High probability of malignancy. Surgical consultation for partial nephrectomy or ablation.' },
        IV: { risk: '~90%', sev: 'critical', action: 'Malignant cystic RCC. Surgical oncologic resection strongly indicated.' },
      };
      const info = riskMap[cls] || riskMap.I;

      return {
        score: `Bosniak ${cls}`,
        scoreLabel: `Category ${cls}`,
        interpretation: `Bosniak Category ${cls} (Malignancy Risk ${info.risk}). ${info.action}`,
        severity: info.sev,
        formula: 'Contrast-enhanced CT/MRI assessment of wall thickness, septa, calcification, and nodular enhancement',
        details: [`Malignancy Probability: ${info.risk}`],
        ehrNote: `[Bosniak Renal Cyst Classification${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Classification: Bosniak Category ${cls}\n- Estimated Malignancy Risk: ${info.risk}\n- Urological Recommendation: ${info.action}`,
      };
    },
  },
  {
    id: 'hinchey_diverticulitis',
    title: 'Hinchey Classification of Acute Diverticulitis',
    shortTitle: 'Hinchey Diverticulitis',
    category: 'General / GI Surgery',
    ward: 'surgery',
    guideline: 'WSES 2020 / ASCRS Diverticular Disease',
    description: 'CT-based severity staging of perforated colonic diverticulitis to determine medical antibiotic therapy, percutaneous drainage, or emergency surgery.',
    keywords: ['hinchey', 'diverticulitis', 'colon', 'perforation', 'hartmann', 'peritonitis'],
    inputs: [
      { id: 'stage', label: 'CT Findings & Peritoneal Pathology', type: 'select', defaultValue: 'Ia', options: [
        { label: 'Stage 0: Mild uncomplicated diverticulitis (colonic wall thickening, pericolic fat stranding)', value: '0' },
        { label: 'Stage Ia: Confined pericolic inflammation / phlegmon, no abscess', value: 'Ia' },
        { label: 'Stage Ib: Confined pericolic or mesocolic abscess (< 4-5 cm)', value: 'Ib' },
        { label: 'Stage II: Distant pelvic, intra-abdominal, or retroperitoneal abscess', value: 'II' },
        { label: 'Stage III: Generalized purulent peritonitis (ruptured abscess, no fecal contamination)', value: 'III' },
        { label: 'Stage IV: Generalized feculent peritonitis (open perforation with free bowel content)', value: 'IV' },
      ]},
    ],
    cutoffs: [
      { range: 'Stage 0 / Ia', meaning: 'Uncomplicated / Phlegmon', action: 'Outpatient or inpatient oral/IV antibiotics; bowel rest.' },
      { range: 'Stage Ib / II', meaning: 'Abscess Formation', action: 'IV antibiotics; percutaneous catheter drainage (PCD) if abscess ≥ 3-4 cm.' },
      { range: 'Stage III / IV', meaning: 'Generalized Peritonitis (Purulent / Feculent)', action: 'Emergency laparotomy: resection with primary anastomosis ± loop ileostomy vs Hartmann\'s procedure.' },
    ],
    calculate: (vals, patientTag) => {
      const stg = vals.stage as string;
      const map: Record<string, { sev: 'low' | 'moderate' | 'high' | 'critical'; rec: string }> = {
        '0': { sev: 'low', rec: 'Uncomplicated diverticulitis. Conservative therapy with oral antibiotics or observation.' },
        'Ia': { sev: 'low', rec: 'Pericolic phlegmon. Inpatient IV antibiotics, bowel rest, serial abdominal exams.' },
        'Ib': { sev: 'moderate', rec: 'Pericolic abscess. IV antibiotics; percutaneous drainage if abscess ≥ 3-4 cm.' },
        'II': { sev: 'high', rec: 'Distant pelvic/retroperitoneal abscess. CT-guided percutaneous drainage + IV broad-spectrum antibiotics.' },
        'III': { sev: 'critical', rec: 'Purulent peritonitis. Emergent surgical intervention (laparoscopic lavage vs resection).' },
        'IV': { sev: 'critical', rec: 'Feculent peritonitis. Emergent Hartmann\'s procedure / resection, ICU resuscitation.' },
      };
      const info = map[stg] || map['0'];

      return {
        score: `Stage ${stg}`,
        scoreLabel: `Stage ${stg}`,
        interpretation: `Hinchey Stage ${stg}: ${info.rec}`,
        severity: info.sev,
        formula: 'CT staging from localized phlegmon (I) to pelvic abscess (II) and generalized purulent/feculent peritonitis (III/IV)',
        details: [`Surgical Urgency: ${info.sev.toUpperCase()}`],
        ehrNote: `[Hinchey Diverticulitis Classification${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Hinchey Stage: Stage ${stg}\n- Management Strategy: ${info.rec}`,
      };
    },
  },
  {
    id: 'milan_criteria',
    title: 'Milan Criteria for Liver Transplantation in HCC',
    shortTitle: 'Milan HCC Criteria',
    category: 'General / GI Surgery',
    ward: 'surgery',
    guideline: 'AASLD / EASL Hepatocellular Carcinoma',
    description: 'Gold standard criteria defining eligibility and exceptional organ allocation for liver transplantation in cirrhotic patients with hepatocellular carcinoma (HCC).',
    keywords: ['milan', 'hcc', 'hepatoma', 'liver transplant', 'cirrhosis', 'aasld'],
    inputs: [
      { id: 'tumor_pattern', label: 'Tumor Burden on Contrast Imaging (CT/MRI)', type: 'select', defaultValue: 'single_under_5', options: [
        { label: 'Single solitary lesion ≤ 5.0 cm', value: 'single_under_5' },
        { label: 'Up to 3 lesions, each ≤ 3.0 cm', value: 'three_under_3' },
        { label: 'Single lesion > 5.0 cm', value: 'single_over_5' },
        { label: 'More than 3 lesions (any size)', value: 'over_three' },
        { label: 'Any lesion > 3.0 cm when multiple', value: 'multiple_over_3' },
      ]},
      { id: 'macrovascular_invasion', label: 'Macrovascular invasion (portal or hepatic vein invasion)', type: 'boolean', defaultValue: false },
      { id: 'extrahepatic_spread', label: 'Extrahepatic metastatic spread (lymph nodes, lung, bone)', type: 'boolean', defaultValue: false },
    ],
    cutoffs: [
      { range: 'Within Milan Criteria', meaning: 'Excellent Post-Transplant Survival (~70% 5-year survival)', action: 'Eligible for liver transplantation listing with MELD exception points.' },
      { range: 'Exceeds Milan Criteria', meaning: 'High Recurrence Risk Post-Transplant', action: 'Consider locoregional downstaging (TACE/Y90) to meet Milan, systemic therapy, or resection.' },
    ],
    calculate: (vals, patientTag) => {
      const isPatternEligible = vals.tumor_pattern === 'single_under_5' || vals.tumor_pattern === 'three_under_3';
      const hasInvasion = Boolean(vals.macrovascular_invasion);
      const hasMets = Boolean(vals.extrahepatic_spread);

      const withinMilan = isPatternEligible && !hasInvasion && !hasMets;
      const severity = withinMilan ? 'low' : 'high';

      return {
        score: withinMilan ? 'WITHIN MILAN' : 'EXCEEDS MILAN',
        scoreLabel: withinMilan ? 'Within Milan' : 'Exceeds Milan',
        interpretation: withinMilan
          ? 'Patient meets Milan Criteria for HCC liver transplantation. Favorable 5-year survival (~70%) with low recurrence rate. Eligible for UNOS/MELD exception points.'
          : 'Patient exceeds Milan Criteria (tumor burden, vascular invasion, or extrahepatic disease). Consider locoregional downstaging (TACE/TBR) or systemic atezolizumab+bevacizumab.',
        severity,
        formula: 'Solitary tumor ≤ 5 cm OR up to 3 tumors all ≤ 3 cm, WITHOUT vascular invasion or extrahepatic spread',
        details: [
          `Tumor Size/Count: ${isPatternEligible ? 'Eligible' : 'Exceeds Size/Number Limits'}`,
          `Vascular Invasion: ${hasInvasion ? 'Present' : 'Absent'}`,
          `Extrahepatic Disease: ${hasMets ? 'Present' : 'Absent'}`,
        ],
        ehrNote: `[Milan Criteria for HCC Liver Transplant${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Status: ${withinMilan ? 'WITHIN MILAN CRITERIA (Eligible)' : 'EXCEEDS MILAN CRITERIA'}\n- 5-Year Survival Expectancy: ${withinMilan ? '~70%' : 'High recurrence risk'}\n- Plan: ${withinMilan ? 'List for liver transplantation with exception points' : 'Locoregional downstaging or systemic therapy'}`,
      };
    },
  },
  {
    id: 'clavien_dindo',
    title: 'Clavien-Dindo Classification of Surgical Complications',
    shortTitle: 'Clavien-Dindo',
    category: 'General / GI Surgery',
    ward: 'surgery',
    guideline: 'Annals of Surgery / European Surgical Association',
    description: 'International gold standard for reporting post-operative surgical morbidity based on the invasiveness of therapy required to manage the complication.',
    keywords: ['clavien-dindo', 'surgical complications', 'morbidity', 're-operation', 'post-op'],
    inputs: [
      { id: 'grade_select', label: 'Intervention Required to Treat Complication', type: 'select', defaultValue: 'II', options: [
        { label: 'Grade I: Any deviation from normal post-op course not requiring meds/intervention (antiemetics, antipyretics, analgesics allowed)', value: 'I' },
        { label: 'Grade II: Requiring pharmacological treatment (antibiotics, blood transfusion, TPN)', value: 'II' },
        { label: 'Grade IIIa: Requiring intervention under local/regional anesthesia', value: 'IIIa' },
        { label: 'Grade IIIb: Requiring intervention under general anesthesia (re-operation)', value: 'IIIb' },
        { label: 'Grade IVa: Life-threatening single-organ dysfunction (ICU admission, dialysis, inotropes)', value: 'IVa' },
        { label: 'Grade IVb: Life-threatening multiorgan dysfunction', value: 'IVb' },
        { label: 'Grade V: Death of the patient', value: 'V' },
      ]},
    ],
    cutoffs: [
      { range: 'Grade I - II', meaning: 'Minor Surgical Complication', action: 'Medical management on surgical ward.' },
      { range: 'Grade III', meaning: 'Major Complication Requiring Intervention', action: 'Surgical re-exploration, percutaneous drainage, or endoscopic stent.' },
      { range: 'Grade IV', meaning: 'Life-Threatening Organ Failure', action: 'ICU resuscitation, organ support.' },
      { range: 'Grade V', meaning: 'Mortality', action: 'Morbidity & Mortality (M&M) review.' },
    ],
    calculate: (vals, patientTag) => {
      const g = vals.grade_select as string;
      const isMinor = g === 'I' || g === 'II';
      const severity = g === 'V' ? 'neutral' : g.startsWith('IV') ? 'critical' : g.startsWith('III') ? 'high' : 'low';

      return {
        score: `Grade ${g}`,
        scoreLabel: `Grade ${g}`,
        interpretation: `Clavien-Dindo Grade ${g} Complication (${isMinor ? 'Minor Complication' : 'Major Complication'}). Document in quality assurance / M&M log.`,
        severity,
        formula: 'Graded by the therapy required: medication (II), interventional/surgical repair (III), ICU organ support (IV), or death (V)',
        details: [`Complication Severity Tier: ${isMinor ? 'MINOR (I-II)' : 'MAJOR (III-V)'}`],
        ehrNote: `[Clavien-Dindo Surgical Morbidity Grade${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Complication Grade: Grade ${g}\n- Severity Category: ${isMinor ? 'Minor (managed medically)' : 'Major (requiring intervention or ICU)'}\n- Clinical Action: Document in surgical quality registry.`,
      };
    },
  },

  // =========================================================================
  // ORTHOPEDIC / WOUND / VASCULAR
  // =========================================================================
  {
    id: 'gustilo_anderson',
    title: 'Gustilo-Anderson Classification of Open Fractures',
    shortTitle: 'Gustilo-Anderson',
    category: 'Orthopedic / Wound',
    ward: 'surgery',
    guideline: 'Journal of Bone and Joint Surgery (JBJS) / OTA',
    description: 'Classifies open fractures by wound size, soft-tissue stripping, contamination, and neurovascular status to guide urgent prophylactic antibiotic coverage and surgical debridement timing.',
    keywords: ['gustilo', 'open fracture', 'orthopedics', 'wound', 'antibiotics', 'cefazolin', 'gentamicin'],
    inputs: [
      { id: 'type_select', label: 'Wound Size & Soft Tissue Injury Characteristics', type: 'select', defaultValue: 'II', options: [
        { label: 'Type I: Clean wound < 1 cm, minimal soft tissue damage, simple fracture pattern', value: 'I' },
        { label: 'Type II: Wound 1 - 10 cm, moderate soft tissue injury, minimal periosteal stripping', value: 'II' },
        { label: 'Type IIIa: Wound > 10 cm with adequate soft tissue coverage of bone despite extensive laceration', value: 'IIIa' },
        { label: 'Type IIIb: Extensive soft tissue loss with periosteal stripping and exposed bone requiring free/rotational flap', value: 'IIIb' },
        { label: 'Type IIIc: Open fracture associated with arterial injury requiring vascular repair for limb salvage', value: 'IIIc' },
      ]},
    ],
    cutoffs: [
      { range: 'Type I', meaning: 'Infection Rate ~1-2%', action: '1st gen Cephalosporin (Cefazolin) for 24h post-closure; debride within 24h.' },
      { range: 'Type II', meaning: 'Infection Rate ~2-7%', action: 'Cefazolin for 48h; urgent formal OR irrigation and debridement.' },
      { range: 'Type IIIa / b', meaning: 'Infection Rate ~10-25%', action: 'Gram-positive + Gram-negative coverage (Cefazolin + Aminoglycoside, or Ceftriaxone); repeat debridements.' },
      { range: 'Type IIIc', meaning: 'Infection Rate 25-50%, Amputation Risk', action: 'Emergent vascular revascularization within 6h, fasciotomy, broad-spectrum IV antibiotics.' },
    ],
    calculate: (vals, patientTag) => {
      const t = vals.type_select as string;
      const isType3 = t.startsWith('III');
      const severity = t === 'IIIc' ? 'critical' : isType3 ? 'high' : t === 'II' ? 'moderate' : 'low';

      const abxMap: Record<string, string> = {
        'I': 'Cefazolin 2g IV q8h for 24 hours post-closure.',
        'II': 'Cefazolin 2g IV q8h for 48 hours.',
        'IIIa': 'Cefazolin 2g IV q8h + Gentamicin 5 mg/kg IV daily (or Ceftriaxone 2g IV daily). Add Penicillin G if farm/soil contamination.',
        'IIIb': 'Cefazolin + Gentamicin. Plan flap coverage within 7 days.',
        'IIIc': 'Cefazolin + Gentamicin. Emergent revascularization (<6h warm ischemia); perform prophylactic fasciotomy.',
      };

      return {
        score: `Gustilo ${t}`,
        scoreLabel: `Type ${t}`,
        interpretation: `Gustilo-Anderson Type ${t}: ${abxMap[t] || 'Broad-spectrum IV antibiotics and surgical debridement.'}`,
        severity,
        formula: 'Wound size (<1cm, 1-10cm, >10cm), degree of soft tissue stripping, and presence of arterial injury',
        details: [`Antimicrobial Regimen: ${abxMap[t]}`],
        ehrNote: `[Gustilo-Anderson Open Fracture Classification${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Fracture Severity: Gustilo-Anderson Type ${t}\n- Prophylactic Antibiotic Regimen: ${abxMap[t]}\n- Operative Timing: ${t === 'IIIc' ? 'Emergent vascular exploration' : 'Urgent OR irrigation and debridement'}`,
      };
    },
  },
  {
    id: 'wagner_diabetic_foot',
    title: 'Wagner Ulcer Classification for Diabetic Foot Infection',
    shortTitle: 'Wagner Foot Ulcer',
    category: 'Orthopedic / Wound',
    ward: 'surgery',
    guideline: 'IWGDF / American Diabetes Association (ADA)',
    description: 'Grades depth and presence of osteomyelitis or gangrene in diabetic foot ulcers to direct offloading, surgical debridement, and amputation level.',
    keywords: ['wagner', 'diabetic foot', 'ulcer', 'osteomyelitis', 'gangrene', 'amputation'],
    inputs: [
      { id: 'grade_select', label: 'Diabetic Foot Ulcer Characteristics', type: 'select', defaultValue: '2', options: [
        { label: 'Grade 0: Pre-ulcerative lesion, healed ulcer, presence of bony deformity (Charcot, claw toes)', value: '0' },
        { label: 'Grade 1: Superficial ulcer involving partial/full skin thickness, no subcutaneous tissue involvement', value: '1' },
        { label: 'Grade 2: Deep ulcer penetrating to tendon, bone, or joint capsule without abscess or osteomyelitis', value: '2' },
        { label: 'Grade 3: Deep ulcer with abscess, osteomyelitis, or joint sepsis', value: '3' },
        { label: 'Grade 4: Localized gangrene (forefoot or heel)', value: '4' },
        { label: 'Grade 5: Extensive gangrene involving whole foot', value: '5' },
      ]},
    ],
    cutoffs: [
      { range: 'Grade 0 - 1', meaning: 'Low Amputation Risk', action: 'Total contact casting / pressure offloading, wound care.' },
      { range: 'Grade 2', meaning: 'Moderate Risk', action: 'Surgical debridement of necrotic tissue, probe-to-bone evaluation.' },
      { range: 'Grade 3', meaning: 'High Risk (Osteomyelitis / Abscess)', action: 'Inpatient admission, IV antibiotics, surgical bone debridement/resection.' },
      { range: 'Grade 4 - 5', meaning: 'Critical (Gangrene)', action: 'Urgent amputation (partial foot or major below/above knee).' },
    ],
    calculate: (vals, patientTag) => {
      const g = vals.grade_select as string;
      const severity = Number(g) >= 4 ? 'critical' : Number(g) === 3 ? 'high' : Number(g) === 2 ? 'moderate' : 'low';
      const planMap: Record<string, string> = {
        '0': 'Offloading footwear, custom orthotics, diabetic foot education.',
        '1': 'Offloading, moist wound dressing, optimize glycemic control.',
        '2': 'Sharp debridement, probe-to-bone test, offloading cast.',
        '3': 'IV broad-spectrum antibiotics, urgent surgical drainage/bone resection for osteomyelitis.',
        '4': 'Vascular consult, non-invasive arterial Doppler, minor/forefoot amputation.',
        '5': 'Major lower extremity amputation (transtibial or transfemoral), sepsis management.',
      };

      return {
        score: `Wagner Grade ${g}`,
        scoreLabel: `Grade ${g}`,
        interpretation: `Wagner Grade ${g}: ${planMap[g]}`,
        severity,
        formula: 'Progressive anatomical depth staging from superficial (1) to deep/tendon (2), osteomyelitis (3), and gangrene (4/5)',
        details: [`Treatment Strategy: ${planMap[g]}`],
        ehrNote: `[Wagner Diabetic Foot Ulcer Staging${patientTag ? ` - Bed ${patientTag}` : ''}]\n- Wagner Grade: Grade ${g}\n- Risk Category: ${severity.toUpperCase()}\n- Recommended Intervention: ${planMap[g]}`,
      };
    },
  },
];
