import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Activity, RotateCcw } from 'lucide-react';
import { calculateCkdEpi2021, calculateCockcroftGault } from '../../calculators/internalMedicine';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import { useCalculatorPrefill } from '../../context/useCalculatorPrefill';
import { AiPrefillBanner } from '../ui/AiPrefillBanner';

interface CkdCrclViewProps {
  patientTag?: string;
}

export const CkdCrclView: React.FC<CkdCrclViewProps> = ({ patientTag }) => {
  const { prefill, clearPrefill, hasPrefill } = useCalculatorPrefill('ckd_crcl');
  const [age, setAge] = useState(prefill?.age ?? 65);
  const [sex, setSex] = useState<'female' | 'male'>(prefill?.sex ?? 'male');
  const [scrMgDl, setScrMgDl] = useState(prefill?.scrMgDl ?? 1.2);
  const [weightKg, setWeightKg] = useState(prefill?.weightKg ?? 70);
  const [heightCm, setHeightCm] = useState(prefill?.heightCm ?? 170);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const ckdResult = useMemo(
    () => calculateCkdEpi2021({ age, sex, scrMgDl }),
    [age, sex, scrMgDl]
  );

  const crclResult = useMemo(
    () => calculateCockcroftGault({ age, sex, weightKg, heightCm, scrMgDl }),
    [age, sex, weightKg, heightCm, scrMgDl]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}RENAL FUNCTION ASSESSMENT (Internal Medicine):
- Age: ${age} yo | Sex: ${sex} | Weight: ${weightKg} kg | Height: ${heightCm} cm
- Serum Creatinine: ${scrMgDl} mg/dL
- CKD-EPI 2021 Race-Free eGFR: ${ckdResult.egfr} mL/min/1.73m² (${ckdResult.stage}: ${ckdResult.stageDescription})
- Cockcroft-Gault CrCl (Actual Wt): ${crclResult.crClActual} mL/min
- Cockcroft-Gault CrCl (Recommended for Dosing): ${crclResult.recommendedCrCl} mL/min (${crclResult.recommendationExplanation})
- Clinical Plan: ${ckdResult.recommendation}`;
  }, [patientTag, age, sex, weightKg, heightCm, scrMgDl, ckdResult, crclResult]);

  const resetDefaults = () => {
    setAge(65);
    setSex('male');
    setScrMgDl(1.2);
    setWeightKg(70);
    setHeightCm(170);
    clearPrefill();
  };

  const references = [
    {
      source: 'Inker et al. (NEJM 2021)',
      title: 'New Creatinine- and Cystatin C-Based Equations to Estimate GFR without Race',
      details: 'Eliminates race coefficient to standardize kidney health equity without compromising diagnostic accuracy (KDIGO 2024 recommended).',
    },
    {
      source: 'Cockcroft & Gault (Nephron 1976) / FDA Guidance',
      title: 'Prediction of Creatinine Clearance from Serum Creatinine',
      details: 'Preferred pharmacokinetic equation for renal drug dosing guidelines and manufacturer package inserts.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                CKD-EPI 2021 eGFR & Cockcroft-Gault CrCl
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                KDIGO 2024
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Race-free chronic kidney disease staging & renal medication clearance calculator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="ckd_crcl" showLabel />
          <button
            type="button"
            onClick={resetDefaults}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            title="Reset inputs"
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

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Sex Selection */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Biological Sex
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSex('female')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                sex === 'female'
                  ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Female
            </button>
            <button
              type="button"
              onClick={() => setSex('male')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                sex === 'male'
                  ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Male
            </button>
          </div>
        </div>

        {/* Age */}
        <NumberStepper
          label="Patient Age"
          unit="years"
          value={age}
          min={18}
          max={110}
          step={1}
          onChange={setAge}
          helperText="Adult standard (>=18 yr)"
        />

        {/* Serum Creatinine */}
        <NumberStepper
          label="Serum Creatinine (SCr)"
          unit="mg/dL"
          value={scrMgDl}
          min={0.2}
          max={15.0}
          step={0.1}
          isFloat
          onChange={setScrMgDl}
          helperText="Standardized IDMS-traceable assay"
        />

        {/* Weight */}
        <NumberStepper
          label="Total Body Weight"
          unit="kg"
          value={weightKg}
          min={30}
          max={250}
          step={1}
          onChange={setWeightKg}
          helperText="For Cockcroft-Gault dosing"
        />

        {/* Height */}
        <NumberStepper
          label="Height"
          unit="cm"
          value={heightCm}
          min={120}
          max={230}
          step={1}
          onChange={setHeightCm}
          helperText="To calculate IBW & Adjusted Weight"
        />
      </div>

      {/* Results Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* eGFR Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/40 dark:from-blue-950/40 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              CKD-EPI 2021 Race-Free eGFR
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-black bg-blue-700 text-white">
              Stage {ckdResult.stage}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {ckdResult.egfr}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              mL/min / 1.73 m²
            </span>
          </div>
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">
            {ckdResult.stageDescription}
          </p>
          <div className="p-2.5 bg-white dark:bg-slate-900/60 rounded-xl border border-blue-100 dark:border-blue-900/60 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            {ckdResult.recommendation}
          </div>
        </div>

        {/* Cockcroft-Gault CrCl Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Cockcroft-Gault CrCl
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
              Drug Dosing Standard
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {crclResult.recommendedCrCl}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              mL/min (Recommended)
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-2">
            <div>Actual Weight CrCl: <span className="font-bold text-slate-800 dark:text-slate-200">{crclResult.crClActual} mL/min</span></div>
            {crclResult.crClIbw && (
              <div>Ideal Body Weight (IBW {crclResult.ibwKg} kg): <span className="font-bold text-slate-800 dark:text-slate-200">{crclResult.crClIbw} mL/min</span></div>
            )}
            {crclResult.crClAdjusted && (
              <div>Adjusted Weight CrCl: <span className="font-bold text-slate-800 dark:text-slate-200">{crclResult.crClAdjusted} mL/min</span></div>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            {crclResult.recommendationExplanation}
          </p>
        </div>
      </div>

      {/* EHR SOAP Note Box */}
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

      {/* References */}
      <ReferenceAccordion references={references} />

      {/* Mobile Sticky Action */}
      <StickyMobileAction
        scoreBadge={`eGFR: ${ckdResult.egfr}`}
        categoryLabel={`Stage ${ckdResult.stage} | CrCl ${crclResult.recommendedCrCl} mL/min`}
        noteText={clinicalNote}
        severityColor={ckdResult.egfr < 30 ? 'rose' : ckdResult.egfr < 60 ? 'amber' : 'teal'}
      />
    </div>
  );
};
