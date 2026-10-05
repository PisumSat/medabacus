import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { HeartPulse, CheckCircle2, AlertTriangle, Flame, RotateCcw } from 'lucide-react';
import { calculateApgar, APGAR_OPTIONS, type ApgarTimePoint } from '../../calculators/apgar';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface ApgarViewProps {
  patientTag?: string;
}

const DEFAULT_ONE_MIN: ApgarTimePoint = {
  appearance: 1, // acrocyanosis
  pulse: 2, // >= 100
  grimace: 2, // vigorous cry
  activity: 2, // active motion
  respiration: 2, // strong cry
};

const DEFAULT_FIVE_MIN: ApgarTimePoint = {
  appearance: 2, // completely pink
  pulse: 2,
  grimace: 2,
  activity: 2,
  respiration: 2,
};

const DEFAULT_TEN_MIN: ApgarTimePoint = {
  appearance: 2,
  pulse: 2,
  grimace: 2,
  activity: 2,
  respiration: 2,
};

export const ApgarView: React.FC<ApgarViewProps> = ({ patientTag }) => {
  const [activeInterval, setActiveInterval] = useState<'1min' | '5min' | '10min'>('1min');

  const [oneMin, setOneMin] = useState<ApgarTimePoint>(DEFAULT_ONE_MIN);
  const [fiveMin, setFiveMin] = useState<ApgarTimePoint>(DEFAULT_FIVE_MIN);
  const [tenMin, setTenMin] = useState<ApgarTimePoint>(DEFAULT_TEN_MIN);
  const [hasTenMin, setHasTenMin] = useState(false);

  const resetDefaults = () => {
    setOneMin(DEFAULT_ONE_MIN);
    setFiveMin(DEFAULT_FIVE_MIN);
    setTenMin(DEFAULT_TEN_MIN);
    setHasTenMin(false);
    setActiveInterval('1min');
  };

  const result = useMemo(
    () => calculateApgar(oneMin, fiveMin, hasTenMin ? tenMin : undefined),
    [oneMin, fiveMin, tenMin, hasTenMin]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}${result.noteSnippet}`;
  }, [result, patientTag]);

  const activeState = activeInterval === '1min' ? oneMin : activeInterval === '5min' ? fiveMin : tenMin;
  const setActiveState =
    activeInterval === '1min' ? setOneMin : activeInterval === '5min' ? setFiveMin : setTenMin;

  const references = [
    {
      source: 'AAP & ACOG',
      title: 'Committee Opinion No. 644: The Apgar Score (Reaffirmed 2020)',
      details: 'Describes standardized evaluation of physiological transition. Scores < 7 at 5 minutes warrant continued evaluation at 5-minute intervals up to 20 minutes.',
    },
    {
      source: 'AHA / AAP',
      title: 'Neonatal Resuscitation Program (NRP) 8th Edition Guidelines',
      details: 'Directs positive pressure ventilation (PPV) and chest compressions based on heart rate and respiratory effort independent of the 1-minute score.',
    },
  ];

  const primaryStatus = result.status5Min || result.status1Min;
  const effectiveScore = result.score5Min ?? result.score1Min;

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
            <HeartPulse className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Apgar & Neonatal Resuscitation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standardized 1-min, 5-min, and 10-min newborn transition scores
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarButton toolId="apgar" showLabel />
          <button
            type="button"
            onClick={resetDefaults}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Reset to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <CopyNoteButton textToCopy={clinicalNote} />
        </div>
      </div>

      {/* Interval Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/60 rounded-xl mb-5">
        <div className={`grid ${hasTenMin ? 'grid-cols-3' : 'grid-cols-2'} sm:flex gap-1.5 sm:gap-1 w-full sm:w-auto`}>
          <button
            type="button"
            onClick={() => setActiveInterval('1min')}
            className={`py-2 px-2.5 text-center text-xs font-bold rounded-lg transition-all ${
              activeInterval === '1min'
                ? 'bg-white dark:bg-slate-800 text-rose-900 dark:text-rose-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            1-Min ({result.score1Min}/10)
          </button>
          <button
            type="button"
            onClick={() => setActiveInterval('5min')}
            className={`py-2 px-2.5 text-center text-xs font-bold rounded-lg transition-all ${
              activeInterval === '5min'
                ? 'bg-white dark:bg-slate-800 text-rose-900 dark:text-rose-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            5-Min ({result.score5Min ?? 10}/10)
          </button>
          {hasTenMin && (
            <button
              type="button"
              onClick={() => setActiveInterval('10min')}
              className={`py-2 px-2.5 text-center text-xs font-bold rounded-lg transition-all ${
                activeInterval === '10min'
                  ? 'bg-white dark:bg-slate-800 text-rose-900 dark:text-rose-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              10-Min ({result.score10Min ?? 10}/10)
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setHasTenMin(!hasTenMin)}
          className={`self-end sm:self-auto text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
            hasTenMin
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          {hasTenMin ? 'Remove 10-min' : '+ Add 10-min score'}
        </button>
      </div>

      {/* 5 Apgar Components for Active Interval */}
      <div className="space-y-3.5 mb-6">
        {/* Appearance */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              A - Appearance (Color)
            </span>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">+{activeState.appearance}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {APGAR_OPTIONS.appearance.map((opt) => (
              <button
                key={opt.score}
                type="button"
                onClick={() => setActiveState({ ...activeState, appearance: opt.score })}
                className={`p-2 rounded-xl text-xs text-center border transition-all ${
                  activeState.appearance === opt.score
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs font-semibold'
                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div>{opt.label}</div>
                <div className={`text-[10px] mt-0.5 ${activeState.appearance === opt.score ? 'text-rose-200' : 'text-slate-400 dark:text-slate-500'}`}>
                  {opt.score} pt{opt.score !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pulse */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              P - Pulse (Heart Rate)
            </span>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">+{activeState.pulse}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {APGAR_OPTIONS.pulse.map((opt) => (
              <button
                key={opt.score}
                type="button"
                onClick={() => setActiveState({ ...activeState, pulse: opt.score })}
                className={`p-2 rounded-xl text-xs text-center border transition-all ${
                  activeState.pulse === opt.score
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs font-semibold'
                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div>{opt.label}</div>
                <div className={`text-[10px] mt-0.5 ${activeState.pulse === opt.score ? 'text-rose-200' : 'text-slate-400 dark:text-slate-500'}`}>
                  {opt.score} pt{opt.score !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Grimace */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              G - Grimace (Reflex Irritability)
            </span>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">+{activeState.grimace}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {APGAR_OPTIONS.grimace.map((opt) => (
              <button
                key={opt.score}
                type="button"
                onClick={() => setActiveState({ ...activeState, grimace: opt.score })}
                className={`p-2 rounded-xl text-xs text-center border transition-all ${
                  activeState.grimace === opt.score
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs font-semibold'
                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div>{opt.label}</div>
                <div className={`text-[10px] mt-0.5 ${activeState.grimace === opt.score ? 'text-rose-200' : 'text-slate-400 dark:text-slate-500'}`}>
                  {opt.score} pt{opt.score !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              A - Activity (Muscle Tone)
            </span>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">+{activeState.activity}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {APGAR_OPTIONS.activity.map((opt) => (
              <button
                key={opt.score}
                type="button"
                onClick={() => setActiveState({ ...activeState, activity: opt.score })}
                className={`p-2 rounded-xl text-xs text-center border transition-all ${
                  activeState.activity === opt.score
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs font-semibold'
                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div>{opt.label}</div>
                <div className={`text-[10px] mt-0.5 ${activeState.activity === opt.score ? 'text-rose-200' : 'text-slate-400 dark:text-slate-500'}`}>
                  {opt.score} pt{opt.score !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Respiration */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              R - Respiration (Respiratory Effort)
            </span>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400">+{activeState.respiration}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {APGAR_OPTIONS.respiration.map((opt) => (
              <button
                key={opt.score}
                type="button"
                onClick={() => setActiveState({ ...activeState, respiration: opt.score })}
                className={`p-2 rounded-xl text-xs text-center border transition-all ${
                  activeState.respiration === opt.score
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs font-semibold'
                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div>{opt.label}</div>
                <div className={`text-[10px] mt-0.5 ${activeState.respiration === opt.score ? 'text-rose-200' : 'text-slate-400 dark:text-slate-500'}`}>
                  {opt.score} pt{opt.score !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Score Card */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-4 border-b border-white/10">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">1-Minute Score</span>
            <div className="text-2xl font-black mt-0.5 flex items-baseline gap-1">
              <span>{result.score1Min}</span>
              <span className="text-xs text-slate-400">/ 10</span>
            </div>
            <span className="text-[10px] font-semibold text-rose-300">{result.status1Min}</span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">5-Minute Score</span>
            <div className="text-2xl font-black mt-0.5 flex items-baseline gap-1">
              <span>{result.score5Min ?? '—'}</span>
              <span className="text-xs text-slate-400">/ 10</span>
            </div>
            <span className="text-[10px] font-semibold text-rose-300">{result.status5Min ?? '—'}</span>
          </div>

          {hasTenMin && (
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400">10-Minute Score</span>
              <div className="text-2xl font-black mt-0.5 flex items-baseline gap-1">
                <span>{result.score10Min ?? '—'}</span>
                <span className="text-xs text-slate-400">/ 10</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3.5 space-y-2 text-xs leading-relaxed">
          <div className="flex items-start gap-2 text-slate-200">
            {result.score5Min && result.score5Min >= 7 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : result.score5Min && result.score5Min >= 4 ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Flame className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span>{result.clinicalGuidance}</span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-100">
            <span className="font-bold text-white block mb-0.5">NRP Resuscitation Guideline:</span>
            {result.nrpIntervention}
          </div>
        </div>
      </div>

      <ReferenceAccordion references={references} />

      {/* Sticky Mobile Action for Phone */}
      <StickyMobileAction
        scoreBadge={`Apgar: ${result.score1Min} (1m) / ${result.score5Min ?? '—'} (5m)`}
        categoryLabel={primaryStatus}
        noteText={clinicalNote}
        severityColor={effectiveScore >= 7 ? 'emerald' : effectiveScore >= 4 ? 'amber' : 'rose'}
      />
    </div>
  );
};
