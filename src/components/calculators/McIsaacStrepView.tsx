import { StarButton } from '../ui/StarButton';
import React, { useState, useMemo } from 'react';
import { Thermometer, RotateCcw } from 'lucide-react';
import { calculateMcIsaacScore } from '../../calculators/pediatrics';
import { NumberStepper } from '../ui/NumberStepper';
import { CopyNoteButton } from '../CopyNoteButton';
import { ReferenceAccordion } from '../ReferenceAccordion';
import { StickyMobileAction } from '../ui/StickyMobileAction';

interface McIsaacStrepViewProps {
  patientTag?: string;
}

export const McIsaacStrepView: React.FC<McIsaacStrepViewProps> = ({ patientTag }) => {
  const [age, setAge] = useState(8);
  const [noCough, setNoCough] = useState(true);
  const [swollenNodes, setSwollenNodes] = useState(true);
  const [fever, setFever] = useState(true);
  const [tonsillarExudate, setTonsillarExudate] = useState(false);

  const result = useMemo(
    () =>
      calculateMcIsaacScore({
        ageYears: age,
        absenceOfCough: noCough,
        swollenTenderAnteriorCervicalNodes: swollenNodes,
        temperatureOver38C: fever,
        tonsillarExudateOrSwelling: tonsillarExudate,
      }),
    [age, noCough, swollenNodes, fever, tonsillarExudate]
  );

  const clinicalNote = useMemo(() => {
    const prefix = patientTag ? `[${patientTag.toUpperCase()}] ` : '';
    return `${prefix}STREP PHARYNGITIS McISAAC / MODIFIED CENTOR SCORE:
- Patient Age: ${age} years
- Criteria Checklist:
  * Absence of cough: ${noCough ? 'Yes (+1)' : 'No'}
  * Swollen/tender anterior cervical lymph nodes: ${swollenNodes ? 'Yes (+1)' : 'No'}
  * Temperature > 38.0°C (100.4°F): ${fever ? 'Yes (+1)' : 'No'}
  * Tonsillar exudate or swelling: ${tonsillarExudate ? 'Yes (+1)' : 'No'}
  * Age Modifier: ${age >= 3 && age <= 14 ? '3-14 yo (+1)' : age >= 45 ? '>= 45 yo (-1)' : '15-44 yo (0)'}
- Total McIsaac Score: ${result.score} (Group A Strep Probability: ${result.groupAStrepRiskPercent})
- Clinical Management Strategy: ${result.management}`;
  }, [patientTag, age, noCough, swollenNodes, fever, tonsillarExudate, result]);

  const resetDefaults = () => {
    setAge(8);
    setNoCough(true);
    setSwollenNodes(true);
    setFever(true);
    setTonsillarExudate(false);
  };

  const references = [
    {
      source: 'McIsaac WJ, et al. (CMAJ 1998)',
      title: 'A Clinical Score to Reduce Unnecessary Antibiotic Use in Patients with Sore Throat',
      details: 'Modified Centor score incorporating age distribution. Children 3-14 years carry the highest incidence of GAS pharyngitis.',
    },
    {
      source: 'AAP Red Book (2024) / IDSA Pharyngitis Guidelines',
      title: 'Clinical Practice Guideline for the Diagnosis and Management of Group A Streptococcal Pharyngitis',
      details: 'Diagnostic testing (RADT or culture) is not recommended for children < 3 years old or patients with low score (0-1) due to viral predominance.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm p-4 sm:p-6 transition-colors pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Centor / McIsaac Strep Score
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                AAP / IDSA
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Group A Streptococcus pharyngitis risk stratification, rapid antigen swab & antibiotic stewardship
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarButton toolId="mcisaac_strep" showLabel />
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
          min={1}
          max={90}
          step={1}
          onChange={setAge}
          helperText="3-14 (+1 pt), 15-44 (0 pts), >=45 (-1 pt)"
        />
      </div>

      {/* 4 Clinical Criteria */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Clinical Symptoms & Signs
          </span>
          <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
            Score: {result.score} pts
          </span>
        </div>

        {[
          { label: 'Absence of Cough (cough suggests viral upper respiratory infection)', state: noCough, set: setNoCough },
          { label: 'Swollen and tender anterior cervical lymph nodes', state: swollenNodes, set: setSwollenNodes },
          { label: 'Fever (temperature history or measured > 38.0°C / 100.4°F)', state: fever, set: setFever },
          { label: 'Tonsillar exudate or marked tonsillar swelling', state: tonsillarExudate, set: setTonsillarExudate },
        ].map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => item.set(!item.state)}
            className={`w-full p-3 rounded-xl text-left border flex items-center justify-between text-xs transition-all ${
              item.state
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-950 dark:text-emerald-200 font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>{item.label}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              item.state ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
            }`}>
              {item.state ? '+1 point' : '0'}
            </span>
          </button>
        ))}
      </div>

      {/* Result Card */}
      <div className={`p-4 rounded-2xl border mb-6 ${
        result.score >= 4
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
          : result.score >= 2
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
          : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl font-black text-slate-900 dark:text-white">
            McIsaac Score: {result.score}
          </span>
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 shadow-2xs">
            Group A Strep Risk: {result.groupAStrepRiskPercent}
          </span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
          {result.management}
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
        scoreBadge={`McIsaac: ${result.score}`}
        categoryLabel={`GAS Risk: ${result.groupAStrepRiskPercent}`}
        noteText={clinicalNote}
        severityColor={result.score >= 4 ? 'rose' : result.score >= 2 ? 'amber' : 'emerald'}
      />
    </div>
  );
};
