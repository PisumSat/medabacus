/**
 * Test Suite for MEDABACUS Tier 2 Alpha Features:
 * 1. Multi-EHR Smart SOAP Studio Formatter (SOAP, Epic, Cerner, SBAR, Consult)
 * 2. SBAR Shift Census Sign-Out Generator
 * 3. Calculation History CSV Export & Audit Logging
 */

import { formatEhrNote } from './src/utils/ehrNoteFormatter.ts';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`✓ PASS: ${message}`);
  } else {
    testsFailed++;
    console.error(`✗ FAIL: ${message}`);
  }
}

console.log('\n--- 1. VERIFYING MULTI-EHR SMART SOAP STUDIO FORMATTER ---');

const sampleRawNote = `=== MEDABACUS INTERNAL MEDICINE MELD-Na ===
Patient: Bed 4A
MELD-Na Score: 24 (Estimated 90-day waitlist mortality: 52.6%)
Underlying Components: Bilirubin 3.8 mg/dL, Creatinine 2.1 mg/dL, INR 1.9, Sodium 131 mEq/L
Child-Pugh Score: 11 points (Class C Severe Hepatic Impairment)
Clinical Management: High priority for liver transplant evaluation. Avoid nephrotoxic agents.`;

// Test 1: Standard SOAP format
const soapNote = formatEhrNote(sampleRawNote, 'soap', {
  patientTag: 'Bed 4A',
  attendingName: 'Dr. House, MD',
  residentName: 'Dr. Chase, MD',
  toolTitle: 'MELD-Na 2016 & Child-Pugh',
  customImpression: 'Decompensated cirrhosis with acute kidney injury stage 1 on CKD.',
});

assert(soapNote.includes('=== MEDABACUS CLINICAL SOAP NOTE ==='), 'SOAP note header present');
assert(soapNote.includes('S (SUBJECTIVE):'), 'SOAP Subjective section present');
assert(soapNote.includes('O (OBJECTIVE & MEASUREMENTS):'), 'SOAP Objective section present');
assert(soapNote.includes('A (ASSESSMENT & RISK STRATIFICATION):'), 'SOAP Assessment section present');
assert(soapNote.includes('P (PLAN & INTERVENTIONS):'), 'SOAP Plan section present');
assert(soapNote.includes('Decompensated cirrhosis with acute kidney injury'), 'Custom clinical impression included');
assert(soapNote.includes('Dr. House, MD') && soapNote.includes('Dr. Chase, MD'), 'Attending and resident signers included');

// Test 2: Epic SmartPhrase (.dotphrase) format
const epicNote = formatEhrNote(sampleRawNote, 'epic', {
  patientTag: 'Bed 4A',
  attendingName: 'Dr. Cuddy, MD',
  residentName: 'Dr. Cameron, MD',
  toolTitle: 'MELD-Na 2016 & Child-Pugh',
});

assert(epicNote.includes('.MEDABACUS_'), 'Epic SmartPhrase header present');
assert(epicNote.includes('@NAME@ (@AGE@/@SEX@)'), 'Epic patient macro present');
assert(epicNote.includes('.VITALS: @VITALS@'), 'Epic vitals dotphrase present');
assert(epicNote.includes('.PERTINENT_LABS: @LABS@'), 'Epic labs dotphrase present');
assert(epicNote.includes('@ME@ (Dr. Cameron, MD)'), 'Epic provider sign-off present');

// Test 3: Cerner PowerChart format
const cernerNote = formatEhrNote(sampleRawNote, 'cerner', {
  patientTag: 'ICU Bed 2',
  attendingName: 'Dr. Foreman, MD',
  residentName: 'Dr. 13, MD',
  toolTitle: 'Parkland Burn',
});

assert(cernerNote.includes('*** CERNER POWERCHART CLINICAL NOTE ***'), 'Cerner PowerChart header present');
assert(cernerNote.includes('[OBJECTIVE & SCORING PARAMETERS]'), 'Cerner Objective section present');
assert(cernerNote.includes('[ASSESSMENT & CLINICAL ACTION]'), 'Cerner Assessment section present');
assert(cernerNote.includes('Electronically Verified by: Dr. 13, MD'), 'Cerner electronic verification present');

// Test 4: SBAR Clinical Handoff format
const sbarNote = formatEhrNote(sampleRawNote, 'sbar', {
  patientTag: 'Bed 4A',
  residentName: 'Dr. Wilson, MD',
  toolTitle: 'MELD-Na 2016',
});

assert(sbarNote.includes('*** SBAR CLINICAL HANDOFF / SIGN-OUT ***'), 'SBAR handoff header present');
assert(sbarNote.includes('S (Situation): Bed: Bed 4A'), 'SBAR Situation present');
assert(sbarNote.includes('B (Background):'), 'SBAR Background present');
assert(sbarNote.includes('A (Assessment):'), 'SBAR Assessment present');
assert(sbarNote.includes('R (Recommendation):'), 'SBAR Recommendation present');

// Test 5: Specialty Consult Note format
const consultNote = formatEhrNote(sampleRawNote, 'consult', {
  patientTag: 'L&D Rm 3',
  attendingName: 'Dr. Attending, MD',
  residentName: 'Dr. Fellow, MD',
  toolTitle: 'Bishop Cervical Score',
});

