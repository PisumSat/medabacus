import {
  evaluateACOG700Dating,
  crlToGestationalAgeDays,
} from './src/calculators/dating.ts';
import { calculateBishopScore } from './src/calculators/bishop.ts';
import { calculateVbacSuccess } from './src/calculators/vbac.ts';
import { calculateEfw, evaluateAmnioticFluid } from './src/calculators/fetalGrowth.ts';
import { calculateApgar } from './src/calculators/apgar.ts';
import { evaluatePreeclampsia } from './src/calculators/preeclampsia.ts';
import { calculateHemorrhage } from './src/calculators/hemorrhage.ts';
import { calculatePopqStage } from './src/calculators/popq.ts';
import { calculateRmi } from './src/calculators/ovarianMass.ts';
import { calculateHcgKinetics } from './src/calculators/hcgKinetics.ts';
import { calculateRhogamDose, calculateGanzoniIron } from './src/calculators/medications.ts';

// Internal Medicine imports
import {
  calculateCkdEpi2021,
  calculateCockcroftGault,
  calculateCha2ds2Vasc,
  calculateHasBled,
  calculateWellsPe,
  evaluatePercRule,
  calculateWellsDvt,
  calculateCurb65,
  calculateMeldNa2016,
  calculateChildPugh,
  calculateElectrolytes,
  calculatePsiPort,
} from './src/calculators/internalMedicine.ts';

// Surgery imports
import {
  calculateParklandBurn,
  calculateRuleOfNinesTbsa,
  calculateAlvaradoScore,
  calculateAirScore,
  calculateRcri,
  calculateCapriniVte,
  calculateSurgicalApgarScore,
  calculateGlasgowPancreatitis,
  calculateGoldmanNsqip,
  getPediatricRuleOfNinesNorms,
} from './src/calculators/surgery.ts';

// Pediatrics imports
import {
  calculatePediatricGcs,
  calculateHollidaySegar,
  calculatePediatricResuscitation,
  calculatePediatricDrugDosing,
  calculateMcIsaacScore,
  calculatePramScore,
  calculatePediatricBpAndVitals,
  getAgeVitalSignNorms,
} from './src/calculators/pediatrics.ts';

// Expanded clinical engine imports
import {
  calculateTimiNstemi,
  calculateHeartScore,
  calculateKillipClass,
  calculateQtc,
  calculateSofaScore,
  calculateQsofa,
  evaluateLightsCriteria,
  evaluateBerlinArds,
  calculateAaGradient,
  calculateFena,
  calculateFeUrea,
  calculateWintersFormula,
  calculateFreeWaterDeficit,
  calculateCorrectedCalcium,
  calculateBisapScore,
  calculateFib4,
  calculateAbcd2Score,
  calculateSirs,
  evaluateDengueWarningSigns,
  calculateMentzerIndex,
  calculateAbsoluteNeutrophilCount,
} from './src/calculators/medicineExpanded.ts';

import {
  calculateRevisedTraumaScore,
  calculateAbcScoreForMtp,
  calculateShockIndex,
  calculateModifiedBauxScore,
  evaluateAsaClass,
  evaluateMallampati,
  calculateStopBang,
  calculateAnkleBrachialIndex,
  evaluateBradenScale,
  calculateSurgical421Fluids,
} from './src/calculators/surgeryExpanded.ts';

import {
  calculateNewBallardScore,
  calculateSilvermanAndersenScore,
  calculateCorrectedAge,
  calculateMidParentalHeight,
  calculateWestleyCroupScore,
  evaluatePecarnHeadTrauma,
  evaluateKawasakiDisease,
} from './src/calculators/pediatricsExpanded.ts';

import {
  evaluateFundalHeight,
  calculateBiophysicalProfile,
  evaluateGdmOgttCarpenterCoustan,
  evaluateHellpSyndrome,
  evaluateNichdFhrCategory,
  getHelperrMnemonic,
  evaluateRotterdamPcos,
  calculateFerrimanGallweyHirsutism,
} from './src/calculators/obgynExpanded.ts';

import {
  calculateAscvdRisk,
  calculateGraceScore,
  calculateGenevaScore,
  calculateSaag,
  calculateMaddreyDf,
  calculateBurchWartofsky,
  calculateFourTsScore,
  calculateFriedewaldLdl,
} from './src/calculators/clinicalWikiMedicine.ts';

import {
  evaluateCanadianCSpine,
  evaluateNexusCriteria,
  calculateRipasaScore,
  calculateLrinecScore,
  getForrestClassification,
  evaluateTokyoCholangitis,
} from './src/calculators/clinicalWikiSurgery.ts';

import {
  evaluateKramersRule,
  evaluateBhutaniNomogram,
  calculateDownesScore,
  calculatePews,
  evaluateJonesCriteria,
  evaluateMuac,
} from './src/calculators/clinicalWikiPediatrics.ts';

import {
  calculateRomaScore,
  evaluateAmselCriteria,
  evaluateSwanseaCriteria,
  evaluateUmbilicalDoppler,
  classifyPalmCoein,
} from './src/calculators/clinicalWikiObgyn.ts';

let passed = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

console.log('\n--- 1. VERIFYING OBSTETRICS & GYNECOLOGY CALCULATORS ---\n');

// 1. CRL to GA
const crlGa = crlToGestationalAgeDays(30); // 30 mm CRL is approx 9w5d (~67-68 days)
assert(crlGa >= 65 && crlGa <= 70, `Robinson CRL 30mm -> ${crlGa} days`);

const acogDating = evaluateACOG700Dating({
  lmpDate: new Date(2025, 0, 1),
  scanDate: new Date(2025, 1, 15),
  usGaWeeks: 6,
  usGaDays: 2,
  currentDate: new Date(2025, 2, 1),
});
assert(acogDating.finalEdd instanceof Date, `ACOG 700 dating calculates valid finalEdd`);

// 2. Bishop Score
const bishopResult = calculateBishopScore({
  dilation: 2, // 3-4 cm (2)
  effacement: 2, // 60-70% (2)
  station: 2, // -1/0 (2)
  consistency: 2, // soft (2)
  position: 1, // mid (1)
});
assert(bishopResult.totalScore === 9, `Bishop score sum is 9 (got ${bishopResult.totalScore})`);
assert(bishopResult.simplifiedScore === 6, `Simplified Bishop score is 6 (got ${bishopResult.simplifiedScore})`);
assert(bishopResult.classification === 'Favorable', `Bishop classification is Favorable`);

// 3. VBAC Success
const vbacResult = calculateVbacSuccess({
  maternalAge: 29,
  bmi: 24,
  priorVaginalDelivery: true,
  priorVbac: true,
  priorCesareanIndication: 'non_recurring',
});
assert(vbacResult.predictedSuccessPercent >= 80, `High likelihood VBAC predicted: ${vbacResult.predictedSuccessPercent}%`);

// 4. Hadlock EFW
const efw = calculateEfw({
  gaWeeks: 32,
  gaDays: 0,
  bpdMm: 82,
  hcMm: 300,
  acMm: 280,
  flMm: 62,
});
assert(efw.efwGrams >= 1800 && efw.efwGrams <= 2200, `Hadlock 4 EFW at 32w is in expected range: ${efw.efwGrams}g`);

// 5. Amniotic Fluid
const sdpOligo = evaluateAmnioticFluid({ measurementType: 'SDP', valueCm: 1.5 });
assert(sdpOligo.classification === 'Oligohydramnios', `SDP 1.5 cm is Oligohydramnios`);
const sdpNormal = evaluateAmnioticFluid({ measurementType: 'SDP', valueCm: 4.5 });
assert(sdpNormal.classification === 'Normal', `SDP 4.5 cm is Normal`);

// 6. Apgar
const apgar = calculateApgar(
  { appearance: 1, pulse: 2, grimace: 1, activity: 2, respiration: 2 },
  { appearance: 2, pulse: 2, grimace: 2, activity: 2, respiration: 2 }
);
assert(apgar.score1Min === 8, `Apgar 1-min is 8`);
assert(apgar.score5Min === 10, `Apgar 5-min is 10`);

// 7. Preeclampsia Severe Features
const preeclampsia = evaluatePreeclampsia({
  gaWeeks: 35,
  gaDays: 2,
  sbp: 165,
  dbp: 95,
  proteinuria: true,
  plateletsLow: true,
  creatinineElevated: false,
  liverTransaminasesElevated: false,
  pulmonaryEdema: false,
  neurologicalSymptoms: false,
});
assert(preeclampsia.diagnosis === 'Preeclampsia with Severe Features', `SBP >= 160 triggers Severe Features`);
assert(preeclampsia.magnesiumIndicated === true, `Magnesium sulfate is indicated`);
assert(preeclampsia.antihypertensiveIndicated === true, `Urgent antihypertensive indicated`);

