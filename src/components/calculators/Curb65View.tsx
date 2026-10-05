import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { calculateCurb65 } from '../../calculators/internalMedicine';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import { useCalculatorPrefill } from '../../context/useCalculatorPrefill';
import { AiPrefillBanner } from '../ui/AiPrefillBanner';

interface Curb65ViewProps {
  patientTag?: string;
}

export const Curb65View: React.FC<Curb65ViewProps> = ({ patientTag }) => {
  const { prefill, clearPrefill, hasPrefill } = useCalculatorPrefill('curb65');
  const [confusion, setConfusion] = useState(prefill?.confusion ?? false);
  const [bunElevated, setBunElevated] = useState(prefill?.bunElevated ?? false);
  const [rrElevated, setRrElevated] = useState(prefill?.rrElevated ?? true);
  const [lowBp, setLowBp] = useState(prefill?.lowBp ?? false);
  const [age65, setAge65] = useState(prefill?.age65 ?? true);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const result = useMemo(
    () =>
      calculateCurb65({
        confusion,
        ureaOver7MmolLOrBunOver19: bunElevated,
        respiratoryRate30OrMore: rrElevated,
        lowBloodPressure: lowBp,
        age65OrMore: age65,
      }),
    [confusion, bunElevated, rrElevated, lowBp, age65]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}COMMUNITY-ACQUIRED PNEUMONIA (CAP) CURB-65 ASSESSMENT:
- Total Score: ${result.score}/5 (${result.riskGroup} Risk | 30-day mortality ${result.mortality30DayPercent}%)
  * Confusion: ${confusion ? 'Yes' : 'No'}
  * Urea > 7 mmol/L (BUN > 19 mg/dL): ${bunElevated ? 'Yes' : 'No'}
  * Respiratory Rate >= 30: ${rrElevated ? 'Yes' : 'No'}
  * Blood Pressure (SBP < 90 or DBP <= 60): ${lowBp ? 'Yes' : 'No'}
  * Age >= 65: ${age65 ? 'Yes' : 'No'}
- Site of Care: ${result.careSiteRecommendation}
- Guideline Antibiotic Regimen: ${result.antibioticGuideline}`;
  }, [patientTag, result, confusion, bunElevated, rrElevated, lowBp, age65]);

  const resetDefaults = () => {
    setConfusion(false);
    setBunElevated(false);
    setRrElevated(true);
    setLowBp(false);
    setAge65(true);
    clearPrefill();
  };

  const references = [
    {
      source: 'Lim et al. (Thorax 2003)',
      title: 'Defining Community Acquired Pneumonia Severity on Presentation to Hospital: The CURB-65 Score',
      details: 'Validated across 1068 patients. Accurately stratifies 30-day mortality into low (0.7-2.1%), intermediate (9.2%), and high (15-40%).',
    },
    {
      source: 'Metlay et al. / ATS/IDSA (AJRCCM 2019)',
      title: 'Diagnosis and Treatment of Adults with Community-acquired Pneumonia',
      details: 'Recommends CURB-65 alongside clinical judgement to guide outpatient vs inpatient vs ICU admission.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                CURB-65 Pneumonia Severity Score
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                ATS / IDSA
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Community-acquired pneumonia 30-day mortality prediction & admission disposition
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="curb65" showLabel />
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

      {/* 5 CURB-65 Criteria Toggles */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Select Positive Clinical Criteria
          </span>
          <span className="text-xs font-black text-amber-700 dark:text-amber-400">
            {result.score} of 5 Criteria Met
          </span>
        </div>

        {[
          { letter: 'C', title: 'Confusion', subtitle: 'New mental disorientation (Abbreviated Mental Test score <= 8 or altered level of consciousness)', state: confusion, set: setConfusion },
          { letter: 'U', title: 'Urea > 7 mmol/L (BUN > 19 mg/dL)', subtitle: 'Serum blood urea nitrogen > 19 mg/dL reflecting acute dehydration or renal compromise', state: bunElevated, set: setBunElevated },
          { letter: 'R', title: 'Respiratory Rate >= 30 breaths/min', subtitle: 'Tachypnea indicating severe work of breathing or impending respiratory exhaustion', state: rrElevated, set: setRrElevated },
          { letter: 'B', title: 'Blood Pressure Low', subtitle: 'Systolic BP < 90 mmHg OR Diastolic BP <= 60 mmHg (septic hypotension)', state: lowBp, set: setLowBp },
          { letter: '65', title: 'Age >= 65 Years', subtitle: 'Elderly patient with higher physiological vulnerability and complication risk', state: age65, set: setAge65 },
        ].map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => item.set(!item.state)}
            className={`w-full p-3 rounded-xl text-left border flex items-start gap-3 transition-all ${
              item.state
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-950 dark:text-amber-200 font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
              item.state ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}>
              {item.letter}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{item.title}</span>
                <span className="text-[10px] font-semibold">{item.state ? '+1 point' : '0'}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                {item.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Result Card */}
      <div className={`p-4 rounded-2xl border mb-6 ${
        result.riskGroup === 'Severe'
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
          : result.riskGroup === 'Intermediate'
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {result.score} / 5
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              ({result.riskGroup} Risk Group)
            </span>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 shadow-2xs">
            30-Day Mortality: {result.mortality30DayPercent}%
          </span>
        </div>

        <div className="space-y-2 mt-3 text-xs text-slate-700 dark:text-slate-200">
          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <span className="font-bold block mb-1">Recommended Care Setting:</span>
            <span>{result.careSiteRecommendation}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <span className="font-bold block mb-1">ATS/IDSA First-Line Antibiotic Guideline:</span>
            <span>{result.antibioticGuideline}</span>
          </div>
        </div>
      </div>

      {/* EHR Note */}
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
        scoreBadge={`CURB-65: ${result.score}/5`}
        categoryLabel={`${result.riskGroup} Risk (${result.mortality30DayPercent}% mortality)`}
        noteText={clinicalNote}
        severityColor={result.score >= 3 ? 'rose' : result.score === 2 ? 'amber' : 'emerald'}
      />
    </div>
  );
};
