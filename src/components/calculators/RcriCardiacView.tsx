import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Heart, RotateCcw } from 'lucide-react';
import { calculateRcri } from '../../calculators/surgery';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface RcriCardiacViewProps {
  patientTag?: string;
}

export const RcriCardiacView: React.FC<RcriCardiacViewProps> = ({ patientTag }) => {
  const [highRiskSurgery, setHighRiskSurgery] = useState(true);
  const [ischemicHeart, setIschemicHeart] = useState(false);
  const [chf, setChf] = useState(false);
  const [cerebrovascular, setCerebrovascular] = useState(false);
  const [insulin, setInsulin] = useState(false);
  const [crOver2, setCrOver2] = useState(false);

  const result = useMemo(
    () =>
      calculateRcri({
        highRiskSurgery,
        ischemicHeartDisease: ischemicHeart,
        historyOfChf: chf,
        cerebrovascularDisease: cerebrovascular,
        preoperativeInsulin: insulin,
        preoperativeCreatinineOver2: crOver2,
      }),
    [highRiskSurgery, ischemicHeart, chf, cerebrovascular, insulin, crOver2]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}PREOPERATIVE CARDIAC RISK (RCRI / LEE INDEX):
- Total RCRI Score: ${result.score}/6 (${result.classCategory} | MACE Risk: ${result.maceRiskPercent}%)
  * High-risk surgery (intraperitoneal/intrathoracic/suprainguinal vascular): ${highRiskSurgery ? 'Yes (+1)' : 'No'}
  * Ischemic heart disease history: ${ischemicHeart ? 'Yes (+1)' : 'No'}
  * History of congestive heart failure: ${chf ? 'Yes (+1)' : 'No'}
  * Cerebrovascular disease history (TIA/Stroke): ${cerebrovascular ? 'Yes (+1)' : 'No'}
  * Preoperative insulin therapy for diabetes: ${insulin ? 'Yes (+1)' : 'No'}
  * Preoperative serum creatinine > 2.0 mg/dL: ${crOver2 ? 'Yes (+1)' : 'No'}
- Preoperative Cardiac Clearance Plan: ${result.clinicalGuideline}`;
  }, [patientTag, result, highRiskSurgery, ischemicHeart, chf, cerebrovascular, insulin, crOver2]);

  const resetDefaults = () => {
    setHighRiskSurgery(true);
    setIschemicHeart(false);
    setChf(false);
    setCerebrovascular(false);
    setInsulin(false);
    setCrOver2(false);
  };

  const references = [
    {
      source: 'Lee TH, et al. (Circulation 1999)',
      title: 'Derivation and Prospective Validation of a Simple Index for Prediction of Cardiac Risk of Major Noncardiac Surgery',
      details: 'Evaluates major adverse cardiac events (cardiac arrest, MI, complete heart block, pulmonary edema) across elective noncardiac procedures.',
    },
    {
      source: 'Fleisher LA, et al. / ACC/AHA (Circulation 2014 / 2024)',
      title: 'Guideline on Perioperative Cardiovascular Evaluation and Management of Patients Undergoing Noncardiac Surgery',
      details: 'Recommends step-wise algorithm evaluating RCRI, functional status (METs), and biomarker surveillance.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Revised Cardiac Risk Index (RCRI / Lee)
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                AHA / ACC
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Preoperative noncardiac surgery clearance, perioperative MACE & cardiac consultation threshold
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="rcri_cardiac" showLabel />
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

      {/* 6 Independent RCRI Risk Factors */}
      <div className="space-y-2.5 mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Select Positive Preoperative Factors
          </span>
          <span className="text-xs font-extrabold text-purple-700 dark:text-purple-400">
            Score: {result.score} of 6
          </span>
        </div>

        {[
          { title: 'High-Risk Surgical Procedure', subtitle: 'Intraperitoneal, intrathoracic, or suprainguinal vascular surgery', state: highRiskSurgery, set: setHighRiskSurgery },
          { title: 'History of Ischemic Heart Disease', subtitle: 'History of myocardial infarction, positive stress test, active angina, or nitrate therapy', state: ischemicHeart, set: setIschemicHeart },
          { title: 'History of Congestive Heart Failure', subtitle: 'Paroxysmal nocturnal dyspnea, orthopnea, bilateral rales, S3 gallop, or peripheral edema', state: chf, set: setChf },
          { title: 'History of Cerebrovascular Disease', subtitle: 'Prior transient ischemic attack (TIA) or stroke with or without neurological residual', state: cerebrovascular, set: setCerebrovascular },
          { title: 'Preoperative Insulin Therapy', subtitle: 'Diabetes mellitus requiring scheduled subcutaneous or intravenous insulin administration', state: insulin, set: setInsulin },
          { title: 'Preoperative Serum Creatinine > 2.0 mg/dL', subtitle: 'Chronic kidney disease or acute azotemia (> 177 umol/L)', state: crOver2, set: setCrOver2 },
        ].map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => item.set(!item.state)}
            className={`w-full p-3 rounded-xl text-left border flex items-start justify-between gap-3 text-xs transition-all ${
              item.state
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-400 text-purple-950 dark:text-purple-200 font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex-1">
              <span className="text-xs font-bold block">{item.title}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5 block">
                {item.subtitle}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${
              item.state ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
            }`}>
              {item.state ? '+1 point' : '0'}
            </span>
          </button>
        ))}
      </div>

      {/* Result Stratification Card */}
      <div className={`p-4 rounded-2xl border mb-6 ${
        result.score >= 3
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
          : result.score === 2
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {result.classCategory}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              ({result.score} Predictors)
            </span>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 shadow-2xs">
            MACE Risk: {result.maceRiskPercent}%
          </span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
          {result.clinicalGuideline}
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
        scoreBadge={`RCRI: ${result.classCategory}`}
        categoryLabel={`${result.score} Predictors | ${result.maceRiskPercent}% MACE`}
        noteText={clinicalNote}
        severityColor={result.score >= 3 ? 'rose' : result.score === 2 ? 'amber' : 'emerald'}
      />
    </div>
  );
};
