import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { ShieldCheck, AlertCircle, Info, RotateCcw } from 'lucide-react';
import { calculateVbacSuccess, type VbacInput } from '../../calculators/vbac';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { NumberStepper } from '../ui/NumberStepper';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface VbacViewProps {
  patientTag?: string;
}

const DEFAULT_VBAC: VbacInput = {
  maternalAge: 31,
  bmi: 27.5,
  priorVaginalDelivery: false,
  priorVbac: false,
  priorCesareanIndication: 'non_recurring',
};

export const VbacView: React.FC<VbacViewProps> = ({ patientTag }) => {
  const [input, setInput] = useState<VbacInput>(DEFAULT_VBAC);

  const result = useMemo(() => calculateVbacSuccess(input), [input]);

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}${result.noteSnippet}`;
  }, [result, patientTag]);

  const resetDefaults = () => setInput(DEFAULT_VBAC);

  const references = [
    {
      source: 'SMFM & ACOG Endorsed',
      title: 'Grobman et al. Development of a Race-Neutral Model to Predict Vaginal Birth After Cesarean (Am J Obstet Gynecol 2021)',
      details: 'Updated MFMU predictive algorithm removing race/ethnicity variables while maintaining strong calibration for clinical counseling.',
    },
    {
      source: 'ACOG',
      title: 'Practice Bulletin No. 205: Vaginal Birth After Cesarean Delivery (Reaffirmed 2023)',
      details: 'Endorses TOLAC for candidates with one prior low-transverse cesarean. Prostaglandins for cervical ripening are contraindicated.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                VBAC / TOLAC Success Predictor
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300">
                2021 Race-Neutral MFMU
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evidence-based Grobman algorithm for trial of labor counseling
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="vbac" showLabel />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <NumberStepper
            label="Maternal Age"
            unit="years"
            value={input.maternalAge}
            onChange={(val) => setInput({ ...input, maternalAge: val })}
            min={15}
            max={55}
          />
        </div>

        <div>
          <NumberStepper
            label="Pre-Pregnancy BMI"
            unit="kg/m²"
            value={input.bmi}
            onChange={(val) => setInput({ ...input, bmi: val })}
            min={15}
            max={65}
            step={0.5}
            isFloat
          />
        </div>

        {/* Prior Deliveries Toggles */}
        <div className="sm:col-span-2 space-y-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Prior Vaginal Delivery (Any)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Had any successful vaginal delivery (before or after cesarean)
              </span>
            </div>
            <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setInput({ ...input, priorVaginalDelivery: false, priorVbac: false })}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  !input.priorVaginalDelivery
                    ? 'bg-slate-800 dark:bg-slate-700 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => setInput({ ...input, priorVaginalDelivery: true })}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  input.priorVaginalDelivery
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Yes
              </button>
            </div>
          </div>

          {input.priorVaginalDelivery && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Prior VBAC Specifically
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Delivered vaginally after a prior cesarean birth
                </span>
              </div>
              <div className="flex gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setInput({ ...input, priorVbac: false })}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    !input.priorVbac
                      ? 'bg-slate-800 dark:bg-slate-700 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setInput({ ...input, priorVbac: true })}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    input.priorVbac
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Indication for Prior Cesarean */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Indication for Prior Cesarean Delivery
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                id: 'non_recurring',
                label: 'Non-recurring Indication',
                sub: 'Breech, fetal distress, previa, elective',
              },
              {
                id: 'arrest_descent',
                label: 'Arrest of Descent',
                sub: 'Failed second stage (pushing)',
              },
              {
                id: 'arrest_dilation',
                label: 'Arrest of Dilation',
                sub: 'Failed active first stage labor',
              },
            ].map((ind) => (
              <button
                key={ind.id}
                type="button"
                onClick={() =>
                  setInput({ ...input, priorCesareanIndication: ind.id as VbacInput['priorCesareanIndication'] })
                }
                className={`p-3 rounded-xl border text-left transition-all ${
                  input.priorCesareanIndication === ind.id
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 text-blue-900 dark:text-blue-200 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{ind.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{ind.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Display */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Predicted Probability of Successful VBAC
            </span>
            <div className="text-4xl font-extrabold tracking-tight mt-1 flex items-baseline gap-2">
              <span>{result.predictedSuccessPercent}%</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  result.riskCategory === 'Favorable'
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/30'
                    : result.riskCategory === 'Moderate'
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-400/30'
                      : 'bg-rose-500/30 text-rose-300 border border-rose-400/30'
                }`}
              >
                {result.riskCategory}
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15 text-xs space-y-1 sm:max-w-xs">
            <div className="flex items-center gap-1.5 font-semibold text-blue-200">
              <Info className="w-3.5 h-3.5" />
              <span>Comparative Threshold</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              A predicted success rate of &gt;=60-70% is associated with maternal morbidity equal to or lower than planned repeat cesarean.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-xs leading-relaxed text-slate-200">
          <p className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-bold text-white block mb-0.5">Clinical Counseling:</span>
            {result.recommendation}
          </p>

          <div className="flex items-start gap-2 text-[11px] text-amber-200/90 pt-1">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Uterine Rupture Safety:</strong> {result.uterineRuptureRisk}
            </span>
          </div>
        </div>
      </div>

      <ReferenceAccordion references={references} />

      {/* Sticky Mobile Bar */}
      <StickyMobileAction
        scoreBadge={`VBAC: ${result.predictedSuccessPercent}%`}
        categoryLabel={result.riskCategory}
        noteText={clinicalNote}
        severityColor={result.riskCategory === 'Favorable' ? 'emerald' : result.riskCategory === 'Moderate' ? 'amber' : 'rose'}
      />
    </div>
  );
};