// 8. CMQCC Hemorrhage Assessment & QBL
const hemorrhage = calculateHemorrhage(
  {
    multipleGestation: false,
    priorCesareanOrUterineSurgery: false,
    grandMultiparity: false,
    largeFibroids: false,
    chorioamnionitis: false,
    prolongedOxytocin: false,
    bmiOver40: false,
    priorPphHistory: false,
    placentaPreviaOrAccreta: true,
    hematocritLow: false,
    plateletsLow: false,
    activeBleedingAdmission: false,
    knownCoagulopathy: false,
  },
  {
    totalWetWeightGrams: 1200,
    totalDryWeightGrams: 200,
    suctionVolumeMl: 300,
    amnioticFluidAndIrrigationMl: 100,
    deliveryType: 'cesarean',
  }
);
assert(hemorrhage.riskLevel === 'High Risk', `Placenta previa triggers High Risk hemorrhage`);
assert(hemorrhage.qblResult?.netBloodLossMl === 1200, `Net blood loss is 1200 mL (got ${hemorrhage.qblResult?.netBloodLossMl})`);

// 8. POP-Q Stage
const popqStage0 = calculatePopqStage({
  aa: -3, ba: -3, c: -7,
  gh: 3, pb: 3, tvl: 9,
  ap: -3, bp: -3, d: -8
});
assert(popqStage0.stage === 'Stage 0', `POP-Q Stage 0 correctly identified`);

const popqStage2 = calculatePopqStage({
  aa: 0, ba: 0, c: -5,
  gh: 4, pb: 3, tvl: 9,
  ap: -2, bp: -2, d: -7
});
assert(popqStage2.stage === 'Stage II', `POP-Q Stage II correctly identified (at hymen)`);

// 9. RMI Score
const rmi = calculateRmi({
  ca125Units: 100,
  isPostmenopausal: true,
  hasMultilocularCyst: true,
  hasSolidAreas: true,
  hasBilateralLesions: false,
  hasAscites: false,
  hasIntraAbdominalMetastases: false,
});
assert(rmi.rmiScore === 900, `RMI score is 900 (got ${rmi.rmiScore})`);
assert(rmi.riskCategory.includes('High Risk'), `RMI 900 is High Risk (> 200)`);

// 10. hCG Kinetics
const hcg = calculateHcgKinetics({
  initialHcg: 1000,
  repeatHcg: 1800,
  hoursBetween: 48,
  ultrasoundFindings: 'no_ultrasound',
});
assert(hcg.percentChange48h === 80, `48h hCG rise is 80% (got ${hcg.percentChange48h}%)`);
assert(hcg.category === 'Normal IUP Rise', `80% rise is Normal IUP Rise`);

// 11. RhoGAM KB Dosing
const rhogam = calculateRhogamDose({ fetalCellsPercent: 1.2 });
assert(rhogam.fetalBloodVolumeMl === 60, `FMH volume is 60 mL`);
assert(rhogam.vialsRequired === 3, `3 vials required (2 base + 1 safety)`);

// 12. Ganzoni Iron Deficit
const iron = calculateGanzoniIron({
  weightKg: 65,
  actualHb: 8.0,
  targetHb: 11.0,
  depotIronMg: 500,
});
assert(iron.totalIronDeficitMg === 968, `Ganzoni iron deficit is 968 mg (got ${iron.totalIronDeficitMg})`);

console.log('\n--- 2. VERIFYING INTERNAL MEDICINE CALCULATORS ---\n');

// 13. CKD-EPI 2021 Race-Free eGFR
const ckdMale = calculateCkdEpi2021({ age: 50, sex: 'male', scrMgDl: 1.2 });
assert(ckdMale.egfr >= 70 && ckdMale.egfr <= 80, `CKD-EPI 2021 50yo male SCr 1.2 -> ${ckdMale.egfr} mL/min/1.73m² (G2)`);
assert(ckdMale.stage === 'G2', `CKD Stage is G2`);

const ckdFemale = calculateCkdEpi2021({ age: 60, sex: 'female', scrMgDl: 0.8 });
assert(ckdFemale.egfr >= 80 && ckdFemale.egfr <= 90, `CKD-EPI 2021 60yo female SCr 0.8 -> ${ckdFemale.egfr} mL/min/1.73m²`);

// 14. Cockcroft-Gault CrCl
const crcl = calculateCockcroftGault({ age: 65, sex: 'male', weightKg: 72, heightCm: 175, scrMgDl: 1.0 });
// (140 - 65) * 72 / 72 = 75 mL/min
assert(crcl.crClActual === 75, `Cockcroft-Gault CrCl is 75 mL/min (got ${crcl.crClActual})`);

// 15. CHA2DS2-VASc
const chads = calculateCha2ds2Vasc({
  congestiveHeartFailure: false,
  hypertension: true,
  ageYears: 76,
  diabetes: true,
  priorStrokeTiaThromboembolism: false,
  vascularDisease: false,
  sex: 'female',
});
// HTN (+1) + Age>=75 (+2) + DM (+1) + Female (+1) = 5
assert(chads.score === 5, `CHA2DS2-VASc score is 5 (got ${chads.score})`);
assert(chads.recommendationLevel === 'recommended', `Oral anticoagulation strongly recommended`);

// 16. HAS-BLED
const hasbled = calculateHasBled({
  hypertensionSbpOver160: true,
  abnormalRenalFunction: false,
  abnormalLiverFunction: false,
  priorStroke: true,
  bleedingHistoryOrPredisposition: false,
  labileInrs: false,
  elderlyAgeOver65: true,
  drugsAntiplateletsNsaids: false,
  alcoholExcess: false,
});
// HTN (1) + Stroke (1) + Elderly (1) = 3
assert(hasbled.score === 3, `HAS-BLED score is 3 (got ${hasbled.score})`);
assert(hasbled.riskCategory === 'High', `HAS-BLED 3 is High risk`);

// 17. Wells PE & PERC
const wellsPe = calculateWellsPe({
  dvtClinicalSigns: true, // +3
  peLikelyOrNumberOne: true, // +3
  heartRateOver100: false,
  immobilizationOrSurgery4w: false,
  priorDvtPe: false,
  hemoptysis: false,
  activeMalignancy: false,
});
assert(wellsPe.score === 6.0, `Wells PE score is 6.0 (got ${wellsPe.score})`);
assert(wellsPe.twoTierCategory === 'PE Likely', `PE Likely (> 4.0)`);

const percAllGood = evaluatePercRule({
  ageUnder50: true,
  heartRateUnder100: true,
  spo2Over94Percent: true,
  noUnilateralLegSwelling: true,
  noHemoptysis: true,
  noRecentSurgeryTrauma4w: true,
  noPriorDvtPe: true,
  noOralHormoneUse: true,
});
assert(percAllGood.isPercNegative === true, `All 8 PERC met -> Rule out PE`);

// 18. Wells DVT
const wellsDvt = calculateWellsDvt({
  activeCancer: true, // 1
  paralysisParesisOrPlaster: false,
  bedriddenOver3DaysOrMajorSurgery12w: true, // 1
  localizedTendernessAlongDeepVeins: true, // 1
  entireLegSwollen: false,
  calfSwellingOver3cmComparedToOther: true, // 1
  pittingEdemaGreaterInSymptomaticLeg: false,
  collateralSuperficialVeinsNonVaricose: false,
  alternativeDiagnosisAtLeastAsLikely: true, // -2
});
// 1 + 1 + 1 + 1 - 2 = 2
assert(wellsDvt.score === 2, `Wells DVT score is 2 (got ${wellsDvt.score})`);
assert(wellsDvt.category === 'DVT Likely', `Wells DVT >= 2 is DVT Likely`);

// 19. CURB-65
const curb = calculateCurb65({
  confusion: true,
  ureaOver7MmolLOrBunOver19: true,
  respiratoryRate30OrMore: false,
  lowBloodPressure: false,
  age65OrMore: true,
});
assert(curb.score === 3, `CURB-65 score is 3 (got ${curb.score})`);
assert(curb.riskGroup === 'Severe', `CURB-65 3 is Severe (ICU/inpatient)`);

// 20. MELD-Na 2016 & Child-Pugh
const meld = calculateMeldNa2016({
  bilirubinMgDl: 2.5,
  inr: 1.8,
  creatinineMgDl: 1.5,
  sodiumMeqL: 130,
  dialysisTwiceInPastWeek: false,
});
assert(meld.meldNa >= 20 && meld.meldNa <= 26, `MELD-Na calculated in expected cirrhosis range: ${meld.meldNa}`);

