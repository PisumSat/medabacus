import { useState } from 'react';
import { Heart } from 'lucide-react';
import { CopyNoteButton } from '../CopyNoteButton';
import { NumberStepper } from '../ui/NumberStepper';
import {
  calculateRomaScore,
  evaluateAmselCriteria,
  evaluateSwanseaCriteria,
  evaluateUmbilicalDoppler,
  classifyPalmCoein,
} from '../../calculators/clinicalWikiObgyn';

interface ObgynWikiSuiteViewProps {
  patientTag?: string;
  initialTab?: string;
}

export default function ObgynWikiSuiteView({
  patientTag,
  initialTab = 'roma',
}: ObgynWikiSuiteViewProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // ROMA state
  const [romaCa125, setRomaCa125] = useState(85);
  const [romaHe4, setRomaHe4] = useState(110);
  const [romaPostmeno, setRomaPostmeno] = useState(true);

  // Amsel state
  const [amselDischarge, setAmselDischarge] = useState(true);
  const [amselPh, setAmselPh] = useState(true);
  const [amselWhiff, setAmselWhiff] = useState(true);
  const [amselClue, setAmselClue] = useState(true);

  // Swansea state
  const [swVomiting, setSwVomiting] = useState(true);
  const [swAbdPain, setSwAbdPain] = useState(true);
  const [swPolydipsia, setSwPolydipsia] = useState(true);
  const [swEnceph, setSwEnceph] = useState(false);
  const [swBilirubin, setSwBilirubin] = useState(true);
  const [swHypoglycemia, setSwHypoglycemia] = useState(true);
  const [swUricAcid, setSwUricAcid] = useState(true);
  const [swWbc, setSwWbc] = useState(true);
  const [swAscites, setSwAscites] = useState(false);
  const [swAstAlt, setSwAstAlt] = useState(true);
  const [swAmmonia, setSwAmmonia] = useState(false);
  const [swRenal, setSwRenal] = useState(false);
  const [swCoag, setSwCoag] = useState(false);
  const [swBiopsy, setSwBiopsy] = useState(false);

  // Umbilical Doppler state
  const [dopGaWeeks, setDopGaWeeks] = useState(32);
  const [dopSystolic, setDopSystolic] = useState(48);
  const [dopDiastolic, setDopDiastolic] = useState(12);
  const [dopMean, setDopMean] = useState(24);

  // PALM-COEIN state
  const [palmP, setPalmP] = useState(false);
  const [palmA, setPalmA] = useState(false);
  const [palmL, setPalmL] = useState(true);
  const [palmM, setPalmM] = useState(false);
  const [palmC, setPalmC] = useState(false);
  const [palmO, setPalmO] = useState(true);
  const [palmE, setPalmE] = useState(false);
  const [palmI, setPalmI] = useState(false);
  const [palmN, setPalmN] = useState(false);

  // Computations
  const romaResult = calculateRomaScore(romaCa125, romaHe4, romaPostmeno);
  const amselResult = evaluateAmselCriteria({
    homogeneousThinWhiteGrayDischarge: amselDischarge,
    vaginalPhGreaterThan4_5: amselPh,
    positiveWhiffTestFishyOdor10PercentKOH: amselWhiff,
    clueCellsPresentAtLeast20PercentWetMount: amselClue,
  });
  const swanseaResult = evaluateSwanseaCriteria({
    vomiting: swVomiting,
    abdominalPain: swAbdPain,
    polydipsiaPolyuria: swPolydipsia,
    encephalopathy: swEnceph,
    elevatedBilirubinOver14UmolL: swBilirubin,
    hypoglycemiaUnder4MmolL: swHypoglycemia,
    elevatedUricAcidOver340UmolL: swUricAcid,
    leukocytosisOver11: swWbc,
    ascitesOrBrightLiverOnUltrasound: swAscites,
    elevatedTransaminasesAstOrAltOver42: swAstAlt,
    elevatedAmmoniaOver47UmolL: swAmmonia,
    renalImpairmentCreatinineOver150UmolL: swRenal,
    coagulopathyPtOver14OrApttOver34: swCoag,
    microvesicularSteatosisOnLiverBiopsy: swBiopsy,
  });
  const dopplerResult = evaluateUmbilicalDoppler(dopGaWeeks, dopSystolic, dopDiastolic, dopMean);
  const palmResult = classifyPalmCoein({
    polyp: palmP,
    adenomyosis: palmA,
    leiomyoma: palmL,
    malignancyOrHyperplasia: palmM,
    coagulopathy: palmC,
    ovulatoryDysfunction: palmO,
    endometrial: palmE,
    iatrogenic: palmI,
    notOtherwiseSpecified: palmN,
  });

  const ehrNote = `OB/GYN WIKI CLINICAL CONSULTATION NOTE
Patient: ${patientTag || 'Bedside Obstetric / Gynecologic Evaluation'}
Date/Time: ${new Date().toLocaleString()}

1. ROMA SCORE (OVARIAN CANCER RISK - CA-125 + HE4):
- CA-125: ${romaCa125} U/mL, HE4: ${romaHe4} pmol/L (${romaPostmeno ? 'Postmenopausal' : 'Premenopausal'})
- ROMA Probability: ${romaResult.romaPercentage}% (${romaResult.riskCategory})
- Plan: ${romaResult.referralRecommendation}

2. AMSEL CRITERIA FOR BACTERIAL VAGINOSIS:
- Positive Criteria: ${amselResult.criteriaMetCount}/4 (${amselResult.bvConfirmed ? 'BV POSITIVE' : 'BV Negative'})
- Antibiotic Regimen: ${amselResult.firstLineTherapy}

3. SWANSEA CRITERIA FOR ACUTE FATTY LIVER OF PREGNANCY (AFLP):
- Positive Criteria: ${swanseaResult.criteriaCount}/14 (${swanseaResult.aflpConfirmed ? 'CRITICAL AFLP MET' : 'AFLP Not Met'})
- Obstetric Action: ${swanseaResult.emergencyObstetricPlan}

4. UMBILICAL ARTERY DOPPLER VELOCIMETRY:
- GA: ${dopGaWeeks}wks, S/D Ratio: ${dopplerResult.sdRatio}, Pulsatility Index: ${dopplerResult.pulsatilityIndex}
- Status: ${dopplerResult.dopplerStatus}
- Surveillance Plan: ${dopplerResult.actionPlan}

5. FIGO PALM-COEIN AUB CLASSIFICATION:
- Classification Code: ${palmResult.figoCode}
- Structural Etiologies: ${palmResult.structuralCauses.join(', ') || 'None'}
- Non-Structural: ${palmResult.nonStructuralCauses.join(', ') || 'None'}

Guideline Sources: ACOG/SGO, CDC 2021, Ch’ng Gut, SMFM 2020, FIGO 2018.`;

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 dark:border-slate-700/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
              Wiki Master Suite
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              ACOG · SGO · SMFM · FIGO · CDC
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            OB/GYN & Fetal Medicine Wiki Suite
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            High-yield OB/GYN tools: ROMA Ovarian Algorithm (CA-125 + HE4), Amsel BV criteria, Umbilical Doppler, Swansea AFLP & FIGO PALM-COEIN
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <CopyNoteButton textToCopy={ehrNote} />
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl mb-5 gap-1 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('roma')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'roma'
              ? 'bg-white dark:bg-slate-800 text-pink-700 dark:text-pink-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          ROMA Ovarian
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('amsel')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'amsel'
              ? 'bg-white dark:bg-slate-800 text-pink-700 dark:text-pink-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Amsel BV
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('doppler')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'doppler'
              ? 'bg-white dark:bg-slate-800 text-pink-700 dark:text-pink-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Umbilical Doppler
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('swansea')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'swansea'
              ? 'bg-white dark:bg-slate-800 text-pink-700 dark:text-pink-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Swansea AFLP
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('palm')}
          className={`py-2 px-1 text-center text-xs font-bold rounded-xl transition-all truncate ${
            activeTab === 'palm'
              ? 'bg-white dark:bg-slate-800 text-pink-700 dark:text-pink-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          PALM-COEIN
        </button>
      </div>

      {/* Tab 1: ROMA Score */}
      {activeTab === 'roma' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumberStepper label="Serum CA-125" unit="U/mL" value={romaCa125} onChange={setRomaCa125} min={1} max={5000} step={5} />
            <NumberStepper label="Serum HE4" unit="pmol/L" value={romaHe4} onChange={setRomaHe4} min={10} max={1500} step={5} />
          </div>

          <button
            type="button"
            onClick={() => setRomaPostmeno(!romaPostmeno)}
            className={`w-full p-2.5 rounded-xl text-xs font-bold border transition-all ${
              romaPostmeno ? 'bg-pink-600 text-white border-pink-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Menopausal Status: {romaPostmeno ? 'Postmenopausal (Cutoff ≥ 29.9%)' : 'Premenopausal (Cutoff ≥ 11.4%)'}
          </button>

          <div className="p-4 rounded-xl border border-pink-200 dark:border-pink-900 bg-pink-50/70 dark:bg-pink-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-pink-900 dark:text-pink-300 uppercase tracking-wider">ROMA Ovarian Malignancy Probability</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${
                romaResult.riskCategory.includes('High') ? 'bg-red-600' : 'bg-emerald-600'
              }`}>
                ROMA: {romaResult.romaPercentage}%
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {romaResult.riskCategory}
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-1">
              {romaResult.referralRecommendation}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {romaResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Amsel BV */}
      {activeTab === 'amsel' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: '1. Homogeneous, thin, gray-white discharge', val: amselDischarge, set: setAmselDischarge },
              { label: '2. Vaginal pH > 4.5', val: amselPh, set: setAmselPh },
              { label: '3. Positive Whiff test (fishy amine odor with 10% KOH)', val: amselWhiff, set: setAmselWhiff },
              { label: '4. Clue cells ≥ 20% on saline wet mount', val: amselClue, set: setAmselClue },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => item.set(!item.val)}
                className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                  item.val
                    ? 'bg-pink-50 dark:bg-pink-950/60 border-pink-400 dark:border-pink-700 text-pink-950 dark:text-pink-200'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{item.label}</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                  item.val ? 'bg-pink-600 text-white border-pink-600' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {item.val ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-pink-200 dark:border-pink-900 bg-pink-50/70 dark:bg-pink-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-pink-900 dark:text-pink-300 uppercase tracking-wider">Amsel BV Evaluation</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${
                amselResult.bvConfirmed ? 'bg-red-600' : 'bg-emerald-600'
              }`}>
                {amselResult.criteriaMetCount}/4 ({amselResult.bvConfirmed ? 'BV POSITIVE' : 'BV NEGATIVE'})
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {amselResult.firstLineTherapy}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {amselResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 3: Umbilical Doppler */}
      {activeTab === 'doppler' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <NumberStepper label="Gestational Age" unit="weeks" value={dopGaWeeks} onChange={setDopGaWeeks} min={24} max={42} step={1} />
            <NumberStepper label="Peak Systolic Vel" unit="cm/s" value={dopSystolic} onChange={setDopSystolic} min={10} max={120} step={2} />
            <NumberStepper label="End Diastolic Vel" unit="cm/s" value={dopDiastolic} onChange={setDopDiastolic} min={-10} max={60} step={2} />
            <NumberStepper label="Time-Averaged Mean" unit="cm/s" value={dopMean} onChange={setDopMean} min={5} max={80} step={2} />
          </div>

          <div className="p-4 rounded-xl border border-pink-200 dark:border-pink-900 bg-pink-50/70 dark:bg-pink-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-pink-900 dark:text-pink-300 uppercase tracking-wider">Umbilical Artery Flow</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${
                dopplerResult.dopplerStatus.includes('Reversed') || dopplerResult.dopplerStatus.includes('Absent')
                  ? 'bg-red-600'
                  : dopplerResult.dopplerStatus.includes('Elevated')
                  ? 'bg-amber-600'
                  : 'bg-emerald-600'
              }`}>
                {dopplerResult.dopplerStatus}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              S/D Ratio: {dopplerResult.sdRatio} · Pulsatility Index: {dopplerResult.pulsatilityIndex}
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-1">
              {dopplerResult.actionPlan}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {dopplerResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 4: Swansea AFLP */}
      {activeTab === 'swansea' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: 'Vomiting', val: swVomiting, set: setSwVomiting },
              { label: 'Abdominal pain', val: swAbdPain, set: setSwAbdPain },
              { label: 'Polydipsia / Polyuria', val: swPolydipsia, set: setSwPolydipsia },
              { label: 'Encephalopathy', val: swEnceph, set: setSwEnceph },
              { label: 'Elevated Bilirubin > 0.8 mg/dL', val: swBilirubin, set: setSwBilirubin },
              { label: 'Hypoglycemia < 72 mg/dL (< 4 mmol/L)', val: swHypoglycemia, set: setSwHypoglycemia },
              { label: 'Elevated Uric Acid > 5.7 mg/dL', val: swUricAcid, set: setSwUricAcid },
              { label: 'Leukocytosis WBC > 11,000 /µL', val: swWbc, set: setSwWbc },
              { label: 'Ascites or bright liver on ultrasound', val: swAscites, set: setSwAscites },
              { label: 'Elevated AST or ALT > 42 U/L', val: swAstAlt, set: setSwAstAlt },
              { label: 'Elevated Ammonia > 47 µmol/L', val: swAmmonia, set: setSwAmmonia },
              { label: 'Renal impairment Creatinine > 1.7 mg/dL', val: swRenal, set: setSwRenal },
              { label: 'Coagulopathy (PT > 14s or aPTT > 34s)', val: swCoag, set: setSwCoag },
              { label: 'Microvesicular steatosis on biopsy', val: swBiopsy, set: setSwBiopsy },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => item.set(!item.val)}
                className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                  item.val
                    ? 'bg-red-50 dark:bg-red-950/60 border-red-400 dark:border-red-700 text-red-950 dark:text-red-200'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{item.label}</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                  item.val ? 'bg-red-600 text-white border-red-600' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {item.val ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-red-900 dark:text-red-300 uppercase tracking-wider">Swansea AFLP Criteria</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${
                swanseaResult.aflpConfirmed ? 'bg-red-600' : 'bg-slate-600'
              }`}>
                {swanseaResult.criteriaCount}/14 ({swanseaResult.aflpConfirmed ? 'AFLP CONFIRMED (≥6)' : 'AFLP NOT MET'})
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {swanseaResult.emergencyObstetricPlan}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {swanseaResult.guideline}
            </span>
          </div>
        </div>
      )}

      {/* Tab 5: FIGO PALM-COEIN */}
      {activeTab === 'palm' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-pink-700 dark:text-pink-400 uppercase tracking-wider block">PALM (Structural)</span>
              {[
                { label: 'Polyp (AUB-P)', val: palmP, set: setPalmP },
                { label: 'Adenomyosis (AUB-A)', val: palmA, set: setPalmA },
                { label: 'Leiomyoma (AUB-L)', val: palmL, set: setPalmL },
                { label: 'Malignancy / Hyperplasia (AUB-M)', val: palmM, set: setPalmM },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => item.set(!item.val)}
                  className={`w-full p-2 rounded-lg text-left text-xs font-semibold border flex items-center justify-between transition-all ${
                    item.val ? 'bg-pink-100 dark:bg-pink-950 border-pink-500 text-pink-900 dark:text-pink-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                  <span>{item.val ? '✓' : ''}</span>
                </button>
              ))}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-pink-700 dark:text-pink-400 uppercase tracking-wider block">COEIN (Non-Structural)</span>
              {[
                { label: 'Coagulopathy (AUB-C)', val: palmC, set: setPalmC },
                { label: 'Ovulatory Dysfunction (AUB-O)', val: palmO, set: setPalmO },
                { label: 'Endometrial (AUB-E)', val: palmE, set: setPalmE },
                { label: 'Iatrogenic (AUB-I)', val: palmI, set: setPalmI },
                { label: 'Not Otherwise Classified (AUB-N)', val: palmN, set: setPalmN },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => item.set(!item.val)}
                  className={`w-full p-2 rounded-lg text-left text-xs font-semibold border flex items-center justify-between transition-all ${
                    item.val ? 'bg-pink-100 dark:bg-pink-950 border-pink-500 text-pink-900 dark:text-pink-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                  <span>{item.val ? '✓' : ''}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-pink-200 dark:border-pink-900 bg-pink-50/70 dark:bg-pink-950/40">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-pink-900 dark:text-pink-300 uppercase tracking-wider">FIGO AUB Classification</span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-pink-600 text-white">
                {palmResult.figoCode}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Structural Causes: {palmResult.structuralCauses.join(', ') || 'None identified'}
            </p>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Non-Structural Causes: {palmResult.nonStructuralCauses.join(', ') || 'None identified'}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Guideline: {palmResult.guideline}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
