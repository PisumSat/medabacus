import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { ShieldCheck, RotateCcw } from 'lucide-react';
import { calculateCapriniVte } from '../../calculators/surgery';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface CapriniVteViewProps {
  patientTag?: string;
}

export const CapriniVteView: React.FC<CapriniVteViewProps> = ({ patientTag }) => {
  const [age, setAge] = useState(62);

  // 1 point items
  const [minorSurg, setMinorSurg] = useState(false);
  const [bmi25, setBmi25] = useState(true);
  const [swollenLegs, setSwollenLegs] = useState(false);
  const [varicose, setVaricose] = useState(false);
  const [preg, setPreg] = useState(false);
  const [ocp, setOcp] = useState(false);
  const [sepsis, setSepsis] = useState(false);
  const [lungDis, setLungDis] = useState(false);

  // 2 point items
  const [majorSurg, setMajorSurg] = useState(true);
  const [lapOver45, setLapOver45] = useState(false);
  const [bedridden, setBedridden] = useState(false);
  const [cvc, setCvc] = useState(false);
  const [cancer, setCancer] = useState(false);
  const [cast, setCast] = useState(false);

  // 3 point items
  const [priorVte, setPriorVte] = useState(false);
  const [famVte, setFamVte] = useState(false);
  const [leiden, setLeiden] = useState(false);
  const [lupus, setLupus] = useState(false);
  const [homocysteine, setHomocysteine] = useState(false);

  // 5 point items
  const [arthroplasty, setArthroplasty] = useState(false);
  const [fracture, setFracture] = useState(false);
  const [stroke, setStroke] = useState(false);
  const [trauma, setTrauma] = useState(false);
  const [sci, setSci] = useState(false);

  const result = useMemo(
    () =>
      calculateCapriniVte({
        ageYears: age,
        minorSurgeryPlanned: minorSurg,
        majorSurgeryOver45Min: majorSurg,
        laparoscopicSurgeryOver45Min: lapOver45,
        bmiOver25: bmi25,
        swollenLegsEdema: swollenLegs,
        varicoseVeins: varicose,
        pregnancyOrPostpartum1m: preg,
        oralContraceptiveOrHrt: ocp,
        sepsisPast1m: sepsis,
        seriousLungDiseasePast1m: lungDis,
        bedriddenConfinedToBed: bedridden,
        centralVenousAccess: cvc,
        malignancyCurrentOrPast: cancer,
        immobilizingPlasterCast: cast,
        priorDvtPeHistory: priorVte,
        familyHistoryOfVte: famVte,
        factorVLeidenOrProthrombin20210A: leiden,
        lupusAnticoagulantOrAntiphospholipid: lupus,
        elevatedSerumHomocysteine: homocysteine,
        electiveMajorArthroplasty: arthroplasty,
        hipPelvisOrLegFracturePast1m: fracture,
        strokePast1m: stroke,
        multipleTraumaPast1m: trauma,
        acuteSpinalCordInjuryPast1m: sci,
      }),
    [
      age,
      minorSurg,
      majorSurg,
      lapOver45,
      bmi25,
      swollenLegs,
      varicose,
      preg,
      ocp,
      sepsis,
      lungDis,
      bedridden,
      cvc,
      cancer,
      cast,
      priorVte,
      famVte,
      leiden,
      lupus,
      homocysteine,
      arthroplasty,
      fracture,
      stroke,
      trauma,
      sci,
    ]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}CAPRINI SURGICAL VTE RISK ASSESSMENT (General Surgery):
- Patient Age: ${age} yo
- Total Caprini Score: ${result.score} pts (${result.riskCategory} Risk | Baseline DVT Risk: ${result.dvtRiskWithoutProphylaxis})
- Recommended Thromboprophylaxis Strategy: ${result.recommendedProphylaxis}`;
  }, [patientTag, age, result]);

  const resetDefaults = () => {
    setAge(62);
    setMinorSurg(false);
    setBmi25(true);
    setSwollenLegs(false);
    setVaricose(false);
    setPreg(false);
    setOcp(false);
    setSepsis(false);
    setLungDis(false);
    setMajorSurg(true);
    setLapOver45(false);
    setBedridden(false);
    setCvc(false);
    setCancer(false);
    setCast(false);
    setPriorVte(false);
    setFamVte(false);
    setLeiden(false);
    setLupus(false);
    setHomocysteine(false);
    setArthroplasty(false);
    setFracture(false);
    setStroke(false);
    setTrauma(false);
    setSci(false);
  };

  const references = [
    {
      source: 'Caprini JA (Dis Mon 2005) / CHEST 2012',
      title: 'Thrombosis Risk Assessment as a Guide to Quality Patient Care',
      details: 'Validated across general, vascular, and plastic surgical cohorts to reduce post-surgical deep vein thrombosis and fatal pulmonary embolism.',
    },
    {
      source: 'Gould MK, et al. / CHEST Guidelines (Chest 2012)',
      title: 'Prevention of VTE in Nonorthopedic Surgical Patients',
      details: 'Patients with Caprini score >= 5 benefit from combined pharmacologic (LMWH) and mechanical (IPC) thromboprophylaxis.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Caprini VTE Risk Score (Surgery)
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                CHEST 2012
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Surgical thromboembolism risk stratification, mechanical compression & LMWH prophylaxis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="caprini_vte" showLabel />
          <button
            type="button"
            onClick={resetDefaults}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <CopyNoteButton textToCopy={clinicalNote} />
        </div>
      </div>

      {/* Age Stepper */}
      <div className="max-w-xs mb-6">
        <NumberStepper
          label="Patient Age"
          unit="years"
          value={age}
          min={18}
          max={105}
          step={1}
          onChange={setAge}
          helperText="41-60 (+1), 61-74 (+2), >=75 (+3)"
        />
      </div>

      {/* Tiered Checklist */}
      <div className="space-y-4 mb-6">
        {/* 1 Point Factors */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
            1-Point Risk Factors
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { label: 'BMI > 25 kg/m²', state: bmi25, set: setBmi25 },
              { label: 'Minor Surgery Planned', state: minorSurg, set: setMinorSurg },
              { label: 'Swollen Legs / Edema', state: swollenLegs, set: setSwollenLegs },
              { label: 'Varicose Veins', state: varicose, set: setVaricose },
              { label: 'Pregnancy or Postpartum (<1m)', state: preg, set: setPreg },
              { label: 'Oral Contraceptives or HRT', state: ocp, set: setOcp },
              { label: 'Sepsis within 1 month', state: sepsis, set: setSepsis },
              { label: 'Serious Lung Disease (<1m)', state: lungDis, set: setLungDis },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => item.set(!item.state)}
                className={`p-2 rounded-xl text-left text-xs border transition-all ${
                  item.state
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 font-bold text-indigo-950 dark:text-indigo-200'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2 Point Factors */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
            2-Point Risk Factors
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { label: 'Major Surgery (> 45 min)', state: majorSurg, set: setMajorSurg },
              { label: 'Laparoscopic Surgery (> 45 min)', state: lapOver45, set: setLapOver45 },
              { label: 'Bedridden Confined Patient (> 72h)', state: bedridden, set: setBedridden },
              { label: 'Central Venous Access (CVC/PICC)', state: cvc, set: setCvc },
              { label: 'Malignancy (Current or Past)', state: cancer, set: setCancer },
              { label: 'Immobilizing Plaster Cast', state: cast, set: setCast },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => item.set(!item.state)}
                className={`p-2 rounded-xl text-left text-xs border transition-all ${
                  item.state
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 font-bold text-indigo-950 dark:text-indigo-200'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 & 5 Point High Impact Factors */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
            3 & 5-Point High Impact Factors
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { label: 'Prior DVT or PE History (+3)', state: priorVte, set: setPriorVte },
              { label: 'Family History of VTE (+3)', state: famVte, set: setFamVte },
              { label: 'Factor V Leiden / Prothrombin 20210A (+3)', state: leiden, set: setLeiden },
              { label: 'Lupus Anticoagulant / APLS (+3)', state: lupus, set: setLupus },
              { label: 'Elective Major Arthroplasty (+5)', state: arthroplasty, set: setArthroplasty },
              { label: 'Hip, Pelvis, or Leg Fracture (<1m) (+5)', state: fracture, set: setFracture },
              { label: 'Acute Spinal Cord Injury / Paralysis (<1m) (+5)', state: sci, set: setSci },
              { label: 'Multiple Major Trauma (<1m) (+5)', state: trauma, set: setTrauma },
              { label: 'Acute Stroke (<1m) (+5)', state: stroke, set: setStroke },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => item.set(!item.state)}
                className={`p-2 rounded-xl text-left text-xs border transition-all ${
                  item.state
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 font-bold text-indigo-950 dark:text-indigo-200'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Card */}
      <div className={`p-4 rounded-2xl border mb-6 ${
        result.score >= 5
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
          : result.score >= 3
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              Caprini Score: {result.score}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              ({result.riskCategory} Risk)
            </span>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 shadow-2xs">
            DVT Risk: {result.dvtRiskWithoutProphylaxis}
          </span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
          {result.recommendedProphylaxis}
        </p>
      </div>

      {/* EHR Note */}
      <div className="mb-4">
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
        scoreBadge={`Caprini: ${result.score}`}
        categoryLabel={`${result.riskCategory} Risk (${result.dvtRiskWithoutProphylaxis} baseline)`}
        noteText={clinicalNote}
        severityColor={result.score >= 5 ? 'rose' : result.score >= 3 ? 'amber' : 'indigo'}
      />
    </div>
  );
};
