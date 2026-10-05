import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Target, RotateCcw } from 'lucide-react';
import { calculateMeldNa2016, calculateChildPugh } from '../../calculators/internalMedicine';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import { useCalculatorPrefill } from '../../context/useCalculatorPrefill';
import { AiPrefillBanner } from '../ui/AiPrefillBanner';

interface LiverMeldChildViewProps {
  patientTag?: string;
}

export const LiverMeldChildView: React.FC<LiverMeldChildViewProps> = ({ patientTag }) => {
  const { prefill, clearPrefill, hasPrefill } = useCalculatorPrefill('liver_meld_child');
  const [activeTab, setActiveTab] = useState<'meld' | 'child'>('meld');

  // MELD-Na inputs
  const [bili, setBili] = useState(prefill?.bili ?? 2.0);
  const [inr, setInr] = useState(prefill?.inr ?? 1.5);
  const [cr, setCr] = useState(prefill?.cr ?? 1.4);
  const [na, setNa] = useState(prefill?.na ?? 132);
  const [dialysis, setDialysis] = useState(prefill?.dialysis ?? false);

  // Child-Pugh inputs
  const [albumin, setAlbumin] = useState(prefill?.albumin ?? 3.0);
  const [ascites, setAscites] = useState<'none' | 'slight_controlled' | 'moderate_refractory'>(
    prefill?.ascites === 'moderate'
      ? 'moderate_refractory'
      : prefill?.ascites === 'slight'
      ? 'slight_controlled'
      : 'slight_controlled'
  );
  const [encephalopathy, setEncephalopathy] = useState<'none' | 'grade_1_2' | 'grade_3_4'>(
    prefill?.enceph === 'grade3_4'
      ? 'grade_3_4'
      : prefill?.enceph === 'grade1_2'
      ? 'grade_1_2'
      : 'none'
  );
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const meldResult = useMemo(
    () =>
      calculateMeldNa2016({
        bilirubinMgDl: bili,
        inr,
        creatinineMgDl: cr,
        sodiumMeqL: na,
        dialysisTwiceInPastWeek: dialysis,
      }),
    [bili, inr, cr, na, dialysis]
  );

  const childResult = useMemo(
    () =>
      calculateChildPugh({
        bilirubinMgDl: bili,
        albuminGDl: albumin,
        inr,
        ascites,
        encephalopathy,
      }),
    [bili, albumin, inr, ascites, encephalopathy]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    if (activeTab === 'meld') {
      return `${prefix}HEPATIC CIRRHOSIS MELD-Na (2016 UNOS) EVALUATION:
- Bilirubin: ${bili} mg/dL | INR: ${inr} | Creatinine: ${cr} mg/dL | Serum Sodium: ${na} mEq/L
- Dialysis >= 2x in past 7 days: ${dialysis ? 'Yes (Cr fixed at 4.0)' : 'No'}
- Initial MELD Score: ${meldResult.meldInitial}
- MELD-Na Score (UNOS Standard): ${meldResult.meldNa} (Estimated 90-day waitlist mortality: ${meldResult.estimated90DayMortalityPercent}%)
- Clinical Interpretation: ${meldResult.clinicalInterpretation}`;
    }
    return `${prefix}HEPATIC CIRRHOSIS CHILD-PUGH CLASSIFICATION:
- Total Score: ${childResult.score}/15 (Class ${childResult.childClass})
  * Bilirubin: ${bili} mg/dL | Albumin: ${albumin} g/dL | INR: ${inr}
  * Ascites: ${ascites.replace('_', ' ')} | Encephalopathy: ${encephalopathy.replace('_', ' ')}
- 1-Year Survival: ${childResult.oneYearSurvivalPercent}% | 2-Year Survival: ${childResult.twoYearSurvivalPercent}%
- Perioperative Surgical Risk: ${childResult.surgicalRisk}`;
  }, [patientTag, activeTab, bili, inr, cr, na, dialysis, meldResult, albumin, ascites, encephalopathy, childResult]);

  const resetMeld = () => {
    setBili(2.0);
    setInr(1.5);
    setCr(1.4);
    setNa(132);
    setDialysis(false);
    clearPrefill();
  };

  const resetChild = () => {
    setBili(2.0);
    setAlbumin(3.0);
    setInr(1.5);
    setAscites('slight_controlled');
    setEncephalopathy('none');
    clearPrefill();
  };

  const references = [
    {
      source: 'Kim et al. (NEJM 2008) / UNOS 2016 Policy',
      title: 'Hyponatremia and Mortality among Patients on the Liver-Transplant Waiting List',
      details: 'Standardizes organ allocation in end-stage liver disease by integrating hyponatremia into traditional MELD.',
    },
    {
      source: 'Pugh et al. (Br J Surg 1973)',
      title: 'Transection of the Oesophagus for Bleeding Oesophageal Varices',
      details: 'Widely used prognostic scoring tool for surgical risk and chronic liver disease prognosis (Child-Pugh Class A, B, C).',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                MELD-Na 2016 & Child-Pugh Suite
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300">
                UNOS / AASLD
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              End-stage liver disease severity, transplant waitlist prioritization & perioperative risk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="liver_meld_child" showLabel />
          <button
            type="button"
            onClick={activeTab === 'meld' ? resetMeld : resetChild}
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
          onReset={activeTab === 'meld' ? resetMeld : resetChild}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      {/* Tabs: Responsive 2-Column Grid */}
      <div className="grid grid-cols-2 border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl mb-6 gap-1.5 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('meld')}
          className={`w-full py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer truncate text-center tap-bounce active:scale-95 ${
            activeTab === 'meld'
              ? 'bg-white dark:bg-slate-800 text-orange-800 dark:text-orange-300 shadow-xs ring-1 ring-orange-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          MELD-Na 2016
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('child')}
          className={`w-full py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer truncate text-center tap-bounce active:scale-95 ${
            activeTab === 'child'
              ? 'bg-white dark:bg-slate-800 text-orange-800 dark:text-orange-300 shadow-xs ring-1 ring-orange-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Child-Pugh Class
        </button>
      </div>

      {activeTab === 'meld' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <NumberStepper
              label="Total Bilirubin"
              unit="mg/dL"
              value={bili}
              min={0.2}
              max={50}
              step={0.1}
              isFloat
              onChange={setBili}
              helperText="Min bounded to 1.0"
            />
            <NumberStepper
              label="INR"
              value={inr}
              min={0.8}
              max={15.0}
              step={0.1}
              isFloat
              onChange={setInr}
              helperText="Min bounded to 1.0"
            />
            <NumberStepper
              label="Serum Creatinine"
              unit="mg/dL"
              value={cr}
              min={0.4}
              max={15.0}
              step={0.1}
              isFloat
              onChange={setCr}
              helperText="Capped 1.0 - 4.0 mg/dL"
            />
            <NumberStepper
              label="Serum Sodium"
              unit="mEq/L"
              value={na}
              min={110}
              max={160}
              step={1}
              onChange={setNa}
              helperText="Bounded 125 - 137 mEq/L"
            />
          </div>

          {/* Dialysis Checkbox */}
          <button
            type="button"
            onClick={() => setDialysis(!dialysis)}
            className={`w-full p-3 rounded-xl text-left border flex items-center justify-between text-xs transition-all ${
              dialysis
                ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-400 text-orange-950 dark:text-orange-200 font-bold'
                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>Dialysis &gt;= 2 times in the past 7 days (or 24h of CVVHD)</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dialysis ? 'bg-orange-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'}`}>
              {dialysis ? 'Yes (Cr locked at 4.0)' : 'No'}
            </span>
          </button>

          {/* MELD Result Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50/40 dark:from-orange-950/40 dark:to-amber-950/20 border border-orange-200/80 dark:border-orange-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-900 dark:text-orange-300">
                UNOS 2016 Standardized MELD-Na
              </span>
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-orange-700 text-white">
                90-Day Mortality: {meldResult.estimated90DayMortalityPercent}%
              </span>
            </div>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                {meldResult.meldNa}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                (Base MELD: {meldResult.meldInitial})
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {meldResult.clinicalInterpretation}
            </p>
          </div>
        </div>
      ) : (
        /* Child-Pugh Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <NumberStepper
              label="Total Bilirubin"
              unit="mg/dL"
              value={bili}
              min={0.2}
              max={30}
              step={0.1}
              isFloat
              onChange={setBili}
              helperText="<2 (1), 2-3 (2), >3 (3)"
            />
            <NumberStepper
              label="Serum Albumin"
              unit="g/dL"
              value={albumin}
              min={1.0}
              max={6.0}
              step={0.1}
              isFloat
              onChange={setAlbumin}
              helperText=">3.5 (1), 2.8-3.5 (2), <2.8 (3)"
            />
            <NumberStepper
              label="INR"
              value={inr}
              min={0.8}
              max={10.0}
              step={0.1}
              isFloat
              onChange={setInr}
              helperText="<1.7 (1), 1.7-2.2 (2), >2.2 (3)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ascites */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ascites
              </label>
              <div className="space-y-1">
                {[
                  { id: 'none', label: 'None (1 pt)' },
                  { id: 'slight_controlled', label: 'Slight / Medically Controlled (2 pts)' },
                  { id: 'moderate_refractory', label: 'Moderate / Refractory (3 pts)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAscites(opt.id as typeof ascites)}
                    className={`w-full p-2 text-left text-xs rounded-xl border transition-all ${
                      ascites === opt.id
                        ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-400 text-orange-950 dark:text-orange-200 font-bold'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Encephalopathy */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Hepatic Encephalopathy
              </label>
              <div className="space-y-1">
                {[
                  { id: 'none', label: 'None (1 pt)' },
                  { id: 'grade_1_2', label: 'Grade 1 - 2 (altered sleep/confusion) (2 pts)' },
                  { id: 'grade_3_4', label: 'Grade 3 - 4 (somnolence/coma) (3 pts)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEncephalopathy(opt.id as typeof encephalopathy)}
                    className={`w-full p-2 text-left text-xs rounded-xl border transition-all ${
                      encephalopathy === opt.id
                        ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-400 text-orange-950 dark:text-orange-200 font-bold'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Child-Pugh Result */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Child-Pugh Classification
              </span>
              <span className="text-sm font-black px-3 py-1 rounded-lg bg-orange-700 text-white">
                Class {childResult.childClass} ({childResult.score} pts)
              </span>
            </div>
            <div className="flex gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <div>1-Year Survival: <span className="font-bold text-orange-700 dark:text-orange-400">{childResult.oneYearSurvivalPercent}%</span></div>
              <div>2-Year Survival: <span className="font-bold text-orange-700 dark:text-orange-400">{childResult.twoYearSurvivalPercent}%</span></div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {childResult.surgicalRisk}
            </p>
          </div>
        </div>
      )}

      {/* EHR Note */}
      <div className="my-6">
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
        scoreBadge={activeTab === 'meld' ? `MELD-Na: ${meldResult.meldNa}` : `Child-Pugh: Class ${childResult.childClass}`}
        categoryLabel={activeTab === 'meld' ? `${meldResult.estimated90DayMortalityPercent}% 90d mortality` : `${childResult.score} pts`}
        noteText={clinicalNote}
        severityColor={
          (activeTab === 'meld' && meldResult.meldNa >= 20) || (activeTab === 'child' && childResult.childClass === 'C')
            ? 'rose'
            : (activeTab === 'meld' && meldResult.meldNa >= 15) || (activeTab === 'child' && childResult.childClass === 'B')
            ? 'amber'
            : 'teal'
        }
      />
    </div>
  );
};
