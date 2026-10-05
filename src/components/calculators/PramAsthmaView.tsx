import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { RotateCcw, Wind } from 'lucide-react';
import { calculatePramScore } from '../../calculators/pediatrics';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface PramAsthmaViewProps {
  patientTag?: string;
}

export const PramAsthmaView: React.FC<PramAsthmaViewProps> = ({ patientTag }) => {
  const [suprasternal, setSuprasternal] = useState<0 | 2>(2);
  const [scalene, setScalene] = useState<0 | 2>(0);
  const [airEntry, setAirEntry] = useState<0 | 1 | 2 | 3>(1);
  const [wheezing, setWheezing] = useState<0 | 1 | 2 | 3>(2);
  const [spo2, setSpo2] = useState<0 | 1 | 2>(1);

  const result = useMemo(
    () =>
      calculatePramScore({
        suprasternalRetractions: suprasternal,
        scaleneMuscleContraction: scalene,
        airEntry,
        wheezing,
        o2SaturationPercent: spo2,
      }),
    [suprasternal, scalene, airEntry, wheezing, spo2]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}PEDIATRIC ASTHMA EXACERBATION PRAM SCORE:
- Total PRAM Score: ${result.totalScore}/12 (${result.severity})
  * Suprasternal retractions: ${suprasternal === 2 ? 'Present (+2)' : 'Absent (0)'}
  * Scalene muscle contraction: ${scalene === 2 ? 'Present (+2)' : 'Absent (0)'}
  * Air entry: ${airEntry === 0 ? 'Normal' : airEntry === 1 ? 'Decreased bases' : airEntry === 2 ? 'Widespread decrease' : 'Silent chest'} (+${airEntry})
  * Wheezing: ${wheezing === 0 ? 'None' : wheezing === 1 ? 'Expiratory only' : wheezing === 2 ? 'Inspiratory & Expiratory' : 'Audible / Silent'} (+${wheezing})
  * SpO2 on room air: ${spo2 === 0 ? '>= 95%' : spo2 === 1 ? '92-94%' : '< 92%'} (+${spo2})
- Stepped Acute Asthma Protocol: ${result.triageAndTreatment}`;
  }, [patientTag, result, suprasternal, scalene, airEntry, wheezing, spo2]);

  const resetDefaults = () => {
    setSuprasternal(2);
    setScalene(0);
    setAirEntry(1);
    setWheezing(2);
    setSpo2(1);
  };

  const references = [
    {
      source: 'Chalut DS, et al. (J Pediatr 2000)',
      title: 'The Pediatric Respiratory Assessment Measure (PRAM): A Valid Clinical Score for Assessing Acute Asthma Severity in Children',
      details: 'Objective 12-point clinical score demonstrating high inter-rater reliability and responsiveness to acute bronchodilator therapy.',
    },
    {
      source: 'Canadian Thoracic Society (CTS) / AAP Pediatric Asthma Guidelines',
      title: 'Diagnosis and Management of Asthma in Preschoolers, Children and Adults',
      details: 'PRAM 0-3 indicates mild exacerbation; 4-7 indicates moderate distress requiring oral steroids; 8-12 indicates severe distress requiring continuous SABA + IV access.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                PRAM Pediatric Asthma Severity Score
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300">
                CTS / AAP
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pediatric Respiratory Assessment Measure guiding ED triage & stepped bronchodilator / steroid therapy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="pram_asthma" showLabel />
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

      {/* 5 Clinical Variables */}
      <div className="space-y-4 mb-6">
        {/* Suprasternal retractions */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
            1. Suprasternal Retractions
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSuprasternal(0)}
              className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                suprasternal === 0 ? 'bg-cyan-700 text-white font-bold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Absent (0 pts)
            </button>
            <button
              type="button"
              onClick={() => setSuprasternal(2)}
              className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                suprasternal === 2 ? 'bg-cyan-700 text-white font-bold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Present (+2 pts)
            </button>
          </div>
        </div>

        {/* Scalene muscle */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
            2. Scalene Muscle Contraction
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setScalene(0)}
              className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                scalene === 0 ? 'bg-cyan-700 text-white font-bold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Absent (0 pts)
            </button>
            <button
              type="button"
              onClick={() => setScalene(2)}
              className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                scalene === 2 ? 'bg-cyan-700 text-white font-bold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Present (+2 pts)
            </button>
          </div>
        </div>

        {/* Air Entry */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
            3. Air Entry
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { val: 0, label: 'Normal (0)' },
              { val: 1, label: 'Decreased at bases (+1)' },
              { val: 2, label: 'Widespread decrease (+2)' },
              { val: 3, label: 'Minimal / Silent chest (+3)' },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setAirEntry(opt.val as typeof airEntry)}
                className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  airEntry === opt.val ? 'bg-cyan-700 text-white font-bold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wheezing */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
            4. Wheezing
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { val: 0, label: 'None (0)' },
              { val: 1, label: 'Expiratory only (+1)' },
              { val: 2, label: 'Insp & Expiratory (+2)' },
              { val: 3, label: 'Audible / Silent (+3)' },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setWheezing(opt.val as typeof wheezing)}
                className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  wheezing === opt.val ? 'bg-cyan-700 text-white font-bold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* O2 Saturation */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
            5. Oxygen Saturation (Room Air)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 0, label: '>= 95% (0 pts)' },
              { val: 1, label: '92 - 94% (+1 pt)' },
              { val: 2, label: '< 92% (+2 pts)' },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setSpo2(opt.val as typeof spo2)}
                className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                  spo2 === opt.val ? 'bg-cyan-700 text-white font-bold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Card */}
      <div className={`p-4 rounded-2xl border mb-6 ${
        result.totalScore >= 8
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
          : result.totalScore >= 4
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl font-black text-slate-900 dark:text-white">
            PRAM Score: {result.totalScore} / 12
          </span>
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 shadow-2xs">
            {result.severity}
          </span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
          {result.triageAndTreatment}
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
        scoreBadge={`PRAM: ${result.totalScore}/12`}
        categoryLabel={result.severity}
        noteText={clinicalNote}
        severityColor={result.totalScore >= 8 ? 'rose' : result.totalScore >= 4 ? 'amber' : 'emerald'}
      />
    </div>
  );
};