const childPugh = calculateChildPugh({
  bilirubinMgDl: 2.5, // 2
  albuminGDl: 2.6,    // 3
  inr: 1.9,           // 2
  ascites: 'slight_controlled', // 2
  encephalopathy: 'none',       // 1
});
// 2 + 3 + 2 + 2 + 1 = 10
assert(childPugh.score === 10, `Child-Pugh score is 10 (got ${childPugh.score})`);
assert(childPugh.childClass === 'C', `Child-Pugh Class C (>= 10)`);

// 21. Electrolytes & Acid-Base
const lytes = calculateElectrolytes({
  measuredNaMeqL: 130,
  glucoseMgDl: 600, // Excess = 500
  bunMgDl: 28,
  clMeqL: 90,
  hco3MeqL: 10,
  measuredAlbuminGDl: 4.0,
});
// Katz: 130 + 0.016 * 500 = 130 + 8 = 138
assert(lytes.correctedNaKatz === 138, `Katz Corrected Na is 138 mEq/L (got ${lytes.correctedNaKatz})`);
// AG = 130 - (90 + 10) = 30
assert(lytes.anionGap === 30, `Anion Gap is 30 mEq/L (got ${lytes.anionGap})`);

// 21b. Pneumonia Severity Index (PSI / PORT)
const psiClass1 = calculatePsiPort({
  ageYears: 32,
  sex: 'male',
  nursingHomeResident: false,
  neoplasticDisease: false,
  liverDisease: false,
  congestiveHeartFailure: false,
  cerebrovascularDisease: false,
  renalDisease: false,
  alteredMentalStatus: false,
  respiratoryRate30OrMore: false,
  systolicBpUnder90: false,
  temperatureUnder35OrOver40: false,
  pulse125OrMore: false,
  arterialPhUnder7_35: false,
  bun30OrMore: false,
  sodiumUnder130: false,
  glucose250OrMore: false,
  hematocritUnder30: false,
  pao2Under60OrSpo2Under90: false,
  pleuralEffusion: false,
});
assert(psiClass1.riskClass === 'Class I', `PSI 32yo healthy male is Class I (got ${psiClass1.riskClass})`);
assert(psiClass1.recommendedSetting === 'Outpatient', `Class I setting is Outpatient`);
assert(psiClass1.mortality30DayPercent === 0.1, `Class I mortality is 0.1%`);

// PSI Step 1 verification: 30yo with severe lab abnormalities (BUN>=30, PaO2<60, pH<7.35, Pleural effusion -> score = 100 -> Class IV)
const psiSevereYoung = calculatePsiPort({
  ageYears: 30,
  sex: 'male',
  nursingHomeResident: false,
  neoplasticDisease: false,
  liverDisease: false,
  congestiveHeartFailure: false,
  cerebrovascularDisease: false,
  renalDisease: false,
  alteredMentalStatus: false,
  respiratoryRate30OrMore: false,
  systolicBpUnder90: false,
  temperatureUnder35OrOver40: false,
  pulse125OrMore: false,
  arterialPhUnder7_35: true,
  bun30OrMore: true,
  sodiumUnder130: false,
  glucose250OrMore: false,
  hematocritUnder30: false,
  pao2Under60OrSpo2Under90: true,
  pleuralEffusion: true,
});
assert(psiSevereYoung.score === 100, `PSI young severe pneumonia score is 100 (got ${psiSevereYoung.score})`);
assert(psiSevereYoung.riskClass === 'Class IV', `PSI young with severe labs is Class IV (got ${psiSevereYoung.riskClass})`);
assert(psiSevereYoung.recommendedSetting === 'Inpatient Medical Ward', `Class IV setting is Inpatient Medical Ward`);

// PSI Class V severe elderly test
const psiClass5 = calculatePsiPort({
  ageYears: 75,
  sex: 'male',
  nursingHomeResident: true,
  neoplasticDisease: true,
  liverDisease: false,
  congestiveHeartFailure: true,
  cerebrovascularDisease: false,
  renalDisease: false,
  alteredMentalStatus: true,
  respiratoryRate30OrMore: true,
  systolicBpUnder90: false,
  temperatureUnder35OrOver40: false,
  pulse125OrMore: false,
  arterialPhUnder7_35: true,
  bun30OrMore: true,
  sodiumUnder130: false,
  glucose250OrMore: false,
  hematocritUnder30: false,
  pao2Under60OrSpo2Under90: true,
  pleuralEffusion: false,
});
assert(psiClass5.score === 225, `PSI elderly severe score is 225 (got ${psiClass5.score})`);
assert(psiClass5.riskClass === 'Class V', `PSI 225 is Class V`);
assert(psiClass5.recommendedSetting === 'Inpatient ICU / High Dependency', `Class V setting is ICU`);

console.log('\n--- 3. VERIFYING GENERAL SURGERY CALCULATORS ---\n');

// 22. Parkland Burn Resuscitation
const parkland = calculateParklandBurn({
  weightKg: 70,
  tbsaPercent: 30,
  hoursElapsedSinceBurn: 2,
});
// Total = 4 * 70 * 30 = 8400 mL
assert(parkland.total24HourFluidMl === 8400, `Parkland total 24h is 8400 mL (got ${parkland.total24HourFluidMl})`);
assert(parkland.first8HoursTotalMl === 4200, `Parkland 1st 8h is 4200 mL (got ${parkland.first8HoursTotalMl})`);
assert(parkland.adjustedFirstPeriodRateMlPerHour === 700, `Remaining 6h rate is 700 mL/hr (4200 / 6)`);

// 23. Rule of Nines
const tbsa = calculateRuleOfNinesTbsa({
  headAndNeckPercent: 9,
  anteriorTorsoPercent: 18,
  posteriorTorsoPercent: 18,
  rightArmPercent: 9,
  leftArmPercent: 9,
  rightLegPercent: 18,
  leftLegPercent: 18,
  perineumPercent: 1,
});
assert(tbsa === 100, `Complete body surface area rule of nines sum is 100% (got ${tbsa}%)`);

// 24. Alvarado Score
const alvarado = calculateAlvaradoScore({
  migratoryRightIliacFossaPain: true, // 1
  anorexia: true, // 1
  nauseaOrVomiting: true, // 1
  tendernessRightLowerQuadrant: true, // 2
  reboundTenderness: true, // 1
  elevatedTemperatureOver37_3C: true, // 1
  leukocytosisWbcOver10: true, // 2
  shiftToTheLeftNeutrophilsOver75: false, // 0
});
assert(alvarado.score === 9, `Alvarado score is 9 (got ${alvarado.score})`);
assert(alvarado.riskCategory === 'Very High / Definite', `Alvarado 9 is Definite`);

// 25. AIR Score
const air = calculateAirScore({
  vomiting: true,
  painInRiq: true,
  reboundTendernessDefense: 'medium', // 2
  bodyTempOver38_5C: true, // 1
  wbcCount: '15_or_more', // 2
  neutrophilsPercent: '85_or_more', // 2
  crpMgL: '50_or_more', // 2
});
// 1 + 1 + 2 + 1 + 2 + 2 + 2 = 11
assert(air.score === 11, `AIR score is 11 (got ${air.score})`);
assert(air.riskGroup === 'High Risk', `AIR 11 is High Risk`);

// 26. Revised Cardiac Risk Index (RCRI)
const rcri = calculateRcri({
  highRiskSurgery: true, // 1
  ischemicHeartDisease: true, // 1
  historyOfChf: false,
  cerebrovascularDisease: false,
  preoperativeInsulin: false,
  preoperativeCreatinineOver2: false,
});
assert(rcri.score === 2, `RCRI score is 2 (got ${rcri.score})`);
assert(rcri.classCategory === 'Class III', `RCRI 2 is Class III`);

// 27. Caprini VTE
const caprini = calculateCapriniVte({
  ageYears: 65, // 2
  minorSurgeryPlanned: false,
  majorSurgeryOver45Min: true, // 2
  laparoscopicSurgeryOver45Min: false,
  bmiOver25: true, // 1
  swollenLegsEdema: false,
  varicoseVeins: false,
  pregnancyOrPostpartum1m: false,
  oralContraceptiveOrHrt: false,
  sepsisPast1m: false,
  seriousLungDiseasePast1m: false,
  bedriddenConfinedToBed: false,
  centralVenousAccess: false,
  malignancyCurrentOrPast: true, // 2
  immobilizingPlasterCast: false,
  priorDvtPeHistory: false,
  familyHistoryOfVte: false,
  factorVLeidenOrProthrombin20210A: false,
  lupusAnticoagulantOrAntiphospholipid: false,
  elevatedSerumHomocysteine: false,
  electiveMajorArthroplasty: false,
  hipPelvisOrLegFracturePast1m: false,
  strokePast1m: false,
  multipleTraumaPast1m: false,
  acuteSpinalCordInjuryPast1m: false,
});
// 2 (age) + 2 (surgery) + 1 (BMI) + 2 (cancer) = 7
assert(caprini.score === 7, `Caprini score is 7 (got ${caprini.score})`);
assert(caprini.riskCategory === 'High / Highest', `Caprini 7 is High / Highest`);

