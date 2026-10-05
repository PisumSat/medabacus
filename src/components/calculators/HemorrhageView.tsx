import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';
import {
  calculateHemorrhage,
  UTEROTONICS_GUIDE,
  type HemorrhageRiskInput,
  type QblInput,
} from '../../calculators/hemorrhage';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { NumberStepper } from '../ui/NumberStepper';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface HemorrhageViewProps {
  patientTag?: string;
}

const DEFAULT_RISK: HemorrhageRiskInput = {
  multipleGestation: false,
  priorCesareanOrUterineSurgery: true,
  grandMultiparity: false,
  largeFibroids: false,
  chorioamnionitis: false,
  prolongedOxytocin: false,
  bmiOver40: false,
  priorPphHistory: false,
  placentaPreviaOrAccreta: false,
  hematocritLow: false,
  plateletsLow: false,
  activeBleedingAdmission: false,
  knownCoagulopathy: false,
};

export const HemorrhageView: React.FC<HemorrhageViewProps> = ({ patientTag }) => {
  const [subView, setSubView] = useState<'risk' | 'qbl' | 'drugs'>('risk');

  // Risk Factors State
  const [riskInput, setRiskInput] = useState<HemorrhageRiskInput>(DEFAULT_RISK);

  // QBL State
  const [deliveryType, setDeliveryType] = useState<'vaginal' | 'cesarean'>('vaginal');
  const [totalWetGrams, setTotalWetGrams] = useState<number>(1150);
  const [totalDryGrams, setTotalDryGrams] = useState<number>(350);
  const [suctionMl, setSuctionMl] = useState<number>(200);
  const [amnioticIrrigationMl, setAmnioticIrrigationMl] = useState<number>(100);

  const resetDefaults = () => {
    setRiskInput(DEFAULT_RISK);
    setTotalWetGrams(1150);
    setTotalDryGrams(350);
    setSuctionMl(200);
    setAmnioticIrrigationMl(100);
  };

  const qblInput: QblInput = useMemo(
    () => ({
      totalWetWeightGrams: totalWetGrams,
      totalDryWeightGrams: totalDryGrams,
      suctionVolumeMl: suctionMl,
      amnioticFluidAndIrrigationMl: amnioticIrrigationMl,
      deliveryType,
    }),
    [totalWetGrams, totalDryGrams, suctionMl, amnioticIrrigationMl, deliveryType]
  );

  const result = useMemo(
    () => calculateHemorrhage(riskInput, subView === 'qbl' ? qblInput : undefined),
    [riskInput, subView, qblInput]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}${result.noteSnippet}`;
  }, [result, patientTag]);

  const references = [
    {
      source: 'CMQCC',
      title: 'Obstetric Hemorrhage Clinical Toolkit (Version 3.0)',
      details: 'Demonstrates significant reduction in maternal morbidity with standardized admission risk stratification and gravimetric quantitative blood loss (QBL).',
    },
    {
      source: 'ACOG',
      title: 'Practice Bulletin No. 183: Postpartum Hemorrhage (Reaffirmed 2023)',
      details: 'Defines PPH as cumulative blood loss >= 1,000 mL or blood loss with signs of hypovolemia within 24 hours regardless of delivery route.',
    },
    {
      source: 'The WOMAN Trial Collaborators',
      title: 'Effect of Early Tranexamic Acid on Maternal Mortality (Lancet 2017)',
      details: 'Tranexamic acid (1g IV) reduces death due to bleeding when given within 3 hours of birth without increasing thromboembolic events.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Postpartum Hemorrhage & QBL
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300">
                CMQCC & ACOG PB 183
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Admission risk stratification, gravimetric blood loss & uterotonic protocols
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="hemorrhage" showLabel />
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

      {/* Sub Navigation */}
      <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl mb-5">
        <button
          type="button"
          onClick={() => setSubView('risk')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            subView === 'risk'
              ? 'bg-white dark:bg-slate-800 text-rose-900 dark:text-rose-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          1. Hemorrhage Risk
        </button>
        <button
          type="button"
          onClick={() => setSubView('qbl')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            subView === 'qbl'
              ? 'bg-white dark:bg-slate-800 text-rose-900 dark:text-rose-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          2. Gravimetric QBL
        </button>
        <button
          type="button"
          onClick={() => setSubView('drugs')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            subView === 'drugs'
              ? 'bg-white dark:bg-slate-800 text-rose-900 dark:text-rose-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          3. Uterotonics
        </button>
      </div>

      {/* VIEW 1: Risk Assessment */}
      {subView === 'risk' && (
        <div className="space-y-4 mb-6">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Select patient risk factors present on admission or intrapartum:
          </div>

          {/* High Risk Category */}
          <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900">
            <span className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider block mb-2">
              High Risk Indicators (Type & Crossmatch 2-4u Required)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'previa', label: 'Placenta Previa / Low-Lying / PAS', key: 'placentaPreviaOrAccreta' },
                { id: 'bleed', label: 'Active Vaginal Bleeding on Admission', key: 'activeBleedingAdmission' },
                { id: 'coag', label: 'Known Coagulopathy / Anticoagulation', key: 'knownCoagulopathy' },
                { id: 'anemia', label: 'Severe Anemia (Hb < 10 g/dL / Hct < 30%)', key: 'hematocritLow' },
                { id: 'plt', label: 'Platelet Count < 100,000 / uL', key: 'plateletsLow' },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(riskInput[item.key as keyof HemorrhageRiskInput])}
                    onChange={(e) => setRiskInput({ ...riskInput, [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 border-slate-300 dark:border-slate-600"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Medium Risk Category */}
          <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block mb-2">
              Medium Risk Indicators (Type & Screen Active)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'cs', label: 'Prior Cesarean or Uterine Surgery', key: 'priorCesareanOrUterineSurgery' },
                { id: 'mult', label: 'Multiple Gestation', key: 'multipleGestation' },
                { id: 'multi', label: 'Grand Multiparity (> 4 births)', key: 'grandMultiparity' },
                { id: 'hist', label: 'History of Postpartum Hemorrhage', key: 'priorPphHistory' },
                { id: 'fib', label: 'Large Uterine Fibroids (> 4 cm)', key: 'largeFibroids' },
                { id: 'inf', label: 'Chorioamnionitis / Infection', key: 'chorioamnionitis' },
                { id: 'oxy', label: 'Prolonged Oxytocin (> 24 hrs)', key: 'prolongedOxytocin' },
                { id: 'bmi', label: 'Morbid Obesity (BMI > 40)', key: 'bmiOver40' },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(riskInput[item.key as keyof HemorrhageRiskInput])}
                    onChange={(e) => setRiskInput({ ...riskInput, [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 border-slate-300 dark:border-slate-600"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Risk Level Result Banner */}
          <div
            className={`p-4 rounded-xl border text-xs leading-relaxed ${
              result.riskLevel === 'High Risk'
                ? 'bg-rose-900 text-white border-rose-950'
                : result.riskLevel === 'Medium Risk'
                  ? 'bg-amber-900 text-white border-amber-950'
                  : 'bg-emerald-900 text-white border-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <span className="font-bold uppercase tracking-wider">
                Risk Classification: {result.riskLevel}
              </span>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-white">Recommended Ward Preparation:</div>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-200">
                {result.preparednessActions.map((action, idx) => (
                  <li key={idx}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Gravimetric QBL with Steppers */}
      {subView === 'qbl' && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl">
            <button
              type="button"
              onClick={() => setDeliveryType('vaginal')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                deliveryType === 'vaginal'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Vaginal Delivery
            </button>
            <button
              type="button"
              onClick={() => setDeliveryType('cesarean')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                deliveryType === 'cesarean'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Cesarean Delivery
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <NumberStepper
              label="Wet Weight"
              unit="g"
              value={totalWetGrams}
              onChange={setTotalWetGrams}
              min={0}
              max={15000}
              step={50}
              helperText="Pads + sponges"
            />
            <NumberStepper
              label="Dry Weight"
              unit="g"
              value={totalDryGrams}
              onChange={setTotalDryGrams}
              min={0}
              max={5000}
              step={50}
              helperText="Dry supply baseline"
            />
            <NumberStepper
              label="Suction"
              unit="mL"
              value={suctionMl}
              onChange={setSuctionMl}
              min={0}
              max={10000}
              step={50}
              helperText="Canister total"
            />
            <NumberStepper
              label="Amniotic/Irrig"
              unit="mL"
              value={amnioticIrrigationMl}
              onChange={setAmnioticIrrigationMl}
              min={0}
              max={5000}
              step={50}
              helperText="Subtracted fluid"
            />
          </div>

          {/* QBL Calculation Result */}
          {result.qblResult && (
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                    Quantitative Blood Loss (1g = 1mL)
                  </span>
                  <div className="text-3xl font-black tracking-tight mt-1 flex items-baseline gap-2">
                    <span>{result.qblResult.netBloodLossMl.toLocaleString()}</span>
                    <span className="text-lg font-medium text-rose-200">mL</span>
                  </div>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${
                    result.qblResult.pphStage === 'Normal'
                      ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400/30'
                      : result.qblResult.pphStage.includes('Stage 1')
                        ? 'bg-amber-500/30 text-amber-300 border-amber-400/30'
                        : 'bg-rose-500/30 text-rose-300 border-rose-400/30 animate-pulse'
                  }`}
                >
                  {result.qblResult.pphStage}
                </div>
              </div>

              <div className="mt-3.5 space-y-2 text-xs leading-relaxed text-slate-200">
                <p className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="font-bold text-white block mb-0.5">Stage Clinical Protocol:</span>
                  {result.qblResult.stageGuidance}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Uterotonics Guide */}
      {subView === 'drugs' && (
        <div className="space-y-3 mb-6">
          {UTEROTONICS_GUIDE.map((u, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm text-rose-900 dark:text-rose-400">{u.drug}</span>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{u.route}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px]">Dose & Regimen:</span>
                  <span className="text-slate-800 dark:text-slate-200">{u.dose}</span>
                </div>
                <div>
                  <span className="font-bold text-rose-700 dark:text-rose-400 block text-[11px]">Contraindications:</span>
                  <span className="text-rose-900 dark:text-rose-300 font-semibold">{u.contraindications}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReferenceAccordion references={references} />

      {/* Sticky Mobile Bar */}
      <StickyMobileAction
        scoreBadge={subView === 'qbl' && result.qblResult ? `QBL: ${result.qblResult.netBloodLossMl} mL` : `PPH: ${result.riskLevel}`}
        categoryLabel={subView === 'qbl' && result.qblResult ? result.qblResult.pphStage : 'Admission Risk'}
        noteText={clinicalNote}
        severityColor={result.riskLevel === 'High Risk' ? 'rose' : result.riskLevel === 'Medium Risk' ? 'amber' : 'emerald'}
      />
    </div>
  );
};
