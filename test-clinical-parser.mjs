import assert from 'node:assert';
import {
  parseClinicalText,
  parseCsvLabs,
  matchClinicalCalculators,
} from './src/utils/clinicalParser.ts';

console.log('\n--- VERIFYING CLINICAL AI ENTITY PARSER & AUTO-ROUTER ---');

// Test 1: Electrolytes & Metabolic Free Text
{
  const text = 'Patient has Na: 128, K: 5.2, Cl: 96, HCO3: 16, BUN: 34, Cr: 2.1, Glucose: 350. Pt is 68yo male, wt 78kg.';
  const entities = parseClinicalText(text);
  assert.strictEqual(entities.na, 128, 'Na should be 128');
  assert.strictEqual(entities.k, 5.2, 'K should be 5.2');
  assert.strictEqual(entities.cl, 96, 'Cl should be 96');
  assert.strictEqual(entities.hco3, 16, 'HCO3 should be 16');
  assert.strictEqual(entities.bun, 34, 'BUN should be 34');
  assert.strictEqual(entities.cr, 2.1, 'Cr should be 2.1');
  assert.strictEqual(entities.glucose, 350, 'Glucose should be 350');
  assert.strictEqual(entities.age, 68, 'Age should be 68');
  assert.strictEqual(entities.sex, 'male', 'Sex should be male');
  assert.strictEqual(entities.weightKg, 78, 'Weight should be 78kg');

  const matches = matchClinicalCalculators(entities);
  const matchedToolIds = matches.map((m) => m.toolId);
  assert.ok(matchedToolIds.includes('electrolytes'), 'Must match electrolytes suite');
  assert.ok(matchedToolIds.includes('ckd_crcl'), 'Must match CKD-EPI suite');

  const lyteMatch = matches.find((m) => m.toolId === 'electrolytes');
  assert.strictEqual(lyteMatch.prefillPayload.na, 128);
  assert.strictEqual(lyteMatch.prefillPayload.glucose, 350);

  const ckdMatch = matches.find((m) => m.toolId === 'ckd_crcl');
  assert.strictEqual(ckdMatch.prefillPayload.scrMgDl, 2.1);
  assert.strictEqual(ckdMatch.prefillPayload.age, 68);
  assert.strictEqual(ckdMatch.prefillPayload.sex, 'male');
  console.log('✓ PASS: Electrolytes & Renal free text parsing & matching verified');
}

// Test 2: CSV Lab Analyzer Data
{
  const csv = `Analyte,Result,Units
Sodium,135,mEq/L
Potassium,4.1,mEq/L
Chloride,102,mEq/L
Bicarbonate,24,mEq/L
Blood Urea Nitrogen,18,mg/dL
Creatinine,0.95,mg/dL
Glucose,110,mg/dL
Albumin,4.2,g/dL`;

  const entities = parseCsvLabs(csv);
  assert.strictEqual(entities.na, 135);
  assert.strictEqual(entities.k, 4.1);
  assert.strictEqual(entities.cl, 102);
  assert.strictEqual(entities.hco3, 24);
  assert.strictEqual(entities.bun, 18);
  assert.strictEqual(entities.cr, 0.95);
  assert.strictEqual(entities.glucose, 110);
  assert.strictEqual(entities.albumin, 4.2);

  const matches = matchClinicalCalculators(entities);
  assert.ok(matches.some((m) => m.toolId === 'electrolytes'));
  assert.ok(matches.some((m) => m.toolId === 'ckd_crcl'));
  console.log('✓ PASS: CSV laboratory analyzer format parsing & prefill verified');
}

