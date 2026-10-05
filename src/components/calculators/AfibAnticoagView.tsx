import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { HeartPulse, RotateCcw } from 'lucide-react';
import { calculateCha2ds2Vasc, calculateHasBled } from '../../calculators/internalMedicine';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface AfibAnticoagViewProps {
  patientTag?: string;
}

export const AfibAnticoagView: React.FC<AfibAnticoagViewProps> = ({ patientTag }) => {
  const [sex, setSex] = useState<'female' | 'male'>('male');
  const [age, setAge] = useState(72);
  const [chf, setChf] = useState(false);
  const [htn, setHtn] = useState(true);
  const [dm, setDm] = useState(false);
  const [strokeTia, setStrokeTia] = useState(false);
  const [vascDis, setVascDis] = useState(false);

  // HAS-BLED items
  const [sbpOver160, setSbpOver160] = useState(false);
  const [renalDysfunction, setRenalDysfunction] = useState(false);
  const [liverDysfunction, setLiverDysfunction] = useState(false);
  const [priorBleed, setPriorBleed] = useState(false);
  const [labileInr, setLabileInr] = useState(false);
  const [antiplateletNsaid, setAntiplateletNsaid] = useState(false);
  const [alcoholExcess, setAlcoholExcess] = useState(false);

  const chadsResult = useMemo(
    () =>
      calculateCha2ds2Vasc({
        congestiveHeartFailure: chf,
        hypertension: htn,
        ageYears: age,
        diabetes: dm,
        priorStrokeTiaThromboembolism: strokeTia,
        vascularDisease: vascDis,
        sex,
      }),
    [chf, htn, age, dm, strokeTia, vascDis, sex]
  );

  const hasbledResult = useMemo(
    () =>
      calculateHasBled({
        hypertensionSbpOver160: sbpOver160,
        abnormalRenalFunction: renalDysfunction,
        abnormalLiverFunction: liverDysfunction,
        priorStroke: strokeTia,
        bleedingHistoryOrPredisposition: priorBleed,
        labileInrs: labileInr,
        elderlyAgeOver65: age >= 65,
        drugsAntiplateletsNsaids: antiplateletNsaid,
        alcoholExcess,
      }),
    [sbpOver160, renalDysfunction, liverDysfunction, strokeTia, priorBleed, labileInr, age, antiplateletNsaid, alcoholExcess]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}ATRIAL FIBRILLATION STROKE & BLEEDING RISK STRATIFICATION:
- CHA2DS2-VASc Score: ${chadsResult.score} (${chadsResult.annualStrokeRiskPercent}% annual ischemic stroke risk)
  * CHF: ${chf ? 'Yes' : 'No'} | HTN: ${htn ? 'Yes' : 'No'} | Age: ${age} yo | DM: ${dm ? 'Yes' : 'No'} | Prior Stroke/TIA: ${strokeTia ? 'Yes' : 'No'} | Vasc Disease: ${vascDis ? 'Yes' : 'No'} | Sex: ${sex}
- Anticoagulation Recommendation: ${chadsResult.guidelineRecommendation}
- HAS-BLED Score: ${hasbledResult.score} (${hasbledResult.riskCategory} bleeding risk, ${hasbledResult.annualBleedRiskPercent}%/yr)
- Bleeding Assessment: ${hasbledResult.clinicalAction}`;
  }, [patientTag, chadsResult, chf, htn, age, dm, strokeTia, vascDis, sex, hasbledResult]);

  const resetDefaults = () => {
    setSex('male');
    setAge(72);
    setChf(false);
    setHtn(true);
    setDm(false);
    setStrokeTia(false);
    setVascDis(false);
    setSbpOver160(false);
    setRenalDysfunction(false);
    setLiverDysfunction(false);
    setPriorBleed(false);
    setLabileInr(false);
    setAntiplateletNsaid(false);
    setAlcoholExcess(false);
  };

  const references = [
    {
      source: 'AHA/ACC/HRS Guideline (Circulation 2024)',
      title: 'Guideline for the Diagnosis and Management of Atrial Fibrillation',
      details: 'Recommends DOACs (apixaban, rivaroxaban, dabigatran, edoxaban) over warfarin in eligible nonvalvular AF patients with CHA2DS2-VASc >= 2 in men or >= 3 in women.',
    },
    {
      source: 'Pisters et al. (Chest 2010)',
      title: 'A Novel User-Friendly Score (HAS-BLED) to Assess 1-Year Risk of Major Bleeding',
      details: 'HAS-BLED >= 3 indicates caution and corrective action for modifiable risks, not automatic withholding of anticoagulation.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                CHA₂DS₂-VASc & HAS-BLED Suite
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 shrink-0">
                AHA/ACC 2024
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Atrial fibrillation stroke risk stratification, oral anticoagulation (DOAC) & bleeding safety
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="afib_anticoag" showLabel />
          <button
            type="button"
            onClick={resetDefaults}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <CopyNoteButton textToCopy={clinicalNote} />
        </div>
      </div>

      {/* Demographics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Biological Sex (Sc Factor)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSex('female')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                sex === 'female'
                  ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Female (+1)
            </button>
            <button
              type="button"
              onClick={() => setSex('male')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                sex === 'male'
                  ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Male (0)
            </button>
          </div>
        </div>

        <NumberStepper
          label="Age (A & A2 Criteria)"
          unit="years"
          value={age}
          min={18}
          max={110}
          step={1}
          onChange={setAge}
          helperText=">=75: +2 pts | 65-74: +1 pt"
        />
      </div>

      {/* Two Columns: CHA2DS2-VASc vs HAS-BLED Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: CHA2DS2-VASc */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              1. CHA₂DS₂-VASc Risk Criteria
            </span>
            <span className="text-xs font-black text-rose-700 dark:text-rose-400">
              Score: {chadsResult.score}
            </span>
          </div>

          {[
            { label: 'Congestive Heart Failure / LVEF <= 40% (C)', state: chf, set: setChf, pts: 1 },
            { label: 'Hypertension history or current Rx (H)', state: htn, set: setHtn, pts: 1 },
            { label: 'Diabetes Mellitus on oral/insulin Rx (D)', state: dm, set: setDm, pts: 1 },
            { label: 'Prior Stroke, TIA, or Thromboembolism (S2)', state: strokeTia, set: setStrokeTia, pts: 2 },
            { label: 'Vascular Disease (prior MI, PAD, aortic plaque) (V)', state: vascDis, set: setVascDis, pts: 1 },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => item.set(!item.state)}
              className={`w-full p-2.5 rounded-xl text-left text-xs font-medium border flex items-center justify-between transition-all ${
                item.state
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-950 dark:text-rose-200 font-bold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{item.label}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.state ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                +{item.pts} pt{item.pts > 1 ? 's' : ''}
              </span>
            </button>
          ))}
        </div>

        {/* Right: HAS-BLED */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              2. HAS-BLED Bleeding Criteria
            </span>
            <span className="text-xs font-black text-amber-700 dark:text-amber-400">
              Score: {hasbledResult.score} ({hasbledResult.riskCategory})
            </span>
          </div>

          {[
            { label: 'Uncontrolled Hypertension (SBP > 160 mmHg) (H)', state: sbpOver160, set: setSbpOver160 },
            { label: 'Abnormal Renal Function (dialysis, transplant, Cr > 2.26) (A)', state: renalDysfunction, set: setRenalDysfunction },
            { label: 'Abnormal Liver Function (cirrhosis, bili > 2x, AST/ALT > 3x) (A)', state: liverDysfunction, set: setLiverDysfunction },
            { label: 'Bleeding History or Predisposition (anemia, major bleed) (B)', state: priorBleed, set: setPriorBleed },
            { label: 'Labile INRs (TTR < 60% if on warfarin) (L)', state: labileInr, set: setLabileInr },
            { label: 'Drugs predisposing to bleeding (Antiplatelet, NSAID) (D)', state: antiplateletNsaid, set: setAntiplateletNsaid },
            { label: 'Alcohol Excess (>= 8 drinks/week) (D)', state: alcoholExcess, set: setAlcoholExcess },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => item.set(!item.state)}
              className={`w-full p-2.5 rounded-xl text-left text-xs font-medium border flex items-center justify-between transition-all ${
                item.state
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-950 dark:text-amber-200 font-bold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{item.label}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.state ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                +1 pt
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Decision Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Anticoagulation Decision */}
        <div className={`p-4 rounded-2xl border ${
          chadsResult.recommendationLevel === 'recommended'
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
            : chadsResult.recommendationLevel === 'consider'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Ischemic Stroke Risk
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded bg-white dark:bg-slate-900 shadow-2xs">
              {chadsResult.annualStrokeRiskPercent}% / yr
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium mb-3">
            {chadsResult.guidelineRecommendation}
          </p>
        </div>

        {/* Bleeding Safety */}
        <div className={`p-4 rounded-2xl border ${
          hasbledResult.riskCategory === 'High'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              HAS-BLED Risk Action
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded bg-white dark:bg-slate-900 shadow-2xs">
              {hasbledResult.annualBleedRiskPercent}% / yr
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            {hasbledResult.clinicalAction}
          </p>
        </div>
      </div>

      {/* EHR Note Box */}
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
        scoreBadge={`CHA2DS2-VASc: ${chadsResult.score}`}
        categoryLabel={`HAS-BLED: ${hasbledResult.score} (${hasbledResult.riskCategory})`}
        noteText={clinicalNote}
        severityColor={chadsResult.score >= 2 ? 'rose' : chadsResult.score === 1 ? 'amber' : 'emerald'}
      />
    </div>
  );
};
