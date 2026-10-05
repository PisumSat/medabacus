import React, { useState, useMemo } from 'react';
import { FlaskConical, RotateCcw } from 'lucide-react';
import { StarButton } from '../ui/StarButton';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import {
  calculateFena,
  calculateFeUrea,
  calculateWintersFormula,
  calculateFreeWaterDeficit,
  calculateCorrectedCalcium,
} from '../../calculators/medicineExpanded';

interface RenalAcidBaseSuiteViewProps {
  patientTag?: string;
}

export const RenalAcidBaseSuiteView: React.FC<RenalAcidBaseSuiteViewProps> = ({ patientTag }) => {
  const [activeTab, setActiveTab] = useState<'fena' | 'winters' | 'water' | 'calcium'>('fena');

  // FENa & FEUrea state
  const [uNa, setUNa] = useState(15);
  const [sNa, setSNa] = useState(140);
  const [uCr, setUCr] = useState(120);
  const [sCr, setSCr] = useState(2.2);
  const [uUrea, setUUrea] = useState(320);
  const [bun, setBun] = useState(55);

  // Winter's formula state
  const [hco3, setHco3] = useState(14);
  const [actualPaco2, setActualPaco2] = useState(29);

  // Free Water Deficit state
  const [hyperNa, setHyperNa] = useState(158);
  const [weightKg, setWeightKg] = useState(70);
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [isElderly, setIsElderly] = useState(false);

  // Corrected Calcium state
  const [totalCa, setTotalCa] = useState(7.6);
  const [albumin, setAlbumin] = useState(2.2);

  const fenaResult = useMemo(
    () =>
      calculateFena({
        urinarySodiumMeqL: uNa,
        serumSodiumMeqL: sNa,
        urinaryCreatinineMgDl: uCr,
        serumCreatinineMgDl: sCr,
      }),
    [uNa, sNa, uCr, sCr]
  );

  const feUreaResult = useMemo(
    () =>
      calculateFeUrea({
        urinaryUreaMgDl: uUrea,
        bloodUreaNitrogenMgDl: bun,
        urinaryCreatinineMgDl: uCr,
        serumCreatinineMgDl: sCr,
      }),
    [uUrea, bun, uCr, sCr]
  );

  const wintersResult = useMemo(() => calculateWintersFormula(hco3), [hco3]);

  const fwdResult = useMemo(
    () =>
      calculateFreeWaterDeficit({
        serumSodiumMeqL: hyperNa,
        weightKg,
        sex,
        isElderly,
      }),
    [hyperNa, weightKg, sex, isElderly]
  );

  const corrCaResult = useMemo(() => calculateCorrectedCalcium(totalCa, albumin), [totalCa, albumin]);

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    if (activeTab === 'fena') {
      return `${prefix}FRACTIONAL EXCRETION (AKI ETIOLOGY) EVALUATION:
- FENa: ${fenaResult.fenaPercent}% (${fenaResult.interpretation})
  * Urine Na: ${uNa} mEq/L | Serum Na: ${sNa} mEq/L | Urine Cr: ${uCr} mg/dL | Serum Cr: ${sCr} mg/dL
- FEUrea: ${feUreaResult.feUreaPercent}% (${feUreaResult.interpretation}) [Preferred if on diuretics]
  * Urine Urea: ${uUrea} mg/dL | Serum BUN: ${bun} mg/dL`;
    } else if (activeTab === 'winters') {
      return `${prefix}WINTER'S FORMULA METABOLIC ACIDOSIS EVALUATION:
- HCO3: ${hco3} mEq/L | Measured PaCO2: ${actualPaco2} mmHg
- Expected PaCO2: ${wintersResult.expectedPaco2} mmHg (Range: ${wintersResult.paco2RangeMin} - ${wintersResult.paco2RangeMax} mmHg)
- Compensation Status: ${wintersResult.interpretationForActualPaco2(actualPaco2)}`;
    } else if (activeTab === 'water') {
      return `${prefix}HYPERNATREMIA & FREE WATER DEFICIT:
- Serum Na: ${hyperNa} mEq/L | Weight: ${weightKg} kg (${sex}, ${isElderly ? 'elderly' : 'non-elderly'})
- Calculated Free Water Deficit: ${fwdResult.waterDeficitLiters} Liters
- Guidance: ${fwdResult.recommendation}`;
    } else {
      return `${prefix}CORRECTED CALCIUM IN HYPOALBUMINEMIA:
- Measured Total Calcium: ${totalCa} mg/dL | Serum Albumin: ${albumin} g/dL
- Corrected Calcium: ${corrCaResult.correctedCalciumMgDl} mg/dL
- Classification: ${corrCaResult.status}`;
    }
  }, [
    patientTag,
    activeTab,
    fenaResult,
    uNa,
    sNa,
    uCr,
    sCr,
    feUreaResult,
    uUrea,
    bun,
    hco3,
    actualPaco2,
    wintersResult,
    hyperNa,
    weightKg,
    sex,
    isElderly,
    fwdResult,
    totalCa,
    albumin,
    corrCaResult,
  ]);

  const resetAll = () => {
    setUNa(15);
    setSNa(140);
    setUCr(120);
    setSCr(2.2);
    setUUrea(320);
    setBun(55);
    setHco3(14);
    setActualPaco2(29);
    setWeightKg(70);
    setHyperNa(158);
    setSex('male');
    setIsElderly(false);
    setTotalCa(7.6);
    setAlbumin(2.2);
  };

  const references = [
    {
      source: 'Espinel CH. JAMA 1976',
      title: 'The FENa test. Use in the differential diagnosis of acute renal failure.',
      details: 'JAMA. 1976;236(6):579-581.',
    },
    {
      source: 'Carvounis CP, et al. Kidney Int 2002',
      title: 'Significance of the fractional excretion of urea in the differential diagnosis of acute renal failure.',
      details: 'Kidney Int. 2002;62(6):2223-2229.',
    },
    {
      source: 'Albert MS, et al. Ann Intern Med 1967',
      title: 'Quantitative displacement of acid-base equilibrium in metabolic acidosis (Winter\'s Formula).',
      details: 'Ann Intern Med. 1967;66(2):312-322.',
    },
    {
      source: 'Adrogué HJ, Madias NE. NEJM 2000',
      title: 'Hypernatremia & Free Water Deficit.',
      details: 'N Engl J Med. 2000;342(20):1493-1499.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Nephrology & Fluids Suite</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded-md">
                KDIGO / Acid-Base
              </span>
              <StarButton toolId="renal_fluids_suite" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              FENa, FEUrea, Winter's formula compensation, Free water deficit & Corrected calcium
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <CopyNoteButton textToCopy={clinicalNote} />
        </div>
      </div>

      {/* Tabs: Responsive 2x2 Grid on Mobile, 4-Cols on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl gap-1.5 shadow-2xs">
        {(
          [
            { id: 'fena', label: 'FENa & FEUrea', badge: `${fenaResult.fenaPercent}%` },
            { id: 'winters', label: "Winter's Formula", badge: `Exp ${wintersResult.expectedPaco2}` },
            { id: 'water', label: 'Free Water Deficit', badge: `${fwdResult.waterDeficitLiters} L` },
            { id: 'calcium', label: 'Corrected Calcium', badge: `${corrCaResult.correctedCalciumMgDl} mg/dL` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`w-full py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-1 min-w-0 cursor-pointer tap-bounce active:scale-95 ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-blue-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="truncate">{t.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 font-bold ${
                activeTab === t.id
                  ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: FENa & FEUrea */}
      {activeTab === 'fena' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Urinary & Serum Chemistry
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Urinary Sodium (mEq/L)</label>
                <NumberStepper value={uNa} onChange={setUNa} min={1} max={250} step={1} unit="mEq/L" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Serum Sodium (mEq/L)</label>
                <NumberStepper value={sNa} onChange={setSNa} min={100} max={180} step={1} unit="mEq/L" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Urinary Creatinine (mg/dL)</label>
                <NumberStepper value={uCr} onChange={setUCr} min={5} max={500} step={5} unit="mg/dL" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Serum Creatinine (mg/dL)</label>
                <NumberStepper value={sCr} onChange={setSCr} min={0.2} max={15.0} step={0.1} unit="mg/dL" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Urinary Urea Nitrogen (mg/dL)</label>
                <NumberStepper value={uUrea} onChange={setUUrea} min={20} max={1500} step={20} unit="mg/dL" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Blood Urea Nitrogen (BUN mg/dL)</label>
                <NumberStepper value={bun} onChange={setBun} min={5} max={200} step={2} unit="mg/dL" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200 dark:border-blue-900/60 rounded-xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Fractional Excretion of Na (FENa)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {fenaResult.fenaPercent}%
                <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                  fenaResult.fenaPercent < 1.0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  {fenaResult.etiology}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                {fenaResult.interpretation}
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-200 dark:border-indigo-900/60 rounded-xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Fractional Excretion of Urea (FEUrea)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                {feUreaResult.feUreaPercent}%
                <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                  feUreaResult.isPrerenalWithDiuretics ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  {feUreaResult.isPrerenalWithDiuretics ? 'Prerenal' : 'Intrinsic ATN'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                {feUreaResult.interpretation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Winter's Formula */}
      {activeTab === 'winters' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Metabolic Acidosis Compensation Inputs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Serum Bicarbonate (HCO3 mEq/L)</label>
                <NumberStepper value={hco3} onChange={setHco3} min={2} max={35} step={1} unit="mEq/L" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Measured Arterial PaCO2 (mmHg)</label>
                <NumberStepper value={actualPaco2} onChange={setActualPaco2} min={10} max={80} step={1} unit="mmHg" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200 dark:border-blue-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Winter's Expected PaCO2: 1.5 × [HCO3] + 8 ± 2
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Expected PaCO2: {wintersResult.expectedPaco2} mmHg
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-2">
                ({wintersResult.paco2RangeMin}–{wintersResult.paco2RangeMax} mmHg)
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-medium">
              {wintersResult.interpretationForActualPaco2(actualPaco2)}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Free Water Deficit */}
      {activeTab === 'water' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Hypernatremia Parameters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Serum Na (mEq/L)</label>
                <NumberStepper value={hyperNa} onChange={setHyperNa} min={142} max={190} step={1} unit="mEq/L" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Patient Weight (kg)</label>
                <NumberStepper value={weightKg} onChange={setWeightKg} min={30} max={180} step={1} unit="kg" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSex('male')}
                  className={`flex-1 p-2.5 rounded-lg border font-medium ${sex === 'male' ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800'}`}
                >
                  Male (TBW 60%)
                </button>
                <button
                  onClick={() => setSex('female')}
                  className={`flex-1 p-2.5 rounded-lg border font-medium ${sex === 'female' ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800'}`}
                >
                  Female (TBW 50%)
                </button>
              </div>
              <label className="flex items-center gap-2 cursor-pointer self-center">
                <input
                  type="checkbox"
                  checked={isElderly}
                  onChange={(e) => setIsElderly(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Elderly patient (reduces TBW fraction by 5%)</span>
              </label>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200 dark:border-blue-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Total Body Water: {fwdResult.totalBodyWaterLiters} Liters
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Free Water Deficit: {fwdResult.waterDeficitLiters} L
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {fwdResult.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Corrected Calcium */}
      {activeTab === 'calcium' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Serum Calcium & Albumin
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Measured Total Calcium (mg/dL)</label>
                <NumberStepper value={totalCa} onChange={setTotalCa} min={4.0} max={18.0} step={0.1} unit="mg/dL" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Serum Albumin (g/dL)</label>
                <NumberStepper value={albumin} onChange={setAlbumin} min={1.0} max={5.5} step={0.1} unit="g/dL" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200 dark:border-blue-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Formula: Total Ca + 0.8 × (4.0 - Albumin)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Corrected Ca: {corrCaResult.correctedCalciumMgDl} mg/dL
              <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                corrCaResult.isHypocalcemic ? 'bg-rose-600 text-white' : corrCaResult.isHypercalcemic ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {corrCaResult.status.split('(')[0].trim()}
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              Normal laboratory reference range: 8.5–10.2 mg/dL.
            </div>
          </div>
        </div>
      )}

      {/* References */}
      <ReferenceAccordion references={references} />

      {/* Sticky Mobile Copy Action */}
      <StickyMobileAction scoreBadge={activeTab.toUpperCase()} noteText={clinicalNote} />
    </div>
  );
};
