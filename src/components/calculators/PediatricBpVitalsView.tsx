import { StarButton } from '../ui/StarButton';
import { useState, useMemo } from 'react';
import { Heart, RotateCcw } from 'lucide-react';
import { calculatePediatricBpAndVitals, type PediatricBpInput } from '../../calculators/pediatrics';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import { useCalculatorPrefill } from '../../context/useCalculatorPrefill';
import { AiPrefillBanner } from '../ui/AiPrefillBanner';

interface PediatricBpVitalsViewProps {
  patientTag?: string;
}

export const PediatricBpVitalsView = ({ patientTag }: PediatricBpVitalsViewProps) => {
  const { prefill, clearPrefill, hasPrefill } = useCalculatorPrefill('pediatric_bp_vitals');
  const [ageYears, setAgeYears] = useState(prefill?.ageYears ?? 8);
  const [sex, setSex] = useState<'male' | 'female'>(prefill?.sex ?? 'male');
  const [heightPercentile, setHeightPercentile] = useState<5 | 10 | 25 | 50 | 75 | 90 | 95>(50);
  const [sbp, setSbp] = useState(prefill?.sbp ?? 118);
  const [dbp, setDbp] = useState(prefill?.dbp ?? 76);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const input: PediatricBpInput = useMemo(
    () => ({
      ageYears,
      sex,
      heightPercentile,
      systolicBpMmHg: sbp,
      diastolicBpMmHg: dbp,
    }),
    [ageYears, sex, heightPercentile, sbp, dbp]
  );

  const result = useMemo(() => calculatePediatricBpAndVitals(input), [input]);

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}AAP 2017 PEDIATRIC BLOOD PRESSURE & VITAL SIGNS EVALUATION:
- Patient: ${ageYears}yo ${sex} | Height: ${heightPercentile}th percentile
- Measured Blood Pressure: ${sbp}/${dbp} mmHg
- AAP Classification: ${result.overallBpClassification}
- Reference Norms (50th / 90th / 95th Percentile):
  * Systolic BP: 50th = ${result.sbp50thPercentile} mmHg | 90th = ${result.sbp90thPercentile} mmHg | 95th = ${result.sbp95thPercentile} mmHg
  * Diastolic BP: 50th = ${result.dbp50thPercentile} mmHg | 90th = ${result.dbp90thPercentile} mmHg | 95th = ${result.dbp95thPercentile} mmHg
- Normal Age Vital Signs (${result.ageVitalSignNorms.ageGroup}):
  * HR: ${result.ageVitalSignNorms.heartRateRangeBpm} | RR: ${result.ageVitalSignNorms.respiratoryRateRange}
  * Normal SBP: ${result.ageVitalSignNorms.systolicBpRangeMmHg} | Min Acceptable SBP (PALS): >= ${result.ageVitalSignNorms.minimumAcceptableSbpPals} mmHg
