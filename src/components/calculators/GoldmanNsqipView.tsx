import { StarButton } from '../ui/StarButton';
import { useState, useMemo } from 'react';
import { HeartPulse, RotateCcw, CheckCircle2 } from 'lucide-react';
import { calculateGoldmanNsqip, type GoldmanNsqipInput } from '../../calculators/surgery';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface GoldmanNsqipViewProps {
  patientTag?: string;
}

export const GoldmanNsqipView = ({ patientTag }: GoldmanNsqipViewProps) => {
  // Goldman Criteria
  const [s3Jvd, setS3Jvd] = useState(false);
  const [recentMi, setRecentMi] = useState(false);
  const [nonSinus, setNonSinus] = useState(false);
  const [pvcs, setPvcs] = useState(false);
  const [ageOver70, setAgeOver70] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [aorticIntrathoracic, setAorticIntrathoracic] = useState(true);
  const [aorticStenosis, setAorticStenosis] = useState(false);
  const [poorMedicalStatus, setPoorMedicalStatus] = useState(false);

  // ACS NSQIP Predictors
  const [asaClass, setAsaClass] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [functionalStatus, setFunctionalStatus] = useState<'independent' | 'partially_dependent' | 'totally_dependent'>('independent');
  const [sepsis, setSepsis] = useState<'none' | 'sirs' | 'sepsis' | 'septic_shock'>('none');
  const [dyspnea, setDyspnea] = useState<'none' | 'exertion' | 'rest'>('none');
  const [acuteRenalFailure, setAcuteRenalFailure] = useState(false);
  const [steroids, setSteroids] = useState(false);
  const [ascites, setAscites] = useState(false);
  const [cancer, setCancer] = useState(false);
  const [bleedingDisorder, setBleedingDisorder] = useState(false);
  const [diabetes, setDiabetes] = useState(true);
  const [hypertension, setHypertension] = useState(true);
  const [copd, setCopd] = useState(false);

  const input: GoldmanNsqipInput = useMemo(
    () => ({
      s3GallopOrJvd: s3Jvd,
      myocardialInfarctionPast6m: recentMi,
      nonSinusRhythmOrPacs: nonSinus,
      prematureVentricularContractionsOver5PerMin: pvcs,
      ageOver70,
      emergencyOperation: emergency,
      intrathoracicIntraperitonealOrAortic: aorticIntrathoracic,
      significantAorticStenosis: aorticStenosis,
      poorGeneralMedicalCondition: poorMedicalStatus,
      asaClass,
      functionalStatus,
      systemicSepsis: sepsis,
      dyspnea,
      preopAcuteRenalFailure: acuteRenalFailure,
      chronicSteroidUse: steroids,
      ascitesWithin30Days: ascites,
      disseminatedCancer: cancer,
      bleedingDisorder,
      diabetesMellitus: diabetes,
      hypertensionRequiringMedication: hypertension,
      severeCopd: copd,
    }),
    [
      s3Jvd,
      recentMi,
      nonSinus,
      pvcs,
      ageOver70,
      emergency,
      aorticIntrathoracic,
      aorticStenosis,
      poorMedicalStatus,
      asaClass,
      functionalStatus,
      sepsis,
      dyspnea,
      acuteRenalFailure,
      steroids,
      ascites,
      cancer,
      bleedingDisorder,
      diabetes,
      hypertension,
      copd,
    ]
  );

  const result = useMemo(() => calculateGoldmanNsqip(input), [input]);

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}PREOPERATIVE SURGICAL & CARDIAC RISK ASSESSMENT:
1. GOLDMAN ORIGINAL CARDIAC RISK INDEX:
   * Total Score: ${result.goldmanScore} / 53 points (${result.goldmanClass})
   * Cardiac Death Risk: ${result.goldmanCardiacMortalityPercent}% | Severe Life-Threatening Cardiac Morbidity: ${result.goldmanSevereCardiacComplicationsPercent}%
   * Recommendation: ${result.goldmanRecommendation}