// 28. Surgical Apgar Score (SAS)
const sas = calculateSurgicalApgarScore({
  estimatedBloodLossMl: 250, // 2 (101-600)
  lowestMeanArterialPressureMmHg: 60, // 2 (55-69)
  lowestHeartRateBpm: 60, // 3 (56-65)
});
// 2 + 2 + 3 = 7
assert(sas.totalScore === 7, `Surgical Apgar Score is 7 (got ${sas.totalScore})`);

// 29. Glasgow Pancreatitis
const glasgow = calculateGlasgowPancreatitis({
  ageOver55Years: true, // 1
  pao2Under60MmHg: true, // 1
  wbcOver15x10_9L: true, // 1
  calciumUnder2MmolLOr8MgDl: false,
  ureaOver16MmolLOrBunOver45: true, // 1
  ldhOver600UnitsL: false,
  albuminUnder32GLOr3_2GDl: false,
  glucoseOver10MmolLOr180MgDl: false,
});
assert(glasgow.score === 4, `Glasgow Pancreatitis score is 4 (got ${glasgow.score})`);
assert(glasgow.severity === 'Severe Acute Pancreatitis', `Score >= 3 is Severe Pancreatitis`);

// 29b. Goldman Cardiac & ACS NSQIP Universal Surgical Risk
const goldmanLow = calculateGoldmanNsqip({
  s3GallopOrJvd: false,
  myocardialInfarctionPast6m: false,
  nonSinusRhythmOrPacs: false,
  prematureVentricularContractionsOver5PerMin: false,
  ageOver70: false,
  emergencyOperation: false,
  intrathoracicIntraperitonealOrAortic: false,
  significantAorticStenosis: false,
  poorGeneralMedicalCondition: false,
  asaClass: 1,
  functionalStatus: 'independent',
  systemicSepsis: 'none',
  dyspnea: 'none',
  preopAcuteRenalFailure: false,
  chronicSteroidUse: false,
  ascitesWithin30Days: false,
  disseminatedCancer: false,
  bleedingDisorder: false,
  diabetesMellitus: false,
  hypertensionRequiringMedication: false,
  severeCopd: false,
});
assert(goldmanLow.goldmanScore === 0, `Goldman low score is 0 (got ${goldmanLow.goldmanScore})`);
assert(goldmanLow.goldmanClass === 'Class I', `Goldman class is Class I`);
assert(goldmanLow.goldmanCardiacMortalityPercent === 0.2, `Goldman Class I mortality is 0.2%`);
assert(goldmanLow.nsqipMorbidityRiskTier === 'Low', `NSQIP healthy is Low risk tier`);

const goldmanHigh = calculateGoldmanNsqip({
  s3GallopOrJvd: true,                                   // +11
  myocardialInfarctionPast6m: true,                      // +10
  nonSinusRhythmOrPacs: false,
  prematureVentricularContractionsOver5PerMin: true,     // +7
  ageOver70: true,                                       // +5
  emergencyOperation: true,                              // +4
  intrathoracicIntraperitonealOrAortic: true,            // +3
  significantAorticStenosis: false,
  poorGeneralMedicalCondition: false,
  asaClass: 4,
  functionalStatus: 'totally_dependent',
  systemicSepsis: 'septic_shock',
  dyspnea: 'rest',
  preopAcuteRenalFailure: true,
  chronicSteroidUse: true,
  ascitesWithin30Days: false,
  disseminatedCancer: false,
  bleedingDisorder: false,
  diabetesMellitus: true,
  hypertensionRequiringMedication: true,
  severeCopd: true,
});
// 11 + 10 + 7 + 5 + 4 + 3 = 40 (>= 26 => Class IV)
assert(goldmanHigh.goldmanScore === 40, `Goldman high score is 40 (got ${goldmanHigh.goldmanScore})`);
assert(goldmanHigh.goldmanClass === 'Class IV', `Goldman class is Class IV`);
assert(goldmanHigh.goldmanCardiacMortalityPercent === 56.0, `Goldman Class IV cardiac mortality is 56%`);
assert(goldmanHigh.nsqipMorbidityRiskTier === 'Very High', `NSQIP high-risk is Very High tier`);
assert(goldmanHigh.perioperativeOptimizationGuidelines.length >= 3, `Guidelines generated for multiple comorbidities`);

// 29c. Pediatric Parkland Burn with Lund-Browder Norms & Holliday-Segar Maintenance
const pedsNormsInfant = getPediatricRuleOfNinesNorms(0);
assert(pedsNormsInfant.headPercent === 18, `Infant head is 18% (got ${pedsNormsInfant.headPercent}%)`);
assert(pedsNormsInfant.eachLegPercent === 13.5, `Infant each leg is 13.5% (got ${pedsNormsInfant.eachLegPercent}%)`);

const pedsNormsChild = getPediatricRuleOfNinesNorms(10);
assert(pedsNormsChild.headPercent === 9, `10yo head is 9% (got ${pedsNormsChild.headPercent}%)`);
assert(pedsNormsChild.eachLegPercent === 18, `10yo each leg is 18% (got ${pedsNormsChild.eachLegPercent}%)`);

const pedsBurn = calculateParklandBurn({
  weightKg: 15,
  tbsaPercent: 20,
  isPediatric: true,
  fluidMultiplierMlPerKgPerPercent: 3,
});
// 3 * 15 * 20 = 900 mL total
assert(pedsBurn.total24HourFluidMl === 900, `Peds burn total is 900 mL (got ${pedsBurn.total24HourFluidMl})`);
assert(pedsBurn.first8HoursTotalMl === 450, `Peds burn first 8h is 450 mL (got ${pedsBurn.first8HoursTotalMl})`);
assert(pedsBurn.pediatricConcurrentMaintenanceMlPerHour === 50, `15kg maintenance is 50 mL/hr (got ${pedsBurn.pediatricConcurrentMaintenanceMlPerHour})`);
// First 8h rate: 450 / 8 = 56 mL/h. Combined = 56 + 50 = 106 mL/h
assert(pedsBurn.totalFirstPeriodCombinedRateMlPerHour === 106, `Peds combined 1st period rate is 106 mL/hr (got ${pedsBurn.totalFirstPeriodCombinedRateMlPerHour})`);
assert(pedsBurn.targetUrineOutputMlPerHour.includes('1.0 - 1.5 mL/kg/hr'), `Peds target urine is 1.0 - 1.5 mL/kg/hr`);

console.log('\n--- 4. VERIFYING PEDIATRICS CALCULATORS ---\n');

// 30. Pediatric GCS
const pgcs = calculatePediatricGcs({
  isInfantUnder2Years: true,
  eyeOpening: 4, // Spontaneous
  verbalResponse: 5, // Coos, babbles
  motorResponse: 6, // Normal spontaneous movements
});
assert(pgcs.totalScore === 15, `Pediatric GCS is 15 (got ${pgcs.totalScore})`);
assert(pgcs.severity === 'Mild Brain Injury / Normal', `PGCS 15 is Normal`);

// 31. Holliday-Segar Fluids
const fluids = calculateHollidaySegar({
  weightKg: 15, // First 10kg = 1000 mL, Next 5kg = 250 mL => 1250 mL/day
  percentDehydration: 5, // 5 * 15 * 10 = 750 mL deficit
});
assert(fluids.dailyMaintenanceMl === 1250, `15kg maintenance is 1250 mL/day (got ${fluids.dailyMaintenanceMl})`);
assert(fluids.hourlyMaintenanceMlPerHour === 50, `15kg hourly is 50 mL/hr (got ${fluids.hourlyMaintenanceMlPerHour})`);
assert(fluids.dehydrationDeficitMl === 750, `5% dehydration deficit for 15kg is 750 mL (got ${fluids.dehydrationDeficitMl})`);

// 32. Pediatric Airway & Resuscitation (Khine ETT)
const airway = calculatePediatricResuscitation({
  ageYears: 4,
  actualWeightKg: 16,
});
// Cuffed ETT: (4 / 4) + 3.5 = 4.5 mm
assert(airway.cuffedEttSizeMm === 4.5, `4yo cuffed ETT size is 4.5 mm (got ${airway.cuffedEttSizeMm})`);
// Depth: 4.5 * 3 = 13.5 cm
assert(airway.ettDepthAtLipsCm === 13.5, `4yo ETT depth is 13.5 cm (got ${airway.ettDepthAtLipsCm})`);
// Defib 1st dose: 16kg * 2 = 32 Joules
assert(airway.defibrillationInitialJoules === 32, `16kg initial defib is 32 J (got ${airway.defibrillationInitialJoules})`);

