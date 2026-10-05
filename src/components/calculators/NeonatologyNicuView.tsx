import React, { useState, useMemo } from 'react';
import { Baby, RotateCcw } from 'lucide-react';
import { StarButton } from '../ui/StarButton';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import {
  calculateNewBallardScore,
  calculateSilvermanAndersenScore,
  calculateCorrectedAge,
  calculateMidParentalHeight,
} from '../../calculators/pediatricsExpanded';

interface NeonatologyNicuViewProps {
  patientTag?: string;
}

export const NeonatologyNicuView: React.FC<NeonatologyNicuViewProps> = ({ patientTag }) => {
  const [activeTab, setActiveTab] = useState<'ballard' | 'sa' | 'corrected_age' | 'mph'>('ballard');

  // Ballard state
  const [posture, setPosture] = useState(3);
  const [squareWindow, setSquareWindow] = useState(3);
  const [armRecoil, setArmRecoil] = useState(2);
  const [poplitealAngle, setPoplitealAngle] = useState(2);
  const [scarfSign, setScarfSign] = useState(2);
  const [heelToEar, setHeelToEar] = useState(2);
  const [skin, setSkin] = useState(3);
  const [lanugo, setLanugo] = useState(2);
  const [plantarSurface, setPlantarSurface] = useState(3);
  const [breast, setBreast] = useState(3);
  const [eyeEar, setEyeEar] = useState(2);
  const [genitals, setGenitals] = useState(3);

  // SA state
  const [upperChest, setUpperChest] = useState<0 | 1 | 2>(1);
  const [lowerChest, setLowerChest] = useState<0 | 1 | 2>(1);
  const [xiphoid, setXiphoid] = useState<0 | 1 | 2>(1);
  const [nares, setNares] = useState<0 | 1 | 2>(1);
  const [grunt, setGrunt] = useState<0 | 1 | 2>(1);

  // Corrected age
  const [chronoWeeks, setChronoWeeks] = useState(20);
  const [birthGaWeeks, setBirthGaWeeks] = useState(32);

  // MPH state
  const [fatherCm, setFatherCm] = useState(178);
  const [motherCm, setMotherCm] = useState(163);
  const [childSex, setChildSex] = useState<'boy' | 'girl'>('boy');

  const ballardResult = useMemo(
    () =>
      calculateNewBallardScore({
        posture,
        squareWindow,
        armRecoil,
        poplitealAngle,
        scarfSign,
        heelToEar,
        skin,
        lanugo,
        plantarSurface,
        breast,
        eyeEar,
        genitals,
      }),
    [posture, squareWindow, armRecoil, poplitealAngle, scarfSign, heelToEar, skin, lanugo, plantarSurface, breast, eyeEar, genitals]
  );

  const saResult = useMemo(
    () =>
      calculateSilvermanAndersenScore({
        upperChestMovement: upperChest,
        lowerChestRetractions: lowerChest,
        xiphoidRetractions: xiphoid,
        naresDilation: nares,
        expiratoryGrunt: grunt,
      }),
    [upperChest, lowerChest, xiphoid, nares, grunt]
  );

  const corrAgeResult = useMemo(
    () => calculateCorrectedAge(chronoWeeks, birthGaWeeks),
    [chronoWeeks, birthGaWeeks]
  );

  const mphResult = useMemo(
    () => calculateMidParentalHeight(fatherCm, motherCm, childSex),
    [fatherCm, motherCm, childSex]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    if (activeTab === 'ballard') {
      return `${prefix}NEW BALLARD GESTATIONAL MATURITY EVALUATION:
- Total Score: ${ballardResult.totalScore}
- Estimated Gestational Age: ${ballardResult.gestationalAgeWeeks} weeks
- Classification: ${ballardResult.classification}`;
    } else if (activeTab === 'sa') {
      return `${prefix}SILVERMAN-ANDERSEN RESPIRATORY RETRACTION SCORE:
- Total Score: ${saResult.score}/10
- Distress Tier: ${saResult.respiratoryDistressTier}
- Clinical Action: ${saResult.action}`;
    } else if (activeTab === 'corrected_age') {
      return `${prefix}NEONATAL/INFANT CORRECTED AGE CALCULATION:
- Chronological Age: ${chronoWeeks} weeks | Birth GA: ${birthGaWeeks} weeks (${corrAgeResult.weeksPremature} weeks premature)
- Corrected Age: ${corrAgeResult.correctedAgeWeeks} weeks
- Guidance: ${corrAgeResult.description}`;
    } else {
      return `${prefix}MID-PARENTAL HEIGHT (TANNER TARGET):
- Child Sex: ${childSex.toUpperCase()} | Father: ${fatherCm} cm | Mother: ${motherCm} cm
- Target Mid-Parental Height: ${mphResult.targetHeightCm} cm (${mphResult.targetHeightRangeMinCm} - ${mphResult.targetHeightRangeMaxCm} cm)
- Clinical Summary: ${mphResult.summary}`;
    }
  }, [patientTag, activeTab, ballardResult, saResult, corrAgeResult, chronoWeeks, birthGaWeeks, mphResult, childSex, fatherCm, motherCm]);

  const resetAll = () => {
    setPosture(3);
    setSquareWindow(3);
    setArmRecoil(2);
    setPoplitealAngle(2);
    setScarfSign(2);
    setHeelToEar(2);
    setSkin(3);
    setLanugo(2);
    setPlantarSurface(3);
    setBreast(3);
    setEyeEar(2);
    setGenitals(3);
    setUpperChest(1);
    setLowerChest(1);
    setXiphoid(1);
    setNares(1);
    setGrunt(1);
    setChronoWeeks(20);
    setBirthGaWeeks(32);
    setFatherCm(178);
    setMotherCm(163);
    setChildSex('boy');
  };

  const references = [
    {
      source: 'Ballard JL, et al. J Pediatr 1991',
      title: 'New Ballard Score, expanded to include extremely premature infants.',
      details: 'J Pediatr. 1991;119(3):417-423.',
    },
    {
      source: 'Silverman WA, Andersen DH. Pediatrics 1956',
      title: 'A controlled clinical trial of effects of water mist on premature infants.',
      details: 'Pediatrics. 1956;17(1):1-10.',
    },
    {
      source: 'Tanner JM, et al. Arch Dis Child 1970',
      title: 'Standards for children’s height at ages 2-9 years allowing for height of parents.',
      details: 'Arch Dis Child. 1970;45(244):755-762.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-50 dark:bg-sky-950/60 rounded-xl text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40">
            <Baby className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Neonatology & NICU Suite</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 rounded-md">
                AAP / NICU
              </span>
              <StarButton toolId="neonatology_nicu_suite" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              New Ballard score, Silverman-Andersen respiratory distress, Corrected age & Mid-parental height
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
            { id: 'ballard', label: 'New Ballard', badge: `${ballardResult.gestationalAgeWeeks}w` },
            { id: 'sa', label: 'Silverman-Andersen', badge: `${saResult.score}/10` },
            { id: 'corrected_age', label: 'Corrected Age', badge: `${corrAgeResult.correctedAgeWeeks}w` },
            { id: 'mph', label: 'Mid-Parental Ht', badge: `${mphResult.targetHeightCm} cm` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`w-full py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-1 min-w-0 cursor-pointer tap-bounce active:scale-95 ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs ring-1 ring-sky-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="truncate">{t.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 font-bold ${
                activeTab === t.id
                  ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: New Ballard Score */}
      {activeTab === 'ballard' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Neuromuscular Maturity (-1 to 5 pts)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Posture (0-4)</label>
                <NumberStepper value={posture} onChange={setPosture} min={0} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Square Window (-1 to 4)</label>
                <NumberStepper value={squareWindow} onChange={setSquareWindow} min={-1} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Arm Recoil (0-4)</label>
                <NumberStepper value={armRecoil} onChange={setArmRecoil} min={0} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Popliteal Angle (-1 to 5)</label>
                <NumberStepper value={poplitealAngle} onChange={setPoplitealAngle} min={-1} max={5} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Scarf Sign (-1 to 4)</label>
                <NumberStepper value={scarfSign} onChange={setScarfSign} min={-1} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Heel to Ear (-1 to 4)</label>
                <NumberStepper value={heelToEar} onChange={setHeelToEar} min={-1} max={4} step={1} unit="pts" />
              </div>
            </div>

            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pt-3 border-t border-slate-200 dark:border-slate-700">
              Physical Maturity (-1 to 5 pts)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Skin (-1 to 5)</label>
                <NumberStepper value={skin} onChange={setSkin} min={-1} max={5} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Lanugo (-1 to 4)</label>
                <NumberStepper value={lanugo} onChange={setLanugo} min={-1} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Plantar Surface (-2 to 4)</label>
                <NumberStepper value={plantarSurface} onChange={setPlantarSurface} min={-2} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Breast (-1 to 4)</label>
                <NumberStepper value={breast} onChange={setBreast} min={-1} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Eye / Ear (-1 to 4)</label>
                <NumberStepper value={eyeEar} onChange={setEyeEar} min={-1} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Genitals (-1 to 4)</label>
                <NumberStepper value={genitals} onChange={setGenitals} min={-1} max={4} step={1} unit="pts" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent border border-sky-200 dark:border-sky-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              Gestational Age Estimation
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {ballardResult.gestationalAgeWeeks} Weeks GA
              <span className="ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-sky-600 text-white">
                Score {ballardResult.totalScore}
              </span>
            </div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-2">
              Classification: {ballardResult.classification}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Silverman-Andersen */}
      {activeTab === 'sa' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Neonatal Respiratory Distress Signs (0–2 pts each)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Upper Chest Movement</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Synchronized (0)', 'Lag on inspiration (1)', 'See-saw sinking (2)'].map((l, idx) => (
                    <button
                      key={idx}
                      onClick={() => setUpperChest(idx as any)}
                      className={`p-2.5 rounded-lg border font-medium ${upperChest === idx ? 'bg-sky-600 text-white' : 'bg-slate-50 dark:bg-slate-800'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Lower Chest Retractions</label>
                <div className="grid grid-cols-3 gap-2">
                  {['None (0)', 'Just visible (1)', 'Marked retractions (2)'].map((l, idx) => (
                    <button
                      key={idx}
                      onClick={() => setLowerChest(idx as any)}
                      className={`p-2.5 rounded-lg border font-medium ${lowerChest === idx ? 'bg-sky-600 text-white' : 'bg-slate-50 dark:bg-slate-800'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Xiphoid Retraction</label>
                <div className="grid grid-cols-3 gap-2">
                  {['None (0)', 'Just visible (1)', 'Marked (2)'].map((l, idx) => (
                    <button
                      key={idx}
                      onClick={() => setXiphoid(idx as any)}
                      className={`p-2.5 rounded-lg border font-medium ${xiphoid === idx ? 'bg-sky-600 text-white' : 'bg-slate-50 dark:bg-slate-800'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nares Dilation (Flaring)</label>
                <div className="grid grid-cols-3 gap-2">
                  {['None (0)', 'Minimal flaring (1)', 'Marked flaring (2)'].map((l, idx) => (
                    <button
                      key={idx}
                      onClick={() => setNares(idx as any)}
                      className={`p-2.5 rounded-lg border font-medium ${nares === idx ? 'bg-sky-600 text-white' : 'bg-slate-50 dark:bg-slate-800'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Expiratory Grunting</label>
                <div className="grid grid-cols-3 gap-2">
                  {['None (0)', 'Stethoscope only (1)', 'Naked ear audible (2)'].map((l, idx) => (
                    <button
                      key={idx}
                      onClick={() => setGrunt(idx as any)}
                      className={`p-2.5 rounded-lg border font-medium ${grunt === idx ? 'bg-sky-600 text-white' : 'bg-slate-50 dark:bg-slate-800'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent border border-sky-200 dark:border-sky-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              Respiratory Distress Assessment
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Score: {saResult.score} / 10
              <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                saResult.score >= 7 ? 'bg-rose-600 text-white' : saResult.score >= 4 ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {saResult.respiratoryDistressTier}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {saResult.action}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Corrected Age */}
      {activeTab === 'corrected_age' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Prematurity Correction Inputs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Current Chronological Age (weeks)</label>
                <NumberStepper value={chronoWeeks} onChange={setChronoWeeks} min={1} max={156} step={1} unit="weeks" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Gestational Age at Birth (weeks)</label>
                <NumberStepper value={birthGaWeeks} onChange={setBirthGaWeeks} min={23} max={42} step={1} unit="weeks" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent border border-sky-200 dark:border-sky-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              Prematurity Adjustment: {corrAgeResult.weeksPremature} Weeks Early
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Corrected Age: {corrAgeResult.correctedAgeWeeks} Weeks
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {corrAgeResult.description}
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Mid-Parental Height */}
      {activeTab === 'mph' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Biological Parental Heights (cm)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Father's Height (cm)</label>
                <NumberStepper value={fatherCm} onChange={setFatherCm} min={120} max={220} step={1} unit="cm" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Mother's Height (cm)</label>
                <NumberStepper value={motherCm} onChange={setMotherCm} min={120} max={220} step={1} unit="cm" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setChildSex('boy')}
                className={`flex-1 p-2.5 rounded-lg border font-bold ${childSex === 'boy' ? 'bg-sky-600 text-white' : 'bg-slate-50 dark:bg-slate-800'}`}
              >
                Boy Target ([F + M + 13] / 2)
              </button>
              <button
                onClick={() => setChildSex('girl')}
                className={`flex-1 p-2.5 rounded-lg border font-bold ${childSex === 'girl' ? 'bg-pink-600 text-white' : 'bg-slate-50 dark:bg-slate-800'}`}
              >
                Girl Target ([F + M - 13] / 2)
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent border border-sky-200 dark:border-sky-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              Genetic Target Adult Height
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {mphResult.targetHeightCm} cm
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-2">
                ({(mphResult.targetHeightCm / 2.54).toFixed(1)} inches)
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {mphResult.summary}
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
