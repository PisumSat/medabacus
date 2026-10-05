import { useState } from 'react';
import { HeartPulse } from 'lucide-react';
import { CopyNoteButton } from '../CopyNoteButton';
import { NumberStepper } from '../ui/NumberStepper';
import {
  calculateAscvdRisk,
  calculateGraceScore,
  calculateGenevaScore,
  calculateSaag,
  calculateMaddreyDf,
  calculateBurchWartofsky,
  calculateFourTsScore,
} from '../../calculators/clinicalWikiMedicine';

interface MedicineWikiSuiteViewProps {
  patientTag?: string;
  initialTab?: string;
}

export default function MedicineWikiSuiteView({
  patientTag,
  initialTab = 'ascvd',
}: MedicineWikiSuiteViewProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // ASCVD state
  const [ascvdAge, setAscvdAge] = useState(55);
  const [ascvdIsFemale, setAscvdIsFemale] = useState(false);
  const [ascvdIsAa, setAscvdIsAa] = useState(false);
  const [ascvdTc, setAscvdTc] = useState(210);
  const [ascvdHdl, setAscvdHdl] = useState(45);
  const [ascvdSbp, setAscvdSbp] = useState(138);
  const [ascvdHtnMeds, setAscvdHtnMeds] = useState(true);
  const [ascvdSmoker, setAscvdSmoker] = useState(false);
  const [ascvdDiabetes, setAscvdDiabetes] = useState(false);

  // GRACE state
  const [graceAge, setGraceAge] = useState(64);
  const [graceHr, setGraceHr] = useState(88);
  const [graceSbp, setGraceSbp] = useState(124);
  const [graceCr, setGraceCr] = useState(1.1);
  const [graceKillip, setGraceKillip] = useState<1 | 2 | 3 | 4>(1);
  const [graceArrest, setGraceArrest] = useState(false);
  const [graceStDev, setGraceStDev] = useState(true);
  const [graceEnzymes, setGraceEnzymes] = useState(true);

  // Geneva state
  const [genevaAge65, setGenevaAge65] = useState(false);
  const [genevaPriorVte, setGenevaPriorVte] = useState(false);
  const [genevaSurgery, setGenevaSurgery] = useState(false);
  const [genevaCancer, setGenevaCancer] = useState(false);
  const [genevaLegPain, setGenevaLegPain] = useState(true);
  const [genevaHemoptysis, setGenevaHemoptysis] = useState(false);
  const [genevaHr, setGenevaHr] = useState(96);
  const [genevaPalpationEdema, setGenevaPalpationEdema] = useState(false);

  // SAAG state
  const [serumAlbumin, setSerumAlbumin] = useState(3.4);
  const [asciticAlbumin, setAsciticAlbumin] = useState(1.2);
  const [asciticProtein, setAsciticProtein] = useState(1.8);

  // Maddrey state
  const [patientPt, setPatientPt] = useState(24.5);
  const [controlPt, setControlPt] = useState(12.0);
  const [totalBilirubin, setTotalBilirubin] = useState(14.8);

  // 4Ts HIT state
  const [hitPltNadir, setHitPltNadir] = useState<0 | 1 | 2>(2);
  const [hitTiming, setHitTiming] = useState<0 | 1 | 2>(2);
  const [hitThrombosis, setHitThrombosis] = useState<0 | 1 | 2>(0);
  const [hitOther, setHitOther] = useState<0 | 1 | 2>(2);

  // Burch-Wartofsky state
  const [bwpsTemp, setBwpsTemp] = useState(38.6);
  const [bwpsHr, setBwpsHr] = useState(128);
  const [bwpsCns, setBwpsCns] = useState<'None' | 'Mild agitation' | 'Moderate delirium/psychosis' | 'Severe seizure/coma'>('Mild agitation');
  const [bwpsGi, setBwpsGi] = useState<'None' | 'Diarrhea/nausea/vomiting' | 'Severe jaundice'>('Diarrhea/nausea/vomiting');
  const [bwpsAfib, setBwpsAfib] = useState(false);
  const [bwpsPrecipitant, setBwpsPrecipitant] = useState(true);

  // Computations
  const ascvdResult = calculateAscvdRisk({
    age: ascvdAge,
    isFemale: ascvdIsFemale,
    isAfricanAmerican: ascvdIsAa,
    totalCholesterol: ascvdTc,
    hdlCholesterol: ascvdHdl,
    systolicBp: ascvdSbp,
    onHypertensionMeds: ascvdHtnMeds,
    isSmoker: ascvdSmoker,
    hasDiabetes: ascvdDiabetes,
  });

  const graceResult = calculateGraceScore({
    age: graceAge,
    heartRate: graceHr,
    systolicBp: graceSbp,
    creatinine: graceCr,
    killipClass: graceKillip,
    cardiacArrestAtAdmission: graceArrest,
    stSegmentDeviation: graceStDev,
    elevatedCardiacEnzymes: graceEnzymes,
  });

  const genevaResult = calculateGenevaScore({
    ageOver65: genevaAge65,
    previousDvtOrPe: genevaPriorVte,
    surgeryOrFracturePastMonth: genevaSurgery,
    activeMalignancy: genevaCancer,
    unilateralLowerLimbPain: genevaLegPain,
    hemoptysis: genevaHemoptysis,
    heartRate: genevaHr,
    painOnDeepPalpationAndUnilateralEdema: genevaPalpationEdema,
  });

  const saagResult = calculateSaag(serumAlbumin, asciticAlbumin, asciticProtein);
  const mdfResult = calculateMaddreyDf(patientPt, controlPt, totalBilirubin);
  const hitResult = calculateFourTsScore({
    thrombocytopenia: hitPltNadir,
    timing: hitTiming,
    thrombosis: hitThrombosis,
    otherCauses: hitOther,
  });
  const bwpsResult = calculateBurchWartofsky({
    temperatureC: bwpsTemp,
    cnsEffects: bwpsCns,
    giHepatic: bwpsGi,
    heartRate: bwpsHr,
    congestiveHeartFailure: 'None',
    atrialFibrillation: bwpsAfib,
    precipitantHistory: bwpsPrecipitant,
  });

  // Clinical EHR Note
  const ehrNote = `CLINICAL WIKI INTERNAL MEDICINE CONSULT
Patient: ${patientTag || 'Bedside Assessment'}
Date/Time: ${new Date().toLocaleString()}

1. 10-YEAR ASCVD RISK (ACC/AHA 2018):
- Estimated Risk: ${ascvdResult.tenYearRiskPercent}% (${ascvdResult.riskTier})
- Statin Recommendation: ${ascvdResult.statinRecommendation}

2. GRACE ACS MORTALITY SCORE (ESC 2023):
- Score: ${graceResult.score} points (${graceResult.inHospitalMortalityTier})
- In-Hospital Mortality: ${graceResult.mortalityRiskPercent}
- Strategy: ${graceResult.recommendedInvasiveStrategy}

3. REVISED GENEVA PE PRETEST SCORE:
- Score: ${genevaResult.score} points (${genevaResult.probabilityCategory})
- PE Prevalence: ${genevaResult.pePrevalencePercent}
- Plan: ${genevaResult.recommendedPathway}

4. SAAG ASCITES EVALUATION (AASLD):
- Serum Alb: ${serumAlbumin} g/dL, Ascitic Alb: ${asciticAlbumin} g/dL
- SAAG: ${saagResult.saag} g/dL (${saagResult.portalHypertension ? 'Portal HTN Present' : 'Non-Portal HTN'})
- Interpretation: ${saagResult.differentialDiagnosis}

5. MADDREY'S DISCRIMINANT FUNCTION (ALCOHOLIC HEPATITIS):
- mDF Score: ${mdfResult.mdfScore} (PT ${patientPt}s vs Control ${controlPt}s, Bili ${totalBilirubin} mg/dL)
- Severity: ${mdfResult.severeAlcoholicHepatitis ? 'Severe (≥32)' : 'Mild/Moderate (<32)'}
- Management: ${mdfResult.corticosteroidRecommendation}

6. 4Ts HIT PROBABILITY SCORE (ASH 2018):
- Score: ${hitResult.score}/8 (${hitResult.probability})
- Recommendation: ${hitResult.clinicalAction}

7. BURCH-WARTOFSKY THYROID STORM SCORE (ATA):
- Score: ${bwpsResult.score} points (${bwpsResult.stormProbability})
- Action: ${bwpsResult.emergencyAction}

Guideline Sources: ACC/AHA, ESC, AASLD, ASH, ATA Standards.`;

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 dark:border-slate-700/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Wiki Master Suite
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ACC/AHA · ESC · AASLD · ASH · ATA
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Internal Medicine Wiki Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            High-yield scores: ASCVD 10-year risk, GRACE ACS, Geneva PE, SAAG ascites, Maddrey mDF, 4Ts HIT & Burch-Wartofsky
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <CopyNoteButton textToCopy={ehrNote} />
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl mb-5 gap-1 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('ascvd')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'ascvd'
              ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          ASCVD Risk
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('grace')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'grace'
              ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          GRACE ACS
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('geneva')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'geneva'
              ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Geneva PE
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('saag')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'saag'
              ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          SAAG Ascites
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('maddrey')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'maddrey'
              ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Maddrey mDF
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hit')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'hit'
              ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          4Ts HIT
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bwps')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'bwps'
              ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Thyroid Storm
        </button>
      </div>

      {/* Tab 1: ASCVD 10-Year Risk */}
      {activeTab === 'ascvd' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <NumberStepper label="Age" unit="years" value={ascvdAge} onChange={setAscvdAge} min={20} max={79} step={1} />
            <NumberStepper label="Total Cholesterol" unit="mg/dL" value={ascvdTc} onChange={setAscvdTc} min={130} max={320} step={5} />
            <NumberStepper label="HDL Cholesterol" unit="mg/dL" value={ascvdHdl} onChange={setAscvdHdl} min={20} max={100} step={1} />
            <NumberStepper label="Systolic BP" unit="mmHg" value={ascvdSbp} onChange={setAscvdSbp} min={90} max={200} step={2} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAscvdIsFemale(!ascvdIsFemale)}
              className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                ascvdIsFemale ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {ascvdIsFemale ? 'Female' : 'Male'}
            </button>
            <button
              type="button"
              onClick={() => setAscvdIsAa(!ascvdIsAa)}
              className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                ascvdIsAa ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {ascvdIsAa ? 'African American' : 'White / Other'}
            </button>
            <button
              type="button"
              onClick={() => setAscvdHtnMeds(!ascvdHtnMeds)}
              className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                ascvdHtnMeds ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              HTN Rx: {ascvdHtnMeds ? 'Yes' : 'No'}
            </button>
            <button
              type="button"
              onClick={() => setAscvdSmoker(!ascvdSmoker)}
              className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                ascvdSmoker ? 'bg-rose-600 text-white border-rose-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Smoker: {ascvdSmoker ? 'Yes' : 'No'}
            </button>
            <button
              type="button"
              onClick={() => setAscvdDiabetes(!ascvdDiabetes)}
              className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                ascvdDiabetes ? 'bg-amber-600 text-white border-amber-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Diabetes: {ascvdDiabetes ? 'Yes' : 'No'}
            </button>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">10-Year ASCVD Risk</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-600 text-white">
                {ascvdResult.tenYearRiskPercent}% ({ascvdResult.riskTier})
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {ascvdResult.statinRecommendation}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {ascvdResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: GRACE Score */}
      {activeTab === 'grace' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <NumberStepper label="Age" unit="y" value={graceAge} onChange={setGraceAge} min={18} max={105} />
            <NumberStepper label="Heart Rate" unit="bpm" value={graceHr} onChange={setGraceHr} min={30} max={220} />
            <NumberStepper label="Systolic BP" unit="mmHg" value={graceSbp} onChange={setGraceSbp} min={60} max={240} />
            <NumberStepper label="Creatinine" unit="mg/dL" value={graceCr} onChange={setGraceCr} min={0.2} max={10.0} step={0.1} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setGraceKillip(k as 1 | 2 | 3 | 4)}
                className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                  graceKillip === k
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Killip Class {k}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setGraceArrest(!graceArrest)}
              className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                graceArrest ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Cardiac Arrest: {graceArrest ? 'Yes (+43)' : 'No'}
            </button>
            <button
              type="button"
              onClick={() => setGraceStDev(!graceStDev)}
              className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                graceStDev ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              ST Deviation: {graceStDev ? 'Yes (+30)' : 'No'}
            </button>
            <button
              type="button"
              onClick={() => setGraceEnzymes(!graceEnzymes)}
              className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                graceEnzymes ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Elevated Troponin: {graceEnzymes ? 'Yes (+15)' : 'No'}
            </button>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider">GRACE ACS Score</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white">
                {graceResult.score} pts · {graceResult.inHospitalMortalityTier}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              In-Hospital Mortality: {graceResult.mortalityRiskPercent} · {graceResult.recommendedInvasiveStrategy}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {graceResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 3: Geneva PE Score */}
      {activeTab === 'geneva' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
            <NumberStepper label="Heart Rate" unit="bpm" value={genevaHr} onChange={setGenevaHr} min={40} max={200} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: 'Age > 65 (+1)', val: genevaAge65, set: setGenevaAge65 },
              { label: 'Previous DVT or PE (+3)', val: genevaPriorVte, set: setGenevaPriorVte },
              { label: 'Surgery or Fracture past month (+2)', val: genevaSurgery, set: setGenevaSurgery },
              { label: 'Active Malignancy (+2)', val: genevaCancer, set: setGenevaCancer },
              { label: 'Unilateral Lower Limb Pain (+3)', val: genevaLegPain, set: setGenevaLegPain },
              { label: 'Hemoptysis (+2)', val: genevaHemoptysis, set: setGenevaHemoptysis },
              { label: 'Pain on deep palpation & unilateral edema (+4)', val: genevaPalpationEdema, set: setGenevaPalpationEdema },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => item.set(!item.val)}
                className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                  item.val
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-400 dark:border-cyan-700 text-cyan-950 dark:text-cyan-200'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{item.label}</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                  item.val ? 'bg-cyan-600 text-white border-cyan-600' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {item.val ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-cyan-200 dark:border-cyan-900 bg-cyan-50/70 dark:bg-cyan-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-cyan-900 dark:text-cyan-300 uppercase tracking-wider">Revised Geneva Score</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-600 text-white">
                {genevaResult.score} pts · {genevaResult.probabilityCategory}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              PE Prevalence: {genevaResult.pePrevalencePercent} · {genevaResult.recommendedPathway}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {genevaResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 4: SAAG Ascites */}
      {activeTab === 'saag' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <NumberStepper label="Serum Albumin" unit="g/dL" value={serumAlbumin} onChange={setSerumAlbumin} min={0.5} max={6.0} step={0.1} />
            <NumberStepper label="Ascitic Albumin" unit="g/dL" value={asciticAlbumin} onChange={setAsciticAlbumin} min={0.1} max={5.0} step={0.1} />
            <NumberStepper label="Ascitic Total Protein" unit="g/dL" value={asciticProtein} onChange={setAsciticProtein} min={0.1} max={6.0} step={0.1} />
          </div>

          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">Serum-Ascites Albumin Gradient</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white">
                SAAG = {saagResult.saag} g/dL ({saagResult.portalHypertension ? 'Portal HTN' : 'Non-Portal'})
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {saagResult.differentialDiagnosis}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {saagResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 5: Maddrey mDF */}
      {activeTab === 'maddrey' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <NumberStepper label="Patient PT" unit="sec" value={patientPt} onChange={setPatientPt} min={10} max={60} step={0.5} />
            <NumberStepper label="Control PT" unit="sec" value={controlPt} onChange={setControlPt} min={10} max={15} step={0.5} />
            <NumberStepper label="Total Bilirubin" unit="mg/dL" value={totalBilirubin} onChange={setTotalBilirubin} min={0.5} max={40} step={0.5} />
          </div>

          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">Maddrey's Discriminant Function (mDF)</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${
                mdfResult.severeAlcoholicHepatitis ? 'bg-red-600' : 'bg-emerald-600'
              }`}>
                mDF = {mdfResult.mdfScore} ({mdfResult.severeAlcoholicHepatitis ? 'Severe ≥32' : 'Mild <32'})
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {mdfResult.corticosteroidRecommendation}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {mdfResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 6: 4Ts Score for HIT */}
      {activeTab === 'hit' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Thrombocytopenia</label>
              <select
                aria-label="Thrombocytopenia degree"
                value={hitPltNadir}
                onChange={(e) => setHitPltNadir(Number(e.target.value) as 0 | 1 | 2)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value={2}>2 pts: &gt;50% fall and platelet nadir ≥ 20</option>
                <option value={1}>1 pt: 30-50% fall or platelet nadir 10-19</option>
                <option value={0}>0 pts: &lt;30% fall or platelet nadir &lt; 10</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Timing of Platelet Fall</label>
              <select
                aria-label="Timing of platelet fall"
                value={hitTiming}
                onChange={(e) => setHitTiming(Number(e.target.value) as 0 | 1 | 2)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value={2}>2 pts: Clear onset between days 5-10 of heparin</option>
                <option value={1}>1 pt: &gt; Day 10 OR ≤ 1 day with heparin exposure within 30-100 days</option>
                <option value={0}>0 pts: Platelet fall ≤ 4 days without recent heparin</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Thrombosis or Sequelae</label>
              <select
                aria-label="Thrombosis or other sequelae"
                value={hitThrombosis}
                onChange={(e) => setHitThrombosis(Number(e.target.value) as 0 | 1 | 2)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value={2}>2 pts: Proven new thrombosis or skin necrosis at injection site</option>
                <option value={1}>1 pt: Progressive/recurrent thrombosis or suspect</option>
                <option value={0}>0 pts: None</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Other Causes of Thrombocytopenia</label>
              <select
                aria-label="Other causes of thrombocytopenia"
                value={hitOther}
                onChange={(e) => setHitOther(Number(e.target.value) as 0 | 1 | 2)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value={2}>2 pts: None apparent</option>
                <option value={1}>1 pt: Possible</option>
                <option value={0}>0 pts: Definite alternate cause present (sepsis, DIC)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/70 dark:bg-purple-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">4Ts Score for HIT</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-600 text-white">
                {hitResult.score} / 8 ({hitResult.probability})
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {hitResult.clinicalAction}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {hitResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 7: Thyroid Storm BWPS */}
      {activeTab === 'bwps' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumberStepper label="Temperature" unit="°C" value={bwpsTemp} onChange={setBwpsTemp} min={36.0} max={42.0} step={0.2} />
            <NumberStepper label="Heart Rate" unit="bpm" value={bwpsHr} onChange={setBwpsHr} min={50} max={220} step={2} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">CNS Effects</label>
              <select
                aria-label="CNS effects"
                value={bwpsCns}
                onChange={(e) => setBwpsCns(e.target.value as any)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="None">None (0)</option>
                <option value="Mild agitation">Mild agitation (10)</option>
                <option value="Moderate delirium/psychosis">Moderate delirium / psychosis (20)</option>
                <option value="Severe seizure/coma">Severe seizure / coma (30)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">GI-Hepatic Dysfunction</label>
              <select
                aria-label="GI-Hepatic dysfunction"
                value={bwpsGi}
                onChange={(e) => setBwpsGi(e.target.value as any)}
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                <option value="None">None (0)</option>
                <option value="Diarrhea/nausea/vomiting">Diarrhea, nausea, vomiting, or jaundice (10)</option>
                <option value="Severe jaundice">Severe jaundice (20)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBwpsAfib(!bwpsAfib)}
              className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                bwpsAfib ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Atrial Fibrillation: {bwpsAfib ? 'Present (+10)' : 'Absent'}
            </button>
            <button
              type="button"
              onClick={() => setBwpsPrecipitant(!bwpsPrecipitant)}
              className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                bwpsPrecipitant ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Precipitant History: {bwpsPrecipitant ? 'Present (+10)' : 'Absent'}
            </button>
          </div>

          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-red-900 dark:text-red-300 uppercase tracking-wider">Burch-Wartofsky Point Scale (BWPS)</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white">
                {bwpsResult.score} pts · {bwpsResult.stormProbability}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {bwpsResult.emergencyAction}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {bwpsResult.guideline}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
