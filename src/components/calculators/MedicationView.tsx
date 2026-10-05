import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Pill, AlertOctagon, RotateCcw } from 'lucide-react';
import {
  calculateRhogamDose,
  calculateGanzoniIron,
  getMagnesiumProtocol,
  type MagnesiumProtocol,
} from '../../calculators/medications';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { NumberStepper } from '../ui/NumberStepper';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface MedicationViewProps {
  patientTag?: string;
}

const DEFAULT_RHOGAM_FETAL_CELLS = 1.4;
const DEFAULT_WEIGHT_KG = 68;
const DEFAULT_ACTUAL_HB = 8.5;
const DEFAULT_TARGET_HB = 11.0;
const DEFAULT_MAG_INDICATION: MagnesiumProtocol['indication'] = 'Preeclampsia with Severe Features';

export const MedicationView: React.FC<MedicationViewProps> = ({ patientTag }) => {
  const [activeTab, setActiveTab] = useState<'rhogam' | 'iron' | 'magnesium'>('rhogam');

  // RhoGAM State
  const [fetalCells, setFetalCells] = useState<number>(DEFAULT_RHOGAM_FETAL_CELLS);
  const rhogamResult = useMemo(() => calculateRhogamDose({ fetalCellsPercent: fetalCells }), [fetalCells]);

  // Ganzoni State
  const [weightKg, setWeightKg] = useState<number>(DEFAULT_WEIGHT_KG);
  const [actualHb, setActualHb] = useState<number>(DEFAULT_ACTUAL_HB);
  const [targetHb, setTargetHb] = useState<number>(DEFAULT_TARGET_HB);
  const ironResult = useMemo(
    () => calculateGanzoniIron({ weightKg, actualHb, targetHb }),
    [weightKg, actualHb, targetHb]
  );

  // Magnesium State
  const [magIndication, setMagIndication] =
    useState<MagnesiumProtocol['indication']>(DEFAULT_MAG_INDICATION);
  const magProtocol = useMemo(() => getMagnesiumProtocol(magIndication), [magIndication]);

  const resetDefaults = () => {
    if (activeTab === 'rhogam') {
      setFetalCells(DEFAULT_RHOGAM_FETAL_CELLS);
    } else if (activeTab === 'iron') {
      setWeightKg(DEFAULT_WEIGHT_KG);
      setActualHb(DEFAULT_ACTUAL_HB);
      setTargetHb(DEFAULT_TARGET_HB);
    } else {
      setMagIndication(DEFAULT_MAG_INDICATION);
    }
  };

  const currentNoteSnippet =
    activeTab === 'rhogam'
      ? rhogamResult.noteSnippet
      : activeTab === 'iron'
        ? ironResult.noteSnippet
        : `MAGNESIUM SULFATE PROTOCOL:
- Indication: ${magProtocol.indication}
- Loading: ${magProtocol.loadingDose}
- Maintenance: ${magProtocol.maintenanceRate}
- Renal Note: ${magProtocol.renalAdjustment}
- Antidote: ${magProtocol.toxicityMonitoring.antidote}`;

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}${currentNoteSnippet}`;
  }, [currentNoteSnippet, patientTag]);

  const references = [
    {
      source: 'ACOG',
      title: 'Practice Bulletin No. 181: Prevention of Rh D Alloimmunization (Reaffirmed 2021)',
      details: 'One 300 mcg dose of Rh D immune globulin prevents alloimmunization after exposure up to 30 mL of fetal whole blood (15 mL fetal RBCs). Extra safety vial is routinely added.',
    },
    {
      source: 'ACOG',
      title: 'Practice Bulletin No. 222 & Clinical Consensus No. 1: Magnesium Sulfate Infusion Protocols',
      details: 'Standard loading dose 4-6g IV with maintenance 1-2g/hr for maternal seizure prevention and fetal neuroprotection under 32 weeks.',
    },
    {
      source: 'ACOG',
      title: 'Practice Bulletin No. 233: Anemia in Pregnancy',
      details: 'Intravenous iron indicated for moderate to severe iron deficiency anemia in the late 2nd or 3rd trimester or when oral iron is poorly tolerated or ineffective.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
            <Pill className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Ward Dosing & Emergency Pharmacology
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                ACOG Guidelines
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Anti-D (RhoGAM) KB dosing, Ganzoni IV iron deficit & Magnesium sulfate
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarButton toolId="dosing" showLabel />
          <button
            type="button"
            onClick={resetDefaults}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Reset active tab to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <CopyNoteButton textToCopy={clinicalNote} />
        </div>
      </div>

      {/* Tabs: Responsive 3-Column Grid */}
      <div className="grid grid-cols-3 border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl gap-1.5 mb-5 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('rhogam')}
          className={`w-full py-2 px-2 text-xs font-bold rounded-xl transition-all truncate text-center cursor-pointer tap-bounce active:scale-95 ${
            activeTab === 'rhogam'
              ? 'bg-white dark:bg-slate-800 text-indigo-900 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          RhoGAM
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('iron')}
          className={`w-full py-2 px-2 text-xs font-bold rounded-xl transition-all truncate text-center cursor-pointer tap-bounce active:scale-95 ${
            activeTab === 'iron'
              ? 'bg-white dark:bg-slate-800 text-indigo-900 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          IV Iron
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('magnesium')}
          className={`w-full py-2 px-2 text-xs font-bold rounded-xl transition-all truncate text-center cursor-pointer tap-bounce active:scale-95 ${
            activeTab === 'magnesium'
              ? 'bg-white dark:bg-slate-800 text-indigo-900 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          MgSO₄
        </button>
      </div>

      {/* TAB 1: RhoGAM */}
      {activeTab === 'rhogam' && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <NumberStepper
                label="Kleihauer-Betke (KB) Fetal Cells"
                value={fetalCells}
                onChange={setFetalCells}
                min={0.1}
                max={25}
                step={0.1}
                isFloat
                unit="% fetal RBCs"
                helperText="Percentage of fetal RBCs identified in maternal circulation"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200">Calculation Constants:</div>
              <div className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                • Fetal whole blood (mL) = % fetal cells × 50<br />
                • Standard dose: 300 mcg covers 30 mL fetal whole blood<br />
                • ACOG Rule: Divide by 30, round up + add 1 safety vial
              </div>
            </div>
          </div>

          {/* RhoGAM Result */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Required Anti-D Immune Globulin Dose
                </span>
                <div className="text-3xl font-black tracking-tight mt-1 flex items-baseline gap-2">
                  <span>{rhogamResult.vialsRequired}</span>
                  <span className="text-lg font-medium text-indigo-200">vials (300 mcg each)</span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Total dose: <span className="font-semibold text-white">{rhogamResult.totalMicrograms} mcg</span> ({rhogamResult.vialsRequired * 1500} IU)
                </div>
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/15 text-xs text-slate-200">
                <span className="text-slate-400 block text-[10px]">Calculated Fetal Whole Blood:</span>
                <span className="text-base font-bold text-white">{rhogamResult.fetalBloodVolumeMl} mL</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-200 leading-relaxed p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="font-bold text-white block mb-0.5">Administration Directive:</span>
              {rhogamResult.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Ganzoni IV Iron */}
      {activeTab === 'iron' && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <NumberStepper
              label="Patient Weight"
              value={weightKg}
              onChange={setWeightKg}
              min={35}
              max={180}
              step={1}
              unit="kg"
            />

            <NumberStepper
              label="Actual Hemoglobin"
              value={actualHb}
              onChange={setActualHb}
              min={4.0}
              max={16.0}
              step={0.1}
              isFloat
              unit="g/dL"
            />

            <NumberStepper
              label="Target Hemoglobin"
              value={targetHb}
              onChange={setTargetHb}
              min={10.0}
              max={14.0}
              step={0.1}
              isFloat
              unit="g/dL"
            />
          </div>

          {/* Iron Deficit Banner */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Total Elemental Iron Deficit (Ganzoni)
                </span>
                <div className="text-3xl font-black tracking-tight mt-1 flex items-baseline gap-2">
                  <span>{ironResult.totalIronDeficitMg.toLocaleString()}</span>
                  <span className="text-lg font-medium text-indigo-200">mg elemental iron</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Includes 500 mg depot storage replenishment
                </div>
              </div>
            </div>

            {/* Infusion suggestions */}
            <div className="mt-4 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Recommended IV Formulations:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {ironResult.infusionSuggestions.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
                    <div className="font-bold text-white">{item.formulation}</div>
                    <div className="text-slate-300 text-[11px] mt-1">{item.dosingStrategy}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Magnesium Sulfate */}
      {activeTab === 'magnesium' && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Clinical Indication
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(
                [
                  'Preeclampsia with Severe Features',
                  'Fetal Neuroprotection (< 32 wks)',
                  'Active Eclamptic Seizure',
                ] as const
              ).map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => setMagIndication(ind)}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                    magIndication === ind
                      ? 'bg-indigo-700 dark:bg-indigo-600 text-white border-indigo-700 dark:border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* Magnesium Infusion Details */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-md space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-white/10 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Loading Dose:</span>
                <span className="text-sm font-bold text-white">{magProtocol.loadingDose}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Maintenance Rate:</span>
                <span className="text-sm font-bold text-white">{magProtocol.maintenanceRate}</span>
              </div>
            </div>

            <div className="text-xs space-y-2 text-slate-200">
              <div>
                <span className="font-bold text-white block mb-0.5">Duration:</span>
                <p className="text-slate-300">{magProtocol.duration}</p>
              </div>

              <div>
                <span className="font-bold text-white block mb-0.5">Renal Adjustment:</span>
                <p className="text-slate-300">{magProtocol.renalAdjustment}</p>
              </div>

              {/* Toxicity & Antidote Alert */}
              <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-300">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span>MAGNESIUM TOXICITY & ANTIDOTE PROTOCOL</span>
                </div>
                <div className="text-[11px] text-rose-100/90 leading-relaxed">
                  <strong>Therapeutic Level:</strong> {magProtocol.toxicityMonitoring.targetLevel}<br />
                  <strong>Signs:</strong> {magProtocol.toxicityMonitoring.clinicalSigns.join(' • ')}<br />
                  <strong className="text-white">Emergency Antidote:</strong>{' '}
                  <span className="text-rose-200 underline decoration-rose-400 font-semibold">
                    {magProtocol.toxicityMonitoring.antidote}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReferenceAccordion references={references} />

      {/* Sticky Mobile Action for Phone */}
      <StickyMobileAction
        scoreBadge={
          activeTab === 'rhogam'
            ? `Anti-D: ${rhogamResult.vialsRequired} vials`
            : activeTab === 'iron'
              ? `IV Iron: ${ironResult.totalIronDeficitMg} mg`
              : `MgSO4: ${magProtocol.loadingDose.split(' ')[0]}`
        }
        categoryLabel={
          activeTab === 'rhogam'
            ? `${rhogamResult.fetalBloodVolumeMl} mL fetal blood`
            : activeTab === 'iron'
              ? `Hb ${actualHb} → ${targetHb}`
              : magIndication
        }
        noteText={clinicalNote}
        severityColor={
          activeTab === 'rhogam'
            ? rhogamResult.vialsRequired > 2
              ? 'amber'
              : 'indigo'
            : activeTab === 'iron'
              ? ironResult.totalIronDeficitMg > 1000
                ? 'amber'
                : 'indigo'
              : magIndication === 'Active Eclamptic Seizure'
                ? 'rose'
                : 'indigo'
        }
      />
    </div>
  );
};
