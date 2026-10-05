import React, { useState, useMemo } from 'react';
import { Activity, RotateCcw } from 'lucide-react';
import { StarButton } from '../ui/StarButton';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import {
  calculateAbcd2Score,
  calculateSirs,
  evaluateDengueWarningSigns,
  calculateMentzerIndex,
  calculateAbsoluteNeutrophilCount,
} from '../../calculators/medicineExpanded';

interface NeurologyStrokeSuiteViewProps {
  patientTag?: string;
}

export const NeurologyStrokeSuiteView: React.FC<NeurologyStrokeSuiteViewProps> = ({ patientTag }) => {
  const [activeTab, setActiveTab] = useState<'abcd2' | 'sirs_dengue' | 'heme'>('abcd2');

  // ABCD2 state
  const [age60Plus, setAge60Plus] = useState(true);
  const [sbp140OrDbp90, setSbp140OrDbp90] = useState(true);
  const [unilateralWeakness, setUnilateralWeakness] = useState(true);
  const [speechImpairment, setSpeechImpairment] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState<'<10' | '10-59' | '>=60'>('>=60');
  const [hasDiabetes, setHasDiabetes] = useState(true);

  // SIRS & Dengue state
  const [tempAbnormal, setTempAbnormal] = useState(true);
  const [hrGt90, setHrGt90] = useState(true);
  const [rrGt20, setRrGt20] = useState(true);
  const [wbcAbnormal, setWbcAbnormal] = useState(false);

  const [denguePain, setDenguePain] = useState(true);
  const [dengueVomit, setDengueVomit] = useState(true);
  const [dengueFluid, setDengueFluid] = useState(false);
  const [dengueBleed, setDengueBleed] = useState(false);
  const [dengueLethargy, setDengueLethargy] = useState(false);
  const [dengueLiver, setDengueLiver] = useState(false);
  const [dengueHctPlt, setDengueHctPlt] = useState(true);

  // Hematology state
  const [mcv, setMcv] = useState(68);
  const [rbc, setRbc] = useState(6.1);
  const [wbcK, setWbcK] = useState(1.4);
  const [segs, setSegs] = useState(25);
  const [bands, setBands] = useState(5);

  const abcd2Result = useMemo(
    () =>
      calculateAbcd2Score({
        age60Plus,
        sbpGte140OrDbpGte90: sbp140OrDbp90,
        unilateralWeakness,
        speechImpairmentWithoutWeakness: speechImpairment,
        durationMinutes,
        hasDiabetes,
      }),
    [age60Plus, sbp140OrDbp90, unilateralWeakness, speechImpairment, durationMinutes, hasDiabetes]
  );

  const sirsResult = useMemo(
    () =>
      calculateSirs({
        tempAbnormal,
        heartRateGt90: hrGt90,
        respRateGt20OrPaco2Lt32: rrGt20,
        wbcAbnormal,
      }),
    [tempAbnormal, hrGt90, rrGt20, wbcAbnormal]
  );

  const dengueResult = useMemo(
    () =>
      evaluateDengueWarningSigns({
        abdominalPain: denguePain,
        persistentVomiting: dengueVomit,
        fluidAccumulation: dengueFluid,
        mucosalBleeding: dengueBleed,
        lethargyOrRestlessness: dengueLethargy,
        hepatomegalyGt2cm: dengueLiver,
        hematocritRiseWithRapidPlateletDrop: dengueHctPlt,
      }),
    [denguePain, dengueVomit, dengueFluid, dengueBleed, dengueLethargy, dengueLiver, dengueHctPlt]
  );

  const mentzerResult = useMemo(() => calculateMentzerIndex(mcv, rbc), [mcv, rbc]);
  const ancResult = useMemo(() => calculateAbsoluteNeutrophilCount(wbcK, segs, bands), [wbcK, segs, bands]);

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    if (activeTab === 'abcd2') {
      return `${prefix}ABCD2 SCORE FOR TRANSIENT ISCHEMIC ATTACK (TIA):
- ABCD2 Score: ${abcd2Result.score}/7 (${abcd2Result.riskTier} Risk Tier)
- 48-Hour Stroke Risk: ${abcd2Result.twoDayStrokeRiskPercent}%
- Recommendation: ${abcd2Result.recommendation}`;
    } else if (activeTab === 'sirs_dengue') {
      return `${prefix}SIRS & DENGUE WARNING SIGNS EVALUATION:
- SIRS: ${sirsResult.score}/4 criteria met (${sirsResult.hasSirs ? 'SIRS Present' : 'SIRS Absent'})
- WHO Dengue Triage: ${dengueResult.classification} (${dengueResult.warningSignsPresent} warning signs)
- Action: ${dengueResult.managementGuideline}`;
    } else {
      return `${prefix}HEMATOLOGY WORKUP (MENTZER INDEX & ANC):
- Mentzer Index: ${mentzerResult.mentzerIndex} (MCV ${mcv} fL / RBC ${rbc} M/uL) -> ${mentzerResult.likelyDiagnosis}
- Absolute Neutrophil Count (ANC): ${ancResult.ancCellsPerMicroLiter} cells/uL (${ancResult.neutropeniaGrade})
- Infection Risk: ${ancResult.clinicalRisk}`;
    }
  }, [patientTag, activeTab, abcd2Result, sirsResult, dengueResult, mentzerResult, mcv, rbc, ancResult]);

  const resetAll = () => {
    setAge60Plus(true);
    setSbp140OrDbp90(true);
    setUnilateralWeakness(true);
    setSpeechImpairment(false);
    setDurationMinutes('>=60');
    setHasDiabetes(true);
    setTempAbnormal(true);
    setHrGt90(true);
    setRrGt20(true);
    setWbcAbnormal(false);
    setDenguePain(true);
    setDengueVomit(true);
    setDengueFluid(false);
    setDengueBleed(false);
    setDengueLethargy(false);
    setDengueLiver(false);
    setDengueHctPlt(true);
    setMcv(68);
    setRbc(6.1);
    setWbcK(1.4);
    setSegs(25);
    setBands(5);
  };

  const references = [
    {
      source: 'Johnston SC, et al. Lancet 2007',
      title: 'Validation and refinement of scores to predict very early stroke after transient ischaemic attack.',
      details: 'Lancet. 2007;369(9558):283-292.',
    },
    {
      source: 'World Health Organization (WHO) 2009',
      title: 'Dengue: guidelines for diagnosis, treatment, prevention and control.',
      details: 'WHO Press, Geneva; 2009.',
    },
    {
      source: 'Mentzer WC Jr. Lancet 1973',
      title: 'Differentiation of iron deficiency from thalassaemia trait.',
      details: 'Lancet. 1973;1(7808):882.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 rounded-xl text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Neurology & Systemic Medicine Suite</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 rounded-md">
                AHA/ASA / WHO
              </span>
              <StarButton toolId="neuro_systemic_suite" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ABCD² TIA stroke risk, SIRS, Dengue warning signs, Mentzer Index & Absolute Neutrophil Count
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

      {/* Tabs: Responsive 3-Column Grid */}
      <div className="grid grid-cols-3 border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl gap-1.5 shadow-2xs">
        {(
          [
            { id: 'abcd2', label: 'ABCD² TIA', badge: `${abcd2Result.score}/7` },
            { id: 'sirs_dengue', label: 'SIRS & Dengue', badge: dengueResult.warningSignsPresent > 0 ? 'Warning' : 'Stable' },
            { id: 'heme', label: 'Mentzer / ANC', badge: `${ancResult.ancCellsPerMicroLiter}` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`w-full py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-1 min-w-0 cursor-pointer tap-bounce active:scale-95 ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs ring-1 ring-purple-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="truncate">{t.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 font-bold ${
                activeTab === t.id
                  ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: ABCD2 */}
      {activeTab === 'abcd2' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              ABCD² Clinical Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => setAge60Plus(!age60Plus)}
                className={`p-3 rounded-lg border text-left font-medium ${age60Plus ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
              >
                Age ≥ 60 years (1 pt)
              </button>
              <button
                onClick={() => setSbp140OrDbp90(!sbp140OrDbp90)}
                className={`p-3 rounded-lg border text-left font-medium ${sbp140OrDbp90 ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
              >
                Blood Pressure ≥ 140/90 mmHg (1 pt)
              </button>
              <button
                onClick={() => {
                  setUnilateralWeakness(!unilateralWeakness);
                  if (!unilateralWeakness) setSpeechImpairment(false);
                }}
                className={`p-3 rounded-lg border text-left font-medium ${unilateralWeakness ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
              >
                Unilateral motor weakness (2 pts)
              </button>
              <button
                onClick={() => {
                  setSpeechImpairment(!speechImpairment);
                  if (!speechImpairment) setUnilateralWeakness(false);
                }}
                className={`p-3 rounded-lg border text-left font-medium ${speechImpairment ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
              >
                Speech disturbance without weakness (1 pt)
              </button>
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Symptom Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '<10', label: '< 10 min (0 pts)' },
                    { id: '10-59', label: '10–59 min (1 pt)' },
                    { id: '>=60', label: '≥ 60 min (2 pts)' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setDurationMinutes(btn.id as any)}
                      className={`p-2.5 rounded-lg border font-medium ${durationMinutes === btn.id ? 'bg-purple-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setHasDiabetes(!hasDiabetes)}
                className={`sm:col-span-2 p-3 rounded-lg border text-left font-medium ${hasDiabetes ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
              >
                Diabetes Mellitus (1 pt)
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-200 dark:border-purple-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              48-Hour Ischemic Stroke Risk
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              ABCD² Score {abcd2Result.score} / 7
              <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                abcd2Result.riskTier === 'High' ? 'bg-rose-600 text-white' : abcd2Result.riskTier === 'Moderate' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {abcd2Result.riskTier} Risk ({abcd2Result.twoDayStrokeRiskPercent}%)
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {abcd2Result.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: SIRS & Dengue */}
      {activeTab === 'sirs_dengue' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Systemic Inflammatory Response (SIRS)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button onClick={() => setTempAbnormal(!tempAbnormal)} className={`p-2.5 rounded-lg border text-left font-medium ${tempAbnormal ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300' : 'bg-slate-50 dark:bg-slate-800'}`}>
                Temp &gt; 38°C or &lt; 36°C
              </button>
              <button onClick={() => setHrGt90(!hrGt90)} className={`p-2.5 rounded-lg border text-left font-medium ${hrGt90 ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300' : 'bg-slate-50 dark:bg-slate-800'}`}>
                Heart Rate &gt; 90 bpm
              </button>
              <button onClick={() => setRrGt20(!rrGt20)} className={`p-2.5 rounded-lg border text-left font-medium ${rrGt20 ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300' : 'bg-slate-50 dark:bg-slate-800'}`}>
                RR &gt; 20 or PaCO2 &lt; 32 mmHg
              </button>
              <button onClick={() => setWbcAbnormal(!wbcAbnormal)} className={`p-2.5 rounded-lg border text-left font-medium ${wbcAbnormal ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300' : 'bg-slate-50 dark:bg-slate-800'}`}>
                WBC &gt; 12k, &lt; 4k, or &gt; 10% bands
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              WHO 2009 Dengue Warning Signs Checklist
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'Severe abdominal pain or tenderness', val: denguePain, set: setDenguePain },
                { label: 'Persistent vomiting (≥3 in 24h)', val: dengueVomit, set: setDengueVomit },
                { label: 'Clinical fluid accumulation (ascites, pleural effusion)', val: dengueFluid, set: setDengueFluid },
                { label: 'Mucosal bleeding (epistaxis, gingival, menorrhagia)', val: dengueBleed, set: setDengueBleed },
                { label: 'Lethargy or restlessness', val: dengueLethargy, set: setDengueLethargy },
                { label: 'Liver enlargement > 2 cm below costal margin', val: dengueLiver, set: setDengueLiver },
                { label: 'Rapid Hct rise concurrent with rapid platelet drop', val: dengueHctPlt, set: setDengueHctPlt },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => item.set(!item.val)}
                  className={`p-2.5 rounded-lg border text-left font-medium ${item.val ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 dark:border-amber-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Infection & Sepsis Triage
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {dengueResult.classification}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              SIRS Criteria: <strong>{sirsResult.score}/4 ({sirsResult.hasSirs ? 'SIRS Positive' : 'Negative'})</strong>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {dengueResult.managementGuideline}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Hematology (Mentzer & ANC) */}
      {activeTab === 'heme' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Mentzer Index (Microcytosis)
              </h2>
              <div>
                <label className="block font-semibold mb-1">Mean Corpuscular Volume (MCV fL)</label>
                <NumberStepper value={mcv} onChange={setMcv} min={40} max={120} step={1} unit="fL" />
              </div>
              <div>
                <label className="block font-semibold mb-1">RBC Count (Million/μL)</label>
                <NumberStepper value={rbc} onChange={setRbc} min={1.5} max={9.0} step={0.1} unit="M/μL" />
              </div>

              <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-xs font-bold text-purple-700 dark:text-purple-300">
                  Mentzer Index: {mentzerResult.mentzerIndex}
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {mentzerResult.likelyDiagnosis}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  {mentzerResult.workupRecommendation}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Absolute Neutrophil Count (ANC)
              </h2>
              <div>
                <label className="block font-semibold mb-1">Total WBC (x10³/μL)</label>
                <NumberStepper value={wbcK} onChange={setWbcK} min={0.1} max={50.0} step={0.1} unit="k/μL" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Segmented (%)</label>
                  <NumberStepper value={segs} onChange={setSegs} min={0} max={100} step={1} unit="%" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Bands (%)</label>
                  <NumberStepper value={bands} onChange={setBands} min={0} max={50} step={1} unit="%" />
                </div>
              </div>

              <div className="p-3 bg-rose-50/70 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800">
                <div className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  ANC: {ancResult.ancCellsPerMicroLiter} cells/μL
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {ancResult.neutropeniaGrade}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  {ancResult.clinicalRisk}
                </div>
              </div>
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
