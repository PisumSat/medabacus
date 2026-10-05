import React, { useState, useMemo } from 'react';
import { Flame, RotateCcw } from 'lucide-react';
import { StarButton } from '../ui/StarButton';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import {
  calculateRevisedTraumaScore,
  calculateAbcScoreForMtp,
  calculateShockIndex,
  calculateModifiedBauxScore,
} from '../../calculators/surgeryExpanded';

interface TraumaAcuteSuiteViewProps {
  patientTag?: string;
}

export const TraumaAcuteSuiteView: React.FC<TraumaAcuteSuiteViewProps> = ({ patientTag }) => {
  const [activeTab, setActiveTab] = useState<'rts' | 'abc_mtp' | 'shock' | 'baux'>('rts');

  // RTS state
  const [rtsGcs, setRtsGcs] = useState(13);
  const [rtsSbp, setRtsSbp] = useState(115);
  const [rtsRr, setRtsRr] = useState(20);

  // ABC MTP state
  const [abcPenetrating, setAbcPenetrating] = useState(true);
  const [abcSbp, setAbcSbp] = useState(true);
  const [abcHr, setAbcHr] = useState(true);
  const [abcFast, setAbcFast] = useState(false);

  // Shock Index state
  const [siHr, setSiHr] = useState(118);
  const [siSbp, setSiSbp] = useState(88);
  const [siDbp, setSiDbp] = useState(58);

  // Modified Baux state
  const [bauxAge, setBauxAge] = useState(58);
  const [bauxTbsa, setBauxTbsa] = useState(35);
  const [bauxInhalation, setBauxInhalation] = useState(true);

  const rtsResult = useMemo(
    () =>
      calculateRevisedTraumaScore({
        gcs: rtsGcs,
        sbp: rtsSbp,
        rr: rtsRr,
      }),
    [rtsGcs, rtsSbp, rtsRr]
  );

  const abcResult = useMemo(
    () =>
      calculateAbcScoreForMtp({
        penetratingMechanism: abcPenetrating,
        sbpLte90: abcSbp,
        heartRateGte120: abcHr,
        positiveFastExam: abcFast,
      }),
    [abcPenetrating, abcSbp, abcHr, abcFast]
  );

  const shockResult = useMemo(() => calculateShockIndex(siHr, siSbp, siDbp), [siHr, siSbp, siDbp]);

  const bauxResult = useMemo(
    () => calculateModifiedBauxScore(bauxAge, bauxTbsa, bauxInhalation),
    [bauxAge, bauxTbsa, bauxInhalation]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    if (activeTab === 'rts') {
      return `${prefix}REVISED TRAUMA SCORE (RTS):
- Triage RTS: ${rtsResult.triageRts} (Survival Probability: ${rtsResult.survivalProbabilityPercent}%)
- Parameters: GCS ${rtsGcs} (coded ${rtsResult.codedGcs}) | SBP ${rtsSbp} mmHg (coded ${rtsResult.codedSbp}) | RR ${rtsRr}/min (coded ${rtsResult.codedRr})
- Trauma Center Transfer: ${rtsResult.traumaCenterIndication ? 'INDICATED (Triage RTS < 7.84)' : 'Standard field triage'}`;
    } else if (activeTab === 'abc_mtp') {
      return `${prefix}ASSESSMENT OF BLOOD CONSUMPTION (ABC) SCORE:
- Total Score: ${abcResult.score}/4
- Massive Transfusion Protocol: ${abcResult.activateMtp ? 'ACTIVATE MTP IMMEDIATELY (1:1:1 PRBC:FFP:Platelets)' : 'MTP not automatically indicated'}
- Recommendation: ${abcResult.recommendation}`;
    } else if (activeTab === 'shock') {
      return `${prefix}SHOCK INDEX & MODIFIED SHOCK INDEX:
- HR ${siHr} bpm | SBP ${siSbp} mmHg | DBP ${siDbp} mmHg
- Shock Index (HR/SBP): ${shockResult.shockIndex} (${shockResult.isShockPresent ? 'OCCULT SHOCK' : 'Normal'})
- Modified Shock Index (HR/MAP): ${shockResult.modifiedShockIndex ?? 'N/A'}
- Interpretation: ${shockResult.interpretation}`;
    } else {
      return `${prefix}MODIFIED BAUX BURN MORTALITY SCORE:
- Patient Age: ${bauxAge} y | Burn %TBSA: ${bauxTbsa}% | Inhalation Injury: ${bauxInhalation ? 'YES (+17 pts)' : 'NO'}
- Baux Score: ${bauxResult.bauxScore} points
- Predicted Burn Mortality: ${bauxResult.estimatedMortalityPercent}%
- Prognosis: ${bauxResult.prognosis}`;
    }
  }, [
    patientTag,
    activeTab,
    rtsResult,
    rtsGcs,
    rtsSbp,
    rtsRr,
    abcResult,
    siHr,
    siSbp,
    siDbp,
    shockResult,
    bauxAge,
    bauxTbsa,
    bauxInhalation,
    bauxResult,
  ]);

  const resetAll = () => {
    setRtsGcs(13);
    setRtsSbp(115);
    setRtsRr(20);
    setAbcPenetrating(true);
    setAbcSbp(true);
    setAbcHr(true);
    setAbcFast(false);
    setSiHr(118);
    setSiSbp(88);
    setSiDbp(58);
    setBauxAge(58);
    setBauxTbsa(35);
    setBauxInhalation(true);
  };

  const references = [
    {
      source: 'Champion HR, et al. J Trauma 1989',
      title: 'A revision of the Trauma Score.',
      details: 'J Trauma. 1989;29(5):623-629.',
    },
    {
      source: 'Cotton BA, et al. J Trauma 2010',
      title: 'Multicenter validation of the Assessment of Blood Consumption (ABC) score in predicting massive transfusion.',
      details: 'J Trauma. 2010;69(1):S33-S39.',
    },
    {
      source: 'Osler T, et al. J Am Coll Surg 2010',
      title: 'Simplified estimates of the probability of death after burn injuries: extending and updating the baux score.',
      details: 'J Am Coll Surg. 2010;211(4):469-480.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-50 dark:bg-red-950/60 rounded-xl text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Trauma & Acute Resuscitation Suite</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 rounded-md">
                ATLS / ACS-COT
              </span>
              <StarButton toolId="trauma_acute_suite" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Revised Trauma Score (RTS), ABC Score for MTP, Shock Index & Modified Baux Burn Score
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
            { id: 'rts', label: 'Revised Trauma (RTS)', badge: `${rtsResult.triageRts}` },
            { id: 'abc_mtp', label: 'ABC for MTP', badge: `${abcResult.score}/4` },
            { id: 'shock', label: 'Shock Index', badge: `${shockResult.shockIndex}` },
            { id: 'baux', label: 'Modified Baux', badge: `${bauxResult.bauxScore} pts` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`w-full py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-1 min-w-0 cursor-pointer tap-bounce active:scale-95 ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-xs ring-1 ring-red-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="truncate">{t.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 font-bold ${
                activeTab === t.id
                  ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: RTS */}
      {activeTab === 'rts' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              RTS Physiological Parameters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1">Glasgow Coma Scale (GCS)</label>
                <NumberStepper value={rtsGcs} onChange={setRtsGcs} min={3} max={15} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Systolic Blood Pressure (mmHg)</label>
                <NumberStepper value={rtsSbp} onChange={setRtsSbp} min={0} max={250} step={2} unit="mmHg" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Respiratory Rate (breaths/min)</label>
                <NumberStepper value={rtsRr} onChange={setRtsRr} min={0} max={60} step={1} unit="bpm" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-200 dark:border-red-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">
              Trauma Triage Score
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              RTS: {rtsResult.triageRts} / 7.841
              <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                rtsResult.traumaCenterIndication ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {rtsResult.traumaCenterIndication ? 'Level 1 Trauma Triage' : 'Stable Triage'}
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              Predicted Survival Probability: <strong>{rtsResult.survivalProbabilityPercent}%</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: ABC MTP */}
      {activeTab === 'abc_mtp' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              ABC Criteria for Massive Transfusion (1 pt each)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setAbcPenetrating(!abcPenetrating)}
                className={`p-3 rounded-lg border text-left font-medium ${abcPenetrating ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
              >
                Penetrating torso injury mechanism
              </button>
              <button
                onClick={() => setAbcSbp(!abcSbp)}
                className={`p-3 rounded-lg border text-left font-medium ${abcSbp ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
              >
                Emergency department SBP ≤ 90 mmHg
              </button>
              <button
                onClick={() => setAbcHr(!abcHr)}
                className={`p-3 rounded-lg border text-left font-medium ${abcHr ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
              >
                Emergency department HR ≥ 120 bpm
              </button>
              <button
                onClick={() => setAbcFast(!abcFast)}
                className={`p-3 rounded-lg border text-left font-medium ${abcFast ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
              >
                Positive ultrasound FAST exam (free fluid)
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-200 dark:border-red-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">
              MTP Decision Output (Cutoff ≥ 2)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              ABC Score {abcResult.score} / 4
              <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                abcResult.activateMtp ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {abcResult.activateMtp ? 'ACTIVATE MTP IMMEDIATELY' : 'MTP Unlikely'}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {abcResult.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Shock Index */}
      {activeTab === 'shock' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Hemodynamic Vitals
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1">Heart Rate (bpm)</label>
                <NumberStepper value={siHr} onChange={setSiHr} min={30} max={220} step={1} unit="bpm" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Systolic BP (mmHg)</label>
                <NumberStepper value={siSbp} onChange={setSiSbp} min={40} max={250} step={2} unit="mmHg" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Diastolic BP (mmHg)</label>
                <NumberStepper value={siDbp} onChange={setSiDbp} min={20} max={150} step={2} unit="mmHg" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-200 dark:border-red-900/60 rounded-xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">
                Standard Shock Index (HR / SBP)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                SI: {shockResult.shockIndex}
                <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                  shockResult.isShockPresent ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {shockResult.isShockPresent ? 'Shock ≥ 0.9' : 'Normal < 0.9'}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
                {shockResult.interpretation}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Modified Shock Index (HR / MAP)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                MSI: {shockResult.modifiedShockIndex ?? 'N/A'}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                MSI &gt; 1.3 is strongly predictive of emergency ICU admission and blood transfusion in blunt and penetrating trauma.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Modified Baux */}
      {activeTab === 'baux' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Burn Mortality Predictor Inputs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Patient Age (years)</label>
                <NumberStepper value={bauxAge} onChange={setBauxAge} min={1} max={105} step={1} unit="yo" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Total Burn Surface Area (% TBSA)</label>
                <NumberStepper value={bauxTbsa} onChange={setBauxTbsa} min={1} max={100} step={1} unit="%" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                checked={bauxInhalation}
                onChange={(e) => setBauxInhalation(e.target.checked)}
                className="rounded text-red-600"
              />
              <span className="font-semibold">Inhalation injury confirmed (+17 points)</span>
            </label>
          </div>

          <div className="bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-200 dark:border-red-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">
              Baux Score: Age ({bauxAge}) + %TBSA ({bauxTbsa}) + Inhalation ({bauxInhalation ? 17 : 0})
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {bauxResult.bauxScore} Points
              <span className="ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-red-600 text-white">
                {bauxResult.estimatedMortalityPercent}% Predicted Mortality
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {bauxResult.prognosis}
            </p>
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
