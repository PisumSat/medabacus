import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Flame, RotateCcw, Droplet, Clock, Baby, User } from 'lucide-react';
import {
  calculateParklandBurn,
  calculateRuleOfNinesTbsa,
  getPediatricRuleOfNinesNorms,
} from '../../calculators/surgery';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import { useCalculatorPrefill } from '../../context/useCalculatorPrefill';
import { AiPrefillBanner } from '../ui/AiPrefillBanner';

interface ParklandBurnViewProps {
  patientTag?: string;
}

export const ParklandBurnView: React.FC<ParklandBurnViewProps> = ({ patientTag }) => {
  const { prefill, clearPrefill, hasPrefill } = useCalculatorPrefill('parkland_burn');
  const [isPediatric, setIsPediatric] = useState(false);
  const [ageYears, setAgeYears] = useState(4);
  const [weightKg, setWeightKg] = useState(prefill?.weightKg ?? 70);
  const [hoursElapsed, setHoursElapsed] = useState(prefill?.timeSinceInjuryHours ?? 2);
  const [fluidMultiplier, setFluidMultiplier] = useState(4); // 4 mL standard, or 3 mL pediatric / 2 mL ABA minimal
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Rule of nines state initialized from prefill if present
  const hasPrefillTbsa = prefill?.tbsaPercent !== undefined;
  const [head, setHead] = useState(hasPrefillTbsa ? 0 : 4.5);
  const [antTorso, setAntTorso] = useState(prefill?.tbsaPercent ?? 18);
  const [postTorso, setPostTorso] = useState(0);
  const [rArm, setRArm] = useState(hasPrefillTbsa ? 0 : 4.5);
  const [lArm, setLArm] = useState(0);
  const [rLeg, setRLeg] = useState(hasPrefillTbsa ? 0 : 9);
  const [lLeg, setLLeg] = useState(0);
  const [perineum, setPerineum] = useState(0);

  const pediatricNorms = useMemo(
    () => getPediatricRuleOfNinesNorms(ageYears),
    [ageYears]
  );

  const tbsaPercent = useMemo(
    () =>
      calculateRuleOfNinesTbsa({
        headAndNeckPercent: head,
        anteriorTorsoPercent: antTorso,
        posteriorTorsoPercent: postTorso,
        rightArmPercent: rArm,
        leftArmPercent: lArm,
        rightLegPercent: rLeg,
        leftLegPercent: lLeg,
        perineumPercent: perineum,
      }),
    [head, antTorso, postTorso, rArm, lArm, rLeg, lLeg, perineum]
  );

  const burnResult = useMemo(
    () =>
      calculateParklandBurn({
        weightKg,
        tbsaPercent,
        hoursElapsedSinceBurn: hoursElapsed,
        fluidMultiplierMlPerKgPerPercent: fluidMultiplier,
        isPediatric,
        ageYears: isPediatric ? ageYears : undefined,
      }),
    [weightKg, tbsaPercent, hoursElapsed, fluidMultiplier, isPediatric, ageYears]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    const patientType = isPediatric ? `Pediatric (${ageYears}yo)` : 'Adult';
    return `${prefix}PARKLAND BURN RESUSCITATION ORDERS (General Surgery & Trauma):
- Patient: ${patientType} | Weight: ${weightKg} kg | 2nd/3rd Degree Burn TBSA: ${tbsaPercent}%
- Time Elapsed Since Burn: ${hoursElapsed} hours
- Parkland Formula Calculation (${fluidMultiplier} mL/kg/%TBSA):
  * Total 24-Hour Lactated Ringer's Volume: ${burnResult.total24HourFluidMl} mL
  * First 8 Hours Resuscitation (50%): ${burnResult.first8HoursTotalMl} mL
    - Rate: ${burnResult.adjustedFirstPeriodRateMlPerHour ?? burnResult.first8HoursRateMlPerHour} mL/hr (hours remaining: ${burnResult.hoursRemainingInFirst8h ?? 8}h)
  * Next 16 Hours Resuscitation (50%): ${burnResult.remaining16HoursTotalMl} mL (${burnResult.remaining16HoursRateMlPerHour} mL/hr)
${
  burnResult.pediatricConcurrentMaintenanceMlPerHour
    ? `- CONCURRENT PEDIATRIC MAINTENANCE FLUID (Holliday-Segar):
  * Rate: ${burnResult.pediatricConcurrentMaintenanceMlPerHour} mL/hr (D5 in 0.45% NS or D5LR)
  * Combined Infusion Rate (1st 8h): ${burnResult.totalFirstPeriodCombinedRateMlPerHour} mL/hr
  * Combined Infusion Rate (Next 16h): ${burnResult.totalSecondPeriodCombinedRateMlPerHour} mL/hr\n`
    : ''
}- Target Urine Output Goal: ${burnResult.targetUrineOutputMlPerHour}
- Clinical Protocol: ${burnResult.clinicalGuideline}`;
  }, [patientTag, isPediatric, ageYears, weightKg, tbsaPercent, hoursElapsed, fluidMultiplier, burnResult]);

  const handleTogglePatientType = (peds: boolean) => {
    setIsPediatric(peds);
    if (peds) {
      setWeightKg(16);
      setFluidMultiplier(3);
      setHead(pediatricNorms.headPercent / 2);
      setRLeg(pediatricNorms.eachLegPercent);
    } else {
      setWeightKg(70);
      setFluidMultiplier(4);
      setHead(4.5);
      setRLeg(9);
    }
  };

  const resetDefaults = () => {
    setIsPediatric(false);
    setAgeYears(4);
    setWeightKg(70);
    setHoursElapsed(2);
    setFluidMultiplier(4);
    setHead(4.5);
    setAntTorso(18);
    setPostTorso(0);
    setRArm(4.5);
    setLArm(0);
    setRLeg(9);
    setLLeg(0);
    setPerineum(0);
    clearPrefill();
  };

  const references = [
    {
      source: 'American Burn Association (ABA) Practice Guidelines 2023',
      title: 'Initial Management and Fluid Resuscitation of Severe Burns',
      details: 'Adult guideline: 2-4 mL/kg/%TBSA warmed LR. Pediatric guideline: 3 mL/kg/%TBSA PLUS concurrent Holliday-Segar dextrose maintenance fluid.',
    },
    {
      source: 'Lund CC, Browder NC. Surg Gynecol Obstet 1944;79:352-358',
      title: 'The Estimation of Areas of Burns',
      details: 'Standard age-adjusted proportions for pediatric burns accounting for disproportionately large head and smaller lower extremities.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-32 sm:pb-36 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Parkland Burn Formula & Rule of Nines
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                ABA Consensus
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Adult & pediatric trauma crystalloid resuscitation, Wallace/Lund-Browder TBSA & urine titration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="parkland_burn" showLabel />
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

      {/* Adult vs Pediatric Protocol Switcher */}
      <div className="mb-6 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl flex max-w-sm">
        <button
          type="button"
          onClick={() => handleTogglePatientType(false)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            !isPediatric
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Adult Protocol</span>
        </button>
        <button
          type="button"
          onClick={() => handleTogglePatientType(true)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isPediatric
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Baby className="w-4 h-4" />
          <span>Pediatric Protocol</span>
        </button>
      </div>

      {/* Inputs: Weight, Hours Since Burn, Multiplier */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {isPediatric && (
          <NumberStepper
            label="Patient Age"
            unit="years"
            value={ageYears}
            min={0}
            max={15}
            step={1}
            onChange={setAgeYears}
            helperText="Lund-Browder scaling"
          />
        )}
        <NumberStepper
          label="Patient Weight"
          unit="kg"
          value={weightKg}
          min={isPediatric ? 2 : 30}
          max={isPediatric ? 60 : 250}
          step={isPediatric ? 0.5 : 1}
          isFloat={isPediatric}
          onChange={setWeightKg}
          helperText={isPediatric ? 'Pediatric body mass' : 'Standard adult weight'}
        />
        <NumberStepper
          label="Time Elapsed Since Injury"
          unit="hours"
          value={hoursElapsed}
          min={0}
          max={24}
          step={0.5}
          isFloat
          onChange={setHoursElapsed}
          helperText="Clock starts at burn event"
        />
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Resuscitation Formula
          </label>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setFluidMultiplier(4)}
              className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                fluidMultiplier === 4
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              4 mL
            </button>
            <button
              type="button"
              onClick={() => setFluidMultiplier(3)}
              className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                fluidMultiplier === 3
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              3 mL
            </button>
            <button
              type="button"
              onClick={() => setFluidMultiplier(2)}
              className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                fluidMultiplier === 2
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              2 mL
            </button>
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            {isPediatric ? '3 mL ABA pediatric consensus' : fluidMultiplier === 4 ? '4 mL Parkland standard' : 'ABA conservative'}
          </span>
        </div>
      </div>

      {/* Anatomical Burn Area Grid */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
              {isPediatric
                ? `Lund-Browder Chart (Age ${ageYears}yo Proportions)`
                : 'Wallace Rule of Nines (Adult 2nd & 3rd Degree Burns)'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Only include partial-thickness and full-thickness burns (exclude 1st degree erythema)
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Total TBSA:</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">{tbsaPercent}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NumberStepper
            label={`Head & Neck (${isPediatric ? pediatricNorms.headPercent : 9}%)`}
            unit="%"
            value={head}
            min={0}
            max={isPediatric ? pediatricNorms.headPercent : 9}
            step={0.5}
            isFloat
            onChange={setHead}
          />
          <NumberStepper
            label="Anterior Torso (18%)"
            unit="%"
            value={antTorso}
            min={0}
            max={18}
            step={1}
            onChange={setAntTorso}
          />
          <NumberStepper
            label="Posterior Torso (18%)"
            unit="%"
            value={postTorso}
            min={0}
            max={18}
            step={1}
            onChange={setPostTorso}
          />
          <NumberStepper
            label="Right Arm (9%)"
            unit="%"
            value={rArm}
            min={0}
            max={9}
            step={0.5}
            isFloat
            onChange={setRArm}
          />
          <NumberStepper
            label="Left Arm (9%)"
            unit="%"
            value={lArm}
            min={0}
            max={9}
            step={0.5}
            isFloat
            onChange={setLArm}
          />
          <NumberStepper
            label={`Right Leg (${isPediatric ? pediatricNorms.eachLegPercent : 18}%)`}
            unit="%"
            value={rLeg}
            min={0}
            max={isPediatric ? pediatricNorms.eachLegPercent : 18}
            step={0.5}
            isFloat
            onChange={setRLeg}
          />
          <NumberStepper
            label={`Left Leg (${isPediatric ? pediatricNorms.eachLegPercent : 18}%)`}
            unit="%"
            value={lLeg}
            min={0}
            max={isPediatric ? pediatricNorms.eachLegPercent : 18}
            step={0.5}
            isFloat
            onChange={setLLeg}
          />
          <NumberStepper
            label="Perineum / Genitalia (1%)"
            unit="%"
            value={perineum}
            min={0}
            max={1}
            step={0.5}
            isFloat
            onChange={setPerineum}
          />
        </div>
      </div>

      {/* Resuscitation Protocol Output */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total 24h */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Total 24h Crystalloid (LR)
          </span>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {burnResult.total24HourFluidMl}
            </span>
            <span className="text-xs font-semibold text-slate-500">mL</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Warmed Lactated Ringer’s solution
          </p>
        </div>

        {/* First 8 Hours */}
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              First 8 Hours (50% = {burnResult.first8HoursTotalMl} mL)
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-amber-700 dark:text-amber-400">
              {burnResult.adjustedFirstPeriodRateMlPerHour ?? burnResult.first8HoursRateMlPerHour}
            </span>
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">mL / hr</span>
          </div>
          <p className="text-[11px] text-amber-800 dark:text-amber-300">
            {burnResult.adjustedFirstPeriodRateMlPerHour
              ? `Adjusted for ${burnResult.hoursRemainingInFirst8h}h remaining in first 8h window`
              : 'Initial starting infusion rate'}
          </p>
        </div>

        {/* Next 16 Hours */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
            Next 16 Hours (50% = {burnResult.remaining16HoursTotalMl} mL)
          </span>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {burnResult.remaining16HoursRateMlPerHour}
            </span>
            <span className="text-xs font-semibold text-slate-500">mL / hr</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Infusion rate for hours 8 through 24
          </p>
        </div>
      </div>

      {/* Concurrent Pediatric Maintenance Fluid Callout (If Pediatric or < 30 kg) */}
      {burnResult.pediatricConcurrentMaintenanceMlPerHour !== undefined && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/40 mb-6 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
            <Baby className="w-4 h-4 text-amber-600" />
            <span>Concurrent Pediatric Maintenance Fluid (Holliday-Segar)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/60">
              <span className="text-[10px] text-slate-400 block font-semibold">Maintenance Rate</span>
              <span className="text-base font-black text-amber-700 dark:text-amber-400">
                {burnResult.pediatricConcurrentMaintenanceMlPerHour} mL/hr
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">D5 0.45% NS or D5LR</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/60">
              <span className="text-[10px] text-slate-400 block font-semibold">Combined 1st 8h Rate</span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {burnResult.totalFirstPeriodCombinedRateMlPerHour} mL/hr
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Resuscitation + Maintenance</span>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/60">
              <span className="text-[10px] text-slate-400 block font-semibold">Combined Next 16h Rate</span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {burnResult.totalSecondPeriodCombinedRateMlPerHour} mL/hr
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Resuscitation + Maintenance</span>
            </div>
          </div>
        </div>
      )}

      {/* Target Urine Output & Titration Notice */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 mb-6 flex items-start gap-3">
        <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
          <span className="font-bold block mb-0.5">Urine Output Titration Goal: {burnResult.targetUrineOutputMlPerHour}</span>
          <span>
            {burnResult.clinicalGuideline} Insert Foley catheter. Titrate infusion hourly by 20-30% up or down according to urine output endpoints to avoid hypoperfusion and resuscitation-related edema.
          </span>
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
        scoreBadge={`Parkland 24h: ${burnResult.total24HourFluidMl} mL`}
        categoryLabel={`1st 8h: ${burnResult.adjustedFirstPeriodRateMlPerHour ?? burnResult.first8HoursRateMlPerHour} mL/h`}
        noteText={clinicalNote}
        severityColor="amber"
      />
    </div>
  );
};
