import React, { useState, useMemo } from 'react';
import { ShieldCheck, RotateCcw } from 'lucide-react';
import { StarButton } from '../ui/StarButton';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import {
  evaluateAsaClass,
  evaluateMallampati,
  calculateStopBang,
  calculateAnkleBrachialIndex,
  evaluateBradenScale,
  calculateSurgical421Fluids,
} from '../../calculators/surgeryExpanded';

interface SurgicalRiskPreopViewProps {
  patientTag?: string;
}

export const SurgicalRiskPreopView: React.FC<SurgicalRiskPreopViewProps> = ({ patientTag }) => {
  const [activeTab, setActiveTab] = useState<'asa' | 'airway' | 'abi' | 'braden_fluids'>('asa');

  // ASA state
  const [asaGrade, setAsaGrade] = useState<1 | 2 | 3 | 4 | 5 | 6>(2);
  const [isEmergency, setIsEmergency] = useState(false);

  // Airway & STOP-BANG state
  const [mallampati, setMallampati] = useState<1 | 2 | 3 | 4>(2);
  const [snoring, setSnoring] = useState(true);
  const [tired, setTired] = useState(true);
  const [apnea, setApnea] = useState(false);
  const [htn, setHtn] = useState(true);
  const [bmiGt35, setBmiGt35] = useState(false);
  const [ageGt50, setAgeGt50] = useState(true);
  const [neckCirc, setNeckCirc] = useState(false);
  const [maleGender, setMaleGender] = useState(true);

  // ABI state
  const [rightAnkle, setRightAnkle] = useState(130);
  const [leftAnkle, setLeftAnkle] = useState(75);
  const [brachial, setBrachial] = useState(135);

  // Braden & 4-2-1 state
  const [sensory, setSensory] = useState<1 | 2 | 3 | 4>(3);
  const [moisture, setMoisture] = useState<1 | 2 | 3 | 4>(3);
  const [activity, setActivity] = useState<1 | 2 | 3 | 4>(2);
  const [mobility, setMobility] = useState<1 | 2 | 3 | 4>(2);
  const [nutrition, setNutrition] = useState<1 | 2 | 3 | 4>(2);
  const [friction, setFriction] = useState<1 | 2 | 3>(2);
  const [weightKg, setWeightKg] = useState(70);

  const asaResult = useMemo(() => evaluateAsaClass(asaGrade, isEmergency), [asaGrade, isEmergency]);
  const mallampatiResult = useMemo(() => evaluateMallampati(mallampati), [mallampati]);
  const stopBangResult = useMemo(
    () =>
      calculateStopBang({
        snoring,
        tiredFatiguedDaytime: tired,
        observedApnea: apnea,
        highBloodPressure: htn,
        bmiGt35,
        ageGt50,
        neckCircumferenceGt40cm: neckCirc,
        maleGender,
      }),
    [snoring, tired, apnea, htn, bmiGt35, ageGt50, neckCirc, maleGender]
  );

  const abiResult = useMemo(() => calculateAnkleBrachialIndex(rightAnkle, leftAnkle, brachial), [rightAnkle, leftAnkle, brachial]);

  const bradenResult = useMemo(
    () =>
      evaluateBradenScale({
        sensoryPerception: sensory,
        moisture,
        activity,
        mobility,
        nutrition,
        frictionShear: friction,
      }),
    [sensory, moisture, activity, mobility, nutrition, friction]
  );

  const fluidsResult = useMemo(() => calculateSurgical421Fluids(weightKg), [weightKg]);

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    if (activeTab === 'asa') {
      return `${prefix}ASA PHYSICAL STATUS CLASSIFICATION:
- Score: ${asaResult.classification}
- Description: ${asaResult.description}
- Perioperative Mortality Estimate: ${asaResult.perioperativeMortalityEst}`;
    } else if (activeTab === 'airway') {
      return `${prefix}PREOPERATIVE AIRWAY & SLEEP APNEA EVALUATION:
- Mallampati Class: ${mallampatiResult.grade} (${mallampatiResult.structuresVisualized}) -> ${mallampatiResult.intubationDifficulty}
- STOP-BANG OSA Screen: ${stopBangResult.score}/8 (${stopBangResult.osaRiskTier})
- Anesthetic Considerations: ${stopBangResult.preopAirwayConsiderations}`;
    } else if (activeTab === 'abi') {
      return `${prefix}ANKLE-BRACHIAL INDEX (ABI) VASCULAR EXAM:
- Right ABI: ${abiResult.rightAbi} (${abiResult.rightCategory})
- Left ABI: ${abiResult.leftAbi} (${abiResult.leftCategory})
- Overall Status: ${abiResult.worstCategory}`;
    } else {
      return `${prefix}PERIOPERATIVE NURSING & MAINTENANCE FLUIDS:
- Braden Scale: ${bradenResult.score}/23 (${bradenResult.riskLevel})
- Interventions: ${bradenResult.nursingInterventions}
- Holliday-Segar 4-2-1 Maintenance Rate: ${fluidsResult.hourlyMaintenanceMlHr} mL/hr (${fluidsResult.dailyMaintenanceMlDay} mL/day for ${weightKg} kg)`;
    }
  }, [patientTag, activeTab, asaResult, mallampatiResult, stopBangResult, abiResult, bradenResult, fluidsResult, weightKg]);

  const resetAll = () => {
    setAsaGrade(2);
    setIsEmergency(false);
    setMallampati(2);
    setSnoring(true);
    setTired(true);
    setApnea(false);
    setHtn(true);
    setBmiGt35(false);
    setAgeGt50(true);
    setNeckCirc(false);
    setMaleGender(true);
    setRightAnkle(130);
    setLeftAnkle(75);
    setBrachial(135);
    setSensory(3);
    setMoisture(3);
    setActivity(2);
    setMobility(2);
    setNutrition(2);
    setFriction(2);
    setWeightKg(70);
  };

  const references = [
    {
      source: 'American Society of Anesthesiologists 2020',
      title: 'ASA Physical Status Classification System.',
      details: 'ASA House of Delegates; 2020.',
    },
    {
      source: 'Chung F, et al. Chest 2008',
      title: 'STOP-Bang Questionnaire: A practical approach to screen for obstructive sleep apnea.',
      details: 'Chest. 2008;134(4):656-662.',
    },
    {
      source: 'Gerhard-Herman MD, et al. Circulation 2017',
      title: '2016 AHA/ACC Guideline on the Management of Patients With Lower Extremity Peripheral Artery Disease.',
      details: 'Circulation. 2017;135(12):e726-e779.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Preoperative & Nursing Risk Suite</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-md">
                ASA / AHA / Braden
              </span>
              <StarButton toolId="surgical_preop_suite" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ASA physical status, Mallampati, STOP-BANG OSA, Ankle-Brachial Index (ABI) & Braden scale
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
            { id: 'asa', label: 'ASA Class', badge: asaResult.classification.split(' ')[0] },
            { id: 'airway', label: 'Airway / STOP-BANG', badge: `${stopBangResult.score}/8` },
            { id: 'abi', label: 'ABI Vascular', badge: `${abiResult.worstCategory.split(' ')[0]}` },
            { id: 'braden_fluids', label: 'Braden & Fluids', badge: `${bradenResult.score}/23` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`w-full py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-1 min-w-0 cursor-pointer tap-bounce active:scale-95 ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs ring-1 ring-emerald-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="truncate">{t.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 font-bold ${
                activeTab === t.id
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: ASA Class */}
      {activeTab === 'asa' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Select ASA Physical Status
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((grade) => (
                <button
                  key={grade}
                  onClick={() => setAsaGrade(grade as any)}
                  className={`p-3 rounded-lg border font-bold text-center transition-all ${
                    asaGrade === grade
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ASA {['I', 'II', 'III', 'IV', 'V', 'VI'][grade - 1]}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-3 border-t border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span className="font-semibold">Emergency Operation Modifier (E)</span>
            </label>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Perioperative Risk Classification
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {asaResult.classification}
              <span className="ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-emerald-600 text-white">
                ~{asaResult.perioperativeMortalityEst} Mortality
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {asaResult.description}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Airway & STOP-BANG */}
      {activeTab === 'airway' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Mallampati Classification
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((cl) => (
                <button
                  key={cl}
                  onClick={() => setMallampati(cl as any)}
                  className={`p-3 rounded-lg border font-bold text-center ${
                    mallampati === cl ? 'bg-emerald-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Class {cl}
                </button>
              ))}
            </div>
            <div className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg">
              <strong>{mallampatiResult.grade}: </strong>{mallampatiResult.structuresVisualized} — <em>{mallampatiResult.intubationDifficulty}</em>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              STOP-BANG OSA Screening Questionnaire (1 pt each)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'Snoring loudly (louder than talking or heard through doors)', val: snoring, set: setSnoring },
                { label: 'Tired / fatigued / sleepy during daytime', val: tired, set: setTired },
                { label: 'Observed apnea / choking / gasping during sleep', val: apnea, set: setApnea },
                { label: 'High blood pressure (hypertension)', val: htn, set: setHtn },
                { label: 'BMI > 35 kg/m²', val: bmiGt35, set: setBmiGt35 },
                { label: 'Age > 50 years', val: ageGt50, set: setAgeGt50 },
                { label: 'Neck circumference > 40 cm (16 in)', val: neckCirc, set: setNeckCirc },
                { label: 'Male gender', val: maleGender, set: setMaleGender },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => item.set(!item.val)}
                  className={`p-2.5 rounded-lg border text-left font-medium ${
                    item.val ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              OSA Perioperative Risk
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              STOP-BANG Score: {stopBangResult.score} / 8
              <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                stopBangResult.osaRiskTier === 'High Risk' ? 'bg-rose-600 text-white' : stopBangResult.osaRiskTier === 'Intermediate Risk' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {stopBangResult.osaRiskTier}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {stopBangResult.preopAirwayConsiderations}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: ABI Vascular */}
      {activeTab === 'abi' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Doppler Systolic Blood Pressures (mmHg)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-1">Right Ankle SBP (DP or PT)</label>
                <NumberStepper value={rightAnkle} onChange={setRightAnkle} min={30} max={250} step={2} unit="mmHg" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Left Ankle SBP (DP or PT)</label>
                <NumberStepper value={leftAnkle} onChange={setLeftAnkle} min={30} max={250} step={2} unit="mmHg" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Highest Brachial SBP</label>
                <NumberStepper value={brachial} onChange={setBrachial} min={60} max={250} step={2} unit="mmHg" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-500">Right Lower Extremity ABI</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {abiResult.rightAbi}
              </div>
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
                {abiResult.rightCategory}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-500">Left Lower Extremity ABI</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {abiResult.leftAbi}
              </div>
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
                {abiResult.leftCategory}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Braden & Fluids */}
      {activeTab === 'braden_fluids' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Braden Pressure Injury Risk Scale (6–23 pts)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Sensory Perception (1-4)</label>
                <NumberStepper value={sensory} onChange={(v) => setSensory(v as any)} min={1} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Moisture (1-4)</label>
                <NumberStepper value={moisture} onChange={(v) => setMoisture(v as any)} min={1} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Activity (1-4)</label>
                <NumberStepper value={activity} onChange={(v) => setActivity(v as any)} min={1} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Mobility (1-4)</label>
                <NumberStepper value={mobility} onChange={(v) => setMobility(v as any)} min={1} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Nutrition (1-4)</label>
                <NumberStepper value={nutrition} onChange={(v) => setNutrition(v as any)} min={1} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Friction & Shear (1-3)</label>
                <NumberStepper value={friction} onChange={(v) => setFriction(v as any)} min={1} max={3} step={1} unit="pts" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Braden Pressure Injury Risk
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                Score {bradenResult.score} / 23
                <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                  bradenResult.score <= 12 ? 'bg-rose-600 text-white' : bradenResult.score <= 14 ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {bradenResult.riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
                {bradenResult.nursingInterventions}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm text-xs">
              <span className="font-bold uppercase text-slate-500">4-2-1 Surgical Maintenance Fluids</span>
              <div className="mt-2">
                <label className="block font-semibold mb-1">Patient Weight (kg)</label>
                <NumberStepper value={weightKg} onChange={setWeightKg} min={1} max={180} step={1} unit="kg" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                {fluidsResult.hourlyMaintenanceMlHr} mL/hr
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {fluidsResult.breakdown}
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
