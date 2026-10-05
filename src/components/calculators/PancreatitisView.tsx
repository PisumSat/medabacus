import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { calculateGlasgowPancreatitis } from '../../calculators/surgery';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface PancreatitisViewProps {
  patientTag?: string;
}

export const PancreatitisView: React.FC<PancreatitisViewProps> = ({ patientTag }) => {
  const [pao2, setPao2] = useState(false);
  const [age, setAge] = useState(true);
  const [wbc, setWbc] = useState(true);
  const [calcium, setCalcium] = useState(false);
  const [urea, setUrea] = useState(true);
  const [ldh, setLdh] = useState(false);
  const [albumin, setAlbumin] = useState(false);
  const [glucose, setGlucose] = useState(false);

  const result = useMemo(
    () =>
      calculateGlasgowPancreatitis({
        pao2Under60MmHg: pao2,
        ageOver55Years: age,
        wbcOver15x10_9L: wbc,
        calciumUnder2MmolLOr8MgDl: calcium,
        ureaOver16MmolLOrBunOver45: urea,
        ldhOver600UnitsL: ldh,
        albuminUnder32GLOr3_2GDl: albumin,
        glucoseOver10MmolLOr180MgDl: glucose,
      }),
    [pao2, age, wbc, calcium, urea, ldh, albumin, glucose]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}ACUTE PANCREATITIS GLASGOW-IMRIE CRITERIA (First 48h):
- Total Score: ${result.score}/8 (${result.severity} | Predicted Mortality: ${result.predictedMortalityPercent})
  * PaO2 < 60 mmHg (8 kPa): ${pao2 ? 'Yes (+1)' : 'No'}
  * Age > 55 years: ${age ? 'Yes (+1)' : 'No'}
  * Neutrophils / WBC > 15 x 10^9/L: ${wbc ? 'Yes (+1)' : 'No'}
  * Calcium < 2.0 mmol/L (8.0 mg/dL): ${calcium ? 'Yes (+1)' : 'No'}
  * Urea > 16 mmol/L (BUN > 45 mg/dL): ${urea ? 'Yes (+1)' : 'No'}
  * LDH > 600 U/L: ${ldh ? 'Yes (+1)' : 'No'}
  * Albumin < 32 g/L (3.2 g/dL): ${albumin ? 'Yes (+1)' : 'No'}
  * Glucose > 10 mmol/L (180 mg/dL): ${glucose ? 'Yes (+1)' : 'No'}
- Surgical / Critical Care Plan: ${result.recommendation}`;
  }, [patientTag, result, pao2, age, wbc, calcium, urea, ldh, albumin, glucose]);

  const resetDefaults = () => {
    setPao2(false);
    setAge(true);
    setWbc(true);
    setCalcium(false);
    setUrea(true);
    setLdh(false);
    setAlbumin(false);
    setGlucose(false);
  };

  const references = [
    {
      source: 'Blamey SL, et al. (Gut 1984)',
      title: 'Prognostic Factors in Acute Pancreatitis (The Glasgow Criteria)',
      details: 'Score >= 3 points assessed within 48 hours of admission identifies severe acute pancreatitis with high sensitivity and specificity.',
    },
    {
      source: 'British Society of Gastroenterology (BSG) Guidelines (Gut 2005 / 2023)',
      title: 'UK Guidelines for the Management of Acute Pancreatitis',
      details: 'Patients with predicted severe pancreatitis should be managed in high-dependency or intensive care units with goal-directed fluid resuscitation.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Glasgow-Imrie Pancreatitis Criteria
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-300">
                BSG Guidelines
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              PANCREAS mnemonic assessing severe acute pancreatitis within the first 48 hours of onset
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="pancreatitis" showLabel />
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

      {/* PANCREAS Checklist */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            PANCREAS Mnemonic Criteria (First 48 Hours)
          </span>
          <span className="text-xs font-extrabold text-yellow-700 dark:text-yellow-400">
            Score: {result.score} of 8
          </span>
        </div>

        {[
          { letter: 'P', title: 'PaO2 < 60 mmHg (8 kPa)', subtitle: 'Arterial hypoxemia on room air / acute lung injury', state: pao2, set: setPao2 },
          { letter: 'A', title: 'Age > 55 years', subtitle: 'Advanced age physiological vulnerability', state: age, set: setAge },
          { letter: 'N', title: 'Neutrophils / WBC > 15 x 10⁹/L', subtitle: 'Marked systemic inflammatory response syndrome (SIRS)', state: wbc, set: setWbc },
          { letter: 'C', title: 'Calcium < 2.0 mmol/L (8.0 mg/dL)', subtitle: 'Hypocalcemia from retroperitoneal saponification', state: calcium, set: setCalcium },
          { letter: 'R', title: 'Renal / Urea > 16 mmol/L (BUN > 45 mg/dL)', subtitle: 'Azotemia / acute kidney injury unresponsive to hydration', state: urea, set: setUrea },
          { letter: 'E', title: 'Enzymes / LDH > 600 units/L', subtitle: 'Elevated tissue necrosis marker', state: ldh, set: setLdh },
          { letter: 'A', title: 'Albumin < 32 g/L (3.2 g/dL)', subtitle: 'Capillary leak and third-space fluid sequestration', state: albumin, set: setAlbumin },
          { letter: 'S', title: 'Sugar / Glucose > 10 mmol/L (180 mg/dL)', subtitle: 'Pancreatic endocrine disruption / stress hyperglycemia', state: glucose, set: setGlucose },
        ].map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => item.set(!item.state)}
            className={`w-full p-2.5 rounded-xl text-left border flex items-center justify-between text-xs transition-all ${
              item.state
                ? 'bg-yellow-50 dark:bg-yellow-950/60 border-yellow-400 text-yellow-950 dark:text-yellow-200 font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-[11px] ${
                item.state ? 'bg-yellow-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
              }`}>
                {item.letter}
              </span>
              <div>
                <span className="font-bold">{item.title}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">{item.subtitle}</span>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              item.state ? 'bg-yellow-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
            }`}>
              {item.state ? '+1 pt' : '0'}
            </span>
          </button>
        ))}
      </div>

      {/* Result Card */}
      <div className={`p-4 rounded-2xl border mb-6 ${
        result.score >= 3
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              Glasgow Score: {result.score} / 8
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              ({result.severity})
            </span>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 shadow-2xs">
            Mortality: {result.predictedMortalityPercent}
          </span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
          {result.recommendation}
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
        scoreBadge={`Glasgow: ${result.score}/8`}
        categoryLabel={`${result.severity} (${result.predictedMortalityPercent} mortality)`}
        noteText={clinicalNote}
        severityColor={result.score >= 3 ? 'rose' : 'emerald'}
      />
    </div>
  );
};