// 33. Pediatric Drug Dosing
const tylenol = calculatePediatricDrugDosing({
  weightKg: 16,
  medication: 'acetaminophen',
});
// 16 * 10 = 160mg, 16 * 15 = 240mg
assert(tylenol.calculatedDoseMg.includes('160 - 240 mg'), `Tylenol dose is 160 - 240 mg (got ${tylenol.calculatedDoseMg})`);

// 34. Centor / McIsaac Strep Score
const mcisaac = calculateMcIsaacScore({
  ageYears: 8, // +1 (3-14)
  absenceOfCough: true, // +1
  swollenTenderAnteriorCervicalNodes: true, // +1
  temperatureOver38C: true, // +1
  tonsillarExudateOrSwelling: true, // +1
});
assert(mcisaac.score === 5, `McIsaac score is 5 (got ${mcisaac.score})`);

// 35. PRAM Asthma Severity Score
const pram = calculatePramScore({
  suprasternalRetractions: 2,
  scaleneMuscleContraction: 0,
  airEntry: 1,
  wheezing: 2,
  o2SaturationPercent: 1,
});
// 2 + 0 + 1 + 2 + 1 = 6
assert(pram.totalScore === 6, `PRAM asthma score is 6 (got ${pram.totalScore})`);
assert(pram.severity === 'Moderate Asthma Exacerbation', `PRAM 6 is Moderate Asthma`);

// 36. AAP 2017 Pediatric Blood Pressure Percentiles & Normal Vitals
const pedsBpNormal = calculatePediatricBpAndVitals({
  ageYears: 7,
  sex: 'male',
  heightPercentile: 50,
  systolicBpMmHg: 98,
  diastolicBpMmHg: 58,
});
// 7yo male 50th percentile: SBP 50th=98, 90th=111, 95th=115; DBP 50th=58, 90th=70, 95th=74
assert(pedsBpNormal.overallBpClassification === 'Normal Blood Pressure', `7yo 98/58 is Normal Blood Pressure (got ${pedsBpNormal.overallBpClassification})`);
assert(pedsBpNormal.sbpPercentileClassification === 'Normal', `7yo SBP is Normal`);

const pedsBpStage1 = calculatePediatricBpAndVitals({
  ageYears: 7,
  sex: 'male',
  heightPercentile: 50,
  systolicBpMmHg: 116, // >= 115 (95th) and < 127 (95th + 12)
  diastolicBpMmHg: 68,
});
assert(pedsBpStage1.overallBpClassification === 'Stage 1 Hypertension', `7yo 116/68 is Stage 1 Hypertension (got ${pedsBpStage1.overallBpClassification})`);
assert(pedsBpStage1.sbpPercentileClassification === 'Stage 1 HTN', `7yo SBP is Stage 1 HTN`);

const pedsBpStage2 = calculatePediatricBpAndVitals({
  ageYears: 7,
  sex: 'male',
  heightPercentile: 50,
  systolicBpMmHg: 130, // >= 115 + 12 = 127
  diastolicBpMmHg: 75,
});
assert(pedsBpStage2.overallBpClassification === 'Stage 2 Hypertension', `7yo 130/75 is Stage 2 Hypertension (got ${pedsBpStage2.overallBpClassification})`);
assert(pedsBpStage2.sbpPercentileClassification === 'Stage 2 HTN', `7yo SBP is Stage 2 HTN`);

// PALS Minimum Systolic Blood Pressure Norms
const vitalsNeonate = getAgeVitalSignNorms(0.05);
assert(vitalsNeonate.minimumAcceptableSbpPals === 60, `Neonate PALS min SBP is 60 mmHg`);

const vitalsInfant = getAgeVitalSignNorms(0.5);
assert(vitalsInfant.minimumAcceptableSbpPals === 70, `Infant PALS min SBP is 70 mmHg`);

const vitalsChild5 = getAgeVitalSignNorms(5);
// 70 + 2 * 5 = 80 mmHg
assert(vitalsChild5.minimumAcceptableSbpPals === 80, `5yo child PALS min SBP is 80 mmHg (got ${vitalsChild5.minimumAcceptableSbpPals})`);

const vitalsChild11 = getAgeVitalSignNorms(11);
// >= 10yo threshold is 90 mmHg
assert(vitalsChild11.minimumAcceptableSbpPals === 90, `11yo child PALS min SBP is 90 mmHg (got ${vitalsChild11.minimumAcceptableSbpPals})`);

console.log('\n--- 5. VERIFYING EXPANDED MEDICINE SUITE CALCULATORS ---\n');

// TIMI UA/NSTEMI
const timiHigh = calculateTimiNstemi({
  age65Plus: true,
  threeCadRiskFactors: true,
  knownCadGt50: true,
  aspirinPast7Days: true,
  severeAnginaPast24h: true,
  stSegmentDeviation: false,
  elevatedCardiacMarkers: false,
});
assert(timiHigh.score === 5, `TIMI score is 5 (got ${timiHigh.score})`);
assert(timiHigh.riskTier === 'High', `TIMI risk tier is High`);
assert(timiHigh.fourteenDayMacePercent === 26.2, `TIMI 14-day MACE is 26.2%`);

// HEART Score
const heartMod = calculateHeartScore({
  history: 2,
  ecg: 1,
  age: 55, // 1 pt
  riskFactors: 1,
  troponin: 1,
});
assert(heartMod.score === 6, `HEART score is 6 (got ${heartMod.score})`);
assert(heartMod.riskCategory === 'Moderate Risk', `HEART score is Moderate Risk`);

// Killip
const killipPulm = calculateKillipClass({
  hasRales: true,
  hasThirdHeartSound: true,
  hasPulmonaryEdema: true,
  hasCardiogenicShock: false,
});
assert(killipPulm.killipClass === 'III', `Killip Class is III`);
assert(killipPulm.mortalityPercent === 38, `Killip III mortality is 38%`);

// QTc
const qtcRes = calculateQtc(420, 75);
assert(qtcRes.bazettMs === 470, `Bazett QTc is 470 ms (got ${qtcRes.bazettMs})`);
assert(qtcRes.fridericiaMs === 452, `Fridericia QTc is 452 ms (got ${qtcRes.fridericiaMs})`);

// SOFA Score
const sofaRes = calculateSofaScore({
  pao2Fio2Ratio: 180,
  onMechanicalVentilation: true,
  platelets: 45,
  bilirubinMgDl: 3.5,
  meanArterialPressure: 62,
  vasopressor: 'dopamine_med_norepi_low',
  gcsScore: 11,
  creatinineMgDl: 2.5,
});
// resp=3, coag=3, liver=2, cv=3, cns=2, renal=2 -> 15
assert(sofaRes.totalScore === 15, `SOFA score is 15 (got ${sofaRes.totalScore})`);
assert(sofaRes.mortalityEstimate.includes('>80%'), `SOFA 15 indicates >80% mortality`);

// qSOFA
const qsofaPos = calculateQsofa({ rrGte22: true, sbpLte100: true, alteredMentalStatus: true });
assert(qsofaPos.score === 3, `qSOFA is 3`);
assert(qsofaPos.isPositive === true, `qSOFA >= 2 is positive`);

// Light's Criteria
const lightsExudate = evaluateLightsCriteria({
  pleuralProtein: 3.6,
  serumProtein: 6.0, // ratio 0.60 > 0.5
  pleuralLdh: 180,
  serumLdh: 200,
  serumLdhUpperLimitNormal: 240,
});
assert(lightsExudate.isExudate === true, `Light's Criteria confirms exudative effusion`);

// Berlin ARDS
const ardsMod = evaluateBerlinArds({
  timingWithin7Days: true,
  bilateralOpacitiesOnImaging: true,
  edemaNotFullyExplainedByHf: true,
  pao2Fio2Ratio: 150,
  peepCmH2o: 8,
});
assert(ardsMod.isArds === true, `Berlin ARDS is confirmed`);
assert(ardsMod.severity === 'Moderate ARDS', `Berlin ARDS is Moderate (150 mmHg)`);

// A-a Gradient
const aaRes = calculateAaGradient({ ageYears: 60, pao2MmHg: 70, paco2MmHg: 40, fio2Percent: 21 });
assert(aaRes.expectedGradientForAge === 19, `60yo expected A-a is 19 mmHg`);
assert(aaRes.aaGradientMmHg > 25, `A-a gradient is elevated in hypoxemic patient`);

// FENa
const fenaPrerenal = calculateFena({
  urinarySodiumMeqL: 12,
  serumSodiumMeqL: 140,
  urinaryCreatinineMgDl: 120,
  serumCreatinineMgDl: 2.0,
});
assert(fenaPrerenal.fenaPercent === 0.14, `FENa is 0.14% (got ${fenaPrerenal.fenaPercent})`);
assert(fenaPrerenal.etiology === 'Prerenal Azotemia', `FENa < 1% is Prerenal Azotemia`);

