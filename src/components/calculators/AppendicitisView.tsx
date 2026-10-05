import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Activity, RotateCcw } from 'lucide-react';
import { calculateAlvaradoScore, calculateAirScore } from '../../calculators/surgery';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';
import { useCalculatorPrefill } from '../../context/useCalculatorPrefill';
import { AiPrefillBanner } from '../ui/AiPrefillBanner';

interface AppendicitisViewProps {
  patientTag?: string;
}

export const AppendicitisView: React.FC<AppendicitisViewProps> = ({ patientTag }) => {
  const { prefill, clearPrefill, hasPrefill } = useCalculatorPrefill('appendicitis');
  const [activeTab, setActiveTab] = useState<'alvarado' | 'air'>('alvarado');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Alvarado criteria
  const [migrationPain, setMigrationPain] = useState(true);
  const [anorexia, setAnorexia] = useState(true);
  const [nauseaVomit, setNauseaVomit] = useState(true);
  const [rlqTenderness, setRlqTenderness] = useState(prefill?.rlqTenderness ?? true);
  const [reboundTenderness, setReboundTenderness] = useState(prefill?.rebound ?? true);
  const [fever, setFever] = useState(prefill?.fever ?? false);
  const [leukocytosis, setLeukocytosis] = useState(true);
  const [leftShift, setLeftShift] = useState(false);

  // AIR criteria
  const [airVomit, setAirVomit] = useState(true);
  const [airRlqPain, setAirRlqPain] = useState(prefill?.rlqTenderness ?? true);
  const [airDefense, setAirDefense] = useState<'none' | 'light' | 'medium' | 'strong'>('medium');
  const [airFever, setAirFever] = useState(prefill?.fever ?? false);
  const [airWbc, setAirWbc] = useState<'normal' | '10_to_14_9' | '15_or_more'>('10_to_14_9');
  const [airNeutrophils, setAirNeutrophils] = useState<'under_70' | '70_to_84' | '85_or_more'>('70_to_84');
  const [airCrp, setAirCrp] = useState<'under_10' | '10_to_49' | '50_or_more'>('10_to_49');

  const alvaradoResult = useMemo(
    () =>
      calculateAlvaradoScore({
        migratoryRightIliacFossaPain: migrationPain,
        anorexia,
        nauseaOrVomiting: nauseaVomit,
        tendernessRightLowerQuadrant: rlqTenderness,
        reboundTenderness,
        elevatedTemperatureOver37_3C: fever,
        leukocytosisWbcOver10: leukocytosis,
        shiftToTheLeftNeutrophilsOver75: leftShift,
      }),
    [migrationPain, anorexia, nauseaVomit, rlqTenderness, reboundTenderness, fever, leukocytosis, leftShift]
  );

  const airResult = useMemo(
    () =>
      calculateAirScore({
        vomiting: airVomit,
        painInRiq: airRlqPain,
        reboundTendernessDefense: airDefense,
        bodyTempOver38_5C: airFever,
        wbcCount: airWbc,
        neutrophilsPercent: airNeutrophils,
        crpMgL: airCrp,
      }),
    [airVomit, airRlqPain, airDefense, airFever, airWbc, airNeutrophils, airCrp]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    if (activeTab === 'alvarado') {
      return `${prefix}ACUTE APPENDICITIS ALVARADO (MANTRELS) ASSESSMENT:
- Total Score: ${alvaradoResult.score}/10 (${alvaradoResult.riskCategory} | Probability: ${alvaradoResult.appendicitisProbability})
  * Migration of pain to RLQ: ${migrationPain ? 'Yes (+1)' : 'No'}
  * Anorexia: ${anorexia ? 'Yes (+1)' : 'No'}
  * Nausea/Vomiting: ${nauseaVomit ? 'Yes (+1)' : 'No'}
  * Tenderness RLQ: ${rlqTenderness ? 'Yes (+2)' : 'No'}
  * Rebound tenderness: ${reboundTenderness ? 'Yes (+1)' : 'No'}
  * Elevated temperature (>=37.3°C): ${fever ? 'Yes (+1)' : 'No'}
  * Leukocytosis (WBC > 10k): ${leukocytosis ? 'Yes (+2)' : 'No'}
  * Left shift (Neutrophils > 75%): ${leftShift ? 'Yes (+1)' : 'No'}
- Surgical Recommendation: ${alvaradoResult.recommendation}`;
    }
    return `${prefix}ACUTE APPENDICITIS INFLAMMATORY RESPONSE (AIR) SCORE:
- Total Score: ${airResult.score}/12 (${airResult.riskGroup})
  * Vomiting: ${airVomit ? 'Yes' : 'No'} | RLQ Pain: ${airRlqPain ? 'Yes' : 'No'} | Defense: ${airDefense}
  * Body Temp >= 38.5°C: ${airFever ? 'Yes' : 'No'} | WBC: ${airWbc} | Neutrophils: ${airNeutrophils} | CRP: ${airCrp}
- Recommendation: ${airResult.recommendation}`;
  }, [patientTag, activeTab, alvaradoResult, migrationPain, anorexia, nauseaVomit, rlqTenderness, reboundTenderness, fever, leukocytosis, leftShift, airResult, airVomit, airRlqPain, airDefense, airFever, airWbc, airNeutrophils, airCrp]);

  const resetAlvarado = () => {
    setMigrationPain(true);
    setAnorexia(true);
    setNauseaVomit(true);
    setRlqTenderness(true);
    setReboundTenderness(true);
    setFever(false);
    setLeukocytosis(true);
    setLeftShift(false);
  };

  const resetAir = () => {
    setAirVomit(true);
    setAirRlqPain(true);
    setAirDefense('medium');
    setAirFever(false);
    setAirWbc('10_to_14_9');
    setAirNeutrophils('70_to_84');
    setAirCrp('10_to_49');
  };

  const references = [
    {
      source: 'Alvarado A (Ann Emerg Med 1986)',
      title: 'A Practical Score for the Early Diagnosis of Acute Appendicitis',
      details: 'MANTRELS mnemonic provides high diagnostic sensitivity (score >= 7 identifies >80% of confirmed acute appendicitis cases).',
    },
    {
      source: 'WSES Jerusalem Guidelines (World J Emerg Surg 2020)',
      title: 'Diagnosis and Treatment of Acute Appendicitis',
      details: 'Recommends clinical risk scores (Alvarado, AIR, Adult Appendicitis Score) to guide selective imaging and surgical laparoscopy.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Alvarado & AIR Appendicitis Scores
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300">
                WSES 2020
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Right lower quadrant pain triage, imaging threshold & emergency surgical laparoscopy indication
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="appendicitis" />
          <button
            type="button"
            onClick={() => {
              clearPrefill();
              if (activeTab === 'alvarado') resetAlvarado();
              else resetAir();
            }}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <CopyNoteButton textToCopy={clinicalNote} />
        </div>
      </div>

      {/* AI Auto-Populate Banner */}
      {hasPrefill && !bannerDismissed && (
        <AiPrefillBanner
          paramCount={prefill ? Object.keys(prefill).length : undefined}
          onReset={() => {
            clearPrefill();
            resetAlvarado();
            resetAir();
          }}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      {/* Mode Switcher: Responsive 2-Column Grid */}
      <div className="grid grid-cols-2 border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl mb-6 gap-1.5 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('alvarado')}
          className={`w-full py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer truncate text-center tap-bounce active:scale-95 ${
            activeTab === 'alvarado'
              ? 'bg-white dark:bg-slate-800 text-red-700 dark:text-red-400 shadow-xs ring-1 ring-red-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Alvarado Score
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('air')}
          className={`w-full py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer truncate text-center tap-bounce active:scale-95 ${
            activeTab === 'air'
              ? 'bg-white dark:bg-slate-800 text-red-700 dark:text-red-400 shadow-xs ring-1 ring-red-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          AIR Score
        </button>
      </div>

      {activeTab === 'alvarado' ? (
        <div className="space-y-6">
          <div className="space-y-2">
            {[
              { letter: 'M', label: 'Migration of pain to the Right Lower Quadrant', state: migrationPain, set: setMigrationPain, pts: '+1' },
              { letter: 'A', label: 'Anorexia (loss of appetite)', state: anorexia, set: setAnorexia, pts: '+1' },
              { letter: 'N', label: 'Nausea or Vomiting', state: nauseaVomit, set: setNauseaVomit, pts: '+1' },
              { letter: 'T', label: 'Tenderness in Right Lower Quadrant (Key sign)', state: rlqTenderness, set: setRlqTenderness, pts: '+2' },
              { letter: 'R', label: 'Rebound tenderness / peritoneal irritation', state: reboundTenderness, set: setReboundTenderness, pts: '+1' },
              { letter: 'E', label: 'Elevated temperature (>= 37.3°C / 99.1°F)', state: fever, set: setFever, pts: '+1' },
              { letter: 'L', label: 'Leukocytosis (WBC > 10,000 /uL)', state: leukocytosis, set: setLeukocytosis, pts: '+2' },
              { letter: 'S', label: 'Shift of WBC to the left (Neutrophils > 75%)', state: leftShift, set: setLeftShift, pts: '+1' },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => item.set(!item.state)}
                className={`w-full p-2.5 rounded-xl text-left border flex items-center justify-between text-xs transition-all ${
                  item.state
                    ? 'bg-red-50 dark:bg-red-950/60 border-red-400 text-red-950 dark:text-red-200 font-bold shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-[11px] ${
                    item.state ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {item.letter}
                  </span>
                  <span>{item.label}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.state ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  {item.pts}
                </span>
              </button>
            ))}
          </div>

          {/* Alvarado Result Card */}
          <div className={`p-4 rounded-2xl border ${
            alvaradoResult.score >= 7
              ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800'
              : alvaradoResult.score >= 5
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {alvaradoResult.score} / 10
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  ({alvaradoResult.riskCategory})
                </span>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 shadow-2xs">
                Probability: {alvaradoResult.appendicitisProbability}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {alvaradoResult.recommendation}
            </p>
          </div>
        </div>
      ) : (
        /* AIR Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAirVomit(!airVomit)}
              className={`p-3 rounded-xl text-left border flex items-center justify-between text-xs transition-all ${
                airVomit ? 'bg-red-50 dark:bg-red-950/60 border-red-400 font-bold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>Vomiting</span>
              <span>{airVomit ? '+1 pt' : '0'}</span>
            </button>

            <button
              type="button"
              onClick={() => setAirRlqPain(!airRlqPain)}
              className={`p-3 rounded-xl text-left border flex items-center justify-between text-xs transition-all ${
                airRlqPain ? 'bg-red-50 dark:bg-red-950/60 border-red-400 font-bold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>Pain in Right Iliac Fossa</span>
              <span>{airRlqPain ? '+1 pt' : '0'}</span>
            </button>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Rebound Tenderness / Muscular Defense
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'none', label: 'None (0)' },
                { id: 'light', label: 'Light (+1)' },
                { id: 'medium', label: 'Medium (+2)' },
                { id: 'strong', label: 'Strong (+3)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAirDefense(opt.id as typeof airDefense)}
                  className={`py-2 px-2 rounded-xl text-xs border font-medium transition-all ${
                    airDefense === opt.id
                      ? 'bg-red-700 text-white border-red-700 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                WBC Count (x10⁹/L)
              </label>
              {[
                { id: 'normal', label: '< 10.0 (0)' },
                { id: '10_to_14_9', label: '10.0 - 14.9 (+1)' },
                { id: '15_or_more', label: '>= 15.0 (+2)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAirWbc(opt.id as typeof airWbc)}
                  className={`w-full py-1.5 px-2.5 rounded-lg text-xs border text-left font-medium mb-1 transition-all ${
                    airWbc === opt.id ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Neutrophils %
              </label>
              {[
                { id: 'under_70', label: '< 70% (0)' },
                { id: '70_to_84', label: '70 - 84% (+1)' },
                { id: '85_or_more', label: '>= 85% (+2)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAirNeutrophils(opt.id as typeof airNeutrophils)}
                  className={`w-full py-1.5 px-2.5 rounded-lg text-xs border text-left font-medium mb-1 transition-all ${
                    airNeutrophils === opt.id ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                CRP (mg/L)
              </label>
              {[
                { id: 'under_10', label: '< 10 (0)' },
                { id: '10_to_49', label: '10 - 49 (+1)' },
                { id: '50_or_more', label: '>= 50 (+2)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAirCrp(opt.id as typeof airCrp)}
                  className={`w-full py-1.5 px-2.5 rounded-lg text-xs border text-left font-medium mb-1 transition-all ${
                    airCrp === opt.id ? 'bg-red-600 text-white border-red-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${
            airResult.riskGroup === 'High Risk'
              ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800'
              : airResult.riskGroup === 'Intermediate Risk'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                AIR Score: {airResult.score} / 12
              </span>
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 shadow-2xs">
                {airResult.riskGroup}
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {airResult.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* EHR Note */}
      <div className="my-6">
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
        scoreBadge={activeTab === 'alvarado' ? `Alvarado: ${alvaradoResult.score}/10` : `AIR: ${airResult.score}/12`}
        categoryLabel={activeTab === 'alvarado' ? alvaradoResult.riskCategory : airResult.riskGroup}
        noteText={clinicalNote}
        severityColor={
          (activeTab === 'alvarado' && alvaradoResult.score >= 7) || (activeTab === 'air' && airResult.riskGroup === 'High Risk')
            ? 'rose'
            : (activeTab === 'alvarado' && alvaradoResult.score >= 5) || (activeTab === 'air' && airResult.riskGroup === 'Intermediate Risk')
            ? 'amber'
            : 'emerald'
        }
      />
    </div>
  );
};