2. ACS NSQIP UNIVERSAL SURGICAL RISK PREDICTION:
   * Patient Profile: ASA Class ${asaClass} | Functional Status: ${functionalStatus.replace('_', ' ')} | Sepsis: ${sepsis.toUpperCase()}
   * Overall 30-Day Morbidity: ${result.nsqipOverallMorbidityPercent}% (${result.nsqipMorbidityRiskTier} Risk Tier)
   * Serious Complications Risk: ${result.nsqipSeriousComplicationsPercent}%
   * 30-Day Mortality Risk: ${result.nsqipMortality30DayPercent}%
   * Surgical Site Infection (SSI) Risk: ${result.nsqipSurgicalSiteInfectionPercent}%
   * Optimization Checklist:
${result.perioperativeOptimizationGuidelines.map((g) => `     - ${g}`).join('\n')}`;
  }, [patientTag, asaClass, functionalStatus, sepsis, result]);

  const resetDefaults = () => {
    setS3Jvd(false);
    setRecentMi(false);
    setNonSinus(false);
    setPvcs(false);
    setAgeOver70(false);
    setEmergency(false);
    setAorticIntrathoracic(true);
    setAorticStenosis(false);
    setPoorMedicalStatus(false);
    setAsaClass(3);
    setFunctionalStatus('independent');
    setSepsis('none');
    setDyspnea('none');
    setAcuteRenalFailure(false);
    setSteroids(false);
    setAscites(false);
    setCancer(false);
    setBleedingDisorder(false);
    setDiabetes(true);
    setHypertension(true);
    setCopd(false);
  };

  const references = [
    {
      source: 'Goldman L, et al. N Engl J Med 1977;297(16):845-850',
      title: 'Multifactorial Index of Cardiac Risk in Noncardiac Surgical Procedures',
      details: 'Pioneering validated point scoring system defining severe perioperative cardiac complications across noncardiac procedures.',
    },
    {
      source: 'Bilimoria KY, et al. J Am Coll Surg 2013;217(5):833-842',
      title: 'Development and Evaluation of the Universal ACS NSQIP Surgical Risk Calculator',
      details: 'Validated across 1.4 million patients from 393 hospital surgical departments to predict patient-specific post-surgical outcomes.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-32 sm:pb-36 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Goldman & ACS NSQIP Surgical Risk Suite
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                General Surgery
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Goldman original cardiac index & American College of Surgeons universal morbidity calculator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="goldman_nsqip" showLabel />
          <button
            type="button"
            onClick={resetDefaults}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <CopyNoteButton textToCopy={clinicalNote} />
        </div>
      </div>

      {/* Outcome Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Goldman Cardiac Result Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Goldman Cardiac Index
            </span>
            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
              result.goldmanClass === 'Class IV'
                ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                : result.goldmanClass === 'Class III'
                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                  : 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300'
            }`}>
              {result.goldmanClass} ({result.goldmanScore} pts)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold">Cardiac Death</span>
              <span className="text-base font-black text-rose-600 dark:text-rose-400">
                {result.goldmanCardiacMortalityPercent}%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold">Severe Complications</span>
              <span className="text-base font-black text-amber-600 dark:text-amber-400">
                {result.goldmanSevereCardiacComplicationsPercent}%
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
            {result.goldmanRecommendation}
          </p>
        </div>

        {/* ACS NSQIP Universal Result Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ACS NSQIP 30-Day Outcomes
            </span>
            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
              result.nsqipMorbidityRiskTier === 'Very High' || result.nsqipMorbidityRiskTier === 'High'
                ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                : result.nsqipMorbidityRiskTier === 'Moderate'
                  ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                  : 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300'
            }`}>
              {result.nsqipMorbidityRiskTier} Risk Tier
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-2 text-xs">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 block font-bold truncate">Morbidity</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {result.nsqipOverallMorbidityPercent}%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 block font-bold truncate">Serious</span>
              <span className="text-sm font-black text-amber-600">
                {result.nsqipSeriousComplicationsPercent}%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 block font-bold truncate">Mortality</span>
              <span className="text-sm font-black text-rose-600">
                {result.nsqipMortality30DayPercent}%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[9px] text-slate-400 block font-bold truncate">SSI</span>
              <span className="text-sm font-black text-blue-600">
                {result.nsqipSurgicalSiteInfectionPercent}%
              </span>
            </div>
          </div>
          <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
            {result.perioperativeOptimizationGuidelines.slice(0, 2).map((g, idx) => (
              <div key={idx} className="flex items-start gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>{g}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goldman Checklist */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 mb-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
          Goldman Preoperative Cardiac Criteria (9 Variables)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: 'S3 Gallop or Jugular Venous Distention (JVD) (+11)', val: s3Jvd, set: setS3Jvd },
            { label: 'Myocardial Infarction within past 6 months (+10)', val: recentMi, set: setRecentMi },
            { label: 'Rhythm other than sinus or PACs on pre-op ECG (+7)', val: nonSinus, set: setNonSinus },
            { label: '> 5 Premature Ventricular Contractions (PVCs)/min (+7)', val: pvcs, set: setPvcs },
            { label: 'Age > 70 years (+5)', val: ageOver70, set: setAgeOver70 },
            { label: 'Emergency operation (+4)', val: emergency, set: setEmergency },
            { label: 'Intrathoracic, intraperitoneal, or aortic operation (+3)', val: aorticIntrathoracic, set: setAorticIntrathoracic },
            { label: 'Significant aortic stenosis (calcified valve / gradient) (+3)', val: aorticStenosis, set: setAorticStenosis },
            { label: 'Poor general medical condition (PaO2<60, K<3, BUN>50, Cr>3, bedridden) (+3)', val: poorMedicalStatus, set: setPoorMedicalStatus },
          ].map((item, idx) => (
            <label
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold cursor-pointer transition-all ${
                item.val
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 text-amber-950 dark:text-amber-200 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={item.val}
                onChange={(e) => item.set(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ACS NSQIP Universal Surgical Predictors */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 mb-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3">
          ACS NSQIP Universal Risk Predictors
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              ASA Physical Status Class
            </label>
            <div className="grid grid-cols-5 gap-1">
              {([1, 2, 3, 4, 5] as const).map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setAsaClass(cls)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    asaClass === cls
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ASA {cls}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Functional Status
            </label>
            <select
              value={functionalStatus}
              onChange={(e) => setFunctionalStatus(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="independent">Independent</option>
              <option value="partially_dependent">Partially Dependent</option>
              <option value="totally_dependent">Totally Dependent</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Systemic Sepsis Status
            </label>
            <select
              value={sepsis}
              onChange={(e) => setSepsis(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="none">None</option>
              <option value="sirs">SIRS Criteria</option>
              <option value="sepsis">Sepsis</option>
              <option value="septic_shock">Septic Shock</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Diabetes Mellitus', val: diabetes, set: setDiabetes },
            { label: 'Hypertension', val: hypertension, set: setHypertension },
            { label: 'Severe COPD', val: copd, set: setCopd },
            { label: 'Acute Renal Failure', val: acuteRenalFailure, set: setAcuteRenalFailure },
            { label: 'Chronic Steroid Use', val: steroids, set: setSteroids },
            { label: 'Ascites in 30 Days', val: ascites, set: setAscites },
            { label: 'Disseminated Cancer', val: cancer, set: setCancer },
            { label: 'Bleeding Disorder', val: bleedingDisorder, set: setBleedingDisorder },
          ].map((item, idx) => (
            <label
              key={idx}
              className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
                item.val
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 text-amber-950 dark:text-amber-200'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={item.val}
                onChange={(e) => item.set(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <span className="truncate">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* EHR Documentation */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            EHR Preoperative Assessment Snippet
          </span>
          <CopyNoteButton textToCopy={clinicalNote} label="Copy Snippet" />
        </div>
        <textarea
          readOnly
          rows={5}
          value={clinicalNote}
          className="w-full text-xs font-mono p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 select-all"
        />
      </div>

      <ReferenceAccordion references={references} />

      <StickyMobileAction
        scoreBadge={`Goldman: ${result.goldmanClass} (${result.goldmanScore}p)`}
        categoryLabel={`NSQIP: ${result.nsqipOverallMorbidityPercent}% M&M`}
        noteText={clinicalNote}
        severityColor={result.goldmanClass === 'Class IV' ? 'rose' : result.goldmanClass === 'Class III' ? 'amber' : 'teal'}
      />
    </div>
  );
};
