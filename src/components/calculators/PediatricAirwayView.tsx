import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Wind, RotateCcw, Zap, Stethoscope } from 'lucide-react';
import { calculatePediatricResuscitation } from '../../calculators/pediatrics';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface PediatricAirwayViewProps {
  patientTag?: string;
}

export const PediatricAirwayView: React.FC<PediatricAirwayViewProps> = ({ patientTag }) => {
  const [ageYears, setAgeYears] = useState(4);
  const [ageMonths, setAgeMonths] = useState(0);
  const [actualWeight, setActualWeight] = useState(16);
  const [useActualWeight, setUseActualWeight] = useState(true);

  const result = useMemo(
    () =>
      calculatePediatricResuscitation({
        ageYears,
        ageMonths: ageYears < 1 ? ageMonths : undefined,
        actualWeightKg: useActualWeight ? actualWeight : undefined,
      }),
    [ageYears, ageMonths, actualWeight, useActualWeight]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}PEDIATRIC RESUSCITATION & AIRWAY PARAMETERS:
- Age: ${ageYears} years | Estimated/Actual Weight: ${result.estimatedWeightKg} kg
- Endotracheal Tube (Khine Formula):
  * Cuffed ETT ID: ${result.cuffedEttSizeMm} mm (PALS preferred)
  * Uncuffed ETT ID: ${result.uncuffedEttSizeMm} mm
  * ETT Insertion Depth at Lips: ${result.ettDepthAtLipsCm} cm (ETT × 3 rule)
- Equipment: Laryngoscope: ${result.laryngoscopeBlade} | Suction Catheter: ${result.suctionCatheterFr} Fr | Chest Tube: ${result.chestTubeFr}
- Defibrillation / Cardioversion:
  * 1st Defibrillation (2 J/kg): ${result.defibrillationInitialJoules} Joules
  * Subsequent Defibrillation (4 J/kg): ${result.defibrillationSubsequentJoules} Joules
  * Synchronized Cardioversion (0.5-1 J/kg): ${result.cardioversionJoules} Joules
- Emergency Medications:
  * Cardiac Arrest Epinephrine IV/IO (0.01 mg/kg): ${result.epinephrineIvDoseMg} mg (${result.epinephrineIvVolumeMl})
- Expected Baseline Vital Signs: ${result.normalVitalsSummary}`;
  }, [patientTag, ageYears, result]);

  const resetDefaults = () => {
    setAgeYears(4);
    setAgeMonths(0);
    setActualWeight(16);
    setUseActualWeight(true);
  };

  const references = [
    {
      source: 'Khine H, et al. (Anesthesiology 1997)',
      title: 'Comparison of Cuffed and Uncuffed Endotracheal Tubes in Young Children',
      details: 'Khine formula for cuffed ETT size: (Age / 4) + 3.5. Endorsed by AHA PALS and AAP for safe pediatric airway management.',
    },
    {
      source: 'AHA PALS Guidelines (Circulation 2020)',
      title: 'Pediatric Advanced Life Support Guidelines for CPR and ECC',
      details: 'Recommends cuffed tubes over uncuffed tubes for infants and children, and initial defibrillation dose of 2 J/kg followed by 4 J/kg.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Pediatric Airway & Resuscitation (ETT)
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                AHA PALS 2020
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Khine cuffed/uncuffed ETT sizes, lip depth, defibrillation energy & emergency arrest epinephrine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="pediatric_airway" showLabel />
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

      {/* Age & Weight Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <NumberStepper
          label="Child Age (Years)"
          unit="years"
          value={ageYears}
          min={0}
          max={16}
          step={1}
          onChange={setAgeYears}
          helperText="0 to 16 years"
        />

        {ageYears < 1 && (
          <NumberStepper
            label="Age in Months (if < 1 yr)"
            unit="months"
            value={ageMonths}
            min={0}
            max={11}
            step={1}
            onChange={setAgeMonths}
          />
        )}

        <NumberStepper
          label="Weight"
          unit="kg"
          value={actualWeight}
          min={2}
          max={90}
          step={0.5}
          isFloat
          onChange={(val) => {
            setActualWeight(val);
            setUseActualWeight(true);
          }}
          helperText={useActualWeight ? 'Measured patient weight' : `Estimated weight: ${result.estimatedWeightKg} kg`}
        />
      </div>

      {/* Airway Equipment Grid */}
      <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300 block mb-3">
          Airway & Intubation Parameters (Weight: {result.estimatedWeightKg} kg)
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-teal-200/80 dark:border-teal-800 text-center">
            <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400 block mb-0.5">
              Cuffed ETT (PALS)
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {result.cuffedEttSizeMm} mm
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">(Age/4) + 3.5</span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-teal-200/80 dark:border-teal-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
              Uncuffed ETT
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {result.uncuffedEttSizeMm} mm
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">(Age/4) + 4.0</span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-teal-200/80 dark:border-teal-800 text-center">
            <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400 block mb-0.5">
              Depth at Lip
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {result.ettDepthAtLipsCm} cm
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">ETT Size × 3</span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-teal-200/80 dark:border-teal-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
              Laryngoscope
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white block mt-1">
              {result.laryngoscopeBlade}
            </span>
          </div>
        </div>

        <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-300 mt-3 pt-2 border-t border-teal-200/60 dark:border-teal-800/60">
          <span>Suction Catheter: <strong className="text-slate-900 dark:text-white">{result.suctionCatheterFr} Fr</strong></span>
          <span>•</span>
          <span>Chest Tube: <strong className="text-slate-900 dark:text-white">{result.chestTubeFr}</strong></span>
        </div>
      </div>

      {/* Defibrillation & Cardiac Arrest Pharmacology */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Defibrillation Energy */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Defibrillation & Cardioversion Energy
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span>Initial Defibrillation (2 J/kg):</span>
              <strong className="text-amber-700 dark:text-amber-400">{result.defibrillationInitialJoules} Joules</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span>Subsequent Defibrillation (4 J/kg):</span>
              <strong className="text-rose-700 dark:text-rose-400">{result.defibrillationSubsequentJoules} Joules</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Synchronized Cardioversion (0.5-1 J/kg):</span>
              <strong className="text-teal-700 dark:text-teal-400">{result.cardioversionJoules} Joules</strong>
            </div>
          </div>
        </div>

        {/* Resuscitation Epinephrine */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Cardiac Arrest Epinephrine (IV / IO)
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {result.epinephrineIvDoseMg} mg
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              {result.epinephrineIvVolumeMl}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Dose is 0.01 mg/kg (0.1 mL/kg of 0.1 mg/mL 1:10,000 solution) every 3-5 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Vital Signs Summary */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 mb-6 text-xs text-slate-700 dark:text-slate-300">
        <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Normal Baseline Vitals for Age ({ageYears} yo):</span>
        <span>{result.normalVitalsSummary}</span>
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
        scoreBadge={`Cuffed ETT: ${result.cuffedEttSizeMm} mm`}
        categoryLabel={`Depth: ${result.ettDepthAtLipsCm} cm | 1st Defib: ${result.defibrillationInitialJoules} J`}
        noteText={clinicalNote}
        severityColor="teal"
      />
    </div>
  );
};
