import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Gauge, RotateCcw } from 'lucide-react';
import { calculateSurgicalApgarScore } from '../../calculators/surgery';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface SurgicalApgarViewProps {
  patientTag?: string;
}

export const SurgicalApgarView: React.FC<SurgicalApgarViewProps> = ({ patientTag }) => {
  const [ebl, setEbl] = useState(150);
  const [lowestMap, setLowestMap] = useState(65);
  const [lowestHr, setLowestHr] = useState(58);

  const result = useMemo(
    () =>
      calculateSurgicalApgarScore({
        estimatedBloodLossMl: ebl,
        lowestMeanArterialPressureMmHg: lowestMap,
        lowestHeartRateBpm: lowestHr,
      }),
    [ebl, lowestMap, lowestHr]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}SURGICAL APGAR SCORE (SAS) POSTOPERATIVE EVALUATION:
- Estimated Blood Loss (EBL): ${ebl} mL (${result.eblPoints} pts)
- Lowest Intraoperative MAP: ${lowestMap} mmHg (${result.mapPoints} pts)
- Lowest Intraoperative Heart Rate: ${lowestHr} bpm (${result.hrPoints} pts)
- Total Surgical Apgar Score: ${result.totalScore}/10 (${result.riskCategory})
  * 30-Day Major Complication Rate: ${result.majorComplicationRatePercent}%
  * 30-Day Postoperative Mortality: ${result.mortalityRatePercent}%
- PACU / Post-op Disposition: ${result.clinicalInterpretation}`;
  }, [patientTag, ebl, lowestMap, lowestHr, result]);

  const resetDefaults = () => {
    setEbl(150);
    setLowestMap(65);
    setLowestHr(58);
  };

  const references = [
    {
      source: 'Gawande AA, et al. (J Am Coll Surg 2007)',
      title: 'An Apgar Score for Surgery',
      details: 'Evaluates 3 simple intraoperative variables to immediately identify surgical patients at elevated risk of post-op complications and in-hospital death.',
    },
    {
      source: 'Regenbogen SE, et al. (Ann Surg 2009)',
      title: 'Utility of the Surgical Apgar Score: Validation in Multiple Specialties',
      details: 'Validated across general, vascular, and thoracic surgical cohorts as an objective metric for PACU disposition.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Surgical Apgar Score (SAS)
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                Gawande / JACS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immediate post-op risk score (EBL, lowest MAP, lowest HR) predicting 30-day major morbidity & mortality
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="surgical_apgar" showLabel />
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

      {/* 3 Parameter Steppers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <NumberStepper
          label="Estimated Blood Loss (EBL)"
          unit="mL"
          value={ebl}
          min={0}
          max={5000}
          step={50}
          onChange={setEbl}
          helperText="<=100 (3), 101-600 (2), 601-1000 (1), >1000 (0)"
        />
        <NumberStepper
          label="Lowest Intraoperative MAP"
          unit="mmHg"
          value={lowestMap}
          min={20}
          max={120}
          step={1}
          onChange={setLowestMap}
          helperText=">=70 (3), 55-69 (2), 40-54 (1), <40 (0)"
        />
        <NumberStepper
          label="Lowest Intraoperative Heart Rate"
          unit="bpm"
          value={lowestHr}
          min={25}
          max={160}
          step={1}
          onChange={setLowestHr}
          helperText="<=55 (4), 56-65 (3), 66-75 (2), 76-85 (1), >85 (0)"
        />
      </div>

      {/* Points Breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-center text-xs">
        <div>
          <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">EBL Points</span>
          <span className="font-black text-base text-slate-800 dark:text-slate-200">{result.eblPoints} / 3</span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Lowest MAP Points</span>
          <span className="font-black text-base text-slate-800 dark:text-slate-200">{result.mapPoints} / 3</span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Lowest HR Points</span>
          <span className="font-black text-base text-slate-800 dark:text-slate-200">{result.hrPoints} / 4</span>
        </div>
      </div>

      {/* Result Card */}
      <div className={`p-4 rounded-2xl border mb-6 ${
        result.totalScore <= 4
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
          : result.totalScore <= 6
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              SAS: {result.totalScore} / 10
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              ({result.riskCategory})
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs font-black text-slate-900 dark:text-white">
              Major Complications: {result.majorComplicationRatePercent}%
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              30-Day Mortality: {result.mortalityRatePercent}%
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
          {result.clinicalInterpretation}
        </p>
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
        scoreBadge={`SAS: ${result.totalScore}/10`}
        categoryLabel={`${result.riskCategory} (${result.majorComplicationRatePercent}% complications)`}
        noteText={clinicalNote}
        severityColor={result.totalScore <= 4 ? 'rose' : result.totalScore <= 6 ? 'amber' : 'emerald'}
      />
    </div>
  );
};
