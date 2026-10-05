import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { ShieldAlert, RotateCcw, CheckCircle2 } from 'lucide-react';
import { calculateWellsPe, evaluatePercRule, calculateWellsDvt } from '../../calculators/internalMedicine';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface VteWellsViewProps {
  patientTag?: string;
}

export const VteWellsView: React.FC<VteWellsViewProps> = ({ patientTag }) => {
  const [activeTab, setActiveTab] = useState<'pe' | 'dvt'>('pe');

  // Wells PE inputs
  const [peDvtSigns, setPeDvtSigns] = useState(false);
  const [peLikelyNoAlt, setPeLikelyNoAlt] = useState(true);
  const [peTachycardia, setPeTachycardia] = useState(false);
  const [peImmobSurgery, setPeImmobSurgery] = useState(false);
  const [pePriorVte, setPePriorVte] = useState(false);
  const [peHemoptysis, setPeHemoptysis] = useState(false);
  const [peCancer, setPeCancer] = useState(false);

  // PERC inputs
  const [percAge50, setPercAge50] = useState(true);
  const [percHr100, setPercHr100] = useState(true);
  const [percSpo2, setPercSpo2] = useState(true);
  const [percNoSwelling, setPercNoSwelling] = useState(true);
  const [percNoHemoptysis, setPercNoHemoptysis] = useState(true);
  const [percNoSurgery, setPercNoSurgery] = useState(true);
  const [percNoPriorVte, setPercNoPriorVte] = useState(true);
  const [percNoHormone, setPercNoHormone] = useState(true);

  // Wells DVT inputs
  const [dvtCancer, setDvtCancer] = useState(false);
  const [dvtParalysis, setDvtParalysis] = useState(false);
  const [dvtBedridden, setDvtBedridden] = useState(false);
  const [dvtTenderness, setDvtTenderness] = useState(true);
  const [dvtEntireLeg, setDvtEntireLeg] = useState(false);
  const [dvtCalf3cm, setDvtCalf3cm] = useState(true);
  const [dvtPitting, setDvtPitting] = useState(true);
  const [dvtVeins, setDvtVeins] = useState(false);
  const [dvtAltDiagnosis, setDvtAltDiagnosis] = useState(false);

  const wellsPeResult = useMemo(
    () =>
      calculateWellsPe({
        dvtClinicalSigns: peDvtSigns,
        peLikelyOrNumberOne: peLikelyNoAlt,
        heartRateOver100: peTachycardia,
        immobilizationOrSurgery4w: peImmobSurgery,
        priorDvtPe: pePriorVte,
        hemoptysis: peHemoptysis,
        activeMalignancy: peCancer,
      }),
    [peDvtSigns, peLikelyNoAlt, peTachycardia, peImmobSurgery, pePriorVte, peHemoptysis, peCancer]
  );

  const percResult = useMemo(
    () =>
      evaluatePercRule({
        ageUnder50: percAge50,
        heartRateUnder100: percHr100,
        spo2Over94Percent: percSpo2,
        noUnilateralLegSwelling: percNoSwelling,
        noHemoptysis: percNoHemoptysis,
        noRecentSurgeryTrauma4w: percNoSurgery,
        noPriorDvtPe: percNoPriorVte,
        noOralHormoneUse: percNoHormone,
      }),
    [percAge50, percHr100, percSpo2, percNoSwelling, percNoHemoptysis, percNoSurgery, percNoPriorVte, percNoHormone]
  );

  const wellsDvtResult = useMemo(
    () =>
      calculateWellsDvt({
        activeCancer: dvtCancer,
        paralysisParesisOrPlaster: dvtParalysis,
        bedriddenOver3DaysOrMajorSurgery12w: dvtBedridden,
        localizedTendernessAlongDeepVeins: dvtTenderness,
        entireLegSwollen: dvtEntireLeg,
        calfSwellingOver3cmComparedToOther: dvtCalf3cm,
        pittingEdemaGreaterInSymptomaticLeg: dvtPitting,
        collateralSuperficialVeinsNonVaricose: dvtVeins,
        alternativeDiagnosisAtLeastAsLikely: dvtAltDiagnosis,
      }),
    [dvtCancer, dvtParalysis, dvtBedridden, dvtTenderness, dvtEntireLeg, dvtCalf3cm, dvtPitting, dvtVeins, dvtAltDiagnosis]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    if (activeTab === 'pe') {
      return `${prefix}PULMONARY EMBOLISM (PE) RISK EVALUATION:
- Wells PE Score: ${wellsPeResult.score} pts (${wellsPeResult.twoTierCategory} | Three-Tier: ${wellsPeResult.threeTierCategory} Risk)
- PERC Rule: ${percResult.isPercNegative ? 'PERC Negative (All 8 criteria met)' : `PERC Positive (${8 - percResult.criteriaCountMet} failed)`}
- Diagnostic Plan: ${wellsPeResult.diagnosticStrategy}`;
    }
    return `${prefix}DEEP VEIN THROMBOSIS (DVT) RISK EVALUATION:
- Wells DVT Score: ${wellsDvtResult.score} pts (${wellsDvtResult.category}, estimated probability ~${wellsDvtResult.dvtProbabilityPercent})
- Clinical Management: ${wellsDvtResult.management}`;
  }, [patientTag, activeTab, wellsPeResult, percResult, wellsDvtResult]);

  const resetPe = () => {
    setPeDvtSigns(false);
    setPeLikelyNoAlt(true);
    setPeTachycardia(false);
    setPeImmobSurgery(false);
    setPePriorVte(false);
    setPeHemoptysis(false);
    setPeCancer(false);
  };

  const resetDvt = () => {
    setDvtCancer(false);
    setDvtParalysis(false);
    setDvtBedridden(false);
    setDvtTenderness(true);
    setDvtEntireLeg(false);
    setDvtCalf3cm(true);
    setDvtPitting(true);
    setDvtVeins(false);
    setDvtAltDiagnosis(false);
  };

  const references = [
    {
      source: 'Wells et al. (Thromb Haemost 2000) / ESC 2019',
      title: 'Derivation and Validation of Wells Criteria for Pulmonary Embolism',
      details: 'Score > 4 indicates PE Likely (proceed to CTPA). Score <= 4 indicates PE Unlikely (obtain high-sensitivity D-dimer).',
    },
    {
      source: 'Kline et al. (JTH 2008)',
      title: 'Pulmonary Embolism Rule-out Criteria (PERC Rule)',
      details: 'In patients with low gestalt probability, satisfying all 8 PERC criteria rules out PE without D-dimer testing.',
    },
    {
      source: 'Wells et al. (NEJM 2003)',
      title: 'Evaluation of D-dimer in Suspected Deep-Vein Thrombosis',
      details: 'Score >= 2 indicates DVT Likely (compression ultrasound indicated). Score < 2 indicates DVT Unlikely (D-dimer rule-out).',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Wells PE & DVT / PERC Rule
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300">
                CHEST / ESC 2019
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Venous thromboembolism diagnostic probability, D-dimer rule-out & imaging pathways
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="wells_vte" showLabel />
          <button
            type="button"
            onClick={activeTab === 'pe' ? resetPe : resetDvt}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <CopyNoteButton textToCopy={clinicalNote} />
        </div>
      </div>

      {/* Mode Switcher Tabs: Responsive 2-Column Grid */}
      <div className="grid grid-cols-2 border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl mb-6 gap-1.5 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('pe')}
          className={`w-full py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer truncate text-center tap-bounce active:scale-95 ${
            activeTab === 'pe'
              ? 'bg-white dark:bg-slate-800 text-cyan-800 dark:text-cyan-300 shadow-xs ring-1 ring-cyan-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Wells PE & PERC
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dvt')}
          className={`w-full py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer truncate text-center tap-bounce active:scale-95 ${
            activeTab === 'dvt'
              ? 'bg-white dark:bg-slate-800 text-cyan-800 dark:text-cyan-300 shadow-xs ring-1 ring-cyan-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Wells DVT
        </button>
      </div>

      {activeTab === 'pe' ? (
        <div className="space-y-6">
          {/* Wells PE Checklist */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                1. Wells Criteria for Pulmonary Embolism
              </span>
              <span className="text-xs font-extrabold text-cyan-700 dark:text-cyan-400">
                Wells Score: {wellsPeResult.score} pts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'Clinical signs/symptoms of DVT (leg swelling, pain)', state: peDvtSigns, set: setPeDvtSigns, pts: 3.0 },
                { label: 'PE is #1 diagnosis OR equally likely to others', state: peLikelyNoAlt, set: setPeLikelyNoAlt, pts: 3.0 },
                { label: 'Tachycardia (Heart Rate > 100 bpm)', state: peTachycardia, set: setPeTachycardia, pts: 1.5 },
                { label: 'Immobilization >= 3d or surgery in past 4 weeks', state: peImmobSurgery, set: setPeImmobSurgery, pts: 1.5 },
                { label: 'Previous objectively diagnosed PE or DVT', state: pePriorVte, set: setPePriorVte, pts: 1.5 },
                { label: 'Hemoptysis (coughing blood)', state: peHemoptysis, set: setPeHemoptysis, pts: 1.0 },
                { label: 'Active malignancy (treated within past 6 months or palliative)', state: peCancer, set: setPeCancer, pts: 1.0 },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => item.set(!item.state)}
                  className={`p-3 rounded-xl text-left text-xs border flex items-center justify-between transition-all ${
                    item.state
                      ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-400 text-cyan-950 dark:text-cyan-200 font-bold shadow-2xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ml-2 ${item.state ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                    +{item.pts}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Results Card */}
          <div className={`p-4 rounded-2xl border ${
            wellsPeResult.twoTierCategory === 'PE Likely'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Diagnostic Recommendation (Wells PE: {wellsPeResult.score} pts)
              </span>
              <span className={`text-xs font-black px-2 py-0.5 rounded ${
                wellsPeResult.twoTierCategory === 'PE Likely' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {wellsPeResult.twoTierCategory}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {wellsPeResult.diagnosticStrategy}
            </p>
          </div>

          {/* PERC Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                  PERC Rule (Pulmonary Embolism Rule-out Criteria)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Only applicable if clinical gestalt is low risk (&lt;15% probability)
                </span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                percResult.isPercNegative ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
              }`}>
                {percResult.isPercNegative ? 'PERC Negative (Rule Out)' : 'PERC Positive'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
              {[
                { label: 'Age < 50 years', state: percAge50, set: setPercAge50 },
                { label: 'Heart Rate < 100 bpm', state: percHr100, set: setPercHr100 },
                { label: 'SpO2 >= 95% on room air', state: percSpo2, set: setPercSpo2 },
                { label: 'No unilateral leg swelling', state: percNoSwelling, set: setPercNoSwelling },
                { label: 'No hemoptysis', state: percNoHemoptysis, set: setPercNoHemoptysis },
                { label: 'No recent surgery / trauma (4w)', state: percNoSurgery, set: setPercNoSurgery },
                { label: 'No prior PE or DVT', state: percNoPriorVte, set: setPercNoPriorVte },
                { label: 'No oral hormone / estrogen use', state: percNoHormone, set: setPercNoHormone },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => item.set(!item.state)}
                  className={`p-2 rounded-xl text-left text-xs border flex items-center justify-between transition-all ${
                    item.state
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-950 dark:text-emerald-200 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate mr-1">{item.label}</span>
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${item.state ? 'text-emerald-600' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
              {percResult.recommendation}
            </p>
          </div>
        </div>
      ) : (
        /* Wells DVT Tab */
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Wells Criteria for Deep Vein Thrombosis
            </span>
            <span className="text-xs font-extrabold text-cyan-700 dark:text-cyan-400">
              Wells DVT Score: {wellsDvtResult.score} pts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: 'Active cancer (ongoing Rx or past 6 mo / palliative)', state: dvtCancer, set: setDvtCancer, pts: '+1' },
              { label: 'Paralysis, paresis, or recent plaster immobilization of lower limb', state: dvtParalysis, set: setDvtParalysis, pts: '+1' },
              { label: 'Bedridden > 3 days or major surgery within 12 weeks', state: dvtBedridden, set: setDvtBedridden, pts: '+1' },
              { label: 'Localized tenderness along distribution of deep venous system', state: dvtTenderness, set: setDvtTenderness, pts: '+1' },
              { label: 'Entire leg swollen', state: dvtEntireLeg, set: setDvtEntireLeg, pts: '+1' },
              { label: 'Calf swelling >= 3 cm larger than asymptomatic leg (10 cm below tuberosity)', state: dvtCalf3cm, set: setDvtCalf3cm, pts: '+1' },
              { label: 'Pitting edema confined to or greater in symptomatic leg', state: dvtPitting, set: setDvtPitting, pts: '+1' },
              { label: 'Collateral superficial veins (non-varicose)', state: dvtVeins, set: setDvtVeins, pts: '+1' },
              { label: 'Alternative diagnosis is as likely or more likely than DVT', state: dvtAltDiagnosis, set: setDvtAltDiagnosis, pts: '-2' },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => item.set(!item.state)}
                className={`p-3 rounded-xl text-left text-xs border flex items-center justify-between transition-all ${
                  item.state
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-400 text-cyan-950 dark:text-cyan-200 font-bold shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{item.label}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ml-2 ${item.state ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                  {item.pts}
                </span>
              </button>
            ))}
          </div>

          <div className={`p-4 rounded-2xl border ${
            wellsDvtResult.category === 'DVT Likely'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Diagnostic Recommendation (Wells DVT: {wellsDvtResult.score} pts)
              </span>
              <span className={`text-xs font-black px-2 py-0.5 rounded ${
                wellsDvtResult.category === 'DVT Likely' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {wellsDvtResult.category}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {wellsDvtResult.management}
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
          rows={4}
          value={clinicalNote}
          className="w-full text-xs font-mono p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 select-all"
        />
      </div>

      <ReferenceAccordion references={references} />

      <StickyMobileAction
        scoreBadge={activeTab === 'pe' ? `Wells PE: ${wellsPeResult.score}` : `Wells DVT: ${wellsDvtResult.score}`}
        categoryLabel={activeTab === 'pe' ? wellsPeResult.twoTierCategory : wellsDvtResult.category}
        noteText={clinicalNote}
        severityColor={
          (activeTab === 'pe' && wellsPeResult.twoTierCategory === 'PE Likely') ||
          (activeTab === 'dvt' && wellsDvtResult.category === 'DVT Likely')
            ? 'rose'
            : 'emerald'
        }
      />
    </div>
  );
};
