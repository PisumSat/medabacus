import React, { useState, useMemo } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';
import { StarButton } from '../ui/StarButton';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import {
  calculateWestleyCroupScore,
  evaluatePecarnHeadTrauma,
  evaluateKawasakiDisease,
} from '../../calculators/pediatricsExpanded';

interface PediatricEmergencyViewProps {
  patientTag?: string;
}

export const PediatricEmergencyView: React.FC<PediatricEmergencyViewProps> = ({ patientTag }) => {
  const [activeTab, setActiveTab] = useState<'croup' | 'pecarn' | 'kawasaki'>('croup');

  // Croup state
  const [stridor, setStridor] = useState<0 | 1 | 2>(1);
  const [retractions, setRetractions] = useState<0 | 1 | 2 | 3>(2);
  const [airEntry, setAirEntry] = useState<0 | 1 | 2>(1);
  const [cyanosis, setCyanosis] = useState<0 | 4 | 5>(0);
  const [consciousness, setConsciousness] = useState<0 | 5>(0);

  // PECARN state
  const [pecarnAge, setPecarnAge] = useState(1.5);
  const [gcsLt15, setGcsLt15] = useState(false);
  const [alteredMental, setAlteredMental] = useState(false);
  const [skullFx, setSkullFx] = useState(false);
  const [hematoma, setHematoma] = useState(true);
  const [locGt5s, setLocGt5s] = useState(false);
  const [severeMechanism, setSevereMechanism] = useState(false);
  const [vomitHeadache, setVomitHeadache] = useState(false);
  const [actingAbnormal, setActingAbnormal] = useState(false);

  // Kawasaki state
  const [feverDays, setFeverDays] = useState(5);
  const [conjunctiva, setConjunctiva] = useState(true);
  const [oralChanges, setOralChanges] = useState(true);
  const [extremity, setExtremity] = useState(true);
  const [rash, setRash] = useState(true);
  const [cervicalNode, setCervicalNode] = useState(false);

  const croupResult = useMemo(
    () =>
      calculateWestleyCroupScore({
        stridor,
        retractions,
        airEntry,
        cyanosis,
        consciousness,
      }),
    [stridor, retractions, airEntry, cyanosis, consciousness]
  );

  const pecarnResult = useMemo(
    () =>
      evaluatePecarnHeadTrauma({
        ageYears: pecarnAge,
        gcsLt15,
        alteredMentalStatus: alteredMental,
        palpableSkullFractureOrBasilarSigns: skullFx,
        occipitalOrParietalHematoma: hematoma,
        locGt5Seconds: locGt5s,
        severeMechanism,
        vomitingOrSevereHeadache: vomitHeadache,
        actingAbnormalPerParents: actingAbnormal,
      }),
    [
      pecarnAge,
      gcsLt15,
      alteredMental,
      skullFx,
      hematoma,
      locGt5s,
      severeMechanism,
      vomitHeadache,
      actingAbnormal,
    ]
  );

  const kawasakiResult = useMemo(
    () =>
      evaluateKawasakiDisease({
        feverDays,
        bilateralBulbarConjunctivalInjection: conjunctiva,
        oralMucosalChanges: oralChanges,
        extremityChanges: extremity,
        polymorphousRash: rash,
        cervicalLymphadenopathy: cervicalNode,
      }),
    [feverDays, conjunctiva, oralChanges, extremity, rash, cervicalNode]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    if (activeTab === 'croup') {
      return `${prefix}WESTLEY CROUP SEVERITY EVALUATION:
- Total Score: ${croupResult.score}/17
- Severity Grade: ${croupResult.severity.toUpperCase()}
- Recommended Clinical Action: ${croupResult.treatmentGuideline}`;
    } else if (activeTab === 'pecarn') {
      return `${prefix}PECARN PEDIATRIC HEAD TRAUMA DECISION RULE (${pecarnAge < 2 ? '< 2 Years' : '>= 2 Years'}):
- Patient Age: ${pecarnAge} years
- Risk Category: ${pecarnResult.riskCategory}
- CT Scan Recommendation: ${pecarnResult.ctRecommendation}`;
    } else {
      return `${prefix}KAWASAKI DISEASE DIAGNOSTIC CRITERIA (AHA 2017):
- Fever Duration: ${feverDays} days (Threshold: >= 5 days)
- Principal Criteria Met: ${kawasakiResult.criteriaMetCount}/5
- Diagnostic Classification: ${kawasakiResult.isClassicalKawasaki ? 'CLASSICAL KAWASAKI DISEASE' : 'Incomplete / Atypical Kawasaki'}
- Clinical Recommendation: ${kawasakiResult.recommendation}`;
    }
  }, [patientTag, activeTab, croupResult, pecarnAge, pecarnResult, feverDays, kawasakiResult]);

  const resetAll = () => {
    setStridor(1);
    setRetractions(2);
    setAirEntry(1);
    setCyanosis(0);
    setConsciousness(0);
    setPecarnAge(1.5);
    setGcsLt15(false);
    setAlteredMental(false);
    setSkullFx(false);
    setHematoma(false);
    setLocGt5s(false);
    setSevereMechanism(false);
    setVomitHeadache(false);
    setActingAbnormal(false);
    setFeverDays(5);
    setConjunctiva(true);
    setOralChanges(true);
    setExtremity(true);
    setRash(true);
    setCervicalNode(false);
  };

  const references = [
    {
      source: 'Westley CR, et al. Am J Dis Child 1978',
      title: 'Nebulized racemic epinephrine by IPPB for the treatment of croup: a double-blind study.',
      details: 'Am J Dis Child. 1978;132(5):484-487.',
    },
    {
      source: 'Kuppermann N, et al. Lancet 2009',
      title: 'Identification of children at very low risk of clinically-important brain injuries after head trauma: PECARN study.',
      details: 'Lancet. 2009;374(9696):1160-1170.',
    },
    {
      source: 'McCrindle BW, et al. Circulation 2017',
      title: 'Diagnosis, Treatment, and Long-Term Management of Kawasaki Disease: AHA Scientific Statement.',
      details: 'Circulation. 2017;135(17):e927-e999.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Pediatric Emergency & Infectious Suite</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 rounded-md">
                PECARN / AHA
              </span>
              <StarButton toolId="peds_emergency_suite" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Westley croup score, PECARN pediatric head injury rules & Kawasaki disease diagnostic evaluation
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
            { id: 'croup', label: 'Westley Croup', badge: `${croupResult.score}/17` },
            { id: 'pecarn', label: 'PECARN Head', badge: pecarnResult.riskCategory.split(' ')[0] },
            { id: 'kawasaki', label: 'Kawasaki', badge: `${kawasakiResult.criteriaMetCount}/5` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`w-full py-2 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-1 min-w-0 cursor-pointer tap-bounce active:scale-95 ${
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

      {/* Tab 1: Westley Croup */}
      {activeTab === 'croup' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Westley Clinical Signs
            </h2>
            <div>
              <label className="block font-semibold mb-1">Stridor</label>
              <div className="grid grid-cols-3 gap-2">
                {['None (0)', 'When agitated (1)', 'At rest (2)'].map((l, idx) => (
                  <button
                    key={idx}
                    onClick={() => setStridor(idx as any)}
                    className={`p-2.5 rounded-lg border font-medium ${stridor === idx ? 'bg-rose-600 text-white' : 'bg-slate-50 dark:bg-slate-800'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Chest Retractions</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['None (0)', 'Mild (1)', 'Moderate (2)', 'Severe (3)'].map((l, idx) => (
                  <button
                    key={idx}
                    onClick={() => setRetractions(idx as any)}
                    className={`p-2.5 rounded-lg border font-medium ${retractions === idx ? 'bg-rose-600 text-white' : 'bg-slate-50 dark:bg-slate-800'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Air Entry</label>
              <div className="grid grid-cols-3 gap-2">
                {['Normal (0)', 'Decreased (1)', 'Severely decreased (2)'].map((l, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAirEntry(idx as any)}
                    className={`p-2.5 rounded-lg border font-medium ${airEntry === idx ? 'bg-rose-600 text-white' : 'bg-slate-50 dark:bg-slate-800'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setCyanosis(cyanosis === 0 ? 5 : 0)}
                className={`p-3 rounded-lg border text-left font-medium ${cyanosis > 0 ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
              >
                Cyanosis at rest (+5 pts)
              </button>
              <button
                onClick={() => setConsciousness(consciousness === 0 ? 5 : 0)}
                className={`p-3 rounded-lg border text-left font-medium ${consciousness > 0 ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
              >
                Altered level of consciousness (+5 pts)
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-200 dark:border-rose-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Croup Severity Grade
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Westley Score: {croupResult.score} / 17
              <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                croupResult.score >= 8 ? 'bg-rose-600 text-white' : croupResult.score >= 3 ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {croupResult.severity}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {croupResult.treatmentGuideline}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: PECARN */}
      {activeTab === 'pecarn' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Patient Age Tier & Clinical Findings
            </h2>
            <div>
              <label className="block font-semibold mb-1">Child Age: {pecarnAge} years ({pecarnAge < 2 ? '< 2 years algorithm' : '≥ 2 years algorithm'})</label>
              <NumberStepper value={pecarnAge} onChange={setPecarnAge} min={0.1} max={17} step={0.5} unit="years" />
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800 space-y-2">
              <span className="font-bold text-rose-700 dark:text-rose-300 block uppercase">High Risk Features (ciTBI &gt; 4%)</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={gcsLt15} onChange={(e) => setGcsLt15(e.target.checked)} className="rounded text-rose-600" />
                <span>GCS &lt; 15 on examination</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={alteredMental} onChange={(e) => setAlteredMental(e.target.checked)} className="rounded text-rose-600" />
                <span>Signs of altered mental status (agitation, somnolence, repetitive questioning, slow verbal response)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={skullFx} onChange={(e) => setSkullFx(e.target.checked)} className="rounded text-rose-600" />
                <span>Palpable skull fracture or signs of basilar skull fracture (hemotympanum, raccoon eyes, Battle sign)</span>
              </label>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase">Intermediate Risk Features (ciTBI ~0.9%)</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={hematoma} onChange={(e) => setHematoma(e.target.checked)} className="rounded text-rose-600" />
                <span>Occipital, parietal, or temporal scalp hematoma</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={locGt5s} onChange={(e) => setLocGt5s(e.target.checked)} className="rounded text-rose-600" />
                <span>Loss of consciousness &gt; 5 seconds</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={severeMechanism} onChange={(e) => setSevereMechanism(e.target.checked)} className="rounded text-rose-600" />
                <span>Severe injury mechanism (motor vehicle rollover, ejection, fall &gt; 3-5 ft, pedestrian struck)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={vomitHeadache} onChange={(e) => setVomitHeadache(e.target.checked)} className="rounded text-rose-600" />
                <span>Vomiting or severe headache</span>
              </label>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-200 dark:border-rose-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              PECARN CT Decision Algorithm
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {pecarnResult.riskCategory}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {pecarnResult.ctRecommendation}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Kawasaki */}
      {activeTab === 'kawasaki' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Kawasaki Diagnostic Criteria Checklist
            </h2>
            <div>
              <label className="block font-semibold mb-1">Duration of Fever (Days): {feverDays} days (≥5 days cardinal criterion)</label>
              <NumberStepper value={feverDays} onChange={setFeverDays} min={1} max={30} step={1} unit="days" />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="font-bold uppercase text-slate-500">5 Principal Features (Requires ≥ 4 of 5):</span>
              {[
                { label: 'Bilateral bulbar conjunctival injection (non-exudative / non-purulent)', val: conjunctiva, set: setConjunctiva },
                { label: 'Oral mucosal changes (strawberry tongue, erythema, lip cracking)', val: oralChanges, set: setOralChanges },
                { label: 'Polymorphous skin rash (erythematous maculopapular / scarlatiniform)', val: rash, set: setRash },
                { label: 'Extremity changes (erythema/edema of palms/soles, periungual peeling)', val: extremity, set: setExtremity },
                { label: 'Cervical lymphadenopathy (> 1.5 cm diameter, usually unilateral)', val: cervicalNode, set: setCervicalNode },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => item.set(!item.val)}
                  className={`w-full p-2.5 rounded-lg border text-left font-medium transition-all ${
                    item.val ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-200 dark:border-rose-900/60 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Diagnostic Decision: {kawasakiResult.criteriaMetCount}/5 Features Present
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {kawasakiResult.isClassicalKawasaki ? 'Classical Kawasaki Disease Met' : 'Incomplete / Suspicious Kawasaki'}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2">
              {kawasakiResult.recommendation}
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
