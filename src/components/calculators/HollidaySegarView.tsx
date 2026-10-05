import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Droplets, RotateCcw } from 'lucide-react';
import { calculateHollidaySegar } from '../../calculators/pediatrics';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import { useCalculatorPrefill } from '../../context/useCalculatorPrefill';
import { AiPrefillBanner } from '../ui/AiPrefillBanner';

interface HollidaySegarViewProps {
  patientTag?: string;
}

export const HollidaySegarView: React.FC<HollidaySegarViewProps> = ({ patientTag }) => {
  const { prefill, clearPrefill, hasPrefill } = useCalculatorPrefill('holliday_segar');
  const [weightKg, setWeightKg] = useState(prefill?.weightKg ?? 14);
  const [dehydration, setDehydration] = useState(5); // 0%, 3-5% mild, 6-9% mod, 10% severe
  const [bolusGiven, setBolusGiven] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const result = useMemo(
    () =>
      calculateHollidaySegar({
        weightKg,
        percentDehydration: dehydration,
        precedingResuscitationBolusMl: bolusGiven,
      }),
    [weightKg, dehydration, bolusGiven]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}PEDIATRIC FLUID MAINTENANCE & DEFICIT (Holliday-Segar):
- Patient Weight: ${weightKg} kg | Clinical Dehydration: ${dehydration}%
- 24-Hour Maintenance Fluid (100/50/20 rule): ${result.dailyMaintenanceMl} mL/day (${result.hourlyMaintenanceMlPerHour} mL/hr)
${dehydration > 0 ? `- Dehydration Deficit (${dehydration}%): ${result.dehydrationDeficitMl} mL
- Resuscitation Boluses Already Given: ${bolusGiven} mL
- Remaining Deficit to Replace: ${result.remainingDeficitMl} mL
- First 24-Hour Total Replacement Rate (Maintenance + Deficit): ${result.first24HourReplacementRateMlPerHour} mL/hr` : ''}
- Recommended Solution: ${result.replacementFluidGuideline}`;
  }, [patientTag, weightKg, dehydration, bolusGiven, result]);

  const resetDefaults = () => {
    setWeightKg(14);
    setDehydration(5);
    setBolusGiven(0);
    clearPrefill();
  };

  const references = [
    {
      source: 'Holliday MA, Segar WE (Pediatrics 1957)',
      title: 'The Maintenance Need for Water in Parenteral Fluid Therapy',
      details: 'Classic caloric expenditure method: 100 mL/kg for first 10 kg, 50 mL/kg for next 10 kg, 20 mL/kg for weight > 20 kg (4/2/1 hourly rule).',
    },
    {
      source: 'AAP Clinical Practice Guideline (Pediatrics 2018)',
      title: 'Maintenance Intravenous Fluids in Children',
      details: 'Isotonic solutions (e.g. D5 0.9% Normal Saline or Plasmalyte) should be chosen over hypotonic fluids (e.g. 0.2% NS) to prevent fatal hyponatremic encephalopathy.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Holliday-Segar Pediatric Fluids & Deficit
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300">
                AAP 2018
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              100/50/20 daily & 4/2/1 hourly maintenance rates with dehydration deficit replacement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="holliday_segar" />
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

      {/* Steppers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <NumberStepper
          label="Child Weight"
          unit="kg"
          value={weightKg}
          min={1}
          max={90}
          step={0.5}
          isFloat
          onChange={setWeightKg}
          helperText="Standard pediatric weight"
        />

        <NumberStepper
          label="Estimated Dehydration"
          unit="%"
          value={dehydration}
          min={0}
          max={15}
          step={1}
          onChange={setDehydration}
          helperText="0% (none), 3-5% (mild), 6-9% (mod), >=10% (severe)"
        />

        <NumberStepper
          label="ED Resuscitation Bolus Given"
          unit="mL"
          value={bolusGiven}
          min={0}
          max={2000}
          step={50}
          onChange={setBolusGiven}
          helperText="Isotonic boluses (20 mL/kg) already infused"
        />
      </div>

      {/* Results Output */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Hourly Maintenance */}
        <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900 dark:text-sky-300 block mb-1">
            Hourly Maintenance Rate (4/2/1)
          </span>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-sky-700 dark:text-sky-400">
              {result.hourlyMaintenanceMlPerHour}
            </span>
            <span className="text-xs font-semibold text-sky-800 dark:text-sky-300">mL / hr</span>
          </div>
          <p className="text-[11px] text-sky-800 dark:text-sky-300">
            Total 24h: {result.dailyMaintenanceMl} mL / day
          </p>
        </div>

        {/* Deficit */}
        {result.dehydrationDeficitMl !== undefined && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Dehydration Deficit ({dehydration}%)
            </span>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {result.remainingDeficitMl}
              </span>
              <span className="text-xs font-semibold text-slate-500">mL remaining</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Total deficit: {result.dehydrationDeficitMl} mL (-{bolusGiven} mL bolus)
            </p>
          </div>
        )}

        {/* Combined 24h Replacement */}
        {result.first24HourReplacementRateMlPerHour !== undefined && (
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 block mb-1">
              First 24h Total Infusion Rate
            </span>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                {result.first24HourReplacementRateMlPerHour}
              </span>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">mL / hr</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
              Maintenance ({result.dailyMaintenanceMl}) + Deficit ({result.remainingDeficitMl}) / 24h
            </p>
          </div>
        )}
      </div>

      {/* Isotonic Fluid Safety Box */}
      <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 mb-6 text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
        <span className="font-bold block mb-1">AAP Clinical Practice Safety Guideline:</span>
        <span>{result.replacementFluidGuideline}</span>
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
        scoreBadge={`Rate: ${result.hourlyMaintenanceMlPerHour} mL/h`}
        categoryLabel={result.first24HourReplacementRateMlPerHour ? `With Deficit: ${result.first24HourReplacementRateMlPerHour} mL/h` : `${result.dailyMaintenanceMl} mL/day`}
        noteText={clinicalNote}
        severityColor="teal"
      />
    </div>
  );
};
