import { useState } from 'react';
import { Flame } from 'lucide-react';
import { CopyNoteButton } from '../CopyNoteButton';
import { NumberStepper } from '../ui/NumberStepper';
import {
  evaluateCanadianCSpine,
  calculateRipasaScore,
  calculateLrinecScore,
  getForrestClassification,
  evaluateTokyoCholangitis,
} from '../../calculators/clinicalWikiSurgery';

interface SurgeryWikiSuiteViewProps {
  patientTag?: string;
  initialTab?: string;
}

export default function SurgeryWikiSuiteView({
  patientTag,
  initialTab = 'ripasa',
}: SurgeryWikiSuiteViewProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // RIPASA state
  const [ripasaFemale, setRipasaFemale] = useState(false);
  const [ripasaAge, setRipasaAge] = useState(24);
  const [ripasaRifPain, setRipasaRifPain] = useState(true);
  const [ripasaMigration, setRipasaMigration] = useState(true);
  const [ripasaAnorexia, setRipasaAnorexia] = useState(true);
  const [ripasaNausea, setRipasaNausea] = useState(true);
  const [ripasaDuration48, setRipasaDuration48] = useState(true);
  const [ripasaTenderness, setRipasaTenderness] = useState(true);
  const [ripasaGuarding, setRipasaGuarding] = useState(true);
  const [ripasaRebound, setRipasaRebound] = useState(true);
  const [ripasaRovsing, setRipasaRovsing] = useState(false);
  const [ripasaFever, setRipasaFever] = useState(true);
  const [ripasaWbc, setRipasaWbc] = useState(true);
  const [ripasaUa, setRipasaUa] = useState(true);
  const [ripasaNric, setRipasaNric] = useState(true);

  // Canadian C-Spine state
  const [cspineAge65, setCspineAge65] = useState(false);
  const [cspineDangerous, setCspineDangerous] = useState(false);
  const [cspineParesthesias, setCspineParesthesias] = useState(false);
  const [cspineRearEnd, setCspineRearEnd] = useState(true);
  const [cspineSitting, setCspineSitting] = useState(true);
  const [cspineAmbulatory, setCspineAmbulatory] = useState(true);
  const [cspineDelayed, setCspineDelayed] = useState(false);
  const [cspineNoMidline, setCspineNoMidline] = useState(true);
  const [cspineRotate45, setCspineRotate45] = useState(true);

  // LRINEC state
  const [lrinecCrp, setLrinecCrp] = useState(160);
  const [lrinecWbc, setLrinecWbc] = useState(22);
  const [lrinecHgb, setLrinecHgb] = useState(10.5);
  const [lrinecNa, setLrinecNa] = useState(132);
  const [lrinecCr, setLrinecCr] = useState(1.8);
  const [lrinecGlucose, setLrinecGlucose] = useState(195);

  // Forrest state
  const [forrestStage, setForrestStage] = useState<'Ia' | 'Ib' | 'IIa' | 'IIb' | 'IIc' | 'III'>('Ia');

  // Tokyo TG18 state
  const [tgInotropes, setTgInotropes] = useState(false);
  const [tgNeuro, setTgNeuro] = useState(false);
  const [tgResp, setTgResp] = useState(false);
  const [tgRenal, setTgRenal] = useState(false);
  const [tgInr, setTgInr] = useState(false);
  const [tgPlt, setTgPlt] = useState(false);
  const [tgWbc, setTgWbc] = useState(true);
  const [tgFever, setTgFever] = useState(true);
  const [tgAge75, setTgAge75] = useState(false);
  const [tgBili5, setTgBili5] = useState(true);
  const [tgAlbumin, setTgAlbumin] = useState(false);

  // Computations
  const ripasaResult = calculateRipasaScore({
    isFemale: ripasaFemale,
    ageYears: ripasaAge,
    rightIliacFossaPain: ripasaRifPain,
    painMigrationToRif: ripasaMigration,
    anorexia: ripasaAnorexia,
    nauseaAndVomiting: ripasaNausea,
    durationSymptomsLessThan48h: ripasaDuration48,
    rifTenderness: ripasaTenderness,
    rifGuarding: ripasaGuarding,
    reboundTenderness: ripasaRebound,
    rovsingSignPositive: ripasaRovsing,
    feverAtLeast37_5C: ripasaFever,
    elevatedWbc: ripasaWbc,
    negativeUrinalysis: ripasaUa,
    foreignNricNationalId: ripasaNric,
  });

  const cspineResult = evaluateCanadianCSpine({
    ageAtLeast65: cspineAge65,
    dangerousMechanism: cspineDangerous,
    paresthesiasInExtremities: cspineParesthesias,
    simpleRearEndMvc: cspineRearEnd,
    sittingPositionInED: cspineSitting,
    ambulatoryAtAnyTime: cspineAmbulatory,
    delayedOnsetNeckPain: cspineDelayed,
    absenceOfMidlineCSpineTenderness: cspineNoMidline,
    ableToRotateNeck45DegreesLeftAndRight: cspineRotate45,
  });

  const lrinecResult = calculateLrinecScore({
    crpMgL: lrinecCrp,
    wbcCount: lrinecWbc,
    hemoglobinGdl: lrinecHgb,
    serumSodiumMeqL: lrinecNa,
    serumCreatinineMgDl: lrinecCr,
    glucoseMgDl: lrinecGlucose,
  });

  const forrestResult = getForrestClassification(forrestStage);

  const tokyoResult = evaluateTokyoCholangitis({
    hypotensionRequiringInotropes: tgInotropes,
    neurologicalDisturbance: tgNeuro,
    respiratoryPaO2FiO2Under300: tgResp,
    renalOliguriaOrCrOver2: tgRenal,
    hepaticInrOver1_5: tgInr,
    thrombocytopeniaUnder100k: tgPlt,
    wbcOver12kOrUnder4k: tgWbc,
    highFeverAtLeast39C: tgFever,
    ageAtLeast75: tgAge75,
    hyperbilirubinemiaTotalBilirubinAtLeast5: tgBili5,
    hypoalbuminemiaUnder2_8: tgAlbumin,
  });

  const ehrNote = `SURGICAL WIKI CONSULTATION NOTE
Patient: ${patientTag || 'Emergency Trauma / Acute Abdomen'}
Date/Time: ${new Date().toLocaleString()}

1. RIPASA APPENDICITIS SCORE (ASIA-VALIDATED):
- Score: ${ripasaResult.score} (${ripasaResult.probability})
- Recommendation: ${ripasaResult.recommendation}

2. CANADIAN C-SPINE RULE:
- Imaging Mandated: ${cspineResult.radiographyMandated ? 'YES (CT C-Spine)' : 'NO (Clinically Cleared)'}
- Rationale: ${cspineResult.rationale}

3. LRINEC SCORE FOR NECROTIZING FASCIITIS:
- Score: ${lrinecResult.score}/13 (${lrinecResult.riskTier})
- Action: ${lrinecResult.surgicalRecommendation}

4. FORREST CLASSIFICATION (PEPTIC ULCER BLEED):
- Finding: ${forrestResult.stage}
- Rebleed Risk: ${forrestResult.rebleedRiskPercent}
- Endoscopic Therapy: ${forrestResult.endoscopicTherapyMandated ? 'MANDATED' : 'NOT INDICATED'}
- Management: ${forrestResult.postEndoscopyGuidance}

5. TOKYO GUIDELINES TG18 (ACUTE CHOLANGITIS):
- Severity: ${tokyoResult.grade}
- Drainage Timing: ${tokyoResult.biliaryDrainageTiming}

Guideline Sources: Singapore Med J, Stiell JAMA, Wong Crit Care Med, ESGE, Tokyo TG18.`;

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 dark:border-slate-700/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
              Wiki Master Suite
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ATLS · TG18 · ESGE · WSES · Ortho Trauma
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-600 dark:text-red-400" />
            Surgery & Acute Care Wiki Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            High-yield surgical tools: RIPASA Asian appendicitis, Canadian C-Spine, LRINEC necrotizing fasciitis, Forrest ulcer classification & Tokyo TG18 cholangitis
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <CopyNoteButton textToCopy={ehrNote} />
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl mb-5 gap-1 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('ripasa')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'ripasa'
              ? 'bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          RIPASA Score
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cspine')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'cspine'
              ? 'bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Canadian C-Spine
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('lrinec')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'lrinec'
              ? 'bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          LRINEC Fasciitis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('forrest')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'forrest'
              ? 'bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Forrest Ulcer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tokyo')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'tokyo'
              ? 'bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Tokyo TG18
        </button>
      </div>

      {/* Tab 1: RIPASA Asian Appendicitis */}
      {activeTab === 'ripasa' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumberStepper label="Age" unit="years" value={ripasaAge} onChange={setRipasaAge} min={5} max={100} />
            <button
              type="button"
              onClick={() => setRipasaFemale(!ripasaFemale)}
              className={`p-3 rounded-xl text-xs font-bold border transition-all ${
                ripasaFemale ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Sex: {ripasaFemale ? 'Female (+0.5)' : 'Male (+1.0)'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: 'Right Iliac Fossa (RIF) Pain (+0.5)', val: ripasaRifPain, set: setRipasaRifPain },
              { label: 'Pain Migration to RIF (+0.5)', val: ripasaMigration, set: setRipasaMigration },
              { label: 'Anorexia (+1.0)', val: ripasaAnorexia, set: setRipasaAnorexia },
              { label: 'Nausea & Vomiting (+1.0)', val: ripasaNausea, set: setRipasaNausea },
              { label: 'Duration < 48 hours (+1.0)', val: ripasaDuration48, set: setRipasaDuration48 },
              { label: 'RIF Tenderness (+1.0)', val: ripasaTenderness, set: setRipasaTenderness },
              { label: 'RIF Guarding (+2.0)', val: ripasaGuarding, set: setRipasaGuarding },
              { label: 'Rebound Tenderness (+1.0)', val: ripasaRebound, set: setRipasaRebound },
              { label: 'Rovsing Sign Positive (+2.0)', val: ripasaRovsing, set: setRipasaRovsing },
              { label: 'Fever ≥ 37.5°C (+1.0)', val: ripasaFever, set: setRipasaFever },
              { label: 'Elevated WBC > 11k (+1.0)', val: ripasaWbc, set: setRipasaWbc },
              { label: 'Negative Urinalysis (+1.0)', val: ripasaUa, set: setRipasaUa },
              { label: 'Asian / Regional Population NRIC (+1.0)', val: ripasaNric, set: setRipasaNric },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => item.set(!item.val)}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                  item.val
                    ? 'bg-red-50 dark:bg-red-950/60 border-red-400 dark:border-red-700 text-red-950 dark:text-red-200'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{item.label}</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                  item.val ? 'bg-red-600 text-white border-red-600' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {item.val ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-red-900 dark:text-red-300 uppercase tracking-wider">RIPASA Appendicitis Score</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white">
                {ripasaResult.score} pts · {ripasaResult.probability}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {ripasaResult.recommendation}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {ripasaResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Canadian C-Spine */}
      {activeTab === 'cspine' && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs font-medium text-amber-900 dark:text-amber-200">
            Step 1: High-risk factors mandate radiography. Step 2: Low-risk factors allow ROM testing. Step 3: Bilateral 45° rotation clears c-spine.
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider block">1. High Risk Criteria (Any = CT Mandatory)</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCspineAge65(!cspineAge65)}
                className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                  cspineAge65 ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Age ≥ 65: {cspineAge65 ? 'YES' : 'NO'}
              </button>
              <button
                type="button"
                onClick={() => setCspineDangerous(!cspineDangerous)}
                className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                  cspineDangerous ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Dangerous Mechanism: {cspineDangerous ? 'YES' : 'NO'}
              </button>
              <button
                type="button"
                onClick={() => setCspineParesthesias(!cspineParesthesias)}
                className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                  cspineParesthesias ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Extremity Paresthesias: {cspineParesthesias ? 'YES' : 'NO'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">2. Low Risk Criteria (Need ≥ 1 to test rotation)</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCspineRearEnd(!cspineRearEnd)}
                className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                  cspineRearEnd ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-950 dark:text-blue-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Simple rear-end MVC
              </button>
              <button
                type="button"
                onClick={() => setCspineSitting(!cspineSitting)}
                className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                  cspineSitting ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-950 dark:text-blue-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Sitting position in Emergency Dept
              </button>
              <button
                type="button"
                onClick={() => setCspineAmbulatory(!cspineAmbulatory)}
                className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                  cspineAmbulatory ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-950 dark:text-blue-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Ambulatory at any time post-injury
              </button>
              <button
                type="button"
                onClick={() => setCspineDelayed(!cspineDelayed)}
                className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                  cspineDelayed ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-950 dark:text-blue-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Delayed onset neck pain
              </button>
              <button
                type="button"
                onClick={() => setCspineNoMidline(!cspineNoMidline)}
                className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                  cspineNoMidline ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-950 dark:text-blue-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Absence of midline C-spine tenderness
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">3. Range of Motion Assessment</span>
            <button
              type="button"
              onClick={() => setCspineRotate45(!cspineRotate45)}
              className={`w-full p-3 rounded-xl text-xs font-bold border transition-all ${
                cspineRotate45 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-red-600 text-white border-red-600'
              }`}
            >
              Able to actively rotate neck 45° left AND right: {cspineRotate45 ? 'YES (Cleared)' : 'NO (Needs CT)'}
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">C-Spine Recommendation</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${
                cspineResult.radiographyMandated ? 'bg-red-600' : 'bg-emerald-600'
              }`}>
                {cspineResult.radiographyMandated ? 'CT IMAGING MANDATORY' : 'CLINICALLY CLEARED'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {cspineResult.rationale}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {cspineResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 3: LRINEC Score */}
      {activeTab === 'lrinec' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <NumberStepper label="CRP" unit="mg/L" value={lrinecCrp} onChange={setLrinecCrp} min={5} max={400} step={10} />
            <NumberStepper label="WBC Count" unit="x10³/µL" value={lrinecWbc} onChange={setLrinecWbc} min={1} max={50} step={1} />
            <NumberStepper label="Hemoglobin" unit="g/dL" value={lrinecHgb} onChange={setLrinecHgb} min={4.0} max={18.0} step={0.5} />
            <NumberStepper label="Serum Sodium" unit="mEq/L" value={lrinecNa} onChange={setLrinecNa} min={115} max={155} step={1} />
            <NumberStepper label="Creatinine" unit="mg/dL" value={lrinecCr} onChange={setLrinecCr} min={0.4} max={10.0} step={0.2} />
            <NumberStepper label="Glucose" unit="mg/dL" value={lrinecGlucose} onChange={setLrinecGlucose} min={60} max={600} step={10} />
          </div>

          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-red-900 dark:text-red-300 uppercase tracking-wider">LRINEC Necrotizing Fasciitis Score</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${
                lrinecResult.score >= 8 ? 'bg-red-600' : lrinecResult.score >= 6 ? 'bg-amber-600' : 'bg-emerald-600'
              }`}>
                {lrinecResult.score} / 13 ({lrinecResult.riskTier})
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {lrinecResult.surgicalRecommendation}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {lrinecResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 4: Forrest Classification */}
      {activeTab === 'forrest' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {(['Ia', 'Ib', 'IIa', 'IIb', 'IIc', 'III'] as const).map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => setForrestStage(stage)}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                  forrestStage === stage
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Forrest {stage}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-red-900 dark:text-red-300 uppercase tracking-wider">{forrestResult.stage}</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white">
                Rebleed Risk: {forrestResult.rebleedRiskPercent}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
              {forrestResult.description}
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-1">
              {forrestResult.postEndoscopyGuidance}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {forrestResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 5: Tokyo TG18 */}
      {activeTab === 'tokyo' && (
        <div className="space-y-4">
          <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider block">Grade III (Severe) Organ Dysfunction Criteria</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: 'Hypotension requiring vasopressors', val: tgInotropes, set: setTgInotropes },
              { label: 'Altered consciousness / CNS disturbance', val: tgNeuro, set: setTgNeuro },
              { label: 'PaO2/FiO2 < 300', val: tgResp, set: setTgResp },
              { label: 'Oliguria or Creatinine > 2.0 mg/dL', val: tgRenal, set: setTgRenal },
              { label: 'INR > 1.5', val: tgInr, set: setTgInr },
              { label: 'Platelets < 100,000 /µL', val: tgPlt, set: setTgPlt },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => item.set(!item.val)}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                  item.val
                    ? 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-950 dark:text-red-200'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{item.label}</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                  item.val ? 'bg-red-600 text-white border-red-600' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {item.val ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>

          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Grade II (Moderate) Inflammatory Criteria</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: 'WBC > 12,000 or < 4,000 /µL', val: tgWbc, set: setTgWbc },
              { label: 'High fever ≥ 39°C', val: tgFever, set: setTgFever },
              { label: 'Age ≥ 75 years', val: tgAge75, set: setTgAge75 },
              { label: 'Total Bilirubin ≥ 5 mg/dL', val: tgBili5, set: setTgBili5 },
              { label: 'Hypoalbuminemia < 2.8 g/dL', val: tgAlbumin, set: setTgAlbumin },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => item.set(!item.val)}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                  item.val
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-950 dark:text-amber-200'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{item.label}</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                  item.val ? 'bg-amber-600 text-white border-amber-600' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {item.val ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-red-900 dark:text-red-300 uppercase tracking-wider">TG18 Severity & Drainage</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white">
                {tokyoResult.grade}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {tokyoResult.biliaryDrainageTiming}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {tokyoResult.guideline}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