// Test 3: Acute Burn Trauma
{
  const text = '35yo female, 60kg, sustained 28% TBSA second and third degree burns 2 hours post burn.';
  const entities = parseClinicalText(text);
  assert.strictEqual(entities.tbsaPercent, 28);
  assert.strictEqual(entities.weightKg, 60);
  assert.strictEqual(entities.timeSinceInjuryHours, 2);
  assert.strictEqual(entities.sex, 'female');
  assert.strictEqual(entities.age, 35);

  const matches = matchClinicalCalculators(entities);
  const burnMatch = matches.find((m) => m.toolId === 'parkland_burn');
  assert.ok(burnMatch, 'Must match parkland burn');
  assert.strictEqual(burnMatch.prefillPayload.tbsaPercent, 28);
  assert.strictEqual(burnMatch.prefillPayload.weightKg, 60);
  console.log('✓ PASS: Acute Burn trauma parameters parsed & matched to Parkland calculator');
}

// Test 4: CURB-65 Pneumonia Triage
{
  const text = '72 year old gentleman with fever, BP 82/50, RR 34, BUN 28, altered mental status.';
  const entities = parseClinicalText(text);
  assert.strictEqual(entities.age, 72);
  assert.strictEqual(entities.sbp, 82);
  assert.strictEqual(entities.dbp, 50);
  assert.strictEqual(entities.rr, 34);
  assert.strictEqual(entities.bun, 28);

  const matches = matchClinicalCalculators(entities);
  const curbMatch = matches.find((m) => m.toolId === 'curb65');
  assert.ok(curbMatch, 'Must match CURB-65');
  assert.strictEqual(curbMatch.prefillPayload.age65, true);
  assert.strictEqual(curbMatch.prefillPayload.rrElevated, true);
  assert.strictEqual(curbMatch.prefillPayload.bunElevated, true);
  assert.strictEqual(curbMatch.prefillPayload.lowBp, true);
  console.log('✓ PASS: CURB-65 pneumonia severity risk criteria extracted');
}

// Test 5: OB/GYN Ultrasound Dating
{
  const text = 'Transvaginal scan shows single intrauterine gestation with CRL 33.5 mm, LMP 2026-06-15.';
  const entities = parseClinicalText(text);
  assert.strictEqual(entities.crlMm, 33.5);
  assert.strictEqual(entities.lmpDate, '2026-06-15');

  const matches = matchClinicalCalculators(entities);
  const datingMatch = matches.find((m) => m.toolId === 'dating');
  assert.ok(datingMatch, 'Must match dating');
  assert.strictEqual(datingMatch.prefillPayload.crl, 33.5);
  assert.strictEqual(datingMatch.prefillPayload.lmpDate, '2026-06-15');
  console.log('✓ PASS: OB/GYN CRL & LMP parameters extracted & routed to ACOG Dating');
}

// Test 6: Pediatric Vitals
{
  const text = '6yo girl, weight 22kg, blood pressure 124/82 mmHg, HR 118.';
  const entities = parseClinicalText(text);
  assert.strictEqual(entities.pediatricAgeYears, 6);
  assert.strictEqual(entities.pediatricWeightKg, 22);
  assert.strictEqual(entities.sbp, 124);
  assert.strictEqual(entities.dbp, 82);
  assert.strictEqual(entities.sex, 'female');

  const matches = matchClinicalCalculators(entities);
  assert.ok(matches.some((m) => m.toolId === 'pediatric_bp_vitals'));
  assert.ok(matches.some((m) => m.toolId === 'holliday_segar'));
  console.log('✓ PASS: Pediatric vitals & weight extracted and routed to Peds calculators');
}

// Test 7: Horizontal Tabular CSV Format
{
  const csv = `Patient,Na,K,Cl,HCO3,BUN,Cr,Glucose
Pt101,138,4.2,101,24,18,1.1,110`;
  const entities = parseCsvLabs(csv);
  assert.strictEqual(entities.na, 138, 'Na should be 138 from tabular CSV');
  assert.strictEqual(entities.k, 4.2, 'K should be 4.2 from tabular CSV');
  assert.strictEqual(entities.cl, 101, 'Cl should be 101 from tabular CSV');
  assert.strictEqual(entities.hco3, 24, 'HCO3 should be 24 from tabular CSV');
  assert.strictEqual(entities.bun, 18, 'BUN should be 18 from tabular CSV');
  assert.strictEqual(entities.cr, 1.1, 'Cr should be 1.1 from tabular CSV');
  assert.strictEqual(entities.glucose, 110, 'Glucose should be 110 from tabular CSV');
  console.log('✓ PASS: Horizontal Tabular CSV format parsing verified');
}

