import React, { useState, useMemo } from 'react';
import { Heart, RotateCcw } from 'lucide-react';
import { StarButton } from '../ui/StarButton';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import {
  evaluateFundalHeight,
  calculateBiophysicalProfile,
  evaluateGdmOgttCarpenterCoustan,
} from '../../calculators/obgynExpanded';

interface AntenatalFetalSuiteViewProps {
  patientTag?: string;
}

export const AntenatalFetalSuiteView: React.FC<AntenatalFetalSuiteViewProps> = ({ patientTag }) => {
  const [activeTab, setActiveTab] = useState<'fundal' | 'bpp' | 'gdm'>('fundal');

  // Fundal height state
  const [fundalCm, setFundalCm] = useState(30);
  const [gaWeeks, setGaWeeks] = useState(30);

  // BPP state
  const [nstReactive, setNstReactive] = useState(true);
  const [fetalBreathing, setFetalBreathing] = useState(true);
  const [fetalMovements, setFetalMovements] = useState(true);
  const [fetalTone, setFetalTone] = useState(true);
  const [fluidVolume, setFluidVolume] = useState(true);

  // GDM state
  const [fasting, setFasting] = useState(92);
  const [oneHour, setOneHour] = useState(175);
  const [twoHour, setTwoHour] = useState(158);
  const [threeHour, setThreeHour] = useState(135);

  const fundalResult = useMemo(
    () => evaluateFundalHeight(fundalCm, gaWeeks),
    [fundalCm, gaWeeks]
  );

  const bppResult = useMemo(
    () =>
      calculateBiophysicalProfile({
        nonStressTestReactive: nstReactive,
        fetalBreathingPresent: fetalBreathing,
        grossBodyMovementsPresent: fetalMovements,
        fetalTonePresent: fetalTone,
        amnioticFluidVolumeNormal: fluidVolume,
      }),
    [nstReactive, fetalBreathing, fetalMovements, fetalTone, fluidVolume]
  );

  const gdmResult = useMemo(
    () =>
      evaluateGdmOgttCarpenterCoustan({
        fastingMgDl: fasting,
        oneHourMgDl: oneHour,
        twoHourMgDl: twoHour,
        threeHourMgDl: threeHour,
      }),
    [fasting, oneHour, twoHour, threeHour]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    if (activeTab === 'fundal') {
      return `${prefix}FUNDAL HEIGHT (McDONALD'S RULE) EVALUATION:
- Fundal Height: ${fundalCm} cm at ${gaWeeks} weeks GA (Discrepancy: ${fundalResult.discrepancyCm > 0 ? '+' : ''}${fundalResult.discrepancyCm} cm)
- Status: ${fundalResult.status}
- Recommendation: ${fundalResult.recommendation}`;
    } else if (activeTab === 'bpp') {
      return `${prefix}MANNING BIOPHYSICAL PROFILE (BPP):
- Total Score: ${bppResult.score}/10 (${bppResult.fetalStatus})
- Parameter Breakdown: NST: ${nstReactive ? '2' : '0'} | Breathing: ${fetalBreathing ? '2' : '0'} | Movements: ${fetalMovements ? '2' : '0'} | Tone: ${fetalTone ? '2' : '0'} | Fluid: ${fluidVolume ? '2' : '0'}
- Clinical Action Plan: ${bppResult.actionPlan}`;
    } else {
      return `${prefix}CARPENTER-COUSTAN 100g 3-HOUR GDM OGTT:
- Results: Fasting ${fasting} (cut: 95) | 1h ${oneHour} (cut: 180) | 2h ${twoHour} (cut: 155) | 3h ${threeHour} (cut: 140) mg/dL
- Diagnostic Criteria: ${gdmResult.abnormalCount}/4 thresholds exceeded -> ${gdmResult.hasGdm ? 'DIAGNOSIS: GESTATIONAL DIABETES MELLITUS (ACOG PB 190)' : 'NORMAL TOLERANCE'}
- Management: ${gdmResult.interpretation}`;
    }
  }, [
    patientTag,
    activeTab,
    fundalCm,
    gaWeeks,
    fundalResult,
    bppResult,
    nstReactive,
    fetalBreathing,
    fetalMovements,
    fetalTone,
    fluidVolume,
    fasting,
    oneHour,
    twoHour,
    threeHour,
    gdmResult,
  ]);

  const resetAll = () => {
    setFundalCm(30);
    setGaWeeks(30);
    setNstReactive(true);
    setFetalBreathing(true);
    setFetalMovements(true);
    setFetalTone(true);
    setFluidVolume(true);
    setFasting(92);
    setOneHour(175);
    setTwoHour(158);
    setThreeHour(135);
  };

  const references = [
    {
      source: 'ACOG Practice Bulletin No. 229 (2021)',
      title: 'Practice Bulletin No. 229: Macrosomia & Fetal Growth Restriction (Fundal Height Discordance).',
      details: 'Obstet Gynecol. 2021;137(2):e16-e28.',
    },
    {
      source: 'Manning FA, et al. Am J Obstet Gynecol 1985',
      title: 'Fetal assessment based on fetal biophysical profile scoring: experience in 12,620 referred high-risk pregnancies.',
      details: 'Am J Obstet Gynecol. 1985;151(3):343-350.',
    },
    {
      source: 'Carpenter MW, Coustan DR. Am J Obstet Gynecol 1982',
      title: 'Criteria for screening tests for gestational diabetes.',
      details: 'Am J Obstet Gynecol. 1982;144(7):768-773.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-50 dark:bg-pink-950/60 rounded-xl text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-900/40">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Antenatal & Fetal Surveillance Suite</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 rounded-md">
                ACOG PB 229 / Manning
              </span>
              <StarButton toolId="antenatal_fetal_suite" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              McDonald fundal height discrepancy, Manning Biophysical Profile (BPP) & Carpenter-Coustan GDM OGTT
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
            { id: 'fundal', label: 'Fundal Height', badge: fundalResult.status.split(' ')[0] },
            { id: 'bpp', label: 'Manning BPP', badge: `${bppResult.score}/10` },
            { id: 'gdm', label: 'GDM 3h OGTT', badge: gdmResult.hasGdm ? 'GDM+' : 'Normal' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`w-full py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-1 min-w-0 cursor-pointer tap-bounce active:scale-95 ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-xs ring-1 ring-pink-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="truncate">{t.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 font-bold ${
                activeTab === t.id
                  ? 'bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: Fundal Height */}
      {activeTab === 'fundal' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              McDonald's Measurement (Reliable 20–34 Weeks)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Fundal Height (cm)</label>
                <NumberStepper value={fundalCm} onChange={setFundalCm} min={15} max={45} step={1} unit="cm" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Gestational Age (weeks)</label>
                <NumberStepper value={gaWeeks} onChange={setGaWeeks} min={18} max={42} step={1} unit="weeks" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-transparent border border-pink-200 dark:border-pink-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-pink-700 dark:text-pink-400">
              Concordance: {fundalResult.discrepancyCm > 0 ? `+${fundalResult.discrepancyCm}` : fundalResult.discrepancyCm} cm Discrepancy
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {fundalResult.status}
              <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                fundalResult.isConcordant ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}>
                {fundalResult.isConcordant ? 'Concordant' : 'Discordant > 2cm'}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {fundalResult.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Manning BPP */}
      {activeTab === 'bpp' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              5 Ultrasound & NST Variables (2 pts if normal, 0 if abnormal)
            </h2>
            <div className="space-y-2">
              {[
                { label: 'Non-Stress Test (NST): Reactive (≥2 accelerations ≥15 bpm lasting ≥15 sec in 20-40m)', val: nstReactive, set: setNstReactive },
                { label: 'Fetal Breathing Movements: ≥1 episode of rhythmic breathing lasting ≥30 sec in 30m', val: fetalBreathing, set: setFetalBreathing },
                { label: 'Gross Body Movements: ≥3 discrete body or limb movements in 30m', val: fetalMovements, set: setFetalMovements },
                { label: 'Fetal Tone: ≥1 episode of active limb extension with return to flexion, or hand opening/closing', val: fetalTone, set: setFetalTone },
                { label: 'Amniotic Fluid Volume: ≥1 pocket measuring ≥2 cm in single deepest vertical pocket (SDP)', val: fluidVolume, set: setFluidVolume },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => item.set(!item.val)}
                  className={`w-full p-3 rounded-lg border text-left font-medium transition-all ${
                    item.val ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-300 dark:border-pink-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.val ? 'bg-pink-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      {item.val ? '2 pts' : '0 pts'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-transparent border border-pink-200 dark:border-pink-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-pink-700 dark:text-pink-400">
              Biophysical Profile Score
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              BPP: {bppResult.score} / 10
              <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                bppResult.score >= 8 ? 'bg-emerald-600 text-white' : bppResult.score === 6 ? 'bg-amber-600 text-white' : 'bg-rose-600 text-white'
              }`}>
                {bppResult.score >= 8 ? 'Reassuring' : bppResult.score === 6 ? 'Equivocal' : 'Abnormal'}
              </span>
            </div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
              {bppResult.fetalStatus}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 pt-2 border-t border-pink-200 dark:border-pink-900/40">
              {bppResult.actionPlan}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Carpenter-Coustan GDM */}
      {activeTab === 'gdm' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Carpenter-Coustan 3-Hour 100g Diagnostic Thresholds
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Fasting (Cutoff ≥ 95 mg/dL)</label>
                <NumberStepper value={fasting} onChange={setFasting} min={50} max={250} step={1} unit="mg/dL" />
              </div>
              <div>
                <label className="block font-semibold mb-1">1-Hour (Cutoff ≥ 180 mg/dL)</label>
                <NumberStepper value={oneHour} onChange={setOneHour} min={50} max={350} step={2} unit="mg/dL" />
              </div>
              <div>
                <label className="block font-semibold mb-1">2-Hour (Cutoff ≥ 155 mg/dL)</label>
                <NumberStepper value={twoHour} onChange={setTwoHour} min={50} max={350} step={2} unit="mg/dL" />
              </div>
              <div>
                <label className="block font-semibold mb-1">3-Hour (Cutoff ≥ 140 mg/dL)</label>
                <NumberStepper value={threeHour} onChange={setThreeHour} min={50} max={300} step={2} unit="mg/dL" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-transparent border border-pink-200 dark:border-pink-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-pink-700 dark:text-pink-400">
              GDM Diagnostic Result: {gdmResult.abnormalCount} / 4 Abnormal
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {gdmResult.hasGdm ? 'Gestational Diabetes Mellitus' : 'Normal Glucose Tolerance'}
              <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                gdmResult.hasGdm ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {gdmResult.hasGdm ? 'GDM Confirmed' : 'GDM Excluded'}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {gdmResult.interpretation}
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
