import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { FlaskConical, RotateCcw } from 'lucide-react';
import { calculateElectrolytes } from '../../calculators/internalMedicine';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import { useCalculatorPrefill } from '../../context/useCalculatorPrefill';
import { AiPrefillBanner } from '../ui/AiPrefillBanner';

interface ElectrolytesViewProps {
  patientTag?: string;
}

export const ElectrolytesView: React.FC<ElectrolytesViewProps> = ({ patientTag }) => {
  const { prefill, clearPrefill, hasPrefill } = useCalculatorPrefill('electrolytes');
  const [na, setNa] = useState(prefill?.na ?? 130);
  const [glucose, setGlucose] = useState(prefill?.glucose ?? 550);
  const [bun, setBun] = useState(prefill?.bun ?? 28);
  const [k, setK] = useState(prefill?.k ?? 4.2);
  const [cl, setCl] = useState(prefill?.cl ?? 94);
  const [hco3, setHco3] = useState(prefill?.hco3 ?? 12);
  const [albumin, setAlbumin] = useState(prefill?.albumin ?? 4.0);
  const [measuredOsm, setMeasuredOsm] = useState(prefill?.measuredOsm ?? 0);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const result = useMemo(
    () =>
      calculateElectrolytes({
        measuredNaMeqL: na,
        glucoseMgDl: glucose,
        bunMgDl: bun,
        measuredK: k,
        clMeqL: cl,
        hco3MeqL: hco3,
        measuredAlbuminGDl: albumin,
        measuredOsmolality: measuredOsm > 0 ? measuredOsm : undefined,
      }),
    [na, glucose, bun, k, cl, hco3, albumin, measuredOsm]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}ELECTROLYTE & ACID-BASE ASSESSMENT:
- Basic Labs: Na ${na} | K ${k} | Cl ${cl} | HCO3 ${hco3} mEq/L | BUN ${bun} | Glucose ${glucose} mg/dL | Albumin ${albumin} g/dL
- Corrected Sodium (Hyperglycemia):
  * Katz Factor (1.6): ${result.correctedNaKatz} mEq/L
  * Hillier Factor (2.4): ${result.correctedNaHillier} mEq/L
- Calculated Serum Osmolality: ${result.calculatedOsmolality} mOsm/kg${result.osmolarGap !== undefined ? ` (Measured: ${measuredOsm}, Osmolar Gap: ${result.osmolarGap} mOsm/kg)` : ''}
- Serum Anion Gap: ${result.anionGap} mEq/L | Albumin-Corrected AG: ${result.albuminCorrectedAnionGap ?? result.anionGap} mEq/L
${result.deltaDeltaRatio !== undefined ? `- Delta-Delta Ratio: ${result.deltaDeltaRatio} (${result.deltaInterpretation})` : ''}
- Acid-Base Interpretation: ${result.acidBaseCommentary}`;
  }, [patientTag, na, k, cl, hco3, bun, glucose, albumin, measuredOsm, result]);

  const resetDefaults = () => {
    setNa(130);
    setGlucose(550);
    setBun(28);
    setK(4.2);
    setCl(94);
    setHco3(12);
    setAlbumin(4.0);
    setMeasuredOsm(0);
    clearPrefill();
  };

  const references = [
    {
      source: 'Katz MA (N Engl J Med 1973) & Hillier et al. (Am J Med 1999)',
      title: 'Hyperglycemia-Induced Hyponatremia: Calculation of Expected Serum Sodium',
      details: 'Evaluates osmotic fluid shift out of cells into vascular space. Hillier 2.4 factor is more physiologically accurate for glucose > 400 mg/dL.',
    },
    {
      source: 'Kraut JA, Madias NE (Clin J Am Soc Nephrol 2007)',
      title: 'Serum Anion Gap: Its Uses and Limitations in Clinical Medicine',
      details: 'Corrects anion gap for hypoalbuminemia (for every 1 g/dL decrease in albumin, AG decreases by 2.5 mEq/L).',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Electrolytes & Acid-Base Suite
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                Internal Medicine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Corrected sodium, serum osmolality, osmolar gap, albumin-corrected anion gap & delta-delta ratio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="electrolytes" showLabel />
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

      {/* Lab Input Steppers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <NumberStepper
          label="Measured Na⁺"
          unit="mEq/L"
          value={na}
          min={90}
          max={190}
          step={1}
          onChange={setNa}
        />
        <NumberStepper
          label="Serum Glucose"
          unit="mg/dL"
          value={glucose}
          min={30}
          max={2500}
          step={10}
          onChange={setGlucose}
        />
        <NumberStepper
          label="Chloride (Cl⁻)"
          unit="mEq/L"
          value={cl}
          min={50}
          max={150}
          step={1}
          onChange={setCl}
        />
        <NumberStepper
          label="Bicarbonate (HCO₃⁻)"
          unit="mEq/L"
          value={hco3}
          min={2}
          max={60}
          step={1}
          onChange={setHco3}
        />
        <NumberStepper
          label="BUN"
          unit="mg/dL"
          value={bun}
          min={1}
          max={250}
          step={1}
          onChange={setBun}
        />
        <NumberStepper
          label="Serum Potassium (K⁺)"
          unit="mEq/L"
          value={k}
          min={1.5}
          max={9.0}
          step={0.1}
          isFloat
          onChange={setK}
        />
        <NumberStepper
          label="Albumin"
          unit="g/dL"
          value={albumin}
          min={1.0}
          max={6.0}
          step={0.1}
          isFloat
          onChange={setAlbumin}
          helperText="Normal 4.0 g/dL"
        />
        <NumberStepper
          label="Measured Osmolality"
          unit="mOsm/kg"
          value={measuredOsm}
          min={0}
          max={500}
          step={1}
          onChange={setMeasuredOsm}
          helperText="Optional (for Osm Gap)"
        />
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Corrected Sodium Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Corrected Sodium in Hyperglycemia
          </span>
          <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between items-baseline py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="font-semibold">Hillier Factor (2.4):</span>
              <span className="text-base font-black text-teal-700 dark:text-teal-400">{result.correctedNaHillier} mEq/L</span>
            </div>
            <div className="flex justify-between items-baseline py-1">
              <span>Katz Factor (1.6):</span>
              <span className="font-bold">{result.correctedNaKatz} mEq/L</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
            Hillier recommended for acute hyperglycemia &gt; 400 mg/dL.
          </p>
        </div>

        {/* Serum Osmolality & Gap Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Serum Osmolality & Osmolar Gap
          </span>
          <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between items-baseline py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="font-semibold">Calculated Osmolality:</span>
              <span className="text-base font-black text-slate-900 dark:text-white">{result.calculatedOsmolality} mOsm/kg</span>
            </div>
            {result.osmolarGap !== undefined && (
              <div className="flex justify-between items-baseline py-1">
                <span className="font-semibold">Osmolar Gap:</span>
                <span className={`font-black ${result.osmolarGap > 10 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {result.osmolarGap} mOsm/kg
                </span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
            Gap &gt; 10 mOsm/kg suggests toxic alcohols (methanol, ethylene glycol, isopropanol).
          </p>
        </div>

        {/* Anion Gap & Delta-Delta Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Anion Gap & Delta-Delta Ratio
          </span>
          <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between items-baseline py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="font-semibold">Albumin-Corrected AG:</span>
              <span className="text-base font-black text-rose-700 dark:text-rose-400">
                {result.albuminCorrectedAnionGap ?? result.anionGap} mEq/L
              </span>
            </div>
            <div className="flex justify-between items-baseline py-1">
              <span>Standard Anion Gap:</span>
              <span className="font-bold">{result.anionGap} mEq/L</span>
            </div>
            {result.deltaDeltaRatio !== undefined && (
              <div className="flex justify-between items-baseline py-1">
                <span className="font-semibold">Delta Ratio:</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">{result.deltaDeltaRatio}</span>
              </div>
            )}
          </div>
          {result.deltaInterpretation && (
            <p className="text-[10px] font-medium text-amber-800 dark:text-amber-300 mt-2">
              {result.deltaInterpretation}
            </p>
          )}
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
        scoreBadge={`Corrected Na: ${result.correctedNaHillier}`}
        categoryLabel={`AG: ${result.albuminCorrectedAnionGap ?? result.anionGap} mEq/L`}
        noteText={clinicalNote}
        severityColor={(result.albuminCorrectedAnionGap ?? result.anionGap ?? 0) > 16 ? 'rose' : 'teal'}
      />
    </div>
  );
};
