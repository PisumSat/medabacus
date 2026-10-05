// Comprehensive Test Suite for ALL-IN-ONE Clinical Calculator Wiki Across 4 Wards
import { ALL_WIKI_TOOLS, findWikiToolById, getWikiToolsByWard } from './src/data/clinicalWikiRegistry.ts';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ PASS: ${message}`);
  } else {
    console.error(`✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log('=== VERIFYING ALL-IN-ONE CLINICAL CALCULATOR WIKI SUITE ===\n');

// 1. Registry Integrity & Ward Distribution
assert(ALL_WIKI_TOOLS.length >= 70, `Total interactive wiki calculators registered: ${ALL_WIKI_TOOLS.length} (>= 70 core cards)`);

const medTools = getWikiToolsByWard('internal_medicine');
const surgTools = getWikiToolsByWard('surgery');
const pedsTools = getWikiToolsByWard('pediatrics');
const obTools = getWikiToolsByWard('obgyn');

assert(medTools.length >= 35, `Internal Medicine wiki cards count: ${medTools.length} (>= 35)`);
assert(surgTools.length >= 12, `Surgery wiki cards count: ${surgTools.length} (>= 12)`);
assert(pedsTools.length >= 12, `Pediatrics wiki cards count: ${pedsTools.length} (>= 12)`);
assert(obTools.length >= 9, `OB/GYN wiki cards count: ${obTools.length} (>= 9)`);

// 2. Automated Run for Every Single Wiki Tool using Default Values
console.log('\n--- 2. VERIFYING ALL REGISTERED TOOLS EXECUTE WITH VALID DEFAULTS ---');
let allDefaultsValid = true;
for (const tool of ALL_WIKI_TOOLS) {
  const defaults = {};
  for (const inp of tool.inputs) {
    defaults[inp.id] = inp.defaultValue;
  }
  try {
    const res = tool.calculate(defaults, 'BED-99');
    if (!res || !res.interpretation || !res.ehrNote || !res.severity) {
      console.error(`Tool ${tool.id} returned incomplete result:`, res);
      allDefaultsValid = false;
    }
  } catch (err) {
    console.error(`Tool ${tool.id} crashed on defaults:`, err);
    allDefaultsValid = false;
  }
}
assert(allDefaultsValid, `All ${ALL_WIKI_TOOLS.length} wiki tools execute and produce structured results on defaults`);

// 3. Cardiology & Vascular Wiki Engines
console.log('\n--- 3. VERIFYING MEDICINE: CARDIOLOGY & VASCULAR CALCULATIONS ---');
const cha = findWikiToolById('cha2ds2_vasc');
assert(Boolean(cha), 'CHA2DS2-VASc card found in registry');
const chaRes = cha.calculate({
  chf: true, htn: true, age: '>=75', dm: false, stroke: true, vascular: false, female: false,
});
// CHF(1) + HTN(1) + Age>=75(2) + Stroke(2) = 6
assert(chaRes.score === 6, `CHA2DS2-VASc score is 6 (got ${chaRes.score})`);
assert(chaRes.severity === 'high', `CHA2DS2-VASc score 6 is high severity`);

const hasbled = findWikiToolById('has_bled');
assert(Boolean(hasbled), 'HAS-BLED card found');
const hasRes = hasbled.calculate({
  h: true, a_renal: true, a_liver: true, s: false, b: true, l: false, e: false, d_drugs: true, d_alcohol: true,
});
// 1+1+1+1+1+1 = 6
assert(hasRes.score === 6, `HAS-BLED score is 6 (got ${hasRes.score})`);
assert(hasRes.severity === 'high', `HAS-BLED >= 3 indicates high bleeding risk`);

const timi = findWikiToolById('timi_nstemi');
assert(Boolean(timi), 'TIMI UA/NSTEMI found');
const timiRes = timi.calculate({
  age65: true, cad_rf: true, known_cad: true, aspirin: true, angina: true, st_dev: true, biomarkers: true,
});
assert(timiRes.score === 7, `TIMI UA/NSTEMI max score is 7`);
assert(timiRes.severity === 'critical', `TIMI score 7 is high risk tier`);

const sf = findWikiToolById('san_francisco_syncope');
assert(Boolean(sf), 'San Francisco Syncope rule found');
const sfClean = sf.calculate({ chf: false, hct_under_30: false, ecg_abnormal: false, sob: false, sbp_under_90: false });
assert(sfClean.severity === 'low', `SF Syncope clean is Low Risk`);

