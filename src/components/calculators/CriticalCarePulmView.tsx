import React, { useState, useMemo } from 'react';
import { Wind, RotateCcw } from 'lucide-react';
import { StarButton } from '../ui/StarButton';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import {
  calculateSofaScore,
  calculateQsofa,
  evaluateLightsCriteria,
  evaluateBerlinArds,
  calculateAaGradient,
} from '../../calculators/medicineExpanded';

interface CriticalCarePulmViewProps {
  patientTag?: string;
}

export const CriticalCarePulmView: React.FC<CriticalCarePulmViewProps> = ({ patientTag }) => {
  const [activeTab, setActiveTab] = useState<'sofa' | 'lights' | 'ards' | 'aa'>('sofa');

  // SOFA state
  const [sofaPfRatio, setSofaPfRatio] = useState(250);
  const [sofaVent, setSofaVent] = useState(false);
  const [sofaPlt, setSofaPlt] = useState(130);
  const [sofaBili, setSofaBili] = useState(1.4);
  const [sofaMap, setSofaMap] = useState(68);
  const [sofaVasopressor, setSofaVasopressor] = useState<'none' | 'dopamine_low_dobutamine' | 'dopamine_med_norepi_low' | 'dopamine_high_norepi_high'>('none');
  const [sofaGcs, setSofaGcs] = useState(14);
  const [sofaCr, setSofaCr] = useState(1.5);

  // qSOFA state
  const [qsofaRr, setQsofaRr] = useState(true);
  const [qsofaSbp, setQsofaSbp] = useState(false);
  const [qsofaAms, setQsofaAms] = useState(false);

  // Light's criteria state
  const [pleuralProtein, setPleuralProtein] = useState(3.4);
  const [serumProtein, setSerumProtein] = useState(6.2);
  const [pleuralLdh, setPleuralLdh] = useState(160);
  const [serumLdh, setSerumLdh] = useState(210);
  const [serumLdhUln, setSerumLdhUln] = useState(240);

  // Berlin ARDS state
  const [ardsTiming, setArdsTiming] = useState(true);
  const [ardsBilateral, setArdsBilateral] = useState(true);
  const [ardsNonCardiac, setArdsNonCardiac] = useState(true);
  const [ardsPfRatio, setArdsPfRatio] = useState(160);
  const [ardsPeep, setArdsPeep] = useState(8);

  // A-a Gradient state
  const [aaAge, setAaAge] = useState(55);
  const [aaPao2, setAaPao2] = useState(72);
  const [aaPaco2, setAaPaco2] = useState(40);
  const [aaFio2, setAaFio2] = useState(21);

  const sofaResult = useMemo(
    () =>
      calculateSofaScore({
        pao2Fio2Ratio: sofaPfRatio,
        onMechanicalVentilation: sofaVent,
        platelets: sofaPlt,
        bilirubinMgDl: sofaBili,
        meanArterialPressure: sofaMap,
        vasopressor: sofaVasopressor,
        gcsScore: sofaGcs,
        creatinineMgDl: sofaCr,
      }),
    [sofaPfRatio, sofaVent, sofaPlt, sofaBili, sofaMap, sofaVasopressor, sofaGcs, sofaCr]
  );

  const qsofaResult = useMemo(
    () =>
      calculateQsofa({
        rrGte22: qsofaRr,
        sbpLte100: qsofaSbp,
        alteredMentalStatus: qsofaAms,
      }),
    [qsofaRr, qsofaSbp, qsofaAms]
  );

  const lightsResult = useMemo(
    () =>
      evaluateLightsCriteria({
        pleuralProtein,
        serumProtein,
        pleuralLdh,
        serumLdh,
        serumLdhUpperLimitNormal: serumLdhUln,
      }),
    [pleuralProtein, serumProtein, pleuralLdh, serumLdh, serumLdhUln]
  );

  const ardsResult = useMemo(
    () =>
      evaluateBerlinArds({
        timingWithin7Days: ardsTiming,
        bilateralOpacitiesOnImaging: ardsBilateral,
        edemaNotFullyExplainedByHf: ardsNonCardiac,
        pao2Fio2Ratio: ardsPfRatio,
        peepCmH2o: ardsPeep,
      }),
    [ardsTiming, ardsBilateral, ardsNonCardiac, ardsPfRatio, ardsPeep]
  );

  const aaResult = useMemo(
    () =>
      calculateAaGradient({
        ageYears: aaAge,
        pao2MmHg: aaPao2,
        paco2MmHg: aaPaco2,
        fio2Percent: aaFio2,
      }),
    [aaAge, aaPao2, aaPaco2, aaFio2]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    if (activeTab === 'sofa') {
      return `${prefix}SOFA & qSOFA SEPSIS ASSESSMENT:
- Total SOFA Score: ${sofaResult.totalScore}/24 (${sofaResult.mortalityEstimate})
  * Resp: ${sofaResult.organScores.resp} | Coag: ${sofaResult.organScores.coag} | Liver: ${sofaResult.organScores.liver} | CV: ${sofaResult.organScores.cv} | CNS: ${sofaResult.organScores.cns} | Renal: ${sofaResult.organScores.renal}
- Bedside qSOFA: ${qsofaResult.score}/3 (${qsofaResult.isPositive ? 'POSITIVE' : 'Negative'})
- Plan: ${qsofaResult.recommendation}`;
    } else if (activeTab === 'lights') {
      return `${prefix}LIGHT'S CRITERIA PLEURAL EFFUSION ANALYSIS:
- Classification: ${lightsResult.classification}
- Criteria Met: ${lightsResult.criteriaMet.join(', ') || 'None (Transudative)'}
- Clinical Plan: ${lightsResult.workup}`;
    } else if (activeTab === 'ards') {
      return `${prefix}BERLIN ARDS EVALUATION:
- Diagnosis: ${ardsResult.isArds ? ardsResult.severity : 'Not meeting ARDS criteria'}
- PaO2/FiO2 Ratio: ${ardsPfRatio} mmHg (PEEP ${ardsPeep} cmH2O)
- Estimated Mortality: ${ardsResult.mortality}
- Management: ${ardsResult.recommendation}`;
    } else {
      return `${prefix}ALVEOLAR-ARTERIAL (A-a) OXYGEN GRADIENT:
- Age: ${aaAge} yo | FiO2: ${aaFio2}% | PaO2: ${aaPao2} mmHg | PaCO2: ${aaPaco2} mmHg
- Calculated Alveolar PAO2: ${aaResult.calculatedPao2Alveolar} mmHg
- A-a Gradient: ${aaResult.aaGradientMmHg} mmHg (Expected normal for age: ≤ ${aaResult.expectedGradientForAge} mmHg)
- Impression: ${aaResult.interpretation}`;
    }
  }, [patientTag, activeTab, sofaResult, qsofaResult, lightsResult, ardsResult, ardsPfRatio, ardsPeep, aaAge, aaFio2, aaPao2, aaPaco2, aaResult]);

  const resetAll = () => {
    setSofaPfRatio(250);
    setSofaVent(false);
    setSofaPlt(130);
    setSofaBili(1.4);
    setSofaMap(68);
    setSofaVasopressor('none');
    setSofaGcs(14);
    setSofaCr(1.5);
    setQsofaRr(true);
    setQsofaSbp(false);
    setQsofaAms(false);
    setPleuralProtein(3.4);
    setSerumProtein(6.2);
    setPleuralLdh(160);
    setSerumLdh(210);
    setSerumLdhUln(240);
    setArdsTiming(true);
    setArdsBilateral(true);
    setArdsNonCardiac(true);
    setArdsPfRatio(160);
    setArdsPeep(8);
    setAaAge(55);
    setAaPao2(72);
    setAaPaco2(40);
    setAaFio2(21);
  };

  const references = [
    {
      source: 'Singer M, et al. JAMA 2016',
      title: 'The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3).',
      details: 'JAMA. 2016;315(8):801-810.',
    },
    {
      source: 'Light RW, et al. Ann Intern Med 1972',
      title: 'Pleural effusions: the physiological approach to diagnosis.',
      details: 'Ann Intern Med. 1972;77(4):507-513.',
    },
    {
      source: 'ARDS Definition Task Force. JAMA 2012',
      title: 'Acute respiratory distress syndrome: the Berlin Definition.',
      details: 'JAMA. 2012;307(23):2526-2533.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-50 dark:bg-cyan-950/60 rounded-xl text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/40">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Critical Care & Pulmonology Suite</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 rounded-md">
                Sepsis-3 / ATS / ESICM
              </span>
              <StarButton toolId="critical_care_suite" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              SOFA, qSOFA, Light's criteria, Berlin ARDS classification & A-a oxygen gradient
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
            { id: 'sofa', label: 'SOFA & qSOFA', badge: `${sofaResult.totalScore}/24` },
            { id: 'lights', label: "Light's Criteria", badge: lightsResult.isExudate ? 'Exudate' : 'Transudate' },
            { id: 'ards', label: 'Berlin ARDS', badge: ardsResult.isArds ? ardsResult.severity.split(' ')[0] : 'None' },
            { id: 'aa', label: 'A-a Gradient', badge: `${aaResult.aaGradientMmHg} mmHg` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`w-full py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-1 min-w-0 cursor-pointer tap-bounce active:scale-95 ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs ring-1 ring-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="truncate">{t.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 font-bold ${
                activeTab === t.id
                  ? 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: SOFA & qSOFA */}
      {activeTab === 'sofa' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              SOFA Multi-Organ Dysfunction Parameters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  PaO2 / FiO2 Ratio (mmHg)
                </label>
                <NumberStepper value={sofaPfRatio} onChange={setSofaPfRatio} min={50} max={600} step={10} unit="P/F" />
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sofaVent}
                    onChange={(e) => setSofaVent(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Mechanical ventilation required</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Platelets (x10³/μL)
                </label>
                <NumberStepper value={sofaPlt} onChange={setSofaPlt} min={5} max={500} step={5} unit="k/μL" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Bilirubin (mg/dL)
                </label>
                <NumberStepper value={sofaBili} onChange={setSofaBili} min={0.2} max={25.0} step={0.2} unit="mg/dL" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mean Arterial Pressure (MAP mmHg)
                </label>
                <NumberStepper value={sofaMap} onChange={setSofaMap} min={30} max={150} step={2} unit="mmHg" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vasopressor Support
                </label>
                <select
                  value={sofaVasopressor}
                  onChange={(e) => setSofaVasopressor(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="none">None (MAP based)</option>
                  <option value="dopamine_low_dobutamine">Dopamine ≤ 5 or any Dobutamine</option>
                  <option value="dopamine_med_norepi_low">Dopamine 5.1–15 or Norepi ≤ 0.1 mcg/kg/min</option>
                  <option value="dopamine_high_norepi_high">Dopamine &gt; 15 or Norepi &gt; 0.1 mcg/kg/min</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Glasgow Coma Scale (GCS)
                </label>
                <NumberStepper value={sofaGcs} onChange={setSofaGcs} min={3} max={15} step={1} unit="pts" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Serum Creatinine (mg/dL)
                </label>
                <NumberStepper value={sofaCr} onChange={setSofaCr} min={0.4} max={15.0} step={0.1} unit="mg/dL" />
              </div>
            </div>
          </div>

          {/* Quick Bedside qSOFA */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Bedside Quick SOFA (qSOFA) Screen
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setQsofaRr(!qsofaRr)}
                className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                  qsofaRr ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                RR ≥ 22 breaths/min
              </button>
              <button
                onClick={() => setQsofaSbp(!qsofaSbp)}
                className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                  qsofaSbp ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                SBP ≤ 100 mmHg
              </button>
              <button
                onClick={() => setQsofaAms(!qsofaAms)}
                className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                  qsofaAms ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Altered Mental Status (GCS &lt; 15)
              </button>
            </div>
          </div>

          {/* Results Card */}
          <div className="bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-200 dark:border-cyan-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
              Sepsis Severity & In-Hospital Mortality
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              SOFA Score {sofaResult.totalScore} / 24
              <span className="ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-cyan-600 text-white">
                {sofaResult.mortalityEstimate}
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
              Bedside qSOFA: <strong className={qsofaResult.isPositive ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>{qsofaResult.score}/3 ({qsofaResult.isPositive ? 'High Risk' : 'Low Risk'})</strong>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {qsofaResult.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Light's Criteria */}
      {activeTab === 'lights' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Pleural Fluid & Serum Chemistry
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pleural Fluid Total Protein (g/dL)
                </label>
                <NumberStepper value={pleuralProtein} onChange={setPleuralProtein} min={0.5} max={10.0} step={0.1} unit="g/dL" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Serum Total Protein (g/dL)
                </label>
                <NumberStepper value={serumProtein} onChange={setSerumProtein} min={2.0} max={12.0} step={0.1} unit="g/dL" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pleural Fluid LDH (U/L)
                </label>
                <NumberStepper value={pleuralLdh} onChange={setPleuralLdh} min={20} max={2000} step={10} unit="U/L" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Serum LDH (U/L)
                </label>
                <NumberStepper value={serumLdh} onChange={setSerumLdh} min={50} max={2000} step={10} unit="U/L" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-200 dark:border-cyan-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
              Light's Diagnostic Output
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {lightsResult.classification}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              <strong>Criteria Met: </strong>
              {lightsResult.criteriaMet.length > 0 ? lightsResult.criteriaMet.join(' • ') : 'None (all transudate criteria met)'}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 pt-2 border-t border-cyan-200 dark:border-cyan-900/40">
              {lightsResult.workup}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Berlin ARDS */}
      {activeTab === 'ards' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Berlin 2012 ARDS Definition Checklist
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={ardsTiming} onChange={(e) => setArdsTiming(e.target.checked)} className="rounded text-cyan-600" />
              <span>Timing: Within 1 week of a known clinical insult or new/worsening respiratory symptoms</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={ardsBilateral} onChange={(e) => setArdsBilateral(e.target.checked)} className="rounded text-cyan-600" />
              <span>Chest Imaging: Bilateral opacities not fully explained by effusions, lobar collapse, or nodules</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={ardsNonCardiac} onChange={(e) => setArdsNonCardiac(e.target.checked)} className="rounded text-cyan-600" />
              <span>Origin of Edema: Respiratory failure not fully explained by cardiac failure or fluid overload</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div>
                <label className="block font-semibold mb-1">PaO2 / FiO2 Ratio (mmHg)</label>
                <NumberStepper value={ardsPfRatio} onChange={setArdsPfRatio} min={40} max={500} step={10} unit="mmHg" />
              </div>
              <div>
                <label className="block font-semibold mb-1">PEEP or CPAP (cmH2O)</label>
                <NumberStepper value={ardsPeep} onChange={setArdsPeep} min={0} max={25} step={1} unit="cmH2O" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-200 dark:border-cyan-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
              ARDS Staging
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {ardsResult.severity}
              {ardsResult.isArds && (
                <span className="ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-rose-600 text-white">
                  {ardsResult.mortality}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {ardsResult.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: A-a Gradient */}
      {activeTab === 'aa' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Blood Gas & FiO2 Parameters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Patient Age (years)</label>
                <NumberStepper value={aaAge} onChange={setAaAge} min={1} max={100} step={1} unit="yo" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">FiO2 Inspired Oxygen (%)</label>
                <NumberStepper value={aaFio2} onChange={setAaFio2} min={21} max={100} step={5} unit="%" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Arterial PaO2 (mmHg)</label>
                <NumberStepper value={aaPao2} onChange={setAaPao2} min={30} max={500} step={2} unit="mmHg" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Arterial PaCO2 (mmHg)</label>
                <NumberStepper value={aaPaco2} onChange={setAaPaco2} min={15} max={120} step={1} unit="mmHg" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-200 dark:border-cyan-900/60 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                  Calculated Oxygen Gradient
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  A-a Gradient: {aaResult.aaGradientMmHg} mmHg
                  <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    aaResult.isElevated ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {aaResult.isElevated ? 'Elevated' : 'Normal'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Calculated Alveolar PAO2: {aaResult.calculatedPao2Alveolar} mmHg | Expected for Age ({aaAge}yo): ≤ {aaResult.expectedGradientForAge} mmHg
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-3 pt-3 border-t border-cyan-200 dark:border-cyan-900/40">
              {aaResult.interpretation}
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
