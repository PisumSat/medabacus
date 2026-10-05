import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Eye, RotateCcw } from 'lucide-react';
import { calculatePediatricGcs } from '../../calculators/pediatrics';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface PediatricGcsViewProps {
  patientTag?: string;
}

export const PediatricGcsView: React.FC<PediatricGcsViewProps> = ({ patientTag }) => {
  const [isInfant, setIsInfant] = useState(true);
  const [eye, setEye] = useState<1 | 2 | 3 | 4>(4);
  const [verbal, setVerbal] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [motor, setMotor] = useState<1 | 2 | 3 | 4 | 5 | 6>(6);

  const result = useMemo(
    () =>
      calculatePediatricGcs({
        isInfantUnder2Years: isInfant,
        eyeOpening: eye,
        verbalResponse: verbal,
        motorResponse: motor,
      }),
    [isInfant, eye, verbal, motor]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}PEDIATRIC GLASGOW COMA SCALE (PGCS) ASSESSMENT:
- Developmental Stage: ${isInfant ? 'Infant / Pre-Verbal (< 2 years)' : 'Child / Adolescent (>= 2 years)'}
- Eye Opening: ${eye}/4 | Verbal: ${verbal}/5 | Motor: ${motor}/6
- Total PGCS Score: ${result.totalScore}/15 (${result.severity})
- Airway & Neurotrauma Management: ${result.airwayRecommendation}`;
  }, [patientTag, isInfant, eye, verbal, motor, result]);

  const resetDefaults = () => {
    setIsInfant(true);
    setEye(4);
    setVerbal(5);
    setMotor(6);
  };

  const references = [
    {
      source: 'Reilly PL, et al. (Childs Nerv Syst 1988)',
      title: 'Assessing the Conscious Level in Infants and Young Children: A Paediatric Version of the Glasgow Coma Scale',
      details: 'Adapts verbal criteria to infant milestones (cooing, babbling, smiling vs irritable crying and grunting).',
    },
    {
      source: 'Kuppermann N, et al. / PECARN (Lancet 2009)',
      title: 'Identification of Children at Very Low Risk of Clinically-Important Brain Injuries After Head Trauma',
      details: 'GCS score <= 14 or altered mental status mandates immediate emergency neuroimaging (non-contrast head CT).',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Pediatric Glasgow Coma Scale (PGCS)
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-pink-100 dark:bg-pink-900/60 text-pink-800 dark:text-pink-300">
                PALS / PECARN
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Developmentally adapted conscious level assessment for infants & children with airway protection thresholds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="pediatric_gcs" showLabel />
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

      {/* Age Group Switcher */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setIsInfant(true)}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            isInfant
              ? 'bg-white dark:bg-slate-800 text-pink-700 dark:text-pink-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Infant / Pre-Verbal (&lt; 2 Years Old)
        </button>
        <button
          type="button"
          onClick={() => setIsInfant(false)}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            !isInfant
              ? 'bg-white dark:bg-slate-800 text-pink-700 dark:text-pink-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Child & Adolescent (&ge; 2 Years Old)
        </button>
      </div>

      {/* 3 Categories: Eye, Verbal, Motor */}
      <div className="space-y-6 mb-6">
        {/* 1. Eye Opening */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              1. Eye Opening Response (E)
            </label>
            <span className="text-xs font-extrabold text-pink-600 dark:text-pink-400">
              {eye} of 4 pts
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { score: 4, label: 'Spontaneous (4)' },
              { score: 3, label: 'To voice / speech (3)' },
              { score: 2, label: 'To pain / pressure (2)' },
              { score: 1, label: 'None (1)' },
            ].map((opt) => (
              <button
                key={opt.score}
                type="button"
                onClick={() => setEye(opt.score as typeof eye)}
                className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                  eye === opt.score
                    ? 'bg-pink-600 text-white border-pink-600 shadow-xs font-bold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Verbal Response */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              2. Verbal Response (V) — {isInfant ? 'Infant Criteria' : 'Child Criteria'}
            </label>
            <span className="text-xs font-extrabold text-pink-600 dark:text-pink-400">
              {verbal} of 5 pts
            </span>
          </div>
          <div className="space-y-1.5">
            {(isInfant
              ? [
                  { score: 5, label: 'Smiles, coos, babbles, follows objects (5 pts)' },
                  { score: 4, label: 'Cries but consolable, inappropriate interactions (4 pts)' },
                  { score: 3, label: 'Inconsistently consolable, moaning, irritable crying (3 pts)' },
                  { score: 2, label: 'Inconsolable, agitated, restless, grunting (2 pts)' },
                  { score: 1, label: 'No response (1 pt)' },
                ]
              : [
                  { score: 5, label: 'Oriented, converses normally, appropriate words (5 pts)' },
                  { score: 4, label: 'Confused conversation, disoriented (4 pts)' },
                  { score: 3, label: 'Inappropriate words or crying (3 pts)' },
                  { score: 2, label: 'Incomprehensible sounds, groans (2 pts)' },
                  { score: 1, label: 'No vocal response (1 pt)' },
                ]
            ).map((opt) => (
              <button
                key={opt.score}
                type="button"
                onClick={() => setVerbal(opt.score as typeof verbal)}
                className={`w-full p-2.5 rounded-xl text-xs text-left border transition-all ${
                  verbal === opt.score
                    ? 'bg-pink-600 text-white border-pink-600 shadow-xs font-bold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Motor Response */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              3. Motor Response (M) — {isInfant ? 'Infant Criteria' : 'Child Criteria'}
            </label>
            <span className="text-xs font-extrabold text-pink-600 dark:text-pink-400">
              {motor} of 6 pts
            </span>
          </div>
          <div className="space-y-1.5">
            {(isInfant
              ? [
                  { score: 6, label: 'Normal spontaneous purposeful movements (6 pts)' },
                  { score: 5, label: 'Withdraws to touch (5 pts)' },
                  { score: 4, label: 'Withdraws to painful stimulus (4 pts)' },
                  { score: 3, label: 'Abnormal flexion (decorticate posturing) (3 pts)' },
                  { score: 2, label: 'Abnormal extension (decerebrate posturing) (2 pts)' },
                  { score: 1, label: 'Flaccid, no movement (1 pt)' },
                ]
              : [
                  { score: 6, label: 'Obeys verbal commands (6 pts)' },
                  { score: 5, label: 'Localizes to painful stimulus (5 pts)' },
                  { score: 4, label: 'Withdraws from painful stimulus (4 pts)' },
                  { score: 3, label: 'Abnormal flexion (decorticate rigidity) (3 pts)' },
                  { score: 2, label: 'Abnormal extension (decerebrate rigidity) (2 pts)' },
                  { score: 1, label: 'No motor response (flaccid) (1 pt)' },
                ]
            ).map((opt) => (
              <button
                key={opt.score}
                type="button"
                onClick={() => setMotor(opt.score as typeof motor)}
                className={`w-full p-2.5 rounded-xl text-xs text-left border transition-all ${
                  motor === opt.score
                    ? 'bg-pink-600 text-white border-pink-600 shadow-xs font-bold'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Card */}
      <div className={`p-4 rounded-2xl border mb-6 ${
        result.totalScore <= 8
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
          : result.totalScore <= 12
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              PGCS: {result.totalScore} / 15
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              (E{eye} V{verbal} M{motor})
            </span>
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 shadow-2xs">
            {result.severity}
          </span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
          {result.airwayRecommendation}
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
        scoreBadge={`PGCS: ${result.totalScore}/15`}
        categoryLabel={result.severity}
        noteText={clinicalNote}
        severityColor={result.totalScore <= 8 ? 'rose' : result.totalScore <= 12 ? 'amber' : 'emerald'}
      />
    </div>
  );
};