// 4. Pulmonology & Critical Care Wiki Engines
console.log('\n--- 4. VERIFYING MEDICINE: PULMONOLOGY & CRITICAL CARE ---');
const bode = findWikiToolById('bode_index');
assert(Boolean(bode), 'BODE index found');
const bodeRes = bode.calculate({ fev1: '<=35', distance: '<=149', mmrc: '4', bmi: '<=21' });
// FEV1 <=35 (3) + 6MWD <=149 (3) + mMRC 4 (3) + BMI <=21 (1) = 10
assert(bodeRes.score === 10, `BODE index max score is 10 (got ${bodeRes.score})`);
assert(bodeRes.severity === 'critical', `BODE 10 is Quartile 4 (80% 4-year mortality)`);

const decaf = findWikiToolById('decaf_score');
assert(Boolean(decaf), 'DECAF score found');
const decafRes = decaf.calculate({ dyspnea_5b: false, eosinopenia: false, consolidation: false, acidemia: false, afib: false });
assert(decafRes.score === 0, `DECAF 0 is Low Risk`);

const ardsnet = findWikiToolById('ardsnet_ibw');
assert(Boolean(ardsnet), 'ARDSnet IBW found');
const ardsMale = ardsnet.calculate({ sex: 'male', height_cm: 178 });
// IBW Male 178cm (70.08 in): 50 + 2.3 * (70.08 - 60) = 50 + 23.18 = ~73.2 kg. 6 mL/kg = 439 mL
assert(ardsMale.score.includes('439 mL'), `Male 178cm 6 mL/kg tidal volume is 439 mL (got ${ardsMale.score})`);
assert(ardsMale.details.some(d => d.includes('73.2 kg')), `Male 178cm IBW is 73.2 kg`);

// 5. Nephrology & Fluids Wiki Engines
console.log('\n--- 5. VERIFYING MEDICINE: NEPHROLOGY & FLUID BALANCE ---');
const feUric = findWikiToolById('fe_uric_acid');
assert(Boolean(feUric), 'FEUricAcid tool found');
const feUricRes = feUric.calculate({ u_uric: 50, s_cr: 1.0, s_uric: 5.0, u_cr: 50 });
// (50 * 1.0) / (5.0 * 50) * 100 = 20%
assert(feUricRes.score === '20.0%', `FEUric is 20.0% (got ${feUricRes.score})`);
assert(feUricRes.severity === 'high', `FEUric > 10% confirms SIADH on diuretics`);

const naCorr = findWikiToolById('sodium_correction_rate');
assert(Boolean(naCorr), 'Sodium correction rate found');

// 6. GI, Liver & Hepatology Wiki Engines
console.log('\n--- 6. VERIFYING MEDICINE: GASTROENTEROLOGY & HEPATOLOGY ---');
const rockall = findWikiToolById('rockall_score');
assert(Boolean(rockall), 'Rockall score tool found');

const aim = findWikiToolById('aims65');
assert(Boolean(aim), 'AIMS65 score found');
const aimRes = aim.calculate({ albumin: true, inr: true, ams: true, sbp: true, age65: true });
assert(aimRes.score === 5, `Max AIMS65 is 5`);
assert(aimRes.severity === 'critical', `AIMS65 5 is mortality ~24.5%`);

const meld3 = findWikiToolById('meld_3');
assert(Boolean(meld3), 'MELD 3.0 tool found');

// 7. Neurology & Endocrine Wiki Engines
console.log('\n--- 7. VERIFYING MEDICINE: NEUROLOGY & ENDOCRINE ---');
const nihss = findWikiToolById('nihss');
assert(Boolean(nihss), 'NIHSS tool found');

const homa = findWikiToolById('homa_ir');
assert(Boolean(homa), 'HOMA-IR tool found');
const homaRes = homa.calculate({ glucose: 100, insulin: 10 });
// (100 * 10) / 405 = 2.47
assert(parseFloat(homaRes.score) >= 2.4 && parseFloat(homaRes.score) <= 2.5, `HOMA-IR is ~2.47 (got ${homaRes.score})`);

// 8. Surgery & Trauma Wiki Engines
console.log('\n--- 8. VERIFYING SURGERY & TRAUMA CLINICAL CALCULATORS ---');
const iss = findWikiToolById('iss_score');
assert(Boolean(iss), 'Injury Severity Score (ISS) found');
const issRes = iss.calculate({ head_neck: 3, face: 0, chest: 4, abdomen: 3, extremity: 2, external: 0 });
// 4^2 + 3^2 + 3^2 = 16 + 9 + 9 = 34
assert(issRes.score === 34, `ISS score is 34 (got ${issRes.score})`);
assert(issRes.severity === 'critical', `ISS >= 25 is Severe Trauma`);

