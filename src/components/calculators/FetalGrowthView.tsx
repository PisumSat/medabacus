import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Activity, ShieldAlert, CheckCircle, RotateCcw } from 'lucide-react';
import { calculateEfw, evaluateAmnioticFluid, type FetalBiometryInput } from '../../calculators/fetalGrowth';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { NumberStepper } from '../ui/NumberStepper';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface FetalGrowthViewProps {
  patientTag?: string;
}

export const FetalGrowthView: React.FC<FetalGrowthViewProps> = ({ patientTag }) => {
  const [activeTab, setActiveTab] = useState<'efw' | 'fluid'>('efw');

  // EFW inputs (default 32w0d)
  const [gaWeeks, setGaWeeks] = useState<number>(32);
  const [gaDays, setGaDays] = useState<number>(0);
  const [bpdMm, setBpdMm] = useState<number>(82);
  const [hcMm, setHcMm] = useState<number>(300);
  const [acMm, setAcMm] = useState<number>(280);
  const [flMm, setFlMm] = useState<number>(62);

  // Fluid inputs
  const [fluidType, setFluidType] = useState<'AFI' | 'SDP'>('SDP');
  const [fluidCm, setFluidCm] = useState<number>(4.5);

  const resetDefaults = () => {
    setGaWeeks(32);
    setGaDays(0);
    setBpdMm(82);
    setHcMm(300);
    setAcMm(280);
    setFlMm(62);
    setFluidType('SDP');
    setFluidCm(4.5);
  };

  const biometryInput: FetalBiometryInput = useMemo(
    () => ({
      gaWeeks,
      gaDays,
      bpdMm: bpdMm || undefined,
      hcMm: hcMm || undefined,
      acMm,
      flMm,
    }),
    [gaWeeks, gaDays, bpdMm, hcMm, acMm, flMm]
  );

  const efwResult = useMemo(() => calculateEfw(biometryInput), [biometryInput]);

  const fluidResult = useMemo(
    () => evaluateAmnioticFluid({ measurementType: fluidType, valueCm: fluidCm }),
    [fluidType, fluidCm]
  );

  const combinedNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}${efwResult.noteSnippet}\n\n${fluidResult.noteSnippet}`;
  }, [efwResult, fluidResult, patientTag]);

  const references = [
    {
      source: 'SMFM & ACOG',
      title: 'Practice Bulletin No. 227: Fetal Growth Restriction (2021)',
      details: 'Defines FGR as EFW or AC < 10th percentile. Emphasizes weekly UA Doppler surveillance for SGA and 1-2x weekly for severe FGR (< 3rd percentile).',
    },
    {
      source: 'SMFM',
      title: 'Consult Series #38: Evaluation & Management of Amniotic Fluid Volume',
      details: 'Strong recommendation for Single Deepest Pocket (SDP < 2 cm) over AFI (< 5 cm) to reduce unnecessary labor inductions and cesareans.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <Activity className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Fetal Growth, EFW & Amniotic Fluid
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hadlock 4 biometry, gestational age percentiles & SMFM fluid criteria
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="fetal_growth" showLabel />
          <button
            type="button"
            onClick={resetDefaults}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1"
            title="Reset to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <CopyNoteButton textToCopy={combinedNote} />
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl mb-5 gap-1.5 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('efw')}
          className={`py-2 px-2 text-center text-xs font-bold rounded-xl transition-all ${
            activeTab === 'efw'
              ? 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Hadlock EFW & Percentile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fluid')}
          className={`py-2 px-2 text-center text-xs font-bold rounded-xl transition-all ${
            activeTab === 'fluid'
              ? 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Amniotic Fluid (AFI / SDP)
        </button>
      </div>

      {/* EFW Tab Content */}
      {activeTab === 'efw' && (
        <div>
          {/* Gestational Age Stepper Row */}
          <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/70 dark:border-slate-700">
            <NumberStepper
              label="GA Weeks"
              unit="wks"
              value={gaWeeks}
              onChange={setGaWeeks}
              min={24}
              max={42}
            />
            <NumberStepper
              label="GA Days"
              unit="days"
              value={gaDays}
              onChange={setGaDays}
              min={0}
              max={6}
            />
          </div>

          {/* Biometry Steppers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <NumberStepper
              label="AC (Abdominal)"
              unit="mm"
              value={acMm}
              onChange={setAcMm}
              min={100}
              max={450}
              step={5}
              helperText="Required"
            />
            <NumberStepper
              label="FL (Femur Length)"
              unit="mm"
              value={flMm}
              onChange={setFlMm}
              min={20}
              max={95}
              step={2}
              helperText="Required"
            />
            <NumberStepper
              label="BPD (Biparietal)"
              unit="mm"
              value={bpdMm}
              onChange={setBpdMm}
              min={30}
              max={120}
              step={2}
            />
            <NumberStepper
              label="HC (Head Circ.)"
              unit="mm"
              value={hcMm}
              onChange={setHcMm}
              min={120}
              max={400}
              step={5}
            />
          </div>

          {/* Results Banner */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Estimated Fetal Weight ({efwResult.formulaUsed})
                </span>
                <div className="text-4xl font-black tracking-tight mt-1 flex items-baseline gap-2">
                  <span>{efwResult.efwGrams.toLocaleString()}</span>
                  <span className="text-xl font-medium text-emerald-200">grams</span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Equivalent to <span className="font-semibold text-white">{efwResult.efwLbs}</span>
                </div>
              </div>

              <div className="bg-white/10 p-3.5 rounded-xl border border-white/15 space-y-1">
                <div className="text-xs text-slate-300">Gestational Percentile ({gaWeeks}+{gaDays} wks)</div>
                <div className="text-2xl font-extrabold flex items-center gap-2">
                  <span>{efwResult.percentile}th %</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      efwResult.growthCategory === 'AGA (Normal)'
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/30'
                        : efwResult.growthCategory.includes('SGA')
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-400/30'
                          : 'bg-rose-500/30 text-rose-300 border border-rose-400/30'
                    }`}
                  >
                    {efwResult.growthCategory}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs leading-relaxed space-y-2">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-slate-200">
                <span className="font-bold text-white block mb-0.5">Clinical Protocol & Action:</span>
                {efwResult.recommendation}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fluid Tab Content */}
      {activeTab === 'fluid' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Measurement Methodology
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setFluidType('SDP')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all ${
                    fluidType === 'SDP'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>Single Deepest Pocket (SDP)</div>
                  <div className="text-[10px] opacity-80 mt-0.5">SMFM Preferred</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFluidType('AFI')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all ${
                    fluidType === 'AFI'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>Amniotic Fluid Index (AFI)</div>
                  <div className="text-[10px] opacity-80 mt-0.5">4 Quadrants Sum</div>
                </button>
              </div>
            </div>

            <div>
              <NumberStepper
                label={fluidType === 'SDP' ? 'Single Deepest Pocket' : 'Amniotic Fluid Index'}
                unit="cm"
                value={fluidCm}
                onChange={setFluidCm}
                min={0}
                max={50}
                step={0.5}
                isFloat
                helperText={fluidType === 'SDP' ? 'Normal range: 2.0 - 8.0 cm' : 'Normal range: 5.0 - 24.0 cm'}
              />
            </div>
          </div>

          {/* Fluid Result */}
          <div
            className={`p-5 rounded-2xl border transition-all mb-4 ${
              fluidResult.classification === 'Normal'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                  Amniotic Volume Assessment
                </span>
                <div className="text-2xl font-extrabold mt-0.5 flex items-center gap-2">
                  <span>{fluidResult.classification}</span>
                  {fluidResult.severity && (
                    <span className="text-sm font-semibold opacity-80">({fluidResult.severity})</span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-black/5 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200">
                {fluidType}: {fluidCm.toFixed(1)} cm
              </div>
            </div>

            <div className="mt-3.5 space-y-2 text-xs leading-relaxed">
              <div className="flex items-start gap-2">
                {fluidResult.classification === 'Normal' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                )}
                <span>{fluidResult.interpretation}</span>
              </div>
              <div className="p-3 bg-white/70 dark:bg-slate-900/60 rounded-xl text-slate-700 dark:text-slate-300 border border-black/5 dark:border-white/10">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">SMFM Advisory:</span>
                {fluidResult.smfmGuideline}
              </div>
            </div>
          </div>
        </div>
      )}

      <ReferenceAccordion references={references} />

      {/* Sticky Mobile Bar */}
      <StickyMobileAction
        scoreBadge={`EFW: ${efwResult.efwGrams}g`}
        categoryLabel={`${efwResult.percentile}th % (${efwResult.growthCategory})`}
        noteText={combinedNote}
        severityColor={efwResult.growthCategory === 'AGA (Normal)' ? 'emerald' : efwResult.growthCategory.includes('SGA') ? 'amber' : 'rose'}
      />
    </div>
  );
};