// Test 8: Standalone Blood Pressure Without Explicit "BP" Prefix
{
  const text = 'Patient vitals upon admission: 138/86 mmHg, HR 78, RR 16, afebrile.';
  const entities = parseClinicalText(text);
  assert.strictEqual(entities.sbp, 138, 'SBP should be 138');
  assert.strictEqual(entities.dbp, 86, 'DBP should be 86');
  assert.strictEqual(entities.hr, 78, 'HR should be 78');
  assert.strictEqual(entities.rr, 16, 'RR should be 16');
  console.log('✓ PASS: Standalone slash blood pressure without "BP" keyword verified');
}

// Test 9: Appendicitis Signs Extraction & Routing
{
  const text = 'Patient presents with severe RLQ tenderness, rebound pain, and fever 38.2 C.';
  const entities = parseClinicalText(text);
  assert.strictEqual(entities.rlqTenderness, true);
  assert.strictEqual(entities.reboundPain, true);
  assert.strictEqual(entities.tempC, 38.2);

  const matches = matchClinicalCalculators(entities);
  const appMatch = matches.find((m) => m.toolId === 'appendicitis');
  assert.ok(appMatch, 'Must match appendicitis');
  assert.strictEqual(appMatch.prefillPayload.rlqTenderness, true);
  assert.strictEqual(appMatch.prefillPayload.rebound, true);
  assert.strictEqual(appMatch.prefillPayload.fever, true);
  console.log('✓ PASS: Appendicitis signs extraction & routing verified');
}

// Test 10: Preeclampsia Parameters Extraction & Routing
{
  const text = 'Pregnant 34w female with severe blood pressure 168/108 mmHg, headache (+), visual changes, platelets 85k, creatinine 1.3.';
  const entities = parseClinicalText(text);
  assert.strictEqual(entities.sbp, 168);
  assert.strictEqual(entities.dbp, 108);
  assert.strictEqual(entities.headache, true);
  assert.strictEqual(entities.visualChanges, true);
  assert.strictEqual(entities.platelets, 85);
  assert.strictEqual(entities.cr, 1.3);

  const matches = matchClinicalCalculators(entities);
  const preeclMatch = matches.find((m) => m.toolId === 'preeclampsia');
  assert.ok(preeclMatch, 'Must match preeclampsia');
  assert.strictEqual(preeclMatch.prefillPayload.sbp, 168);
  assert.strictEqual(preeclMatch.prefillPayload.dbp, 108);
  assert.strictEqual(preeclMatch.prefillPayload.headache, true);
  assert.strictEqual(preeclMatch.prefillPayload.visionChanges, true);
  assert.strictEqual(preeclMatch.prefillPayload.platelets, 85);
  console.log('✓ PASS: Preeclampsia severe features extraction & routing verified');
}

