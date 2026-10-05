import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Target, CheckCircle2, AlertOctagon, RotateCcw } from 'lucide-react';
import { calculateRmi, ORADS_LEVELS, type RmiInput } from '../../calculators/ovarianMass';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { NumberStepper } from '../ui/NumberStepper';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface OvarianViewProps {
  patientTag?: string;
}

export const OvarianView: React.FC<OvarianViewProps> = ({ patientTag }) => {
  const [activeTab, setActiveTab] = useState<'rmi' | 'orads'>('rmi');

  // RMI inputs
  const [ca125, setCa125] = useState<number>(85);
  const [isPostmenopausal, setIsPostmenopausal] = useState<boolean>(true);
  const [multilocular, setMultilocular] = useState<boolean>(true);
  const [solidAreas, setSolidAreas] = useState<boolean>(true);
  const [bilateral, setBilateral] = useState<boolean>(false);
  const [ascites, setAscites] = useState<boolean>(false);
  const [metastases, setMetastases] = useState<boolean>(false);

  const resetDefaults = () => {
    setCa125(85);
    setIsPostmenopausal(true);
    setMultilocular(true);
    setSolidAreas(true);
    setBilateral(false);
    setAscites(false);
    setMetastases(false);
  };

  const input: RmiInput = useMemo(
    () => ({
      ca125Units: ca125,
      isPostmenopausal,
      hasMultilocularCyst: multilocular,
      hasSolidAreas: solidAreas,
      hasBilateralLesions: bilateral,
      hasAscites: ascites,
      hasIntraAbdominalMetastases: metastases,
    }),
    [ca125, isPostmenopausal, multilocular, solidAreas, bilateral, ascites, metastases]
  );

  const result = useMemo(() => calculateRmi(input), [input]);

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}${result.noteSnippet}`;
  }, [result, patientTag]);

  const references = [
    {
      source: 'RCOG & NICE Guidelines',
      title: 'Green-top Guideline No. 34: Management of Suspected Ovarian Masses in Premenopausal & Postmenopausal Women',
      details: 'Endorses RMI score with 200 cutoff to triage patients who require surgical referral to a Gynecologic Oncology multidisciplinary center.',
    },
    {
      source: 'American College of Radiology (ACR)',
      title: 'O-RADS Ultrasound Risk Stratification and Management System',
      details: 'Standardized classification system from O-RADS 1 (<1%) through O-RADS 5 (>=50% malignancy risk).',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400">
            <Target className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Ovarian Mass: RMI & O-RADS
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300">
                RCOG / ACR Guidelines
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Risk of Malignancy Index (RMI I) & O-RADS ultrasound classification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="ovarian" showLabel />
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

      {/* Tabs */}
      <div className="grid grid-cols-2 border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl mb-5 gap-1.5 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('rmi')}
          className={`py-2 px-2 text-center text-xs font-bold rounded-xl transition-all ${
            activeTab === 'rmi'
              ? 'bg-white dark:bg-slate-800 text-violet-900 dark:text-violet-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          RMI I (U × M × CA-125)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('orads')}
          className={`py-2 px-2 text-center text-xs font-bold rounded-xl transition-all ${
            activeTab === 'orads'
              ? 'bg-white dark:bg-slate-800 text-violet-900 dark:text-violet-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          O-RADS Risk Categories
        </button>
      </div>

      {activeTab === 'rmi' && (
        <div className="space-y-4 mb-6">
          {/* Biomarker and Menopause */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <NumberStepper
                label="Serum CA-125"
                unit="U/mL"
                value={ca125}
                onChange={setCa125}
                min={1}
                max={5000}
                step={5}
                helperText="Normal reference < 35 U/mL"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Menopausal Status
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPostmenopausal(false)}
                  className={`py-2.5 text-xs font-bold rounded-lg border transition-all ${
                    !isPostmenopausal
                      ? 'bg-violet-700 text-white border-violet-700 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>Premenopausal</div>
                  <div className="text-[10px] opacity-80 mt-0.5">M = 1</div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPostmenopausal(true)}
                  className={`py-2.5 text-xs font-bold rounded-lg border transition-all ${
                    isPostmenopausal
                      ? 'bg-violet-700 text-white border-violet-700 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>Postmenopausal</div>
                  <div className="text-[10px] opacity-80 mt-0.5">M = 3</div>
                </button>
              </div>
            </div>
          </div>

          {/* Ultrasound Features */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Ultrasound Features (Select all that apply)
              </span>
              <span className="text-xs font-bold text-violet-700 dark:text-violet-400">
                Score U = {result.ultrasoundScoreU} ({result.featureCount} features)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'multi', label: 'Multilocular cyst', val: multilocular, set: setMultilocular },
                { id: 'solid', label: 'Solid components / areas', val: solidAreas, set: setSolidAreas },
                { id: 'bi', label: 'Bilateral lesions', val: bilateral, set: setBilateral },
                { id: 'asc', label: 'Ascites present', val: ascites, set: setAscites },
                { id: 'met', label: 'Intra-abdominal metastases', val: metastases, set: setMetastases },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.val}
                    onChange={(e) => item.set(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 border-slate-300 dark:border-slate-600"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              Scoring: 0 features = U(0); 1 feature = U(1); 2-5 features = U(3)
            </div>
          </div>

          {/* RMI Score Result Banner */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              result.riskCategory.includes('High Risk')
                ? 'bg-rose-900 text-white border-rose-950'
                : 'bg-slate-900 text-white border-slate-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
                  Risk of Malignancy Index (RMI I)
                </span>
                <div className="text-3xl font-black tracking-tight mt-1 flex items-baseline gap-2">
                  <span>{result.rmiScore}</span>
                  <span className="text-xs font-medium text-violet-200">
                    (U:{result.ultrasoundScoreU} × M:{result.menopausalScoreM} × CA-125:{ca125})
                  </span>
                </div>
              </div>

              <div
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs border ${
                  result.riskCategory.includes('High Risk')
                    ? 'bg-rose-500/30 text-rose-200 border-rose-400/40'
                    : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40'
                }`}
              >
                {result.riskCategory}
              </div>
            </div>

            <div className="mt-3.5 space-y-2 text-xs leading-relaxed text-slate-200">
              <div className="flex items-start gap-2">
                {result.riskCategory.includes('High Risk') ? (
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <span>{result.sensitivitySpecificity}</span>
              </div>
              <p className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-100">
                <span className="font-bold text-white block mb-0.5">Clinical Protocol:</span>
                {result.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orads' && (
        <div className="space-y-3 mb-6">
          {ORADS_LEVELS.map((o, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-violet-900 dark:text-violet-300">{o.level}: {o.category}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    o.level === 'O-RADS 5'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      : o.level === 'O-RADS 4'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  Malignancy: {o.malignancyRisk}
                </span>
              </div>
              <p className="mt-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-800 dark:text-white">Management: </span>
                {o.management}
              </p>
            </div>
          ))}
        </div>
      )}

      <ReferenceAccordion references={references} />

      {/* Sticky Mobile Bar */}
      <StickyMobileAction
        scoreBadge={`RMI: ${result.rmiScore}`}
        categoryLabel={result.riskCategory}
        noteText={clinicalNote}
        severityColor={result.riskCategory.includes('High Risk') ? 'rose' : 'teal'}
      />
    </div>
  );
};