// FEUrea
const feUreaRes = calculateFeUrea({
  urinaryUreaMgDl: 300,
  bloodUreaNitrogenMgDl: 60,
  urinaryCreatinineMgDl: 100,
  serumCreatinineMgDl: 2.0,
});
assert(feUreaRes.feUreaPercent === 10.0, `FEUrea is 10.0% (got ${feUreaRes.feUreaPercent})`);
assert(feUreaRes.isPrerenalWithDiuretics === true, `FEUrea < 35% confirms prerenal azotemia`);

// Winter's Formula
const winters = calculateWintersFormula(12);
assert(winters.expectedPaco2 === 26.0, `Winter's expected PaCO2 for HCO3 12 is 26.0 mmHg`);
assert(winters.interpretationForActualPaco2(26).includes('Appropriate'), `PaCO2 26 is appropriately compensated`);

// Free Water Deficit
const fwd = calculateFreeWaterDeficit({ serumSodiumMeqL: 160, weightKg: 70, sex: 'male' });
assert(fwd.totalBodyWaterLiters === 42, `70kg male TBW is 42L`);
assert(fwd.waterDeficitLiters === 6.0, `Free water deficit is 6.0 L (got ${fwd.waterDeficitLiters})`);

// Corrected Calcium
const corrCa = calculateCorrectedCalcium(7.8, 2.0);
assert(corrCa.correctedCalciumMgDl === 9.4, `Corrected Ca is 9.4 mg/dL (got ${corrCa.correctedCalciumMgDl})`);
assert(corrCa.isHypocalcemic === false, `Corrected Ca 9.4 is normal (not truly hypocalcemic)`);

// BISAP
const bisapRes = calculateBisapScore({
  bunGt25: true,
  impairedMentalStatus: false,
  sirsCriteriaGte2: true,
  ageGt60: true,
  pleuralEffusionPresent: false,
});
assert(bisapRes.score === 3, `BISAP score is 3 (got ${bisapRes.score})`);

// FIB-4
const fib4Res = calculateFib4({ ageYears: 55, astU_L: 60, altU_L: 40, platelets_10e3_uL: 120 });
assert(fib4Res.score === 4.35, `FIB-4 score is 4.35 (got ${fib4Res.score})`);
assert(fib4Res.stage === 'High Risk Advanced Fibrosis (F3-F4)', `FIB-4 4.35 is High Risk`);

// ABCD2
const abcd2Res = calculateAbcd2Score({
  age60Plus: true,
  sbpGte140OrDbpGte90: true,
  unilateralWeakness: true,
  speechImpairmentWithoutWeakness: false,
  durationMinutes: '>=60',
  hasDiabetes: true,
});
assert(abcd2Res.score === 7, `ABCD2 score is 7 (got ${abcd2Res.score})`);
assert(abcd2Res.riskTier === 'High', `ABCD2 score 7 is High risk`);

// SIRS & Dengue
const sirsRes = calculateSirs({ tempAbnormal: true, heartRateGt90: true, respRateGt20OrPaco2Lt32: true, wbcAbnormal: false });
assert(sirsRes.score === 3, `SIRS score is 3`);
assert(sirsRes.hasSirs === true, `SIRS is met`);

const dengueWarn = evaluateDengueWarningSigns({
  abdominalPain: true,
  persistentVomiting: true,
  fluidAccumulation: false,
  mucosalBleeding: false,
  lethargyOrRestlessness: false,
  hepatomegalyGt2cm: false,
  hematocritRiseWithRapidPlateletDrop: true,
});
assert(dengueWarn.classification === 'Dengue with Warning Signs', `Dengue warning signs recognized`);

// Mentzer Index & ANC
const mentzerRes = calculateMentzerIndex(65, 6.2);
assert(mentzerRes.mentzerIndex === 10.5, `Mentzer index is 10.5`);
assert(mentzerRes.likelyDiagnosis === 'Beta-Thalassemia Trait', `Mentzer < 13 is Beta-Thalassemia Trait`);

const ancRes = calculateAbsoluteNeutrophilCount(1.2, 20, 5);
assert(ancRes.ancCellsPerMicroLiter === 300, `ANC is 300 cells/uL (got ${ancRes.ancCellsPerMicroLiter})`);
assert(ancRes.neutropeniaGrade === 'Severe Neutropenia', `ANC 300 is Severe Neutropenia`);

console.log('\n--- 6. VERIFYING EXPANDED SURGERY SUITE CALCULATORS ---\n');

// RTS
const rtsRes = calculateRevisedTraumaScore({ gcs: 14, sbp: 110, rr: 18 });
assert(rtsRes.triageRts === 7.841, `Triage RTS is 7.841 (got ${rtsRes.triageRts})`);
assert(rtsRes.traumaCenterIndication === false, `RTS 7.841 does not require mandatory trauma triage`);

// ABC Score for MTP
const abcRes = calculateAbcScoreForMtp({ penetratingMechanism: true, sbpLte90: true, heartRateGte120: true, positiveFastExam: false });
assert(abcRes.score === 3, `ABC score is 3 (got ${abcRes.score})`);
assert(abcRes.activateMtp === true, `ABC score >= 2 activates MTP`);

// Shock Index
const siRes = calculateShockIndex(120, 80);
assert(siRes.shockIndex === 1.5, `Shock index is 1.5 (got ${siRes.shockIndex})`);
assert(siRes.isShockPresent === true, `SI >= 0.9 confirms shock`);

// Modified Baux Score
const bauxRes = calculateModifiedBauxScore(60, 30, true);
assert(bauxRes.bauxScore === 107, `Modified Baux is 107 (60+30+17)`);

// ASA Class
const asaRes = evaluateAsaClass(3, true);
assert(asaRes.classification.includes('ASA IIIE'), `ASA III emergency tagged with E`);

// Mallampati
const mallampatiRes = evaluateMallampati(4);
assert(mallampatiRes.grade === 'Class IV', `Mallampati Class IV`);
assert(mallampatiRes.intubationDifficulty.includes('High risk'), `Class IV indicates high intubation risk`);

// STOP-BANG
const stopBangRes = calculateStopBang({
  snoring: true,
  tiredFatiguedDaytime: true,
  observedApnea: true,
  highBloodPressure: true,
  bmiGt35: true,
  ageGt50: true,
  neckCircumferenceGt40cm: false,
  maleGender: true,
});
assert(stopBangRes.score === 7, `STOP-BANG score is 7`);
assert(stopBangRes.osaRiskTier === 'High Risk', `STOP-BANG 7 is High Risk`);

// ABI
const abiRes = calculateAnkleBrachialIndex(60, 110, 120);
assert(abiRes.rightAbi === 0.5, `Right ABI is 0.50 (got ${abiRes.rightAbi})`);
assert(abiRes.rightCategory.includes('Moderate PAD'), `Right ABI 0.50 is Moderate PAD`);

// Braden Scale
const bradenRes = evaluateBradenScale({ sensoryPerception: 2, moisture: 2, activity: 2, mobility: 2, nutrition: 2, frictionShear: 1 });
assert(bradenRes.score === 11, `Braden score is 11 (got ${bradenRes.score})`);
assert(bradenRes.riskLevel === 'High Risk', `Braden 11 is High Risk`);

// 4-2-1 Fluid Rule
const fluids421 = calculateSurgical421Fluids(70);
assert(fluids421.hourlyMaintenanceMlHr === 110, `70kg adult 4-2-1 maintenance is 110 mL/hr`);
assert(fluids421.dailyMaintenanceMlDay === 2640, `70kg adult 24h maintenance is 2640 mL`);

console.log('\n--- 7. VERIFYING EXPANDED PEDIATRICS SUITE CALCULATORS ---\n');

// New Ballard Score
const ballardRes = calculateNewBallardScore({
  posture: 3, squareWindow: 3, armRecoil: 2, poplitealAngle: 2, scarfSign: 2, heelToEar: 2,
  skin: 3, lanugo: 2, plantarSurface: 3, breast: 3, eyeEar: 2, genitals: 3,
});
// 14 + 16 = 30 -> (2*30 + 120) / 5 = 36.0 weeks
assert(ballardRes.totalScore === 30, `Ballard score is 30`);
assert(ballardRes.gestationalAgeWeeks === 36.0, `Ballard 30 corresponds to 36.0 weeks GA`);

// Silverman-Andersen Score
const saRes = calculateSilvermanAndersenScore({
  upperChestMovement: 1, lowerChestRetractions: 1, xiphoidRetractions: 1, naresDilation: 1, expiratoryGrunt: 1,
});
assert(saRes.score === 5, `Silverman-Andersen score is 5`);
assert(saRes.respiratoryDistressTier === 'Moderate Distress', `SA 5 is Moderate Distress`);