// Test 11: PSI / PORT Pneumonia Severity Routing
{
  const text = '74yo male with fever, RR 32, SBP 86/54, BUN 38, Sodium 126, Glucose 280.';
  const entities = parseClinicalText(text);
  assert.strictEqual(entities.age, 74);
  assert.strictEqual(entities.rr, 32);
  assert.strictEqual(entities.sbp, 86);
  assert.strictEqual(entities.bun, 38);
  assert.strictEqual(entities.na, 126);
  assert.strictEqual(entities.glucose, 280);

  const matches = matchClinicalCalculators(entities);
  const psiMatch = matches.find((m) => m.toolId === 'psi_port');
  assert.ok(psiMatch, 'Must match PSI/PORT');
  assert.strictEqual(psiMatch.prefillPayload.rr30, true);
  assert.strictEqual(psiMatch.prefillPayload.sbp90, true);
  assert.strictEqual(psiMatch.prefillPayload.bun30, true);
  assert.strictEqual(psiMatch.prefillPayload.sodiumLow, true);
  assert.strictEqual(psiMatch.prefillPayload.glucoseHigh, true);
  console.log('✓ PASS: PSI/PORT pneumonia risk criteria extraction & routing verified');
}

// Test 12: ChatGPT Clinical Analysis Table & Narrative Generation
{
  const { generateChatGptClinicalAnalysis } = await import('./src/utils/clinicalParser.ts');
  const entities = {
    na: 128,
    k: 5.4,
    glucose: 380,
    cr: 2.2,
    sbp: 165,
    dbp: 95,
  };
  const matches = matchClinicalCalculators(entities);
  const analysis = generateChatGptClinicalAnalysis(entities, matches);

  assert.ok(analysis.summary.length > 10, 'Summary should be generated');
  assert.ok(analysis.parameterTable.length >= 5, 'Parameter table should have at least 5 rows');
  const naRow = analysis.parameterTable.find((r) => r.analyte.includes('Sodium'));
  assert.ok(naRow, 'Should have Sodium row');
  assert.strictEqual(naRow.value, '128 mEq/L');
  assert.strictEqual(naRow.status, 'critical');
  assert.strictEqual(naRow.flag, 'Hyponatremia');
  console.log('✓ PASS: ChatGPT clinical analysis table & narrative generation verified');
}

// Test 13: ChatGPT Clinical Analysis for Vitals, Temp, Platelets & Hypoxemia
{
  const { generateChatGptClinicalAnalysis } = await import('./src/utils/clinicalParser.ts');
  const entities = {
    tempC: 38.8,
    spo2: 89,
    platelets: 85,
    albumin: 2.8,
    ast: 120,
  };
  const matches = matchClinicalCalculators(entities);
  const analysis = generateChatGptClinicalAnalysis(entities, matches);

  const tempRow = analysis.parameterTable.find((r) => r.analyte.includes('Temperature'));
  assert.ok(tempRow, 'Must include Temperature row');
  assert.strictEqual(tempRow.value, '38.8 °C');
  assert.strictEqual(tempRow.status, 'critical');
  assert.strictEqual(tempRow.flag, 'Fever / Pyrexia');

  const spo2Row = analysis.parameterTable.find((r) => r.analyte.includes('Oxygen Saturation'));
  assert.ok(spo2Row, 'Must include Oxygen Saturation row');
  assert.strictEqual(spo2Row.status, 'critical');
  assert.strictEqual(spo2Row.flag, 'Severe Hypoxemia');

  const pltRow = analysis.parameterTable.find((r) => r.analyte.includes('Platelet'));
  assert.ok(pltRow, 'Must include Platelet row');
  assert.strictEqual(pltRow.status, 'abnormal');
  assert.strictEqual(pltRow.flag, 'Thrombocytopenia');

  console.log('✓ PASS: ChatGPT table handles Temperature, SpO2, Platelets, and Albumin flags');
}

// Test 14: Cardiology & ACS Suite Routing
{
  const text = 'Patient with acute chest pain, TIMI score evaluation requested. SBP 130, HR 85, Age 68.';
  const entities = parseClinicalText(text);
  assert.ok(entities.keywords?.includes('cardiology'));
  const matches = matchClinicalCalculators(entities);
  const cardioMatch = matches.find((m) => m.toolId === 'cardiology_suite');
  assert.ok(cardioMatch, 'Must match Cardiology & ACS suite');
  assert.strictEqual(cardioMatch.prefillPayload.sbp, 130);
  assert.strictEqual(cardioMatch.prefillPayload.hr, 85);
  assert.strictEqual(cardioMatch.prefillPayload.age, 68);
  console.log('✓ PASS: Cardiology & ACS Suite routing and prefill verified');
}