const fast = findWikiToolById('fast_exam');
assert(Boolean(fast), 'FAST ultrasound exam found');
const fastPos = fast.calculate({ perihepatic: true, perisplenic: false, pelvic: false, pericardial: false, unstable: true });
assert(fastPos.severity === 'critical', `Positive FAST in unstable patient triggers critical emergent laparotomy pathway`);

const denver = findWikiToolById('denver_bcvi');
assert(Boolean(denver), 'Denver BCVI tool found');

const ottawa = findWikiToolById('ottawa_rules');
assert(Boolean(ottawa), 'Ottawa rules tool found');

const padua = findWikiToolById('padua_score');
assert(Boolean(padua), 'Padua VTE score found');

const cci = findWikiToolById('charlson_cci');
assert(Boolean(cci), 'Charlson Comorbidity Index found');

const euro = findWikiToolById('euroscore_ii');
assert(Boolean(euro), 'EuroSCORE II found');

// 9. Pediatrics & Resuscitation Wiki Engines
console.log('\n--- 9. VERIFYING PEDIATRICS CLINICAL CALCULATORS ---');
const sarnat = findWikiToolById('sarnat_staging');
assert(Boolean(sarnat), 'Sarnat neonatal HIE staging found');

const finnegan = findWikiToolById('finnegan_nas');
assert(Boolean(finnegan), 'Finnegan NAS score found');

const waterlow = findWikiToolById('waterlow_malnutrition');
assert(Boolean(waterlow), 'Waterlow malnutrition found');

const whoDehyd = findWikiToolById('who_dehydration_plan');
assert(Boolean(whoDehyd), 'WHO dehydration plan found');

const broselow = findWikiToolById('broselow_tape');
assert(Boolean(broselow), 'Broselow emergency tape found');

// 10. OB / GYN Wiki Engines
console.log('\n--- 10. VERIFYING OB/GYN CLINICAL CALCULATORS ---');
const nst = findWikiToolById('nst_evaluation');
assert(Boolean(nst), 'NST cardiotocography found');
const nstReactive = nst.calculate({ baseline_bpm: 140, variability: 'moderate', accels: 'two_15x15', decelerations: 'none' });
assert(nstReactive.score === 'REACTIVE NST', `Normal FHR tracing is REACTIVE NST`);
assert(nstReactive.severity === 'low', `Reactive NST is reassuring`);

const mbpp = findWikiToolById('modified_bpp');
assert(Boolean(mbpp), 'Modified BPP found');
const mbppOligo = mbpp.calculate({ nst_status: 'non_reactive', afi_cm: 3.5, sdp_cm: 1.2 });
assert(mbppOligo.severity === 'critical', `Non-reactive + Oligohydramnios triggers critical alert`);

const upcr = findWikiToolById('upcr_proteinuria');
assert(Boolean(upcr), 'Spot UPCR proteinuria found');
const upcrPos = upcr.calculate({ urine_protein: 90, urine_cr: 150 });
// 90 / 150 = 0.60 mg/mg
assert(upcrPos.score === '0.60', `UPCR is 0.60 mg/mg (got ${upcrPos.score})`);
assert(upcrPos.severity === 'high', `UPCR >= 0.30 confirms preeclampsia proteinuria criterion`);

const mgso4 = findWikiToolById('mgso4_toxicity');
assert(Boolean(mgso4), 'MgSO4 toxicity tool found');
const mgTox = mgso4.calculate({ serum_mg: 10.5, reflexes: 'absent', resp_rate: 10, urine_output: 15 });
assert(mgTox.severity === 'critical', `Loss of reflexes + bradypnea triggers emergency IV calcium gluconate`);

const robson = findWikiToolById('robson_ten_group');
assert(Boolean(robson), 'Robson 10-group classification found');

const endo = findWikiToolById('endometrial_thickness');
assert(Boolean(endo), 'Postmenopausal endometrial thickness found');
const endoBiopsy = endo.calculate({ thickness_mm: 6.5, bleeding_active: true, tamoxifen: false });
assert(endoBiopsy.severity === 'high', `Endometrial thickness 6.5mm > 4mm mandates biopsy`);

const gail = findWikiToolById('gail_breast_cancer');
assert(Boolean(gail), 'Gail breast cancer model found');

const mec = findWikiToolById('us_mec_contraception');
assert(Boolean(mec), 'CDC US MEC contraception found');
const mecMigraine = mec.calculate({ condition: 'migraine_aura' });
assert(mecMigraine.score.includes('ESTROGEN CONTRAINDICATED'), `Migraine with aura is Estrogen Contraindicated (MEC 4)`);
assert(mecMigraine.severity === 'critical', `MEC 4 contraindication flags critical severity`);

console.log(`\n======================================================`);
console.log(`All Clinical Wiki Complete Tests: ${passedTests}/${totalTests} PASSED.`);
console.log(`======================================================\n`);