// Corrected Age
const corrAge = calculateCorrectedAge(20, 32);
assert(corrAge.weeksPremature === 8, `32w infant is 8 weeks premature`);
assert(corrAge.correctedAgeWeeks === 12.0, `20w chronological is 12.0w corrected`);

// Mid-Parental Height
const mphBoy = calculateMidParentalHeight(178, 163, 'boy');
assert(mphBoy.targetHeightCm === 177.0, `Boy target height is 177.0 cm (got ${mphBoy.targetHeightCm})`);

// Westley Croup
const croupRes = calculateWestleyCroupScore({ stridor: 2, retractions: 2, airEntry: 1, cyanosis: 0, consciousness: 0 });
assert(croupRes.score === 5, `Westley score is 5`);
assert(croupRes.severity === 'Moderate Croup', `Westley 5 is Moderate Croup`);

// PECARN Head Injury
const pecarnHigh = evaluatePecarnHeadTrauma({
  ageYears: 1.5,
  gcsLt15: true,
  alteredMentalStatus: false,
  palpableSkullFractureOrBasilarSigns: false,
  occipitalOrParietalHematoma: false,
  locGt5Seconds: false,
  severeMechanism: false,
  vomitingOrSevereHeadache: false,
  actingAbnormalPerParents: false,
});
assert(pecarnHigh.riskCategory === 'High Risk (ciTBI > 4%)', `GCS < 15 is PECARN High Risk`);

// Kawasaki Disease
const kawasakiRes = evaluateKawasakiDisease({
  feverDays: 6,
  bilateralBulbarConjunctivalInjection: true,
  oralMucosalChanges: true,
  polymorphousRash: true,
  extremityChanges: true,
  cervicalLymphadenopathy: false,
});
assert(kawasakiRes.isClassicalKawasaki === true, `6 days fever + 4 criteria is Classical Kawasaki`);

console.log('\n--- 8. VERIFYING EXPANDED OB/GYN SUITE CALCULATORS ---\n');

// Fundal Height
const fundalRes = evaluateFundalHeight(28, 32);
assert(fundalRes.discrepancyCm === -4, `Discrepancy is -4 cm`);
assert(fundalRes.status.includes('Small for Gestational Age'), `Discrepancy of -4cm flags SGA/Oligohydramnios`);

// Biophysical Profile (BPP)
const bppRes = calculateBiophysicalProfile({
  nonStressTestReactive: true,
  fetalBreathingPresent: true,
  grossBodyMovementsPresent: true,
  fetalTonePresent: true,
  amnioticFluidVolumeNormal: true,
});
assert(bppRes.score === 10, `BPP score is 10/10`);
assert(bppRes.fetalStatus.includes('Normal'), `BPP 10 is Normal`);

// Carpenter-Coustan GDM
const gdmRes = evaluateGdmOgttCarpenterCoustan({ fastingMgDl: 98, oneHourMgDl: 185, twoHourMgDl: 140, threeHourMgDl: 120 });
assert(gdmRes.abnormalCount === 2, `2 abnormal values (fasting & 1h)`);
assert(gdmRes.hasGdm === true, `2 abnormal values confirms GDM`);

// HELLP Syndrome
const hellpRes = evaluateHellpSyndrome({ plateletsPerMicroLiter: 45000, astOrAltU_L: 120, ldhU_L: 750 });
assert(hellpRes.hasHellp === true, `HELLP confirmed`);
assert(hellpRes.mississippiClass === 'Class 1 HELLP (Severe)', `Plt < 50k is Class 1 HELLP`);

// NICHD FHR Category
const fhrCat3 = evaluateNichdFhrCategory({
  baselineBpm: 140,
  variability: 'absent',
  lateDecelerations: 'recurrent',
  variableDecelerations: 'none',
  prolongedDecelerations: false,
  sinusoidalPattern: false,
});
assert(fhrCat3.category === 'Category III (Abnormal)', `Absent variability + recurrent late decels is Category III`);

// HELPERR Mnemonic
const helperr = getHelperrMnemonic();
assert(helperr.length === 7, `HELPERR contains 7 distinct emergency steps`);

// Rotterdam PCOS
const pcosRes = evaluateRotterdamPcos({
  oligoOrAnovulation: true,
  clinicalOrBiochemicalHyperandrogenism: true,
  polycysticOvariesOnUltrasound: true,
  otherEtiologiesExcluded: true,
});
assert(pcosRes.meetsRotterdamCriteria === true, `Meets Rotterdam PCOS criteria`);

// Ferriman-Gallwey Hirsutism
const hirsutismRes = calculateFerrimanGallweyHirsutism({
  upperLip: 2, chin: 2, chest: 2, upperAbdomen: 2, lowerAbdomen: 2, upperArms: 2, thighs: 2, upperBack: 1, lowerBack: 1,
});
assert(hirsutismRes.score === 16, `Ferriman-Gallwey score is 16 (got ${hirsutismRes.score})`);
assert(hirsutismRes.severity === 'Moderate Hirsutism', `Score 16 is Moderate Hirsutism`);

console.log('\n--- 9. VERIFYING CLINICAL CALCULATOR WIKI ENGINES ---\n');

// 1. ASCVD 10-Year Risk
const ascvd = calculateAscvdRisk({
  age: 55,
  isFemale: false,
  isAfricanAmerican: false,
  totalCholesterol: 210,
  hdlCholesterol: 45,
  systolicBp: 138,
  onHypertensionMeds: true,
  isSmoker: false,
  hasDiabetes: false,
});
assert(ascvd.tenYearRiskPercent > 0, `ASCVD 10-year risk computed (>0)`);
assert(ascvd.statinRecommendation.length > 10, `ASCVD statin recommendation provided`);

// 2. GRACE ACS Score
const grace = calculateGraceScore({
  age: 65,
  heartRate: 90,
  systolicBp: 120,
  creatinine: 1.2,
  killipClass: 1,
  cardiacArrestAtAdmission: false,
  stSegmentDeviation: true,
  elevatedCardiacEnzymes: true,
});
assert(grace.score > 80, `GRACE score calculated`);
assert(grace.inHospitalMortalityTier.length > 0, `GRACE mortality tier classified`);

// 3. Revised Geneva Score
const geneva = calculateGenevaScore({
  ageOver65: false,
  previousDvtOrPe: true,
  surgeryOrFracturePastMonth: false,
  activeMalignancy: false,
  unilateralLowerLimbPain: true,
  hemoptysis: false,
  heartRate: 100,
  painOnDeepPalpationAndUnilateralEdema: false,
});
assert(geneva.score === 11, `Geneva score is 11 (got ${geneva.score})`);
assert(geneva.probabilityCategory === 'High Probability', `Geneva 11 is High Probability`);

// 4. SAAG Ascites
const saag = calculateSaag(3.5, 1.2, 1.8);
assert(saag.saag === 2.3, `SAAG is 2.3 g/dL (got ${saag.saag})`);
assert(saag.portalHypertension === true, `SAAG ≥ 1.1 confirms Portal Hypertension`);

// 5. Maddrey mDF
const mdf = calculateMaddreyDf(24, 12, 15);
assert(mdf.mdfScore === 70.2, `mDF score is 70.2 (got ${mdf.mdfScore})`);
assert(mdf.severeAlcoholicHepatitis === true, `mDF 70.2 is severe alcoholic hepatitis`);

// 6. 4Ts Score for HIT
const hit = calculateFourTsScore({ thrombocytopenia: 2, timing: 2, thrombosis: 2, otherCauses: 2 });
assert(hit.score === 8, `4Ts score is 8 (got ${hit.score})`);
assert(hit.probability.includes('High'), `Score 8 is High Probability HIT`);

// 7. Burch-Wartofsky Point Scale
const bwps = calculateBurchWartofsky({
  temperatureC: 39.5,
  cnsEffects: 'Moderate delirium/psychosis',
  giHepatic: 'Severe jaundice',
  heartRate: 135,
  congestiveHeartFailure: 'Moderate (bibasilar rales)',
  atrialFibrillation: true,
  precipitantHistory: true,
});
assert(bwps.score >= 45, `BWPS score indicates thyroid storm (got ${bwps.score})`);
assert(bwps.stormProbability.includes('Highly Likely'), `BWPS confirms storm highly likely`);

// 8. Canadian C-Spine Rule
const cspineHighRisk = evaluateCanadianCSpine({
  ageAtLeast65: true,
  dangerousMechanism: false,
  paresthesiasInExtremities: false,
  simpleRearEndMvc: true,
  sittingPositionInED: true,
  ambulatoryAtAnyTime: true,
  delayedOnsetNeckPain: false,
  absenceOfMidlineCSpineTenderness: true,
  ableToRotateNeck45DegreesLeftAndRight: true,
});
assert(cspineHighRisk.radiographyMandated === true, `Age >= 65 mandates C-spine imaging`);

