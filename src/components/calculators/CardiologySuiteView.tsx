import React, { useState, useMemo } from 'react';
import { HeartPulse, RotateCcw } from 'lucide-react';
import { StarButton } from '../ui/StarButton';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import {
  calculateTimiNstemi,
  calculateHeartScore,
  calculateKillipClass,
  calculateQtc,
} from '../../calculators/medicineExpanded';

interface CardiologySuiteViewProps {
  patientTag?: string;
}

export const CardiologySuiteView: React.FC<CardiologySuiteViewProps> = ({ patientTag }) => {
  const [activeTab, setActiveTab] = useState<'timi' | 'heart' | 'killip' | 'qtc'>('timi');

  // TIMI state
  const [timiAge65, setTimiAge65] = useState(true);
  const [timiCadRisks, setTimiCadRisks] = useState(true);
  const [timiKnownCad, setTimiKnownCad] = useState(false);
  const [timiAsa, setTimiAsa] = useState(true);
  const [timiAngina, setTimiAngina] = useState(true);
  const [timiStDev, setTimiStDev] = useState(true);
  const [timiMarkers, setTimiMarkers] = useState(true);

  // HEART state
  const [heartHistory, setHeartHistory] = useState<0 | 1 | 2>(2);
  const [heartEcg, setHeartEcg] = useState<0 | 1 | 2>(1);
  const [heartAge, setHeartAge] = useState(62);
  const [heartRiskFactors, setHeartRiskFactors] = useState<0 | 1 | 2>(2);
  const [heartTroponin, setHeartTroponin] = useState<0 | 1 | 2>(1);

  // Killip state
  const [killipRales, setKillipRales] = useState(true);
  const [killipS3, setKillipS3] = useState(false);
  const [killipEdema, setKillipEdema] = useState(false);
  const [killipShock, setKillipShock] = useState(false);

  // QTc state
  const [qtMs, setQtMs] = useState(420);
  const [heartRate, setHeartRate] = useState(75);

  const timiResult = useMemo(
    () =>
      calculateTimiNstemi({
        age65Plus: timiAge65,
        threeCadRiskFactors: timiCadRisks,
        knownCadGt50: timiKnownCad,
        aspirinPast7Days: timiAsa,
        severeAnginaPast24h: timiAngina,
        stSegmentDeviation: timiStDev,
        elevatedCardiacMarkers: timiMarkers,
      }),
    [timiAge65, timiCadRisks, timiKnownCad, timiAsa, timiAngina, timiStDev, timiMarkers]
  );

  const heartResult = useMemo(
    () =>
      calculateHeartScore({
        history: heartHistory,
        ecg: heartEcg,
        age: heartAge,
        riskFactors: heartRiskFactors,
        troponin: heartTroponin,
      }),
    [heartHistory, heartEcg, heartAge, heartRiskFactors, heartTroponin]
  );

  const killipResult = useMemo(
    () =>
      calculateKillipClass({
        hasRales: killipRales,
        hasThirdHeartSound: killipS3,
        hasPulmonaryEdema: killipEdema,
        hasCardiogenicShock: killipShock,
      }),
    [killipRales, killipS3, killipEdema, killipShock]
  );

  const qtcResult = useMemo(() => calculateQtc(qtMs, heartRate), [qtMs, heartRate]);

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    if (activeTab === 'timi') {
      return `${prefix}TIMI RISK SCORE FOR UA/NSTEMI:
- Score: ${timiResult.score}/7 (${timiResult.riskTier} Risk Tier)
- 14-day Risk of All-cause Mortality, New/Recurrent MI, or Urgent Revascularization: ${timiResult.fourteenDayMacePercent}%
- Recommendation: ${timiResult.recommendation}`;
    } else if (activeTab === 'heart') {
      return `${prefix}HEART SCORE FOR CHEST PAIN EVALUATION:
- Score: ${heartResult.score}/10 (${heartResult.riskCategory})
- 6-week Risk of Major Adverse Cardiac Events (MACE): ${heartResult.sixWeekMacePercent}%
- Clinical Management: ${heartResult.management}`;
    } else if (activeTab === 'killip') {
      return `${prefix}KILLIP CLASSIFICATION IN ACUTE MYOCARDIAL INFARCTION:
- Killip Class: Class ${killipResult.killipClass}
- In-Hospital Mortality Estimate: ~${killipResult.mortalityPercent}%
- Clinical Picture: ${killipResult.description}`;
    } else {
      return `${prefix}CORRECTED QT INTERVAL (QTc) EVALUATION:
- Heart Rate: ${heartRate} bpm | Raw QT: ${qtMs} ms
- Bazett QTc: ${qtcResult.bazettMs} ms | Fridericia QTc: ${qtcResult.fridericiaMs} ms
- Interpretation: ${qtcResult.interpretation}`;
    }
  }, [patientTag, activeTab, timiResult, heartResult, killipResult, qtcResult, heartRate, qtMs]);

  const resetAll = () => {
    setTimiAge65(true);
    setTimiCadRisks(true);
    setTimiKnownCad(false);
    setTimiAsa(true);
    setTimiAngina(true);
    setTimiStDev(true);
    setTimiMarkers(true);
    setHeartHistory(2);
    setHeartEcg(1);
    setHeartAge(62);
    setHeartRiskFactors(2);
    setHeartTroponin(1);
    setKillipRales(true);
    setKillipS3(false);
    setKillipEdema(false);
    setKillipShock(false);
    setQtMs(420);
    setHeartRate(75);
  };

  const references = [
    {
      source: 'Antman EM, et al. JAMA 2000',
      title: 'The TIMI risk score for unstable angina/non-ST elevation MI.',
      details: 'JAMA. 2000;284(7):835-842.',
    },
    {
      source: 'Six AJ, et al. Neth Heart J 2008',
      title: 'Chest pain in the emergency room: value of the HEART score.',
      details: 'Neth Heart J. 2008;16(6):191-196.',
    },
    {
      source: 'Killip T 3rd, Kimball JT. Am J Cardiol 1967',
      title: 'Treatment of myocardial infarction in a coronary care unit.',
      details: 'Am J Cardiol. 1967;20(4):457-464.',
    },
    {
      source: 'Vandenberk B, et al. JAHA 2016',
      title: 'Which QT Correction Formulae to Use for QT Monitoring?',
      details: 'J Am Heart Assoc. 2016;5(6):e003264.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Cardiology & ACS Suite</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 rounded-md shrink-0">
                ACC / AHA / ESC
              </span>
              <StarButton toolId="cardiology_suite" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              TIMI UA/NSTEMI, HEART Score, Killip classification & QTc rate correction
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
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

      {/* Sub-specialty Tabs: Responsive 2x2 Grid on Mobile, 4-Cols on Desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl gap-1.5 shadow-2xs">
        {(
          [
            { id: 'timi', label: 'TIMI NSTEMI', badge: `${timiResult.score}/7` },
            { id: 'heart', label: 'HEART Score', badge: `${heartResult.score}/10` },
            { id: 'killip', label: 'Killip Class', badge: `Class ${killipResult.killipClass}` },
            { id: 'qtc', label: 'QTc Interval', badge: `${qtcResult.fridericiaMs} ms` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`w-full py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-1 min-w-0 cursor-pointer tap-bounce active:scale-95 ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs ring-1 ring-rose-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="truncate">{t.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 font-bold ${
                activeTab === t.id
                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: TIMI NSTEMI */}
      {activeTab === 'timi' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              TIMI UA/NSTEMI Risk Criteria (1 pt each)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { label: 'Age ≥ 65 years', val: timiAge65, set: setTimiAge65 },
                { label: '≥ 3 CAD Risk Factors (HTN, DM, Dyslipidemia, Smoker, Family Hx)', val: timiCadRisks, set: setTimiCadRisks },
                { label: 'Known CAD (stenosis ≥ 50%)', val: timiKnownCad, set: setTimiKnownCad },
                { label: 'Aspirin use in past 7 days', val: timiAsa, set: setTimiAsa },
                { label: 'Severe angina (≥ 2 episodes in last 24h)', val: timiAngina, set: setTimiAngina },
                { label: 'ST-segment deviation ≥ 0.5 mm on ECG', val: timiStDev, set: setTimiStDev },
                { label: 'Elevated cardiac biomarkers (Troponin or CK-MB)', val: timiMarkers, set: setTimiMarkers },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => item.set(!item.val)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    item.val
                      ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/60 text-slate-900 dark:text-white font-medium'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="pr-2">{item.label}</span>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${item.val ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    {item.val ? '✓' : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* TIMI Results Card */}
          <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-200 dark:border-rose-900/60 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  14-Day Prognosis
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  TIMI Score {timiResult.score} / 7
                  <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    timiResult.riskTier === 'High'
                      ? 'bg-rose-600 text-white'
                      : timiResult.riskTier === 'Intermediate'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {timiResult.riskTier} Risk
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                  14-day Risk of Death, MI, or Urgent Revascularization: <strong className="text-rose-600 dark:text-rose-400">{timiResult.fourteenDayMacePercent}%</strong>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-3 pt-3 border-t border-rose-200 dark:border-rose-900/40">
              {timiResult.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: HEART Score */}
      {activeTab === 'heart' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              HEART Parameters (0–2 points each)
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  1. History (Clinical Suspicion)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 0, label: 'Slightly suspicious (0)' },
                    { val: 1, label: 'Moderately suspicious (1)' },
                    { val: 2, label: 'Highly suspicious (2)' },
                  ].map((btn) => (
                    <button
                      key={btn.val}
                      onClick={() => setHeartHistory(btn.val as 0 | 1 | 2)}
                      className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                        heartHistory === btn.val
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  2. Electrocardiogram (ECG)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 0, label: 'Normal (0)' },
                    { val: 1, label: 'Non-specific repol / LBBB (1)' },
                    { val: 2, label: 'Significant ST depression (2)' },
                  ].map((btn) => (
                    <button
                      key={btn.val}
                      onClick={() => setHeartEcg(btn.val as 0 | 1 | 2)}
                      className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                        heartEcg === btn.val
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  3. Age: {heartAge} years ({heartAge >= 65 ? '2 pts' : heartAge >= 45 ? '1 pt' : '0 pts'})
                </label>
                <NumberStepper value={heartAge} onChange={setHeartAge} min={18} max={100} step={1} unit="years" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  4. Risk Factors (HTN, Hyperlipidemia, DM, Smoker, Obese, Family Hx)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 0, label: 'No risk factors (0)' },
                    { val: 1, label: '1–2 risk factors (1)' },
                    { val: 2, label: '≥3 factors or known CAD (2)' },
                  ].map((btn) => (
                    <button
                      key={btn.val}
                      onClick={() => setHeartRiskFactors(btn.val as 0 | 1 | 2)}
                      className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                        heartRiskFactors === btn.val
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  5. Initial Troponin
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 0, label: '≤ Normal limit (0)' },
                    { val: 1, label: '1–2x normal limit (1)' },
                    { val: 2, label: '> 2x normal limit (2)' },
                  ].map((btn) => (
                    <button
                      key={btn.val}
                      onClick={() => setHeartTroponin(btn.val as 0 | 1 | 2)}
                      className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                        heartTroponin === btn.val
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* HEART Result Card */}
          <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-200 dark:border-rose-900/60 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  HEART Stratification
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  HEART Score {heartResult.score} / 10
                  <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    heartResult.riskCategory === 'High Risk'
                      ? 'bg-rose-600 text-white'
                      : heartResult.riskCategory === 'Moderate Risk'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {heartResult.riskCategory}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                  6-Week Risk of Major Adverse Cardiac Events: <strong className="text-rose-600 dark:text-rose-400">{heartResult.sixWeekMacePercent}%</strong>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-3 pt-3 border-t border-rose-200 dark:border-rose-900/40">
              {heartResult.management}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Killip Classification */}
      {activeTab === 'killip' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Killip Physical Findings in MI
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => setKillipRales(!killipRales)}
                className={`p-3 rounded-lg border text-left font-medium transition-all ${
                  killipRales ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Rales / Crackles (&lt; 50% lung bases)
              </button>
              <button
                onClick={() => setKillipS3(!killipS3)}
                className={`p-3 rounded-lg border text-left font-medium transition-all ${
                  killipS3 ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Third Heart Sound (S3 Gallop)
              </button>
              <button
                onClick={() => setKillipEdema(!killipEdema)}
                className={`p-3 rounded-lg border text-left font-medium transition-all ${
                  killipEdema ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Frank Pulmonary Edema (Diffuse rales &gt; 50%)
              </button>
              <button
                onClick={() => setKillipShock(!killipShock)}
                className={`p-3 rounded-lg border text-left font-medium transition-all ${
                  killipShock ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Cardiogenic Shock (SBP &lt; 90, cool extremities, oliguria)
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-200 dark:border-rose-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              In-Hospital Prognosis
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Killip Class {killipResult.killipClass}
              <span className="ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-rose-600 text-white">
                ~{killipResult.mortalityPercent}% Mortality
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {killipResult.description}
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: QTc Interval */}
      {activeTab === 'qtc' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Electrocardiographic Parameters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Raw QT Interval (ms)
                </label>
                <NumberStepper value={qtMs} onChange={setQtMs} min={200} max={800} step={5} unit="ms" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Heart Rate (bpm)
                </label>
                <NumberStepper value={heartRate} onChange={setHeartRate} min={30} max={220} step={1} unit="bpm" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Fridericia Formula (Preferred at HR &gt; 60)
              </span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {qtcResult.fridericiaMs} ms
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">QTc = QT / ∛(RR)</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Bazett Formula (Traditional)
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {qtcResult.bazettMs} ms
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">QTc = QT / √(RR)</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 shadow-sm text-xs text-slate-700 dark:text-slate-300">
            <strong>Clinical Guidance: </strong>
            {qtcResult.interpretation}
          </div>
        </div>
      )}

      {/* References */}
      <ReferenceAccordion references={references} />

      {/* Sticky Mobile Copy Action */}
      <StickyMobileAction
        scoreBadge={
          activeTab === 'qtc'
            ? `${qtcResult.fridericiaMs} ms`
            : activeTab === 'timi'
            ? `TIMI ${timiResult.score}/7`
            : activeTab === 'heart'
            ? `HEART ${heartResult.score}/10`
            : `Killip ${killipResult.killipClass}`
        }
        categoryLabel={
          activeTab === 'qtc'
            ? qtcResult.interpretation
            : activeTab === 'timi'
            ? timiResult.riskTier
            : activeTab === 'heart'
            ? heartResult.riskCategory
            : `~${killipResult.mortalityPercent}% Mortality`
        }
        severityColor={
          activeTab === 'qtc'
            ? qtcResult.isProlongedMale || qtcResult.isProlongedFemale
              ? 'rose'
              : 'emerald'
            : activeTab === 'timi'
            ? timiResult.riskTier === 'High'
              ? 'rose'
              : 'amber'
            : activeTab === 'heart'
            ? heartResult.riskCategory === 'High Risk'
              ? 'rose'
              : heartResult.riskCategory === 'Moderate Risk'
              ? 'amber'
              : 'emerald'
            : killipResult.killipClass === 'III' || killipResult.killipClass === 'IV'
            ? 'rose'
            : 'amber'
        }
        noteText={clinicalNote}
      />
    </div>
  );
};