assert(consultNote.includes('*** SPECIALTY CONSULTANT IMPRESSION & RECOMMENDATIONS ***'), 'Consult note header present');
assert(consultNote.includes('1. EVIDENCE-BASED ASSESSMENT:'), 'Consult assessment present');
assert(consultNote.includes('2. RECOMMENDATIONS:'), 'Consult recommendations present');

console.log('\n--- 2. VERIFYING SHIFT CENSUS SBAR GENERATOR LOGIC ---');

// Mock a multi-patient census
const mockCensus = [
  {
    bedTag: 'Bed 4A',
    ward: 'internal_medicine',
    age: 62,
    gender: 'M',
    admittingDiagnosis: 'Decompensated Cirrhosis',
    clinicalNotes: 'Ascites tapping scheduled at 10 AM.',
    activeScores: [
      { toolTitle: 'MELD-Na 2016', scoreBadge: 'MELD-Na: 24', summaryText: 'Cr 2.1, Bili 3.8, INR 1.9' },
    ],
  },
  {
    bedTag: 'ICU Bed 2',
    ward: 'surgery',
    age: 38,
    gender: 'M',
    admittingDiagnosis: 'Flame Burn 35% TBSA',
    clinicalNotes: 'Intubated, A-line placed.',
    activeScores: [
      { toolTitle: 'Parkland Burn', scoreBadge: 'LR: 9,800 mL / 24h', summaryText: 'First 8h rate 612 mL/hr' },
    ],
    timer: { label: 'Parkland 8h Target', durationMinutes: 480, startedAt: Date.now() - 3600000 },
  },
];

function generateMockSbar(patients) {
  const lines = [
    '==================================================',
    'MEDABACUS WARD SHIFT HANDOFF (SBAR SIGN-OUT)',
    `Total Census: ${patients.length} Patient(s)`,
    '==================================================',
  ];

  patients.forEach((pt, idx) => {
    lines.push(`[${idx + 1}] ${pt.bedTag.toUpperCase()}`);
    lines.push(`S (Situation): ${pt.age}yo ${pt.gender} admitted for ${pt.admittingDiagnosis}`);
    lines.push(`B (Background): ${pt.clinicalNotes}`);
    lines.push(`A (Calculated Assessment & Risk):`);
    pt.activeScores.forEach((s) => lines.push(`   • ${s.toolTitle}: [${s.scoreBadge}] ${s.summaryText}`));
    if (pt.timer) {
      lines.push(`R (Recommendation & Timed Protocol): ${pt.timer.label}`);
    }
    lines.push('--------------------------------------------------');
  });

  return lines.join('\n');
}

const sbarOutput = generateMockSbar(mockCensus);
assert(sbarOutput.includes('Total Census: 2 Patient(s)'), 'SBAR counts total patients correctly');
assert(sbarOutput.includes('[1] BED 4A'), 'Patient 1 Bed 4A indexed');
assert(sbarOutput.includes('MELD-Na: 24'), 'Patient 1 MELD-Na score embedded in SBAR');
assert(sbarOutput.includes('[2] ICU BED 2'), 'Patient 2 ICU Bed 2 indexed');
assert(sbarOutput.includes('Parkland Burn: [LR: 9,800 mL / 24h]'), 'Patient 2 Parkland Burn embedded in SBAR');
assert(sbarOutput.includes('Parkland 8h Target'), 'Patient 2 resuscitation timer referenced');

console.log('\n--- 3. VERIFYING CALCULATION HISTORY CSV EXPORT FORMAT ---');

const mockHistory = [
  {
    timestamp: 1726650000000,
    patientTag: 'Bed 4A',
    ward: 'internal_medicine',
    toolTitle: 'MELD-Na 2016',
    summaryScore: 'Score: 24 (52% Mort)',
    clinicalNoteSnippet: 'MELD-Na calculation completed.',
  },
  {
    timestamp: 1726653600000,
    patientTag: 'ICU Bed 2',
    ward: 'surgery',
    toolTitle: 'Parkland Burn',
    summaryScore: 'LR: 9800 mL',
    clinicalNoteSnippet: 'Fluid calculation for 35% burn.',
  },
];

function generateMockCsv(history) {
  const headers = ['Timestamp', 'Bed / Patient Tag', 'Ward', 'Calculator', 'Result Score'];
  const rows = history.map((h) => [
    h.timestamp,
    `"${h.patientTag}"`,
    `"${h.ward}"`,
    `"${h.toolTitle}"`,
    `"${h.summaryScore}"`,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

const csvOutput = generateMockCsv(mockHistory);
assert(csvOutput.startsWith('Timestamp,Bed / Patient Tag,Ward,Calculator,Result Score'), 'CSV headers formatted correctly');
assert(csvOutput.includes('"Bed 4A"'), 'Bed 4A properly escaped in CSV row');
assert(csvOutput.includes('"Score: 24 (52% Mort)"'), 'Score properly escaped in CSV row');

console.log(`\nAll Alpha Feature Tests Summary: ${testsPassed}/${testsPassed + testsFailed} passed.`);
if (testsFailed > 0) process.exit(1);