const cspineCleared = evaluateCanadianCSpine({
  ageAtLeast65: false,
  dangerousMechanism: false,
  paresthesiasInExtremities: false,
  simpleRearEndMvc: true,
  sittingPositionInED: true,
  ambulatoryAtAnyTime: true,
  delayedOnsetNeckPain: false,
  absenceOfMidlineCSpineTenderness: true,
  ableToRotateNeck45DegreesLeftAndRight: true,
});
assert(cspineCleared.cSpineClearedClinically === true, `Low risk + 45 deg rotation clears C-spine`);

// 9. RIPASA Appendicitis Score
const ripasa = calculateRipasaScore({
  isFemale: false,
  ageYears: 25,
  rightIliacFossaPain: true,
  painMigrationToRif: true,
  anorexia: true,
  nauseaAndVomiting: true,
  durationSymptomsLessThan48h: true,
  rifTenderness: true,
  rifGuarding: true,
  reboundTenderness: true,
  rovsingSignPositive: false,
  feverAtLeast37_5C: true,
  elevatedWbc: true,
  negativeUrinalysis: true,
  foreignNricNationalId: true,
});
assert(ripasa.score >= 10, `RIPASA score calculated (got ${ripasa.score})`);
assert(ripasa.probability.includes('High Probability'), `RIPASA flags high probability appendicitis`);

// 10. LRINEC Score
const lrinec = calculateLrinecScore({
  crpMgL: 160,
  wbcCount: 26,
  hemoglobinGdl: 10.0,
  serumSodiumMeqL: 130,
  serumCreatinineMgDl: 1.8,
  glucoseMgDl: 190,
});
assert(lrinec.score === 13, `LRINEC score is 13 (got ${lrinec.score})`);
assert(lrinec.riskTier.includes('High Risk'), `LRINEC 13 is High Risk Necrotizing Fasciitis`);

// 11. Forrest Classification
const forrest = getForrestClassification('Ia');
assert(forrest.endoscopicTherapyMandated === true, `Forrest Ia mandates endoscopic therapy`);
assert(forrest.rebleedRiskPercent === '90%', `Forrest Ia rebleed risk is 90%`);

// 12. Tokyo Guidelines TG18
const tokyo = evaluateTokyoCholangitis({
  hypotensionRequiringInotropes: true,
  neurologicalDisturbance: false,
  respiratoryPaO2FiO2Under300: false,
  renalOliguriaOrCrOver2: false,
  hepaticInrOver1_5: false,
  thrombocytopeniaUnder100k: false,
  wbcOver12kOrUnder4k: true,
  highFeverAtLeast39C: true,
  ageAtLeast75: false,
  hyperbilirubinemiaTotalBilirubinAtLeast5: true,
  hypoalbuminemiaUnder2_8: false,
});
assert(tokyo.grade.includes('Grade III'), `Hypotension with inotropes is Grade III Severe Cholangitis`);

// 13. Bhutani Bilirubin Nomogram
const bhutani = evaluateBhutaniNomogram(36, 15.0, 38, false);
assert(bhutani.phototherapyIndicated === true, `36h TSB 15.0 indicates phototherapy`);

// 14. Kramer Jaundice
const kramer = evaluateKramersRule(5);
assert(kramer.zone.includes('Zone 5'), `Zone 5 confirmed`);
assert(kramer.clinicalNote.includes('CRITICAL'), `Zone 5 triggers critical warning`);

// 15. Downes Score
const downes = calculateDownesScore({ respiratoryRate: 2, cyanosis: 1, retractions: 2, grunting: 2, airEntry: 1 });
assert(downes.score === 8, `Downes score is 8 (got ${downes.score})`);
assert(downes.severity.includes('Impending Respiratory Failure'), `Downes 8 is impending respiratory failure`);

// 16. Bedside PEWS
const pews = calculatePews({ behavior: 2, cardiovascular: 2, respiratory: 2, persistentVomitingPostOp: true });
assert(pews.score === 8, `PEWS score is 8 (got ${pews.score})`);
assert(pews.riskTier.includes('High Risk'), `PEWS 8 is High Risk`);

// 17. Modified Jones Criteria
const jones = evaluateJonesCriteria({
  isLowRiskPopulation: false,
  evidenceOfPrecedingStrepInfection: true,
  carditisClinicalOrSubclinicalEcho: true,
  polyarthritis: true,
  choreaSydenham: false,
  erythemaMarginatum: false,
  subcutaneousNodules: false,
  arthralgia: false,
  feverAtLeast38_5C: true,
  elevatedEsrOrCrp: true,
  prolongedPrIntervalOnEcg: false,
});
assert(jones.arfDiagnosisMet === true, `2 Major criteria meets Acute Rheumatic Fever`);

// 18. WHO MUAC
const muac = evaluateMuac(110);
assert(muac.classification.includes('Severe Acute Malnutrition'), `MUAC 110mm is Severe Acute Malnutrition`);

// 19. ROMA Ovarian Cancer Score
const roma = calculateRomaScore(120, 150, true);
assert(roma.romaPercentage > 0, `ROMA score calculated`);
assert(roma.riskCategory.includes('High Risk'), `Postmenopausal high biomarkers is High Risk`);

// 20. Amsel Criteria
const amsel = evaluateAmselCriteria({
  homogeneousThinWhiteGrayDischarge: true,
  vaginalPhGreaterThan4_5: true,
  positiveWhiffTestFishyOdor10PercentKOH: true,
  clueCellsPresentAtLeast20PercentWetMount: true,
});
assert(amsel.bvConfirmed === true, `4/4 Amsel criteria confirms BV`);

// 21. Umbilical Artery Doppler
const dopRedf = evaluateUmbilicalDoppler(32, 45, -5, 20);
assert(dopRedf.dopplerStatus.includes('Reversed'), `Negative diastolic velocity is REDF`);

// 22. Swansea AFLP Criteria
const swansea = evaluateSwanseaCriteria({
  vomiting: true, abdominalPain: true, polydipsiaPolyuria: true, encephalopathy: true,
  elevatedBilirubinOver14UmolL: true, hypoglycemiaUnder4MmolL: true, elevatedUricAcidOver340UmolL: true,
  leukocytosisOver11: true, ascitesOrBrightLiverOnUltrasound: false, elevatedTransaminasesAstOrAltOver42: true,
  elevatedAmmoniaOver47UmolL: false, renalImpairmentCreatinineOver150UmolL: false,
  coagulopathyPtOver14OrApttOver34: false, microvesicularSteatosisOnLiverBiopsy: false,
});
assert(swansea.aflpConfirmed === true, `8/14 Swansea criteria confirms AFLP (needs >=6)`);

// 23. FIGO PALM-COEIN
const palm = classifyPalmCoein({
  polyp: true, adenomyosis: false, leiomyoma: true, malignancyOrHyperplasia: false,
  coagulopathy: false, ovulatoryDysfunction: true, endometrial: false, iatrogenic: false, notOtherwiseSpecified: false,
});
assert(palm.figoCode.includes('P1'), `PALM code contains P1`);
assert(palm.structuralCauses.length === 2, `2 structural causes identified (Polyp, Leiomyoma)`);

// 24. Friedewald LDL-C Equation
const ldlValid = calculateFriedewaldLdl(200, 50, 150);
assert(ldlValid.isValid === true, `Friedewald valid when TG < 400`);
assert(ldlValid.ldlCholesterol === 120.0, `Friedewald LDL is 120 mg/dL (got ${ldlValid.ldlCholesterol})`);
const ldlInvalid = calculateFriedewaldLdl(240, 40, 450);
assert(ldlInvalid.isValid === false, `Friedewald invalid when TG >= 400`);

// 25. NEXUS C-Spine Low-Risk Criteria
const nexusClean = evaluateNexusCriteria({
  focalNeurologicDeficit: false,
  midlineCSpineTenderness: false,
  alteredMentalStatus: false,
  intoxicationEvidence: false,
  distractingPainfulInjury: false,
});
assert(nexusClean.clearedWithoutImaging === true, `All 5 NEXUS criteria negative clears C-spine`);
const nexusPositive = evaluateNexusCriteria({
  focalNeurologicDeficit: true,
  midlineCSpineTenderness: false,
  alteredMentalStatus: false,
  intoxicationEvidence: false,
  distractingPainfulInjury: false,
});
assert(nexusPositive.clearedWithoutImaging === false, `Focal neuro deficit requires C-spine CT`);

console.log(`\nAll Clinical Engine Tests Summary: ${passed}/${total} passed.\n`);
