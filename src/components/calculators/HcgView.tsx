import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { TrendingUp, RotateCcw } from 'lucide-react';
import { calculateHcgKinetics, type HcgInput } from '../../calculators/hcgKinetics';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { NumberStepper } from '../ui/NumberStepper';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface HcgViewProps {
  patientTag?: string;
}

export const HcgView: React.FC<HcgViewProps> = ({ patientTag }) => {
  const [initialHcg, setInitialHcg] = useState<number>(850);
  const [repeatHcg, setRepeatHcg] = useState<number>(1100);
  const [hoursBetween, setHoursBetween] = useState<number>(48);
  const [usFindings, setUsFindings] = useState<HcgInput['ultrasoundFindings']>('empty_uterus');

  const resetDefaults = () => {
    setInitialHcg(850);
    setRepeatHcg(1100);
    setHoursBetween(48);
    setUsFindings('empty_uterus');
  };

  const input: HcgInput = useMemo(
    () => ({
      initialHcg,
      repeatHcg,
      hoursBetween,
      ultrasoundFindings: usFindings,
    }),
    [initialHcg, repeatHcg, hoursBetween, usFindings]
  );

  const result = useMemo(() => calculateHcgKinetics(input), [input]);

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}${result.noteSnippet}`;
  }, [result, patientTag]);

  const references = [
    {
      source: 'ACOG',
      title: 'Practice Bulletin No. 193: Tubal Ectopic Pregnancy (Reaffirmed 2023)',
      details: 'Sets conservative discriminatory zone at 3,500 mIU/mL for transvaginal ultrasound before intervention to avoid interrupting wanted viable intrauterine pregnancies.',
    },
    {
      source: 'Barnhart et al.',
      title: 'Differences in Serum Human Chorionic Gonadotropin Rise in Normal and Abnormal Early Pregnancies (Obstet Gynecol)',
      details: 'Demonstrates modern lower bound 48-hour rise curve (35-49% depending on initial hCG baseline).',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Early Pregnancy & Serial hCG Kinetics
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300">
                ACOG PB 193
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              48-hour rise/fall trajectory, discriminatory zone & PUL risk stratification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="hcg" showLabel />
          <button
            type="button"
            onClick={resetDefaults}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1"
            title="Reset to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <CopyNoteButton textToCopy={clinicalNote} />
        </div>
      </div>

      {/* Input Parameters with Steppers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <NumberStepper
            label="Initial hCG (Time 0h)"
            unit="mIU/mL"
            value={initialHcg}
            onChange={setInitialHcg}
            min={1}
            max={300000}
            step={50}
          />
        </div>

        <div>
          <NumberStepper
            label="Repeat hCG"
            unit="mIU/mL"
            value={repeatHcg}
            onChange={setRepeatHcg}
            min={1}
            max={300000}
            step={50}
          />
        </div>

        <div>
          <NumberStepper
            label="Interval"
            unit="hours"
            value={hoursBetween}
            onChange={setHoursBetween}
            min={12}
            max={168}
            step={6}
            helperText="Standard 48 hours"
          />
        </div>

        {/* TVUS Findings */}
        <div className="sm:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Transvaginal Ultrasound (TVUS) Findings
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'empty_uterus', label: 'Empty Uterus' },
              { id: 'adnexal_mass', label: 'Adnexal Mass' },
              { id: 'gestational_sac_seen', label: 'Intrauterine Sac' },
              { id: 'no_ultrasound', label: 'No Scan Yet' },
            ].map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setUsFindings(u.id as HcgInput['ultrasoundFindings'])}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                  usFindings === u.id
                    ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Display */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Normalized 48-Hour hCG Trajectory
            </span>
            <div className="text-3xl font-black tracking-tight mt-1 flex items-baseline gap-2">
              <span className={result.percentChange48h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {result.percentChange48h >= 0 ? `+${result.percentChange48h}%` : `${result.percentChange48h}%`}
              </span>
              <span className="text-xs font-normal text-slate-300">
                {result.doublingTimeHours ? `(Doubling: ${result.doublingTimeHours}h)` : ''}
                {result.halfLifeHours ? `(Half-life: ${result.halfLifeHours}h)` : ''}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-1">{result.interpretation}</div>
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs border max-w-xs text-center ${
              result.category === 'Normal IUP Rise'
                ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400/30'
                : result.category.includes('Failing')
                  ? 'bg-amber-500/30 text-amber-300 border-amber-400/30'
                  : 'bg-rose-500/30 text-rose-300 border-rose-400/30 animate-pulse'
            }`}
          >
            {result.category}
          </div>
        </div>

        <div className="mt-4 space-y-2 text-xs leading-relaxed text-slate-200">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-white block mb-0.5">ACOG Recommendation:</span>
            {result.recommendedAction}
          </div>
          <div className="text-[11px] text-slate-400 px-1">{result.acogGuidance}</div>
        </div>
      </div>

      <ReferenceAccordion references={references} />

      {/* Sticky Mobile Bar */}
      <StickyMobileAction
        scoreBadge={`hCG: ${result.percentChange48h >= 0 ? `+${result.percentChange48h}%` : `${result.percentChange48h}%`}`}
        categoryLabel={result.category}
        noteText={clinicalNote}
        severityColor={result.category === 'Normal IUP Rise' ? 'emerald' : result.category.includes('Failing') ? 'amber' : 'rose'}
      />
    </div>
  );
};
