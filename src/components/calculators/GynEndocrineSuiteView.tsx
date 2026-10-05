import React, { useState, useMemo } from 'react';
import { Pill, RotateCcw } from 'lucide-react';
import { StarButton } from '../ui/StarButton';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import {
  evaluateRotterdamPcos,
  calculateFerrimanGallweyHirsutism,
} from '../../calculators/obgynExpanded';

interface GynEndocrineSuiteViewProps {
  patientTag?: string;
}

export const GynEndocrineSuiteView: React.FC<GynEndocrineSuiteViewProps> = ({ patientTag }) => {
  const [activeTab, setActiveTab] = useState<'pcos' | 'hirsutism'>('pcos');

  // Rotterdam PCOS state
  const [oligo, setOligo] = useState(true);
  const [androgen, setAndrogen] = useState(true);
  const [pcoUs, setPcoUs] = useState(true);
  const [excludedMimics, setExcludedMimics] = useState(true);

  // Ferriman-Gallwey state
  const [upperLip, setUpperLip] = useState<0 | 1 | 2 | 3 | 4>(2);
  const [chin, setChin] = useState<0 | 1 | 2 | 3 | 4>(2);
  const [chest, setChest] = useState<0 | 1 | 2 | 3 | 4>(1);
  const [upperAbdomen, setUpperAbdomen] = useState<0 | 1 | 2 | 3 | 4>(2);
  const [lowerAbdomen, setLowerAbdomen] = useState<0 | 1 | 2 | 3 | 4>(2);
  const [upperArms, setUpperArms] = useState<0 | 1 | 2 | 3 | 4>(1);
  const [thighs, setThighs] = useState<0 | 1 | 2 | 3 | 4>(2);
  const [upperBack, setUpperBack] = useState<0 | 1 | 2 | 3 | 4>(1);
  const [lowerBack, setLowerBack] = useState<0 | 1 | 2 | 3 | 4>(1);

  const pcosResult = useMemo(
    () =>
      evaluateRotterdamPcos({
        oligoOrAnovulation: oligo,
        clinicalOrBiochemicalHyperandrogenism: androgen,
        polycysticOvariesOnUltrasound: pcoUs,
        otherEtiologiesExcluded: excludedMimics,
      }),
    [oligo, androgen, pcoUs, excludedMimics]
  );

  const hirsutismResult = useMemo(
    () =>
      calculateFerrimanGallweyHirsutism({
        upperLip,
        chin,
        chest,
        upperAbdomen,
        lowerAbdomen,
        upperArms,
        thighs,
        upperBack,
        lowerBack,
      }),
    [upperLip, chin, chest, upperAbdomen, lowerAbdomen, upperArms, thighs, upperBack, lowerBack]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    if (activeTab === 'pcos') {
      return `${prefix}ROTTERDAM PCOS DIAGNOSTIC CRITERIA EVALUATION:
- Criteria Met: ${pcosResult.criteriaMetCount}/3 (Threshold: >=2 with mimics excluded)
  * Oligo/Anovulation: ${oligo ? 'Yes' : 'No'}
  * Hyperandrogenism (clinical/biochem): ${androgen ? 'Yes' : 'No'}
  * Polycystic Ovarian Morphology (US): ${pcoUs ? 'Yes' : 'No'}
  * Secondary Mimics Excluded: ${excludedMimics ? 'Yes' : 'No'}
- Status: ${pcosResult.meetsRotterdamCriteria ? 'ROTTERDAM PCOS DIAGNOSIS MET' : 'PCOS Not Established'}
- Management & Guidance: ${pcosResult.recommendation}`;
    } else {
      return `${prefix}MODIFIED FERRIMAN-GALLWEY HIRSUTISM SCORE:
- Total Score: ${hirsutismResult.score}/36
- Severity Grade: ${hirsutismResult.severity.toUpperCase()} (Hirsutism present: ${hirsutismResult.isHirsutism ? 'Yes' : 'No'})
- Cutoff: Score >= 8 denotes significant terminal androgen-dependent hair growth
- Evaluation: ${hirsutismResult.isHirsutism ? 'Significant hirsutism present. Recommend screening for hyperandrogenism.' : 'Normal terminal hair distribution.'}`;
    }
  }, [patientTag, activeTab, pcosResult, oligo, androgen, pcoUs, excludedMimics, hirsutismResult]);

  const resetAll = () => {
    setOligo(true);
    setAndrogen(true);
    setPcoUs(true);
    setExcludedMimics(true);
    setUpperLip(2);
    setChin(2);
    setChest(1);
    setUpperAbdomen(2);
    setLowerAbdomen(2);
    setUpperArms(1);
    setThighs(2);
    setUpperBack(1);
    setLowerBack(1);
  };

  const references = [
    {
      source: 'Rotterdam ESHRE/ASRM Consensus 2004',
      title: 'Revised 2003 consensus on diagnostic criteria and long-term health risks related to polycystic ovary syndrome (PCOS).',
      details: 'Fertil Steril. 2004;81(1):19-25.',
    },
    {
      source: 'Ferriman D, Gallwey JD. JCEM 1961',
      title: 'Clinical assessment of body hair growth in women (Modified Ferriman-Gallwey Score).',
      details: 'J Clin Endocrinol Metab. 1961;21:1440-1447.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-50 dark:bg-pink-950/60 rounded-xl text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-900/40">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Gynecologic Endocrinology Suite</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300 rounded-md">
                Rotterdam / ESHRE
              </span>
              <StarButton toolId="gyn_endocrine_suite" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rotterdam PCOS diagnostic criteria & Modified Ferriman-Gallwey hirsutism scoring
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

      {/* Tabs: Responsive 2-Column Grid */}
      <div className="grid grid-cols-2 border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl gap-1.5 shadow-2xs">
        {(
          [
            { id: 'pcos', label: 'Rotterdam PCOS', badge: pcosResult.meetsRotterdamCriteria ? 'Confirmed' : 'Unconfirmed' },
            { id: 'hirsutism', label: 'Ferriman-Gallwey', badge: `${hirsutismResult.score}/36` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`w-full py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-1 min-w-0 cursor-pointer tap-bounce active:scale-95 ${
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

      {/* Tab 1: Rotterdam PCOS */}
      {activeTab === 'pcos' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Rotterdam 2003 Cardinal Features (Requires ≥ 2 of 3)
            </h2>
            <div className="space-y-2">
              {[
                { label: 'Oligo- or anovulation (irregular menstrual cycles, oligomenorrhea > 35 days, or amenorrhea)', val: oligo, set: setOligo },
                { label: 'Clinical and/or biochemical signs of hyperandrogenism (hirsutism, severe acne, androgenic alopecia, or elevated testosterone)', val: androgen, set: setAndrogen },
                { label: 'Polycystic ovaries on ultrasound (≥ 20 follicles 2–9 mm per ovary or ovarian volume ≥ 10 mL)', val: pcoUs, set: setPcoUs },
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
                      {item.val ? 'Present' : 'Absent'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-3 border-t border-slate-200 dark:border-slate-700">
              <input
                type="checkbox"
                checked={excludedMimics}
                onChange={(e) => setExcludedMimics(e.target.checked)}
                className="rounded text-pink-600"
              />
              <span className="font-semibold">Secondary mimics excluded (Normal TSH, Prolactin, and 17-OHP)</span>
            </label>
          </div>

          <div className="bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-transparent border border-pink-200 dark:border-pink-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-pink-700 dark:text-pink-400">
              Rotterdam Diagnostic Determination ({pcosResult.criteriaMetCount}/3 Criteria Met)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {pcosResult.meetsRotterdamCriteria ? 'PCOS Confirmed' : 'PCOS Not Confirmed'}
              <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                pcosResult.meetsRotterdamCriteria ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-white'
              }`}>
                {pcosResult.meetsRotterdamCriteria ? 'Diagnostic Criteria Met' : 'Incomplete / Exclude Mimics'}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {pcosResult.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Ferriman-Gallwey */}
      {activeTab === 'hirsutism' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              9 Body Areas Grading (0: None, 1: Minimal, 2: More, 3: Strong, 4: Complete Virilization)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Upper Lip (0-4)</label>
                <NumberStepper value={upperLip} onChange={(v) => setUpperLip(v as any)} min={0} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Chin (0-4)</label>
                <NumberStepper value={chin} onChange={(v) => setChin(v as any)} min={0} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Chest (0-4)</label>
                <NumberStepper value={chest} onChange={(v) => setChest(v as any)} min={0} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Upper Abdomen (0-4)</label>
                <NumberStepper value={upperAbdomen} onChange={(v) => setUpperAbdomen(v as any)} min={0} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Lower Abdomen (0-4)</label>
                <NumberStepper value={lowerAbdomen} onChange={(v) => setLowerAbdomen(v as any)} min={0} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Upper Arms (0-4)</label>
                <NumberStepper value={upperArms} onChange={(v) => setUpperArms(v as any)} min={0} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Thighs (0-4)</label>
                <NumberStepper value={thighs} onChange={(v) => setThighs(v as any)} min={0} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Upper Back (0-4)</label>
                <NumberStepper value={upperBack} onChange={(v) => setUpperBack(v as any)} min={0} max={4} step={1} unit="pts" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Lower Back (0-4)</label>
                <NumberStepper value={lowerBack} onChange={(v) => setLowerBack(v as any)} min={0} max={4} step={1} unit="pts" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-transparent border border-pink-200 dark:border-pink-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-pink-700 dark:text-pink-400">
              Ferriman-Gallwey Score (Cutoff ≥ 8)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Score: {hirsutismResult.score} / 36
              <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                hirsutismResult.isHirsutism ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {hirsutismResult.severity}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {hirsutismResult.isHirsutism
                ? 'Score ≥ 8 is consistent with clinical hirsutism in women of reproductive age. Consider laboratory assessment of free/total testosterone, DHEA-S, 17-OHP, and pelvic ultrasound.'
                : 'Score < 8 represents normal terminal body hair density.'}
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