// Test 15: Critical Care & Pulmonology Suite Routing
{
  const text = 'ICU patient with severe sepsis, calculate SOFA score. SBP 88, RR 28, Platelets 65k, Cr 2.4, Bili 3.2.';
  const entities = parseClinicalText(text);
  assert.ok(entities.keywords?.includes('critical_care'));
  const matches = matchClinicalCalculators(entities);
  const ccmMatch = matches.find((m) => m.toolId === 'critical_care_pulm_suite');
  assert.ok(ccmMatch, 'Must match Critical Care & Pulm suite');
  assert.strictEqual(ccmMatch.prefillPayload.sbp, 88);
  assert.strictEqual(ccmMatch.prefillPayload.rr, 28);
  assert.strictEqual(ccmMatch.prefillPayload.platelets, 65);
  console.log('✓ PASS: Critical Care & Pulmonology Suite routing and prefill verified');
}

// Test 16: Nephrology & Fluids Suite Routing
{
  const text = 'Oliguric acute kidney injury, need FENa and FEUrea. Na 132, Cr 3.5, BUN 48, HCO3 14, weight 70kg.';
  const entities = parseClinicalText(text);
  assert.ok(entities.keywords?.includes('renal_fluids'));
  const matches = matchClinicalCalculators(entities);
  const renalMatch = matches.find((m) => m.toolId === 'renal_fluids_suite');
  assert.ok(renalMatch, 'Must match Nephrology & Fluids suite');
  assert.strictEqual(renalMatch.prefillPayload.sNa, 132);
  assert.strictEqual(renalMatch.prefillPayload.sCr, 3.5);
  console.log('✓ PASS: Nephrology & Fluids Suite routing and prefill verified');
}

// Test 17: Neurology & Systemic Medicine Suite Routing
{
  const text = 'Patient with transient ischemic attack, evaluate ABCD2 score. Age 70, SBP 160, DBP 94.';
  const entities = parseClinicalText(text);
  assert.ok(entities.keywords?.includes('neuro_systemic'));
  const matches = matchClinicalCalculators(entities);
  const neuroMatch = matches.find((m) => m.toolId === 'neuro_systemic_suite');
  assert.ok(neuroMatch, 'Must match Neurology & Systemic suite');
  assert.strictEqual(neuroMatch.prefillPayload.age, 70);
  assert.strictEqual(neuroMatch.prefillPayload.sbp, 160);
  console.log('✓ PASS: Neurology & Systemic Medicine Suite routing and prefill verified');
}

// Test 18: Trauma & Acute Resuscitation Suite Routing
{
  const text = 'Blunt trauma victim, calculate Revised Trauma Score (RTS) and ABC score for MTP. SBP 80, HR 125, RR 32.';
  const entities = parseClinicalText(text);
  assert.ok(entities.keywords?.includes('trauma_acute'));
  const matches = matchClinicalCalculators(entities);
  const traumaMatch = matches.find((m) => m.toolId === 'trauma_acute_suite');
  assert.ok(traumaMatch, 'Must match Trauma & Acute Resuscitation suite');
  assert.strictEqual(traumaMatch.prefillPayload.sbp, 80);
  assert.strictEqual(traumaMatch.prefillPayload.hr, 125);
  console.log('✓ PASS: Trauma & Acute Resuscitation Suite routing and prefill verified');
}

