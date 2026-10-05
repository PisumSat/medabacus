import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Pill, RotateCcw } from 'lucide-react';
import { calculatePediatricDrugDosing, type PediatricDrugDosingInput } from '../../calculators/pediatrics';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface PediatricDosingViewProps {
  patientTag?: string;
}

export const PediatricDosingView: React.FC<PediatricDosingViewProps> = ({ patientTag }) => {
  const [weightKg, setWeightKg] = useState(15);
  const [selectedMed, setSelectedMed] = useState<PediatricDrugDosingInput['medication']>('acetaminophen');

  const result = useMemo(
    () =>
      calculatePediatricDrugDosing({
        weightKg,
        medication: selectedMed,
      }),
    [weightKg, selectedMed]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}PEDIATRIC WEIGHT-BASED MEDICATION ORDER:
- Patient Weight: ${weightKg} kg
- Medication: ${result.drugName}
- Standard Dose Range: ${result.standardDoseRange}
- Calculated Dose: ${result.calculatedDoseMg}
- Liquid Volume: ${result.liquidVolumeMl}
- Schedule & Route: ${result.dosingFrequencyAndRoute}
- Max Limit: ${result.maxDoseWarning}
- Clinical Instructions: ${result.clinicalNotes}`;
  }, [patientTag, weightKg, result]);

  const resetDefaults = () => {
    setWeightKg(15);
    setSelectedMed('acetaminophen');
  };

  const references = [
    {
      source: 'AAP Red Book (2024)',
      title: 'Pediatric Infectious Diseases & High-Dose Amoxicillin Therapy',
      details: 'High-dose amoxicillin (80-90 mg/kg/day divided BID) is the gold standard for acute otitis media and uncomplicated community-acquired pneumonia.',
    },
    {
      source: 'AAP Section on Clinical Pharmacology and Therapeutics',
      title: 'Fever and Antipyretic Use in Children (Pediatrics 2011 / Reaffirmed)',
      details: 'Weight-based dosing must be used rather than age-based estimates. Acetaminophen 10-15 mg/kg q4-6h; Ibuprofen 5-10 mg/kg q6-8h in infants >= 6 months.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Pediatric Weight-Based Drug Dosing
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900/60 text-violet-800 dark:text-violet-300">
                AAP Standard
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Milligram per kilogram calculations, liquid suspension volume (mL) & maximum dose guardrails
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="pediatric_dosing" showLabel />
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

      {/* Weight Stepper */}
      <div className="max-w-xs mb-6">
        <NumberStepper
          label="Child Weight"
          unit="kg"
          value={weightKg}
          min={2}
          max={90}
          step={0.5}
          isFloat
          onChange={setWeightKg}
          helperText="Doses auto-calculate live on weight"
        />
      </div>

      {/* Drug Selector Pills */}
      <div className="space-y-1 mb-6">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Select Medication
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {[
            { id: 'acetaminophen', label: 'Acetaminophen', subtitle: '10-15 mg/kg' },
            { id: 'ibuprofen', label: 'Ibuprofen (>=6m)', subtitle: '5-10 mg/kg' },
            { id: 'amoxicillin_high_dose', label: 'Amoxicillin High-Dose', subtitle: '80-90 mg/kg/d' },
            { id: 'epinephrine_anaphylaxis', label: 'Epi Anaphylaxis', subtitle: '0.01 mg/kg IM' },
            { id: 'dextrose_10', label: 'D10W Hypoglycemia', subtitle: '2-5 mL/kg IV' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedMed(item.id as typeof selectedMed)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedMed === item.id
                  ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs font-bold block">{item.label}</span>
              <span className={`text-[10px] block ${selectedMed === item.id ? 'text-violet-100' : 'text-slate-400'}`}>
                {item.subtitle}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Drug Calculation Result Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50/40 dark:from-violet-950/40 dark:to-indigo-950/20 border border-violet-200/80 dark:border-violet-800 mb-6">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-violet-200/60 dark:border-violet-800/60">
          <div>
            <h3 className="text-sm font-extrabold text-violet-950 dark:text-violet-200">
              {result.drugName}
            </h3>
            <span className="text-xs text-violet-700 dark:text-violet-400 font-semibold">
              Standard: {result.standardDoseRange}
            </span>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-violet-700 text-white shadow-2xs">
            For {weightKg} kg Child
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-violet-100 dark:border-violet-900">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              Calculated Milligram Dose
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {result.calculatedDoseMg}
            </div>
          </div>

          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-violet-100 dark:border-violet-900">
            <span className="text-[10px] uppercase font-bold text-violet-700 dark:text-violet-400 block mb-0.5">
              Liquid Oral Suspension Volume
            </span>
            <div className="text-xl font-black text-violet-700 dark:text-violet-300">
              {result.liquidVolumeMl}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-start gap-2">
            <strong className="text-slate-900 dark:text-white shrink-0">Schedule:</strong>
            <span>{result.dosingFrequencyAndRoute}</span>
          </div>
          <div className="flex items-start gap-2">
            <strong className="text-rose-600 dark:text-rose-400 shrink-0">Safety Max:</strong>
            <span>{result.maxDoseWarning}</span>
          </div>
          <div className="flex items-start gap-2">
            <strong className="text-slate-900 dark:text-white shrink-0">Clinical Notes:</strong>
            <span>{result.clinicalNotes}</span>
          </div>
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
        scoreBadge={result.drugName.split(' ')[0]}
        categoryLabel={`${result.calculatedDoseMg} (${weightKg} kg child)`}
        noteText={clinicalNote}
        severityColor="indigo"
      />
    </div>
  );
};
