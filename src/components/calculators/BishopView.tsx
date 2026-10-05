import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Stethoscope, CheckCircle, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';
import { calculateBishopScore, BISHOP_OPTIONS, type BishopInput } from '../../calculators/bishop';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface BishopViewProps {
  patientTag?: string;
}

const DEFAULT_BISHOP: BishopInput = {
  dilation: 1, // 1-2 cm
  effacement: 1, // 40-50%
  station: 1, // -2
  consistency: 1, // medium
  position: 0, // posterior
};

export const BishopView: React.FC<BishopViewProps> = ({ patientTag }) => {
  const [input, setInput] = useState<BishopInput>(DEFAULT_BISHOP);

  const result = useMemo(() => calculateBishopScore(input), [input]);

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}${result.noteSnippet}`;
  }, [result, patientTag]);

  const resetDefaults = () => setInput(DEFAULT_BISHOP);

  const references = [
    {
      source: 'ACOG',
      title: 'Practice Bulletin No. 107: Induction of Labor (Reaffirmed 2021)',
      details: 'A Bishop score >= 8 indicates high likelihood of vaginal delivery similar to spontaneous labor. Ripening agents advised for score <= 6.',
    },
    {
      source: 'Laughon et al.',
      title: 'Using a Simplified Bishop Score to Predict Vaginal Delivery (Obstet Gynecol 2011)',
      details: 'Simplified Bishop score (dilation, effacement, station) >= 5 demonstrates similar predictive value to the traditional 5-component score.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400">
            <Stethoscope className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Bishop & Simplified Bishop Score
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pre-induction cervical status & likelihood of vaginal delivery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="bishop" showLabel />
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

      {/* Interactive Rapid Tapping Grid */}
      <div className="space-y-4 mb-6">
        {/* Dilation */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              1. Cervical Dilation
            </label>
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
              +{input.dilation} pts
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {BISHOP_OPTIONS.dilation.map((opt) => (
              <button
                key={opt.score}
                type="button"
                onClick={() => setInput({ ...input, dilation: opt.score })}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium border transition-all text-center ${
                  input.dilation === opt.score
                    ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div>{opt.label}</div>
                <div className={`text-[10px] mt-0.5 ${input.dilation === opt.score ? 'text-purple-200' : 'text-slate-400'}`}>
                  {opt.score} pt{opt.score !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Effacement */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              2. Cervical Effacement
            </label>
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
              +{input.effacement} pts
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {BISHOP_OPTIONS.effacement.map((opt) => (
              <button
                key={opt.score}
                type="button"
                onClick={() => setInput({ ...input, effacement: opt.score })}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium border transition-all text-center ${
                  input.effacement === opt.score
                    ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div>{opt.label}</div>
                <div className={`text-[10px] mt-0.5 ${input.effacement === opt.score ? 'text-purple-200' : 'text-slate-400'}`}>
                  {opt.score} pt{opt.score !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Station */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              3. Fetal Station
            </label>
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
              +{input.station} pts
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {BISHOP_OPTIONS.station.map((opt) => (
              <button
                key={opt.score}
                type="button"
                onClick={() => setInput({ ...input, station: opt.score })}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium border transition-all text-center ${
                  input.station === opt.score
                    ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div>{opt.label}</div>
                <div className={`text-[10px] mt-0.5 ${input.station === opt.score ? 'text-purple-200' : 'text-slate-400'}`}>
                  {opt.score} pt{opt.score !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Consistency & Position */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Consistency */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                4. Consistency
              </label>
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                +{input.consistency} pts
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {BISHOP_OPTIONS.consistency.map((opt) => (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => setInput({ ...input, consistency: opt.score })}
                  className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all text-center ${
                    input.consistency === opt.score
                      ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div>{opt.label}</div>
                  <div className={`text-[10px] mt-0.5 ${input.consistency === opt.score ? 'text-purple-200' : 'text-slate-400'}`}>
                    {opt.score} pt{opt.score !== 1 ? 's' : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Position */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                5. Position
              </label>
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                +{input.position} pts
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {BISHOP_OPTIONS.position.map((opt) => (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => setInput({ ...input, position: opt.score })}
                  className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all text-center ${
                    input.position === opt.score
                      ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div>{opt.label}</div>
                  <div className={`text-[10px] mt-0.5 ${input.position === opt.score ? 'text-purple-200' : 'text-slate-400'}`}>
                    {opt.score} pt{opt.score !== 1 ? 's' : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Display */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          result.classification === 'Favorable'
            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
            : result.classification === 'Intermediate'
              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100'
              : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-100'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
              Total Bishop Score
            </span>
            <div className="text-3xl font-extrabold flex items-baseline gap-2 mt-0.5">
              <span>{result.totalScore}</span>
              <span className="text-base font-medium opacity-60">/ 13</span>
              <span
                className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  result.classification === 'Favorable'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : result.classification === 'Intermediate'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-rose-600 text-white border-rose-600'
                }`}
              >
                {result.classification}
              </span>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs p-3 rounded-xl border border-black/5 dark:border-white/10 text-xs space-y-1">
            <div className="flex justify-between gap-4 font-semibold text-slate-800 dark:text-slate-200">
              <span>Simplified Bishop Score:</span>
              <span>{result.simplifiedScore} / 9</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {result.simplifiedScore >= 5 ? '>= 5 (Favorable for induction)' : '< 5 (Unripe)'}
            </div>
          </div>
        </div>

        <div className="mt-3.5 space-y-2">
          <div className="flex items-start gap-2 text-xs font-medium leading-relaxed">
            {result.classification === 'Favorable' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : result.classification === 'Intermediate' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <span>{result.interpretation}</span>
          </div>

          <div className="p-3 bg-white/70 dark:bg-slate-900/60 rounded-xl text-xs text-slate-800 dark:text-slate-200 leading-relaxed border border-black/5 dark:border-white/10">
            <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Recommended Clinical Plan:</span>
            {result.recommendation}
          </div>
        </div>
      </div>

      <ReferenceAccordion references={references} />

      {/* Sticky Mobile Bar for Phone */}
      <StickyMobileAction
        scoreBadge={`Bishop: ${result.totalScore}/13`}
        categoryLabel={result.classification}
        noteText={clinicalNote}
        severityColor={result.classification === 'Favorable' ? 'emerald' : result.classification === 'Intermediate' ? 'amber' : 'rose'}
      />
    </div>
  );
};