- AAP Action Plan: ${result.clinicalRecommendation}`;
  }, [patientTag, ageYears, sex, heightPercentile, sbp, dbp, result]);

  const resetDefaults = () => {
    setAgeYears(8);
    setSex('male');
    setHeightPercentile(50);
    setSbp(118);
    setDbp(76);
    clearPrefill();
  };

  const references = [
    {
      source: 'Flynn JT, et al. Pediatrics 2017;140(3):e20171904',
      title: 'Clinical Practice Guideline for Screening and Management of High Blood Pressure in Children and Adolescents',
      details: 'American Academy of Pediatrics (AAP) consensus defining blood pressure percentiles and hypertension staging for children 1 to 18 years.',
    },
    {
      source: 'AHA PALS Guidelines & Nelson Textbook of Pediatrics',
      title: 'Pediatric Normal Vital Signs & Hypotension Definitions',
      details: 'PALS formula for minimum acceptable systolic blood pressure: 70 + (2 × age in years) mmHg for children aged 1-10 years.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-32 sm:pb-36 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Pediatric Blood Pressure & Vital Signs
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300">
                AAP 2017 Guidelines
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Percentiles, hypertension staging & age-stratified pediatric vital sign reference
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="pediatric_bp_vitals" showLabel />
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

      {/* AI Auto-Populate Banner */}
      {hasPrefill && !bannerDismissed && (
        <AiPrefillBanner
          paramCount={prefill ? Object.keys(prefill).length : undefined}
          onReset={resetDefaults}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      {/* Result Classification Banner */}
      <div className={`p-4 rounded-2xl mb-6 border transition-colors ${
        result.overallBpClassification === 'Stage 2 Hypertension'
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
          : result.overallBpClassification === 'Stage 1 Hypertension'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200'
            : result.overallBpClassification === 'Elevated Blood Pressure'
              ? 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800 text-yellow-950 dark:text-yellow-200'
              : 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl sm:text-2xl font-black">{result.overallBpClassification}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/70 dark:bg-black/40">
                {sbp}/{dbp} mmHg
              </span>
            </div>
            <p className="text-xs font-medium leading-relaxed max-w-2xl">
              {result.clinicalRecommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Input Steppers: Age, Sex, Height %, SBP, DBP */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6">
        <NumberStepper
          label="Age"
          unit="years"
          value={ageYears}
          min={1}
          max={17}
          step={1}
          onChange={setAgeYears}
        />

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Sex
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setSex('male')}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                sex === 'male'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => setSex('female')}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                sex === 'female'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Female
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Height Percentile
          </label>
          <select
            value={heightPercentile}
            onChange={(e) => setHeightPercentile(Number(e.target.value) as any)}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value={5}>5th Percentile</option>
            <option value={10}>10th Percentile</option>
            <option value={25}>25th Percentile</option>
            <option value={50}>50th Percentile (Average)</option>
            <option value={75}>75th Percentile</option>
            <option value={90}>90th Percentile</option>
            <option value={95}>95th Percentile</option>
          </select>
        </div>

        <NumberStepper
          label="Systolic BP"
          unit="mmHg"
          value={sbp}
          min={50}
          max={220}
          step={1}
          onChange={setSbp}
        />

        <NumberStepper
          label="Diastolic BP"
          unit="mmHg"
          value={dbp}
          min={20}
          max={140}
          step={1}
          onChange={setDbp}
        />
      </div>

      {/* Percentiles Comparison Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* SBP Cutoffs Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
            Systolic BP Percentiles (Age {ageYears} {sex}, {heightPercentile}% Ht)
          </span>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold">50th %tile</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {result.sbp50thPercentile} mmHg
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold">90th %tile (Elevated)</span>
              <span className="text-sm font-bold text-amber-600">
                {result.sbp90thPercentile} mmHg
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold">95th %tile (Stage 1)</span>
              <span className="text-sm font-bold text-rose-600">
                {result.sbp95thPercentile} mmHg
              </span>
            </div>
          </div>
        </div>

        {/* DBP Cutoffs Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
            Diastolic BP Percentiles (Age {ageYears} {sex}, {heightPercentile}% Ht)
          </span>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold">50th %tile</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {result.dbp50thPercentile} mmHg
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold">90th %tile (Elevated)</span>
              <span className="text-sm font-bold text-amber-600">
                {result.dbp90thPercentile} mmHg
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-semibold">95th %tile (Stage 1)</span>
              <span className="text-sm font-bold text-rose-600">
                {result.dbp95thPercentile} mmHg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Age-Based Normal Pediatric Vital Signs Reference Table */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 mb-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
          Pediatric Normal Vital Signs Reference ({result.ageVitalSignNorms.ageGroup})
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block font-semibold">Heart Rate Range</span>
            <span className="font-bold text-slate-900 dark:text-white">{result.ageVitalSignNorms.heartRateRangeBpm}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block font-semibold">Respiratory Rate</span>
            <span className="font-bold text-slate-900 dark:text-white">{result.ageVitalSignNorms.respiratoryRateRange}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block font-semibold">Normal SBP Range</span>
            <span className="font-bold text-slate-900 dark:text-white">{result.ageVitalSignNorms.systolicBpRangeMmHg}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 block font-semibold">PALS SBP Min (Hypotension)</span>
            <span className="font-black text-rose-600 dark:text-rose-400">&gt;= {result.ageVitalSignNorms.minimumAcceptableSbpPals} mmHg</span>
          </div>
        </div>
      </div>

      {/* EHR Documentation */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            EHR Documentation Snippet
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
        scoreBadge={`${sbp}/${dbp} mmHg`}
        categoryLabel={result.overallBpClassification}
        noteText={clinicalNote}
        severityColor={
          result.overallBpClassification === 'Stage 2 Hypertension'
            ? 'rose'
            : result.overallBpClassification === 'Stage 1 Hypertension'
              ? 'amber'
              : 'teal'
        }
      />
    </div>
  );
};