// Test 19: Preoperative & Nursing Risk Suite Routing
{
  const text = 'Preoperative airway assessment, STOP-BANG score and Mallampati class requested. Age 54, weight 92kg.';
  const entities = parseClinicalText(text);
  assert.ok(entities.keywords?.includes('surgical_preop'));
  const matches = matchClinicalCalculators(entities);
  const preopMatch = matches.find((m) => m.toolId === 'surgical_preop_suite');
  assert.ok(preopMatch, 'Must match Preoperative & Nursing Risk suite');
  assert.strictEqual(preopMatch.prefillPayload.age, 54);
  assert.strictEqual(preopMatch.prefillPayload.weightKg, 92);
  console.log('✓ PASS: Preoperative & Nursing Risk Suite routing and prefill verified');
}

// Test 20: Neonatology & NICU Suite Routing
{
  const text = 'Preterm infant born at 32 weeks, evaluate Ballard score and corrected age.';
  const entities = parseClinicalText(text);
  assert.ok(entities.keywords?.includes('neonatology'));
  const matches = matchClinicalCalculators(entities);
  const nicuMatch = matches.find((m) => m.toolId === 'neonatology_nicu_suite');
  assert.ok(nicuMatch, 'Must match Neonatology & NICU suite');
  console.log('✓ PASS: Neonatology & NICU Suite routing verified');
}

// Test 21: Pediatric Emergency & Infectious Suite Routing
{
  const text = 'Child with barky cough and stridor at rest, assess Westley Croup score. Age 3.';
  const entities = parseClinicalText(text);
  assert.ok(entities.keywords?.includes('pediatric_emergency'));
  const matches = matchClinicalCalculators(entities);
  const pedsEmMatch = matches.find((m) => m.toolId === 'peds_emergency_suite');
  assert.ok(pedsEmMatch, 'Must match Pediatric Emergency & Infectious suite');
  console.log('✓ PASS: Pediatric Emergency & Infectious Suite routing verified');
}

// Test 22: Antenatal & Fetal Surveillance Suite Routing
{
  const text = 'Third trimester assessment: Manning Biophysical Profile (BPP) score and fundal height.';
  const entities = parseClinicalText(text);
  assert.ok(entities.keywords?.includes('antenatal_fetal'));
  const matches = matchClinicalCalculators(entities);
  const antenatalMatch = matches.find((m) => m.toolId === 'antenatal_fetal_suite');
  assert.ok(antenatalMatch, 'Must match Antenatal & Fetal Surveillance suite');
  console.log('✓ PASS: Antenatal & Fetal Surveillance Suite routing verified');
}

// Test 23: High-Risk Obstetrics & Labor Suite Routing
{
  const text = 'Laboring patient with severe features, evaluate HELLP syndrome and NICHD FHR Category. Platelets 72k, AST 180, Bili 2.2.';
  const entities = parseClinicalText(text);
  assert.ok(entities.keywords?.includes('high_risk_maternal'));
  const matches = matchClinicalCalculators(entities);
  const highRiskMatch = matches.find((m) => m.toolId === 'high_risk_maternal');
  assert.ok(highRiskMatch, 'Must match High-Risk Obstetrics & Labor suite');
  assert.strictEqual(highRiskMatch.prefillPayload.platelets, 72);
  assert.strictEqual(highRiskMatch.prefillPayload.ast, 180);
  console.log('✓ PASS: High-Risk Obstetrics & Labor Suite routing and prefill verified');
}

// Test 24: Gynecologic Endocrinology Suite Routing
{
  const text = 'Patient presenting with oligomenorrhea and hyperandrogenism, check Rotterdam PCOS criteria.';
  const entities = parseClinicalText(text);
  assert.ok(entities.keywords?.includes('gyn_endocrine'));
  const matches = matchClinicalCalculators(entities);
  const gynEndoMatch = matches.find((m) => m.toolId === 'gyn_endocrine_suite');
  assert.ok(gynEndoMatch, 'Must match Gynecologic Endocrinology suite');
  console.log('✓ PASS: Gynecologic Endocrinology Suite routing verified');
}

console.log('\nAll 24 Clinical AI Parser & Router tests passed successfully!\n');
